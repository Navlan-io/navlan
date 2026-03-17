import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ── Inlined: cron-auth ──
function verifyCronAuth(headers: Headers): Response | null {
  const authHeader = headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}

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

// ── Inlined: cbs-api ──
const CBS_USER_AGENT = 'Navlan/1.0';

interface CbsPriceIndexEntry {
  code: number; name: string; year: number; month: number;
  value: number; percentMom: number | null; percentYoy: number | null; baseDesc: string;
}

async function fetchCbsPriceIndex(code: number, last = 3): Promise<any> {
  const url = `https://api.cbs.gov.il/index/data/price?id=${code}&format=json&lang=en&last=${last}`;
  const response = await fetch(url, { headers: { 'User-Agent': CBS_USER_AGENT } });
  if (!response.ok) throw new Error(`CBS price index API returned ${response.status} for code ${code}`);
  return response.json();
}

function parsePriceIndexResponse(data: any): CbsPriceIndexEntry[] {
  if (!data?.month?.length) return [];
  const entries: CbsPriceIndexEntry[] = [];
  for (const series of data.month) {
    if (!series.date?.length) continue;
    for (const d of series.date) {
      entries.push({
        code: series.code, name: series.name, year: d.year, month: d.month,
        value: d.currBase?.value ?? 0, percentMom: d.percent ?? null,
        percentYoy: d.percentYear ?? null, baseDesc: d.currBase?.baseDesc ?? '',
      });
    }
  }
  return entries;
}

const CONSTRUCTION_COST_NORMALIZATION_FACTOR = 1.387;
function normalizeConstructionCost(year: number, month: number, rawValue: number): number {
  if (year > 2025 || (year === 2025 && month >= 8)) return rawValue * CONSTRUCTION_COST_NORMALIZATION_FACTOR;
  return rawValue;
}

// ── Handler ──
const CONSTRUCTION_COST_CODE = 200010;

export async function GET(req: Request) {
  const authError = verifyCronAuth(req.headers);
  if (authError) return authError;

  const timestamp = new Date().toISOString();
  const errors: string[] = [];
  let totalInserted = 0;

  try {
    const supabase = getSupabaseAdmin();

    const rawResponse = await fetchCbsPriceIndex(CONSTRUCTION_COST_CODE);
    const entries = parsePriceIndexResponse(rawResponse);

    if (entries.length === 0) {
      return new Response(JSON.stringify({
        job: 'construction-costs', timestamp,
        results: { skipped: true, reason: 'No data from CBS API' },
        totalInserted: 0, errors,
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const { data: latestRows } = await supabase
      .from('construction_costs')
      .select('year, month')
      .eq('index_code', CONSTRUCTION_COST_CODE)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(1);

    const latestYM = latestRows?.[0]
      ? latestRows[0].year * 100 + latestRows[0].month
      : 0;

    let inserted = 0;
    for (const entry of entries) {
      const entryYM = entry.year * 100 + entry.month;
      if (entryYM <= latestYM) continue;

      const normalizedValue = normalizeConstructionCost(entry.year, entry.month, entry.value);

      const { error: upsertError } = await supabase
        .from('construction_costs')
        .upsert({
          index_code: CONSTRUCTION_COST_CODE,
          index_name: entry.name,
          year: entry.year,
          month: entry.month,
          value: normalizedValue,
          percent_mom: entry.percentMom,
          percent_yoy: entry.percentYoy,
          fetched_at: timestamp,
        }, { onConflict: 'index_code,year,month' });

      if (upsertError) {
        errors.push(`Upsert failed for ${entry.year}-${entry.month}: ${upsertError.message}`);
      } else {
        inserted++;
      }
    }

    totalInserted = inserted;
    const latestEntry = entries[entries.length - 1];

    return new Response(JSON.stringify({
      job: 'construction-costs', timestamp,
      results: {
        latestInDB: latestYM ? `${Math.floor(latestYM / 100)}-${String(latestYM % 100).padStart(2, '0')}` : null,
        latestFromCBS: `${latestEntry.year}-${String(latestEntry.month).padStart(2, '0')}`,
        inserted: totalInserted,
      },
      totalInserted, errors,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ job: 'construction-costs', timestamp, error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
