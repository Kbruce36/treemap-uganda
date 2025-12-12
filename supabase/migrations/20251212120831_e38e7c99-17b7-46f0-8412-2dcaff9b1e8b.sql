-- Drop and recreate leaderboard_public view to bypass RLS using SECURITY DEFINER function
DROP VIEW IF EXISTS leaderboard_public;

-- Create a security definer function to fetch leaderboard data
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE (
  user_id uuid,
  full_name text,
  total_trees integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id AS user_id,
    p.full_name,
    COALESCE(sum(t.tree_count), 0)::integer AS total_trees
  FROM profiles p
  LEFT JOIN trees t ON t.user_id = p.id
  GROUP BY p.id, p.full_name
  HAVING COALESCE(sum(t.tree_count), 0) > 0
  ORDER BY total_trees DESC;
$$;

-- Recreate the view using the function
CREATE OR REPLACE VIEW leaderboard_public AS
SELECT * FROM get_leaderboard();