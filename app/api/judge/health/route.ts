import { env } from 'cloudflare:workers';

export const dynamic = 'force-dynamic';

async function probe(endpoint: string, headers: Record<string, string>) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);
  try {
    const response = await fetch(`${endpoint}/languages`, { headers: { accept: 'application/json', ...headers }, signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  const runtime = env as unknown as Record<string, string | undefined>;
  const primary = (runtime.JUDGE0_API_URL || 'https://ce.judge0.com').replace(/\/$/, '');
  const fallback = runtime.JUDGE0_FALLBACK_API_URL?.replace(/\/$/, '');
  const authHeader = runtime.JUDGE0_AUTH_HEADER?.trim();
  const authToken = runtime.JUDGE0_AUTH_TOKEN?.trim();
  const headers = authHeader && authToken ? { [authHeader]: authToken } : {};
  const primaryOnline = await probe(primary, headers);
  if (primaryOnline) return Response.json({ online: true, engine: runtime.JUDGE0_API_URL ? 'CodeDive 私人沙箱' : 'Judge0 CE', fallback: false }, { headers: { 'Cache-Control': 'public, max-age=60' } });
  if (fallback && await probe(fallback, {})) return Response.json({ online: true, engine: 'Judge0 備援沙箱', fallback: true }, { headers: { 'Cache-Control': 'public, max-age=30' } });
  return Response.json({ online: false, engine: '判題服務離線', fallback: false }, { status: 503, headers: { 'Cache-Control': 'public, max-age=15' } });
}
