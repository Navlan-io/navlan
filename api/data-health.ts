import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ── Inlined: supabase-admin ──
const SUPABASE_URL = 'https://xkgsgswxauguhyucauxg.supabase.co';
let cachedClient: SupabaseClient | null = null;
function getSupabaseAdmin(): SupabaseClient {
  if (cachedClient) return cachedClient;
  const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!anonKey) throw new Error('VITE_SUPABASE_PUBLISHABLE_KEY is not set');
  cachedClient = createClient(SUPABASE_URL, anonKey, { auth: { persistSession: false } });
  return cachedClient;
}

// ── Edge runtime is fine for read-only queries ──
export const config = { runtime: 'edge' };

// ── Table health definitions ──
interface TableCheck {
  name: string;
  query: string;
  maxAgeDays: number;
  minRows?: number;
  parseLatest: (value: any) => { label: string; date: Date } | null;
}

const TABLE_CHECKS: TableCheck[] = [
  {
    name: 'exchange_rates',
    query: 'rate_date',
    maxAgeDays: 10,
    parseLatest: (rows: any[]) => {
      if (!rows?.[0]) return null;
      const d = rows[0].rate_date;
      return { label: d, date: new Date(d) };
    },
  },
  {
    name: 'price_indices',
    query: 'year,month',
    maxAgeDays: 120,
    parseLatest: (rows: any[]) => {
      if (!rows?.[0]) return null;
      const { year, month } = rows[0];
      const label = `${year}-${String(month).padStart(2, '0')}`;
      return { label, date: new Date(year, month - 1, 15) };
    },
  },
  {
    name: 'mortgage_rates',
    query: 'period',
    maxAgeDays: 90,
    parseLatest: (rows: any[]) => {
      if (!rows?.[0]) return null;
      const p = rows[0].period;
      return { label: p.substring(0, 7), date: new Date(p) };
    },
  },
  {
    name: 'construction_stats',
    query: 'year,month,quarter',
    maxAgeDays: 120,
    parseLatest: (rows: any[]) => {
      if (!rows?.[0]) return null;
      const { year, month, quarter } = rows[0];
      const effectiveMonth = month || quarter * 3;
      const label = `${year}-${String(effectiveMonth).padStart(2, '0')}`;
      return { label, date: new Date(year, effectiveMonth - 1, 15) };
    },
  },
  {
    name: 'construction_costs',
    query: 'year,month',
    maxAgeDays: 90,
    parseLatest: (rows: any[]) => {
      if (!rows?.[0]) return null;
      const { year, month } = rows[0];
      const label = `${year}-${String(month).padStart(2, '0')}`;
      return { label, date: new Date(year, month - 1, 15) };
    },
  },
  {
    name: 'city_prices',
    query: 'period',
    maxAgeDays: 180,
    parseLatest: (rows: any[]) => {
      if (!rows?.[0]) return null;
      const p = rows[0].period;
      // Period format: Q1-2025
      const match = p.match(/^Q(\d)-(\d{4})$/);
      if (!match) return { label: p, date: new Date() };
      const q = parseInt(match[1]);
      const y = parseInt(match[2]);
      return { label: p, date: new Date(y, (q - 1) * 3 + 2, 15) };
    },
  },
  {
    name: 'city_rentals',
    query: 'period',
    maxAgeDays: 180,
    parseLatest: (rows: any[]) => {
      if (!rows?.[0]) return null;
      const p = rows[0].period;
      const match = p.match(/^Q(\d)-(\d{4})$/);
      if (!match) return { label: p, date: new Date() };
      const q = parseInt(match[1]);
      const y = parseInt(match[2]);
      return { label: p, date: new Date(y, (q - 1) * 3 + 2, 15) };
    },
  },
  {
    name: 'population_data',
    query: 'year',
    maxAgeDays: 400,
    minRows: 20,
    parseLatest: (rows: any[]) => {
      if (!rows?.[0]) return null;
      const year = rows[0].year;
      return { label: String(year), date: new Date(year, 6, 1) };
    },
  },
];

function getStatus(ageDays: number, maxAgeDays: number): 'fresh' | 'aging' | 'stale' {
  if (ageDays > maxAgeDays) return 'stale';
  if (ageDays > maxAgeDays * 0.75) return 'aging';
  return 'fresh';
}

export async function GET() {
  const now = new Date();
  const checkedAt = now.toISOString();

  try {
    const supabase = getSupabaseAdmin();
    const tables: Record<string, any> = {};
    let hasStale = false;

    for (const check of TABLE_CHECKS) {
      try {
        let query = supabase.from(check.name).select(check.query);

        // Apply filters and ordering based on table
        if (check.name === 'price_indices') {
          query = query.eq('index_code', 40010).order('year', { ascending: false }).order('month', { ascending: false });
        } else if (check.name === 'construction_stats') {
          query = query.order('year', { ascending: false }).order('month', { ascending: false }).order('quarter', { ascending: false });
        } else if (check.name === 'construction_costs') {
          query = query.order('year', { ascending: false }).order('month', { ascending: false });
        } else if (check.name === 'exchange_rates') {
          query = query.order('rate_date', { ascending: false });
        } else if (check.name === 'mortgage_rates') {
          query = query.order('period', { ascending: false });
        } else if (check.name === 'population_data') {
          query = query.order('year', { ascending: false });
        } else if (check.name === 'city_prices' || check.name === 'city_rentals') {
          query = query.like('period', 'Q%').order('period', { ascending: false });
        }

        const { data: rows, error } = await query.limit(1);

        if (error) {
          tables[check.name] = { status: 'error', error: error.message };
          continue;
        }

        const latest = check.parseLatest(rows);
        if (!latest) {
          tables[check.name] = { latest: null, age_days: null, max_age_days: check.maxAgeDays, status: 'error' };
          continue;
        }

        const ageDays = Math.floor((now.getTime() - latest.date.getTime()) / (1000 * 60 * 60 * 24));
        const status = getStatus(ageDays, check.maxAgeDays);
        if (status === 'stale') hasStale = true;

        const entry: Record<string, any> = {
          latest: latest.label,
          age_days: ageDays,
          max_age_days: check.maxAgeDays,
          status,
        };

        // Check minimum row count if specified
        if (check.minRows) {
          const { count, error: countError } = await supabase
            .from(check.name)
            .select('*', { count: 'exact', head: true });

          const rowCount = countError ? 0 : (count ?? 0);
          entry.row_count = rowCount;
          entry.min_rows = check.minRows;
          if (rowCount < check.minRows) {
            entry.status = 'stale';
            hasStale = true;
          }
        }

        tables[check.name] = entry;
      } catch (err: any) {
        tables[check.name] = { status: 'error', error: err.message };
      }
    }

    // Check site_parameters for stale verifications
    try {
      const currentMonth = now.getMonth() + 1; // 1-12
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

      const { data: allParams } = await supabase
        .from('site_parameters')
        .select('key, last_verified, check_month, source');

      const staleParams = (allParams || []).filter((p: any) => {
        const lastVerified = new Date(p.last_verified);

        // Month-specific check: if we're in the check_month and it hasn't been verified this year
        if (p.check_month && p.check_month === currentMonth) {
          return lastVerified.getFullYear() < now.getFullYear() ||
                 (lastVerified.getFullYear() === now.getFullYear() && lastVerified.getMonth() + 1 < currentMonth);
        }

        // Standard 90-day check
        return lastVerified < ninetyDaysAgo;
      });

      if (staleParams.length > 0) {
        tables['site_parameters'] = {
          status: 'warning',
          message: `${staleParams.length} parameters need verification`,
          details: staleParams.map((p: any) =>
            p.check_month === currentMonth
              ? `${p.key} (monthly check — due this month)`
              : `${p.key} (90+ days since last verification)`
          ),
        };
      } else {
        tables['site_parameters'] = { status: 'fresh', message: 'All parameters verified' };
      }
    } catch (err: any) {
      tables['site_parameters'] = { status: 'error', error: err.message };
    }

    // Check staging tables for pending rows
    for (const stagingTable of ['city_prices_staging', 'city_rentals_staging']) {
      try {
        const { count, error } = await supabase
          .from(stagingTable)
          .select('*', { count: 'exact', head: true });

        tables[stagingTable] = { pending_rows: error ? 0 : (count ?? 0) };
      } catch {
        tables[stagingTable] = { pending_rows: 0 };
      }
    }

    // Check anomaly log for unresolved entries
    try {
      const { count, error } = await supabase
        .from('anomaly_log')
        .select('*', { count: 'exact', head: true })
        .eq('resolved', false);

      tables['anomaly_log'] = { unresolved_count: error ? 0 : (count ?? 0) };
    } catch {
      tables['anomaly_log'] = { unresolved_count: 0 };
    }

    const overall = hasStale ? 'degraded' : 'healthy';

    return new Response(JSON.stringify({ checked_at: checkedAt, tables, overall }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ checked_at: checkedAt, error: err.message, overall: 'error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
