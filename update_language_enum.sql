-- Update the supported_language enum type to include all languages
ALTER TYPE supported_language ADD VALUE IF NOT EXISTS 'ko';
ALTER TYPE supported_language ADD VALUE IF NOT EXISTS 'de';
ALTER TYPE supported_language ADD VALUE IF NOT EXISTS 'ja';
ALTER TYPE supported_language ADD VALUE IF NOT EXISTS 'zh';
ALTER TYPE supported_language ADD VALUE IF NOT EXISTS 'ar';
