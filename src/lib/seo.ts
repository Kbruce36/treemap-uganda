import { useEffect } from "react";
import { absoluteUrl, SITE_NAME, type PageMeta } from "./seo-core";

const DEFAULT_IMAGE = "/images/og-image.jpg";

const upsertMeta = (attr: "name" | "property", key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const removeMeta = (attr: "name" | "property", key: string) =>
  document.head.querySelector(`meta[${attr}="${key}"]`)?.remove();

/** Mirrors renderHeadTags() in seo-core for pages reached by in-app navigation. */
const applyMeta = (meta: PageMeta) => {
  const url = absoluteUrl(meta.path);
  const image = absoluteUrl(meta.image || DEFAULT_IMAGE);

  document.title = meta.title;
  upsertMeta("name", "description", meta.description);
  upsertMeta("name", "robots", meta.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large");

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = url;

  upsertMeta("property", "og:site_name", SITE_NAME);
  upsertMeta("property", "og:type", meta.type ?? "website");
  upsertMeta("property", "og:title", meta.title);
  upsertMeta("property", "og:description", meta.description);
  upsertMeta("property", "og:url", url);
  upsertMeta("property", "og:image", image);
  upsertMeta("property", "og:image:alt", meta.imageAlt ?? "UNAU Kyambogo members at Kyambogo University");
  if (!meta.image || meta.image === DEFAULT_IMAGE) {
    upsertMeta("property", "og:image:width", "1200");
    upsertMeta("property", "og:image:height", "630");
  } else {
    removeMeta("property", "og:image:width");
    removeMeta("property", "og:image:height");
  }
  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", meta.title);
  upsertMeta("name", "twitter:description", meta.description);
  upsertMeta("name", "twitter:image", image);

  document.getElementById("page-jsonld")?.remove();
  if (meta.jsonLd?.length) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "page-jsonld";
    script.textContent = JSON.stringify(meta.jsonLd.length === 1 ? meta.jsonLd[0] : meta.jsonLd);
    document.head.appendChild(script);
  }
};

/** Sets the page's title, description, share preview and structured data. Pass null while data loads. */
export const usePageMeta = (meta: PageMeta | null) => {
  const key = meta ? JSON.stringify(meta) : null;
  useEffect(() => {
    if (meta) applyMeta(meta);
    // `key` captures every field of meta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
};
