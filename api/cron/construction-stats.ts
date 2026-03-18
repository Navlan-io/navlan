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

interface CbsTimePeriod { year: number; month: number; quarter: number; }

async function fetchCbsTimeSeries(seriesId: number, last = 6): Promise<any> {
  const url = `https://apis.cbs.gov.il/series/data/list?id=${seriesId}&format=json&lang=en&last=${last}`;
  const response = await fetch(url, { headers: { 'User-Agent': CBS_USER_AGENT } });
  if (!response.ok) throw new Error(`CBS time series API returned ${response.status} for series ${seriesId}`);
  return response.json();
}

function parseTimeSeriesPeriod(period: string): CbsTimePeriod | null {
  if (!period) return null;
  const qMatch = period.match(/^(\d{4})-Q(\d)$/);
  if (qMatch) return { year: parseInt(qMatch[1]), month: 0, quarter: parseInt(qMatch[2]) };
  const mMatch = period.match(/^(\d{4})-(\d{2})$/);
  if (mMatch) return { year: parseInt(mMatch[1]), month: parseInt(mMatch[2]), quarter: 0 };
  return null;
}

function extractTimeSeriesObservations(data: any): { period: string; value: number }[] {
  if (!data) return [];
  try {
    const series = data?.DataSet?.[0]?.Series;
    if (Array.isArray(series)) {
      const obs: { period: string; value: number }[] = [];
      for (const s of series) {
        if (Array.isArray(s.obs)) {
          for (const o of s.obs) {
            const period = o.TimePeriod ?? o.TIME_PERIOD;
            const value = parseFloat(o.ObsValue ?? o.OBS_VALUE);
            if (period && !isNaN(value)) obs.push({ period, value });
          }
        }
      }
      if (obs.length > 0) return obs;
    }
  } catch { /* try next format */ }
  if (Array.isArray(data)) {
    return data.filter((d: any) => d.period && typeof d.value === 'number')
      .map((d: any) => ({ period: d.period, value: d.value }));
  }
  return [];
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

// 6 sequential CBS API calls can exceed Vercel's 10s default; allow up to 60s
export const config = { maxDuration: 60 };

interface ConstructionSeries {
  seriesId: number;
  metric: string;
  dataType: string;
}

const CONSTRUCTION_SERIES: ConstructionSeries[] = [
  { seriesId: 574362, metric: 'unsold_inventory', dataType: 'monthly' },
  { seriesId: 574500, metric: 'months_supply', dataType: 'monthly' },
  { seriesId: 574272, metric: 'construction_starts', dataType: 'monthly' },
  { seriesId: 574280, metric: 'construction_completions', dataType: 'monthly' },
  { seriesId: 574325, metric: 'construction_permits', dataType: 'monthly' },
  { seriesId: 574320, metric: 'under_construction', dataType: 'quarterly' },
];

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

    for (const series of CONSTRUCTION_SERIES) {
      try {
        const rawResponse = await fetchCbsTimeSeries(series.seriesId);
        const observations = extractTimeSeriesObservations(rawResponse);

        if (observations.length === 0) {
          results[series.seriesId] = { skipped: true, reason: 'No data from CBS API' };
          continue;
        }

        const { data: latestRows } = await supabase
          .from('construction_stats')
          .select('year, month, quarter')
          .eq('series_id', series.seriesId)
          .order('year', { ascending: false })
          .order('month', { ascending: false })
          .order('quarter', { ascending: false })
          .limit(1);

        const latestRow = latestRows?.[0];
        const latestYMQ = latestRow
          ? latestRow.year * 1000 + (latestRow.month ?? 0) * 10 + (latestRow.quarter ?? 0)
          : 0;

        let inserted = 0;
        for (const obs of observations) {
          const period = parseTimeSeriesPeriod(obs.period);
          if (!period) continue;

          const obsYMQ = period.year * 1000 + period.month * 10 + period.quarter;
          if (obsYMQ <= latestYMQ) continue;

          const { error: upsertError } = await supabase
            .from('construction_stats')
            .upsert({
              series_id: series.seriesId,
              metric: series.metric,
              district: 'National',
              year: period.year,
              month: period.month,
              quarter: period.quarter,
              value: obs.value,
              data_type: series.dataType,
              fetched_at: timestamp,
            }, { onConflict: 'series_id,year,month,quarter' });

          if (upsertError) {
            errors.push(`${series.seriesId}: upsert failed for ${obs.period} — ${upsertError.message}`);
          } else {
            inserted++;

            // Anomaly bounds: no negative values
            if (obs.value < 0) {
              const desc = `${series.metric} has negative value: ${obs.value} for ${obs.period}`;
              anomalies.push(desc);
              await logAnomaly(supabase, 'construction_stats', desc, 'critical',
                { series_id: series.seriesId, metric: series.metric, period: obs.period, value: obs.value });
            }

            // MoM change < 50% — check against latest value in DB
            if (latestRow) {
              const { data: prevValueRow } = await supabase
                .from('construction_stats')
                .select('value')
                .eq('series_id', series.seriesId)
                .eq('year', latestRow.year)
                .eq('month', latestRow.month ?? 0)
                .eq('quarter', latestRow.quarter ?? 0)
                .maybeSingle();

              if (prevValueRow?.value && prevValueRow.value > 0) {
                const change = Math.abs(obs.value - prevValueRow.value) / prevValueRow.value;
                if (change > 0.50) {
                  const desc = `${series.metric} change: ${(change * 100).toFixed(1)}% (threshold: 50%)`;
                  anomalies.push(desc);
                  await logAnomaly(supabase, 'construction_stats', desc, 'warning',
                    { series_id: series.seriesId, metric: series.metric, period: obs.period, current: obs.value, previous: prevValueRow.value });
                }
              }
            }
          }
        }

        totalInserted += inserted;
        results[series.seriesId] = {
          metric: series.metric,
          observationsFromCBS: observations.length,
          inserted,
        };
      } catch (err: any) {
        errors.push(`${series.seriesId} (${series.metric}): ${err.message}`);
        results[series.seriesId] = { error: err.message };
      }
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ job: 'construction-stats', timestamp, error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ job: 'construction-stats', timestamp, results, totalInserted, errors, anomalies }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
}
