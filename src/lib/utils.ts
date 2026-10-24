import { customAlphabet } from "nanoid";
import clsx from "clsx";
import type { FormRow } from "@/db/schema";
import { DEFAULT_SETTINGS, type FormDTO, type FormSettings, type Question } from "./types";

export const cn = clsx;

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 12);
const slugid = customAlphabet("abcdefghjkmnpqrstuvwxyz23456789", 8);

export const newId = () => nanoid();
export const newSlug = () => slugid();

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function parseSettings(json: string): FormSettings {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(json) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function parseQuestions(json: string): Question[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function rowToForm(row: FormRow): FormDTO {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    questions: parseQuestions(row.questions),
    settings: parseSettings(row.settings),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function csvEscape(v: unknown): string {
  const s = v == null ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCSV(headers: string[], rows: unknown[][]): string {
  const lines = [headers.map(csvEscape).join(",")];
  for (const row of rows) lines.push(row.map(csvEscape).join(","));
  return "\uFEFF" + lines.join("\r\n");
}

// Tiny in-memory rate limiter, per key. Enough for single-instance self-hosting.
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count += 1;
  return true;
}
