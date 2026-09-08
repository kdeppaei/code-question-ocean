import { env } from 'cloudflare:workers';

export type RequestIdentity = {
  userId: string;
  email: string;
  fullName: string;
};

function decodeFullName(request: Request) {
  const encoded = request.headers.get('oai-authenticated-user-full-name');
  const encoding = request.headers.get('oai-authenticated-user-full-name-encoding');
  if (!encoded || encoding !== 'percent-encoded-utf-8') return '';
  try {
    return decodeURIComponent(encoded);
  } catch {
    return '';
  }
}

export function getRequestIdentity(request: Request): RequestIdentity | null {
  const userId = request.headers.get('oai-authenticated-user-id');
  const email = request.headers.get('oai-authenticated-user-email') || '';
  if (userId) return { userId, email, fullName: decodeFullName(request) };

  const hostname = new URL(request.url).hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return { userId: 'local-preview', email: 'local@preview', fullName: 'Local Admin' };
  }
  return null;
}

export function requestIsAdmin(request: Request, identity = getRequestIdentity(request)) {
  if (!identity) return false;
  const hostname = new URL(request.url).hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
  const runtime = env as unknown as Record<string, string | undefined>;
  const allowedEmails = (runtime.ADMIN_EMAIL || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(identity.email) && allowedEmails.includes(identity.email.toLowerCase());
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}
