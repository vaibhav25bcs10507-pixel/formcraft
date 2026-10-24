import { z } from "zod";

export const QUESTION_TYPES = [
  "short",
  "long",
  "email",
  "number",
  "choice",
  "multi",
  "dropdown",
  "rating",
  "yesno",
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  short: "Short text",
  long: "Long text",
  email: "Email",
  number: "Number",
  choice: "Multiple choice",
  multi: "Checkboxes",
  dropdown: "Dropdown",
  rating: "Rating",
  yesno: "Yes / No",
};

export type Question = {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  placeholder?: string;
  options?: string[]; // choice / multi / dropdown
  maxRating?: number; // rating, default 5
  // Skip logic: option value -> target question id, or "__end__" to submit immediately.
  // Only meaningful for choice / dropdown / yesno questions.
  jump?: Record<string, string>;
};

export type FormSettings = {
  published: boolean;
  closedMessage?: string;
  brandColor: string; // hex, default #6366f1
  theme: "light" | "dark";
  showProgress: boolean;
  welcomeEnabled: boolean;
  welcomeTitle?: string;
  welcomeDescription?: string;
  welcomeButton?: string;
  thankYouEnabled: boolean;
  thankYouTitle?: string;
  thankYouDescription?: string;
  // Slack/Discord-compatible webhook fired on every new response.
  webhookUrl?: string;
};

export const DEFAULT_SETTINGS: FormSettings = {
  published: false,
  brandColor: "#6366f1",
  theme: "light",
  showProgress: true,
  welcomeEnabled: false,
  welcomeButton: "Start",
  thankYouEnabled: true,
  thankYouTitle: "Thank you!",
  thankYouDescription: "Your response has been recorded.",
};

export type FormDTO = {
  id: string;
  slug: string;
  title: string;
  description: string;
  questions: Question[];
  settings: FormSettings;
  createdAt: string;
  updatedAt: string;
};

export type AnswerMap = Record<string, string | number | string[]>;

export type ResponseDTO = {
  id: string;
  formId: string;
  answers: AnswerMap;
  submittedAt: string;
};

export const questionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(QUESTION_TYPES),
  title: z.string().min(1).max(500),
  description: z.string().max(1000).optional(),
  required: z.boolean(),
  placeholder: z.string().max(200).optional(),
  options: z.array(z.string().max(200)).optional(),
  maxRating: z.number().int().min(3).max(10).optional(),
  jump: z.record(z.string().max(200), z.string().max(50)).optional(),
});

export const formSettingsSchema = z.object({
  published: z.boolean(),
  closedMessage: z.string().max(500).optional(),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  theme: z.enum(["light", "dark"]),
  showProgress: z.boolean(),
  welcomeEnabled: z.boolean(),
  welcomeTitle: z.string().max(300).optional(),
  welcomeDescription: z.string().max(500).optional(),
  welcomeButton: z.string().max(50).optional(),
  thankYouEnabled: z.boolean(),
  thankYouTitle: z.string().max(300).optional(),
  thankYouDescription: z.string().max(500).optional(),
  webhookUrl: z
    .string()
    .max(500)
    .refine((v) => v === "" || /^https?:\/\//.test(v), "must be an http(s) URL")
    .optional(),
});

export const formPatchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z
    .string()
    .min(3)
    .max(60)
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, "lowercase letters, numbers and hyphens")
    .optional(),
  description: z.string().max(1000).optional(),
  questions: z.array(questionSchema).max(100).optional(),
  settings: formSettingsSchema.optional(),
});

export const submissionSchema = z.object({
  answers: z.record(z.string(), z.union([z.string(), z.number(), z.array(z.string())])),
  _hp: z.string().optional(), // honeypot
  _t: z.number().optional(), // elapsed ms, anti-bot time trap
});
