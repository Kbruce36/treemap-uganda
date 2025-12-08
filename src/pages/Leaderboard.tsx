import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trophy, Leaf, Medal } from "lucide-react";

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  email: string;
  tree_count: number;
}

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("trees")
        .select(`
          user_id,
          tree_count,
          profiles(full_name, email)
        `);

      if (error) throw error;

      const counts = data.reduce((acc: any, tree: any) => {
        const userId = tree.user_id;
        // Skip entries without valid profile data
        if (!tree.profiles) return acc;
        
        if (!acc[userId]) {
          acc[userId] = {
            user_id: userId,
            full_name: tree.profiles.full_name || 'Unknown',
            email: tree.profiles.email || '',
            tree_count: 0,
          };
        }
        acc[userId].tree_count += tree.tree_count || 1;
        return acc;
      }, {});

      const sorted = Object.values(counts).sort(
        (a: any, b: any) => b.tree_count - a.tree_count
      ) as LeaderboardEntry[];

      setLeaderboard(sorted);
    } catch (error: any) {
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (position: number) => {
    if (position === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (position === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (position === 2) return <Medal className="w-6 h-6 text-orange-600" />;
    return null;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 md:mb-8 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-glow">
              <Trophy className="w-10 h-10 md:w-12 md:h-12 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Leaderboard</h1>
            <p className="text-muted-foreground text-base md:text-lg px-2">
              Top tree planters making a difference
            </p>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Top Planters</CardTitle>
              <CardDescription>Ranked by total trees planted</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading...</div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <Leaf className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No trees planted yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-2 md:space-y-3">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.user_id}
                      onClick={() => navigate(`/user/${entry.user_id}/trees`)}
                      className={`flex items-center gap-2 md:gap-4 p-3 md:p-4 rounded-lg transition-all hover:bg-muted/50 cursor-pointer ${
                        index < 3 ? "bg-muted/30 border-2 border-primary/20" : "bg-muted/10"
                      }`}
                    >
                      <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 font-bold text-lg md:text-xl flex-shrink-0">
                        {getMedalIcon(index) || (
                          <span className="text-muted-foreground">#{index + 1}</span>
                        )}
                      </div>
                      <Avatar className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground text-base md:text-lg">
                          {entry.full_name[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm md:text-base truncate">{entry.full_name}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground truncate">{entry.email}</p>
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-2 bg-secondary/20 px-2 md:px-4 py-1.5 md:py-2 rounded-full flex-shrink-0">
                        <Leaf className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
                        <span className="font-bold text-base md:text-lg">{entry.tree_count}</span>
                      </div>
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

export default Leaderboard;
