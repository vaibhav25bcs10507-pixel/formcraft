import type { Question } from "./types";

function q(
  id: string,
  type: Question["type"],
  title: string,
  extra: Partial<Question> = {},
): Question {
  return { id, type, title, required: false, ...extra };
}

export type Template = {
  key: string;
  name: string;
  emoji: string;
  description: string;
  title: string;
  formDescription: string;
  questions: Question[];
};

export const TEMPLATES: Template[] = [
  {
    key: "contact",
    name: "Contact",
    emoji: "✉️",
    description: "Classic contact form with a conversational twist",
    title: "Get in touch",
    formDescription: "We usually reply within a day.",
    questions: [
      q("q1", "short", "What's your name?", { required: true, placeholder: "Jane Doe" }),
      q("q2", "email", "What's the best email to reach you?", { required: true }),
      q("q3", "choice", "What's this about?", {
        required: true,
        options: ["A project", "Support", "Just saying hi", "Something else"],
      }),
      q("q4", "long", "Tell us a bit more", { placeholder: "The more detail, the better…" }),
    ],
  },
  {
    key: "feedback",
    name: "Product feedback",
    emoji: "💡",
    description: "NPS-style satisfaction + open feedback",
    title: "How are we doing?",
    formDescription: "2 minutes, anonymous, and it genuinely shapes the roadmap.",
    questions: [
      q("q1", "rating", "How would you rate your experience so far?", { required: true, maxRating: 5 }),
      q("q2", "choice", "What should we improve most?", {
        options: ["Speed", "Design", "Features", "Pricing", "Support"],
      }),
      q("q3", "long", "Anything else you'd like to tell us?", { placeholder: "Spill it…" }),
    ],
  },
  {
    key: "rsvp",
    name: "Event RSVP",
    emoji: "🎉",
    description: "Collect attendence and dietary needs nicely",
    title: "You're invited!",
    formDescription: "Launch party — Friday, 7pm, at the studio.",
    questions: [
      q("q1", "short", "What's your name?", { required: true }),
      q("q2", "yesno", "Can you make it?", { required: true }),
      q("q3", "multi", "Any dietary preferences?", {
        options: ["Vegetarian", "Vegan", "Gluten-free", "None"],
      }),
      q("q4", "short", "Anything we should know?", { placeholder: "Bringing a plus one? Allergies?" }),
    ],
  },
  {
    key: "project-submission",
    name: "Project Submission",
    emoji: "🚀",
    description: "End-Term software project collection and evaluator review",
    title: "Software Project Submission",
    formDescription: "Submit your final project deliverables before the deadline.",
    questions: [
      q("q1", "short", "What is your full name and student ID?", { required: true, placeholder: "e.g. Alex Smith (25BCS10000)" }),
      q("q2", "short", "What is your project name?", { required: true, placeholder: "e.g. FormCraft" }),
      q("q3", "short", "GitHub Repository Link", { required: true, placeholder: "https://github.com/username/repo" }),
      q("q4", "short", "Deployed Live Application URL", { required: true, placeholder: "https://your-app.render.com" }),
      q("q5", "multi", "Primary Technologies Used", {
        required: true,
        options: ["Next.js / React", "TypeScript", "Node.js", "SQLite / Drizzle", "PostgreSQL", "Docker", "Tailwind CSS"],
      }),
      q("q6", "long", "Core Problem Statement & Engineering Architecture", {
        required: true,
        placeholder: "Describe the user problem solved, the 3-5 core workflows, and key technical decisions made.",
      }),
      q("q7", "short", "Demo Video Link (Loom / YouTube / Drive)", {
        required: true,
        placeholder: "https://youtu.be/... (3-5 minutes)",
      }),
    ],
  },
  {
    key: "bug-report",
    name: "Developer Bug Report",
    emoji: "🐛",
    description: "Structured bug triage and technical issue reporting",
    title: "Report an Issue",
    formDescription: "Help us isolate, reproduce, and fix software defects quickly.",
    questions: [
      q("q1", "short", "One-line issue summary", { required: true, placeholder: "e.g. Dropdown options overflow on mobile viewport" }),
      q("q2", "choice", "Severity Level", {
        required: true,
        options: ["P0 - Critical / Blocker", "P1 - Major Feature Broken", "P2 - Minor Glitch", "P3 - Trivial / Cosmetic"],
      }),
      q("q3", "long", "Steps to Reproduce", {
        required: true,
        placeholder: "1. Open form\n2. Click next without selecting\n3. Notice error message",
      }),
      q("q4", "long", "Expected vs Actual Behavior", {
        placeholder: "Expected: ... \nActual: ...",
      }),
      q("q5", "email", "Your email for follow-up notifications", { required: false }),
    ],
  },
];
