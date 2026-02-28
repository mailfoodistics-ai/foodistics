-- Create app_settings table for feature toggles
CREATE TABLE IF NOT EXISTS app_settings (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT app_settings_key_not_empty CHECK (key != '')
);

-- Create index on key for faster lookups
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(key);

-- Insert default settings (storing as JSON boolean)
INSERT INTO app_settings (key, value, updated_at) VALUES
  ('swach_tea_enabled', 'true'::jsonb, NOW())
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Anyone can read settings
CREATE POLICY "Allow public to read settings" ON app_settings
  FOR SELECT USING (true);

-- Only authenticated users can update settings (you can restrict further in app logic)
CREATE POLICY "Allow authenticated to update settings" ON app_settings
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Only authenticated users can insert settings
CREATE POLICY "Allow authenticated to insert settings" ON app_settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
