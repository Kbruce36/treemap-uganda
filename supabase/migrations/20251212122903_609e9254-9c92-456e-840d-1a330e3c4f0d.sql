-- Fix trees_public view to bypass RLS for anonymous users
DROP VIEW IF EXISTS trees_public;

CREATE OR REPLACE FUNCTION public.get_trees_public()
RETURNS TABLE (
  id uuid,
  latitude numeric,
  longitude numeric,
  planted_date date,
  created_at timestamptz,
  tree_count integer,
  image_1 text,
  image_2 text,
  image_3 text,
  species text,
  notes text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, latitude, longitude, planted_date, created_at, tree_count, image_1, image_2, image_3, species, notes
  FROM trees;
$$;

CREATE OR REPLACE VIEW trees_public AS
SELECT * FROM get_trees_public();