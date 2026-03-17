// Test: inline the auth check (no external imports) to verify the function pattern works
function verifyCronAuth(headers: Headers): Response | null {
  const authHeader = headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}

export function GET(req: Request) {
  const authError = verifyCronAuth(req.headers);
  if (authError) return authError;

  return new Response(JSON.stringify({
    ok: true,
    env: {
      hasCronSecret: !!process.env.CRON_SECRET,
      hasSupabaseKey: !!process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
