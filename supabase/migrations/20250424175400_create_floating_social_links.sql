/*
  # Floating Social Links Migration

  1. New Tables
    - `floating_social_links`
      - `id` (uuid, primary key)
      - `platform` (text, not null) - Name of the social platform
      - `url` (text, not null) - URL for the social link
      - `icon` (text, not null) - Icon name for the platform
      - `color` (text, not null) - Color code for the icon
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on floating_social_links table
    - Add policies for admins to manage floating social links
*/

-- Create floating_social_links table
CREATE TABLE IF NOT EXISTS floating_social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  url text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE floating_social_links ENABLE ROW LEVEL SECURITY;

-- Create policies for floating_social_links access
CREATE POLICY "Authenticated users can view floating social links" ON floating_social_links
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert floating social links" ON floating_social_links
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update floating social links" ON floating_social_links
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can delete floating social links" ON floating_social_links
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_floating_social_links_updated_at
  BEFORE UPDATE ON floating_social_links
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- Insert default social links
INSERT INTO floating_social_links (platform, url, icon, color)
VALUES 
  ('Facebook', 'https://facebook.com', 'Facebook', '#1877F2'),
  ('Instagram', 'https://instagram.com', 'Instagram', '#E4405F'),
  ('WhatsApp', 'https://wa.me/6281234567890', 'MessageCircle', '#25D366'),
  ('Phone', 'tel:+6281234567890', 'Phone', '#4F46E5');
