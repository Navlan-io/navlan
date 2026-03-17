// Test: static imports to verify includeFiles config works
import { verifyCronAuth } from '../lib/cron-auth';
import { getSupabaseAdmin } from '../lib/supabase-admin';

export function GET(req: Request) {
  try {
    const authResult = verifyCronAuth(req.headers);
    const sb = getSupabaseAdmin();
    return new Response(JSON.stringify({
      ok: true,
      authBlocked: !!authResult,
      hasClient: !!sb,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
