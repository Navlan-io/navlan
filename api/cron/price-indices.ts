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

// ── Handler ──

// 9 sequential CBS API calls can exceed Vercel's 10s default; allow up to 60s
export const config = { maxDuration: 60 };

const INDEX_CODES: { cbsCode: number; dbCode: number }[] = [
  { cbsCode: 40010, dbCode: 40010 },
  { cbsCode: 60000, dbCode: 60000 },
  { cbsCode: 60100, dbCode: 60100 },
  { cbsCode: 60200, dbCode: 60200 },
  { cbsCode: 60300, dbCode: 60300 },
  { cbsCode: 60400, dbCode: 60400 },
  { cbsCode: 60500, dbCode: 60500 },
  { cbsCode: 70000, dbCode: 70000 },
  { cbsCode: 120460, dbCode: 50010 },
];

export async function GET(req: Request) {
  const authError = verifyCronAuth(req.headers);
  if (authError) return authError;

  const timestamp = new Date().toISOString();
  const results: Record<string, any> = {};
  const errors: string[] = [];
  let totalInserted = 0;

  // 200010 (Construction Cost Index) has its own normalization in the
  // construction-costs cron — skip chain-linking for it entirely.
  const CHAIN_LINK_EXCLUDED = new Set([200010]);

  try {
    const supabase = getSupabaseAdmin();

    for (const { cbsCode, dbCode } of INDEX_CODES) {
      try {
        const rawResponse = await fetchCbsPriceIndex(cbsCode);
        const entries = parsePriceIndexResponse(rawResponse);

        if (entries.length === 0) {
          results[dbCode] = { skipped: true, reason: 'No data from CBS API' };
          continue;
        }

        // Fetch latest existing row (with base_desc) to detect base period changes
        const { data: latestRows } = await supabase
          .from('price_indices')
          .select('year, month, base_desc')
          .eq('index_code', dbCode)
          .order('year', { ascending: false })
          .order('month', { ascending: false })
          .limit(1);

        const latestYM = latestRows?.[0]
          ? latestRows[0].year * 100 + latestRows[0].month
          : 0;
        const existingBase = latestRows?.[0]?.base_desc ?? '';

        const newEntries = entries.filter(
          (e) => e.year * 100 + e.month > latestYM,
        );
        const incomingBase = newEntries[0]?.baseDesc ?? entries[entries.length - 1].baseDesc;
        let chainLinked = false;

        // Chain-link incoming values to match the existing DB base when CBS
        // changes base periods. Adjusts new values — never mutates historical rows.
        if (
          existingBase && incomingBase &&
          existingBase !== incomingBase &&
          !CHAIN_LINK_EXCLUDED.has(dbCode)
        ) {
          console.warn(
            `[price-indices] BASE PERIOD CHANGE detected for index ${dbCode}: ` +
            `"${existingBase}" → "${incomingBase}". Chain-linking incoming values to match existing base.`,
          );

          // Compute the conversion factor from the last 12 months of existing data.
          // mean(old base) / 100 converts new-base values → old-base scale.
          const { data: recentRows, error: recentErr } = await supabase
            .from('price_indices')
            .select('value')
            .eq('index_code', dbCode)
            .eq('base_desc', existingBase)
            .order('year', { ascending: false })
            .order('month', { ascending: false })
            .limit(12);

          if (!recentErr && recentRows && recentRows.length > 0) {
            const mean = recentRows.reduce((s, r) => s + r.value, 0) / recentRows.length;
            const factor = mean / 100;
            console.warn(
              `[price-indices]   Chain-linking ${dbCode}: mean(last ${recentRows.length} months)=${mean.toFixed(2)}, factor=${factor.toFixed(6)}`,
            );

            for (const entry of newEntries) {
              entry.value = Math.round(entry.value * factor * 10) / 10;
              entry.baseDesc = existingBase; // store under the existing base label
            }
            chainLinked = true;
          }
        }

        let inserted = 0;
        for (const entry of newEntries) {
          const { error: upsertError } = await supabase
            .from('price_indices')
            .upsert({
              index_code: dbCode,
              index_name: entry.name,
              year: entry.year,
              month: entry.month,
              value: entry.value,
              percent_mom: entry.percentMom,
              percent_yoy: entry.percentYoy,
              base_desc: entry.baseDesc,
              fetched_at: timestamp,
            }, { onConflict: 'index_code,year,month' });

          if (upsertError) {
            errors.push(`${dbCode}: upsert failed for ${entry.year}-${entry.month} — ${upsertError.message}`);
          } else {
            inserted++;
          }
        }

        totalInserted += inserted;
        const latestEntry = entries[entries.length - 1];
        results[dbCode] = {
          latestInDB: latestYM ? `${Math.floor(latestYM / 100)}-${String(latestYM % 100).padStart(2, '0')}` : null,
          latestFromCBS: `${latestEntry.year}-${String(latestEntry.month).padStart(2, '0')}`,
          inserted,
          ...(chainLinked ? { chainLinked: true, keptBase: existingBase } : {}),
        };
      } catch (err: any) {
        errors.push(`${dbCode}: ${err.message}`);
        results[dbCode] = { error: err.message };
      }
    }
    // Update market narrative after new data is inserted
    if (totalInserted > 0) {
      try {
        await updateMarketNarrative(supabase);
      } catch (err: any) {
        errors.push(`market_narrative: ${err.message}`);
      }
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ job: 'price-indices', timestamp, error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ job: 'price-indices', timestamp, results, totalInserted, errors }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
}

// ── Auto-generate market narrative for the AI Advisor ──

async function updateMarketNarrative(supabase: SupabaseClient) {
  const [indexRes, rateRes, inventoryRes] = await Promise.all([
    supabase.from('price_indices')
      .select('value, percent_yoy, year, month')
      .eq('index_code', 40010)
      .order('year', { ascending: false }).order('month', { ascending: false })
      .limit(1).single(),
    supabase.from('mortgage_rates')
      .select('value, period')
      .eq('track_type', 'non_indexed_fixed')
      .order('period', { ascending: false })
      .limit(1).single(),
    supabase.from('construction_stats')
      .select('value, year, month')
      .eq('series_id', 574362)
      .eq('metric', 'unsold_inventory')
      .order('year', { ascending: false }).order('month', { ascending: false })
      .limit(1).single(),
  ]);

  const latestIndex = indexRes.data as any;
  const latestRate = rateRes.data as any;
  const latestInventory = inventoryRes.data as any;

  if (!latestIndex || !latestRate || !latestInventory) return;

  const yoy = latestIndex.percent_yoy;
  const rate = latestRate.value;
  const inventory = latestInventory.value;

  let priceDirection = '';
  if (yoy > 3) priceDirection = 'Prices have been rising meaningfully';
  else if (yoy > 0.5) priceDirection = 'Prices have been climbing modestly';
  else if (yoy > -0.5) priceDirection = 'Prices have been essentially flat';
  else if (yoy > -3) priceDirection = 'Prices have softened slightly';
  else priceDirection = 'Prices have been declining';

  const narrative = `${priceDirection}, with the national index showing ${yoy > 0 ? '+' : ''}${yoy}% year-over-year. Non-indexed fixed mortgage rates are around ${rate}%. Unsold new construction inventory stands at approximately ${Math.round(inventory / 1000)}K units.`;

  let sentiment = 'stable';
  if (yoy > 3) sentiment = 'heating';
  else if (yoy < -1) sentiment = 'cooling';

  const now = new Date().toISOString();

  await supabase.from('market_context')
    .upsert({ field: 'narrative', value: narrative, updated_at: now }, { onConflict: 'field' });
  await supabase.from('market_context')
    .upsert({ field: 'buyer_sentiment', value: sentiment, updated_at: now }, { onConflict: 'field' });
}
