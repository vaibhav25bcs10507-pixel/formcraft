import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { forms } from "@/db/schema";
import { parseSettings, rowToForm } from "@/lib/utils";
import ConversationalForm from "@/components/ConversationalForm";

export default async function EmbedPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const row = db.select().from(forms).where(eq(forms.slug, slug)).get();
  if (!row) notFound();
  const form = rowToForm(row);
  const settings = parseSettings(row.settings);

  if (!settings.published) {
    return (
      <main className="flex min-h-screen flex-1 items-center justify-center px-6 text-center">
        <p className="text-neutral-500">This form isn&apos;t accepting responses yet.</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-1">
      <ConversationalForm form={form} mode="live" embedded />
    </main>
  );
}
