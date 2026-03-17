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
