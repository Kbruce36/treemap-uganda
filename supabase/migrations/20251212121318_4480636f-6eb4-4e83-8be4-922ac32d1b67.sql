-- Fix user_trees_public view to bypass RLS for anonymous users
DROP VIEW IF EXISTS user_trees_public;

CREATE OR REPLACE FUNCTION public.get_user_trees_public()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  species text,
  latitude numeric,
  longitude numeric,
  planted_date date,
  notes text,
  tree_count integer,
  image_1 text,
  image_2 text,
  image_3 text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, user_id, species, latitude, longitude, planted_date, notes, tree_count, image_1, image_2, image_3
  FROM trees;
$$;

CREATE OR REPLACE VIEW user_trees_public AS
SELECT * FROM get_user_trees_public();

-- Fix profiles_public view to bypass RLS for anonymous users
DROP VIEW IF EXISTS profiles_public;

CREATE OR REPLACE FUNCTION public.get_profiles_public()
RETURNS TABLE (
  id uuid,
  full_name text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, full_name
  FROM profiles;
$$;

CREATE OR REPLACE VIEW profiles_public AS
SELECT * FROM get_profiles_public();