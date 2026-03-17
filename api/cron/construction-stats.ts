import { verifyCronAuth } from '../lib/cron-auth';
import { getSupabaseAdmin } from '../lib/supabase-admin';
import { fetchCbsTimeSeries, parseTimeSeriesPeriod, extractTimeSeriesObservations } from '../lib/cbs-api';

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

export default async function handler(req: Request) {
  const authError = verifyCronAuth(req.headers);
  if (authError) return authError;

  const timestamp = new Date().toISOString();
  const results: Record<string, any> = {};
  const errors: string[] = [];
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

  return new Response(JSON.stringify({ job: 'construction-stats', timestamp, results, totalInserted, errors }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
}
