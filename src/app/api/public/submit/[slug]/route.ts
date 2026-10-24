import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { forms, responses } from "@/db/schema";
import { newId, parseQuestions, parseSettings, rateLimit } from "@/lib/utils";
import { submissionSchema, type AnswerMap } from "@/lib/types";

type Ctx = { params: Promise<{ slug: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`submit:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many submissions, slow down." }, { status: 429 });
  }

  const row = db.select().from(forms).where(eq(forms.slug, slug)).get();
  if (!row) return NextResponse.json({ error: "Form not found" }, { status: 404 });
  const settings = parseSettings(row.settings);
  if (!settings.published) {
    return NextResponse.json({ error: "This form is not accepting responses." }, { status: 403 });
  }

  const parsed = submissionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  // Anti-spam: honeypot must be empty; instant-fire bots submit in <400ms,
  // no human reads *and* answers a question that fast.
  if (parsed.data._hp) return NextResponse.json({ error: "Rejected" }, { status: 400 });
  if (typeof parsed.data._t === "number" && parsed.data._t < 400) {
    return NextResponse.json({ error: "Rejected" }, { status: 400 });
  }

  // Validate answers against the actual questions, replaying the visitor's
  // path so skip logic is respected: questions skipped via a jump are never
  // validated (and their required flag doesn't apply).
  const questions = parseQuestions(row.questions);
  const answers: AnswerMap = {};
  const errors: Record<string, string> = {};

  const seen = new Set<number>();
  let i = 0;
  while (i >= 0 && i < questions.length && !seen.has(i)) {
    seen.add(i);
    const q = questions[i];
    const v = parsed.data.answers[q.id];
    const empty =
      v === undefined ||
      v === "" ||
      (Array.isArray(v) && v.length === 0) ||
      (typeof v === "number" && Number.isNaN(v));
    if (!empty) {
      switch (q.type) {
        case "email":
          if (typeof v !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) errors[q.id] = "That email doesn't look right";
          else answers[q.id] = v;
          break;
        case "number": {
          const n = typeof v === "number" ? v : Number(v);
          if (Number.isNaN(n)) errors[q.id] = "Please enter a number";
          else answers[q.id] = n;
          break;
        }
        case "multi":
          answers[q.id] = Array.isArray(v) ? v.map(String) : [String(v)];
          break;
        case "rating": {
          const r = Number(v);
          const max = q.maxRating ?? 5;
          if (!Number.isInteger(r) || r < 1 || r > max) errors[q.id] = "Pick a rating";
          else answers[q.id] = r;
          break;
        }
        case "yesno":
          answers[q.id] = String(v).toLowerCase() === "yes" ? "Yes" : "No";
          break;
        default:
          answers[q.id] = Array.isArray(v) ? v.map(String).join(", ") : String(v).slice(0, 5000);
      }
    } else if (q.required) {
      errors[q.id] = "This one is required";
    }

    // Where would the visitor go next, given their answer?
    if (q.jump) {
      const key = Array.isArray(v) ? String(v[0]) : String(v ?? "");
      const target = q.jump[key];
      if (target === "__end__") break; // jumped straight to submit
      if (target) {
        const idx = questions.findIndex((x) => x.id === target);
        if (idx >= 0 && idx !== i) {
          i = idx;
          continue;
        }
      }
    }
    i += 1;
  }
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "validation", errors }, { status: 400 });
  }

  db.insert(responses)
    .values({
      id: newId(),
      formId: row.id,
      answers: JSON.stringify(answers),
      submittedAt: new Date().toISOString(),
    })
    .run();

  // Fire a Slack/Discord-compatible webhook, best-effort with a short timeout
  // so a slow endpoint never blocks the visitor's submission.
  if (settings.webhookUrl && /^https?:\/\//.test(settings.webhookUrl)) {
    const preview = questions
      .filter((q) => answers[q.id] !== undefined && answers[q.id] !== "")
      .slice(0, 3)
      .map((q) => {
        const v = answers[q.id];
        return `• ${q.title}: ${Array.isArray(v) ? v.join(", ") : v}`;
      })
      .join("\n");
    const isDiscord = /discord\.com\/api\/webhooks/.test(settings.webhookUrl);
    const payload = isDiscord
      ? { content: `📥 New response for **${row.title}**\n${preview}` }
      : { text: `📥 New response for *${row.title}*\n${preview}` };
    try {
      await Promise.race([
        fetch(settings.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => {}),
        new Promise((r) => setTimeout(r, 3000)),
      ]);
    } catch {
      // notification failures must never affect the submission
    }
  }

  return NextResponse.json({ ok: true });
}
