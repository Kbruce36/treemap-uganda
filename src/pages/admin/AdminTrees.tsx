import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, Loader2, MapPin, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { downloadCsv } from "@/lib/media";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const AdminTrees = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: trees, isLoading } = useQuery({
    queryKey: ["admin", "trees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trees")
        .select("id, species, tree_count, latitude, longitude, planted_date, notes, image_1, image_2, image_3, created_at, profiles(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(2000);
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return trees ?? [];
    return (trees ?? []).filter((t) =>
      [t.species, t.notes, t.profiles?.full_name, t.profiles?.email].some((f) => f?.toLowerCase().includes(term))
    );
  }, [trees, search]);

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("trees").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Tree removed");
      queryClient.invalidateQueries({ queryKey: ["admin", "trees"] });
    },
    onError: () => toast.error("Couldn't remove the tree."),
  });

  const total = filtered.reduce((sum, t) => sum + (t.tree_count ?? 0), 0);

  return (
    <>
      <AdminPageHeader
        title="Trees"
        description="Moderate what people map. Remove spam, duplicates or trees with impossible counts."
        actions={
          <Button
            variant="outline"
            disabled={!filtered.length}
            onClick={() =>
              downloadCsv(
                `unau-trees-${format(new Date(), "yyyy-MM-dd")}.csv`,
                filtered.map((t) => ({
                  Planted: t.planted_date,
                  Species: t.species ?? "",
                  Trees: t.tree_count,
                  Latitude: t.latitude,
                  Longitude: t.longitude,
                  Planter: t.profiles?.full_name ?? "",
                  Email: t.profiles?.email ?? "",
                  Notes: t.notes ?? "",
                }))
              )
            }
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search species, notes or planter…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <p className="text-sm text-muted-foreground">
          <strong className="text-primary">{total.toLocaleString()}</strong> trees across {filtered.length} pins
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-border/60">
        {isLoading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="p-10 text-center text-muted-foreground">No trees mapped yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Tree</th>
                  <th className="px-4 py-3">Count</th>
                  <th className="hidden px-4 py-3 md:table-cell">Planter</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Planted</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((t) => {
                  const thumb = t.image_1 ?? t.image_2 ?? t.image_3;
                  return (
                    <tr key={t.id} className={t.tree_count > 500 ? "bg-destructive/5" : undefined}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {thumb ? (
                            <img src={thumb} alt="" className="h-10 w-10 rounded object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded bg-muted" />
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-primary">{t.species || "Unknown species"}</p>
                            {t.notes && <p className="max-w-xs truncate text-xs text-muted-foreground">{t.notes}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold">{t.tree_count.toLocaleString()}</td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <p>{t.profiles?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{t.profiles?.email}</p>
                      </td>
                      <td className="hidden whitespace-nowrap px-4 py-3 text-muted-foreground sm:table-cell">
                        {t.planted_date ? format(new Date(t.planted_date), "d MMM yyyy") : "–"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <Button asChild variant="ghost" size="icon" title="Show on map">
                          <Link to={`/map?treeId=${t.id}&lat=${t.latitude}&lng=${t.longitude}`} target="_blank">
                            <MapPin className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Remove"
                          onClick={() => confirm("Remove this tree from the map?") && remove.mutate(t.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminTrees;
