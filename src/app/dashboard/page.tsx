import { db } from "@/db";
import { forms, responses } from "@/db/schema";
import { rowToForm } from "@/lib/utils";
import NewFormButton from "./NewFormButton";
import FormList from "./FormList";

export default async function DashboardHome() {
  const rows = db
    .select()
    .from(forms)
    .all()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const allResponses = db.select().from(responses).all();
  const countMap = new Map<string, number>();
  for (const r of allResponses) countMap.set(r.formId, (countMap.get(r.formId) ?? 0) + 1);

  const formsWithCount = rows.map((row) => ({
    form: rowToForm(row),
    responseCount: countMap.get(row.id) ?? 0,
  }));

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Your forms</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Design, publish, and inspect responses with conversational clarity.
          </p>
        </div>
        <NewFormButton />
      </div>

      <FormList initialForms={formsWithCount} />
    </div>
  );
}
