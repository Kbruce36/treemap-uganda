import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MapPin, Leaf, ArrowLeft, Calendar } from "lucide-react";

interface TreeLocation {
  id: string;
  species: string | null;
  latitude: number;
  longitude: number;
  planted_date: string;
  notes: string | null;
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

  useEffect(() => {
    fetchUserTrees();
  }, [userId]);

  const fetchUserTrees = async () => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;
      setUserProfile(profileData);

      // Fetch user's trees
      const { data: treesData, error: treesError } = await supabase
        .from("trees")
        .select("id, species, latitude, longitude, planted_date, notes")
        .eq("user_id", userId)
        .order("planted_date", { ascending: false });

      if (treesError) throw treesError;
      setTrees(treesData);
    } catch (error: any) {
      toast.error("Failed to load user trees");
    } finally {
      setLoading(false);
    }
  };

  const handleTreeClick = (tree: TreeLocation) => {
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
      </div>
    </Layout>
  );
};

export default UserTrees;
