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

// ── Inlined: boi-api ──
interface BoiObservation { timePeriod: string; obsValue: number | null; }

async function fetchBoiMortgageRate(seriesKey: string): Promise<string> {
  const url = `https://edge.boi.gov.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/BIR_MRTG_99/1.0/${seriesKey}.M.99034?format=csv&lastNObservations=3`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`BOI mortgage API returned ${response.status} for series ${seriesKey}`);
  return response.text();
}

function parseBoiCsv(csv: string): BoiObservation[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];
  const header = lines[0].split(',');
  const timeIdx = header.indexOf('TIME_PERIOD');
  const valueIdx = header.indexOf('OBS_VALUE');
  if (timeIdx === -1 || valueIdx === -1) return [];
  const results: BoiObservation[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length <= Math.max(timeIdx, valueIdx)) continue;
    const obsValue = parseFloat(cols[valueIdx]);
    if (isNaN(obsValue)) continue;
    results.push({ timePeriod: cols[timeIdx], obsValue });
  }
  return results;
}

function parseBoiMortgageCsv(csv: string, nullifyZero = false): BoiObservation[] {
  const observations = parseBoiCsv(csv);
  if (!nullifyZero) return observations;
  return observations.map(obs => ({ ...obs, obsValue: obs.obsValue === 0 ? null : obs.obsValue }));
}

// ── Anomaly bounds ──
async function logAnomaly(
  supabase: SupabaseClient,
  source: string,
  description: string,
  severity: 'warning' | 'critical',
  data: any,
) {
  await supabase.from('anomaly_log').insert({ source, description, severity, data });
}

// ── Handler ──

// 10 sequential BOI API calls can exceed Vercel's 10s default; allow up to 60s
export const config = { maxDuration: 60 };

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

export async function GET(req: Request) {
  const authError = verifyCronAuth(req.headers);
  if (authError) return authError;

  const timestamp = new Date().toISOString();
  const results: Record<string, any> = {};
  const errors: string[] = [];
  const anomalies: string[] = [];
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

            // Anomaly bounds: rate between 0% and 12%
            if (obs.obsValue !== null) {
              if (obs.obsValue < 0 || obs.obsValue > 12) {
                const desc = `${series.trackLabel} rate ${obs.obsValue}% outside bounds [0–12%]`;
                anomalies.push(desc);
                await logAnomaly(supabase, 'mortgage_rates', desc, 'critical',
                  { series_key: series.seriesKey, track: series.trackLabel, period: obsPeriod, value: obs.obsValue });
              }

              // MoM change < 1.5 percentage points — check against previous value in DB
              if (latestPeriod) {
                const { data: prevRow } = await supabase
                  .from('mortgage_rates')
                  .select('value')
                  .eq('series_key', series.seriesKey)
                  .eq('period', `${latestPeriod}-01`)
                  .maybeSingle();

                if (prevRow?.value !== null && prevRow?.value !== undefined) {
                  const momChange = Math.abs(obs.obsValue - prevRow.value);
                  if (momChange > 1.5) {
                    const desc = `${series.trackLabel} MoM change: ${momChange.toFixed(2)}pp (threshold: 1.5pp)`;
                    anomalies.push(desc);
                    await logAnomaly(supabase, 'mortgage_rates', desc, 'warning',
                      { series_key: series.seriesKey, track: series.trackLabel, period: obsPeriod, current: obs.obsValue, previous: prevRow.value });
                  }
                }
              }
            }
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
        if (err.message?.includes('404')) {
          await logAnomaly(supabase, 'mortgage-rates', `BOI API returned 404 for series ${series.seriesKey}`, 'critical',
            { series_key: series.seriesKey, track: series.trackLabel, error: err.message, timestamp });
        }
      }
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ job: 'mortgage-rates', timestamp, error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ job: 'mortgage-rates', timestamp, results, totalInserted, errors, anomalies }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
}
