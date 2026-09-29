import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useTeam, type TeamMember } from "@/hooks/use-site";
import { uploadSiteMedia } from "@/lib/media";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { cn } from "@/lib/utils";

type Draft = Pick<TeamMember, "full_name" | "role" | "bio" | "photo_url" | "is_active"> & { id?: string };

const EMPTY: Draft = { full_name: "", role: "", bio: "", photo_url: null, is_active: true };

const AdminTeam = () => {
  const queryClient = useQueryClient();
  const { data: team, isLoading } = useTeam();
  const [editing, setEditing] = useState<Draft | null>(null);
  const [uploading, setUploading] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["team_members"] });

  const save = useMutation({
    mutationFn: async (d: Draft) => {
      const row = {
        full_name: d.full_name.trim(),
        role: d.role.trim(),
        bio: d.bio?.trim() || null,
        photo_url: d.photo_url,
        is_active: d.is_active,
      };
      const { error } = d.id
        ? await supabase.from("team_members").update(row).eq("id", d.id)
        : await supabase.from("team_members").insert({ ...row, sort_order: (team?.length ?? 0) + 1 });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Saved");
      setEditing(null);
      invalidate();
    },
    onError: () => toast.error("Couldn't save. Name and role need at least 2 characters."),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("team_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const move = useMutation({
    mutationFn: async ({ index, dir }: { index: number; dir: -1 | 1 }) => {
      const list = [...(team ?? [])];
      const target = index + dir;
      if (target < 0 || target >= list.length) return;
      [list[index], list[target]] = [list[target], list[index]];
      await Promise.all(
        list.map((m, i) => supabase.from("team_members").update({ sort_order: i + 1 }).eq("id", m.id))
      );
    },
    onSuccess: invalidate,
  });

  const handlePhoto = async (file?: File) => {
    if (!file || !editing) return;
    setUploading(true);
    try {
      const url = await uploadSiteMedia(file, "team");
      setEditing((e) => (e ? { ...e, photo_url: url } : e));
    } catch {
      toast.error("Upload failed. Use a JPG, PNG or WebP under 5 MB.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Team"
        description="The executive committee shown on the About page. Hide past members instead of deleting them."
        actions={
          <Button className="bg-primary font-bold" onClick={() => setEditing({ ...EMPTY })}>
            <Plus className="h-4 w-4" /> Add member
          </Button>
        }
      />

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-border/60">
          <ul className="divide-y">
            {team?.map((m, i) => (
              <li key={m.id} className={cn("flex items-center gap-4 p-3", !m.is_active && "opacity-50")}>
                <div className="flex flex-col">
                  <button onClick={() => move.mutate({ index: i, dir: -1 })} disabled={i === 0} className="p-0.5 text-muted-foreground hover:text-primary disabled:opacity-20" aria-label="Move up">
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button onClick={() => move.mutate({ index: i, dir: 1 })} disabled={i === (team?.length ?? 0) - 1} className="p-0.5 text-muted-foreground hover:text-primary disabled:opacity-20" aria-label="Move down">
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
                {m.photo_url ? (
                  <img src={m.photo_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-display font-bold text-white">
                    {m.full_name[0]}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-primary">{m.full_name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {m.role}
                    {!m.is_active && " · hidden"}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setEditing({ ...m })} aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => confirm(`Remove ${m.full_name}?`) && remove.mutate(m.id)}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit member" : "Add member"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {editing.photo_url ? (
                  <img src={editing.photo_url} alt="" className="h-20 w-16 rounded-lg object-cover" />
                ) : (
                  <div className="h-20 w-16 rounded-lg bg-muted" />
                )}
                <label className="cursor-pointer">
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => handlePhoto(e.target.files?.[0])} />
                  <span className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold hover:bg-muted">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />} Photo
                  </span>
                </label>
                {editing.photo_url && (
                  <Button variant="ghost" size="sm" onClick={() => setEditing({ ...editing, photo_url: null })}>
                    Remove
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="m-name">Full name</Label>
                <Input id="m-name" value={editing.full_name} onChange={(e) => setEditing({ ...editing, full_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="m-role">Role</Label>
                <Input id="m-role" value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="m-bio">Short bio (optional)</Label>
                <Textarea id="m-bio" rows={3} value={editing.bio ?? ""} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} />
              </div>
              <label className="flex items-center justify-between">
                <span className="text-sm font-semibold">Show on the website</span>
                <Switch checked={editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={() => editing && save.mutate(editing)} disabled={save.isPending || uploading} className="bg-primary">
              {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminTeam;
