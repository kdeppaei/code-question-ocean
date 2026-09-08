import { ensureProgressSchema } from '@/lib/db';
import { getRequestIdentity, requestIsAdmin, sameOrigin } from '@/lib/auth';
import { problemImportSchema, problemSchema, type ImportedProblem } from '@/lib/problem-schema';

export const dynamic = 'force-dynamic';

type StoredProblemRow = { id: number; data_json: string; updated_at: number };

export async function GET() {
  const db = await ensureProgressSchema();
  const rows = await db.prepare(`
    SELECT id, data_json, updated_at
    FROM custom_problems
    WHERE active = 1
    ORDER BY id
    LIMIT 1000
  `).all<StoredProblemRow>();
  const problems: ImportedProblem[] = [];
  for (const row of rows.results || []) {
    try {
      const parsed = problemSchema.safeParse(JSON.parse(row.data_json));
      if (parsed.success) problems.push(parsed.data);
    } catch {
      // Skip a damaged row instead of breaking the public problem set.
    }
  }
  return Response.json({ problems });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: '來源不符合。' }, { status: 403 });
  const identity = getRequestIdentity(request);
  if (!requestIsAdmin(request, identity)) return Response.json({ error: '只有管理員可以匯入題目。' }, { status: 403 });
  if (Number(request.headers.get('content-length') || 0) > 500_000) return Response.json({ error: '匯入資料過大。' }, { status: 413 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON 格式錯誤。' }, { status: 400 });
  }
  const parsed = problemImportSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: '題目格式不符合規格。', details: parsed.error.issues.slice(0, 8) }, { status: 400 });

  const db = await ensureProgressSchema();
  const updatedAt = Date.now();
  const statements = parsed.data.problems.map((problem) => db.prepare(`
    INSERT INTO custom_problems (id, data_json, active, created_by, updated_at)
    VALUES (?, ?, 1, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      data_json = excluded.data_json,
      active = 1,
      created_by = excluded.created_by,
      updated_at = excluded.updated_at
  `).bind(problem.id, JSON.stringify(problem), identity!.userId, updatedAt));
  await db.batch(statements);
  return Response.json({ ok: true, imported: parsed.data.problems.length });
}

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: '來源不符合。' }, { status: 403 });
  const identity = getRequestIdentity(request);
  if (!requestIsAdmin(request, identity)) return Response.json({ error: '只有管理員可以管理題目。' }, { status: 403 });
  const body = await request.json().catch(() => null) as { ids?: unknown; active?: unknown } | null;
  if (!body || !Array.isArray(body.ids) || body.ids.length < 1 || body.ids.length > 100 || !body.ids.every((id) => Number.isInteger(id) && Number(id) >= 1000) || typeof body.active !== 'boolean') {
    return Response.json({ error: '管理資料格式錯誤。' }, { status: 400 });
  }
  const db = await ensureProgressSchema();
  const statements = body.ids.map((id) => db.prepare('UPDATE custom_problems SET active = ?, updated_at = ? WHERE id = ?').bind(body.active ? 1 : 0, Date.now(), id));
  await db.batch(statements);
  return Response.json({ ok: true, updated: body.ids.length });
}
