import { describe, it, expect } from 'vitest';
import {
  parsePriceIndexResponse,
  parseTimeSeriesPeriod,
  extractTimeSeriesObservations,
  normalizeConstructionCost,
} from '../../../api/lib/cbs-api';

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
