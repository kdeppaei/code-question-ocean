import { env } from 'cloudflare:workers';

type DatabaseEnv = { DB: D1Database };

export function getDatabase() {
  return (env as unknown as DatabaseEnv).DB;
}

export async function ensureProgressSchema() {
  const db = getDatabase();
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS user_progress (
      user_id TEXT PRIMARY KEY NOT NULL,
      email TEXT,
      state_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `).run();
  return db;
}
