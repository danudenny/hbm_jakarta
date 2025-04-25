/*
  # Create Images Storage Bucket
  
  This migration creates a storage bucket for images with public access
  to be used for storing uploaded images for the website.
*/

-- Enable the storage extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pg_net";
CREATE EXTENSION IF NOT EXISTS "http";

-- Create the images bucket if it doesn't exist
DO $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'images'
  ) INTO bucket_exists;

  IF NOT bucket_exists THEN
    INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
    VALUES ('images', 'images', true, false, 5242880, -- 5MB limit
    ARRAY[
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/svg+xml',
      'image/webp'
    ]::text[]);
  END IF;
END $$;

-- Set up a policy to allow public read access to the images bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Public Read Access' AND bucket_id = 'images'
  ) THEN
    INSERT INTO storage.policies (name, bucket_id, definition)
    VALUES (
      'Public Read Access',
      'images',
      '{"statement": "SELECT", "resource": "object", "action": "read", "condition": "true"}'::jsonb
    );
  END IF;
END $$;

-- Set up a policy to allow authenticated users to upload images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Authenticated Upload Access' AND bucket_id = 'images'
  ) THEN
    INSERT INTO storage.policies (name, bucket_id, definition)
    VALUES (
      'Authenticated Upload Access',
      'images',
      '{"statement": "INSERT", "resource": "object", "action": "insert", "condition": "auth.role() = ''authenticated''", "fields": "*"}'::jsonb
    );
  END IF;
END $$;

-- Set up a policy to allow authenticated users to update their own images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Authenticated Update Access' AND bucket_id = 'images'
  ) THEN
    INSERT INTO storage.policies (name, bucket_id, definition)
    VALUES (
      'Authenticated Update Access',
      'images',
      '{"statement": "UPDATE", "resource": "object", "action": "update", "condition": "auth.role() = ''authenticated''", "fields": "*"}'::jsonb
    );
  END IF;
END $$;

-- Set up a policy to allow authenticated users to delete their own images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Authenticated Delete Access' AND bucket_id = 'images'
  ) THEN
    INSERT INTO storage.policies (name, bucket_id, definition)
    VALUES (
      'Authenticated Delete Access',
      'images',
      '{"statement": "DELETE", "resource": "object", "action": "delete", "condition": "auth.role() = ''authenticated''"}'::jsonb
    );
  END IF;
END $$;
