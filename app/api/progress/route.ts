import { ensureProgressSchema } from '@/lib/db';

export const dynamic = 'force-dynamic';

type StoredRow = { state_json: string; email: string | null; updated_at: number };

function requestUser(request: Request) {
  const userId = request.headers.get('oai-authenticated-user-id');
  const email = request.headers.get('oai-authenticated-user-email');
  const hostname = new URL(request.url).hostname;
  if (userId) return { userId, email };
  if (hostname === 'localhost' || hostname === '127.0.0.1') return { userId: 'local-preview', email: 'local@preview' };
  return null;
}

function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

function validLearningState(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const state = value as Record<string, unknown>;
  const arrays = ['solved', 'attempted', 'wrong', 'favorites', 'history'];
  if (!arrays.every((key) => Array.isArray(state[key]))) return false;
  if (!['submissions', 'successful', 'todayCount'].every((key) => Number.isFinite(state[key]))) return false;
  return typeof state.today === 'string';
}

export async function GET(request: Request) {
  const user = requestUser(request);
  if (!user) return Response.json({ error: '請先登入後再同步進度。' }, { status: 401 });

  const db = await ensureProgressSchema();
  const row = await db.prepare(
    'SELECT state_json, email, updated_at FROM user_progress WHERE user_id = ?',
  ).bind(user.userId).first<StoredRow>();

  if (!row) return Response.json({ state: null, user: { email: user.email }, updatedAt: null });
  try {
    return Response.json({ state: JSON.parse(row.state_json), user: { email: row.email || user.email }, updatedAt: row.updated_at });
  } catch {
    return Response.json({ state: null, user: { email: user.email }, updatedAt: null });
  }
}

export async function PUT(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: '來源不符合。' }, { status: 403 });
  const user = requestUser(request);
  if (!user) return Response.json({ error: '請先登入後再同步進度。' }, { status: 401 });
  if (Number(request.headers.get('content-length') || 0) > 80_000) {
    return Response.json({ error: '同步資料過大。' }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '資料格式錯誤。' }, { status: 400 });
  }
  const state = (body as { state?: unknown })?.state;
  if (!validLearningState(state)) return Response.json({ error: '學習資料格式錯誤。' }, { status: 400 });

  const serialized = JSON.stringify(state);
  if (serialized.length > 75_000) return Response.json({ error: '同步資料過大。' }, { status: 413 });

  const db = await ensureProgressSchema();
  const updatedAt = Date.now();
  await db.prepare(`
    INSERT INTO user_progress (user_id, email, state_json, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      email = excluded.email,
      state_json = excluded.state_json,
      updated_at = excluded.updated_at
  `).bind(user.userId, user.email, serialized, updatedAt).run();

  return Response.json({ ok: true, updatedAt, user: { email: user.email } });
}
