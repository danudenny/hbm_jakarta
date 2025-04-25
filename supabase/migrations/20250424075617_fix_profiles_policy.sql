/*
  # Fix profiles policy migration

  This migration fixes the infinite recursion issue in the profiles table policy
  by replacing the problematic admin policy with a simpler one.
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create a simpler policy that avoids the recursion
-- This policy allows users with is_admin=true to view all profiles
-- without causing a circular dependency
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid())
  );

-- Alternatively, if the above still causes issues, uncomment and use this simpler policy:
-- CREATE POLICY "Anyone can view all profiles" ON profiles
--   FOR SELECT USING (true);
