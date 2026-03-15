-- ============================================================
-- EXPANSION TABLES — 10 new data tables for 54 Israeli cities
-- Run in Lovable's Supabase SQL editor (paste in blocks if needed)
-- ============================================================

-- 1. NEIGHBORHOODS (multiple rows per city)
CREATE TABLE IF NOT EXISTS neighborhoods (
  id bigint generated always as identity primary key,
  city_name text not null,
  locality_id bigint references localities(id),
  name text not null,
  price_range_min integer,
  price_range_max integer,
  anglo_presence text,
  religious_character text,
  key_amenities jsonb default '[]'::jsonb,
  vibe text,
  best_for jsonb default '[]'::jsonb,
  walkability text,
  commute_to_city_center text,
  commute_to_employment_hubs text,
  new_construction text,
  confidence text
);

-- 2. ARNONA RATES (one row per city)
CREATE TABLE IF NOT EXISTS arnona_rates (
  id bigint generated always as identity primary key,
  city_name text not null unique,
  locality_id bigint references localities(id),
  rate_per_sqm_nis numeric,
  annual_arnona_100sqm_nis numeric,
  olim_discount text,
  large_family_discount text,
  other_discounts text,
  comparison_to_national_average text,
  notes text,
  source_url text,
  confidence text
);

-- 3. SCHOOL DATA (one row per city)
CREATE TABLE IF NOT EXISTS school_data (
  id bigint generated always as identity primary key,
  city_name text not null unique,
  locality_id bigint references localities(id),
  international_schools jsonb default '[]'::jsonb,
  anglo_popular_state_religious_schools jsonb default '[]'::jsonb,
  ulpan_options jsonb default '[]'::jsonb,
  after_school_english_programs jsonb,
  english_speaking_ganim jsonb,
  special_education_english text,
  notes text,
  confidence text
);

-- 4. SYNAGOGUES (multiple rows per city)
CREATE TABLE IF NOT EXISTS synagogues (
  id bigint generated always as identity primary key,
  city_name text not null,
  locality_id bigint references localities(id),
  name text not null,
  denomination text,
  language_of_services text,
  neighborhood text,
  anglo_programming text,
  womens_tefillah boolean,
  partnership_minyan boolean,
  website text,
  confidence text,
  notes text
);

-- 5. ANGLO COMMUNITY DENSITY (one row per city)
CREATE TABLE IF NOT EXISTS anglo_community_density (
  id bigint generated always as identity primary key,
  city_name text not null unique,
  locality_id bigint references localities(id),
  approx_english_speaking_families text,
  anglo_institutions jsonb default '[]'::jsonb,
  anglo_trend text,
  main_source_countries jsonb default '[]'::jsonb,
  anglo_neighborhood text,
  key_organizations jsonb default '[]'::jsonb,
  facebook_groups jsonb default '[]'::jsonb
);

-- 6. COST OF LIVING (one row per city)
CREATE TABLE IF NOT EXISTS cost_of_living (
  id bigint generated always as identity primary key,
  city_name text not null unique,
  locality_id bigint references localities(id),
  grocery_basket_family_of_4_monthly_nis numeric,
  utilities_100sqm_monthly_nis jsonb,
  public_transit_monthly_pass_nis numeric,
  childcare_monthly_nis jsonb,
  restaurant_meal_midrange_2_people_nis numeric,
  gym_membership_monthly_nis numeric,
  private_health_supplement_monthly_nis numeric,
  cost_index_vs_national text,
  notes text,
  confidence text
);

-- 7. TRANSPORTATION & COMMUTE (one row per city)
CREATE TABLE IF NOT EXISTS transportation_commute (
  id bigint generated always as identity primary key,
  city_name text not null unique,
  locality_id bigint references localities(id),
  commute_to_tel_aviv jsonb,
  commute_to_jerusalem jsonb,
  train_station jsonb,
  light_rail jsonb,
  major_bus_routes jsonb default '[]'::jsonb,
  cycling_infrastructure text,
  ben_gurion_airport jsonb
);

-- 8. SAFETY & SECURITY (one row per city)
CREATE TABLE IF NOT EXISTS safety_security (
  id bigint generated always as identity primary key,
  city_name text not null unique,
  locality_id bigint references localities(id),
  general_security_assessment text,
  security_notes_for_anglos text,
  distance_to_nearest_border jsonb,
  border_proximity_concern text,
  mamad_prevalence jsonb,
  rocket_threat_level text,
  security_infrastructure text,
  current_security_considerations text,
  crime_level text,
  notes text,
  confidence text
);

-- 9. HEALTHCARE ACCESS (one row per city)
CREATE TABLE IF NOT EXISTS healthcare_access (
  id bigint generated always as identity primary key,
  city_name text not null unique,
  locality_id bigint references localities(id),
  nearest_major_hospital jsonb,
  kupat_cholim_presence jsonb default '[]'::jsonb,
  english_speaking_doctors text,
  english_speaking_therapists_mental_health text,
  pharmacies_with_english_service text,
  telemedicine_english text,
  specialty_medical_centers jsonb default '[]'::jsonb,
  ambulance_response_estimate text,
  notes text,
  confidence text
);

-- 10. ALIYAH & RELOCATION (one row per city)
CREATE TABLE IF NOT EXISTS aliyah_relocation (
  id bigint generated always as identity primary key,
  city_name text not null unique,
  locality_id bigint references localities(id),
  misrad_hapnim_office jsonb,
  bituach_leumi_office jsonb,
  banks_with_english_service jsonb default '[]'::jsonb,
  post_office jsonb,
  english_speaking_lawyers text,
  english_speaking_accountants text,
  nefesh_bnefesh_regional_office text,
  anglo_real_estate_agents text,
  coworking_spaces jsonb default '[]'::jsonb,
  english_friendly_businesses text,
  climate jsonb,
  quality_of_life_notes text,
  confidence text
);

-- ============================================================
-- INDEXES (city_name lookups + locality_id joins)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_neighborhoods_city ON neighborhoods(city_name);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_locality ON neighborhoods(locality_id);
CREATE INDEX IF NOT EXISTS idx_synagogues_city ON synagogues(city_name);
CREATE INDEX IF NOT EXISTS idx_synagogues_locality ON synagogues(locality_id);
CREATE INDEX IF NOT EXISTS idx_arnona_locality ON arnona_rates(locality_id);
CREATE INDEX IF NOT EXISTS idx_school_locality ON school_data(locality_id);
CREATE INDEX IF NOT EXISTS idx_anglo_locality ON anglo_community_density(locality_id);
CREATE INDEX IF NOT EXISTS idx_col_locality ON cost_of_living(locality_id);
CREATE INDEX IF NOT EXISTS idx_transport_locality ON transportation_commute(locality_id);
CREATE INDEX IF NOT EXISTS idx_safety_locality ON safety_security(locality_id);
CREATE INDEX IF NOT EXISTS idx_healthcare_locality ON healthcare_access(locality_id);
CREATE INDEX IF NOT EXISTS idx_aliyah_locality ON aliyah_relocation(locality_id);

-- ============================================================
-- ROW LEVEL SECURITY (public read, same as existing tables)
-- ============================================================
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE arnona_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE synagogues ENABLE ROW LEVEL SECURITY;
ALTER TABLE anglo_community_density ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_of_living ENABLE ROW LEVEL SECURITY;
ALTER TABLE transportation_commute ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_security ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE aliyah_relocation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON neighborhoods FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON arnona_rates FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON school_data FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON synagogues FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON anglo_community_density FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON cost_of_living FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON transportation_commute FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON safety_security FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON healthcare_access FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON aliyah_relocation FOR SELECT USING (true);
