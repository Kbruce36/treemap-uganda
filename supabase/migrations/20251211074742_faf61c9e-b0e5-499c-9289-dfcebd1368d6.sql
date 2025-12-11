
-- Fix SECURITY DEFINER views by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.profiles_public;
DROP VIEW IF EXISTS public.trees_public;

-- Recreate profiles_public view with SECURITY INVOKER
CREATE VIEW public.profiles_public 
WITH (security_invoker = true)
AS SELECT id, full_name FROM public.profiles;

-- Recreate trees_public view with SECURITY INVOKER  
CREATE VIEW public.trees_public
WITH (security_invoker = true)
AS SELECT id, latitude, longitude, planted_date, created_at, species, notes, tree_count, image_1, image_2, image_3 FROM public.trees;

-- Grant access
GRANT SELECT ON public.profiles_public TO anon, authenticated;
GRANT SELECT ON public.trees_public TO anon;
