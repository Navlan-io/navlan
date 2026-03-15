#!/usr/bin/env node
/**
 * Import expansion data (10 JSON files) into Supabase.
 *
 * Usage:
 *   node scripts/import-expansion-data.mjs
 *
 * Requires env vars (or .env file in project root):
 *   VITE_SUPABASE_URL              — your Supabase project URL
 *   VITE_SUPABASE_PUBLISHABLE_KEY  — anon/publishable key (RLS policies must allow inserts)
 *
 * The script reads JSON files from data/expansion/ relative to the repo root.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DATA_DIR = resolve(ROOT, "data", "expansion");

// ---------------------------------------------------------------------------
// Supabase client (anon key — relies on RLS insert policies)
// ---------------------------------------------------------------------------
// Try .env file manually (no dotenv dependency)
function loadEnv() {
  const envPath = resolve(ROOT, ".env");
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  }
}
loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY env vars.");
  console.error("Set them in .env or export them before running this script.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function readJSON(filename) {
  const path = resolve(DATA_DIR, filename);
  return JSON.parse(readFileSync(path, "utf8"));
}

/** Build a map of city_name -> locality id from the localities table. */
async function buildLocalityMap() {
  const { data, error } = await supabase
    .from("localities")
    .select("id, english_name, english_alt_spellings");
  if (error) throw new Error(`Failed to fetch localities: ${error.message}`);

  const map = new Map();
  for (const loc of data) {
    // Primary name
    map.set(loc.english_name.toLowerCase(), loc.id);
    // Alt spellings (pipe-separated)
    if (loc.english_alt_spellings) {
      for (const alt of loc.english_alt_spellings.split("|")) {
        map.set(alt.trim().toLowerCase(), loc.id);
      }
    }
  }
  return map;
}

function lookupLocality(map, cityName) {
  const id = map.get(cityName.toLowerCase());
  if (!id) {
    console.warn(`  ⚠ No locality match for "${cityName}"`);
  }
  return id || null;
}

/** Insert rows in batches (Supabase limit is 1000 per request). */
async function batchInsert(table, rows) {
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from(table).insert(batch);
    if (error) {
      console.error(`  ✗ Error inserting into ${table} (batch ${i}):`, error.message);
      // Log first failing row for debugging
      console.error("    Sample row:", JSON.stringify(batch[0]).slice(0, 300));
      throw error;
    }
    inserted += batch.length;
  }
  return inserted;
}

// ---------------------------------------------------------------------------
// Importers — one per JSON file / table
// ---------------------------------------------------------------------------

async function importNeighborhoods(locMap) {
  console.log("1/10 Importing neighborhoods...");
  const raw = readJSON("task1_neighborhood_profiles.json");
  const rows = [];

  for (const [key, val] of Object.entries(raw)) {
    if (key === "sources") continue;
    const cityName = key;
    const localityId = lookupLocality(locMap, cityName);
    for (const n of val.neighborhoods || []) {
      rows.push({
        city_name: cityName,
        locality_id: localityId,
        name: n.name,
        price_range_min: n.price_range_3_4_room_nis?.min ?? null,
        price_range_max: n.price_range_3_4_room_nis?.max ?? null,
        anglo_presence: n.anglo_presence ?? null,
        religious_character: n.religious_character ?? null,
        key_amenities: n.key_amenities ?? [],
        vibe: n.vibe ?? null,
        best_for: n.best_for ?? [],
        walkability: n.walkability ?? null,
        commute_to_city_center: n.commute_to_city_center ?? null,
        commute_to_employment_hubs: n.commute_to_employment_hubs ?? null,
        new_construction: n.new_construction ?? null,
        confidence: n.confidence ?? null,
      });
    }
  }

  const count = await batchInsert("neighborhoods", rows);
  console.log(`  ✓ ${count} neighborhoods inserted`);
}

async function importArnonaRates(locMap) {
  console.log("2/10 Importing arnona rates...");
  const raw = readJSON("task2_arnona_rates.json");
  const rows = raw.cities.map((c) => ({
    city_name: c.city,
    locality_id: lookupLocality(locMap, c.city),
    rate_per_sqm_nis: c.rate_per_sqm_nis,
    annual_arnona_100sqm_nis: c.annual_arnona_100sqm_nis,
    olim_discount: c.olim_discount ?? null,
    large_family_discount: c.large_family_discount ?? null,
    other_discounts: c.other_discounts ?? null,
    comparison_to_national_average: c.comparison_to_national_average ?? null,
    notes: c.notes ?? null,
    source_url: c.source_url ?? null,
    confidence: c.confidence ?? null,
  }));

  const count = await batchInsert("arnona_rates", rows);
  console.log(`  ✓ ${count} arnona rates inserted`);
}

async function importSchoolData(locMap) {
  console.log("3/10 Importing school data...");
  const raw = readJSON("task3_school_data.json");
  const rows = [];

  for (const [key, val] of Object.entries(raw)) {
    if (key === "sources") continue;
    rows.push({
      city_name: key,
      locality_id: lookupLocality(locMap, key),
      international_schools: val.international_schools ?? [],
      anglo_popular_state_religious_schools: val.anglo_popular_state_religious_schools ?? [],
      ulpan_options: val.ulpan_options ?? [],
      after_school_english_programs: val.after_school_english_programs ?? null,
      english_speaking_ganim: val.english_speaking_ganim ?? null,
      special_education_english: val.special_education_english ?? null,
      notes: val.notes ?? null,
      confidence: val.confidence ?? null,
    });
  }

  const count = await batchInsert("school_data", rows);
  console.log(`  ✓ ${count} school data rows inserted`);
}

async function importSynagogues(locMap) {
  console.log("4/10 Importing synagogues...");
  const raw = readJSON("task4_synagogue_directory.json");
  const rows = [];

  for (const [key, val] of Object.entries(raw)) {
    if (key === "sources") continue;
    const cityName = key;
    const localityId = lookupLocality(locMap, cityName);
    const cityNotes = val.notes ?? null;
    for (const s of val.synagogues || []) {
      rows.push({
        city_name: cityName,
        locality_id: localityId,
        name: s.name,
        denomination: s.denomination ?? null,
        language_of_services: s.language_of_services ?? null,
        neighborhood: s.neighborhood ?? null,
        anglo_programming: s.anglo_programming ?? null,
        womens_tefillah: s.womens_tefillah ?? null,
        partnership_minyan: s.partnership_minyan ?? null,
        website: s.website ?? null,
        confidence: s.confidence ?? null,
        notes: cityNotes,
      });
    }
  }

  const count = await batchInsert("synagogues", rows);
  console.log(`  ✓ ${count} synagogues inserted`);
}

async function importAngloCommunity(locMap) {
  console.log("5/10 Importing Anglo community density...");
  const raw = readJSON("task5_anglo_community_density.json");
  const cities = raw.cities || raw;
  const rows = [];

  for (const [key, val] of Object.entries(cities)) {
    if (key === "metadata" || key === "sources") continue;
    rows.push({
      city_name: key,
      locality_id: lookupLocality(locMap, key),
      approx_english_speaking_families: val.approx_english_speaking_families ?? null,
      anglo_institutions: val.anglo_institutions ?? [],
      anglo_trend: val.anglo_trend ?? null,
      main_source_countries: val.main_source_countries ?? [],
      anglo_neighborhood: val.anglo_neighborhood ?? null,
      key_organizations: val.key_organizations ?? [],
      facebook_groups: val.facebook_groups ?? [],
    });
  }

  const count = await batchInsert("anglo_community_density", rows);
  console.log(`  ✓ ${count} Anglo community rows inserted`);
}

async function importCostOfLiving(locMap) {
  console.log("6/10 Importing cost of living...");
  const raw = readJSON("task6_cost_of_living.json");
  const cities = raw.cities || raw;
  const rows = [];

  for (const [key, val] of Object.entries(cities)) {
    if (key === "metadata" || key === "sources") continue;
    rows.push({
      city_name: key,
      locality_id: lookupLocality(locMap, key),
      grocery_basket_family_of_4_monthly_nis: val.grocery_basket_family_of_4_monthly_nis ?? null,
      utilities_100sqm_monthly_nis: val.utilities_100sqm_monthly_nis ?? null,
      public_transit_monthly_pass_nis: val.public_transit_monthly_pass_nis ?? null,
      childcare_monthly_nis: val.childcare_monthly_nis ?? null,
      restaurant_meal_midrange_2_people_nis: val.restaurant_meal_midrange_2_people_nis ?? null,
      gym_membership_monthly_nis: val.gym_membership_monthly_nis ?? null,
      private_health_supplement_monthly_nis: val.private_health_supplement_monthly_nis ?? null,
      cost_index_vs_national: val.cost_index_vs_national ?? null,
      notes: val.notes ?? null,
      confidence: val.confidence ?? null,
    });
  }

  const count = await batchInsert("cost_of_living", rows);
  console.log(`  ✓ ${count} cost of living rows inserted`);
}

async function importTransportation(locMap) {
  console.log("7/10 Importing transportation & commute...");
  const raw = readJSON("task7_transportation_commute.json");
  const cities = raw.cities || raw;
  const rows = [];

  for (const [key, val] of Object.entries(cities)) {
    if (key === "metadata" || key === "sources") continue;
    rows.push({
      city_name: key,
      locality_id: lookupLocality(locMap, key),
      commute_to_tel_aviv: val.commute_to_tel_aviv ?? null,
      commute_to_jerusalem: val.commute_to_jerusalem ?? null,
      train_station: val.train_station ?? null,
      light_rail: val.light_rail ?? null,
      major_bus_routes: val.major_bus_routes ?? [],
      cycling_infrastructure: val.cycling_infrastructure ?? null,
      ben_gurion_airport: val.ben_gurion_airport ?? null,
    });
  }

  const count = await batchInsert("transportation_commute", rows);
  console.log(`  ✓ ${count} transportation rows inserted`);
}

async function importSafety(locMap) {
  console.log("8/10 Importing safety & security...");
  const raw = readJSON("task8_safety_security.json");
  const rows = [];

  for (const [key, val] of Object.entries(raw)) {
    if (key === "sources" || key === "metadata") continue;
    rows.push({
      city_name: key,
      locality_id: lookupLocality(locMap, key),
      general_security_assessment: val.general_security_assessment ?? null,
      security_notes_for_anglos: val.security_notes_for_anglos ?? null,
      distance_to_nearest_border: val.distance_to_nearest_border_km ?? val.distance_to_nearest_border ?? null,
      border_proximity_concern: val.border_proximity_concern ?? null,
      mamad_prevalence: val.mamad_prevalence ?? null,
      rocket_threat_level: val.rocket_threat_level ?? null,
      security_infrastructure: val.security_infrastructure ?? null,
      current_security_considerations: val.current_security_considerations ?? null,
      crime_level: val.crime_level ?? null,
      notes: val.notes ?? null,
      confidence: val.confidence ?? null,
    });
  }

  const count = await batchInsert("safety_security", rows);
  console.log(`  ✓ ${count} safety rows inserted`);
}

async function importHealthcare(locMap) {
  console.log("9/10 Importing healthcare access...");
  const raw = readJSON("task_bonus_healthcare_access.json");
  const cities = raw.cities || raw;
  const rows = [];

  for (const [key, val] of Object.entries(cities)) {
    if (key === "metadata" || key === "sources") continue;
    rows.push({
      city_name: key,
      locality_id: lookupLocality(locMap, key),
      nearest_major_hospital: val.nearest_major_hospital ?? null,
      kupat_cholim_presence: val.kupat_cholim_presence ?? [],
      english_speaking_doctors: val.english_speaking_doctors ?? null,
      english_speaking_therapists_mental_health: val.english_speaking_therapists_mental_health ?? null,
      pharmacies_with_english_service: val.pharmacies_with_english_service ?? null,
      telemedicine_english: val.telemedicine_english ?? null,
      specialty_medical_centers: val.specialty_medical_centers ?? [],
      ambulance_response_estimate: val.ambulance_response_estimate ?? null,
      notes: val.notes ?? null,
      confidence: val.confidence ?? null,
    });
  }

  const count = await batchInsert("healthcare_access", rows);
  console.log(`  ✓ ${count} healthcare rows inserted`);
}

async function importAliyahRelocation(locMap) {
  console.log("10/10 Importing aliyah & relocation...");
  const raw = readJSON("task_bonus_aliyah_relocation.json");
  const cities = raw.cities || raw;
  const rows = [];

  for (const [key, val] of Object.entries(cities)) {
    if (key === "metadata" || key === "sources") continue;
    rows.push({
      city_name: key,
      locality_id: lookupLocality(locMap, key),
      misrad_hapnim_office: val.misrad_hapnim_office ?? null,
      bituach_leumi_office: val.bituach_leumi_office ?? null,
      banks_with_english_service: val.banks_with_english_service ?? [],
      post_office: val.post_office ?? null,
      english_speaking_lawyers: val.english_speaking_lawyers ?? null,
      english_speaking_accountants: val.english_speaking_accountants ?? null,
      nefesh_bnefesh_regional_office: val.nefesh_bnefesh_regional_office ?? null,
      anglo_real_estate_agents: val.anglo_real_estate_agents ?? null,
      coworking_spaces: val.coworking_spaces ?? [],
      english_friendly_businesses: val.english_friendly_businesses ?? null,
      climate: val.climate ?? null,
      quality_of_life_notes: val.quality_of_life_notes ?? null,
      confidence: val.confidence ?? null,
    });
  }

  const count = await batchInsert("aliyah_relocation", rows);
  console.log(`  ✓ ${count} aliyah relocation rows inserted`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("Building locality name → id map...");
  const locMap = await buildLocalityMap();
  console.log(`  Found ${locMap.size} locality name entries\n`);

  await importNeighborhoods(locMap);
  await importArnonaRates(locMap);
  await importSchoolData(locMap);
  await importSynagogues(locMap);
  await importAngloCommunity(locMap);
  await importCostOfLiving(locMap);
  await importTransportation(locMap);
  await importSafety(locMap);
  await importHealthcare(locMap);
  await importAliyahRelocation(locMap);

  console.log("\n✓ All 10 datasets imported successfully!");
}

main().catch((err) => {
  console.error("\n✗ Import failed:", err.message);
  process.exit(1);
});
