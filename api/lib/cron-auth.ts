/**
 * Verify that the request comes from Vercel's cron scheduler.
 * Returns null if authorized, or a 401 Response if not.
 *
 * All cron handlers use the Web Request/Response API (not VercelRequest).
 */
export function verifyCronAuth(headers: Headers): Response | null {
  const authHeader = headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}
