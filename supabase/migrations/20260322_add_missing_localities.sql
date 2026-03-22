-- Add missing localities: Karnei Shomron and Ramat Beit Shemesh
INSERT INTO localities (english_name, district, entity_type, is_anglo_city, population)
VALUES
  ('Karnei Shomron', 'Judea and Samaria', 'town', true, 8000),
  ('Ramat Beit Shemesh', 'Jerusalem', 'neighborhood', true, NULL)
ON CONFLICT DO NOTHING;
