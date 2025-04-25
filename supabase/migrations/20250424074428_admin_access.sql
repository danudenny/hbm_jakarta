/*
  # Admin access migration

  1. Create admin_settings table to store admin credentials and site settings
  2. Add initial admin user
  3. Add security policies
*/

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Allow full access for authenticated users" ON admin_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert admin email for authentication
INSERT INTO admin_settings (setting_key, setting_value)
VALUES 
  ('admin_email', 'admin@example.com'),
  ('site_name', 'HBM Jakarta'),
  ('site_description', 'Professional Visa & Work Permit Services in Indonesia'),
  ('contact_email', 'contact@HBM Jakarta.com'),
  ('contact_phone', '+62 123 456 7890')
ON CONFLICT (setting_key) DO NOTHING;

-- Create site_content table to manage landing page content
CREATE TABLE IF NOT EXISTS site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_name text NOT NULL,
  content jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Allow full access for authenticated users" ON site_content
  FOR ALL USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial content for hero section
INSERT INTO site_content (section_name, content)
VALUES (
  'hero_section', 
  '{
    "title": "Professional Visa & Work Permit Services",
    "subtitle": "We make immigration simple for you",
    "description": "Specialized in work permits, business visas, and residence permits for Indonesia with a 98% success rate and fast processing times.",
    "cta_text": "Get Started",
    "cta_link": "#contact",
    "background_image": "/images/hero-bg.jpg"
  }'::jsonb
) ON CONFLICT DO NOTHING;

-- Insert initial content for about section
INSERT INTO site_content (section_name, content)
VALUES (
  'about_section', 
  '{
    "title": "About HBM Jakarta",
    "subtitle": "Your Trusted Partner",
    "description": "With over 10 years of experience, HBM Jakarta has helped thousands of individuals and businesses navigate Indonesia''s complex immigration system. Our team of experts provides personalized solutions tailored to your specific needs.",
    "image": "/images/about.jpg",
    "stats": [
      {"value": "10+", "label": "Years Experience"},
      {"value": "5000+", "label": "Happy Clients"},
      {"value": "98%", "label": "Success Rate"},
      {"value": "24/7", "label": "Support"}
    ]
  }'::jsonb
) ON CONFLICT DO NOTHING;

-- Insert initial content for process section
INSERT INTO site_content (section_name, content)
VALUES (
  'process_section', 
  '{
    "title": "Our Process",
    "subtitle": "How We Work",
    "steps": [
      {
        "number": 1,
        "title": "Consultation",
        "description": "We discuss your needs and recommend the best visa options for your situation."
      },
      {
        "number": 2,
        "title": "Documentation",
        "description": "We help you prepare and review all necessary documents for your application."
      },
      {
        "number": 3,
        "title": "Submission",
        "description": "We submit your application and liaise with immigration authorities on your behalf."
      },
      {
        "number": 4,
        "title": "Approval",
        "description": "We notify you of your application status and guide you through the final steps."
      }
    ]
  }'::jsonb
) ON CONFLICT DO NOTHING;

-- Insert initial content for contact section
INSERT INTO site_content (section_name, content)
VALUES (
  'contact_section', 
  '{
    "title": "Contact Us",
    "subtitle": "Get In Touch",
    "description": "Have questions or ready to start your visa application? Reach out to our team for a free consultation.",
    "email": "contact@HBM Jakarta.com",
    "phone": "+62 123 456 7890",
    "address": "Jl. Sudirman No. 123, Jakarta, Indonesia",
    "map_location": "-6.2088,106.8456"
  }'::jsonb
) ON CONFLICT DO NOTHING;
