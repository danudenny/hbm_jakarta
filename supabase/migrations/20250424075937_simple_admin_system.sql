/*
  # Simple Admin System Migration
  
  This migration creates a simplified admin system without relying on complex RLS policies.
  It uses a simple admin_users table with direct email checks.
*/

-- Drop existing problematic tables if they exist
DROP TABLE IF EXISTS profiles CASCADE;

-- Create a simple admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trigger for updated_at
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user
INSERT INTO admin_users (email)
VALUES ('admin@example.com')
ON CONFLICT (email) DO NOTHING;

-- Create site_settings table for global settings
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default site settings
INSERT INTO site_settings (key, value)
VALUES 
  ('site_name', 'HBM Jakarta'),
  ('site_description', 'Professional Visa & Work Permit Services in Indonesia'),
  ('contact_email', 'contact@HBM Jakarta.com'),
  ('contact_phone', '+62 123 456 7890')
ON CONFLICT (key) DO NOTHING;

-- Create landing_sections table for managing landing page content
CREATE TABLE IF NOT EXISTS landing_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  content jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trigger for updated_at
CREATE TRIGGER update_landing_sections_updated_at
  BEFORE UPDATE ON landing_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial landing page sections
INSERT INTO landing_sections (name, title, subtitle, content)
VALUES 
  (
    'hero',
    'Professional Visa & Work Permit Services',
    'We make immigration simple for you',
    '{
      "description": "Specialized in work permits, business visas, and residence permits for Indonesia with a 98% success rate and fast processing times.",
      "cta_text": "Get Started",
      "cta_link": "#contact",
      "background_image": "https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg",
      "features": [
        {
          "title": "Fast Processing",
          "description": "Expedited document handling"
        },
        {
          "title": "100% Legal Compliance",
          "description": "All documents meet regulations"
        }
      ]
    }'::jsonb
  ),
  (
    'about',
    'About HBM Jakarta',
    'Your Trusted Partner',
    '{
      "description": "Since 2014, we have been providing expert consultation and comprehensive documentation services for foreign workers and companies operating in Indonesia. Our team of experienced professionals understands the complexities of Indonesian immigration laws and processes.",
      "secondary_description": "We take pride in our attention to detail, ensuring that every application is properly prepared, submitted, and followed through to successful completion. Our goal is to make the immigration process as smooth and stress-free as possible for our clients.",
      "image": "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg",
      "advantages": [
        "Extensive experience with Indonesian immigration regulations",
        "Direct relationships with immigration offices",
        "Dedicated case managers for each client",
        "Multilingual support staff (English, Indonesian, Mandarin)",
        "Regular status updates throughout the process",
        "Transparent pricing with no hidden fees"
      ]
    }'::jsonb
  ),
  (
    'services',
    'Comprehensive Immigration Solutions for Expatriates',
    'OUR SERVICES',
    '{
      "description": "We provide end-to-end services for all foreign worker documentation needs in Indonesia, ensuring full compliance with current regulations and streamlined processes.",
      "items": [
        {
          "title": "RPTKA Handling",
          "description": "Complete assistance with Foreign Worker Placement Plan (RPTKA) documentation and approval process.",
          "icon": "FileText"
        },
        {
          "title": "Work Visa Processing",
          "description": "Expert guidance and handling of work visa applications for foreign nationals entering Indonesia.",
          "icon": "Plane"
        },
        {
          "title": "KITAS Creation",
          "description": "Streamlined processing of Temporary Stay Permit Cards (KITAS) for foreign workers.",
          "icon": "CreditCard"
        },
        {
          "title": "SKTT & Domicile Reporting",
          "description": "Efficient handling of Temporary Residence Card (SKTT) and mandatory domicile reporting requirements.",
          "icon": "MapPin"
        },
        {
          "title": "Document Consultation",
          "description": "Professional advice on required documentation and compliance with Indonesian immigration regulations.",
          "icon": "FileCheck"
        },
        {
          "title": "Company Sponsorship",
          "description": "Guidance for companies sponsoring foreign employees and ensuring legal compliance.",
          "icon": "Users"
        }
      ]
    }'::jsonb
  ),
  (
    'testimonials',
    'What Our Clients Say',
    'TESTIMONIALS',
    '{
      "description": "We take pride in our high client satisfaction rate and the positive feedback we receive from individuals and companies we''ve assisted with their visa and permit needs.",
      "items": [
        {
          "name": "Michael Chen",
          "position": "Operations Director",
          "company": "Pacific Trading Co.",
          "comment": "Working with HBM Jakarta made my relocation to Indonesia incredibly smooth. Their expertise with KITAS and work permits saved me weeks of stress and paperwork.",
          "rating": 5,
          "image": "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg"
        },
        {
          "name": "Sarah Johnson",
          "position": "HR Manager",
          "company": "Global Tech Solutions",
          "comment": "As an HR manager responsible for multiple expatriate employees, I can''t recommend their services enough. Their attention to detail and regular updates kept us informed throughout the entire process.",
          "rating": 5,
          "image": "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg"
        },
        {
          "name": "Robert Tanaka",
          "position": "Chief Engineer",
          "company": "East-West Construction",
          "comment": "When our project timeline was at risk due to visa delays, their team expedited the process and delivered results when we needed them most. Truly exceptional service.",
          "rating": 4,
          "image": "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg"
        }
      ]
    }'::jsonb
  ),
  (
    'faqs',
    'Common Questions About Work Permits & Visas',
    'FREQUENTLY ASKED QUESTIONS',
    '{
      "description": "Find answers to frequently asked questions about work permits, visas, and immigration procedures for foreign workers in Indonesia.",
      "items": [
        {
          "question": "What documents are required for RPTKA application?",
          "answer": "RPTKA applications typically require company legal documents, organizational structure, job descriptions for the foreign worker position, qualifications justification, and a foreign manpower utilization plan. Our consultants will provide a comprehensive checklist tailored to your specific situation."
        },
        {
          "question": "How long does it take to obtain a work visa for Indonesia?",
          "answer": "The processing time for work visas varies based on nationality, position, and current regulatory conditions. Generally, it takes between 2-8 weeks from initial application to visa issuance. Our expedited services can often reduce these timelines."
        },
        {
          "question": "Can family members accompany a foreign worker to Indonesia?",
          "answer": "Yes, immediate family members (spouse and dependent children) can accompany foreign workers through dependent visas. We provide complete assistance for family applications alongside the primary work permit processing."
        },
        {
          "question": "What is the difference between KITAS and KITAP?",
          "answer": "KITAS (Kartu Izin Tinggal Terbatas) is a temporary stay permit valid for up to 2 years with possible extensions. KITAP (Kartu Izin Tinggal Tetap) is a permanent stay permit available after holding KITAS for several consecutive years, typically 4-5 years depending on circumstances."
        },
        {
          "question": "Are there any nationality restrictions for work permits in Indonesia?",
          "answer": "Indonesia does not explicitly restrict work permits based on nationality, but certain positions and industries have specific requirements. Some positions may be reserved for Indonesian nationals according to the government''s Negative Investment List (DNI)."
        },
        {
          "question": "What happens if my work permit expires while I''m still in Indonesia?",
          "answer": "Overstaying a work permit can result in significant fines, deportation, and potential difficulty obtaining future permits. We provide timely reminders and renewal services to ensure continuous legal residence and work authorization."
        }
      ]
    }'::jsonb
  ),
  (
    'trusted_companies',
    'Trusted by Leading Companies Worldwide',
    '',
    '{
      "companies": [
        {
          "name": "Microsoft",
          "logo": "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg"
        },
        {
          "name": "Google",
          "logo": "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
        },
        {
          "name": "Amazon",
          "logo": "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
        },
        {
          "name": "Meta",
          "logo": "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg"
        },
        {
          "name": "IBM",
          "logo": "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg"
        }
      ]
    }'::jsonb
  )
ON CONFLICT (name) DO NOTHING;
