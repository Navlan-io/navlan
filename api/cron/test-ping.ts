// Test: same-directory import from _helpers.ts
import { verifyCronAuth } from './_helpers';

export function GET(req: Request) {
  const authError = verifyCronAuth(req.headers);
  if (authError) return authError;

  return new Response(JSON.stringify({ ok: true, sameDirectoryImport: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
