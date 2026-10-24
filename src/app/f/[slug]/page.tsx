import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { forms } from "@/db/schema";
import { parseSettings, rowToForm } from "@/lib/utils";
import ConversationalForm from "@/components/ConversationalForm";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const row = db.select().from(forms).where(eq(forms.slug, slug)).get();
  if (!row) return { title: "Form not found — FormCraft" };
  return {
    title: `${row.title} — FormCraft`,
    description: row.description || undefined,
  };
}

export default async function PublicFormPage({ params }: Props) {
  const { slug } = await params;
  const row = db.select().from(forms).where(eq(forms.slug, slug)).get();
  if (!row) notFound();

  const form = rowToForm(row);
  const settings = parseSettings(row.settings);

  if (!settings.published) {
    return (
      <main className="flex min-h-screen flex-1 items-center justify-center bg-neutral-950 px-6 text-center">
        <div>
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-800 text-2xl">
            🔒
          </div>
          <h1 className="text-2xl font-bold text-white">This form isn&apos;t live yet</h1>
          <p className="mt-2 text-neutral-400">
            {settings.closedMessage || "Check back soon, or ping whoever sent you here."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-1">
      <ConversationalForm form={form} mode="live" />
    </main>
  );
}
