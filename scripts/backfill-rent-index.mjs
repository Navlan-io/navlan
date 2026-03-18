/**
 * One-off script: Re-fetch historical rent index (50010) from CBS
 * to fix base-period mismatch (old base pre-Jan 2025 vs current base).
 *
 * Usage: node scripts/backfill-rent-index.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xkgsgswxauguhyucauxg.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!SUPABASE_KEY) {
  console.error('Missing VITE_SUPABASE_PUBLISHABLE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

const CBS_URL =
  'https://api.cbs.gov.il/index/data/price?id=120460&format=json&lang=en&last=100';

async function main() {
  // 1. Fetch from CBS
  console.log('Fetching CBS rent index (120460) with last=100 …');
  const res = await fetch(CBS_URL, {
    headers: { 'User-Agent': 'Navlan/1.0' },
  });
  if (!res.ok) throw new Error(`CBS API returned ${res.status}`);
  const data = await res.json();

  // 2. Parse
  const rows = [];
  if (!data?.month?.length) throw new Error('No month array in CBS response');
  for (const series of data.month) {
    if (!series.date?.length) continue;
    for (const d of series.date) {
      rows.push({
        index_code: 50010,
        index_name: 'CPI Rent Sub-Component',
        year: d.year,
        month: d.month,
        value: d.currBase?.value ?? 0,
        percent_mom: d.percent ?? null,
        percent_yoy: d.percentYear ?? null,
        base_desc: d.currBase?.baseDesc ?? '',
        fetched_at: new Date().toISOString(),
      });
    }
  }
  console.log(`Parsed ${rows.length} rows from CBS response.`);

  // 2b. Chain-link old-base values onto the new base ("Average 2024").
  // CBS rebased in Jan 2025: pre-2025 data is on "Average 2022", post is "Average 2024".
  // By definition, the average of all 2024 monthly values on the new base = 100.
  // So: conversion_factor = 100 / mean(2024 values on old base).
  const TARGET_BASE = 'Average 2024';
  const oldBaseRows = rows.filter((r) => r.base_desc !== TARGET_BASE);
  const year2024Rows = rows.filter(
    (r) => r.year === 2024 && r.base_desc !== TARGET_BASE,
  );

  if (oldBaseRows.length > 0 && year2024Rows.length > 0) {
    const mean2024 =
      year2024Rows.reduce((s, r) => s + r.value, 0) / year2024Rows.length;
    const factor = 100 / mean2024;
    console.log(
      `Rebasing ${oldBaseRows.length} old-base rows: mean(2024)=${mean2024.toFixed(2)}, factor=${factor.toFixed(6)}`,
    );
    for (const r of oldBaseRows) {
      r.value = Math.round(r.value * factor * 10) / 10; // keep 1 decimal
      r.base_desc = TARGET_BASE; // mark as rebased
    }
  } else {
    console.log('All rows already on target base — no rebasing needed.');
  }

  // 3. Upsert in batches of 50
  let upserted = 0;
  const BATCH = 50;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase
      .from('price_indices')
      .upsert(batch, { onConflict: 'index_code,year,month' });
    if (error) {
      console.error(`Upsert error at batch ${i}:`, error.message);
    } else {
      upserted += batch.length;
    }
  }
  console.log(`Upserted ${upserted} rows into price_indices.`);

  // 4. Verify: check 2024-2025 values for the cliff
  const { data: verify, error: verifyErr } = await supabase
    .from('price_indices')
    .select('year, month, value')
    .eq('index_code', 50010)
    .in('year', [2024, 2025])
    .order('year', { ascending: true })
    .order('month', { ascending: true });

  if (verifyErr) {
    console.error('Verification query failed:', verifyErr.message);
  } else {
    console.log('\nVerification — index_code=50010 for 2024-2025:');
    console.table(verify);
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
