import { eq } from "drizzle-orm";
import { db } from "@/db";
import { forms, responses } from "@/db/schema";
import { isAuthenticated } from "@/lib/auth";
import { parseQuestions, toCSV } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Ctx) {
  if (!(await isAuthenticated())) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  const form = db.select().from(forms).where(eq(forms.id, id)).get();
  if (!form) return new Response("Not found", { status: 404 });

  const url = new URL(req.url);
  const format = url.searchParams.get("format") || "csv";

  const questions = parseQuestions(form.questions);
  const rows = db.select().from(responses).where(eq(responses.formId, id)).all();
  const sorted = rows.sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));

  if (format === "json") {
    const data = sorted.map((r) => ({
      id: r.id,
      submittedAt: r.submittedAt,
      answers: JSON.parse(r.answers) as Record<string, unknown>,
    }));
    return new Response(
      JSON.stringify(
        {
          form: { id: form.id, title: form.title, slug: form.slug },
          questions: questions.map((q) => ({ id: q.id, title: q.title, type: q.type })),
          totalResponses: data.length,
          responses: data,
        },
        null,
        2
      ),
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="${form.slug}-responses.json"`,
        },
      }
    );
  }

  const csv = toCSV(
    ["Submitted at", ...questions.map((q) => q.title)],
    sorted.map((r) => {
      const answers = JSON.parse(r.answers) as Record<string, unknown>;
      return [
        r.submittedAt,
        ...questions.map((q) => {
          const v = answers[q.id];
          return Array.isArray(v) ? v.join("; ") : (v ?? "");
        }),
      ];
    }),
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${form.slug}-responses.csv"`,
    },
  });
}
