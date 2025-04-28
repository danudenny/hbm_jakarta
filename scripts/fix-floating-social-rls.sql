-- Enable Row Level Security on the floating_social_links table (if not already enabled)
ALTER TABLE floating_social_links ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read floating_social_links" ON floating_social_links;
DROP POLICY IF EXISTS "Allow authenticated users to insert floating_social_links" ON floating_social_links;
DROP POLICY IF EXISTS "Allow authenticated users to update floating_social_links" ON floating_social_links;
DROP POLICY IF EXISTS "Allow authenticated users to delete floating_social_links" ON floating_social_links;

-- Create policies for authenticated users
-- 1. Read policy
CREATE POLICY "Allow authenticated users to read floating_social_links"
ON floating_social_links
FOR SELECT
USING (auth.role() = 'authenticated');

-- 2. Insert policy
CREATE POLICY "Allow authenticated users to insert floating_social_links"
ON floating_social_links
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 3. Update policy
CREATE POLICY "Allow authenticated users to update floating_social_links"
ON floating_social_links
FOR UPDATE
USING (auth.role() = 'authenticated');

-- 4. Delete policy
CREATE POLICY "Allow authenticated users to delete floating_social_links"
ON floating_social_links
FOR DELETE
USING (auth.role() = 'authenticated');
