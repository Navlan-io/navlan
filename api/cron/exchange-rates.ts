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

async function fetchBoiExchangeRate(currency: string, date: string): Promise<string> {
  const primaryUrl = `https://edge.boi.gov.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI/ER_FROM_GOV/1.0/RER_${currency}_ILS.D?startperiod=${date}&endperiod=${date}&format=csv`;
  let response = await fetch(primaryUrl);
  if (response.ok) return response.text();
  const fallbackUrl = `https://edge.boi.gov.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/EXR/1.0/RER_${currency}_ILS?format=csv&lastNObservations=5`;
  response = await fetch(fallbackUrl);
  if (response.ok) return response.text();
  throw new Error(`BOI API returned ${response.status} for ${currency} (tried primary and fallback URLs)`);
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

// ── Anomaly bounds ──
const RATE_BOUNDS: Record<string, { min: number; max: number }> = {
  USD: { min: 2.5, max: 5.0 },
  EUR: { min: 3.0, max: 6.0 },
  GBP: { min: 3.5, max: 7.0 },
};

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
const CURRENCIES = ['USD', 'EUR', 'GBP'];
const MIN_DAYS_BETWEEN_SNAPSHOTS = 7;

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
    const today = new Date().toISOString().split('T')[0];

    for (const currency of CURRENCIES) {
      try {
        const { data: latest } = await supabase
          .from('exchange_rates')
          .select('rate_date')
          .eq('currency', currency)
          .order('rate_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        const latestDate = latest?.rate_date ?? null;

        if (latestDate) {
          const daysSince = Math.floor(
            (new Date(today).getTime() - new Date(latestDate).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysSince < MIN_DAYS_BETWEEN_SNAPSHOTS) {
            results[currency] = { latestInDB: latestDate, skipped: true, reason: `Only ${daysSince} days since last snapshot` };
            continue;
          }
        }

        const csv = await fetchBoiExchangeRate(currency, today);
        const observations = parseBoiCsv(csv);

        if (observations.length === 0) {
          results[currency] = { latestInDB: latestDate, skipped: true, reason: 'No data from BOI API' };
          continue;
        }

        const obs = observations[observations.length - 1];

        const { error: upsertError } = await supabase
          .from('exchange_rates')
          .upsert({
            currency,
            rate_date: obs.timePeriod,
            rate: obs.obsValue,
            fetched_at: timestamp,
          }, { onConflict: 'currency,rate_date' });

        if (upsertError) {
          errors.push(`${currency}: upsert failed — ${upsertError.message}`);
          results[currency] = { latestInDB: latestDate, error: upsertError.message };
        } else {
          totalInserted++;
          results[currency] = { latestInDB: latestDate, inserted: obs.timePeriod, rate: obs.obsValue };

          // Anomaly bounds check
          const bounds = RATE_BOUNDS[currency];
          if (bounds && obs.obsValue !== null) {
            if (obs.obsValue < bounds.min || obs.obsValue > bounds.max) {
              const desc = `${currency}/ILS rate ${obs.obsValue} outside bounds [${bounds.min}–${bounds.max}]`;
              anomalies.push(desc);
              await logAnomaly(supabase, 'exchange_rates', desc, 'critical',
                { currency, rate: obs.obsValue, date: obs.timePeriod, bounds });
            }
          }
        }
      } catch (err: any) {
        errors.push(`${currency}: ${err.message}`);
        results[currency] = { error: err.message };
      }
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ job: 'exchange-rates', timestamp, error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ job: 'exchange-rates', timestamp, results, totalInserted, errors, anomalies }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
}
