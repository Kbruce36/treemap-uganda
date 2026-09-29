import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getSdg } from "@/data/sdgs";
import type { Project } from "@/hooks/use-site";
import { SdgBadges } from "./Sdg";

export const formatEventDate = (date: string | null) =>
  date ? format(new Date(`${date}T00:00:00`), "d MMM yyyy") : "Ongoing";

/** Cover image, or a branded panel in the colour of the project's first SDG when there is none. */
export const ProjectCover = ({ project, className }: { project: Project; className?: string }) => {
  if (project.cover_image) {
    return (
      <img
        src={project.cover_image}
        alt=""
        loading="lazy"
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  const sdg = getSdg(project.sdgs[0] ?? 17);
  const Icon = sdg?.icon;
  return (
    <div
      className={cn("relative flex h-full w-full items-end overflow-hidden p-5", className)}
      style={{ background: `linear-gradient(135deg, ${sdg?.color ?? "#0c2a6b"} 0%, #0c2a6b 100%)` }}
    >
      {Icon && <Icon className="absolute -right-6 -top-6 h-40 w-40 text-white/15" strokeWidth={1.25} />}
      <span className="relative font-display text-sm font-bold uppercase tracking-widest text-white/80">
        {project.category}
      </span>
    </div>
  );
};

export const ProjectCard = ({ project, className }: { project: Project; className?: string }) => (
  <Link
    to={`/projects/${project.slug}`}
    className={cn(
      "group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-glow",
      className
    )}
  >
    <div className="relative aspect-[16/10] overflow-hidden">
      <ProjectCover project={project} className="transition-transform duration-500 group-hover:scale-105" />
      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wider text-primary shadow">
        {project.category}
      </span>
      {!project.is_published && (
        <span className="absolute right-3 top-3 rounded-full bg-brand-gold px-3 py-1 text-[11px] font-bold text-primary">
          Draft
        </span>
      )}
    </div>
    <div className="flex flex-1 flex-col p-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatEventDate(project.event_date)}
        </span>
        {project.location && (
          <span className="inline-flex items-center gap-1 truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{project.location}</span>
          </span>
        )}
      </div>
      <h3 className="mt-3 font-display text-lg font-extrabold leading-snug text-primary group-hover:text-secondary">
        {project.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{project.summary}</p>
      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
        <SdgBadges sdgs={project.sdgs} />
        <ArrowUpRight className="h-5 w-5 shrink-0 text-secondary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
    </div>
  </Link>
);
