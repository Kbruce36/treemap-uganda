import { cn } from "@/lib/utils";
import { SDGS, getSdg } from "@/data/sdgs";

interface SdgTileProps {
  number: number;
  dimmed?: boolean;
  highlighted?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/** A square SDG tile in the goal's official colour, modelled on the UN icon set. */
export const SdgTile = ({ number, dimmed, highlighted, size = "md", className }: SdgTileProps) => {
  const sdg = getSdg(number);
  if (!sdg) return null;
  const Icon = sdg.icon;

  return (
    <div
      title={`SDG ${sdg.number}: ${sdg.title}`}
      className={cn(
        "group relative flex aspect-square flex-col justify-between overflow-hidden rounded-xl p-2.5 text-white transition-all duration-300",
        size === "sm" && "rounded-lg p-1.5",
        size === "lg" && "p-4",
        dimmed ? "opacity-30 saturate-50 hover:opacity-70 hover:saturate-100" : "hover:-translate-y-1 hover:shadow-lg",
        highlighted && "ring-4 ring-white ring-offset-2 ring-offset-brand-gold",
        className
      )}
      style={{ backgroundColor: sdg.color }}
    >
      <div className="flex items-start justify-between gap-1">
        <span
          className={cn(
            "font-display font-black leading-none",
            size === "sm" ? "text-sm" : size === "lg" ? "text-4xl" : "text-2xl"
          )}
        >
          {sdg.number}
        </span>
        {size !== "sm" && (
          <span
            className={cn(
              "font-display font-bold uppercase leading-tight text-right",
              size === "lg" ? "text-[11px] max-w-[70%]" : "text-[9px] max-w-[65%]"
            )}
          >
            {sdg.short}
          </span>
        )}
      </div>
      <Icon
        className={cn(
          "self-center opacity-95 transition-transform duration-300 group-hover:scale-110",
          size === "sm" ? "h-4 w-4" : size === "lg" ? "h-12 w-12" : "h-8 w-8"
        )}
        strokeWidth={1.75}
      />
      <span className="h-0" aria-hidden />
    </div>
  );
};

interface SdgGridProps {
  active?: number[];
  focus?: number;
  size?: SdgTileProps["size"];
  className?: string;
}

/** All 17 goals; goals outside `active` are dimmed, `focus` gets a gold ring. */
export const SdgGrid = ({ active, focus, size = "md", className }: SdgGridProps) => (
  <div className={cn("grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-9", className)}>
    {SDGS.map((s) => (
      <SdgTile
        key={s.number}
        number={s.number}
        size={size}
        dimmed={!!active && !active.includes(s.number)}
        highlighted={focus === s.number}
      />
    ))}
    <div className="flex aspect-square flex-col items-center justify-center rounded-xl bg-white p-2 text-center shadow-card">
      <SdgWheel size={56} />
      <span className="mt-1 font-display text-[9px] font-bold uppercase leading-tight text-primary">
        Global Goals
      </span>
    </div>
  </div>
);

const polar = (c: number, r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [c + r * Math.cos(rad), c + r * Math.sin(rad)];
};

interface SdgWheelProps {
  size?: number;
  active?: number[];
  spin?: boolean;
  children?: React.ReactNode;
  className?: string;
}

/** The SDG colour wheel drawn in SVG, with optional content in the centre. */
export const SdgWheel = ({ size = 200, active, spin, children, className }: SdgWheelProps) => {
  const c = 100;
  const outer = 98;
  const inner = 62;
  const step = 360 / SDGS.length;
  const gap = 1.2;

  return (
    <div className={cn("relative shrink-0 overflow-hidden rounded-full", className)} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 200 200"
        className={cn("h-full w-full", spin && "motion-safe:animate-[spin_60s_linear_infinite]")}
        role="img"
        aria-label="The 17 Sustainable Development Goals"
      >
        {SDGS.map((s, i) => {
          const a0 = i * step + gap / 2;
          const a1 = (i + 1) * step - gap / 2;
          const [x0, y0] = polar(c, outer, a0);
          const [x1, y1] = polar(c, outer, a1);
          const [x2, y2] = polar(c, inner, a1);
          const [x3, y3] = polar(c, inner, a0);
          const on = !active || active.includes(s.number);
          return (
            <path
              key={s.number}
              d={`M${x0},${y0} A${outer},${outer} 0 0 1 ${x1},${y1} L${x2},${y2} A${inner},${inner} 0 0 0 ${x3},${y3} Z`}
              fill={s.color}
              opacity={on ? 1 : 0.25}
            >
              <title>{`SDG ${s.number}: ${s.title}`}</title>
            </path>
          );
        })}
      </svg>
      {children && (
        <div className="absolute inset-[19%] flex items-center justify-center rounded-full bg-white shadow-inner">
          {children}
        </div>
      )}
    </div>
  );
};

/** Compact coloured chips for the goals a project touches. */
export const SdgBadges = ({ sdgs, className }: { sdgs: number[]; className?: string }) => (
  <div className={cn("flex flex-wrap gap-1.5", className)}>
    {[...sdgs].sort((a, b) => a - b).map((n) => {
      const sdg = getSdg(n);
      if (!sdg) return null;
      const Icon = sdg.icon;
      return (
        <span
          key={n}
          title={`SDG ${n}: ${sdg.title}`}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-display text-[11px] font-bold text-white"
          style={{ backgroundColor: sdg.color }}
        >
          <Icon className="h-3 w-3" strokeWidth={2.25} />
          {n}
        </span>
      );
    })}
  </div>
);
