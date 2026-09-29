import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/site/Brand";
import { ProjectCard } from "@/components/site/ProjectCard";
import { SdgTile } from "@/components/site/Sdg";
import { cn } from "@/lib/utils";
import { PROJECT_CATEGORIES } from "@/data/chapter";
import { useProjects } from "@/hooks/use-site";

const Projects = () => {
  const { data, isLoading, error } = useProjects();
  const [category, setCategory] = useState<string | null>(null);
  const [sdg, setSdg] = useState<number | null>(null);

  const projects = useMemo(() => (data ?? []).filter((p) => p.is_published), [data]);
  const sdgsInUse = useMemo(
    () => [...new Set(projects.flatMap((p) => p.sdgs))].sort((a, b) => a - b),
    [projects]
  );
  const categoriesInUse = PROJECT_CATEGORIES.filter((c) => projects.some((p) => p.category === c));
  const filtered = projects.filter(
    (p) => (!category || p.category === category) && (!sdg || p.sdgs.includes(sdg))
  );

  return (
    <Layout>
      <PageHero
        eyebrow="Projects & impact"
        title={
          <>
            The work behind <span className="text-secondary">the goals.</span>
          </>
        }
        lede="Every outreach, conference, run and debate the chapter has been part of, and the Sustainable Development Goals each one advances."
        image="/images/projects/go-green-clean-up/cover.jpg"
      >
        <div className="flex flex-wrap gap-6 text-white">
          <div>
            <p className="font-display text-4xl font-black">{projects.length || "–"}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Projects</p>
          </div>
          <div>
            <p className="font-display text-4xl font-black">{sdgsInUse.length || "–"}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70">SDGs advanced</p>
          </div>
        </div>
      </PageHero>

      <section className="container py-12 md:py-16">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory(null)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-bold transition",
                !category ? "bg-primary text-white" : "bg-card text-primary ring-1 ring-border hover:ring-primary/40"
              )}
            >
              All
            </button>
            {categoriesInUse.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(category === c ? null : c)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-bold transition",
                  category === c ? "bg-primary text-white" : "bg-card text-primary ring-1 ring-border hover:ring-primary/40"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {sdgsInUse.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Filter by goal</span>
              {sdgsInUse.map((n) => (
                <button
                  key={n}
                  onClick={() => setSdg(sdg === n ? null : n)}
                  aria-pressed={sdg === n}
                  className="w-11"
                >
                  <SdgTile number={n} size="sm" dimmed={sdg !== null && sdg !== n} highlighted={sdg === n} />
                </button>
              ))}
              {(sdg || category) && (
                <button
                  onClick={() => {
                    setSdg(null);
                    setCategory(null);
                  }}
                  className="ml-2 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-primary"
                >
                  <X className="h-4 w-4" /> Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[420px] animate-pulse rounded-2xl bg-muted" />)
            : filtered.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>

        {!isLoading && !error && filtered.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">
            {projects.length ? "No projects match those filters yet." : "Projects are on their way."}
          </p>
        )}
        {error && <p className="py-16 text-center text-destructive">We couldn't load projects right now. Please try again.</p>}
      </section>
    </Layout>
  );
};

export default Projects;
