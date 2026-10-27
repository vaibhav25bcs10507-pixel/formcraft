import type BetterSqlite3 from "better-sqlite3";
import crypto from "crypto";

type SeedQuestion = {
  id: string;
  type: string;
  title: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  maxRating?: number;
};

type SeedForm = {
  slug: string;
  title: string;
  description: string;
  questions: SeedQuestion[];
  settings: Record<string, unknown>;
  responses: Record<string, string | number | string[]>[];
};

const now = Date.now();
const iso = (daysAgo: number) => new Date(now - daysAgo * 86_400_000).toISOString();

const baseSettings = {
  published: true,
  brandColor: "#6366f1",
  theme: "light",
  showProgress: true,
  welcomeEnabled: false,
  welcomeButton: "Start",
  thankYouEnabled: true,
  thankYouTitle: "Thank you!",
  thankYouDescription: "Your response has been recorded.",
};

const SEED_FORMS: SeedForm[] = [
  {
    slug: "end-term-project-submission",
    title: "End-Term Project Submission",
    description: "Submit your final project deliverables before the deadline.",
    questions: [
      { id: "s1", type: "short", title: "What is your full name and student ID?", required: true },
      { id: "s2", type: "short", title: "What is your project name?", required: true },
      { id: "s3", type: "short", title: "GitHub Repository Link", required: true },
      { id: "s4", type: "short", title: "Deployed Live Application URL", required: true },
      {
        id: "s5",
        type: "multi",
        title: "Primary Technologies Used",
        required: true,
        options: ["Next.js / React", "TypeScript", "Node.js", "SQLite / Drizzle", "Tailwind CSS"],
      },
      {
        id: "s6",
        type: "long",
        title: "Core Problem Statement & Engineering Architecture",
        required: true,
      },
    ],
    settings: { ...baseSettings },
    responses: [
      {
        s1: "Aarav Mehta (25BCS10021)",
        s2: "CampusEats",
        s3: "https://github.com/aarav/campus-eats",
        s4: "https://campus-eats.onrender.com",
        s5: ["Next.js / React", "TypeScript", "SQLite / Drizzle"],
        s6: "A campus canteen pre-order system that removes lunch queues. Students order ahead, vendors manage live stock, and pickup slots are capacity-checked.",
      },
      {
        s1: "Diya Sharma (25BCS10044)",
        s2: "StudyCircle",
        s3: "https://github.com/diya/study-circle",
        s4: "https://study-circle.vercel.app",
        s5: ["Next.js / React", "TypeScript", "Tailwind CSS"],
        s6: "A peer study-group matcher with topic-based rooms, scheduled sessions, and attendance tracking for first-year students.",
      },
      {
        s1: "Rohan Iyer (25BCS10087)",
        s2: "RailRadar",
        s3: "https://github.com/rohan/rail-radar",
        s4: "https://rail-radar.onrender.com",
        s5: ["Node.js", "TypeScript", "SQLite / Drizzle"],
        s6: "A live train-delay dashboard that aggregates crowd reports and predicts arrival windows using a rolling median model.",
      },
      {
        s1: "Meera Nair (25BCS10102)",
        s2: "ClinicQueue",
        s3: "https://github.com/meera/clinic-queue",
        s4: "https://clinic-queue.fly.dev",
        s5: ["Next.js / React", "Node.js", "SQLite / Drizzle", "Tailwind CSS"],
        s6: "A small-clinic token management app with walk-in registration, doctor availability, and SMS-ready queue updates.",
      },
    ],
  },
  {
    slug: "product-feedback-q4",
    title: "Product Feedback — Q4 2026",
    description: "Two minutes, anonymous, and it genuinely shapes the roadmap.",
    questions: [
      { id: "f1", type: "rating", title: "How would you rate your experience so far?", required: true, maxRating: 5 },
      {
        id: "f2",
        type: "choice",
        title: "What should we improve most?",
        required: false,
        options: ["Speed", "Design", "Features", "Pricing", "Support"],
      },
      { id: "f3", type: "long", title: "Anything else you'd like to tell us?", required: false },
    ],
    settings: { ...baseSettings, brandColor: "#0ea5e9" },
    responses: [
      { f1: 5, f2: "Speed", f3: "The conversational flow is genuinely faster than the old form." },
      { f1: 4, f2: "Features", f3: "Would love file uploads on the long-answer question." },
      { f1: 5, f2: "Design", f3: "Dark mode looks great on mobile." },
      { f1: 3, f2: "Pricing", f3: "Free tier is generous, but the docs could be clearer." },
      { f1: 4, f2: "Support", f3: "Quick reply on Discord — thanks!" },
    ],
  },
  {
    slug: "hackathon-team-registration",
    title: "Hackathon Team Registration",
    description: "Draft form — register your team for the 36-hour build sprint.",
    questions: [
      { id: "h1", type: "short", title: "Team name", required: true },
      { id: "h2", type: "email", title: "Team lead email", required: true },
      { id: "h3", type: "number", title: "Number of members (2–4)", required: true },
      { id: "h4", type: "long", title: "What are you planning to build?", required: false },
    ],
    settings: { ...baseSettings, published: false, brandColor: "#10b981" },
    responses: [],
  },
];

export function seedDemoData(sqlite: BetterSqlite3.Database) {
  const count = sqlite.prepare("SELECT COUNT(*) AS n FROM forms").get() as { n: number };
  if (count.n > 0) return;

  const insertForm = sqlite.prepare(
    "INSERT INTO forms (id, slug, title, description, questions, settings, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const insertResponse = sqlite.prepare(
    "INSERT INTO responses (id, form_id, answers, submitted_at) VALUES (?, ?, ?, ?)"
  );

  const seed = sqlite.transaction(() => {
    for (const form of SEED_FORMS) {
      const formId = crypto.randomUUID();
      const createdAt = iso(14);
      insertForm.run(
        formId,
        form.slug,
        form.title,
        form.description,
        JSON.stringify(form.questions),
        JSON.stringify(form.settings),
        createdAt,
        iso(1)
      );

      form.responses.forEach((answers, index) => {
        insertResponse.run(
          crypto.randomUUID(),
          formId,
          JSON.stringify(answers),
          iso(form.responses.length - index)
        );
      });
    }
  });

  seed();
}
