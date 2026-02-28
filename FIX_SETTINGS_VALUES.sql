-- Fix existing data - convert string 'true' to boolean true
UPDATE app_settings 
SET value = 'true'::jsonb 
WHERE key = 'swach_tea_enabled' AND value = '"true"'::jsonb;

-- Or if it's stored differently, use this:
UPDATE app_settings 
SET value = CASE 
  WHEN value::text = '"true"' THEN 'true'::jsonb
  WHEN value::text = 'true' THEN 'true'::jsonb
  ELSE 'false'::jsonb
END
WHERE key = 'swach_tea_enabled';
