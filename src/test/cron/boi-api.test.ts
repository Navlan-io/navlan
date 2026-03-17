import { describe, it, expect } from 'vitest';
import { parseBoiCsv, parseBoiMortgageCsv } from '../../../api/lib/boi-api';

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
