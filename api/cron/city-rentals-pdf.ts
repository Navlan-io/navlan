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

// ── CBS Name Mapping (same as city-prices) ──
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

// ── Entity definitions (22 total: 1 national + 6 districts + 15 cities) ──
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

// ── Quarter logic ──
function nextQuarter(period: string): { quarter: number; year: number; periodStr: string } {
  const match = period.match(/^Q(\d)-(\d{4})$/);
  if (!match) return { quarter: 1, year: 2025, periodStr: 'Q1-2025' };
  let q = parseInt(match[1]);
  let y = parseInt(match[2]);
  q++;
  if (q > 4) { q = 1; y++; }
  return { quarter: q, year: y, periodStr: `Q${q}-${y}` };
}

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
  // Note: rental PDF uses price{MM} (not price{MM}aa) and a4_9_e.pdf
  const url = `https://www.cbs.gov.il/he/publications/Madad/DocLib/${year}/price${mm}/a4_9_e.pdf`;
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
function extractNumbers(text: string): (number | null)[] {
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
interface CityRentalRecord {
  cbsCode: number;
  cityName: string;
  district: string;
  period: string;
  avgRentTotal: number;
  avgRent1_2Rooms: number | null;
  avgRent2_5_3Rooms: number | null;
  avgRent3_5_4Rooms: number | null;
  avgRent4_5_6Rooms: number | null;
}

function extractRecordsFromPdf(text: string, targetPeriod: string): CityRentalRecord[] {
  const records: CityRentalRecord[] = [];
  const allLines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Track data by section
  const totalRentData = new Map<string, number>();
  const roomData = new Map<string, {
    rooms1_2: number | null; rooms2_5_3: number | null;
    rooms3_5_4: number | null; rooms4_5_6: number | null;
  }>();

  let currentSection = 'unknown';

  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i];

    // Detect section headers for rental room categories
    if (/total/i.test(line) && /average\s*(new\s*)?rent/i.test(line)) {
      currentSection = 'total_rent';
      continue;
    }
    if (/1[\s-]*2\s*rooms/i.test(line)) {
      currentSection = 'rooms_1_2';
      continue;
    }
    if (/2[\s.]*5[\s-]*3\s*rooms/i.test(line)) {
      currentSection = 'rooms_2_5_3';
      continue;
    }
    if (/3[\s.]*5[\s-]*4\s*rooms/i.test(line)) {
      currentSection = 'rooms_3_5_4';
      continue;
    }
    if (/4[\s.]*5[\s-]*6\s*rooms/i.test(line)) {
      currentSection = 'rooms_4_5_6';
      continue;
    }

    // Try to match entity rows
    for (const entity of ENTITIES) {
      if (line.startsWith(entity.cbsName)) {
        const rest = line.substring(entity.cbsName.length).trim();
        const numbers = extractNumbers(rest);
        if (numbers.length === 0) continue;

        const lastValue = numbers.filter(n => n !== null).pop();
        if (lastValue === null || lastValue === undefined) continue;

        switch (currentSection) {
          case 'total_rent':
            totalRentData.set(entity.cbsName, lastValue);
            break;
          case 'rooms_1_2': {
            const existing = roomData.get(entity.cbsName) ?? { rooms1_2: null, rooms2_5_3: null, rooms3_5_4: null, rooms4_5_6: null };
            existing.rooms1_2 = lastValue;
            roomData.set(entity.cbsName, existing);
            break;
          }
          case 'rooms_2_5_3': {
            const existing = roomData.get(entity.cbsName) ?? { rooms1_2: null, rooms2_5_3: null, rooms3_5_4: null, rooms4_5_6: null };
            existing.rooms2_5_3 = lastValue;
            roomData.set(entity.cbsName, existing);
            break;
          }
          case 'rooms_3_5_4': {
            const existing = roomData.get(entity.cbsName) ?? { rooms1_2: null, rooms2_5_3: null, rooms3_5_4: null, rooms4_5_6: null };
            existing.rooms3_5_4 = lastValue;
            roomData.set(entity.cbsName, existing);
            break;
          }
          case 'rooms_4_5_6': {
            const existing = roomData.get(entity.cbsName) ?? { rooms1_2: null, rooms2_5_3: null, rooms3_5_4: null, rooms4_5_6: null };
            existing.rooms4_5_6 = lastValue;
            roomData.set(entity.cbsName, existing);
            break;
          }
        }
        break;
      }
    }
  }

  // Merge into records
  for (const entity of ENTITIES) {
    const rentTotal = totalRentData.get(entity.cbsName);
    if (rentTotal === undefined) continue;

    const rooms = roomData.get(entity.cbsName);

    records.push({
      cbsCode: entity.cbsCode,
      cityName: mapCbsName(entity.cbsName),
      district: entity.district,
      period: targetPeriod,
      avgRentTotal: rentTotal,
      avgRent1_2Rooms: rooms?.rooms1_2 ?? null,
      avgRent2_5_3Rooms: rooms?.rooms2_5_3 ?? null,
      avgRent3_5_4Rooms: rooms?.rooms3_5_4 ?? null,
      avgRent4_5_6Rooms: rooms?.rooms4_5_6 ?? null,
    });
  }

  return records;
}

// ── Triple Validation ──
interface ValidationResult {
  passed: boolean;
  failures: string[];
}

function validateInternalConsistency(records: CityRentalRecord[]): ValidationResult {
  const failures: string[] = [];

  if (records.length !== 22) {
    failures.push(`Expected 22 entities, got ${records.length}`);
  }

  for (const r of records) {
    if (r.avgRentTotal <= 0) {
      failures.push(`${r.cityName}: zero or negative avg_rent_total (${r.avgRentTotal})`);
    }
    if (r.avgRentTotal === null || r.avgRentTotal === undefined) {
      failures.push(`${r.cityName}: null avg_rent_total`);
    }
  }

  return { passed: failures.length === 0, failures };
}

function validateCrossReference(records: CityRentalRecord[]): ValidationResult {
  const failures: string[] = [];

  const national = records.find(r => r.cityName === 'Total');
  const districtRecords = records.filter(r =>
    r.cityName.endsWith('District') || r.cityName === 'North District' ||
    r.cityName === 'South District' || r.cityName === 'Center District'
  );

  if (national && districtRecords.length > 0) {
    const districtRents = districtRecords.map(r => r.avgRentTotal);
    const minDistrict = Math.min(...districtRents);
    const maxDistrict = Math.max(...districtRents);

    if (national.avgRentTotal < minDistrict * 0.8 || national.avgRentTotal > maxDistrict * 1.2) {
      failures.push(
        `National avg rent (${national.avgRentTotal}) outside district range [${minDistrict}–${maxDistrict}]`
      );
    }
  }

  // Each city's rent within 50% of its district
  for (const city of records) {
    if (city.district === 'National' || city.cityName.includes('District')) continue;
    const district = districtRecords.find(d => d.cityName === city.district || d.district === city.district);
    if (district) {
      const ratio = city.avgRentTotal / district.avgRentTotal;
      if (ratio < 0.5 || ratio > 1.5) {
        failures.push(
          `${city.cityName} rent (${city.avgRentTotal}) is ${Math.round((ratio - 1) * 100)}% from district avg (${district.avgRentTotal})`
        );
      }
    }
  }

  return { passed: failures.length === 0, failures };
}

async function validateHistoricalContinuity(
  records: CityRentalRecord[],
  supabase: SupabaseClient,
  previousPeriod: string | null,
): Promise<ValidationResult> {
  const failures: string[] = [];
  if (!previousPeriod) return { passed: true, failures };

  const { data: prevRecords } = await supabase
    .from('city_rentals')
    .select('cbs_code, avg_rent_total')
    .eq('period', previousPeriod);

  if (!prevRecords || prevRecords.length === 0) return { passed: true, failures };

  const prevMap = new Map(prevRecords.map(r => [r.cbs_code, r]));

  for (const record of records) {
    const prev = prevMap.get(record.cbsCode);
    if (!prev) continue;

    if (prev.avg_rent_total > 0) {
      const change = Math.abs(record.avgRentTotal - prev.avg_rent_total) / prev.avg_rent_total;
      if (change > 0.15) {
        failures.push(
          `${record.cityName}: QoQ rent change ${(change * 100).toFixed(1)}% exceeds 15% threshold`
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

    // 1. Determine next expected quarter
    const { data: latestRow } = await supabase
      .from('city_rentals')
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
        job: 'city-rentals-pdf', timestamp,
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

    // 6. Anomaly detection
    for (const record of records) {
      if (latestPeriod) {
        const { data: prevRow } = await supabase
          .from('city_rentals')
          .select('avg_rent_total')
          .eq('cbs_code', record.cbsCode)
          .eq('period', latestPeriod)
          .maybeSingle();

        if (prevRow?.avg_rent_total && prevRow.avg_rent_total > 0) {
          const change = (record.avgRentTotal - prevRow.avg_rent_total) / prevRow.avg_rent_total;
          if (Math.abs(change) > 0.15) {
            const desc = `${record.cityName} QoQ rent change: ${(change * 100).toFixed(1)}% (threshold: +/-15%)`;
            anomalies.push(desc);
            await logAnomaly(supabase, 'city_rentals', desc,
              Math.abs(change) > 0.25 ? 'critical' : 'warning',
              { city: record.cityName, period: targetPeriod, change: (change * 100).toFixed(1), current: record.avgRentTotal, previous: prevRow.avg_rent_total });
          }
        }
      }
    }

    if (!allValidationsPassed) {
      // Insert into staging
      for (const record of records) {
        await supabase.from('city_rentals_staging').insert({
          cbs_code: record.cbsCode,
          city_name: record.cityName,
          district: record.district,
          period: record.period,
          avg_rent_total: record.avgRentTotal,
          avg_rent_1_2_rooms: record.avgRent1_2Rooms,
          avg_rent_2_5_3_rooms: record.avgRent2_5_3Rooms,
          avg_rent_3_5_4_rooms: record.avgRent3_5_4Rooms,
          avg_rent_4_5_6_rooms: record.avgRent4_5_6Rooms,
        });
      }

      for (const failure of allFailures) {
        await logAnomaly(supabase, 'city_rentals', `Validation failure: ${failure}`, 'critical',
          { period: targetPeriod, issue: usedIssue });
      }

      return new Response(JSON.stringify({
        job: 'city-rentals-pdf', timestamp,
        status: 'staged',
        targetPeriod,
        issue: usedIssue,
        recordCount: records.length,
        validationFailures: allFailures,
        anomalies,
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // 7. All validations passed — upsert into city_rentals
    let inserted = 0;
    const upsertErrors: string[] = [];

    for (const record of records) {
      const { error: upsertError } = await supabase
        .from('city_rentals')
        .upsert({
          cbs_code: record.cbsCode,
          city_name: record.cityName,
          district: record.district,
          period: record.period,
          avg_rent_total: record.avgRentTotal,
          avg_rent_1_2_rooms: record.avgRent1_2Rooms,
          avg_rent_2_5_3_rooms: record.avgRent2_5_3Rooms,
          avg_rent_3_5_4_rooms: record.avgRent3_5_4Rooms,
          avg_rent_4_5_6_rooms: record.avgRent4_5_6Rooms,
          fetched_at: timestamp,
        }, { onConflict: 'cbs_code,period' });

      if (upsertError) {
        upsertErrors.push(`${record.cityName}: ${upsertError.message}`);
      } else {
        inserted++;
      }
    }

    return new Response(JSON.stringify({
      job: 'city-rentals-pdf', timestamp,
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
      job: 'city-rentals-pdf', timestamp,
      error: err.message,
      anomalies,
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
