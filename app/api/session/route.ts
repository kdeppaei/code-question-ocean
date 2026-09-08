import { getRequestIdentity, requestIsAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const identity = getRequestIdentity(request);
  return Response.json({
    authenticated: Boolean(identity),
    isAdmin: requestIsAdmin(request, identity),
    user: identity ? { email: identity.email, name: identity.fullName || identity.email.split('@')[0] } : null,
    signInPath: '/signin-with-chatgpt?return_to=/',
    signOutPath: '/signout-with-chatgpt?return_to=/',
  });
}
