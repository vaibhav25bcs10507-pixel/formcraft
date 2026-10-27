import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import fs from "fs";
import * as schema from "./schema";
import { seedDemoData } from "./seed";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
fs.mkdirSync(DATA_DIR, { recursive: true });

const globalForDb = globalThis as unknown as { __formoDb?: ReturnType<typeof createDb> };

function createDb() {
  const dbPath = fs.existsSync(path.join(DATA_DIR, "formo.db"))
    ? path.join(DATA_DIR, "formo.db")
    : path.join(DATA_DIR, "formcraft.db");
  const sqlite = new Database(dbPath);
  sqlite.pragma("busy_timeout = 10000");
  sqlite.pragma("journal_mode = WAL");
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS forms (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      questions TEXT NOT NULL DEFAULT '[]',
      settings TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS responses (
      id TEXT PRIMARY KEY,
      form_id TEXT NOT NULL,
      answers TEXT NOT NULL DEFAULT '{}',
      submitted_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_responses_form ON responses(form_id);
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  const database = drizzle(sqlite, { schema });
  if (process.env.SEED_DEMO === "true") {
    try {
      seedDemoData(sqlite);
    } catch (err) {
      console.error("Demo seed failed", err);
    }
  }
  return database;
}

export const db = globalForDb.__formoDb ?? createDb();
if (!globalForDb.__formoDb) globalForDb.__formoDb = db;
export { schema };
