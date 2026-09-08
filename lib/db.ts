import { env } from 'cloudflare:workers';

type DatabaseEnv = { DB: D1Database };

export function getDatabase() {
  return (env as unknown as DatabaseEnv).DB;
}

export async function ensureProgressSchema() {
  const db = getDatabase();
  await db.batch([
    db.prepare(`
      CREATE TABLE IF NOT EXISTS user_progress (
        user_id TEXT PRIMARY KEY NOT NULL,
        email TEXT,
        state_json TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS leaderboard_profiles (
        user_id TEXT PRIMARY KEY NOT NULL,
        display_name TEXT NOT NULL,
        solved_count INTEGER DEFAULT 0 NOT NULL,
        successful INTEGER DEFAULT 0 NOT NULL,
        submissions INTEGER DEFAULT 0 NOT NULL,
        is_public INTEGER DEFAULT 1 NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS custom_problems (
        id INTEGER PRIMARY KEY NOT NULL,
        data_json TEXT NOT NULL,
        judge_json TEXT,
        active INTEGER DEFAULT 1 NOT NULL,
        created_by TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS judge_rate_limits (
        key TEXT PRIMARY KEY NOT NULL,
        window_start INTEGER NOT NULL,
        request_count INTEGER DEFAULT 1 NOT NULL
      )
    `),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_leaderboard_public_score ON leaderboard_profiles (is_public, solved_count DESC, successful DESC, updated_at ASC)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_custom_problems_active_updated ON custom_problems (active, updated_at DESC)'),
  ]);
  return db;
}
