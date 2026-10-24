import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { forms, responses } from "@/db/schema";
import { isAuthenticated } from "@/lib/auth";
import { newId, newSlug, rowToForm, slugify } from "@/lib/utils";
import { TEMPLATES } from "@/lib/templates";
import { DEFAULT_SETTINGS, type Question } from "@/lib/types";

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = db
    .select()
    .from(forms)
    .all()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const counts = db.select().from(responses).all();
  const countMap = new Map<string, number>();
  for (const r of counts) countMap.set(r.formId, (countMap.get(r.formId) ?? 0) + 1);
  return NextResponse.json(
    rows.map((row) => ({ ...rowToForm(row), responseCount: countMap.get(row.id) ?? 0 })),
  );
}

function starterQuestions(): Question[] {
  return [
    {
      id: "q1",
      type: "short",
      title: "What's your name?",
      required: true,
      placeholder: "Jane Doe",
    },
  ];
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));

  let title =
    typeof body.title === "string" && body.title.trim() ? body.title.trim() : "Untitled form";
  let description = "";
  let questions: Question[] = starterQuestions();

  if (typeof body.template === "string") {
    const tpl = TEMPLATES.find((t) => t.key === body.template);
    if (tpl) {
      title = tpl.title;
      description = tpl.formDescription;
      questions = tpl.questions;
    }
  }
  if (Array.isArray(body.questions)) questions = body.questions as Question[];
  if (typeof body.description === "string") description = body.description;

  const base = slugify(title) || "form";
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
      title,
      description,
      questions: JSON.stringify(questions),
      settings: JSON.stringify(DEFAULT_SETTINGS),
      createdAt: now,
      updatedAt: now,
    })
    .run();

  const row = db.select().from(forms).where(eq(forms.id, id)).get();
  return NextResponse.json({ ...rowToForm(row!), responseCount: 0 }, { status: 201 });
}
