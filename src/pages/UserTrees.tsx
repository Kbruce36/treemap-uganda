import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MapPin, Leaf, ArrowLeft, Calendar, Info } from "lucide-react";

interface TreeLocation {
  id: string;
  species: string | null;
  latitude: number;
  longitude: number;
  planted_date: string;
  notes: string | null;
  tree_care_advice?: { advice?: any; advice_json?: any }[];
}

interface UserProfile {
  full_name: string;
  email: string;
}

const UserTrees = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [trees, setTrees] = useState<TreeLocation[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTree, setSelectedTree] = useState<TreeLocation | null>(null);

  useEffect(() => {
    fetchUserTrees();
  }, [userId]);

  const fetchUserTrees = async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.warn("[UserTrees] Session recovery failed. Falling back to public view.", sessionError);
      }

      const isOwnProfile = !!session?.user && session.user.id === userId;

      if (isOwnProfile) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", userId)
          .single();

        if (profileError) throw profileError;
        setUserProfile(profileData);
      } else {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles_public")
          .select("full_name")
          .eq("id", userId)
          .single();

        if (profileError) throw profileError;
        setUserProfile({ full_name: profileData.full_name || "Unknown", email: "" });
      }

      if (isOwnProfile) {
        const { data: treesData, error: treesError } = await supabase
          .from("trees")
          .select("id, species, latitude, longitude, planted_date, notes, tree_care_advice(*)")
          .eq("user_id", userId)
          .order("planted_date", { ascending: false });

        if (treesError) throw treesError;
        setTrees(treesData || []);
      } else {
        const { data: treesData, error: treesError } = await supabase
          .from("user_trees_public")
          .select("id, species, latitude, longitude, planted_date, notes")
          .eq("user_id", userId)
          .order("planted_date", { ascending: false });

        if (treesError) throw treesError;
        setTrees(treesData || []);
      }
    } catch (error: any) {
      toast.error("Failed to load user trees");
    } finally {
      setLoading(false);
    }
  };

  const handleTreeClick = (tree: TreeLocation) => {
    setSelectedTree(tree);
  };

  const navigateToMap = (tree: TreeLocation) => {
    navigate(`/map?treeId=${tree.id}&lat=${tree.latitude}&lng=${tree.longitude}`);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/leaderboard")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leaderboard
          </Button>

          <div className="mb-6 md:mb-8">
            <div className="w-16 h-16 md:w-20 md:h-20 gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-glow">
              <MapPin className="w-10 h-10 md:w-12 md:h-12 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">
              {userProfile?.full_name}'s Trees
            </h1>
            <p className="text-muted-foreground text-base md:text-lg text-center px-2">
              {trees.length} tree{trees.length !== 1 ? 's' : ''} planted
            </p>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Tree Locations</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading...</div>
              ) : trees.length === 0 ? (
                <div className="text-center py-12">
                  <Leaf className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No trees planted yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trees.map((tree) => (
                    <div
                      key={tree.id}
                      onClick={() => handleTreeClick(tree)}
                      className="flex items-center gap-3 p-4 rounded-lg bg-muted/10 hover:bg-muted/30 transition-all cursor-pointer border border-border/50 hover:border-primary/30"
                    >
                      <div className="w-10 h-10 gradient-hero rounded-full flex items-center justify-center flex-shrink-0">
                        <Leaf className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base truncate">
                          {tree.species || 'Unknown Species'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(tree.planted_date).toLocaleDateString()}</span>
                        </div>
                        {tree.notes && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {tree.notes}
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>
                            {tree.latitude.toFixed(4)}, {tree.longitude.toFixed(4)}
                          </span>
                        </div>
                      </div>
                      <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tree Details & Care Advice Dialog */}
        <Dialog open={!!selectedTree} onOpenChange={(open) => !open && setSelectedTree(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-primary">
                <Leaf className="w-5 h-5" />
                {selectedTree?.species || 'Unknown Species'}
              </DialogTitle>
              <DialogDescription>
                Planted on {selectedTree ? new Date(selectedTree.planted_date).toLocaleDateString() : ''}
              </DialogDescription>
            </DialogHeader>
            
            {selectedTree && (
              <div className="mt-4 space-y-6">
                
                {/* Basic Info */}
                <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Location & Notes
                  </h4>
                  <p className="text-sm">Coordinates: {selectedTree.latitude.toFixed(4)}, {selectedTree.longitude.toFixed(4)}</p>
                  {selectedTree.notes && (
                    <p className="text-sm mt-2 pt-2 border-t text-muted-foreground">Note: "{selectedTree.notes}"</p>
                  )}
                </div>

                {/* Agent Care Advice Block */}
                {selectedTree.tree_care_advice && selectedTree.tree_care_advice.length > 0 ? (
                  <div className="space-y-4 pt-2">
                    <h3 className="font-bold text-lg border-b pb-2">AI Survival & Care Plan</h3>
                    {(() => {
                      const adviceRecord = selectedTree.tree_care_advice?.[0] as any;
                      const advice = adviceRecord?.advice ?? adviceRecord?.advice_json;
                      if (!advice) {
                        return (
                          <div className="bg-muted p-4 rounded-xl border border-border/50 text-center">
                            <p className="text-sm text-muted-foreground">No personalized AI advice generated for this tree yet.</p>
                          </div>
                        );
                      }
                      return (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
                              <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                                <Leaf className="w-4 h-4" /> Recommended Species
                              </h4>
                              <p className="text-sm">{advice.recommendedSpecies}</p>
                            </div>
                            <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                              <h4 className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
                                <Info className="w-4 h-4" /> Watering Plan
                              </h4>
                              <p className="text-sm">{advice.wateringFrequency}</p>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-foreground mb-3">Immediate Survival Steps</h4>
                            <ul className="space-y-2">
                              {advice.survivalAdvice?.map((tip: string, i: number) => (
                                <li key={i} className="flex items-start gap-3 text-sm">
                                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                                    {i + 1}
                                  </div>
                                  <span className="pt-0.5">{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold text-foreground mb-3">Long-term Maintenance</h4>
                            <ul className="space-y-2">
                              {advice.maintenanceTips?.map((tip: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <Leaf className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {advice.riskFactors?.length > 0 && (
                            <div className="bg-destructive/10 p-4 rounded-xl border border-destructive/20">
                              <h4 className="font-semibold text-destructive mb-3 flex items-center gap-2">
                                ⚠️ Environmental Risk Factors
                              </h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {advice.riskFactors.map((risk: string, i: number) => (
                                  <li key={i} className="text-sm text-destructive/90">{risk}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="bg-muted p-4 rounded-xl border border-border/50 text-center">
                    <p className="text-sm text-muted-foreground">No personalized AI advice generated for this tree yet.</p>
                  </div>
                )}

                <Button className="w-full mt-4" onClick={() => navigateToMap(selectedTree)}>
                  <MapPin className="w-4 h-4 mr-2" /> View on Map
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default UserTrees;
