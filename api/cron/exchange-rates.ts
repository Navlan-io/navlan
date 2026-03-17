import { verifyCronAuth } from '../lib/cron-auth';
import { getSupabaseAdmin } from '../lib/supabase-admin';
import { fetchBoiExchangeRate, parseBoiCsv } from '../lib/boi-api';

const CURRENCIES = ['USD', 'EUR', 'GBP'];
const MIN_DAYS_BETWEEN_SNAPSHOTS = 7;

export default async function handler(req: Request) {
  const authError = verifyCronAuth(req.headers);
  if (authError) return authError;

  const timestamp = new Date().toISOString();
  const results: Record<string, any> = {};
  const errors: string[] = [];
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

  return new Response(JSON.stringify({ job: 'exchange-rates', timestamp, results, totalInserted, errors }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
}
