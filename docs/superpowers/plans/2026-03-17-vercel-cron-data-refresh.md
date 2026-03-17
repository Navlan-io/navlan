# Vercel Cron Data Refresh Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 5 Vercel Cron Jobs that automatically refresh government data (CBS + BOI) into Supabase.

**Architecture:** Vercel serverless functions (Node.js runtime) triggered by cron schedules. Each function fetches from a government API, compares against Supabase, and upserts new rows. Shared libraries handle Supabase admin client, CBS API calls, and BOI SDMX API calls. All handlers use the Web Request/Response API (same pattern as existing `api/advisor.ts`, but without edge runtime).

**Tech Stack:** TypeScript, Vercel Serverless Functions (Node.js runtime), `@supabase/supabase-js` (already installed), Vitest for tests.

**Spec:** `docs/superpowers/specs/2026-03-17-vercel-cron-data-refresh-design.md`

---

## File Structure

```
api/
  lib/
    supabase-admin.ts    — Supabase client with service role key (bypasses RLS)
    cbs-api.ts           — CBS Price Index + Time Series API helpers
    boi-api.ts           — BOI SDMX API helpers (CSV parsing, fallback URLs)
    cron-auth.ts         — CRON_SECRET verification helper
  cron/
    exchange-rates.ts    — Daily: BOI → exchange_rates table
    price-indices.ts     — Weekly: CBS → price_indices table
    mortgage-rates.ts    — Weekly: BOI → mortgage_rates table
    construction-stats.ts — Weekly: CBS → construction_stats table
    construction-costs.ts — Weekly: CBS → construction_costs table
src/
  test/
    cron/
      cbs-api.test.ts       — CBS response parsing + normalization tests
      boi-api.test.ts       — BOI CSV parsing tests
      cron-auth.test.ts     — Auth verification tests
supabase/
  migrations/
    20260317_add_upsert_constraints.sql — Unique constraints for upsert
vercel.json              — Add crons array (MODIFY)
```

**Important context for implementers:**
- This project is **Vite + React SPA**, NOT Next.js. The `api/` directory contains Vercel serverless functions.
- All cron handlers use the **Web Request/Response API** — `export default async function handler(req: Request)` returning `new Response(...)`. Do NOT use `VercelRequest`/`VercelResponse` or import `@vercel/node`.
- The existing `api/advisor.ts` uses `export const config = { runtime: 'edge' }` — cron jobs must NOT export this config. Omitting it defaults to Node.js runtime.
- `@supabase/supabase-js` is already in `package.json`. No new dependencies needed.
- Vercel compiles `api/` functions independently from Vite. They can import from `api/lib/` using relative paths.
- Environment variables: `process.env.SUPABASE_SERVICE_ROLE_KEY`, `process.env.CRON_SECRET`, `process.env.VITE_SUPABASE_URL`.

---

## Chunk 1: Foundation (Migration + Shared Libraries)

### Task 1: Database Migration — Unique Constraints

**Files:**
- Create: `supabase/migrations/20260317_add_upsert_constraints.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- Add unique constraints required for cron job upserts.
-- These enable ON CONFLICT ... DO UPDATE for each table.

-- exchange_rates: one rate per currency per date
ALTER TABLE exchange_rates
  ADD CONSTRAINT exchange_rates_currency_rate_date_key
  UNIQUE (currency, rate_date);

-- price_indices: one value per index per month
ALTER TABLE price_indices
  ADD CONSTRAINT price_indices_index_code_year_month_key
  UNIQUE (index_code, year, month);

-- mortgage_rates: one value per series per period
ALTER TABLE mortgage_rates
  ADD CONSTRAINT mortgage_rates_series_key_period_key
  UNIQUE (series_key, period);

-- construction_stats: one value per series per time period.
-- Application code MUST store 0 (not NULL) for the unused temporal column
-- (month=0 for quarterly series, quarter=0 for monthly series).
ALTER TABLE construction_stats
  ADD CONSTRAINT construction_stats_series_id_year_month_quarter_key
  UNIQUE (series_id, year, month, quarter);

-- construction_costs: one value per index per month
ALTER TABLE construction_costs
  ADD CONSTRAINT construction_costs_index_code_year_month_key
  UNIQUE (index_code, year, month);
```

**Pre-migration check:** Before running, verify no existing rows have NULL month or quarter in construction_stats. If they do, update them to 0 first:
```sql
UPDATE construction_stats SET month = 0 WHERE month IS NULL;
UPDATE construction_stats SET quarter = 0 WHERE quarter IS NULL;
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260317_add_upsert_constraints.sql
git commit -m "feat(db): add unique constraints for cron job upserts"
```

---

### Task 2: Cron Auth Helper

**Files:**
- Create: `api/lib/cron-auth.ts`
- Create: `src/test/cron/cron-auth.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/test/cron/cron-auth.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyCronAuth } from '../../api/lib/cron-auth';

describe('verifyCronAuth', () => {
  beforeEach(() => {
    vi.stubEnv('CRON_SECRET', 'test-secret-123');
  });

  it('returns null when authorization matches CRON_SECRET', () => {
    const headers = new Headers({ Authorization: 'Bearer test-secret-123' });
    const result = verifyCronAuth(headers);
    expect(result).toBeNull();
  });

  it('returns 401 Response when authorization is missing', () => {
    const headers = new Headers();
    const result = verifyCronAuth(headers);
    expect(result).toBeInstanceOf(Response);
    expect(result!.status).toBe(401);
  });

  it('returns 401 Response when authorization is wrong', () => {
    const headers = new Headers({ Authorization: 'Bearer wrong-secret' });
    const result = verifyCronAuth(headers);
    expect(result).toBeInstanceOf(Response);
    expect(result!.status).toBe(401);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/cron/cron-auth.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write implementation**

Create `api/lib/cron-auth.ts`:

```typescript
/**
 * Verify that the request comes from Vercel's cron scheduler.
 * Returns null if authorized, or a 401 Response if not.
 *
 * All cron handlers use the Web Request/Response API (not VercelRequest).
 */
export function verifyCronAuth(headers: Headers): Response | null {
  const authHeader = headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/cron/cron-auth.test.ts`
Expected: 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add api/lib/cron-auth.ts src/test/cron/cron-auth.test.ts
git commit -m "feat(cron): add cron auth verification helper"
```

---

### Task 3: Supabase Admin Client

**Files:**
- Create: `api/lib/supabase-admin.ts`

- [ ] **Step 1: Write the admin client**

Create `api/lib/supabase-admin.ts`:

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xkgsgswxauguhyucauxg.supabase.co';

let cachedClient: SupabaseClient | null = null;

/**
 * Supabase client with service role key — bypasses RLS for write operations.
 * Only use in server-side code (cron jobs, API routes).
 * Client is cached at module level (one per serverless function cold start).
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  cachedClient = createClient(SUPABASE_URL, serviceRoleKey, {
    auth: { persistSession: false },
  });
  return cachedClient;
}
```

- [ ] **Step 2: Commit**

```bash
git add api/lib/supabase-admin.ts
git commit -m "feat(cron): add Supabase admin client with service role key"
```

---

### Task 4: CBS API Helper

**Files:**
- Create: `api/lib/cbs-api.ts`
- Create: `src/test/cron/cbs-api.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/test/cron/cbs-api.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  parsePriceIndexResponse,
  parseTimeSeriesPeriod,
  extractTimeSeriesObservations,
  normalizeConstructionCost,
} from '../../api/lib/cbs-api';

describe('parsePriceIndexResponse', () => {
  it('parses a standard CBS price index response', () => {
    const cbsResponse = {
      month: [{
        code: 40010,
        name: 'Prices of Dwellings',
        date: [{
          year: 2025,
          month: 12,
          monthDesc: 'December',
          percent: 0.5,
          percentYear: 1.2,
          currBase: { baseDesc: 'Average 1993', value: 600.8 },
        }],
      }],
    };

    const result = parsePriceIndexResponse(cbsResponse);
    expect(result).toEqual([{
      code: 40010,
      name: 'Prices of Dwellings',
      year: 2025,
      month: 12,
      value: 600.8,
      percentMom: 0.5,
      percentYoy: 1.2,
      baseDesc: 'Average 1993',
    }]);
  });

  it('handles null percentYear (district indices)', () => {
    const cbsResponse = {
      month: [{
        code: 60000,
        name: 'Jerusalem District',
        date: [{
          year: 2025,
          month: 11,
          percent: 0.3,
          percentYear: null,
          currBase: { baseDesc: 'Average 1993', value: 550.2 },
        }],
      }],
    };

    const result = parsePriceIndexResponse(cbsResponse);
    expect(result[0].percentYoy).toBeNull();
  });

  it('returns empty array for malformed response', () => {
    expect(parsePriceIndexResponse({})).toEqual([]);
    expect(parsePriceIndexResponse(null)).toEqual([]);
    expect(parsePriceIndexResponse({ month: [] })).toEqual([]);
  });

  it('parses multiple date entries from last=3', () => {
    const cbsResponse = {
      month: [{
        code: 40010,
        name: 'Prices of Dwellings',
        date: [
          { year: 2025, month: 10, percent: 0.1, percentYear: 0.8, currBase: { baseDesc: 'Avg 1993', value: 598.0 } },
          { year: 2025, month: 11, percent: 0.3, percentYear: 1.0, currBase: { baseDesc: 'Avg 1993', value: 599.5 } },
          { year: 2025, month: 12, percent: 0.5, percentYear: 1.2, currBase: { baseDesc: 'Avg 1993', value: 600.8 } },
        ],
      }],
    };

    const result = parsePriceIndexResponse(cbsResponse);
    expect(result).toHaveLength(3);
    expect(result[0].month).toBe(10);
    expect(result[2].month).toBe(12);
  });
});

describe('parseTimeSeriesPeriod', () => {
  it('parses monthly period string like "2026-01"', () => {
    const result = parseTimeSeriesPeriod('2026-01');
    expect(result).toEqual({ year: 2026, month: 1, quarter: 0 });
  });

  it('parses quarterly period string like "2025-Q3"', () => {
    const result = parseTimeSeriesPeriod('2025-Q3');
    expect(result).toEqual({ year: 2025, month: 0, quarter: 3 });
  });

  it('returns null for unparseable period', () => {
    expect(parseTimeSeriesPeriod('invalid')).toBeNull();
    expect(parseTimeSeriesPeriod('')).toBeNull();
  });
});

describe('extractTimeSeriesObservations', () => {
  it('extracts from DataSet format', () => {
    const data = {
      DataSet: [{
        Series: [{
          obs: [
            { TimePeriod: '2026-01', ObsValue: 1234 },
            { TimePeriod: '2026-02', ObsValue: 1300 },
          ],
        }],
      }],
    };

    const result = extractTimeSeriesObservations(data);
    expect(result).toEqual([
      { period: '2026-01', value: 1234 },
      { period: '2026-02', value: 1300 },
    ]);
  });

  it('returns empty array for null/undefined input', () => {
    expect(extractTimeSeriesObservations(null)).toEqual([]);
    expect(extractTimeSeriesObservations(undefined)).toEqual([]);
    expect(extractTimeSeriesObservations({})).toEqual([]);
  });

  it('handles string ObsValue', () => {
    const data = {
      DataSet: [{
        Series: [{
          obs: [{ TimePeriod: '2026-01', ObsValue: '1234.5' }],
        }],
      }],
    };

    const result = extractTimeSeriesObservations(data);
    expect(result[0].value).toBe(1234.5);
  });
});

describe('normalizeConstructionCost', () => {
  it('returns raw value for dates before Aug 2025', () => {
    expect(normalizeConstructionCost(2025, 7, 100)).toBe(100);
    expect(normalizeConstructionCost(2024, 12, 200)).toBe(200);
  });

  it('multiplies by 1.387 for Aug 2025 and later', () => {
    expect(normalizeConstructionCost(2025, 8, 100)).toBeCloseTo(138.7);
    expect(normalizeConstructionCost(2025, 12, 100)).toBeCloseTo(138.7);
    expect(normalizeConstructionCost(2026, 1, 100)).toBeCloseTo(138.7);
  });

  it('handles edge case: exactly July 2025 (no normalization)', () => {
    expect(normalizeConstructionCost(2025, 7, 150)).toBe(150);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/test/cron/cbs-api.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write implementation**

Create `api/lib/cbs-api.ts`:

```typescript
const CBS_USER_AGENT = 'Navlan/1.0';

/** Parsed price index data point from CBS API */
export interface CbsPriceIndexEntry {
  code: number;
  name: string;
  year: number;
  month: number;
  value: number;
  percentMom: number | null;
  percentYoy: number | null;
  baseDesc: string;
}

/** Parsed time period from CBS time series */
export interface CbsTimePeriod {
  year: number;
  month: number;   // 0 if quarterly
  quarter: number; // 0 if monthly
}

/**
 * Fetch from CBS Price Index API (api.cbs.gov.il — singular).
 * Used for price indices and construction costs.
 */
export async function fetchCbsPriceIndex(code: number, last = 3): Promise<any> {
  const url = `https://api.cbs.gov.il/index/data/price?id=${code}&format=json&lang=en&last=${last}`;
  const response = await fetch(url, {
    headers: { 'User-Agent': CBS_USER_AGENT },
  });
  if (!response.ok) {
    throw new Error(`CBS price index API returned ${response.status} for code ${code}`);
  }
  return response.json();
}

/**
 * Fetch from CBS Time Series API (apis.cbs.gov.il — PLURAL, different domain).
 * Used for construction stats.
 */
export async function fetchCbsTimeSeries(seriesId: number, last = 6): Promise<any> {
  const url = `https://apis.cbs.gov.il/series/data/list?id=${seriesId}&format=json&lang=en&last=${last}`;
  const response = await fetch(url, {
    headers: { 'User-Agent': CBS_USER_AGENT },
  });
  if (!response.ok) {
    throw new Error(`CBS time series API returned ${response.status} for series ${seriesId}`);
  }
  return response.json();
}

/**
 * Parse CBS price index response into flat entries.
 * Handles malformed/empty responses gracefully.
 */
export function parsePriceIndexResponse(data: any): CbsPriceIndexEntry[] {
  if (!data?.month?.length) return [];

  const entries: CbsPriceIndexEntry[] = [];
  for (const series of data.month) {
    if (!series.date?.length) continue;
    for (const d of series.date) {
      entries.push({
        code: series.code,
        name: series.name,
        year: d.year,
        month: d.month,
        value: d.currBase?.value ?? 0,
        percentMom: d.percent ?? null,
        percentYoy: d.percentYear ?? null,
        baseDesc: d.currBase?.baseDesc ?? '',
      });
    }
  }
  return entries;
}

/**
 * Parse CBS time series period string.
 * Monthly: "2026-01" → { year: 2026, month: 1, quarter: 0 }
 * Quarterly: "2025-Q3" → { year: 2025, month: 0, quarter: 3 }
 * Stores 0 (not null) for unused temporal column to support unique constraint.
 */
export function parseTimeSeriesPeriod(period: string): CbsTimePeriod | null {
  if (!period) return null;

  // Try quarterly: "2025-Q3"
  const qMatch = period.match(/^(\d{4})-Q(\d)$/);
  if (qMatch) {
    return { year: parseInt(qMatch[1]), month: 0, quarter: parseInt(qMatch[2]) };
  }

  // Try monthly: "2026-01"
  const mMatch = period.match(/^(\d{4})-(\d{2})$/);
  if (mMatch) {
    return { year: parseInt(mMatch[1]), month: parseInt(mMatch[2]), quarter: 0 };
  }

  return null;
}

/**
 * Extract observations from CBS time series response.
 * Handles multiple known response formats gracefully.
 */
export function extractTimeSeriesObservations(data: any): { period: string; value: number }[] {
  if (!data) return [];

  // Format: { DataSet: [{ Series: [{ obs: [{ TimePeriod, ObsValue }] }] }] }
  try {
    const series = data?.DataSet?.[0]?.Series;
    if (Array.isArray(series)) {
      const obs: { period: string; value: number }[] = [];
      for (const s of series) {
        if (Array.isArray(s.obs)) {
          for (const o of s.obs) {
            const period = o.TimePeriod ?? o.TIME_PERIOD;
            const value = parseFloat(o.ObsValue ?? o.OBS_VALUE);
            if (period && !isNaN(value)) {
              obs.push({ period, value });
            }
          }
        }
      }
      if (obs.length > 0) return obs;
    }
  } catch { /* try next format */ }

  // Fallback: flat array of { period, value }
  if (Array.isArray(data)) {
    return data
      .filter((d: any) => d.period && typeof d.value === 'number')
      .map((d: any) => ({ period: d.period, value: d.value }));
  }

  return [];
}

/**
 * Normalize construction cost index values.
 * CBS changed the base period in July 2025. Values from Aug 2025 onward
 * use a new base (July 2025 = 100) and must be multiplied by 1.387
 * (ratio of old base value at July 2025 / 100) to maintain series continuity.
 */
const CONSTRUCTION_COST_NORMALIZATION_FACTOR = 1.387;

export function normalizeConstructionCost(year: number, month: number, rawValue: number): number {
  if (year > 2025 || (year === 2025 && month >= 8)) {
    return rawValue * CONSTRUCTION_COST_NORMALIZATION_FACTOR;
  }
  return rawValue;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/test/cron/cbs-api.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add api/lib/cbs-api.ts src/test/cron/cbs-api.test.ts
git commit -m "feat(cron): add CBS API helper with parsing and normalization"
```

---

### Task 5: BOI API Helper

**Files:**
- Create: `api/lib/boi-api.ts`
- Create: `src/test/cron/boi-api.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/test/cron/boi-api.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { parseBoiCsv, parseBoiMortgageCsv } from '../../api/lib/boi-api';

describe('parseBoiCsv (exchange rates)', () => {
  it('parses BOI CSV with exchange rate data', () => {
    const csv = `DATAFLOW,FREQ,SERIES_KEY,TIME_PERIOD,OBS_VALUE
BOI:ER_FROM_GOV(1.0),D,RER_USD_ILS,2026-03-17,3.652`;

    const result = parseBoiCsv(csv);
    expect(result).toEqual([{ timePeriod: '2026-03-17', obsValue: 3.652 }]);
  });

  it('handles multi-row CSV', () => {
    const csv = `DATAFLOW,FREQ,SERIES_KEY,TIME_PERIOD,OBS_VALUE
BOI:ER_FROM_GOV(1.0),D,RER_USD_ILS,2026-03-16,3.650
BOI:ER_FROM_GOV(1.0),D,RER_USD_ILS,2026-03-17,3.652`;

    const result = parseBoiCsv(csv);
    expect(result).toHaveLength(2);
  });

  it('returns empty array for empty/malformed CSV', () => {
    expect(parseBoiCsv('')).toEqual([]);
    expect(parseBoiCsv('just a header\n')).toEqual([]);
  });
});

describe('parseBoiMortgageCsv', () => {
  it('parses mortgage rate CSV with TIME_PERIOD and OBS_VALUE columns', () => {
    const csv = `SERIES_KEY,FREQ,REP_ENTITY,TIME_PERIOD,OBS_VALUE,DATA_TYPE
BNK_99034_LR_BIR_MRTG_462,M,99034,2026-01,5.23,RATE
BNK_99034_LR_BIR_MRTG_462,M,99034,2026-02,5.18,RATE`;

    const result = parseBoiMortgageCsv(csv);
    expect(result).toEqual([
      { timePeriod: '2026-01', obsValue: 5.23 },
      { timePeriod: '2026-02', obsValue: 5.18 },
    ]);
  });

  it('returns obsValue as null when value is 0 and nullifyZero is true', () => {
    const csv = `SERIES_KEY,FREQ,REP_ENTITY,TIME_PERIOD,OBS_VALUE
BNK_99034_LR_BIR_MRTG_694,M,99034,2026-01,0`;

    const result = parseBoiMortgageCsv(csv, true);
    expect(result[0].obsValue).toBeNull();
  });

  it('keeps 0 as 0 when nullifyZero is false', () => {
    const csv = `SERIES_KEY,FREQ,REP_ENTITY,TIME_PERIOD,OBS_VALUE
BNK_99034_LR_BIR_MRTG_694,M,99034,2026-01,0`;

    const result = parseBoiMortgageCsv(csv, false);
    expect(result[0].obsValue).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/test/cron/boi-api.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write implementation**

Create `api/lib/boi-api.ts`:

```typescript
/** Parsed observation from BOI SDMX CSV */
export interface BoiObservation {
  timePeriod: string;
  obsValue: number | null;
}

/**
 * Fetch exchange rate from BOI SDMX API.
 * Tries primary URL format, then fallback if 404.
 */
export async function fetchBoiExchangeRate(currency: string, date: string): Promise<string> {
  // Primary URL format
  const primaryUrl = `https://edge.boi.gov.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI/ER_FROM_GOV/1.0/RER_${currency}_ILS.D?startperiod=${date}&endperiod=${date}&format=csv`;

  let response = await fetch(primaryUrl);
  if (response.ok) {
    return response.text();
  }

  // Fallback: try BOI.STATISTICS agency and EXR dataflow
  const fallbackUrl = `https://edge.boi.gov.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/EXR/1.0/RER_${currency}_ILS?format=csv&lastNObservations=5`;
  response = await fetch(fallbackUrl);
  if (response.ok) {
    return response.text();
  }

  throw new Error(`BOI API returned ${response.status} for ${currency} (tried primary and fallback URLs)`);
}

/**
 * Fetch mortgage rate CSV from BOI SDMX API.
 */
export async function fetchBoiMortgageRate(seriesKey: string): Promise<string> {
  const url = `https://edge.boi.gov.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/BIR_MRTG_99/1.0/${seriesKey}.M.99034?format=csv&lastNObservations=3`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`BOI mortgage API returned ${response.status} for series ${seriesKey}`);
  }
  return response.text();
}

/**
 * Parse BOI SDMX CSV for exchange rates.
 * Expects columns including TIME_PERIOD and OBS_VALUE.
 */
export function parseBoiCsv(csv: string): BoiObservation[] {
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

/**
 * Parse BOI SDMX CSV for mortgage rates.
 * Same CSV format but with option to nullify zero values (for FX-indexed fixed track).
 */
export function parseBoiMortgageCsv(csv: string, nullifyZero = false): BoiObservation[] {
  const observations = parseBoiCsv(csv);
  if (!nullifyZero) return observations;
  return observations.map(obs => ({
    ...obs,
    obsValue: obs.obsValue === 0 ? null : obs.obsValue,
  }));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/test/cron/boi-api.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add api/lib/boi-api.ts src/test/cron/boi-api.test.ts
git commit -m "feat(cron): add BOI SDMX API helper with CSV parsing"
```

---

## Chunk 2: Cron Handlers

### Task 6: Exchange Rates Cron Handler

**Files:**
- Create: `api/cron/exchange-rates.ts`

- [ ] **Step 1: Write the handler**

Create `api/cron/exchange-rates.ts`:

```typescript
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
        // Check latest date in DB — maybeSingle() returns null data (no error) for empty table
        const { data: latest } = await supabase
          .from('exchange_rates')
          .select('rate_date')
          .eq('currency', currency)
          .order('rate_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        const latestDate = latest?.rate_date ?? null;

        // Only insert weekly snapshots — skip if less than 7 days since last row
        if (latestDate) {
          const daysSince = Math.floor(
            (new Date(today).getTime() - new Date(latestDate).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysSince < MIN_DAYS_BETWEEN_SNAPSHOTS) {
            results[currency] = { latestInDB: latestDate, skipped: true, reason: `Only ${daysSince} days since last snapshot` };
            continue;
          }
        }

        // Fetch from BOI
        const csv = await fetchBoiExchangeRate(currency, today);
        const observations = parseBoiCsv(csv);

        if (observations.length === 0) {
          results[currency] = { latestInDB: latestDate, skipped: true, reason: 'No data from BOI API' };
          continue;
        }

        // Use the most recent observation
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
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ job: 'exchange-rates', timestamp, results, totalInserted, errors }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add api/cron/exchange-rates.ts
git commit -m "feat(cron): add exchange rates daily cron job"
```

---

### Task 7: Price Indices Cron Handler

**Files:**
- Create: `api/cron/price-indices.ts`

- [ ] **Step 1: Write the handler**

Create `api/cron/price-indices.ts`:

```typescript
import { verifyCronAuth } from '../lib/cron-auth';
import { getSupabaseAdmin } from '../lib/supabase-admin';
import { fetchCbsPriceIndex, parsePriceIndexResponse } from '../lib/cbs-api';

// CBS API code → DB index_code mapping
// Most are 1:1 except 120460 (CPI Rent Sub-Index) which is stored as 50010
const INDEX_CODES: { cbsCode: number; dbCode: number }[] = [
  { cbsCode: 40010, dbCode: 40010 },   // National dwelling price index
  { cbsCode: 60000, dbCode: 60000 },   // Jerusalem District
  { cbsCode: 60100, dbCode: 60100 },   // North District
  { cbsCode: 60200, dbCode: 60200 },   // Haifa District
  { cbsCode: 60300, dbCode: 60300 },   // Center District
  { cbsCode: 60400, dbCode: 60400 },   // Tel Aviv District
  { cbsCode: 60500, dbCode: 60500 },   // South District
  { cbsCode: 70000, dbCode: 70000 },   // New Dwellings (national)
  { cbsCode: 120460, dbCode: 50010 },  // CPI Rent Sub-Index
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

    for (const { cbsCode, dbCode } of INDEX_CODES) {
      try {
        const rawResponse = await fetchCbsPriceIndex(cbsCode);
        const entries = parsePriceIndexResponse(rawResponse);

        if (entries.length === 0) {
          results[dbCode] = { skipped: true, reason: 'No data from CBS API' };
          continue;
        }

        // Get latest in DB
        const { data: latestRows } = await supabase
          .from('price_indices')
          .select('year, month')
          .eq('index_code', dbCode)
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

          const { error: upsertError } = await supabase
            .from('price_indices')
            .upsert({
              index_code: dbCode,
              index_name: entry.name,
              year: entry.year,
              month: entry.month,
              value: entry.value,
              percent_mom: entry.percentMom,
              percent_yoy: entry.percentYoy,
              base_desc: entry.baseDesc,
              fetched_at: timestamp,
            }, { onConflict: 'index_code,year,month' });

          if (upsertError) {
            errors.push(`${dbCode}: upsert failed for ${entry.year}-${entry.month} — ${upsertError.message}`);
          } else {
            inserted++;
          }
        }

        totalInserted += inserted;
        const latestEntry = entries[entries.length - 1];
        results[dbCode] = {
          latestInDB: latestYM ? `${Math.floor(latestYM / 100)}-${String(latestYM % 100).padStart(2, '0')}` : null,
          latestFromCBS: `${latestEntry.year}-${String(latestEntry.month).padStart(2, '0')}`,
          inserted,
        };
      } catch (err: any) {
        errors.push(`${dbCode}: ${err.message}`);
        results[dbCode] = { error: err.message };
      }
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ job: 'price-indices', timestamp, error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ job: 'price-indices', timestamp, results, totalInserted, errors }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add api/cron/price-indices.ts
git commit -m "feat(cron): add price indices weekly cron job"
```

---

### Task 8: Mortgage Rates Cron Handler

**Files:**
- Create: `api/cron/mortgage-rates.ts`

- [ ] **Step 1: Write the handler**

Create `api/cron/mortgage-rates.ts`:

```typescript
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

/**
 * Normalize period format to YYYY-MM for consistent comparison.
 * DB stores as date (YYYY-MM-01), BOI returns YYYY-MM.
 */
function normalizePeriod(period: string): string {
  // If it's a full date like "2026-01-01", extract YYYY-MM
  if (period.length === 10) return period.substring(0, 7);
  // Already YYYY-MM
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

        // Get latest period in DB
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

          // Store as first-of-month date
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
```

- [ ] **Step 2: Commit**

```bash
git add api/cron/mortgage-rates.ts
git commit -m "feat(cron): add mortgage rates weekly cron job"
```

---

### Task 9: Construction Stats Cron Handler

**Files:**
- Create: `api/cron/construction-stats.ts`

- [ ] **Step 1: Write the handler**

Create `api/cron/construction-stats.ts`:

```typescript
import { verifyCronAuth } from '../lib/cron-auth';
import { getSupabaseAdmin } from '../lib/supabase-admin';
import { fetchCbsTimeSeries, parseTimeSeriesPeriod, extractTimeSeriesObservations } from '../lib/cbs-api';

interface ConstructionSeries {
  seriesId: number;
  metric: string;
  dataType: string; // 'monthly' or 'quarterly'
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

        // Get latest period in DB for this series
        const { data: latestRows } = await supabase
          .from('construction_stats')
          .select('year, month, quarter')
          .eq('series_id', series.seriesId)
          .order('year', { ascending: false })
          .order('month', { ascending: false })
          .order('quarter', { ascending: false })
          .limit(1);

        const latestRow = latestRows?.[0];
        // Composite key for comparison: year * 1000 + month * 10 + quarter
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
              month: period.month,   // 0 for quarterly
              quarter: period.quarter, // 0 for monthly
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
```

- [ ] **Step 2: Commit**

```bash
git add api/cron/construction-stats.ts
git commit -m "feat(cron): add construction stats weekly cron job"
```

---

### Task 10: Construction Costs Cron Handler

**Files:**
- Create: `api/cron/construction-costs.ts`

- [ ] **Step 1: Write the handler**

Create `api/cron/construction-costs.ts`:

```typescript
import { verifyCronAuth } from '../lib/cron-auth';
import { getSupabaseAdmin } from '../lib/supabase-admin';
import { fetchCbsPriceIndex, parsePriceIndexResponse, normalizeConstructionCost } from '../lib/cbs-api';

const CONSTRUCTION_COST_CODE = 200010;

export default async function handler(req: Request) {
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

    // Get latest in DB
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
```

- [ ] **Step 2: Commit**

```bash
git add api/cron/construction-costs.ts
git commit -m "feat(cron): add construction costs weekly cron job with normalization"
```

---

## Chunk 3: Vercel Configuration + Verification

### Task 11: Update vercel.json

**Files:**
- Modify: `vercel.json`

- [ ] **Step 1: Read vercel.json to see current structure**

- [ ] **Step 2: Add crons array**

Merge the `crons` key into the existing vercel.json alongside existing `rewrites`, `headers`, etc:

```json
"crons": [
  { "path": "/api/cron/exchange-rates", "schedule": "0 18 * * 1-5" },
  { "path": "/api/cron/price-indices", "schedule": "0 10 * * 1" },
  { "path": "/api/cron/mortgage-rates", "schedule": "0 11 * * 1" },
  { "path": "/api/cron/construction-stats", "schedule": "0 12 * * 1" },
  { "path": "/api/cron/construction-costs", "schedule": "0 13 * * 1" }
]
```

- [ ] **Step 3: Commit**

```bash
git add vercel.json
git commit -m "feat(cron): configure 5 cron schedules in vercel.json"
```

---

### Task 12: Run Tests and Verify Build

- [ ] **Step 1: Run the full test suite**

Run: `npx vitest run`
Expected: All tests PASS (existing tests + new cron tests)

- [ ] **Step 2: Verify build still works**

Run: `npm run build`
Expected: Build succeeds (Vite build for frontend; API files are compiled by Vercel separately)

- [ ] **Step 3: Verify all files are committed**

Run: `git status`
Expected: Clean working tree

---

## Post-Implementation Checklist (Manual Steps)

These must be done by the user after the code is deployed:

1. **Run the migration** in Supabase SQL editor: paste contents of `supabase/migrations/20260317_add_upsert_constraints.sql`. If construction_stats has NULL month/quarter values, run the UPDATE statements first.
2. **Add Vercel env vars:**
   - `CRON_SECRET` = any random string (e.g., `openssl rand -hex 32`)
   - `SUPABASE_SERVICE_ROLE_KEY` = from Supabase dashboard → Settings → API → service_role key
3. **Deploy** to Vercel (push the branch, merge PR, or `vercel deploy`)
4. **Test each cron manually:**
   ```bash
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://navlan.io/api/cron/exchange-rates
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://navlan.io/api/cron/price-indices
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://navlan.io/api/cron/mortgage-rates
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://navlan.io/api/cron/construction-stats
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://navlan.io/api/cron/construction-costs
   ```
5. **Verify** new rows appear in Supabase and the live site reflects updated data
