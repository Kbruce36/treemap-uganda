import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { CHAPTER } from "@/data/chapter";
import { useSession } from "./use-session";

export type SiteSettings = Tables<"site_settings">;
export type Position = Tables<"executive_positions">;
export type Project = Tables<"projects">;
export type TeamMember = Tables<"team_members">;
export type Application = Tables<"executive_applications">;

export interface ImpactStat {
  value: string;
  label: string;
}

export const parseImpact = (impact: Project["impact"]): ImpactStat[] =>
  Array.isArray(impact)
    ? impact.filter(
        (s): s is { value: string; label: string } =>
          !!s && typeof s === "object" && "value" in s && "label" in s
      ).map((s) => ({ value: String(s.value), label: String(s.label) }))
    : [];

/** An award or certificate a project earned. */
export interface RecognitionItem {
  title: string;
  issuer: string;
  image: string | null;
}

export const parseRecognition = (value: unknown): RecognitionItem[] =>
  Array.isArray(value)
    ? value
        .filter((r): r is Record<string, unknown> => !!r && typeof r === "object" && typeof (r as { title?: unknown }).title === "string")
        .map((r) => ({
          title: String(r.title),
          issuer: typeof r.issuer === "string" ? r.issuer : "",
          image: typeof r.image === "string" && r.image ? r.image : null,
        }))
    : [];

/** "Cabinet 2026/27 · Applications open", without repeating "open" if the admin's title already says it. */
export const applicationsCallLabel = (title?: string | null) => {
  const t = (title ?? "").trim() || "Cabinet";
  return /\bopen\b/i.test(t) ? t : `${t} · Applications open`;
};

export const applicationsAreOpen = (settings?: SiteSettings | null) =>
  !!settings?.applications_open &&
  (!settings.applications_deadline || new Date(settings.applications_deadline) > new Date());

export const useSiteSettings = () =>
  useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

/** Chapter contact details, editable in /admin/settings (falls back to the defaults in data/chapter.ts). */
export const useChapterContact = () => {
  const { data: settings } = useSiteSettings();
  const phone = settings?.contact_phone || CHAPTER.phone;
  const instagram = settings?.instagram_handle || CHAPTER.socials.instagram.handle.replace(/^@/, "");
  const x = settings?.x_handle || CHAPTER.socials.x.handle.replace(/^@/, "");
  return {
    phone,
    phoneHref: `tel:${phone.replace(/[^\d+]/g, "")}`,
    email: settings?.contact_email || CHAPTER.email,
    membershipFee: settings?.membership_fee || CHAPTER.membershipFee,
    instagram: { handle: `@${instagram}`, url: `https://instagram.com/${instagram}` },
    x: { handle: `@${x}`, url: `https://x.com/${x}` },
  };
};

export const usePositions = () =>
  useQuery({
    queryKey: ["executive_positions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("executive_positions")
        .select("*")
        .order("sort_order")
        .order("title");
      if (error) throw error;
      return data;
    },
  });

/** Published projects, newest first. Admins also receive drafts (RLS decides). */
export const useProjects = () =>
  useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("event_date", { ascending: false, nullsFirst: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });

export const useProject = (slug: string | undefined) =>
  useQuery({
    queryKey: ["projects", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("slug", slug!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const useTeam = () =>
  useQuery({
    queryKey: ["team_members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("sort_order")
        .order("full_name");
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60_000,
  });

/** Whether the signed-in user holds the admin role. The database enforces it; this only drives the UI. */
export const useIsAdmin = () => {
  const { session, loading: sessionLoading } = useSession();
  const query = useQuery({
    queryKey: ["is_admin", session?.user.id],
    enabled: !!session,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("is_admin");
      if (error) throw error;
      return !!data;
    },
    staleTime: 5 * 60_000,
  });

  return {
    session,
    isAdmin: !!session && query.data === true,
    loading: sessionLoading || (!!session && query.isLoading),
  };
};
