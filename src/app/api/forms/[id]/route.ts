import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { forms, responses } from "@/db/schema";
import { isAuthenticated } from "@/lib/auth";
import { rowToForm } from "@/lib/utils";
import { formPatchSchema } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const row = db.select().from(forms).where(eq(forms.id, id)).get();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rowToForm(row));
}

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const existing = db.select().from(forms).where(eq(forms.id, id)).get();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = formPatchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const updates: Partial<typeof forms.$inferInsert> = { updatedAt: new Date().toISOString() };
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.questions !== undefined) updates.questions = JSON.stringify(parsed.data.questions);
  if (parsed.data.settings !== undefined) updates.settings = JSON.stringify(parsed.data.settings);
  if (parsed.data.slug !== undefined && parsed.data.slug !== existing.slug) {
    const clash = db.select().from(forms).where(eq(forms.slug, parsed.data.slug)).get();
    if (clash && clash.id !== id) {
      return NextResponse.json({ error: "That URL is already taken" }, { status: 409 });
    }
    updates.slug = parsed.data.slug;
  }

  db.update(forms)
    .set(updates)
    .where(eq(forms.id, id))
    .run();

  const row = db.select().from(forms).where(eq(forms.id, id)).get();
  return NextResponse.json(rowToForm(row!));
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  db.delete(responses).where(eq(responses.formId, id)).run();
  db.delete(forms).where(eq(forms.id, id)).run();
  return NextResponse.json({ ok: true });
}
