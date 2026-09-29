import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, ImagePlus, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { parseImpact, type ImpactStat, type Project } from "@/hooks/use-site";
import { uploadSiteMedia } from "@/lib/media";
import { PROJECT_CATEGORIES } from "@/data/chapter";
import { SDGS } from "@/data/sdgs";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { cn } from "@/lib/utils";

type Draft = {
  title: string;
  slug: string;
  summary: string;
  body: string;
  category: string;
  event_date: string;
  location: string;
  partners: string;
  sdgs: number[];
  impact: ImpactStat[];
  cover_image: string | null;
  gallery: string[];
  cta_label: string;
  cta_url: string;
  is_featured: boolean;
  is_published: boolean;
};

const EMPTY: Draft = {
  title: "",
  slug: "",
  summary: "",
  body: "",
  category: "Community outreach",
  event_date: "",
  location: "",
  partners: "",
  sdgs: [],
  impact: [],
  cover_image: null,
  gallery: [],
  cta_label: "",
  cta_url: "",
  is_featured: false,
  is_published: false,
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const fromProject = (p: Project): Draft => ({
  title: p.title,
  slug: p.slug,
  summary: p.summary,
  body: p.body,
  category: p.category,
  event_date: p.event_date ?? "",
  location: p.location ?? "",
  partners: p.partners ?? "",
  sdgs: p.sdgs,
  impact: parseImpact(p.impact),
  cover_image: p.cover_image,
  gallery: p.gallery,
  cta_label: p.cta_label ?? "",
  cta_url: p.cta_url ?? "",
  is_featured: p.is_featured,
  is_published: p.is_published,
});

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-4 rounded-2xl bg-card p-6 shadow-card ring-1 ring-border/60">
    <h2 className="font-display text-lg font-extrabold text-primary">{title}</h2>
    {children}
  </section>
);

const ProjectEditor = () => {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: existing, isLoading } = useQuery({
    queryKey: ["projects", "by-id", id],
    enabled: !isNew,
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (existing) {
      setDraft(fromProject(existing));
      setSlugTouched(true);
    }
  }, [existing]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const save = useMutation({
    mutationFn: async () => {
      const row = {
        title: draft.title.trim(),
        slug: draft.slug || slugify(draft.title),
        summary: draft.summary.trim(),
        body: draft.body,
        category: draft.category,
        event_date: draft.event_date || null,
        location: draft.location.trim() || null,
        partners: draft.partners.trim() || null,
        sdgs: [...draft.sdgs].sort((a, b) => a - b),
        impact: draft.impact
          .filter((s) => s.value.trim() && s.label.trim())
          .map((s) => ({ value: s.value.trim(), label: s.label.trim() })) as Json,
        cover_image: draft.cover_image,
        gallery: draft.gallery,
        cta_label: draft.cta_label.trim() || null,
        cta_url: draft.cta_url.trim() || null,
        is_featured: draft.is_featured,
        is_published: draft.is_published,
      };
      if (isNew) {
        const { data, error } = await supabase.from("projects").insert(row).select("id").single();
        if (error) throw error;
        return data.id;
      }
      const { error } = await supabase.from("projects").update(row).eq("id", id!);
      if (error) throw error;
      return id!;
    },
    onSuccess: (savedId) => {
      toast.success("Project saved");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      if (isNew) navigate(`/admin/projects/${savedId}`, { replace: true });
    },
    onError: (error: { code?: string }) =>
      toast.error(error?.code === "23505" ? "Another project already uses that URL slug." : "Couldn't save the project."),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("projects").delete().eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Project deleted");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      navigate("/admin/projects");
    },
  });

  const handleUpload = async (files: FileList | null, target: "cover" | "gallery") => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(Array.from(files).map((f) => uploadSiteMedia(f, "projects")));
      if (target === "cover") set("cover_image", urls[0]);
      else setDraft((d) => ({ ...d, gallery: [...d.gallery, ...urls] }));
    } catch (e) {
      console.error(e);
      toast.error("Upload failed. Use JPG, PNG or WebP images under 5 MB.");
    } finally {
      setUploading(false);
    }
  };

  if (!isNew && isLoading) return <Loader2 className="h-6 w-6 animate-spin" />;

  const canSave = draft.title.trim().length >= 2 && !save.isPending && !uploading;

  return (
    <>
      <Link to="/admin/projects" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> All projects
      </Link>
      <AdminPageHeader
        title={isNew ? "New project" : draft.title || "Edit project"}
        actions={
          <>
            {!isNew && draft.is_published && (
              <Button asChild variant="outline">
                <a href={`/projects/${draft.slug}`} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" /> View
                </a>
              </Button>
            )}
            <Button onClick={() => save.mutate()} disabled={!canSave} className="bg-primary font-bold">
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Section title="The story">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={draft.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setDraft((d) => ({ ...d, title, slug: slugTouched ? d.slug : slugify(title) }));
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Web address</Label>
              <div className="flex items-center rounded-md border bg-muted/40 pl-3 text-sm text-muted-foreground">
                /projects/
                <Input
                  id="slug"
                  className="border-0 bg-transparent pl-1 shadow-none focus-visible:ring-0"
                  value={draft.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", slugify(e.target.value));
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">Summary (shown on cards)</Label>
              <Textarea id="summary" rows={2} maxLength={300} value={draft.summary} onChange={(e) => set("summary", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Full write-up</Label>
              <Textarea id="body" rows={16} className="font-mono text-sm" value={draft.body} onChange={(e) => set("body", e.target.value)} />
              <p className="text-xs text-muted-foreground">
                Formatting: <code>**bold**</code>, <code>### Heading</code>, <code>- bullet</code>, blank line for a new paragraph.
              </p>
            </div>
          </Section>

          <Section title="Photos">
            <div>
              <Label>Cover image</Label>
              <div className="mt-2 flex items-start gap-4">
                {draft.cover_image ? (
                  <div className="relative">
                    <img src={draft.cover_image} alt="" className="h-32 w-52 rounded-xl object-cover" />
                    <button
                      onClick={() => set("cover_image", null)}
                      className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white"
                      aria-label="Remove cover"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-32 w-52 items-center justify-center rounded-xl bg-muted text-xs text-muted-foreground">
                    No cover. A branded panel is shown.
                  </div>
                )}
                <label className="cursor-pointer">
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => handleUpload(e.target.files, "cover")} />
                  <span className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold hover:bg-muted">
                    <ImagePlus className="h-4 w-4" /> {draft.cover_image ? "Replace" : "Upload"}
                  </span>
                </label>
              </div>
            </div>
            <div>
              <Label>Gallery</Label>
              <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {draft.gallery.map((src) => (
                  <div key={src} className="relative">
                    <img src={src} alt="" className="aspect-square w-full rounded-lg object-cover" />
                    <button
                      onClick={() => set("gallery", draft.gallery.filter((g) => g !== src))}
                      className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white"
                      aria-label="Remove photo"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary">
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => handleUpload(e.target.files, "gallery")} />
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
                  Add photos
                </label>
              </div>
            </div>
          </Section>

          <Section title="Impact numbers">
            <p className="-mt-2 text-sm text-muted-foreground">Shown as a green band under the title, e.g. "200+" / "Participants".</p>
            {draft.impact.map((s, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  className="w-36"
                  placeholder="200+"
                  value={s.value}
                  onChange={(e) => set("impact", draft.impact.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
                />
                <Input
                  placeholder="Participants"
                  value={s.label}
                  onChange={(e) => set("impact", draft.impact.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                />
                <Button variant="ghost" size="icon" onClick={() => set("impact", draft.impact.filter((_, j) => j !== i))} aria-label="Remove">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {draft.impact.length < 4 && (
              <Button variant="outline" size="sm" onClick={() => set("impact", [...draft.impact, { value: "", label: "" }])}>
                <Plus className="h-4 w-4" /> Add number
              </Button>
            )}
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Visibility">
            <label className="flex items-center justify-between gap-3">
              <span>
                <span className="block font-semibold">Published</span>
                <span className="text-xs text-muted-foreground">Visible on the public site</span>
              </span>
              <Switch checked={draft.is_published} onCheckedChange={(v) => set("is_published", v)} />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span>
                <span className="block font-semibold">Featured</span>
                <span className="text-xs text-muted-foreground">Shown on the home page</span>
              </span>
              <Switch checked={draft.is_featured} onCheckedChange={(v) => set("is_featured", v)} />
            </label>
          </Section>

          <Section title="Details">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={draft.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date (leave empty if ongoing)</Label>
              <Input id="date" type="date" value={draft.event_date} onChange={(e) => set("event_date", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={draft.location} onChange={(e) => set("location", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partners">Partners</Label>
              <Textarea id="partners" rows={2} value={draft.partners} onChange={(e) => set("partners", e.target.value)} />
            </div>
          </Section>

          <Section title="SDGs">
            <div className="grid grid-cols-6 gap-1.5">
              {SDGS.map((s) => {
                const on = draft.sdgs.includes(s.number);
                return (
                  <button
                    key={s.number}
                    type="button"
                    title={s.title}
                    onClick={() => set("sdgs", on ? draft.sdgs.filter((n) => n !== s.number) : [...draft.sdgs, s.number])}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-md font-display text-sm font-black text-white transition",
                      on ? "ring-2 ring-primary ring-offset-2" : "opacity-30 hover:opacity-70"
                    )}
                    style={{ backgroundColor: s.color }}
                  >
                    {s.number}
                  </button>
                );
              })}
            </div>
          </Section>

          <Section title="Button (optional)">
            <Input placeholder="Label, e.g. Open the Tree Map" value={draft.cta_label} onChange={(e) => set("cta_label", e.target.value)} />
            <Input placeholder="Link, e.g. /map or https://…" value={draft.cta_url} onChange={(e) => set("cta_url", e.target.value)} />
          </Section>

          {!isNew && (
            <Button
              variant="ghost"
              className="w-full text-destructive hover:text-destructive"
              onClick={() => confirm("Delete this project permanently?") && remove.mutate()}
            >
              <Trash2 className="h-4 w-4" /> Delete project
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default ProjectEditor;
