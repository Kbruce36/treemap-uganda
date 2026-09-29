import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Camera, Leaf, Loader2, MapPin, Sprout, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { useStatistics } from "@/hooks/use-statistics";
import { applicationsAreOpen, useProjects, useSiteSettings, useChapterContact } from "@/hooks/use-site";
import { CHAPTER, MEMBER_BENEFITS, PILLARS } from "@/data/chapter";
import { CHAPTER_SDGS, getSdg } from "@/data/sdgs";
import { SectionHeading } from "@/components/site/Brand";
import { SdgGrid, SdgWheel } from "@/components/site/Sdg";
import { ProjectCard } from "@/components/site/ProjectCard";
// Leaflet is heavy; load the preview map separately so the home page paints sooner.
const TreeMapPreview = lazy(() =>
  import("@/components/site/TreeMapPreview").then((m) => ({ default: m.TreeMapPreview }))
);

import { STATIC_PAGES } from "@/lib/seo-core";
import { usePageMeta } from "@/lib/seo";
const Stat = ({ value, label, loading }: { value: number | string; label: string; loading?: boolean }) => (
  <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-sm">
    <p className="font-display text-3xl font-black text-white md:text-4xl">
      {loading ? <Loader2 className="h-7 w-7 animate-spin" /> : typeof value === "number" ? value.toLocaleString() : value}
    </p>
    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-white/70">{label}</p>
  </div>
);

const Index = () => {
  usePageMeta(STATIC_PAGES["/"]);
  const { totalTrees, activePlanters, treeSpecies, loading } = useStatistics();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: settings } = useSiteSettings();
  const contact = useChapterContact();
  const appsOpen = applicationsAreOpen(settings);

  const published = (projects ?? []).filter((p) => p.is_published);
  const featured = (published.some((p) => p.is_featured) ? published.filter((p) => p.is_featured) : published).slice(0, 3);
  const focus = getSdg(settings?.sdg_focus ?? 3);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-brand-navy-deep">
        <picture>
          <source
            type="image/webp"
            srcSet="/images/hero/unau-group-md.webp 1000w, /images/hero/unau-group.webp 2000w"
            sizes="100vw"
          />
          <img
            src="/images/hero/unau-group.jpg"
            srcSet="/images/hero/unau-group-md.jpg 1000w, /images/hero/unau-group.jpg 2000w"
            sizes="100vw"
            width={2000}
            height={1333}
            alt="Members of the UNAU Kyambogo chapter together on the Kyambogo University grounds"
            className="absolute inset-0 -z-10 h-full w-full object-cover object-[60%_30%]"
          />
        </picture>
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-navy-deep via-brand-navy-deep/80 to-brand-navy-deep/30 md:bg-gradient-to-r md:from-brand-navy-deep md:via-brand-navy-deep/85 md:to-transparent" />

        <div className="container flex min-h-[640px] flex-col justify-end pb-12 pt-40 md:min-h-[720px] md:justify-center md:pb-20 md:pt-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur">
              <img src="/images/brand/unau-logo-sm.png" alt="" className="h-6 w-auto rounded-full bg-white p-0.5" />
              <span className="text-xs font-semibold text-white/90">{CHAPTER.name} · {CHAPTER.chapter}</span>
            </div>
            <h1 className="mt-6 font-display text-5xl font-black leading-[0.95] text-white sm:text-6xl md:text-7xl">
              Global Goals.
              <br />
              <span className="text-secondary">Local Action.</span>
            </h1>
            <div className="mt-6 h-1.5 w-28 rounded-full bg-brand-gold" />
            <p className="mt-6 max-w-xl text-lg text-white/85 md:text-xl">
              We are Kyambogo University students putting the UN Sustainable Development Goals to work, from
              X-Space debates and village outreaches to mapping every tree we plant.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 bg-secondary px-6 text-base font-bold hover:bg-brand-green-dark">
                <Link to="/map">
                  <MapPin className="h-5 w-5" /> Explore the Tree Map
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-white/40 bg-white/5 px-6 text-base font-bold text-white hover:bg-white hover:text-primary"
              >
                <Link to="/projects">
                  See our impact <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-12 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat value={totalTrees} label="Trees mapped" loading={loading} />
            <Stat value={activePlanters} label="Planters" loading={loading} />
            <Stat value={treeSpecies} label="Species" loading={loading} />
            <Stat value="11" label="UNAU university chapters" />
          </div>
        </div>
      </section>

      {/* Who we are */}
      <section className="container grid items-center gap-14 py-20 md:py-28 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <SectionHeading eyebrow="Who we are" title={<>What is <span className="text-secondary">UNA-Uganda?</span></>} />
          <p className="mt-6 text-lg leading-relaxed text-foreground/80">{CHAPTER.description}</p>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border-l-4 border-brand-gold bg-card p-5 shadow-card">
              <dt className="font-display text-xs font-bold uppercase tracking-widest text-brand-gold">Mission</dt>
              <dd className="mt-2 font-semibold text-primary">{CHAPTER.mission}</dd>
            </div>
            <div className="rounded-2xl border-l-4 border-secondary bg-card p-5 shadow-card">
              <dt className="font-display text-xs font-bold uppercase tracking-widest text-secondary">Vision</dt>
              <dd className="mt-2 font-semibold text-primary">{CHAPTER.vision}</dd>
            </div>
          </dl>
          <Button asChild variant="link" className="mt-6 h-auto px-0 text-base font-bold text-primary">
            <Link to="/about">
              Meet the chapter <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="flex justify-center">
          <SdgWheel size={380} spin className="max-w-full" >
            <img src="/images/brand/unau-logo.png" alt="UNAU logo" className="h-[78%] w-auto" />
          </SdgWheel>
        </div>
      </section>

      {/* Tree Map feature */}
      <section className="relative overflow-hidden bg-primary py-20 text-white md:py-28">
        <div aria-hidden className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
        <div className="container relative grid items-center gap-12 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Our flagship project</p>
            <h2 className="mt-3 font-display text-4xl font-black leading-[1.05] md:text-5xl">
              UNAU TreeMap:
              <br />
              <span className="text-secondary">every tree, on the map.</span>
            </h2>
            <p className="mt-6 text-lg text-white/80">
              Planting is the easy part. Keeping trees alive means knowing where they are. Anyone can sign up, pin the
              trees they plant and watch our community forest grow in real time.
            </p>

            <ol className="mt-8 space-y-4">
              {[
                { icon: MapPin, title: "Pin it", text: "Tap the spot on the map where you planted." },
                { icon: Camera, title: "Prove it", text: "Add the species, how many trees and up to three photos." },
                { icon: Sprout, title: "Grow it", text: "GreenBot sends care advice for your tree and the local weather." },
              ].map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary font-display font-black">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-display font-bold">{step.title}</p>
                    <p className="text-sm text-white/70">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 bg-brand-gold px-6 font-bold text-primary hover:bg-brand-gold/90">
                <Link to="/map">
                  <Leaf className="h-5 w-5" /> Plant & map a tree
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="h-12 px-6 font-bold text-white hover:bg-white/10 hover:text-white">
                <Link to="/leaderboard">
                  <Trophy className="h-5 w-5" /> View the leaderboard
                </Link>
              </Button>
            </div>
          </div>

          <Link
            to="/map"
            className="group relative block overflow-hidden rounded-3xl border-4 border-white/10 shadow-2xl"
            aria-label="Open the full tree map"
          >
            <Suspense fallback={<div className="h-[380px] w-full bg-brand-navy-deep md:h-[480px]" />}>
              <TreeMapPreview className="h-[380px] w-full md:h-[480px]" />
            </Suspense>
            <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-2xl bg-white/95 p-4 text-primary shadow-lg backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-white">
                  <Leaf className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-xl font-black leading-none">
                    {loading ? "…" : totalTrees.toLocaleString()} trees
                  </p>
                  <p className="text-xs text-muted-foreground">mapped by {loading ? "…" : activePlanters} planters</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-bold text-secondary">
                Open map <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* What we do */}
      <section className="container py-20 md:py-28">
        <SectionHeading
          eyebrow="What the chapter does"
          title="Be part of something bigger, and build the leadership to go with it."
          align="center"
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-card transition hover:-translate-y-1 hover:border-secondary/40"
              >
                <span className="absolute right-4 top-3 font-display text-5xl font-black text-muted/80">0{i + 1}</span>
                <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white transition group-hover:bg-secondary">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="relative mt-5 font-display text-lg font-extrabold text-primary">{pillar.title}</h3>
                <p className="relative mt-2 text-sm text-muted-foreground">{pillar.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured projects */}
      <section className="bg-muted/60 py-20 md:py-28">
        <div className="container">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="Projects & impact"
              title="What we have been up to"
              lede="Outreaches, conferences, runs and debates, each tied to the Global Goals."
            />
            <Button asChild variant="outline" className="shrink-0 border-primary/30 font-bold text-primary">
              <Link to="/projects">
                All projects <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projectsLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-[420px] animate-pulse rounded-2xl bg-card" />
                ))
              : featured.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
          {!projectsLoading && featured.length === 0 && (
            <p className="mt-8 text-center text-muted-foreground">Projects are on their way.</p>
          )}
        </div>
      </section>

      {/* SDGs */}
      <section className="container py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="The 17 Global Goals"
              title="The goals we work on"
              lede="Bright tiles are the goals our projects advance. Hover over any goal to see its full name."
            />
            {focus && (
              <div className="mt-8 overflow-hidden rounded-2xl bg-card shadow-card">
                <div className="bg-primary px-5 py-2 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                  Our focus this semester
                </div>
                <div className="flex items-center gap-4 p-5">
                  <span
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: focus.color }}
                  >
                    <focus.icon className="h-7 w-7" />
                  </span>
                  <p className="font-display text-xl font-extrabold text-primary">
                    SDG {focus.number}: {focus.title}
                  </p>
                </div>
              </div>
            )}
          </div>
          <SdgGrid active={CHAPTER_SDGS} focus={settings?.sdg_focus ?? 3} />
        </div>
      </section>

      {/* Call to action */}
      <section className="container pb-20 md:pb-28">
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-cream shadow-card ring-1 ring-border">
          <img
            src="/images/brand/unau-logo.png"
            alt=""
            aria-hidden
            className="pointer-events-none absolute -right-16 top-1/2 hidden h-[420px] w-auto -translate-y-1/2 opacity-[0.07] md:block"
          />
          <div className="relative grid gap-10 p-8 md:p-14 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            {appsOpen && settings ? (
              <div>
                <p className="eyebrow">{settings.applications_title} · Applications open</p>
                <h2 className="mt-3 font-display text-5xl font-black leading-[0.95] text-primary md:text-7xl">
                  Your turn
                  <br />
                  <span className="text-brand-green-dark">to lead.</span>
                </h2>
                <div className="mt-6 h-1.5 w-full max-w-md rounded-full bg-secondary" />
                <p className="mt-6 max-w-xl text-lg text-foreground/80">{settings.applications_message}</p>
                <Button asChild size="lg" className="mt-8 h-12 bg-primary px-8 text-base font-bold">
                  <Link to="/apply">
                    Apply now <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div>
                <p className="eyebrow">Open to every faculty</p>
                <h2 className="mt-3 font-display text-5xl font-black leading-[0.95] text-primary md:text-7xl">Join us.</h2>
                <div className="mt-6 h-1.5 w-full max-w-md rounded-full bg-secondary" />
                <ul className="mt-6 space-y-2 text-foreground/80">
                  {MEMBER_BENEFITS.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <Leaf className="mt-1 h-4 w-4 shrink-0 text-secondary" /> {b}
                    </li>
                  ))}
                </ul>
                <Button asChild size="lg" className="mt-8 h-12 bg-primary px-8 text-base font-bold">
                  <Link to="/about#join">
                    How to join <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            )}
            <div className="grid gap-4">
              <div className="rounded-2xl bg-secondary p-6 text-white">
                <p className="font-display text-xs font-bold uppercase tracking-widest text-white/80">Membership</p>
                <p className="mt-1 font-display text-4xl font-black">{contact.membershipFee}</p>
                <p className="text-sm font-semibold text-white/80">One-time payment</p>
              </div>
              <div className="rounded-2xl bg-primary p-6 text-white">
                <p className="font-display text-xs font-bold uppercase tracking-widest text-white/70">
                  <Users className="mr-1 inline h-4 w-4" /> Questions? Call the chapter
                </p>
                <a href={contact.phoneHref} className="mt-1 block font-display text-3xl font-black text-secondary hover:underline">
                  {contact.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
