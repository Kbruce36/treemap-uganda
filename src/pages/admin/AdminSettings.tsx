import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { applicationsAreOpen, usePositions, useSiteSettings, type Position } from "@/hooks/use-site";
import { SDGS } from "@/data/sdgs";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { cn } from "@/lib/utils";

const toLocalInput = (iso: string | null) => (iso ? format(new Date(iso), "yyyy-MM-dd'T'HH:mm") : "");

const Card = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
  <section className="rounded-2xl bg-card p-6 shadow-card ring-1 ring-border/60">
    <h2 className="font-display text-lg font-extrabold text-primary">{title}</h2>
    {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    <div className="mt-5">{children}</div>
  </section>
);

const PositionRow = ({ position }: { position: Position }) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(position.title);
  const [description, setDescription] = useState(position.description ?? "");
  const dirty = title !== position.title || description !== (position.description ?? "");

  const update = useMutation({
    mutationFn: async (patch: Partial<Position>) => {
      const { error } = await supabase.from("executive_positions").update(patch).eq("id", position.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["executive_positions"] }),
    onError: () => toast.error("Couldn't update the position."),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("executive_positions").delete().eq("id", position.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Position removed");
      queryClient.invalidateQueries({ queryKey: ["executive_positions"] });
    },
    onError: () => toast.error("This position has applications. Close it instead of deleting it."),
  });

  return (
    <div className={cn("rounded-xl border p-4", !position.is_open && "bg-muted/50")}>
      <div className="flex items-center gap-3">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="font-semibold" />
        <div className="flex shrink-0 items-center gap-2">
          <Switch
            checked={position.is_open}
            onCheckedChange={(v) => update.mutate({ is_open: v })}
            aria-label={`Accept applications for ${position.title}`}
          />
          <span className="w-12 text-xs font-bold text-muted-foreground">{position.is_open ? "Open" : "Closed"}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => confirm(`Delete "${position.title}"?`) && remove.mutate()}
          aria-label="Delete position"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
      <Textarea
        rows={2}
        className="mt-2 text-sm"
        placeholder="Short description shown to applicants"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {dirty && (
        <Button
          size="sm"
          className="mt-2"
          onClick={() => update.mutate({ title: title.trim(), description: description.trim() || null })}
          disabled={update.isPending || title.trim().length < 2}
        >
          Save changes
        </Button>
      )}
    </div>
  );
};

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useSiteSettings();
  const { data: positions } = usePositions();

  const [form, setForm] = useState({
    applications_open: false,
    applications_deadline: "",
    applications_title: "",
    applications_message: "",
    sdg_focus: "3",
    contact_phone: "",
    contact_email: "",
    membership_fee: "",
    instagram_handle: "",
    x_handle: "",
  });
  const [newPosition, setNewPosition] = useState("");

  useEffect(() => {
    if (!settings) return;
    setForm({
      applications_open: settings.applications_open,
      applications_deadline: toLocalInput(settings.applications_deadline),
      applications_title: settings.applications_title,
      applications_message: settings.applications_message,
      sdg_focus: String(settings.sdg_focus),
      contact_phone: settings.contact_phone,
      contact_email: settings.contact_email,
      membership_fee: settings.membership_fee,
      instagram_handle: settings.instagram_handle,
      x_handle: settings.x_handle,
    });
  }, [settings]);

  const field = (key: keyof typeof form) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("site_settings")
        .update({
          applications_open: form.applications_open,
          applications_deadline: form.applications_deadline ? new Date(form.applications_deadline).toISOString() : null,
          applications_title: form.applications_title.trim() || "Cabinet",
          applications_message: form.applications_message.trim(),
          sdg_focus: Number(form.sdg_focus),
          contact_phone: form.contact_phone.trim(),
          contact_email: form.contact_email.trim(),
          membership_fee: form.membership_fee.trim(),
          instagram_handle: form.instagram_handle.trim().replace(/^@/, ""),
          x_handle: form.x_handle.trim().replace(/^@/, ""),
        })
        .eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings saved");
      queryClient.invalidateQueries({ queryKey: ["site_settings"] });
    },
    onError: (error: { code?: string }) =>
      toast.error(
        error?.code === "23514"
          ? "Check the contact details: phone like +256 7XX XXX XXX, valid emails, and handles without spaces."
          : "Couldn't save settings."
      ),
  });

  const addPosition = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("executive_positions").insert({
        title: newPosition.trim(),
        sort_order: (positions?.length ?? 0) + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewPosition("");
      queryClient.invalidateQueries({ queryKey: ["executive_positions"] });
    },
    onError: () => toast.error("Couldn't add that position. Does it already exist?"),
  });

  if (isLoading) return <Loader2 className="h-6 w-6 animate-spin" />;

  const deadlinePassed = !!form.applications_deadline && new Date(form.applications_deadline) <= new Date();
  const liveNow = applicationsAreOpen(settings);

  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="Control the application window and what the website highlights."
        actions={
          <Button onClick={() => save.mutate()} disabled={save.isPending} className="bg-primary font-bold">
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save settings
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title="Executive applications"
          description="When closed, the /apply page shows a 'closed' message and the database rejects submissions."
        >
          <div
            className={cn(
              "flex items-center justify-between rounded-xl p-4",
              form.applications_open ? "bg-secondary/10 ring-1 ring-secondary/40" : "bg-muted"
            )}
          >
            <div>
              <p className="font-display font-extrabold text-primary">Accept applications</p>
              <p className="text-xs text-muted-foreground">
                Live right now: <strong>{liveNow ? "open" : "closed"}</strong>
                {form.applications_open !== settings?.applications_open && " (save to apply your change)"}
              </p>
            </div>
            <Switch checked={form.applications_open} onCheckedChange={(v) => setForm((f) => ({ ...f, applications_open: v }))} />
          </div>

          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline (optional, closes automatically)</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={form.applications_deadline}
                onChange={(e) => setForm((f) => ({ ...f, applications_deadline: e.target.value }))}
              />
              {deadlinePassed && form.applications_open && (
                <p className="text-xs font-semibold text-destructive">This deadline has passed, so applications stay closed.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="apps-title">Call title</Label>
              <Input
                id="apps-title"
                placeholder="Cabinet 2026/27"
                value={form.applications_title}
                onChange={(e) => setForm((f) => ({ ...f, applications_title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apps-message">Message to applicants</Label>
              <Textarea
                id="apps-message"
                rows={3}
                value={form.applications_message}
                onChange={(e) => setForm((f) => ({ ...f, applications_message: e.target.value }))}
              />
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="Semester SDG focus" description="Highlighted on the home page.">
            <Select value={form.sdg_focus} onValueChange={(v) => setForm((f) => ({ ...f, sdg_focus: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SDGS.map((s) => (
                  <SelectItem key={s.number} value={String(s.number)}>
                    <span className="mr-2 inline-block h-3 w-3 rounded-sm align-middle" style={{ backgroundColor: s.color }} />
                    SDG {s.number}: {s.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          <Card
            title="Chapter contact details"
            description="Shown in the footer, About, Apply and Join sections. Update these when the cabinet changes."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact-phone">Chapter phone</Label>
                <Input id="contact-phone" type="tel" placeholder="+256 7XX XXX XXX" {...field("contact_phone")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Chapter email</Label>
                <Input id="contact-email" type="email" {...field("contact_email")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="membership-fee">Membership fee</Label>
                <Input id="membership-fee" placeholder="UGX 10,000" {...field("membership_fee")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram handle</Label>
                <Input id="instagram" placeholder="unau_kyambogo" {...field("instagram_handle")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="x-handle">X handle</Label>
                <Input id="x-handle" placeholder="UnauKYU" {...field("x_handle")} />
              </div>
            </div>
          </Card>

          <Card title="Adding another admin" description="Admins are granted from the Supabase SQL editor, never from the website.">
            <pre className="overflow-x-auto rounded-lg bg-brand-navy-deep p-4 text-xs text-white">
{`insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users
where email = 'their-email@example.com';`}
            </pre>
            <p className="mt-2 text-xs text-muted-foreground">They must sign up on the website first.</p>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Card title="Positions" description="Switch a position off to stop new applications for it. Applicants only see open positions.">
          <div className="space-y-3">
            {positions?.map((p) => <PositionRow key={p.id} position={p} />)}
          </div>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (newPosition.trim().length >= 2) addPosition.mutate();
            }}
          >
            <Input placeholder="New position, e.g. Treasurer" value={newPosition} onChange={(e) => setNewPosition(e.target.value)} />
            <Button type="submit" variant="outline" disabled={addPosition.isPending || newPosition.trim().length < 2}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
};

export default AdminSettings;
