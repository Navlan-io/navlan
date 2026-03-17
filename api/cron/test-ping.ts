// Test: import supabase-admin and cbs-api to find which import crashes
import { verifyCronAuth } from '../lib/cron-auth';
import { getSupabaseAdmin } from '../lib/supabase-admin';
import { fetchCbsPriceIndex, parsePriceIndexResponse } from '../lib/cbs-api';

export function GET(req: Request) {
  try {
    const sb = getSupabaseAdmin();
    return new Response(JSON.stringify({ ok: true, imports: 'all loaded', hasClient: !!sb }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message, stack: err.stack }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
