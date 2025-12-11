
-- 1. Fix profiles table: restrict direct access, create public view

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create policy so users can only view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Create a public view for non-sensitive profile data (for leaderboard)
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT id, full_name
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- 2. Fix trees table: only authenticated users can see user_id

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view trees" ON public.trees;

-- Authenticated users can view all trees (needed for leaderboard/user trees)
CREATE POLICY "Authenticated users can view all trees" 
ON public.trees 
FOR SELECT 
TO authenticated
USING (true);

-- Create a public view for anonymous users (without user_id)
CREATE OR REPLACE VIEW public.trees_public AS
SELECT id, latitude, longitude, planted_date, created_at, species, notes, tree_count, image_1, image_2, image_3
FROM public.trees;

-- Grant access to the view
GRANT SELECT ON public.trees_public TO anon;
