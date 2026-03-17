// Test: static import from ../lib/ to verify cross-directory imports
import { verifyCronAuth } from '../lib/cron-auth';

export function GET(req: Request) {
  const authError = verifyCronAuth(req.headers);
  if (authError) return authError;

  return new Response(JSON.stringify({ ok: true, importWorked: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
