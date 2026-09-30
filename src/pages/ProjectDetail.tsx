import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, ArrowRight, Award, CalendarDays, Handshake, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Layout } from "@/components/Layout";
import { ProjectCard, ProjectCover, formatEventDate } from "@/components/site/ProjectCard";
import { SdgTile } from "@/components/site/Sdg";
import { getSdg } from "@/data/sdgs";
import { parseImpact, parseRecognition, useProject, useProjects } from "@/hooks/use-site";
import NotFound from "./NotFound";

import { projectPageMeta } from "@/lib/seo-core";
import { usePageMeta } from "@/lib/seo";
const ProjectDetail = () => {
  const { slug } = useParams();
  const { data: project, isLoading } = useProject(slug);
  const { data: all } = useProjects();
  const [lightbox, setLightbox] = useState<string | null>(null);
  usePageMeta(project ? projectPageMeta(project) : null);

  if (isLoading) {
    return (
      <Layout>
        <div className="h-[420px] animate-pulse bg-muted" />
        <div className="container space-y-4 py-12">
          <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        </div>
      </Layout>
    );
  }

  if (!project) return <NotFound />;

  const impact = parseImpact(project.impact);
  const recognition = parseRecognition(project.recognition);
  const images = [project.cover_image, ...project.gallery].filter((x): x is string => !!x);
  const more = (all ?? [])
    .filter((p) => p.is_published && p.id !== project.id)
    .sort((a, b) => b.sdgs.filter((n) => project.sdgs.includes(n)).length - a.sdgs.filter((n) => project.sdgs.includes(n)).length)
    .slice(0, 3);
  const ctaUrl = project.cta_url && /^(\/(?!\/)|https?:\/\/)/i.test(project.cta_url) ? project.cta_url : null;
  const isInternal = ctaUrl?.startsWith("/");

  return (
    <Layout>
      <section className="relative isolate min-h-[420px] overflow-hidden bg-brand-navy-deep md:min-h-[520px]">
        <div className="absolute inset-0 -z-10">
          <ProjectCover project={project} />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-navy-deep via-brand-navy-deep/70 to-brand-navy-deep/10" />
        <div className="container flex min-h-[420px] flex-col justify-end pb-10 pt-24 md:min-h-[520px]">
          <Link to="/projects" className="mb-auto inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/25">
            <ArrowLeft className="h-4 w-4" /> All projects
          </Link>
          <span className="w-fit rounded-full bg-brand-gold px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wider text-primary">
            {project.category}
          </span>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-black leading-[1.05] text-white md:text-6xl text-balance">
            {project.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/85">{project.summary}</p>
        </div>
      </section>

      {impact.length > 0 && (
        <section className="bg-secondary text-white">
          <div className="container grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
            {impact.map((s) => (
              <div key={s.label}>
                <p className="font-display text-3xl font-black md:text-4xl">{s.value}</p>
                <p className="mt-1 text-sm font-semibold text-white/85">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="container grid gap-12 py-14 lg:grid-cols-[1fr_320px]">
        <article className="prose-unau">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.body || project.summary}</ReactMarkdown>

          {ctaUrl && project.cta_label && (
            <div className="not-prose mt-8">
              <Button asChild size="lg" className="bg-primary font-bold">
                {isInternal ? (
                  <Link to={ctaUrl}>
                    {project.cta_label} <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <a href={ctaUrl} target="_blank" rel="noreferrer">
                    {project.cta_label} <ArrowRight className="h-4 w-4" />
                  </a>
                )}
              </Button>
            </div>
          )}
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-4 rounded-2xl bg-card p-6 shadow-card ring-1 ring-border/60">
            <div className="flex gap-3">
              <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</p>
                <p className="font-semibold text-primary">{formatEventDate(project.event_date)}</p>
              </div>
            </div>
            {project.location && (
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Where</p>
                  <p className="font-semibold text-primary">{project.location}</p>
                </div>
              </div>
            )}
            {project.partners && (
              <div className="flex gap-3">
                <Handshake className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Partners</p>
                  <p className="text-sm font-semibold text-primary">{project.partners}</p>
                </div>
              </div>
            )}
          </div>

          {project.sdgs.length > 0 && (
            <div className="rounded-2xl bg-card p-6 shadow-card ring-1 ring-border/60">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Goals advanced</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[...project.sdgs].sort((a, b) => a - b).map((n) => (
                  <SdgTile key={n} number={n} />
                ))}
              </div>
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                {[...project.sdgs].sort((a, b) => a - b).map((n) => (
                  <li key={n}>
                    <span className="font-bold text-primary">SDG {n}</span> {getSdg(n)?.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </section>

      {recognition.length > 0 && (
        <section className="container pb-14">
          <div className="overflow-hidden rounded-3xl bg-brand-navy-deep text-white shadow-glow">
            <div className="h-1.5 bg-brand-gold" />
            <div className="p-6 md:p-10">
              <p className="inline-flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">
                <Award className="h-4 w-4" /> Recognition
              </p>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {recognition.map((r) => (
                  <div key={r.title + r.issuer} className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    {r.image ? (
                      <button
                        onClick={() => setLightbox(r.image)}
                        className="group shrink-0 overflow-hidden rounded-xl bg-white p-1.5 shadow-lg ring-2 ring-brand-gold/60 transition hover:ring-brand-gold"
                        aria-label={`View ${r.title}`}
                      >
                        <img
                          src={r.image}
                          alt={`${r.title} awarded to UNAU Kyambogo`}
                          loading="lazy"
                          className="h-40 w-full rounded-lg object-cover transition-transform duration-500 group-hover:scale-105 sm:w-56"
                        />
                      </button>
                    ) : (
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-gold text-primary">
                        <Award className="h-8 w-8" />
                      </span>
                    )}
                    <div>
                      <p className="font-display text-2xl font-black leading-tight">{r.title}</p>
                      {r.issuer && <p className="mt-2 text-sm text-white/75">{r.issuer}</p>}
                      {r.image && (
                        <button onClick={() => setLightbox(r.image)} className="mt-3 text-sm font-bold text-brand-gold hover:underline">
                          View certificate →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {images.length > 1 && (
        <section className="container pb-14">
          <h2 className="font-display text-2xl font-extrabold text-primary">Gallery</h2>
          <div className="mt-6 grid auto-rows-[180px] grid-cols-2 gap-3 md:auto-rows-[220px] md:grid-cols-4">
            {images.map((src, i) => (
              <button
                key={src}
                onClick={() => setLightbox(src)}
                className={`group overflow-hidden rounded-xl ${i === 0 ? "col-span-2 row-span-2" : ""}`}
              >
                <img src={src} alt={`${project.title}, photo ${i + 1}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </button>
            ))}
          </div>
        </section>
      )}

      {more.length > 0 && (
        <section className="bg-muted/60 py-16">
          <div className="container">
            <h2 className="font-display text-2xl font-extrabold text-primary">More from the chapter</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {more.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Dialog open={!!lightbox} onOpenChange={(open) => !open && setLightbox(null)}>
        <DialogContent className="max-w-5xl border-0 bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">{project.title}</DialogTitle>
          {lightbox && <img src={lightbox} alt={`${project.title}, enlarged photo`} className="max-h-[85vh] w-full rounded-xl object-contain" />}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ProjectDetail;
