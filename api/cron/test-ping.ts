// Minimal test function to diagnose Vercel function invocation issues
export function GET(req: Request) {
  return new Response(JSON.stringify({ ok: true, time: new Date().toISOString() }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
