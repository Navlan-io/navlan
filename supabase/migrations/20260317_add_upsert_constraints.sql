-- Add unique constraints required for cron job upserts.
-- These enable ON CONFLICT ... DO UPDATE for each table.

-- exchange_rates: one rate per currency per date
ALTER TABLE exchange_rates
  ADD CONSTRAINT exchange_rates_currency_rate_date_key
  UNIQUE (currency, rate_date);

-- price_indices: one value per index per month
ALTER TABLE price_indices
  ADD CONSTRAINT price_indices_index_code_year_month_key
  UNIQUE (index_code, year, month);

-- mortgage_rates: one value per series per period
ALTER TABLE mortgage_rates
  ADD CONSTRAINT mortgage_rates_series_key_period_key
  UNIQUE (series_key, period);

-- construction_stats: one value per series per time period.
-- Application code MUST store 0 (not NULL) for the unused temporal column
-- (month=0 for quarterly series, quarter=0 for monthly series).
ALTER TABLE construction_stats
  ADD CONSTRAINT construction_stats_series_id_year_month_quarter_key
  UNIQUE (series_id, year, month, quarter);

-- construction_costs: one value per index per month
ALTER TABLE construction_costs
  ADD CONSTRAINT construction_costs_index_code_year_month_key
  UNIQUE (index_code, year, month);
