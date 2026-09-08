import { z } from 'zod';
import { ensureProgressSchema } from '@/lib/db';
import { getRequestIdentity, sameOrigin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

type LeaderboardRow = {
  display_name: string;
  solved_count: number;
  successful: number;
  submissions: number;
  updated_at: number;
};

const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(24).regex(/^[\p{L}\p{N}_ .-]+$/u),
  isPublic: z.boolean().default(true),
}).strict();

export async function GET() {
  const db = await ensureProgressSchema();
  const rows = await db.prepare(`
    SELECT display_name, solved_count, successful, submissions, updated_at
    FROM leaderboard_profiles
    WHERE is_public = 1
    ORDER BY solved_count DESC, successful DESC, updated_at ASC
    LIMIT 100
  `).all<LeaderboardRow>();
  return Response.json({
    leaders: (rows.results || []).map((row, index) => ({
      rank: index + 1,
      displayName: row.display_name,
      solvedCount: row.solved_count,
      successful: row.successful,
      submissions: row.submissions,
      accuracy: row.submissions ? Math.round((row.successful / row.submissions) * 100) : 0,
      updatedAt: row.updated_at,
    })),
  });
}

export async function PUT(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: '來源不符合。' }, { status: 403 });
  const identity = getRequestIdentity(request);
  if (!identity) return Response.json({ error: '請先使用 ChatGPT 登入。' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '資料格式錯誤。' }, { status: 400 });
  }
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: '顯示名稱需為 2–24 個字，且不可包含特殊符號。' }, { status: 400 });

  const db = await ensureProgressSchema();
  const progress = await db.prepare('SELECT state_json FROM user_progress WHERE user_id = ?').bind(identity.userId).first<{ state_json: string }>();
  let solvedCount = 0;
  let successful = 0;
  let submissions = 0;
  if (progress) {
    try {
      const state = JSON.parse(progress.state_json) as { solved?: unknown[]; successful?: number; submissions?: number };
      solvedCount = Array.isArray(state.solved) ? state.solved.length : 0;
      successful = Number.isFinite(state.successful) ? Number(state.successful) : 0;
      submissions = Number.isFinite(state.submissions) ? Number(state.submissions) : 0;
    } catch {
      // Invalid legacy progress is treated as an empty score.
    }
  }

  const updatedAt = Date.now();
  await db.prepare(`
    INSERT INTO leaderboard_profiles (user_id, display_name, solved_count, successful, submissions, is_public, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      display_name = excluded.display_name,
      solved_count = excluded.solved_count,
      successful = excluded.successful,
      submissions = excluded.submissions,
      is_public = excluded.is_public,
      updated_at = excluded.updated_at
  `).bind(identity.userId, parsed.data.displayName, solvedCount, successful, submissions, parsed.data.isPublic ? 1 : 0, updatedAt).run();

  return Response.json({ ok: true, displayName: parsed.data.displayName, isPublic: parsed.data.isPublic });
}
