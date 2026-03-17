import { verifyCronAuth } from '../lib/cron-auth';
import { getSupabaseAdmin } from '../lib/supabase-admin';
import { fetchCbsPriceIndex, parsePriceIndexResponse } from '../lib/cbs-api';

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

export default async function handler(req: Request) {
  const authError = verifyCronAuth(req.headers);
  if (authError) return authError;

  const timestamp = new Date().toISOString();
  const results: Record<string, any> = {};
  const errors: string[] = [];
  let totalInserted = 0;

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

        const { data: latestRows } = await supabase
          .from('price_indices')
          .select('year, month')
          .eq('index_code', dbCode)
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
        };
      } catch (err: any) {
        errors.push(`${dbCode}: ${err.message}`);
        results[dbCode] = { error: err.message };
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
