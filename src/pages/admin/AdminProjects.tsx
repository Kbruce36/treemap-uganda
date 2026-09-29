import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, Pencil, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useProjects, type Project } from "@/hooks/use-site";
import { ProjectCover, formatEventDate } from "@/components/site/ProjectCard";
import { SdgBadges } from "@/components/site/Sdg";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { cn } from "@/lib/utils";

const AdminProjects = () => {
  const queryClient = useQueryClient();
  const { data: projects, isLoading } = useProjects();

  const toggle = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Project> }) => {
      const { error } = await supabase.from("projects").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
    onError: () => toast.error("Couldn't update the project."),
  });

  return (
    <>
      <AdminPageHeader
        title="Projects"
        description="Everything shown on the Projects page. Drafts are only visible to admins."
        actions={
          <Button asChild className="bg-primary font-bold">
            <Link to="/admin/projects/new">
              <Plus className="h-4 w-4" /> New project
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        <div className="space-y-3">
          {projects?.map((p) => (
            <div
              key={p.id}
              className={cn(
                "flex flex-col gap-4 rounded-2xl bg-card p-3 shadow-card ring-1 ring-border/60 sm:flex-row sm:items-center",
                !p.is_published && "opacity-80"
              )}
            >
              <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl sm:w-40">
                <ProjectCover project={p} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display font-extrabold text-primary">{p.title}</p>
                  {!p.is_published && <span className="rounded bg-brand-gold/30 px-2 py-0.5 text-xs font-bold">Draft</span>}
                  {p.is_featured && <span className="rounded bg-secondary/15 px-2 py-0.5 text-xs font-bold text-brand-green-dark">Featured</span>}
                </div>
                <p className="text-sm text-muted-foreground">
                  {p.category} · {formatEventDate(p.event_date)}
                </p>
                <SdgBadges sdgs={p.sdgs} className="mt-2" />
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  title={p.is_featured ? "Remove from home page" : "Feature on home page"}
                  onClick={() => toggle.mutate({ id: p.id, patch: { is_featured: !p.is_featured } })}
                >
                  <Star className={cn("h-4 w-4", p.is_featured && "fill-brand-gold text-brand-gold")} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title={p.is_published ? "Unpublish" : "Publish"}
                  onClick={() => toggle.mutate({ id: p.id, patch: { is_published: !p.is_published } })}
                >
                  {p.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/admin/projects/${p.id}`}>
                    <Pencil className="h-4 w-4" /> Edit
                  </Link>
                </Button>
              </div>
            </div>
          ))}
          {projects?.length === 0 && <p className="text-muted-foreground">No projects yet. Create the first one.</p>}
        </div>
      )}
    </>
  );
};

export default AdminProjects;
