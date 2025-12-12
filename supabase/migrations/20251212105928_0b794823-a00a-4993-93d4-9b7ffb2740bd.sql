-- Create a public leaderboard view that aggregates tree counts per user
CREATE OR REPLACE VIEW public.leaderboard_public
WITH (security_invoker = true)
AS
SELECT 
  p.id as user_id,
  p.full_name,
  COALESCE(SUM(t.tree_count), 0)::integer as total_trees
FROM public.profiles p
LEFT JOIN public.trees t ON t.user_id = p.id
GROUP BY p.id, p.full_name
HAVING COALESCE(SUM(t.tree_count), 0) > 0
ORDER BY total_trees DESC;

-- Grant access to anonymous and authenticated users
GRANT SELECT ON public.leaderboard_public TO anon;
GRANT SELECT ON public.leaderboard_public TO authenticated;