import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { Leaf, User, Calendar, Pencil, Trash2 } from "lucide-react";

interface UserProfile {
  full_name: string;
  email: string;
  created_at: string;
}

interface Tree {
  id: string;
  species: string | null;
  planted_date: string;
  latitude: number;
  longitude: number;
  tree_count: number;
  notes: string | null;
  tree_care_advice?: { advice?: any; advice_json?: any; created_at?: string }[];
}

const Profile = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [editingTree, setEditingTree] = useState<Tree | null>(null);
  const [selectedTreeAdvice, setSelectedTreeAdvice] = useState<Tree | null>(null);
  const [editSpecies, setEditSpecies] = useState("");
  const [editTreeCount, setEditTreeCount] = useState(1);
  const [editNotes, setEditNotes] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Restore session from storage first
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCheckingAuth(false);
      if (!session) {
        navigate("/auth", { replace: true });
      }
    });

    // Then listen for subsequent auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session && !checkingAuth) {
          navigate("/auth", { replace: true });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
      fetchUserTrees();
    }
  }, [session]);

  const fetchProfile = async () => {
    if (!session?.user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();

    if (error) {
      toast.error("Failed to load profile");
    } else {
      setProfile(data);
      setFullName(data.full_name);
    }
  };

  const fetchUserTrees = async () => {
    if (!session?.user) return;

    const { data, error } = await supabase
      .from("trees")
      .select("*, tree_care_advice(*)")
      .eq("user_id", session.user.id)
      .order("planted_date", { ascending: false });

    if (error) {
      toast.error("Failed to load trees");
    } else {
      setTrees(data);
    }
  };

  const handleUpdateProfile = async () => {
    if (!session?.user) return;

    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", session.user.id);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated successfully");
      fetchProfile();
    }
    setLoading(false);
  };

  const openEditDialog = (tree: Tree) => {
    setEditingTree(tree);
    setEditSpecies(tree.species || "");
    setEditTreeCount(tree.tree_count || 1);
    setEditNotes(tree.notes || "");
  };

  const handleUpdateTree = async () => {
    if (!editingTree) return;

    setLoading(true);
    const { error } = await supabase
      .from("trees")
      .update({
        species: editSpecies || null,
        tree_count: editTreeCount,
        notes: editNotes || null,
      })
      .eq("id", editingTree.id);

    if (error) {
      toast.error("Failed to update tree");
    } else {
      toast.success("Tree updated successfully");
      setEditingTree(null);
      fetchUserTrees();
    }
    setLoading(false);
  };

  const handleDeleteTree = async (treeId: string) => {
    setLoading(true);
    const { error } = await supabase
      .from("trees")
      .delete()
      .eq("id", treeId);

    if (error) {
      toast.error("Failed to delete tree");
    } else {
      toast.success("Tree deleted successfully");
      setDeleteConfirmId(null);
      fetchUserTrees();
    }
    setLoading(false);
  };

  if (checkingAuth || !session) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-4">
            <Leaf className="w-12 h-12 text-primary animate-pulse" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-4">
            <Leaf className="w-12 h-12 text-primary animate-pulse" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                {profile.full_name[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-3xl font-bold">{profile.full_name}</h1>
            <p className="text-muted-foreground">{profile.email}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="shadow-card">
              <CardContent className="pt-6 text-center">
                <Leaf className="w-12 h-12 text-secondary mx-auto mb-2" />
                <div className="text-3xl font-bold text-primary">
                  {trees.reduce((sum, tree) => sum + (tree.tree_count || 1), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Trees Planted</div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="pt-6 text-center">
                <Calendar className="w-12 h-12 text-accent mx-auto mb-2" />
                <div className="text-3xl font-bold text-primary">
                  {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
                <div className="text-sm text-muted-foreground">Member Since</div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="pt-6 text-center">
                <User className="w-12 h-12 text-primary mx-auto mb-2" />
                <div className="text-3xl font-bold text-primary">Active</div>
                <div className="text-sm text-muted-foreground">Status</div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile.email} disabled />
              </div>
              <Button onClick={handleUpdateProfile} disabled={loading} variant="hero">
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Your Trees</CardTitle>
              <CardDescription>History of trees you've planted</CardDescription>
            </CardHeader>
            <CardContent>
              {trees.length === 0 ? (
                <div className="text-center py-12">
                  <Leaf className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">You haven't planted any trees yet</p>
                  <Button
                    variant="hero"
                    className="mt-4"
                    onClick={() => navigate("/map")}
                  >
                    Plant Your First Tree
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {trees.map((tree) => (
                    <div
                      key={tree.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <Leaf className="w-8 h-8 text-secondary" />
                      <div className="flex-1">
                        <h3 className="font-semibold">{tree.species || "Tree"}</h3>
                        <p className="text-sm text-muted-foreground">
                          {tree.tree_count} tree{tree.tree_count > 1 ? "s" : ""} • Planted on {new Date(tree.planted_date).toLocaleDateString()}
                        </p>
                        {tree.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{tree.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTreeAdvice(tree)}
                        >
                          View Advice
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(tree)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirmId(tree.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Edit Tree Dialog */}
        <Dialog open={!!editingTree} onOpenChange={() => setEditingTree(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Tree</DialogTitle>
              <DialogDescription>Update the information for this tree planting.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="editSpecies">Species</Label>
                <Input
                  id="editSpecies"
                  value={editSpecies}
                  onChange={(e) => setEditSpecies(e.target.value)}
                  placeholder="e.g., Oak, Pine, Maple"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTreeCount">Number of Trees</Label>
                <Input
                  id="editTreeCount"
                  type="number"
                  min="1"
                  value={editTreeCount}
                  onChange={(e) => setEditTreeCount(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editNotes">Notes</Label>
                <Textarea
                  id="editNotes"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Additional notes about this planting..."
                />
              </div>
              <Button onClick={handleUpdateTree} disabled={loading} className="w-full" variant="hero">
                {loading ? "Updating..." : "Save Changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Tree</DialogTitle>
              <DialogDescription>Are you sure you want to delete this tree? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirmId && handleDeleteTree(deleteConfirmId)}
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedTreeAdvice} onOpenChange={() => setSelectedTreeAdvice(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tree Advice</DialogTitle>
              <DialogDescription>
                {selectedTreeAdvice?.species || "Tree"} • Planted on {selectedTreeAdvice ? new Date(selectedTreeAdvice.planted_date).toLocaleDateString() : ""}
              </DialogDescription>
            </DialogHeader>

            {(() => {
              const adviceRecord = selectedTreeAdvice?.tree_care_advice?.[0] as any;
              const advice = adviceRecord?.advice ?? adviceRecord?.advice_json;

              if (!advice) {
                return (
                  <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
                    No AI advice has been generated for this tree yet.
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Recommended Species</p>
                      <p className="font-semibold">{advice.recommendedSpecies || selectedTreeAdvice?.species || "N/A"}</p>
                    </div>
                    <div className="bg-blue-500/10 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Watering Plan</p>
                      <p className="font-semibold">{advice.wateringFrequency || "N/A"}</p>
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Survival Steps</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {(advice.survivalAdvice || []).map((tip: string, index: number) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Maintenance Tips</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {(advice.maintenanceTips || []).map((tip: string, index: number) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Risk Factors</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-destructive">
                      {(advice.riskFactors || []).map((risk: string, index: number) => (
                        <li key={index}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Profile;
