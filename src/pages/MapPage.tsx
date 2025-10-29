import { useEffect, useState, useRef } from "react";
import Map, { Marker, Popup } from "react-map-gl";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { Leaf, Plus, MapPin } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

interface Tree {
  id: string;
  latitude: number;
  longitude: number;
  species: string | null;
  notes: string | null;
  planted_date: string;
  profiles: {
    full_name: string;
  };
}

const MAPBOX_TOKEN = "pk.eyJ1IjoibG92YWJsZS1kZXYiLCJhIjoiY20ycG94Ymk2MDd6cTJsc2F4eWR3ZjA3ZyJ9.VWgtkK7w0Ddc-rjvfAp6lg";

const MapPage = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);
  const [newTree, setNewTree] = useState({
    latitude: 0.3476,
    longitude: 32.6056,
    species: "",
    notes: "",
  });
  const navigate = useNavigate();
  const mapRef = useRef<any>(null);
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
    if (session) {
      fetchTrees();
    }
  }, [session]);

  const fetchTrees = async () => {
    const { data, error } = await supabase
      .from("trees")
      .select(`
        *,
        profiles(full_name)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load trees");
    } else {
      setTrees(data as Tree[]);
    }
  };

  const handleAddTree = async () => {
    if (!session?.user) return;

    const { error } = await supabase.from("trees").insert({
      user_id: session.user.id,
      latitude: newTree.latitude,
      longitude: newTree.longitude,
      species: newTree.species || null,
      notes: newTree.notes || null,
    });

    if (error) {
      toast.error("Failed to add tree");
    } else {
      toast.success("Tree planted successfully! 🌱");
      setIsDialogOpen(false);
      setNewTree({
        latitude: 0.3476,
        longitude: 32.6056,
        species: "",
        notes: "",
      });
      fetchTrees();
    }
  };

  if (!session) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-2">Please sign in</h1>
          <p className="text-muted-foreground">You must be signed in to view the map.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Interactive Tree Map</h1>
            <p className="text-muted-foreground">Click on the map to plant a tree at Kyambogo University</p>
          </div>
          <Button variant="hero" size="lg" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-5 h-5" />
            Plant Tree
          </Button>
        </div>

        <Card className="shadow-card overflow-hidden">
          <div className="h-[600px] w-full">
            <Map
              ref={mapRef}
              mapboxAccessToken={MAPBOX_TOKEN}
              initialViewState={{
                longitude: 32.6056,
                latitude: 0.3476,
                zoom: 15
              }}
              style={{ width: "100%", height: "100%" }}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              onClick={(e) => {
                setNewTree({ 
                  ...newTree, 
                  latitude: e.lngLat.lat, 
                  longitude: e.lngLat.lng 
                });
                setIsDialogOpen(true);
              }}
            >
              {trees.map((tree) => (
                <Marker
                  key={tree.id}
                  longitude={tree.longitude}
                  latitude={tree.latitude}
                  anchor="bottom"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    setSelectedTreeId(tree.id);
                  }}
                >
                  <div className="cursor-pointer">
                    <MapPin className="w-8 h-8 text-primary drop-shadow-lg" fill="currentColor" />
                  </div>
                </Marker>
              ))}

              {selectedTreeId && (() => {
                const tree = trees.find(t => t.id === selectedTreeId);
                if (!tree) return null;
                return (
                  <Popup
                    longitude={tree.longitude}
                    latitude={tree.latitude}
                    anchor="top"
                    onClose={() => setSelectedTreeId(null)}
                    closeOnClick={false}
                  >
                    <div className="p-2 min-w-[200px]">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-primary" />
                        {tree.species || "Tree"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Planted by: {tree.profiles.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Date: {new Date(tree.planted_date).toLocaleDateString()}
                      </p>
                      {tree.notes && (
                        <p className="text-sm mt-2">{tree.notes}</p>
                      )}
                    </div>
                  </Popup>
                );
              })()}
            </Map>
          </div>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Plant a New Tree 🌳</DialogTitle>
              <DialogDescription>
                Add details about the tree you're planting
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <div className="text-sm text-muted-foreground">
                  Lat: {newTree.latitude.toFixed(6)}, Lng: {newTree.longitude.toFixed(6)}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="species">Tree Species (Optional)</Label>
                <Input
                  id="species"
                  placeholder="e.g., Mango, Eucalyptus"
                  value={newTree.species}
                  onChange={(e) => setNewTree({ ...newTree, species: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information..."
                  value={newTree.notes}
                  onChange={(e) => setNewTree({ ...newTree, notes: e.target.value })}
                />
              </div>
              <Button onClick={handleAddTree} className="w-full" variant="hero" size="lg">
                <Leaf className="w-4 h-4" />
                Plant Tree
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default MapPage;
