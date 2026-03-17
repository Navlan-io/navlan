# Vercel Cron Jobs — Automated Data Refresh

**Status:** Design
**Date:** 2026-03-17
**Priority:** Pre-launch requirement

## Problem

Navlan.io displays Israeli real estate market data (exchange rates, price indices, mortgage rates, construction stats/costs) from CBS and BOI government APIs. This data is currently static in Supabase — there is no automated refresh. Data will go stale without manual intervention.

## Solution

Five Vercel Cron Jobs that fetch fresh data from government APIs, compare against what's in Supabase, and upsert new rows.

## Architecture

```
vercel.json (cron schedule)
  → /api/cron/exchange-rates      (daily weekdays 18:00 UTC)
  → /api/cron/price-indices       (weekly Mon 10:00 UTC)
  → /api/cron/mortgage-rates      (weekly Mon 11:00 UTC)
  → /api/cron/construction-stats  (weekly Mon 12:00 UTC)
  → /api/cron/construction-costs  (weekly Mon 13:00 UTC)
```

### Shared Libraries (in `api/lib/`)

- **`supabase-admin.ts`** — Supabase client using `SUPABASE_SERVICE_ROLE_KEY` for write access (RLS bypass)
- **`cbs-api.ts`** — CBS API helpers with mandatory `User-Agent: Navlan/1.0` header
- **`boi-api.ts`** — BOI SDMX API helpers with CSV parsing and fallback URL patterns

### Security

All cron endpoints verify `Authorization: Bearer ${CRON_SECRET}` header from Vercel's scheduler.

### Environment Variables (Vercel)

- `CRON_SECRET` — Random string for cron auth
- `SUPABASE_SERVICE_ROLE_KEY` — For write access (existing anon key is read-only via RLS)

## Cron Job Details

### 1. Exchange Rates (Daily)

- **Source:** BOI SDMX API (USD, EUR, GBP → ILS)
- **Table:** `exchange_rates` (columns: currency, rate_date, rate)
- **Logic:** Fetch latest rate, only insert if 7+ days since last row per currency (weekly snapshots)
- **Upsert key:** `(currency, rate_date)`
- **API resilience:** BOI API format may change; try primary URL, then alternative patterns. Log and skip on failure.

### 2. Price Indices (Weekly)

- **Source:** CBS Price Index API (`api.cbs.gov.il`)
- **Table:** `price_indices` (columns: index_code, index_name, year, month, value, percent_mom, percent_yoy, base_desc)
- **Codes:** 40010, 60000-60500, 70000, 120460→50010
- **Logic:** Fetch last 3 months per code, insert any newer than DB max
- **Upsert key:** `(index_code, year, month)`
- **Special:** Code 120460 fetched from CBS but stored as index_code 50010. Code 200010 also upserts into `construction_costs`.

### 3. Mortgage Rates (Weekly)

- **Source:** BOI SDMX API (`BIR_MRTG_99` dataflow)
- **Table:** `mortgage_rates` (columns: series_key, track_type, track_label, rate_type, period, value)
- **Series:** 10 series keys covering non-indexed, prime, CPI-indexed, FX-indexed tracks
- **Logic:** Fetch last 3 observations per series, insert newer periods
- **Upsert key:** `(series_key, period)`
- **Special:** FX-indexed fixed (series 694) — store 0 as NULL

### 4. Construction Stats (Weekly)

- **Source:** CBS Time Series API (`apis.cbs.gov.il` — note plural)
- **Table:** `construction_stats` (columns: series_id, metric, district, year, month, quarter, value, data_type)
- **Series:** 6 series (inventory, supply, starts, completions, permits, under-construction)
- **Logic:** Fetch last 6 observations per series, insert newer periods
- **Upsert key:** `(series_id, year, month, quarter)`

### 5. Construction Costs (Weekly)

- **Source:** CBS Price Index API (code 200010)
- **Table:** `construction_costs` (columns: index_code, index_name, year, month, value, percent_mom, percent_yoy)
- **Logic:** Fetch last 3 months, insert newer with normalization
- **Upsert key:** `(index_code, year, month)`
- **Normalization:** CBS changed base period July 2025. Values from Aug 2025+ multiplied by 1.387.

## Error Handling

- Never throw — catch all errors, return JSON summary
- Handle API changes gracefully (unexpected format → log and skip)
- Handle empty responses (BOI sometimes returns 200 with empty body)
- Each response includes: rows checked, rows inserted, errors array

## Files to Create

```
api/lib/supabase-admin.ts
api/lib/cbs-api.ts
api/lib/boi-api.ts
api/cron/exchange-rates.ts
api/cron/price-indices.ts
api/cron/mortgage-rates.ts
api/cron/construction-stats.ts
api/cron/construction-costs.ts
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
