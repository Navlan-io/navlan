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
