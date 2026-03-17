# Vercel Cron Jobs — Automated Data Refresh

**Status:** Design
**Date:** 2026-03-17
**Priority:** Pre-launch requirement

## Problem

Navlan.io displays Israeli real estate market data (exchange rates, price indices, mortgage rates, construction stats/costs) from CBS and BOI government APIs. This data is currently static in Supabase — there is no automated refresh. Data will go stale without manual intervention.

## Solution

Vercel Cron Jobs that fetch fresh data from government APIs, compare against what's in Supabase, and upsert new rows. Consolidated into 2 endpoints due to Vercel Hobby plan's 2-cron limit.

## Architecture

```
vercel.json (cron schedule)
  → /api/cron/exchange-rates      (daily at 18:00 UTC)
  → /api/cron/refresh-weekly      (weekly Mon 10:00 UTC — runs price-indices,
                                    mortgage-rates, construction-stats,
                                    construction-costs sequentially)
```

**Runtime:** Node.js (not edge). Cron handlers need `@supabase/supabase-js` with service role key, which requires Node.js APIs unavailable in edge runtime.

### Shared Libraries (in `api/lib/`)

- **`supabase-admin.ts`** — Supabase client using `SUPABASE_SERVICE_ROLE_KEY` for write access (RLS bypass)
- **`cbs-api.ts`** — CBS API helpers with mandatory `User-Agent: Navlan/1.0` header
- **`boi-api.ts`** — BOI SDMX API helpers with CSV parsing and fallback URL patterns

### Security

All cron endpoints verify `Authorization: Bearer ${CRON_SECRET}` header from Vercel's scheduler.

### Environment Variables (Vercel)

- `CRON_SECRET` — Random string for cron auth
- `SUPABASE_SERVICE_ROLE_KEY` — For write access (existing anon key is read-only via RLS)

## Database Migration Required

The following unique constraints must exist for upserts to work. Create a migration to add them:

```sql
ALTER TABLE exchange_rates ADD CONSTRAINT exchange_rates_currency_rate_date_key UNIQUE (currency, rate_date);
ALTER TABLE price_indices ADD CONSTRAINT price_indices_index_code_year_month_key UNIQUE (index_code, year, month);
ALTER TABLE mortgage_rates ADD CONSTRAINT mortgage_rates_series_key_period_key UNIQUE (series_key, period);
ALTER TABLE construction_stats ADD CONSTRAINT construction_stats_series_id_year_month_quarter_key UNIQUE (series_id, year, COALESCE(month, 0), COALESCE(quarter, 0));
ALTER TABLE construction_costs ADD CONSTRAINT construction_costs_index_code_year_month_key UNIQUE (index_code, year, month);
```

For `construction_stats`, month and quarter are nullable (monthly series use month, quarterly use quarter). Use `COALESCE(..., 0)` in a unique index to handle NULLs, and always store `0` instead of `NULL` for the unused temporal column in application code.

## Cron Job Details

### 1. Exchange Rates (Daily)

- **Source:** BOI SDMX API (USD, EUR, GBP → ILS). GBP included for future use; frontend currently queries USD and EUR only.
- **Table:** `exchange_rates`
- **Logic:** Fetch latest rate, only insert if 7+ days since last row per currency (weekly snapshots)
- **Upsert key:** `(currency, rate_date)`
- **`fetched_at`:** Set to current ISO timestamp on each upsert
- **API resilience:** BOI API format may change; try primary URL, then alternative patterns. Log and skip on failure.

**Primary API URL:**
```
GET https://edge.boi.gov.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI/ER_FROM_GOV/1.0/RER_{CURRENCY}_ILS.D?startperiod={date}&endperiod={date}&format=csv
```
**Fallback:** Try `BOI.STATISTICS` agency ID and `EXR` dataflow if primary returns 404.

### 2. Price Indices (Weekly)

- **Source:** CBS Price Index API (`api.cbs.gov.il` — singular)
- **Table:** `price_indices`
- **Codes:** 40010, 60000, 60100, 60200, 60300, 60400, 60500, 70000, 120460→50010
- **Logic:** Fetch last 3 months per code, insert any newer than DB max
- **Upsert key:** `(index_code, year, month)`
- **`fetched_at`:** Set to current ISO timestamp on each upsert

**API URL:**
```
GET https://api.cbs.gov.il/index/data/price?id={code}&format=json&lang=en&last=3
Headers: User-Agent: Navlan/1.0
```

**Response format:**
```json
{ "month": [{ "code": 40010, "name": "Prices of Dwellings",
  "date": [{ "year": 2025, "month": 12, "percent": 0.5, "percentYear": 1.2,
    "currBase": { "baseDesc": "Average 1993", "value": 600.8 } }] }] }
```

**Special cases:**
- Code 120460 (CPI Rent Sub-Index): Fetch using CBS code 120460, store as `index_code = 50010`
- Code 200010 (construction costs): If fetched here, also upsert into `construction_costs` table with normalization applied (see Job 5)

### 3. Mortgage Rates (Weekly)

- **Source:** BOI SDMX API (`BIR_MRTG_99` dataflow)
- **Table:** `mortgage_rates`
- **Series:** 10 series keys covering non-indexed, prime, CPI-indexed, FX-indexed tracks
- **Logic:** Fetch last 3 observations per series, insert newer periods
- **Upsert key:** `(series_key, period)`
- **`fetched_at`:** Set to current ISO timestamp on each upsert

**API URL:**
```
GET https://edge.boi.gov.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/BIR_MRTG_99/1.0/{series_key}.M.99034?format=csv&lastNObservations=3
```

**CSV columns:** `SERIES_KEY, FREQ, REP_ENTITY, TIME_PERIOD, OBS_VALUE, DATA_TYPE, ...`
- `TIME_PERIOD` = `YYYY-MM` format
- `OBS_VALUE` = the rate value

**Special:** FX-indexed fixed (series ending 694) — if `OBS_VALUE` is 0, store as NULL (missing data artifact)

### 4. Construction Stats (Weekly)

- **Source:** CBS Time Series API (`apis.cbs.gov.il` — note **plural**, different domain from price index)
- **Table:** `construction_stats`
- **Series:** 574362 (unsold inventory), 574500 (months supply), 574272 (starts), 574280 (completions), 574325 (permits), 574320 (under construction — quarterly)
- **Logic:** Fetch last 6 observations per series, insert newer periods
- **Upsert key:** `(series_id, year, COALESCE(month, 0), COALESCE(quarter, 0))`
- **`fetched_at`:** Set to current ISO timestamp on each upsert
- **Null handling:** Store `0` (not NULL) for the unused temporal column (month=0 for quarterly, quarter=0 for monthly)

**API URL:**
```
GET https://apis.cbs.gov.il/series/data/list?id={seriesId}&format=json&lang=en&last=6
Headers: User-Agent: Navlan/1.0
```

### 5. Construction Costs (Weekly)

- **Source:** CBS Price Index API (code 200010)
- **Table:** `construction_costs`
- **Logic:** Fetch last 3 months, insert newer with normalization
- **Upsert key:** `(index_code, year, month)`
- **`fetched_at`:** Set to current ISO timestamp on each upsert

**Normalization:** CBS changed the base period for construction costs in July 2025. Values from August 2025 onward use a new base (July 2025 = 100). To maintain continuity with the historical series, multiply by `1.387` (ratio of old base value at July 2025 / 100).

```typescript
const CONSTRUCTION_COST_NORMALIZATION_FACTOR = 1.387; // old_base_july_2025 / 100
const NORMALIZATION_CUTOFF = { year: 2025, month: 8 };

function normalizeConstructionCost(year: number, month: number, rawValue: number): number {
  if (year > 2025 || (year === 2025 && month >= 8)) {
    return rawValue * CONSTRUCTION_COST_NORMALIZATION_FACTOR;
  }
  return rawValue;
}
```

## Error Handling

- Never throw — catch all errors, return JSON summary
- Handle API changes gracefully (unexpected format → log and skip)
- Handle empty responses (BOI sometimes returns 200 with empty body)
- Each response includes: job name, timestamp, rows checked, rows inserted, errors array

## vercel.json Cron Configuration

```json
{
  "crons": [
    { "path": "/api/cron/exchange-rates", "schedule": "0 18 * * 1-5" },
    { "path": "/api/cron/refresh-weekly", "schedule": "0 10 * * 1" }
  ]
}
```

Note: Vercel Hobby plan supports max 2 cron jobs, minimum daily frequency. The 4 weekly jobs are consolidated into a single `/api/cron/refresh-weekly` endpoint.

## Files to Create

```
api/lib/supabase-admin.ts
api/lib/cbs-api.ts
api/lib/boi-api.ts
api/cron/exchange-rates.ts
api/cron/refresh-weekly.ts
supabase/migrations/20260317_add_upsert_constraints.sql
```

## Files to Modify

```
vercel.json  (add crons array)
```

## Out of Scope

- `city_prices` / `city_rentals` — PDF-only, quarterly manual process
- `city_profiles` — editorial content
- Expansion tables — static research data
- Purchase tax bracket updates — separate concern
- Monitoring/alerting beyond response JSON — can be added post-launch
