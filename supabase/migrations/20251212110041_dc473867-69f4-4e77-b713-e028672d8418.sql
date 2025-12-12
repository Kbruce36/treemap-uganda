-- Create a view for user trees that anonymous users can access
-- This exposes user_id so we can filter by specific user
CREATE OR REPLACE VIEW public.user_trees_public
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  species,
  latitude,
  longitude,
  planted_date,
  notes,
  tree_count,
  image_1,
  image_2,
  image_3
FROM public.trees;

-- Grant access to anonymous and authenticated users
GRANT SELECT ON public.user_trees_public TO anon;
GRANT SELECT ON public.user_trees_public TO authenticated;