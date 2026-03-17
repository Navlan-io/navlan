import { verifyCronAuth } from '../lib/cron-auth';
import { getSupabaseAdmin } from '../lib/supabase-admin';
import { fetchCbsPriceIndex, parsePriceIndexResponse, normalizeConstructionCost } from '../lib/cbs-api';

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
