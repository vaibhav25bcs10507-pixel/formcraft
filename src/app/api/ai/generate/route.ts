import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { forms } from "@/db/schema";
import { isAuthenticated } from "@/lib/auth";
import { generateFormWithAI, getAIConfig } from "@/lib/ai";
import { newId, newSlug, rowToForm, slugify } from "@/lib/utils";
import { DEFAULT_SETTINGS } from "@/lib/types";

export async function POST(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (prompt.length < 4) return NextResponse.json({ error: "Describe your form first" }, { status: 400 });

  const cfg = await getAIConfig();
  if (!cfg) {
    return NextResponse.json(
      { error: "AI is not configured. Add an API key in Settings." },
      { status: 400 },
    );
  }

  let generated;
  try {
    generated = await generateFormWithAI(prompt.slice(0, 2000), cfg);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI generation failed" },
      { status: 502 },
    );
  }

  const base = slugify(generated.title) || "form";
  let slug = base;
  while (db.select().from(forms).where(eq(forms.slug, slug)).get()) {
    slug = `${base}-${newSlug().slice(0, 4)}`;
  }
  const now = new Date().toISOString();
  const id = newId();
  db.insert(forms)
    .values({
      id,
      slug,
      title: generated.title,
      description: generated.description,
      questions: JSON.stringify(generated.questions),
      settings: JSON.stringify(DEFAULT_SETTINGS),
      createdAt: now,
      updatedAt: now,
    })
    .run();

  const row = db.select().from(forms).where(eq(forms.id, id)).get();
  return NextResponse.json(rowToForm(row!), { status: 201 });
}
