-- Live updates for the home-page counters and GreenBot dashboard notifications.
-- Realtime still applies RLS, so subscribers only receive rows they could select.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'trees'
  ) then
    alter publication supabase_realtime add table public.trees;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'tree_care_advice'
  ) then
    alter publication supabase_realtime add table public.tree_care_advice;
  end if;
end $$;
