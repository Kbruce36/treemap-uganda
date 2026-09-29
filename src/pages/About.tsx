import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Globe2, GraduationCap, Instagram, Leaf, Mail, Phone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { PageHero, SectionHeading } from "@/components/site/Brand";
import { SdgTile } from "@/components/site/Sdg";
import { CHAPTER, MEMBER_BENEFITS, PILLARS } from "@/data/chapter";
import { CHAPTER_SDGS, SDGS } from "@/data/sdgs";
import { applicationsAreOpen, useSiteSettings, useTeam, type TeamMember, useChapterContact } from "@/hooks/use-site";

import { STATIC_PAGES } from "@/lib/seo-core";
import { usePageMeta } from "@/lib/seo";
const SDG_WORK: Record<number, string> = {
  3: "Health outreaches, hygiene and menstrual-health talks, and this semester's focus on well-being.",
  4: "Mentorship in schools and civic-education debates on X-Spaces.",
  5: "Mentoring girls to stay in school and championing women in leadership.",
  13: "Climate-justice forums, the Green Conference and the KYUES–EBTDI run.",
  15: "Tree planting on campus and in the community, mapped on UNAU TreeMap.",
  16: "Youth inclusion in decision-making and our own democratic cabinet.",
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const MemberCard = ({ member, index }: { member: TeamMember; index: number }) => {
  const tint = SDGS[index % SDGS.length].color;
  return (
    <div className="group overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-border/60 transition hover:-translate-y-1 hover:shadow-glow">
      <div className="relative aspect-[4/5] overflow-hidden" style={{ backgroundColor: tint }}>
        {member.photo_url ? (
          <img
            src={member.photo_url}
            alt={member.full_name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-5xl font-black text-white/90">{initials(member.full_name)}</span>
            <img src="/images/brand/unau-logo-sm.png" alt="" className="absolute bottom-3 right-3 h-8 w-auto opacity-40" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1.5" style={{ backgroundColor: tint }} />
      </div>
      <div className="p-4">
        <p className="font-display font-extrabold leading-tight text-primary">{member.full_name}</p>
        <p className="mt-1 text-xs font-semibold text-secondary">{member.role}</p>
        {member.bio && <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{member.bio}</p>}
      </div>
    </div>
  );
};

const About = () => {
  usePageMeta(STATIC_PAGES["/about"]);
  const { hash } = useLocation();
  const { data: team, isLoading: teamLoading } = useTeam();
  const { data: settings } = useSiteSettings();
  const contact = useChapterContact();
  const appsOpen = applicationsAreOpen(settings);

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
  }, [hash]);

  const activeTeam = (team ?? []).filter((m) => m.is_active);

  return (
    <Layout>
      <PageHero
        eyebrow="About us"
        title={
          <>
            United Nations Association of Uganda,{" "}
            <span className="text-secondary">Kyambogo University Chapter</span>
          </>
        }
        lede={CHAPTER.description}
        image="/images/hero/unau-group-md.jpg"
      />

      {/* Identity */}
      <section className="container grid gap-12 py-20 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div className="relative">
          <img
            src="/images/hero/unau-group-md.jpg"
            alt="UNAU Kyambogo members"
            className="aspect-[4/3] w-full rounded-3xl object-cover shadow-glow"
          />
          <div className="absolute -bottom-6 -right-2 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card md:-right-6">
            <img src="/images/brand/unau-logo-sm.png" alt="" className="h-12 w-auto" />
            <img src="/images/brand/kyu-logo.png" alt="Kyambogo University" className="h-12 w-auto" />
          </div>
        </div>
        <div>
          <SectionHeading eyebrow="Who we are" title="Student-run. Open to every faculty. Part of a global movement." />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Globe2, value: "WFUNA", label: "Affiliated to the World Federation of UN Associations" },
              { icon: GraduationCap, value: "11", label: "University chapters across Uganda" },
              { icon: Users, value: "All", label: "Faculties and schools represented" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-card p-5 shadow-card ring-1 ring-border/60">
                <item.icon className="h-6 w-6 text-secondary" />
                <p className="mt-3 font-display text-2xl font-black text-primary">{item.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-primary p-6 text-white">
              <dt className="inline-block rounded bg-brand-gold px-2 py-0.5 font-display text-[11px] font-bold uppercase tracking-widest text-primary">
                Mission
              </dt>
              <dd className="mt-3 font-display text-lg font-bold">{CHAPTER.mission}</dd>
            </div>
            <div className="rounded-2xl bg-primary p-6 text-white">
              <dt className="inline-block rounded bg-secondary px-2 py-0.5 font-display text-[11px] font-bold uppercase tracking-widest text-white">
                Vision
              </dt>
              <dd className="mt-3 font-display text-lg font-bold">{CHAPTER.vision}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* What we do */}
      <section className="bg-muted/60 py-20">
        <div className="container">
          <SectionHeading eyebrow="What the chapter does" title="How we turn global goals into local action" />
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {PILLARS.map((p) => (
              <div key={p.title} className="rounded-2xl bg-card p-6 shadow-card">
                <p.icon className="h-7 w-7 text-secondary" />
                <h3 className="mt-4 font-display font-extrabold text-primary">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SDGs */}
      <section className="container py-20">
        <SectionHeading
          eyebrow="Sustainable Development Goals"
          title="The goals we champion"
          lede="We engage with all 17 goals, but these six shape most of our work."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CHAPTER_SDGS.map((n) => {
            const sdg = SDGS[n - 1];
            return (
              <div key={n} className="flex gap-4 rounded-2xl bg-card p-4 shadow-card ring-1 ring-border/60">
                <SdgTile number={n} className="w-24 shrink-0" />
                <div className="py-1">
                  <p className="font-display font-extrabold leading-snug text-primary">{sdg.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{SDG_WORK[n]}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Leadership */}
      <section className="bg-brand-cream py-20" id="team">
        <div className="container">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading eyebrow="Leadership" title="The Executive Committee" lede="The students who run the chapter this term." />
            {appsOpen && (
              <Button asChild className="shrink-0 bg-secondary font-bold hover:bg-brand-green-dark">
                <Link to="/apply">
                  Apply for the next cabinet <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {teamLoading
              ? Array.from({ length: 10 }).map((_, i) => <div key={i} className="aspect-[4/6] animate-pulse rounded-2xl bg-card" />)
              : activeTeam.map((m, i) => <MemberCard key={m.id} member={m} index={i} />)}
          </div>
          {!teamLoading && activeTeam.length === 0 && (
            <p className="mt-6 text-muted-foreground">The executive committee will be listed here soon.</p>
          )}
        </div>
      </section>

      {/* Join */}
      <section id="join" className="container scroll-mt-24 py-20">
        <div className="grid gap-10 overflow-hidden rounded-[2rem] bg-primary p-8 text-white md:p-14 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Open to every faculty</p>
            <h2 className="mt-3 font-display text-5xl font-black md:text-6xl">Join us.</h2>
            <div className="mt-5 h-1.5 w-24 rounded-full bg-secondary" />
            <p className="mt-6 max-w-xl text-lg text-white/80">
              As recognition for your work you receive a certificate of appreciation, a platform to express your
              leadership and a global network of like-minded changemakers. You also become an active driver of the
              Global Goals.
            </p>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {MEMBER_BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-white/85">
                  <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl bg-secondary p-6">
              <p className="font-display text-xs font-bold uppercase tracking-widest text-white/80">Membership</p>
              <p className="mt-1 font-display text-4xl font-black">{contact.membershipFee}</p>
              <p className="text-sm font-semibold text-white/80">One-time payment</p>
            </div>
            <div className="space-y-3 rounded-2xl bg-white p-6 text-primary">
              <p className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">Talk to us</p>
              <a href={contact.phoneHref} className="flex items-center gap-3 font-display text-xl font-extrabold hover:text-secondary">
                <Phone className="h-5 w-5 text-secondary" /> {contact.phone}
              </a>
              <a href={`mailto:${contact.email}`} className="flex items-center gap-3 font-semibold hover:text-secondary">
                <Mail className="h-5 w-5 text-secondary" /> {contact.email}
              </a>
              <a
                href={contact.instagram.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 font-semibold hover:text-secondary"
              >
                <Instagram className="h-5 w-5 text-secondary" /> {contact.instagram.handle}
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
