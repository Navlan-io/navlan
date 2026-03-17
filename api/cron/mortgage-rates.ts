import { verifyCronAuth } from '../lib/cron-auth';
import { getSupabaseAdmin } from '../lib/supabase-admin';
import { fetchBoiMortgageRate, parseBoiMortgageCsv } from '../lib/boi-api';

interface MortgageSeries {
  seriesKey: string;
  trackType: string;
  trackLabel: string;
  rateType: string;
  nullifyZero: boolean;
}

const MORTGAGE_SERIES: MortgageSeries[] = [
  { seriesKey: 'BNK_99034_LR_BIR_MRTG_462', trackType: 'non_indexed_combined', trackLabel: 'Non-indexed combined', rateType: 'rate', nullifyZero: false },
  { seriesKey: 'BNK_99034_LR_BIR_MRTG_467', trackType: 'non_indexed_fixed', trackLabel: 'Non-indexed fixed', rateType: 'rate', nullifyZero: false },
  { seriesKey: 'BNK_99034_LR_BIR_MRTG_464', trackType: 'prime_variable', trackLabel: 'Prime margin', rateType: 'margin', nullifyZero: false },
  { seriesKey: 'BNK_99034_LR_BIR_MRTG_348', trackType: 'prime_variable', trackLabel: 'Prime benchmark', rateType: 'benchmark', nullifyZero: false },
  { seriesKey: 'BNK_99034_LR_BIR_MRTG_1485', trackType: 'cpi_combined', trackLabel: 'CPI-indexed combined', rateType: 'rate', nullifyZero: false },
  { seriesKey: 'BNK_99034_LR_BIR_MRTG_1492', trackType: 'cpi_fixed', trackLabel: 'CPI-indexed fixed', rateType: 'rate', nullifyZero: false },
  { seriesKey: 'BNK_99034_LR_BIR_MRTG_1489', trackType: 'cpi_variable', trackLabel: 'CPI variable benchmark', rateType: 'benchmark', nullifyZero: false },
  { seriesKey: 'BNK_99034_LR_BIR_MRTG_1488', trackType: 'cpi_variable', trackLabel: 'CPI variable margin', rateType: 'margin', nullifyZero: false },
  { seriesKey: 'BNK_99034_LR_BIR_MRTG_689', trackType: 'fx_indexed', trackLabel: 'FX-indexed combined', rateType: 'rate', nullifyZero: false },
  { seriesKey: 'BNK_99034_LR_BIR_MRTG_694', trackType: 'fx_indexed', trackLabel: 'FX-indexed fixed', rateType: 'rate', nullifyZero: true },
];

function normalizePeriod(period: string): string {
  if (period.length === 10) return period.substring(0, 7);
  return period;
}

export default async function handler(req: Request) {
  const authError = verifyCronAuth(req.headers);
  if (authError) return authError;

  const timestamp = new Date().toISOString();
  const results: Record<string, any> = {};
  const errors: string[] = [];
  let totalInserted = 0;

  try {
    const supabase = getSupabaseAdmin();

    for (const series of MORTGAGE_SERIES) {
      try {
        const csv = await fetchBoiMortgageRate(series.seriesKey);
        const observations = parseBoiMortgageCsv(csv, series.nullifyZero);

        if (observations.length === 0) {
          results[series.seriesKey] = { skipped: true, reason: 'No data from BOI API' };
          continue;
        }

        const { data: latestRows } = await supabase
          .from('mortgage_rates')
          .select('period')
          .eq('series_key', series.seriesKey)
          .order('period', { ascending: false })
          .limit(1);

        const latestPeriodRaw = latestRows?.[0]?.period ?? '';
        const latestPeriod = normalizePeriod(latestPeriodRaw);

        let inserted = 0;
        for (const obs of observations) {
          const obsPeriod = normalizePeriod(obs.timePeriod);
          if (obsPeriod <= latestPeriod) continue;

          const periodDate = `${obsPeriod}-01`;

          const { error: upsertError } = await supabase
            .from('mortgage_rates')
            .upsert({
              series_key: series.seriesKey,
              track_type: series.trackType,
              track_label: series.trackLabel,
              rate_type: series.rateType,
              period: periodDate,
              value: obs.obsValue,
              fetched_at: timestamp,
            }, { onConflict: 'series_key,period' });

          if (upsertError) {
            errors.push(`${series.seriesKey}: upsert failed for ${obsPeriod} — ${upsertError.message}`);
          } else {
            inserted++;
          }
        }

        totalInserted += inserted;
        results[series.seriesKey] = {
          latestInDB: latestPeriod || null,
          latestFromBOI: normalizePeriod(observations[observations.length - 1].timePeriod),
          inserted,
        };
      } catch (err: any) {
        errors.push(`${series.seriesKey}: ${err.message}`);
        results[series.seriesKey] = { error: err.message };
      }
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ job: 'mortgage-rates', timestamp, error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ job: 'mortgage-rates', timestamp, results, totalInserted, errors }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
}
