import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { db } from "@/db";
import { forms, responses } from "@/db/schema";
import { parseQuestions, rowToForm } from "@/lib/utils";
import DeleteResponseButton from "./DeleteResponseButton";

export default async function ResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = db.select().from(forms).where(eq(forms.id, id)).get();
  if (!row) notFound();
  const form = rowToForm(row);
  const questions = parseQuestions(row.questions);
  const rows = db
    .select()
    .from(responses)
    .where(eq(responses.formId, id))
    .all()
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));

  const parsed = rows.map((r) => ({
    id: r.id,
    submittedAt: r.submittedAt,
    answers: JSON.parse(r.answers) as Record<string, string | number | string[]>,
  }));

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/forms/${id}`}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{form.title} — responses</h1>
            <p className="text-sm text-neutral-500">
              {parsed.length === 0
                ? "No responses yet"
                : `${parsed.length} ${parsed.length === 1 ? "response" : "responses"}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/f/${form.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-50"
          >
            <ExternalLink size={14} /> Open form
          </a>
          {parsed.length > 0 && (
            <div className="flex items-center gap-2">
              <a
                href={`/api/forms/${id}/export`}
                className="flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-700 transition"
              >
                <Download size={14} /> CSV
              </a>
              <a
                href={`/api/forms/${id}/export?format=json`}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition"
              >
                <Download size={14} /> JSON
              </a>
            </div>
          )}
        </div>
      </div>

      {parsed.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Total Submissions</span>
            <p className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">{parsed.length}</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Form Status</span>
            <p className={`mt-1 text-xl font-bold tracking-tight ${form.settings.published ? "text-emerald-600" : "text-neutral-500"}`}>
              {form.settings.published ? "Live / Accepting" : "Draft / Closed"}
            </p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Latest Submission</span>
            <p className="mt-1 text-sm font-semibold text-neutral-700">
              {new Date(parsed[0].submittedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
      )}

      {parsed.length === 0 ? (
        <div className="mt-16 rounded-2xl border-2 border-dashed border-neutral-200 bg-white p-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
            📭
          </div>
          <h2 className="mt-4 text-lg font-bold">Nothing here yet</h2>
          <p className="mt-1 text-sm text-neutral-500">
            {form.settings.published
              ? "Share your form link and responses will appear here in real time."
              : "Publish the form first, then share the link far and wide."}
          </p>
        </div>
      ) : (
        <>
          {/* Per-question analytics */}
          <h2 className="mt-10 text-sm font-bold uppercase tracking-wide text-neutral-400">Summary</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {questions.map((q) => {
              const values = parsed.map((r) => r.answers[q.id]).filter((v) => v !== undefined && v !== "");
              if (values.length === 0) return null;
              return (
                <div key={q.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
                  <h3 className="text-sm font-bold leading-snug">{q.title}</h3>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    {values.length} {values.length === 1 ? "answer" : "answers"}
                  </p>
                  <QuestionSummary type={q.type} values={values} />
                </div>
              );
            })}
          </div>

          {/* Individual responses */}
          <h2 className="mt-10 text-sm font-bold uppercase tracking-wide text-neutral-400">
            All responses
          </h2>
          <div className="mt-3 space-y-3">
            {parsed.map((r, i) => (
              <details key={r.id} className="group rounded-2xl border border-neutral-200 bg-white">
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-semibold">
                  <span>
                    Response #{parsed.length - i}
                    <span className="ml-3 font-normal text-neutral-400">
                      {new Date(r.submittedAt).toLocaleString()}
                    </span>
                  </span>
                  <span className="text-neutral-400 transition group-open:rotate-180">▾</span>
                </summary>
                <dl className="divide-y divide-neutral-100 border-t border-neutral-100">
                  {questions.map((q) => (
                    <div key={q.id} className="px-5 py-3">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                        {q.title}
                      </dt>
                      <dd className="mt-1 whitespace-pre-wrap text-sm">
                        {Array.isArray(r.answers[q.id])
                          ? (r.answers[q.id] as string[]).join(", ")
                          : (r.answers[q.id] as string) || (
                              <span className="text-neutral-300">— skipped —</span>
                            )}
                      </dd>
                    </div>
                  ))}
                </dl>
                <div className="flex justify-end border-t border-neutral-100 px-4 py-2">
                  <DeleteResponseButton responseId={r.id} />
                </div>
              </details>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function QuestionSummary({
  type,
  values,
}: {
  type: string;
  values: (string | number | string[])[];
}) {
  if (type === "choice" || type === "multi" || type === "dropdown" || type === "yesno") {
    const flat = values.flatMap((v) => (Array.isArray(v) ? v : [String(v)]));
    const counts = new Map<string, number>();
    for (const v of flat) counts.set(v, (counts.get(v) ?? 0) + 1);
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const max = sorted[0]?.[1] ?? 1;
    return (
      <div className="mt-3 space-y-2">
        {sorted.map(([label, count]) => (
          <div key={label}>
            <div className="flex justify-between text-xs font-medium">
              <span className="truncate">{label}</span>
              <span className="text-neutral-400">
                {count} · {Math.round((count / flat.length) * 100)}%
              </span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-neutral-100">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "rating") {
    const nums = values.map(Number).filter((n) => !Number.isNaN(n));
    const avg = nums.reduce((a, b) => a + b, 0) / Math.max(1, nums.length);
    const counts = new Map<number, number>();
    for (const n of nums) counts.set(n, (counts.get(n) ?? 0) + 1);
    const maxCount = Math.max(1, ...counts.values());
    return (
      <div>
        <p className="mt-2 text-3xl font-bold">
          {avg.toFixed(1)}
          <span className="text-base font-medium text-neutral-400"> / {Math.max(...nums)} average</span>
        </p>
        <div className="mt-3 flex items-end gap-1.5">
          {[...counts.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([n, c]) => (
              <div key={n} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-indigo-500"
                  style={{ height: `${Math.max(8, (c / maxCount) * 48)}px` }}
                  title={`${n}: ${c}`}
                />
                <span className="text-[10px] text-neutral-400">{n}</span>
              </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <ul className="mt-3 max-h-40 space-y-1.5 overflow-y-auto">
      {values.slice(0, 8).map((v, i) => (
        <li key={i} className="rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
          {Array.isArray(v) ? v.join(", ") : String(v)}
        </li>
      ))}
      {values.length > 8 && (
        <li className="px-3 text-xs text-neutral-400">+ {values.length - 8} more…</li>
      )}
    </ul>
  );
}
