import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { forms } from "@/db/schema";
import { rowToForm } from "@/lib/utils";
import FormBuilder from "@/components/builder/FormBuilder";

export default async function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = db.select().from(forms).where(eq(forms.id, id)).get();
  if (!row) notFound();
  return <FormBuilder initialForm={rowToForm(row)} />;
}
