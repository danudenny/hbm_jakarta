/*
  # SEO Settings Migration

  1. New Tables
    - `seo_settings`
      - `id` (uuid, primary key)
      - `page_path` (text, not null) - Path of the page (e.g., '/', '/about')
      - `title` (text, not null) - Page title for SEO
      - `description` (text) - Meta description
      - `keywords` (text) - Meta keywords
      - `og_title` (text) - Open Graph title
      - `og_description` (text) - Open Graph description
      - `og_image` (text) - Open Graph image URL
      - `twitter_card` (text) - Twitter card type
      - `twitter_title` (text) - Twitter title
      - `twitter_description` (text) - Twitter description
      - `twitter_image` (text) - Twitter image URL
      - `canonical_url` (text) - Canonical URL
      - `robots` (text) - Robots meta tag content
      - `structured_data` (jsonb) - Structured data for the page
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on seo_settings table
    - Add policies for admins to manage SEO settings
*/

-- Create seo_settings table
CREATE TABLE IF NOT EXISTS seo_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  keywords text,
  og_title text,
  og_description text,
  og_image text,
  twitter_card text,
  twitter_title text,
  twitter_description text,
  twitter_image text,
  canonical_url text,
  robots text,
  structured_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for seo_settings access
CREATE POLICY "Anyone can view SEO settings" ON seo_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert SEO settings" ON seo_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update SEO settings" ON seo_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can delete SEO settings" ON seo_settings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_seo_settings_updated_at
  BEFORE UPDATE ON seo_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- Insert default SEO settings for homepage
INSERT INTO seo_settings (
  page_path, 
  title, 
  description, 
  keywords,
  og_title,
  og_description,
  twitter_card,
  robots
)
VALUES (
  '/', 
  'HBM Jakarta | Professional Visa & Work Permit Services',
  'HBM Jakarta provides professional visa and work permit services for individuals and businesses in Indonesia. Contact us for expert assistance.',
  'visa, work permit, Indonesia, Jakarta, immigration, business visa, KITAS, KITAP',
  'HBM Jakarta | Professional Visa & Work Permit Services',
  'Expert visa and work permit services in Indonesia',
  'summary_large_image',
  'index, follow'
);
