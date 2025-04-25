-- Create enum for supported languages
CREATE TYPE supported_language AS ENUM (
  'en', -- English
  'id', -- Indonesian
  'ja', -- Japanese
  'zh', -- Chinese
  'de', -- German
  'ar'  -- Arabic
);

-- Create translations table
CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL,
  namespace TEXT NOT NULL DEFAULT 'common',
  language supported_language NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(key, namespace, language)
);

-- Create language settings table
CREATE TABLE language_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  default_language supported_language NOT NULL DEFAULT 'en',
  available_languages supported_language[] NOT NULL DEFAULT ARRAY['en', 'id']::supported_language[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default language settings
INSERT INTO language_settings (default_language, available_languages)
VALUES ('en', ARRAY['en', 'id']::supported_language[]);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for translations table
CREATE TRIGGER update_translations_updated_at
BEFORE UPDATE ON translations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for language_settings table
CREATE TRIGGER update_language_settings_updated_at
BEFORE UPDATE ON language_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE language_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for translations
CREATE POLICY "Allow anonymous read access to translations" 
ON translations FOR SELECT 
TO anon
USING (true);

CREATE POLICY "Allow authenticated users to manage translations" 
ON translations FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policies for language_settings
CREATE POLICY "Allow anonymous read access to language_settings" 
ON language_settings FOR SELECT 
TO anon
USING (true);

CREATE POLICY "Allow authenticated users to manage language_settings" 
ON language_settings FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_translations_key_namespace_language ON translations(key, namespace, language);
CREATE INDEX idx_translations_language ON translations(language);

-- Insert some default translations for testing
INSERT INTO translations (key, namespace, language, value)
VALUES 
  ('welcome', 'common', 'en', 'Welcome to HBM Jakarta'),
  ('welcome', 'common', 'id', 'Selamat Datang di HBM Jakarta'),
  ('services', 'common', 'en', 'Our Services'),
  ('services', 'common', 'id', 'Layanan Kami'),
  ('contact', 'common', 'en', 'Contact Us'),
  ('contact', 'common', 'id', 'Hubungi Kami');
