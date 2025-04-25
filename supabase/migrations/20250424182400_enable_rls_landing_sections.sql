/*
  # Enable Row Level Security for landing_sections table

  This migration:
  1. Enables Row Level Security (RLS) on the landing_sections table
  2. Creates policies to control access to the table:
     - Anyone can view landing sections (SELECT)
     - Only authenticated users can modify landing sections (INSERT, UPDATE, DELETE)
*/

-- Enable Row Level Security
ALTER TABLE landing_sections ENABLE ROW LEVEL SECURITY;

-- Create policies for landing_sections access
CREATE POLICY "Anyone can view landing sections" ON landing_sections
  FOR SELECT USING (true);

-- Allow all authenticated users to modify landing sections
-- In a production environment, you would want to restrict this further
CREATE POLICY "Authenticated users can insert landing sections" ON landing_sections
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update landing sections" ON landing_sections
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete landing sections" ON landing_sections
  FOR DELETE USING (auth.role() = 'authenticated');
