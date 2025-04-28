-- Enable Row Level Security on the seo_settings table (if not already enabled)
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read seo_settings" ON seo_settings;
DROP POLICY IF EXISTS "Allow authenticated users to insert seo_settings" ON seo_settings;
DROP POLICY IF EXISTS "Allow authenticated users to update seo_settings" ON seo_settings;

-- Create policies for authenticated users
-- 1. Read policy
CREATE POLICY "Allow authenticated users to read seo_settings"
ON seo_settings
FOR SELECT
USING (auth.role() = 'authenticated');

-- 2. Insert policy
CREATE POLICY "Allow authenticated users to insert seo_settings"
ON seo_settings
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 3. Update policy
CREATE POLICY "Allow authenticated users to update seo_settings"
ON seo_settings
FOR UPDATE
USING (auth.role() = 'authenticated');

-- If you also need to allow deletion, add this policy
DROP POLICY IF EXISTS "Allow authenticated users to delete seo_settings" ON seo_settings;
CREATE POLICY "Allow authenticated users to delete seo_settings"
ON seo_settings
FOR DELETE
USING (auth.role() = 'authenticated');
