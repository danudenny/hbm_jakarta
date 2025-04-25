/*
  # Site Settings Migration

  1. New Tables
    - `site_settings`
      - `id` (uuid, primary key)
      - `company_name` (text, not null) - Company name
      - `company_logo` (text) - URL to company logo
      - `company_email` (text) - Company email address
      - `company_phone` (text) - Company phone number
      - `company_address` (text) - Company address
      - `smtp_host` (text) - SMTP server host
      - `smtp_port` (integer) - SMTP server port
      - `smtp_user` (text) - SMTP username
      - `smtp_password` (text) - SMTP password
      - `smtp_from_email` (text) - Email address to send from
      - `smtp_from_name` (text) - Name to send emails from
      - `primary_color` (text) - Primary color for the website
      - `accent_color` (text) - Accent color for the website
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on site_settings table
    - Add policies for admins to manage site settings
*/

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  company_logo text,
  company_email text,
  company_phone text,
  company_address text,
  smtp_host text,
  smtp_port integer,
  smtp_user text,
  smtp_password text,
  smtp_from_email text,
  smtp_from_name text,
  primary_color text DEFAULT '#4F46E5',
  accent_color text DEFAULT '#EC4899',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for site_settings access
CREATE POLICY "Anyone can view site settings" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert site settings" ON site_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update site settings" ON site_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can delete site settings" ON site_settings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- Insert default site settings
INSERT INTO site_settings (
  company_name,
  company_email,
  company_phone,
  company_address,
  smtp_from_email,
  smtp_from_name,
  primary_color,
  accent_color
)
VALUES (
  'HBM Jakarta',
  'contact@hbmjakarta.com',
  '+62 123 456 7890',
  'Jakarta, Indonesia',
  'noreply@hbmjakarta.com',
  'HBM Jakarta',
  '#4F46E5',
  '#EC4899'
);
