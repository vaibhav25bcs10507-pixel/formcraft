import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { QUESTION_TYPES, type Question } from "./types";

const SETTING_KEYS = {
  key: "ai_api_key",
  baseUrl: "ai_base_url",
  model: "ai_model",
} as const;

export type AIConfig = { key: string; baseUrl: string; model: string };

export async function getAIConfig(): Promise<AIConfig | null> {
  const rows = await db.select().from(appSettings);
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const key = map.get(SETTING_KEYS.key) || process.env.OPENAI_API_KEY || "";
  if (!key) return null;
  const baseUrl = (
    map.get(SETTING_KEYS.baseUrl) ||
    process.env.OPENAI_BASE_URL ||
    "https://api.openai.com/v1"
  ).replace(/\/$/, "");
  const model = map.get(SETTING_KEYS.model) || process.env.AI_MODEL || "gpt-4o-mini";
  return { key, baseUrl, model };
}

export async function saveAIConfig(cfg: Partial<AIConfig>) {
  for (const [k, v] of Object.entries(cfg)) {
    if (v === undefined) continue;
    db.insert(appSettings)
      .values({ key: SETTING_KEYS[k as keyof typeof SETTING_KEYS] ?? k, value: v })
      .onConflictDoUpdate({ target: appSettings.key, set: { value: v } })
      .run();
  }
}

const SYSTEM_PROMPT = `You are a form designer. Given a description, output a JSON object:
{"title": string, "description": string, "questions": Question[]}

Question = {"id": string (short unique id like "q1"), "type": one of ${JSON.stringify(
  QUESTION_TYPES,
)}, "title": string, "description": string (optional), "required": boolean, "placeholder": string (optional, text types only), "options": string[] (required for "choice","multi","dropdown"), "maxRating": number (optional, for "rating", 3-10)}

Rules: 3-8 questions unless asked otherwise. First question should be easy and engaging. Use "choice" with 3-5 options for most closed questions. Use "rating" for satisfaction. Use "email" only if collecting contact info makes sense. Write friendly, conversational titles (e.g. "What's your name?" not "Name"). Output ONLY valid JSON.`;

export type GeneratedForm = { title: string; description: string; questions: Question[] };

export async function generateFormWithAI(prompt: string, cfg: AIConfig): Promise<GeneratedForm> {
  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.key}` },
    body: JSON.stringify({
      model: cfg.model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`AI provider returned ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI provider returned no content");
  const parsed = JSON.parse(content);
  const questions = (parsed.questions ?? []).map((q: Record<string, unknown>, i: number) => ({
    id: String(q.id ?? `q${i + 1}`),
    type: QUESTION_TYPES.includes(q.type as never) ? (q.type as Question["type"]) : "short",
    title: String(q.title ?? `Question ${i + 1}`),
    description: q.description ? String(q.description) : undefined,
    required: Boolean(q.required),
    placeholder: q.placeholder ? String(q.placeholder) : undefined,
    options: Array.isArray(q.options) ? q.options.map(String).slice(0, 26) : undefined,
    maxRating: typeof q.maxRating === "number" ? Math.min(10, Math.max(3, q.maxRating)) : undefined,
  }));
  return {
    title: String(parsed.title ?? "Untitled form"),
    description: String(parsed.description ?? ""),
    questions,
  };
}
