// Page titles, descriptions, share images and structured data, in one place.
// Pure functions only (no DOM): used by the app at runtime (see seo.ts) and by
// scripts/prerender.mjs, which writes a real HTML file per page at build time so
// Google and link previews (WhatsApp, X, Facebook, LinkedIn) see the right content.

/** Public address of the site. Set VITE_SITE_URL in Netlify when a custom domain is added. */
export const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://unaukyambogo.netlify.app").replace(/\/+$/, "");

export const SITE_NAME = "UNAU Kyambogo";
const DEFAULT_IMAGE = "/images/og-image.jpg";
const LOGO = "/images/brand/unau-logo.png";
const TWITTER = "@UnauKYU";

export interface PageMeta {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  noindex?: boolean;
  jsonLd?: Record<string, unknown>[];
  /** Plain-text heading and intro shown before the app loads (and to crawlers). */
  h1?: string;
  intro?: string;
}

export const absoluteUrl = (pathOrUrl: string) =>
  /^https?:\/\//i.test(pathOrUrl) ? pathOrUrl : `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;

const clip = (text: string, max = 158) => {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).replace(/[\s,.;:–-]+\S*$/, "")}…`;
};

export const organizationJsonLd = (): Record<string, unknown> => ({
  "@context": "https://schema.org",
  "@type": "NGO",
  "@id": `${SITE_URL}/#organization`,
  name: "United Nations Association of Uganda, Kyambogo University Chapter",
  alternateName: ["UNAU Kyambogo", "UNAU KYU", "UNA-Uganda Kyambogo Chapter"],
  url: SITE_URL,
  logo: absoluteUrl(LOGO),
  image: absoluteUrl(DEFAULT_IMAGE),
  description:
    "Student-run chapter of the United Nations Association of Uganda at Kyambogo University, promoting the aims and ideals of the United Nations and the Sustainable Development Goals.",
  slogan: "Global Goals. Local Action.",
  email: "unaukyambogo@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Kyambogo University, Kyambogo Hill",
    addressLocality: "Kampala",
    addressCountry: "UG",
  },
  parentOrganization: { "@type": "Organization", name: "United Nations Association of Uganda" },
  memberOf: { "@type": "Organization", name: "World Federation of United Nations Associations", url: "https://wfuna.org" },
  sameAs: ["https://instagram.com/unau_kyambogo", "https://x.com/UnauKYU"],
});

const websiteJsonLd = (): Record<string, unknown> => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  inLanguage: "en",
  publisher: { "@id": `${SITE_URL}/#organization` },
});

const breadcrumbs = (items: { name: string; path: string }[]): Record<string, unknown> => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

/** Fixed pages. Titles stay under ~60 characters and descriptions under ~158 so Google shows them in full. */
export const STATIC_PAGES: Record<string, PageMeta> = {
  "/": {
    path: "/",
    title: "UNAU Kyambogo | UN Association at Kyambogo University",
    description:
      "Kyambogo University's United Nations Association chapter. Join students taking action on the SDGs through outreach, X-Space debates and tree planting.",
    h1: "UNAU Kyambogo: Global Goals. Local Action.",
    intro:
      "We are Kyambogo University students putting the UN Sustainable Development Goals to work, from X-Space debates and village outreaches to mapping every tree we plant on UNAU TreeMap.",
    jsonLd: [organizationJsonLd(), websiteJsonLd()],
  },
  "/about": {
    path: "/about",
    title: "About UNAU Kyambogo | Mission, SDGs & Executive Team",
    description:
      "Meet UNAU Kyambogo, the student-run UN Association chapter at Kyambogo University: our mission, the SDGs we champion, our executive committee and how to join.",
    h1: "About the United Nations Association of Uganda, Kyambogo University Chapter",
    intro:
      "A non-profit affiliated to the World Federation of United Nations Associations and one of 11 university chapters in Uganda. Student-run and open to every faculty.",
    jsonLd: [organizationJsonLd(), breadcrumbs([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])],
  },
  "/projects": {
    path: "/projects",
    title: "Projects & Impact | UNAU Kyambogo SDG Projects",
    description:
      "Clean-ups, village outreaches, school mentorship, green conferences and X-Space debates. See UNAU Kyambogo's projects and the SDGs each one advances.",
    h1: "Projects & Impact",
    intro:
      "Every outreach, conference, run and debate UNAU Kyambogo has been part of, and the Sustainable Development Goals each one advances.",
    jsonLd: [breadcrumbs([{ name: "Home", path: "/" }, { name: "Projects", path: "/projects" }])],
  },
  "/map": {
    path: "/map",
    title: "UNAU TreeMap | Live Map of Trees Planted at Kyambogo",
    description:
      "See every tree planted by UNAU Kyambogo and the community on a live satellite map. Sign up free, pin the trees you plant and climb the leaderboard.",
    h1: "UNAU TreeMap: every tree, on the map",
    intro:
      "A live satellite map of the trees planted by UNAU Kyambogo members and the wider community. Sign up, pin your trees, add photos and track their care.",
  },
  "/leaderboard": {
    path: "/leaderboard",
    title: "Tree Planting Leaderboard | UNAU TreeMap Kyambogo",
    description:
      "Who has planted the most trees? See the UNAU TreeMap leaderboard, then map your own trees at Kyambogo and beyond to climb the ranks.",
    h1: "Tree planting leaderboard",
    intro: "The top tree planters on UNAU TreeMap, ranked by the number of trees they have mapped.",
  },
  "/apply": {
    path: "/apply",
    title: "Cabinet Applications | Lead UNAU Kyambogo",
    description:
      "Apply to lead UNAU Kyambogo. Executive roles from President to Faculty Representative, open to students of every faculty whenever applications open.",
    h1: "Executive applications",
    intro:
      "Every seat on the UNAU Kyambogo executive is filled through this page when applications open: President, Vice President, Secretary General, Speaker, coordinators and faculty representatives.",
  },
  "/dashboard": {
    path: "/dashboard",
    title: "GreenBot | Free SDG Assistant by UNAU Kyambogo",
    description:
      "Ask GreenBot about the 17 Sustainable Development Goals, the United Nations and how students can act on them. A free AI assistant from UNAU Kyambogo.",
    h1: "GreenBot, the SDG assistant",
    intro: "Ask about any of the 17 Sustainable Development Goals, the UN, and UNAU Kyambogo's projects.",
  },
};

/** Pages that should never appear in search results. */
export const PRIVATE_PAGE = (title: string, path: string): PageMeta => ({
  title: `${title} | ${SITE_NAME}`,
  description: STATIC_PAGES["/"].description,
  path,
  noindex: true,
});

export interface SeoProject {
  slug: string;
  title: string;
  summary: string;
  body?: string;
  category?: string;
  event_date: string | null;
  location: string | null;
  partners?: string | null;
  cover_image: string | null;
  sdgs?: number[];
  updated_at?: string;
}

export const projectPageMeta = (p: SeoProject): PageMeta => {
  const path = `/projects/${p.slug}`;
  const image = p.cover_image || DEFAULT_IMAGE;
  const jsonLd: Record<string, unknown>[] = [
    breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Projects", path: "/projects" },
      { name: p.title, path },
    ]),
  ];

  if (p.event_date) {
    const isOnline = /online|x space/i.test(p.location ?? "");
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "Event",
      name: p.title,
      description: p.summary,
      startDate: p.event_date,
      endDate: p.event_date,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: isOnline
        ? "https://schema.org/OnlineEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode",
      location: isOnline
        ? { "@type": "VirtualLocation", url: "https://x.com/UnauKYU" }
        : {
            "@type": "Place",
            name: p.location ?? "Kyambogo University",
            address: { "@type": "PostalAddress", addressLocality: "Kampala", addressCountry: "UG" },
          },
      image: [absoluteUrl(image)],
      organizer: { "@type": "Organization", name: "UNAU Kyambogo", url: SITE_URL },
      url: absoluteUrl(path),
    });
  }

  return {
    path,
    // Google shows ~60 characters; drop the site-name suffix rather than cut the project name.
    title: `${p.title} | ${SITE_NAME}`.length <= 62 ? `${p.title} | ${SITE_NAME}` : clip(p.title, 62),
    description: clip(p.summary || STATIC_PAGES["/projects"].description),
    image,
    imageAlt: p.title,
    type: "article",
    h1: p.title,
    intro: p.summary,
    jsonLd,
  };
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** JSON-LD must not be able to close its <script> tag. */
const safeJson = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");

/** The <head> tags for a page, as HTML (used by the prerender build step). */
export const renderHeadTags = (meta: PageMeta): string => {
  const url = absoluteUrl(meta.path);
  const image = absoluteUrl(meta.image || DEFAULT_IMAGE);
  const isDefaultImage = !meta.image || meta.image === DEFAULT_IMAGE;
  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="robots" content="${meta.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large"}" />`,
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:type" content="${meta.type ?? "website"}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(meta.imageAlt ?? "UNAU Kyambogo members at Kyambogo University")}" />`,
    ...(isDefaultImage
      ? ['<meta property="og:image:width" content="1200" />', '<meta property="og:image:height" content="630" />']
      : []),
    `<meta property="og:locale" content="en_GB" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:site" content="${TWITTER}" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
    ...(meta.jsonLd?.length
      ? [`<script type="application/ld+json" id="page-jsonld">${safeJson(meta.jsonLd.length === 1 ? meta.jsonLd[0] : meta.jsonLd)}</script>`]
      : []),
  ];
  return tags.map((t) => `    ${t}`).join("\n");
};

const NAV_LINKS: [string, string][] = [
  ["/", "Home"],
  ["/about", "About"],
  ["/projects", "Projects"],
  ["/map", "Tree Map"],
  ["/leaderboard", "Leaderboard"],
  ["/apply", "Apply"],
];

/**
 * Readable content placed inside #root before the app loads: crawlers and slow
 * connections see real text and links; React replaces it on start-up.
 */
export const renderFallbackBody = (meta: PageMeta, extraLinks: { href: string; label: string }[] = [], extraText = ""): string => {
  const links = [...NAV_LINKS.map(([href, label]) => ({ href, label })), ...extraLinks]
    .map((l) => `<li><a href="${escapeHtml(l.href)}" class="underline">${escapeHtml(l.label)}</a></li>`)
    .join("");
  const paragraphs = extraText
    .split(/\n{2,}/)
    .map((p) => p.replace(/[#*_>`]/g, "").trim())
    .filter(Boolean)
    .map((p) => `<p class="mt-4">${escapeHtml(p)}</p>`)
    .join("");
  return `<div class="mx-auto max-w-3xl px-4 py-10 text-foreground">
      <a href="/" class="font-display text-xl font-extrabold text-primary">UNAU Kyambogo</a>
      <h1 class="mt-6 font-display text-3xl font-black text-primary">${escapeHtml(meta.h1 ?? meta.title)}</h1>
      ${meta.intro ? `<p class="mt-4 text-lg">${escapeHtml(meta.intro)}</p>` : ""}
      ${paragraphs}
      <nav aria-label="Site" class="mt-8"><ul class="space-y-1">${links}</ul></nav>
    </div>`;
};
