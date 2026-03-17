import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xkgsgswxauguhyucauxg.supabase.co';

let cachedClient: SupabaseClient | null = null;

/**
 * Supabase client with service role key — bypasses RLS for write operations.
 * Only use in server-side code (cron jobs, API routes).
 * Client is cached at module level (one per serverless function cold start).
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  cachedClient = createClient(SUPABASE_URL, serviceRoleKey, {
    auth: { persistSession: false },
  });
  return cachedClient;
}
