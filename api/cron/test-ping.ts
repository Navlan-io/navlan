// Test: dynamic imports to find which module crashes at load time
export async function GET(req: Request) {
  const results: Record<string, string> = {};

  try {
    await import('../lib/cron-auth');
    results['cron-auth'] = 'OK';
  } catch (err: any) {
    results['cron-auth'] = `FAIL: ${err.message}`;
  }

  try {
    await import('../lib/supabase-admin');
    results['supabase-admin'] = 'OK';
  } catch (err: any) {
    results['supabase-admin'] = `FAIL: ${err.message}`;
  }

  try {
    await import('../lib/cbs-api');
    results['cbs-api'] = 'OK';
  } catch (err: any) {
    results['cbs-api'] = `FAIL: ${err.message}`;
  }

  try {
    await import('../lib/boi-api');
    results['boi-api'] = 'OK';
  } catch (err: any) {
    results['boi-api'] = `FAIL: ${err.message}`;
  }

  return new Response(JSON.stringify(results, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
