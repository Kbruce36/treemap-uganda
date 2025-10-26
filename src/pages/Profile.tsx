import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { Leaf, User, Calendar, Mail } from "lucide-react";

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
}

const Profile = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

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
      .single();

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
      .select("*")
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

  if (!session || !profile) {
    return null;
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
                <div className="text-3xl font-bold text-primary">{trees.length}</div>
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
                          Planted on {new Date(tree.planted_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {tree.latitude.toFixed(4)}, {tree.longitude.toFixed(4)}
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

export default Profile;
