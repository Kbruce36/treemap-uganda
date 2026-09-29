import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, FolderKanban, Inbox, Leaf, UsersRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { applicationsAreOpen, useSiteSettings } from "@/hooks/use-site";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { cn } from "@/lib/utils";

const countOf = async (query: PromiseLike<{ count: number | null; error: unknown }>) => {
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
};

const AdminOverview = () => {
  const { data: settings } = useSiteSettings();
  const open = applicationsAreOpen(settings);

  const { data: stats } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: async () => {
      const [newApps, allApps, published, drafts, team, treeRows] = await Promise.all([
        countOf(supabase.from("executive_applications").select("id", { count: "exact", head: true }).eq("status", "new")),
        countOf(supabase.from("executive_applications").select("id", { count: "exact", head: true })),
        countOf(supabase.from("projects").select("id", { count: "exact", head: true }).eq("is_published", true)),
        countOf(supabase.from("projects").select("id", { count: "exact", head: true }).eq("is_published", false)),
        countOf(supabase.from("team_members").select("id", { count: "exact", head: true }).eq("is_active", true)),
        supabase.from("trees").select("tree_count").limit(10000),
      ]);
      const trees = (treeRows.data ?? []).reduce((sum, t) => sum + (t.tree_count ?? 0), 0);
      return { newApps, allApps, published, drafts, team, pins: treeRows.data?.length ?? 0, trees };
    },
  });

  const { data: recent } = useQuery({
    queryKey: ["admin", "recent-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("executive_applications")
        .select("id, full_name, course, year_of_study, status, created_at, executive_positions(title)")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  const cards = [
    { label: "New applications", value: stats?.newApps, sub: `${stats?.allApps ?? "–"} total`, icon: Inbox, to: "/admin/applications", tone: "bg-brand-gold text-primary" },
    { label: "Published projects", value: stats?.published, sub: `${stats?.drafts ?? "–"} drafts`, icon: FolderKanban, to: "/admin/projects", tone: "bg-primary text-white" },
    { label: "Trees mapped", value: stats?.trees, sub: `${stats?.pins ?? "–"} map pins`, icon: Leaf, to: "/admin/trees", tone: "bg-secondary text-white" },
    { label: "Team members", value: stats?.team, sub: "shown on About", icon: UsersRound, to: "/admin/team", tone: "bg-brand-navy-deep text-white" },
  ];

  return (
    <>
      <AdminPageHeader title="Welcome back" description="Everything on the website is managed from here." />

      <Link
        to="/admin/settings"
        className={cn(
          "mb-6 flex items-center justify-between gap-4 rounded-2xl p-5 shadow-card transition hover:opacity-95",
          open ? "bg-secondary text-white" : "bg-card ring-1 ring-border"
        )}
      >
        <div>
          <p className={cn("text-xs font-bold uppercase tracking-widest", open ? "text-white/80" : "text-muted-foreground")}>
            Executive applications
          </p>
          <p className={cn("font-display text-xl font-black", !open && "text-primary")}>
            {open ? "Open. The /apply page is accepting applications." : "Closed. Nobody can apply right now."}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-bold">
          {open ? "Manage" : "Open applications"} <ArrowRight className="h-4 w-4" />
        </span>
      </Link>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className={cn("rounded-2xl p-5 shadow-card transition hover:-translate-y-0.5", c.tone)}>
            <c.icon className="h-6 w-6 opacity-80" />
            <p className="mt-4 font-display text-4xl font-black">{c.value ?? "–"}</p>
            <p className="font-semibold">{c.label}</p>
            <p className="text-xs opacity-75">{c.sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-card shadow-card ring-1 ring-border/60">
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="font-display text-lg font-extrabold text-primary">Latest applications</h2>
          <Link to="/admin/applications" className="text-sm font-bold text-secondary hover:underline">
            View all
          </Link>
        </div>
        {recent?.length ? (
          <ul className="divide-y">
            {recent.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-primary">{a.full_name}</p>
                  <p className="truncate text-muted-foreground">
                    {a.executive_positions?.title} · {a.course}, year {a.year_of_study}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold capitalize">{a.status}</span>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-5 text-sm text-muted-foreground">No applications yet.</p>
        )}
      </div>
    </>
  );
};

export default AdminOverview;
