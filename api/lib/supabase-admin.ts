import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xkgsgswxauguhyucauxg.supabase.co';

let cachedClient: SupabaseClient | null = null;

/**
 * Supabase client using the anon (publishable) key with RLS policies.
 * RLS INSERT/UPDATE policies are configured on all target tables.
 * Only use in server-side code (cron jobs, API routes).
 * Client is cached at module level (one per serverless function cold start).
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!anonKey) {
    throw new Error('VITE_SUPABASE_PUBLISHABLE_KEY is not set');
  }

  cachedClient = createClient(SUPABASE_URL, anonKey, {
    auth: { persistSession: false },
  });
  return cachedClient;
}
