// Test: node_modules import (supabase) to verify npm deps work
import { createClient } from '@supabase/supabase-js';

export function GET(req: Request) {
  try {
    const sb = createClient(
      'https://xkgsgswxauguhyucauxg.supabase.co',
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'missing'
    );
    return new Response(JSON.stringify({ ok: true, hasSupabase: !!sb }), {
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
