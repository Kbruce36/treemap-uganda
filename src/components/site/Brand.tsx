import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { CHAPTER } from "@/data/chapter";

export const Logo = ({ className, light }: { className?: string; light?: boolean }) => (
  <Link to="/" className={cn("flex items-center gap-3", className)} aria-label={`${CHAPTER.shortName} home`}>
    <img
      src="/images/brand/unau-logo-sm.png"
      alt=""
      width={48}
      height={43}
      className="h-11 w-auto shrink-0"
    />
    <div className="leading-tight">
      <p className={cn("font-display text-[15px] font-extrabold", light ? "text-white" : "text-primary")}>
        UNAU <span className={light ? "text-brand-gold" : "text-secondary"}>Kyambogo</span>
      </p>
      <p className={cn("text-[11px] font-medium", light ? "text-white/70" : "text-muted-foreground")}>
        {CHAPTER.tagline}
      </p>
    </div>
  </Link>
);

interface PageHeroProps {
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  children?: React.ReactNode;
  image?: string;
}

/** Navy banner used at the top of inner pages. */
export const PageHero = ({ eyebrow, title, lede, children, image }: PageHeroProps) => (
  <section className="relative overflow-hidden bg-brand-navy-deep text-white">
    {image && (
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
    )}
    <div className="absolute inset-0 bg-gradient-to-r from-brand-navy-deep via-brand-navy-deep/90 to-brand-navy/60" />
    <div
      aria-hidden
      className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[40px] border-white/5"
    />
    <div className="container relative py-14 md:py-20">
      <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">{eyebrow}</p>
      <h1 className="mt-3 max-w-3xl font-display text-4xl font-black leading-[1.05] md:text-6xl text-balance">
        {title}
      </h1>
      <div className="mt-5 h-1 w-24 rounded-full bg-secondary" />
      {lede && <p className="mt-5 max-w-2xl text-lg text-white/80">{lede}</p>}
      {children && <div className="mt-8">{children}</div>}
    </div>
  </section>
);

export const SectionHeading = ({
  eyebrow,
  title,
  lede,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) => (
  <div className={cn(align === "center" && "mx-auto text-center", "max-w-3xl", className)}>
    <p className="eyebrow">{eyebrow}</p>
    <h2 className="section-title mt-3 text-balance">{title}</h2>
    <div className={cn("mt-5 h-1 w-20 rounded-full bg-secondary", align === "center" && "mx-auto")} />
    {lede && <p className="mt-5 text-lg text-muted-foreground">{lede}</p>}
  </div>
);
