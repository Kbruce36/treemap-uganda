import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Plus, Leaf } from "lucide-react";

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

const MapPage = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);
  const [newTree, setNewTree] = useState({
    species: "",
    notes: "",
    latitude: 0.3476,
    longitude: 32.6056,
  });
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

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

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current).setView([0.3476, 32.6056], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    map.on("click", (e) => {
      setNewTree({
        ...newTree,
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
      });
      setIsDialogOpen(true);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

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

  // Render tree markers on the map
  useEffect(() => {
    if (!mapInstanceRef.current || trees.length === 0) return;

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers for each tree
    trees.forEach((tree) => {
      const marker = L.marker([tree.latitude, tree.longitude])
        .addTo(map)
        .bindPopup(
          `<div>
            <h3 style="font-weight: bold; margin-bottom: 4px;">${tree.species || 'Tree'}</h3>
            <p style="margin: 2px 0;">Planted: ${new Date(tree.planted_date).toLocaleDateString()}</p>
            <p style="margin: 2px 0;">By: ${tree.profiles?.full_name || 'Unknown'}</p>
            ${tree.notes ? `<p style="margin: 2px 0;">Notes: ${tree.notes}</p>` : ''}
          </div>`
        );
      
      markersRef.current.push(marker);
    });
  }, [trees]);

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
          <Button variant="default" size="lg" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Plant Tree
          </Button>
        </div>

        <Card className="overflow-hidden">
          <div ref={mapContainerRef} className="h-[600px] w-full" />
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
              <Button onClick={handleAddTree} className="w-full" size="lg">
                <Leaf className="w-4 h-4 mr-2" />
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
