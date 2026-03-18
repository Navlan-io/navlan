// /api/crons/population-data.ts
// Monthly cron to check for new World Bank population data for Israel
// Data updates once per year (usually mid-year for the prior year)
// Most runs will exit early with no new data — that's expected

import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// World Bank API endpoints (no auth required)
const WB_POP_URL =
  'https://api.worldbank.org/v2/country/ISR/indicator/SP.POP.TOTL?format=json&date=2000:2030&per_page=50';
const WB_GROW_URL =
  'https://api.worldbank.org/v2/country/ISR/indicator/SP.POP.GROW?format=json&date=2000:2030&per_page=50';

// Anomaly bounds for growth rate
const GROWTH_RATE_MIN = 0.5;
const GROWTH_RATE_MAX = 3.5;

interface WBObservation {
  date: string;
  value: number | null;
}

interface WBResponse {
  [index: number]: { total: number } | WBObservation[];
}

async function fetchWorldBankSeries(url: string): Promise<Map<number, number>> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`World Bank API error: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as WBResponse;
  const observations = json[1] as WBObservation[];
  const map = new Map<number, number>();

  for (const obs of observations) {
    if (obs.value !== null) {
      map.set(parseInt(obs.date), obs.value);
    }
  }
  return map;
}

export default async function handler(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const logs: string[] = [];

  try {
    // 1. Get the latest year we already have
    const { data: latest, error: latestError } = await supabase
      .from('population_data')
      .select('year')
      .order('year', { ascending: false })
      .limit(1)
      .single();

    if (latestError && latestError.code !== 'PGRST116') {
      throw new Error(`Failed to query latest year: ${latestError.message}`);
    }

    const latestYear = latest?.year ?? 0;
    logs.push(`Latest year in DB: ${latestYear}`);

    // 2. Fetch both series from World Bank
    const [popMap, growMap] = await Promise.all([
      fetchWorldBankSeries(WB_POP_URL),
      fetchWorldBankSeries(WB_GROW_URL),
    ]);

    // 3. Find new years not yet in DB
    const newYears = [...popMap.keys()]
      .filter((year) => year > latestYear)
      .sort((a, b) => a - b);

    if (newYears.length === 0) {
      logs.push('No new data available. Exiting.');
      return new Response(JSON.stringify({ ok: true, logs }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    logs.push(`Found ${newYears.length} new year(s): ${newYears.join(', ')}`);

    // 4. Insert new rows
    for (const year of newYears) {
      const population = popMap.get(year)!;
      const growthRate = growMap.get(year) ?? null;

      // Round growth rate to 3 decimal places
      const roundedGrowth =
        growthRate !== null ? Math.round(growthRate * 1000) / 1000 : null;

      const { error: insertError } = await supabase
        .from('population_data')
        .upsert(
          {
            year,
            population,
            growth_rate: roundedGrowth,
            source: 'World Bank',
            fetched_at: new Date().toISOString(),
          },
          { onConflict: 'year' }
        );

      if (insertError) {
        throw new Error(
          `Failed to insert year ${year}: ${insertError.message}`
        );
      }

      logs.push(
        `Inserted: ${year} — pop ${population.toLocaleString()}, growth ${roundedGrowth}%`
      );

      // 5. Check for anomalies in growth rate
      if (
        roundedGrowth !== null &&
        (roundedGrowth < GROWTH_RATE_MIN || roundedGrowth > GROWTH_RATE_MAX)
      ) {
        const anomalyMsg = `Population growth rate ${roundedGrowth}% for ${year} is outside expected bounds (${GROWTH_RATE_MIN}%–${GROWTH_RATE_MAX}%)`;
        logs.push(`ANOMALY: ${anomalyMsg}`);

        await supabase.from('anomaly_log').insert({
          source: 'population-data-cron',
          severity: 'warning',
          message: anomalyMsg,
          details: {
            year,
            population,
            growth_rate: roundedGrowth,
            bounds: { min: GROWTH_RATE_MIN, max: GROWTH_RATE_MAX },
          },
        });
      }
    }

    logs.push('Done.');
    return new Response(JSON.stringify({ ok: true, logs }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logs.push(`ERROR: ${message}`);

    // Log error to anomaly_log
    try {
      await supabase.from('anomaly_log').insert({
        source: 'population-data-cron',
        severity: 'error',
        message: `Cron failed: ${message}`,
        details: { logs },
      });
    } catch {
      // If even logging fails, just return the error
    }

    return new Response(JSON.stringify({ ok: false, error: message, logs }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
