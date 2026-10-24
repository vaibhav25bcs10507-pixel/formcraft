import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const forms = sqliteTable("forms", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  questions: text("questions").notNull().default("[]"), // JSON array of Question
  settings: text("settings").notNull().default("{}"), // JSON FormSettings
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const responses = sqliteTable("responses", {
  id: text("id").primaryKey(),
  formId: text("form_id").notNull(),
  answers: text("answers").notNull().default("{}"), // JSON { [questionId]: value }
  submittedAt: text("submitted_at").notNull(),
});

export const appSettings = sqliteTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export type FormRow = typeof forms.$inferSelect;
export type ResponseRow = typeof responses.$inferSelect;
