import { env } from 'cloudflare:workers';
import { getRequestIdentity, sameOrigin } from '@/lib/auth';
import { consumeRequestLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const languageIds = { C: 103, 'C++': 105, Python: 109, SQL: 82 } as const;
type PlaygroundLanguage = keyof typeof languageIds;

type JudgeResult = {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  time?: string | null;
  memory?: number | null;
  status?: { description?: string };
};

function clean(value: string | null | undefined) {
  return (value || '').replace(/\r/g, '').trimEnd();
}

export async function POST(request: Request) {
  const identity = getRequestIdentity(request);
  if (!identity) return Response.json({ error: '請先登入後使用程式實驗室。' }, { status: 401 });
  if (!sameOrigin(request)) return Response.json({ error: '無法驗證請求來源。' }, { status: 403 });
  if (Number(request.headers.get('content-length') || 0) > 80_000) return Response.json({ error: '程式碼或輸入資料過長。' }, { status: 413 });

  const limited = await consumeRequestLimit(request, identity.userId, 'playground', 20, 60_000);
  if (limited) return limited;

  let body: { language?: string; source?: string; stdin?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '資料格式錯誤。' }, { status: 400 });
  }

  if (!(body.language && body.language in languageIds)) return Response.json({ error: '目前支援 C、C++、Python 與 SQL。' }, { status: 400 });
  if (typeof body.source !== 'string' || !body.source.trim() || body.source.length > 60_000) return Response.json({ error: '請輸入有效且不超過 60,000 字元的程式碼。' }, { status: 400 });
  if (typeof body.stdin !== 'string' || body.stdin.length > 10_000) return Response.json({ error: '標準輸入不可超過 10,000 字元。' }, { status: 400 });

  const language = body.language as PlaygroundLanguage;
  const runtime = env as unknown as Record<string, string | undefined>;
  const primary = (runtime.JUDGE0_API_URL || 'https://ce.judge0.com').replace(/\/$/, '');
  const fallback = runtime.JUDGE0_FALLBACK_API_URL?.replace(/\/$/, '');
  const endpoints = Array.from(new Set([primary, fallback].filter((value): value is string => Boolean(value))));
  const authHeader = runtime.JUDGE0_AUTH_HEADER?.trim();
  const authToken = runtime.JUDGE0_AUTH_TOKEN?.trim();
  const headers = authHeader && authToken ? { [authHeader]: authToken } : {};
  let lastError: unknown;

  for (const endpoint of endpoints) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    try {
      const response = await fetch(`${endpoint}/submissions?base64_encoded=false&wait=true`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json', ...headers },
        body: JSON.stringify({
          language_id: languageIds[language],
          source_code: body.source,
          stdin: body.stdin,
          cpu_time_limit: 3,
          wall_time_limit: 6,
          memory_limit: 256000,
          enable_network: false,
        }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Judge service returned ${response.status}`);
      const result = await response.json() as JudgeResult;
      return Response.json({
        status: result.status?.description || 'Unknown',
        stdout: clean(result.stdout),
        error: clean(result.compile_output || result.stderr || result.message),
        time: result.time || null,
        memory: result.memory || null,
        engine: endpoint === primary && runtime.JUDGE0_API_URL ? 'CodeDive Judge0' : 'Judge0 CE sandbox',
      });
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timeout);
    }
  }

  const message = lastError instanceof Error && lastError.name === 'AbortError'
    ? '執行服務逾時，請縮小程式或稍後再試。'
    : '程式實驗室暫時無法連線，程式碼仍保留在編輯器。';
  return Response.json({ error: message }, { status: 503 });
}
