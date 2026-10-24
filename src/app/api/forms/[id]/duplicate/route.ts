import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { forms } from "@/db/schema";
import { isAuthenticated } from "@/lib/auth";
import { newId, newSlug, rowToForm } from "@/lib/utils";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const src = db.select().from(forms).where(eq(forms.id, id)).get();
  if (!src) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const base = `${src.slug}-copy`.slice(0, 60);
  let slug = base;
  while (db.select().from(forms).where(eq(forms.slug, slug)).get()) {
    slug = `${base}-${newSlug().slice(0, 4)}`;
  }

  const now = new Date().toISOString();
  const newFormId = newId();
  db.insert(forms)
    .values({
      id: newFormId,
      slug,
      title: `${src.title} (copy)`,
      description: src.description,
      questions: src.questions,
      settings: src.settings.replace(/"published":\s*true/, '"published":false'),
      createdAt: now,
      updatedAt: now,
    })
    .run();

  const row = db.select().from(forms).where(eq(forms.id, newFormId)).get();
  return NextResponse.json(rowToForm(row!), { status: 201 });
}
