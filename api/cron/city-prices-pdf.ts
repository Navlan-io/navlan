import { createClient, SupabaseClient } from '@supabase/supabase-js';
import pdfParse from 'pdf-parse';

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

// ── Config ──
export const config = { maxDuration: 30 };

// ── CBS Name Mapping ──
const CBS_TO_DB_NAME: Record<string, string> = {
  'Total': 'Total',
  'Jerusalem District': 'Jerusalem District',
  'Northern District': 'North District',
  'Haifa District': 'Haifa District',
  'Central District': 'Center District',
  'Tel Aviv District': 'Tel Aviv District',
  'Southern District': 'South District',
  'Tel Aviv-Yafo': 'Tel Aviv',
  'Petah Tiqwa': 'Petah Tikva',
};

function mapCbsName(cbsName: string): string {
  return CBS_TO_DB_NAME[cbsName] ?? cbsName;
}

// ── Entity definitions (24 total: 1 national + 6 districts + 17 cities) ──
interface EntityDef {
  cbsName: string;
  cbsCode: number;
  district: string;
}

const ENTITIES: EntityDef[] = [
  { cbsName: 'Total', cbsCode: 0, district: 'National' },
  { cbsName: 'Jerusalem District', cbsCode: 10, district: 'Jerusalem District' },
  { cbsName: 'Northern District', cbsCode: 20, district: 'North District' },
  { cbsName: 'Haifa District', cbsCode: 30, district: 'Haifa District' },
  { cbsName: 'Central District', cbsCode: 40, district: 'Center District' },
  { cbsName: 'Tel Aviv District', cbsCode: 50, district: 'Tel Aviv District' },
  { cbsName: 'Southern District', cbsCode: 60, district: 'South District' },
  { cbsName: 'Jerusalem', cbsCode: 3000, district: 'Jerusalem District' },
  { cbsName: 'Bet Shemesh', cbsCode: 3770, district: 'Jerusalem District' },
  { cbsName: 'Modi\'in Makkabbim Re\'ut', cbsCode: 1200, district: 'Center District' },
  { cbsName: 'Haifa', cbsCode: 4000, district: 'Haifa District' },
  { cbsName: 'Netanya', cbsCode: 7400, district: 'Center District' },
  { cbsName: 'Rishon LeZiyyon', cbsCode: 8300, district: 'Center District' },
  { cbsName: 'Petah Tiqwa', cbsCode: 7900, district: 'Center District' },
  { cbsName: 'Ashdod', cbsCode: 70, district: 'South District' },
  { cbsName: 'Tel Aviv-Yafo', cbsCode: 5000, district: 'Tel Aviv District' },
  { cbsName: 'Ramat Gan', cbsCode: 8600, district: 'Tel Aviv District' },
  { cbsName: 'Holon', cbsCode: 6600, district: 'Tel Aviv District' },
  { cbsName: 'Bat Yam', cbsCode: 6200, district: 'Tel Aviv District' },
  { cbsName: 'Rehovot', cbsCode: 8400, district: 'Center District' },
  { cbsName: 'Ashqelon', cbsCode: 7100, district: 'South District' },
  { cbsName: 'Be\'er Sheva', cbsCode: 9000, district: 'South District' },
  { cbsName: 'Hadera', cbsCode: 6500, district: 'Haifa District' },
  { cbsName: 'Kefar Sava', cbsCode: 6900, district: 'Center District' },
];

// ── CBS issue number logic ──
// CBS publishes a monthly price bulletin. The URL pattern uses YYYY and MM (2-digit issue number).
// Issues are numbered sequentially within each year.
// Quarterly data typically appears in issues aligned with the quarter end months.

function periodToQuarterNum(period: string): number {
  const match = period.match(/^Q(\d)-(\d{4})$/);
  if (!match) return 0;
  return parseInt(match[2]) * 10 + parseInt(match[1]);
}

function nextQuarter(period: string): { quarter: number; year: number; periodStr: string } {
  const match = period.match(/^Q(\d)-(\d{4})$/);
  if (!match) return { quarter: 1, year: 2025, periodStr: 'Q1-2025' };
  let q = parseInt(match[1]);
  let y = parseInt(match[2]);
  q++;
  if (q > 4) { q = 1; y++; }
  return { quarter: q, year: y, periodStr: `Q${q}-${y}` };
}

// Map quarter to the CBS issue month that typically contains that quarter's data
// Q1 data appears around issue 05-06, Q2 around 08-09, Q3 around 11-12, Q4 around 02-03 of next year
function quarterToIssueMonths(quarter: number, year: number): { issueYear: number; issueMonths: number[] } {
  switch (quarter) {
    case 1: return { issueYear: year, issueMonths: [5, 6, 7] };
    case 2: return { issueYear: year, issueMonths: [8, 9, 10] };
    case 3: return { issueYear: year, issueMonths: [11, 12] };
    case 4: return { issueYear: year + 1, issueMonths: [2, 3, 4] };
    default: return { issueYear: year, issueMonths: [6] };
  }
}

async function tryDownloadPdf(year: number, month: number): Promise<Buffer | null> {
  const mm = String(month).padStart(2, '0');
  const url = `https://www.cbs.gov.il/he/publications/Madad/DocLib/${year}/price${mm}aa/aa2_2_e.pdf`;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

// ── PDF Parsing ──
interface ParsedRow {
  entityName: string;
  values: (number | null)[];
}

interface ParsedTable {
  columnHeaders: string[];
  rows: ParsedRow[];
}

function parseTableFromText(text: string): ParsedTable {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const columnHeaders: string[] = [];
  const rows: ParsedRow[] = [];

  // Find column headers - look for patterns like "2024", "Q1", "Q2", etc.
  // The header section contains year labels and quarter labels
  let headerFound = false;
  let dataStartIdx = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Look for a line that has quarter patterns or year patterns
    if (/\b20\d{2}\b/.test(line) && /\b(Q[1-4]|Annual)\b/i.test(line)) {
      // This is likely a header line - extract column identifiers
      const quarterMatches = line.match(/Q[1-4]\s*[-–]\s*20\d{2}|20\d{2}\s*[-–]?\s*Annual|20\d{2}/g);
      if (quarterMatches) {
        columnHeaders.push(...quarterMatches.map(h => h.trim()));
      }
      headerFound = true;
      continue;
    }
    if (headerFound && !line.match(/^(NIS|thousands|Average|Number|price|transactions)/i)) {
      // Try to match data rows - entity name followed by numbers
      // Entity names may contain spaces, apostrophes, etc.
      const entityMatch = matchEntityRow(line);
      if (entityMatch) {
        rows.push(entityMatch);
      }
    }
  }

  return { columnHeaders, rows };
}

function matchEntityRow(line: string): ParsedRow | null {
  // Try to match known entity names at the start of the line
  for (const entity of ENTITIES) {
    if (line.startsWith(entity.cbsName) || line.startsWith(mapCbsName(entity.cbsName))) {
      const name = line.startsWith(entity.cbsName) ? entity.cbsName : mapCbsName(entity.cbsName);
      const rest = line.substring(name.length).trim();
      const numbers = extractNumbers(rest);
      if (numbers.length > 0) {
        return { entityName: entity.cbsName, values: numbers };
      }
    }
  }
  return null;
}

function extractNumbers(text: string): (number | null)[] {
  // Extract numbers from a string, handling thousands formatting
  const parts = text.split(/\s+/);
  const numbers: (number | null)[] = [];
  for (const part of parts) {
    const cleaned = part.replace(/,/g, '');
    const num = parseFloat(cleaned);
    if (!isNaN(num)) {
      numbers.push(num);
    } else if (part === '-' || part === '..') {
      numbers.push(null);
    }
  }
  return numbers;
}

// ── Structured data extraction ──
interface CityPriceRecord {
  cbsCode: number;
  cityName: string;
  district: string;
  period: string;
  avgPriceTotal: number;
  transactionsTotal: number;
  avgPrice1_2Rooms: number | null;
  avgPrice3Rooms: number | null;
  avgPrice4Rooms: number | null;
  avgPrice5Rooms: number | null;
  avgPrice6Rooms: number | null;
}

function extractRecordsFromPdf(text: string, targetPeriod: string): CityPriceRecord[] {
  const records: CityPriceRecord[] = [];
  const pages = text.split(/\f/); // Form feed separates pages

  // Page 1 typically has the total/average prices table
  // Pages 2-4 have room-count breakdowns
  // We need to parse all pages and merge data

  // First pass: extract total prices and transaction counts
  const totalPriceData = new Map<string, { avgPrice: number; transactions: number }>();
  const roomPriceData = new Map<string, {
    rooms1_2: number | null; rooms3: number | null;
    rooms4: number | null; rooms5: number | null; rooms6: number | null;
  }>();

  // Parse all text looking for entity rows with numeric data
  const allLines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // The PDF has multiple tables - we need to identify which table we're in
  // by looking for section headers
  let currentSection = 'unknown';

  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i];

    // Detect section headers
    if (/average\s*price/i.test(line) && /total/i.test(line)) {
      currentSection = 'total_price';
      continue;
    }
    if (/number\s*of\s*transactions/i.test(line) || /transactions/i.test(line)) {
      currentSection = 'transactions';
      continue;
    }
    if (/1[\s-]*2\s*rooms/i.test(line)) {
      currentSection = 'rooms_1_2';
      continue;
    }
    if (/\b3\s*rooms/i.test(line) && !/2[\s.]*5/i.test(line)) {
      currentSection = 'rooms_3';
      continue;
    }
    if (/\b4\s*rooms/i.test(line)) {
      currentSection = 'rooms_4';
      continue;
    }
    if (/\b5\s*rooms/i.test(line)) {
      currentSection = 'rooms_5';
      continue;
    }
    if (/\b6\s*rooms/i.test(line)) {
      currentSection = 'rooms_6';
      continue;
    }

    // Try to match entity rows
    for (const entity of ENTITIES) {
      if (line.startsWith(entity.cbsName)) {
        const rest = line.substring(entity.cbsName.length).trim();
        const numbers = extractNumbers(rest);

        if (numbers.length === 0) continue;

        // The newest quarter column is typically the last or second-to-last numeric column
        // We take the last non-null value as the target period data
        const lastValue = numbers.filter(n => n !== null).pop();
        if (lastValue === null || lastValue === undefined) continue;

        switch (currentSection) {
          case 'total_price': {
            const existing = totalPriceData.get(entity.cbsName) ?? { avgPrice: 0, transactions: 0 };
            existing.avgPrice = lastValue;
            totalPriceData.set(entity.cbsName, existing);
            break;
          }
          case 'transactions': {
            const existing = totalPriceData.get(entity.cbsName) ?? { avgPrice: 0, transactions: 0 };
            existing.transactions = lastValue;
            totalPriceData.set(entity.cbsName, existing);
            break;
          }
          case 'rooms_1_2': {
            const existing = roomPriceData.get(entity.cbsName) ?? { rooms1_2: null, rooms3: null, rooms4: null, rooms5: null, rooms6: null };
            existing.rooms1_2 = lastValue;
            roomPriceData.set(entity.cbsName, existing);
            break;
          }
          case 'rooms_3': {
            const existing = roomPriceData.get(entity.cbsName) ?? { rooms1_2: null, rooms3: null, rooms4: null, rooms5: null, rooms6: null };
            existing.rooms3 = lastValue;
            roomPriceData.set(entity.cbsName, existing);
            break;
          }
          case 'rooms_4': {
            const existing = roomPriceData.get(entity.cbsName) ?? { rooms1_2: null, rooms3: null, rooms4: null, rooms5: null, rooms6: null };
            existing.rooms4 = lastValue;
            roomPriceData.set(entity.cbsName, existing);
            break;
          }
          case 'rooms_5': {
            const existing = roomPriceData.get(entity.cbsName) ?? { rooms1_2: null, rooms3: null, rooms4: null, rooms5: null, rooms6: null };
            existing.rooms5 = lastValue;
            roomPriceData.set(entity.cbsName, existing);
            break;
          }
          case 'rooms_6': {
            const existing = roomPriceData.get(entity.cbsName) ?? { rooms1_2: null, rooms3: null, rooms4: null, rooms5: null, rooms6: null };
            existing.rooms6 = lastValue;
            roomPriceData.set(entity.cbsName, existing);
            break;
          }
        }
        break; // matched this entity, move to next line
      }
    }
  }

  // Merge into records
  for (const entity of ENTITIES) {
    const priceData = totalPriceData.get(entity.cbsName);
    if (!priceData) continue;

    const rooms = roomPriceData.get(entity.cbsName);

    records.push({
      cbsCode: entity.cbsCode,
      cityName: mapCbsName(entity.cbsName),
      district: entity.district,
      period: targetPeriod,
      avgPriceTotal: priceData.avgPrice,
      transactionsTotal: priceData.transactions,
      avgPrice1_2Rooms: rooms?.rooms1_2 ?? null,
      avgPrice3Rooms: rooms?.rooms3 ?? null,
      avgPrice4Rooms: rooms?.rooms4 ?? null,
      avgPrice5Rooms: rooms?.rooms5 ?? null,
      avgPrice6Rooms: rooms?.rooms6 ?? null,
    });
  }

  return records;
}

// ── Triple Validation ──
interface ValidationResult {
  passed: boolean;
  failures: string[];
}

function validateInternalConsistency(records: CityPriceRecord[]): ValidationResult {
  const failures: string[] = [];

  if (records.length !== 24) {
    failures.push(`Expected 24 entities, got ${records.length}`);
  }

  for (const r of records) {
    if (r.avgPriceTotal <= 0) {
      failures.push(`${r.cityName}: zero or negative avg_price_total (${r.avgPriceTotal})`);
    }
    if (r.avgPriceTotal === null || r.avgPriceTotal === undefined) {
      failures.push(`${r.cityName}: null avg_price_total`);
    }
    if (r.transactionsTotal <= 0) {
      failures.push(`${r.cityName}: zero or negative transactions_total (${r.transactionsTotal})`);
    }
  }

  return { passed: failures.length === 0, failures };
}

function validateCrossReference(records: CityPriceRecord[]): ValidationResult {
  const failures: string[] = [];

  const national = records.find(r => r.cityName === 'Total');
  const districts = records.filter(r => r.district !== 'National' && !r.cityName.includes('District') === false);
  const districtRecords = records.filter(r => r.cityName.endsWith('District') || r.cityName === 'North District' || r.cityName === 'South District' || r.cityName === 'Center District');

  if (national && districtRecords.length > 0) {
    const districtPrices = districtRecords.map(r => r.avgPriceTotal);
    const minDistrict = Math.min(...districtPrices);
    const maxDistrict = Math.max(...districtPrices);

    if (national.avgPriceTotal < minDistrict * 0.8 || national.avgPriceTotal > maxDistrict * 1.2) {
      failures.push(
        `National avg (${national.avgPriceTotal}) outside district range [${minDistrict}–${maxDistrict}]`
      );
    }
  }

  // Check each city's price is within 50% of its district average
  for (const city of records) {
    if (city.district === 'National' || city.cityName.includes('District')) continue;
    const district = districtRecords.find(d => d.cityName === city.district || d.district === city.district);
    if (district) {
      const ratio = city.avgPriceTotal / district.avgPriceTotal;
      if (ratio < 0.5 || ratio > 1.5) {
        failures.push(
          `${city.cityName} price (${city.avgPriceTotal}) is ${Math.round((ratio - 1) * 100)}% from district avg (${district.avgPriceTotal})`
        );
      }
    }
  }

  return { passed: failures.length === 0, failures };
}

async function validateHistoricalContinuity(
  records: CityPriceRecord[],
  supabase: SupabaseClient,
  previousPeriod: string | null,
): Promise<ValidationResult> {
  const failures: string[] = [];

  if (!previousPeriod) return { passed: true, failures };

  const { data: prevRecords } = await supabase
    .from('city_prices')
    .select('cbs_code, avg_price_total, transactions_total')
    .eq('period', previousPeriod);

  if (!prevRecords || prevRecords.length === 0) return { passed: true, failures };

  const prevMap = new Map(prevRecords.map(r => [r.cbs_code, r]));

  for (const record of records) {
    const prev = prevMap.get(record.cbsCode);
    if (!prev) continue;

    // Price change > 20%
    if (prev.avg_price_total > 0) {
      const priceChange = Math.abs(record.avgPriceTotal - prev.avg_price_total) / prev.avg_price_total;
      if (priceChange > 0.20) {
        failures.push(
          `${record.cityName}: QoQ price change ${(priceChange * 100).toFixed(1)}% exceeds 20% threshold`
        );
      }
    }

    // Transaction count dropped > 70%
    if (prev.transactions_total > 0) {
      const txDrop = (prev.transactions_total - record.transactionsTotal) / prev.transactions_total;
      if (txDrop > 0.70) {
        failures.push(
          `${record.cityName}: transactions dropped ${(txDrop * 100).toFixed(1)}% (${prev.transactions_total} → ${record.transactionsTotal})`
        );
      }
    }
  }

  return { passed: failures.length === 0, failures };
}

// ── Anomaly logging ──
async function logAnomaly(
  supabase: SupabaseClient,
  source: string,
  description: string,
  severity: 'warning' | 'critical',
  data: any,
) {
  await supabase.from('anomaly_log').insert({
    source,
    description,
    severity,
    data,
  });
}

// ── Handler ──
export async function GET(req: Request) {
  const authError = verifyCronAuth(req.headers);
  if (authError) return authError;

  const timestamp = new Date().toISOString();
  const anomalies: string[] = [];

  try {
    const supabase = getSupabaseAdmin();

    // 1. Determine the next expected CBS issue
    const { data: latestRow } = await supabase
      .from('city_prices')
      .select('period')
      .like('period', 'Q%')
      .order('period', { ascending: false })
      .limit(1)
      .maybeSingle();

    const latestPeriod = latestRow?.period ?? 'Q4-2024';
    const next = nextQuarter(latestPeriod);
    const targetPeriod = next.periodStr;

    // 2. Try to download the PDF
    const { issueYear, issueMonths } = quarterToIssueMonths(next.quarter, next.year);

    let pdfBuffer: Buffer | null = null;
    let usedIssue = '';
    for (const month of issueMonths) {
      pdfBuffer = await tryDownloadPdf(issueYear, month);
      if (pdfBuffer) {
        usedIssue = `${issueYear}/${String(month).padStart(2, '0')}`;
        break;
      }
    }

    if (!pdfBuffer) {
      return new Response(JSON.stringify({
        job: 'city-prices-pdf', timestamp,
        status: 'no_new_data',
        latestPeriod,
        targetPeriod,
        triedIssues: issueMonths.map(m => `${issueYear}/${String(m).padStart(2, '0')}`),
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // 3. Parse the PDF
    const pdfData = await pdfParse(pdfBuffer);
    const text = pdfData.text;

    // 4. Extract structured records
    const records = extractRecordsFromPdf(text, targetPeriod);

    // 5. Triple validation
    const internalResult = validateInternalConsistency(records);
    const crossRefResult = validateCrossReference(records);
    const historicalResult = await validateHistoricalContinuity(records, supabase, latestPeriod);

    const allValidationsPassed = internalResult.passed && crossRefResult.passed && historicalResult.passed;
    const allFailures = [
      ...internalResult.failures.map(f => `[internal] ${f}`),
      ...crossRefResult.failures.map(f => `[cross-ref] ${f}`),
      ...historicalResult.failures.map(f => `[historical] ${f}`),
    ];

    // 6. Anomaly detection for records that pass validation
    for (const record of records) {
      // QoQ bounds check
      if (latestPeriod) {
        const { data: prevRow } = await supabase
          .from('city_prices')
          .select('avg_price_total')
          .eq('cbs_code', record.cbsCode)
          .eq('period', latestPeriod)
          .maybeSingle();

        if (prevRow?.avg_price_total && prevRow.avg_price_total > 0) {
          const change = (record.avgPriceTotal - prevRow.avg_price_total) / prevRow.avg_price_total;
          if (Math.abs(change) > 0.20) {
            const desc = `${record.cityName} QoQ change: ${(change * 100).toFixed(1)}% (threshold: +/-20%)`;
            anomalies.push(desc);
            await logAnomaly(supabase, 'city_prices', desc,
              Math.abs(change) > 0.30 ? 'critical' : 'warning',
              { city: record.cityName, period: targetPeriod, change: (change * 100).toFixed(1), current: record.avgPriceTotal, previous: prevRow.avg_price_total });
          }
        }
      }

      if (record.transactionsTotal <= 0) {
        const desc = `${record.cityName} transaction count <= 0 (${record.transactionsTotal})`;
        anomalies.push(desc);
        await logAnomaly(supabase, 'city_prices', desc, 'critical',
          { city: record.cityName, period: targetPeriod, transactions: record.transactionsTotal });
      }
    }

    if (!allValidationsPassed) {
      // Insert into staging
      for (const record of records) {
        await supabase.from('city_prices_staging').insert({
          cbs_code: record.cbsCode,
          city_name: record.cityName,
          district: record.district,
          period: record.period,
          avg_price_total: record.avgPriceTotal,
          transactions_total: record.transactionsTotal,
          avg_price_1_2_rooms: record.avgPrice1_2Rooms,
          avg_price_3_rooms: record.avgPrice3Rooms,
          avg_price_4_rooms: record.avgPrice4Rooms,
          avg_price_5_rooms: record.avgPrice5Rooms,
          avg_price_6_rooms: record.avgPrice6Rooms,
        });
      }

      // Log validation failures as anomalies
      for (const failure of allFailures) {
        await logAnomaly(supabase, 'city_prices', `Validation failure: ${failure}`, 'critical',
          { period: targetPeriod, issue: usedIssue });
      }

      return new Response(JSON.stringify({
        job: 'city-prices-pdf', timestamp,
        status: 'staged',
        targetPeriod,
        issue: usedIssue,
        recordCount: records.length,
        validationFailures: allFailures,
        anomalies,
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // 7. All validations passed — upsert into city_prices
    let inserted = 0;
    const upsertErrors: string[] = [];

    for (const record of records) {
      const { error: upsertError } = await supabase
        .from('city_prices')
        .upsert({
          cbs_code: record.cbsCode,
          city_name: record.cityName,
          district: record.district,
          period: record.period,
          avg_price_total: record.avgPriceTotal,
          transactions_total: record.transactionsTotal,
          avg_price_1_2_rooms: record.avgPrice1_2Rooms,
          avg_price_3_rooms: record.avgPrice3Rooms,
          avg_price_4_rooms: record.avgPrice4Rooms,
          avg_price_5_rooms: record.avgPrice5Rooms,
          avg_price_6_rooms: record.avgPrice6Rooms,
          fetched_at: timestamp,
        }, { onConflict: 'cbs_code,period' });

      if (upsertError) {
        upsertErrors.push(`${record.cityName}: ${upsertError.message}`);
      } else {
        inserted++;
      }
    }

    return new Response(JSON.stringify({
      job: 'city-prices-pdf', timestamp,
      status: 'inserted',
      targetPeriod,
      issue: usedIssue,
      inserted,
      total: records.length,
      anomalies,
      errors: upsertErrors,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({
      job: 'city-prices-pdf', timestamp,
      error: err.message,
      anomalies,
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
