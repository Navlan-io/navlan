
-- 1. City-level price data (CBS Table 2.2)
CREATE TABLE city_prices (
  id SERIAL PRIMARY KEY,
  cbs_code INTEGER NOT NULL,
  city_name TEXT NOT NULL,
  district TEXT NOT NULL,
  period TEXT NOT NULL,
  avg_price_total NUMERIC(10,1),
  avg_price_1_2_rooms NUMERIC(10,1),
  avg_price_3_rooms NUMERIC(10,1),
  avg_price_4_rooms NUMERIC(10,1),
  avg_price_5_rooms NUMERIC(10,1),
  avg_price_6_rooms NUMERIC(10,1),
  transactions_total INTEGER,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(cbs_code, period)
);

-- 2. CBS dwelling price indices (national + district)
CREATE TABLE price_indices (
  id SERIAL PRIMARY KEY,
  index_code INTEGER NOT NULL,
  index_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  value NUMERIC(10,2),
  percent_mom NUMERIC(6,3),
  percent_yoy NUMERIC(6,3),
  base_desc TEXT,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(index_code, year, month)
);

-- 3. Mortgage rates (BOI aggregate)
CREATE TABLE mortgage_rates (
  id SERIAL PRIMARY KEY,
  series_key TEXT NOT NULL,
  track_type TEXT NOT NULL,
  track_label TEXT NOT NULL,
  rate_type TEXT NOT NULL,
  period DATE NOT NULL,
  value NUMERIC(6,3),
  fetched_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(series_key, period)
);

-- 4. Exchange rates (BOI daily)
CREATE TABLE exchange_rates (
  id SERIAL PRIMARY KEY,
  currency TEXT NOT NULL,
  rate_date DATE NOT NULL,
  rate NUMERIC(8,4),
  fetched_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(currency, rate_date)
);

-- 5. Construction statistics
CREATE TABLE construction_stats (
  id SERIAL PRIMARY KEY,
  series_id INTEGER NOT NULL,
  metric TEXT NOT NULL,
  district TEXT,
  year INTEGER NOT NULL,
  month INTEGER,
  quarter INTEGER,
  value NUMERIC(12,2),
  data_type TEXT,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(series_id, year, month, quarter)
);

-- 6. Construction cost index
CREATE TABLE construction_costs (
  id SERIAL PRIMARY KEY,
  index_code INTEGER NOT NULL,
  index_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  value NUMERIC(10,2),
  percent_mom NUMERIC(6,3),
  percent_yoy NUMERIC(6,3),
  fetched_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(index_code, year, month)
);

-- 7. Localities (city/neighborhood mapping)
CREATE TABLE localities (
  id SERIAL PRIMARY KEY,
  cbs_code INTEGER,
  hebrew_name TEXT,
  english_name TEXT NOT NULL,
  english_alt_spellings TEXT,
  district TEXT NOT NULL,
  is_anglo_city BOOLEAN DEFAULT false,
  population INTEGER,
  entity_type TEXT,
  parent_city TEXT
);

-- 8. City editorial profiles
CREATE TABLE city_profiles (
  id SERIAL PRIMARY KEY,
  city_name TEXT NOT NULL UNIQUE,
  tier INTEGER,
  overview TEXT,
  anglo_community TEXT,
  religious_infrastructure TEXT,
  education TEXT,
  transportation TEXT,
  lifestyle TEXT,
  real_estate_character TEXT,
  costs_of_living TEXT,
  who_best_for TEXT,
  what_to_know TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE city_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_indices ENABLE ROW LEVEL SECURITY;
ALTER TABLE mortgage_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE localities ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_profiles ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read access" ON city_prices FOR SELECT USING (true);
CREATE POLICY "Public read access" ON price_indices FOR SELECT USING (true);
CREATE POLICY "Public read access" ON mortgage_rates FOR SELECT USING (true);
CREATE POLICY "Public read access" ON exchange_rates FOR SELECT USING (true);
CREATE POLICY "Public read access" ON construction_stats FOR SELECT USING (true);
CREATE POLICY "Public read access" ON construction_costs FOR SELECT USING (true);
CREATE POLICY "Public read access" ON localities FOR SELECT USING (true);
CREATE POLICY "Public read access" ON city_profiles FOR SELECT USING (true);
