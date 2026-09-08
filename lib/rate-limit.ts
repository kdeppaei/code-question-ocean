import { ensureProgressSchema } from '@/lib/db';

export async function consumeRequestLimit(request: Request, userId: string, bucket: string, limit: number, windowMs: number) {
  const hostname = new URL(request.url).hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return null;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${bucket}:${userId}`));
  const key = Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, '0')).join('');
  const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
  const db = await ensureProgressSchema();
  const row = await db.prepare(`
    INSERT INTO judge_rate_limits (key, window_start, request_count)
    VALUES (?, ?, 1)
    ON CONFLICT(key) DO UPDATE SET
      request_count = CASE WHEN window_start = excluded.window_start THEN request_count + 1 ELSE 1 END,
      window_start = excluded.window_start
    RETURNING request_count
  `).bind(key, windowStart).first<{ request_count: number }>();
  if ((row?.request_count || 1) > limit) {
    const retrySeconds = Math.max(1, Math.ceil((windowStart + windowMs - Date.now()) / 1000));
    return Response.json({ error: `使用次數已達上限，請在 ${retrySeconds} 秒後再試。` }, {
      status: 429,
      headers: { 'Retry-After': String(retrySeconds) },
    });
  }
  return null;
}
