import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, Loader2, Mail, Phone, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { usePositions, type Application } from "@/hooks/use-site";
import { downloadCsv } from "@/lib/media";
import { cn } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const STATUSES = ["new", "shortlisted", "interviewed", "accepted", "rejected"] as const;

const STATUS_STYLE: Record<string, string> = {
  new: "bg-brand-gold/20 text-amber-800",
  shortlisted: "bg-blue-100 text-blue-800",
  interviewed: "bg-purple-100 text-purple-800",
  accepted: "bg-secondary/15 text-brand-green-dark",
  rejected: "bg-muted text-muted-foreground",
};

type Row = Application & { executive_positions: { title: string } | null };

const StatusPill = ({ status }: { status: string }) => (
  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold capitalize", STATUS_STYLE[status])}>{status}</span>
);

const Detail = ({ app, onClose }: { app: Row; onClose: () => void }) => {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState(app.admin_notes ?? "");
  useEffect(() => setNotes(app.admin_notes ?? ""), [app]);

  const update = useMutation({
    mutationFn: async (patch: Partial<Application>) => {
      const { error } = await supabase.from("executive_applications").update(patch).eq("id", app.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
      toast.success("Saved");
    },
    onError: () => toast.error("Couldn't save."),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("executive_applications").delete().eq("id", app.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "applications"] });
      toast.success("Application deleted");
      onClose();
    },
  });

  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs font-bold uppercase text-muted-foreground">Position</p>
          <p className="font-semibold">{app.executive_positions?.title}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-muted-foreground">Submitted</p>
          <p className="font-semibold">{format(new Date(app.created_at), "d MMM yyyy, HH:mm")}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-muted-foreground">Course</p>
          <p className="font-semibold">{app.course}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-muted-foreground">Year</p>
          <p className="font-semibold">Year {app.year_of_study}</p>
        </div>
        {app.faculty && (
          <div className="col-span-2">
            <p className="text-xs font-bold uppercase text-muted-foreground">Faculty / school</p>
            <p className="font-semibold">{app.faculty}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <a href={`tel:${app.phone.replace(/[^\d+]/g, "")}`}>
            <Phone className="h-4 w-4" /> {app.phone}
          </a>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href={`mailto:${app.email}`}>
            <Mail className="h-4 w-4" /> {app.email}
          </a>
        </Button>
      </div>

      {app.motivation && (
        <div>
          <p className="text-xs font-bold uppercase text-muted-foreground">Why this role</p>
          <p className="mt-1 whitespace-pre-wrap rounded-lg bg-muted/60 p-3 text-sm">{app.motivation}</p>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs font-bold uppercase text-muted-foreground">Status</p>
        <Select value={app.status} onValueChange={(v) => update.mutate({ status: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold uppercase text-muted-foreground">Private notes</p>
        <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Interview notes, follow-ups…" />
        <Button size="sm" onClick={() => update.mutate({ admin_notes: notes.trim() || null })} disabled={notes === (app.admin_notes ?? "")}>
          Save notes
        </Button>
      </div>

      <Button
        variant="ghost"
        className="text-destructive hover:text-destructive"
        onClick={() => confirm(`Delete ${app.full_name}'s application permanently?`) && remove.mutate()}
      >
        <Trash2 className="h-4 w-4" /> Delete application
      </Button>
    </div>
  );
};

const AdminApplications = () => {
  const { data: positions } = usePositions();
  const [position, setPosition] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("executive_applications")
        .select("*, executive_positions(title)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Row[];
    },
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data ?? []).filter(
      (a) =>
        (position === "all" || a.position_id === position) &&
        (status === "all" || a.status === status) &&
        (!term || [a.full_name, a.email, a.course, a.phone].some((f) => f.toLowerCase().includes(term)))
    );
  }, [data, position, status, search]);

  const selected = data?.find((a) => a.id === selectedId) ?? null;

  const exportCsv = () =>
    downloadCsv(
      `unau-applications-${format(new Date(), "yyyy-MM-dd")}.csv`,
      filtered.map((a) => ({
        Submitted: format(new Date(a.created_at), "yyyy-MM-dd HH:mm"),
        Position: a.executive_positions?.title ?? "",
        "Full name": a.full_name,
        Email: a.email,
        Phone: a.phone,
        Course: a.course,
        "Year of study": a.year_of_study,
        Faculty: a.faculty ?? "",
        Motivation: a.motivation ?? "",
        Status: a.status,
        Notes: a.admin_notes ?? "",
      }))
    );

  return (
    <>
      <AdminPageHeader
        title="Applications"
        description={`${data?.length ?? 0} applications for executive positions.`}
        actions={
          <Button variant="outline" onClick={exportCsv} disabled={!filtered.length}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px_180px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search name, email, course, phone…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={position} onValueChange={setPosition}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All positions</SelectItem>
            {positions?.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-border/60">
        {isLoading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="p-10 text-center text-muted-foreground">No applications match.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Applicant</th>
                  <th className="px-4 py-3">Position</th>
                  <th className="hidden px-4 py-3 md:table-cell">Course</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Phone</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((a) => (
                  <tr key={a.id} onClick={() => setSelectedId(a.id)} className="cursor-pointer hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-primary">{a.full_name}</p>
                      <p className="text-xs text-muted-foreground">{a.email}</p>
                    </td>
                    <td className="px-4 py-3">{a.executive_positions?.title}</td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      {a.course}
                      <span className="text-muted-foreground"> · Y{a.year_of_study}</span>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 lg:table-cell">{a.phone}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={a.status} />
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-muted-foreground sm:table-cell">
                      {format(new Date(a.created_at), "d MMM")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display text-2xl font-black text-primary">{selected.full_name}</SheetTitle>
                <SheetDescription>
                  <StatusPill status={selected.status} />
                </SheetDescription>
              </SheetHeader>
              <Detail app={selected} onClose={() => setSelectedId(null)} />
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default AdminApplications;
