// Production build: `vite build`, then prerender SEO for every public page.
//
// The site is a single-page app, so without this step every URL would share the
// home page's <title> and link preview. For each page we write dist/<path>/index.html
// with its own title, description, canonical URL, Open Graph/Twitter tags, JSON-LD
// and readable fallback content, then generate sitemap.xml and robots.txt.
// Netlify serves those files directly; the app still starts on every page as before.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { build, createServer, loadEnv } from "vite";

const root = process.cwd();
const dist = path.join(root, "dist");

// On Netlify production builds, URL is the site's primary address (custom domain once added).
if (!process.env.VITE_SITE_URL && process.env.CONTEXT === "production" && process.env.URL) {
  process.env.VITE_SITE_URL = process.env.URL;
}

await build({ mode: "production" });

const env = loadEnv("production", root, "");

// Load the shared SEO module (TypeScript) through Vite so the app and this script use the same copy.
const vite = await createServer({
  mode: "production",
  logLevel: "error",
  appType: "custom",
  server: { middlewareMode: true, hmr: false },
});
const seo = await vite.ssrLoadModule("/src/lib/seo-core.ts");
await vite.close();

const { SITE_URL, STATIC_PAGES, projectPageMeta, renderHeadTags, renderFallbackBody, absoluteUrl } = seo;

async function fetchProjects() {
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.warn("[prerender] Supabase env vars missing; project pages skipped.");
    return [];
  }
  try {
    const res = await fetch(
      `${url.replace(/\/+$/, "")}/rest/v1/projects?select=slug,title,summary,body,category,event_date,location,partners,cover_image,sdgs,updated_at&is_published=eq.true&order=event_date.desc.nullsfirst`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn(`[prerender] Could not load projects (${error.message}); project pages skipped.`);
    return [];
  }
}

const template = await readFile(path.join(dist, "index.html"), "utf8");
const HEAD_BLOCK = /<!-- seo:start[\s\S]*?<!-- seo:end -->/;
if (!HEAD_BLOCK.test(template) || !template.includes("<!-- seo:body -->")) {
  throw new Error("[prerender] index.html is missing the seo:start/seo:end or seo:body markers.");
}

const HERO_PRELOAD =
  '    <link rel="preload" as="image" href="/images/hero/unau-group.webp" imagesrcset="/images/hero/unau-group-md.webp 1000w, /images/hero/unau-group.webp 2000w" imagesizes="100vw" fetchpriority="high" />';

async function writePage(meta, { links = [], text = "", extraHead = "" } = {}) {
  const head = renderHeadTags(meta) + (extraHead ? `\n${extraHead}` : "");
  const html = template
    .replace(HEAD_BLOCK, () => head.trimStart())
    .replace("<!-- seo:body -->", () => renderFallbackBody(meta, links, text));
  if (meta.path === "/") {
    await writeFile(path.join(dist, "index.html"), html);
    return;
  }
  // Write both about.html and about/index.html so /about and /about/ are served
  // the prerendered page whichever way the host resolves clean URLs.
  const base = path.join(dist, meta.path);
  await mkdir(base, { recursive: true });
  await writeFile(path.join(base, "index.html"), html);
  await writeFile(`${base}.html`, html);
}

const projects = await fetchProjects();
const projectLinks = projects.map((p) => ({ href: `/projects/${p.slug}`, label: p.title }));

for (const meta of Object.values(STATIC_PAGES)) {
  await writePage(meta, {
    links: meta.path === "/projects" || meta.path === "/" ? projectLinks : [],
    extraHead: meta.path === "/" ? HERO_PRELOAD : "",
  });
}
for (const project of projects) {
  await writePage(projectPageMeta(project), { text: project.body ?? "" });
}

// sitemap.xml, including project cover photos for Google Images.
const today = new Date().toISOString().slice(0, 10);
const xml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const priorities = { "/": "1.0", "/projects": "0.9", "/map": "0.9", "/about": "0.8", "/apply": "0.7", "/leaderboard": "0.6", "/dashboard": "0.5" };
const entries = [
  ...Object.values(STATIC_PAGES).map(
    (m) => `  <url><loc>${xml(absoluteUrl(m.path))}</loc><lastmod>${today}</lastmod><priority>${priorities[m.path] ?? "0.5"}</priority></url>`
  ),
  ...projects.map((p) => {
    const image = p.cover_image
      ? `<image:image><image:loc>${xml(absoluteUrl(p.cover_image))}</image:loc><image:title>${xml(p.title)}</image:title></image:image>`
      : "";
    const lastmod = (p.updated_at ?? today).slice(0, 10);
    return `  <url><loc>${xml(absoluteUrl(`/projects/${p.slug}`))}</loc><lastmod>${lastmod}</lastmod><priority>0.8</priority>${image}</url>`;
  }),
];
await writeFile(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${entries.join("\n")}\n</urlset>\n`
);

await writeFile(
  path.join(dist, "robots.txt"),
  `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /auth\nDisallow: /profile\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
);

console.log(
  `[prerender] ${Object.keys(STATIC_PAGES).length} pages + ${projects.length} project pages, sitemap and robots.txt for ${SITE_URL}`
);
