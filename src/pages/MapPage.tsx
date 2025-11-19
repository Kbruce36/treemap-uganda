import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

// Fix Leaflet default marker icon issue in Vite/mobile
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Tree {
  id: string;
  latitude: number;
  longitude: number;
  species: string | null;
  notes: string | null;
  planted_date: string;
  tree_count: number;
  image_1: string | null;
  image_2: string | null;
  image_3: string | null;
  profiles: {
    full_name: string;
  };
}

const MapPage = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [newTree, setNewTree] = useState({
    species: "",
    notes: "",
    tree_count: 1,
    latitude: 0.3476,
    longitude: 32.6056,
  });
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const newTreeMarkerRef = useRef<L.Marker | null>(null);
  
  const treeId = searchParams.get('treeId');
  const focusLat = searchParams.get('lat');
  const focusLng = searchParams.get('lng');
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
    if (!session) return;
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current).setView([0, 0], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Ensure proper sizing after mount and on resize
    const handleResize = () => map.invalidateSize();
    map.whenReady(() => {
      setTimeout(() => map.invalidateSize(), 0);
    });
    window.addEventListener('resize', handleResize);

    // Try to locate user with high accuracy
    map.locate({ setView: true, maxZoom: 18, enableHighAccuracy: true });

    // When location is found
    map.on('locationfound', (e) => {
      // Explicitly set view to user location with good zoom
      map.setView(e.latlng, 18);
      
      // Add a blue marker for user's current location
      L.circleMarker(e.latlng, {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.5,
        radius: 8
      }).addTo(map).bindPopup("Your current location");
      
      toast.success("Location found! Click anywhere on the map to place a tree marker.");
    });

    // If location fails
    map.on('locationerror', () => {
      toast.error("Location access denied or unavailable.");
    });

    // Click on map to place/move tree marker
    map.on('click', (e) => {
      // Remove old marker if exists
      if (newTreeMarkerRef.current) {
        map.removeLayer(newTreeMarkerRef.current);
      }

      // Create new draggable marker
      const marker = L.marker(e.latlng, { draggable: true })
        .addTo(map)
        .bindPopup("🌱 Tree location<br><small>Drag to adjust or click Plant Tree</small>")
        .openPopup();

      // Update coordinates when marker is dragged
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        setNewTree((prev) => ({
          ...prev,
          latitude: position.lat,
          longitude: position.lng,
        }));
      });

      newTreeMarkerRef.current = marker;

      // Update state with clicked location
      setNewTree((prev) => ({
        ...prev,
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
      }));
    });

    mapInstanceRef.current = map;

    return () => {
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
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

  // Render tree markers on the map
  useEffect(() => {
    if (!mapInstanceRef.current || trees.length === 0) return;

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers for each tree
    trees.forEach((tree) => {
      const images = [tree.image_1, tree.image_2, tree.image_3].filter(Boolean);
      const imagesHtml = images.length > 0 
        ? `<div style="display: flex; gap: 4px; margin-top: 8px; overflow-x: auto;">
            ${images.map((img, idx) => `<img data-image="${img}" class="tree-image-thumbnail" src="${img}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px; cursor: pointer;" />`).join('')}
          </div>`
        : '';
      
      const marker = L.marker([tree.latitude, tree.longitude])
        .addTo(map)
        .bindPopup(
          `<div style="min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 4px;">${tree.species || 'Tree'}</h3>
            <p style="margin: 2px 0;">Trees planted: ${tree.tree_count}</p>
            <p style="margin: 2px 0;">Date: ${new Date(tree.planted_date).toLocaleDateString()}</p>
            <p style="margin: 2px 0;">By: ${tree.profiles?.full_name || 'Unknown'}</p>
            ${tree.notes ? `<p style="margin: 2px 0;">Notes: ${tree.notes}</p>` : ''}
            ${imagesHtml}
          </div>`,
          { maxWidth: 320 }
        );
      
      // Add click handler for images in popup
      marker.on('popupopen', () => {
        const popup = marker.getPopup();
        if (popup) {
          const popupElement = popup.getElement();
          if (popupElement) {
            const imageElements = popupElement.querySelectorAll('.tree-image-thumbnail');
            imageElements.forEach((imgEl) => {
              imgEl.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const imageUrl = target.getAttribute('data-image');
                if (imageUrl) {
                  setSelectedImage(imageUrl);
                }
              });
            });
          }
        }
      });
      
      markersRef.current.push(marker);

      // Focus on specific tree if treeId is provided
      if (treeId === tree.id && focusLat && focusLng) {
        map.setView([parseFloat(focusLat), parseFloat(focusLng)], 18);
        marker.openPopup();
      }
    });
  }, [trees, treeId, focusLat, focusLng]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (uploadedImages.length + validFiles.length > 3) {
      toast.error("You can only upload up to 3 images");
      return;
    }
    
    setUploadedImages([...uploadedImages, ...validFiles].slice(0, 3));
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleAddTree = async () => {
    if (!session?.user) return;

    try {
      // Upload images first
      const imageUrls: (string | null)[] = [null, null, null];
      
      for (let i = 0; i < uploadedImages.length; i++) {
        const file = uploadedImages[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${session.user.id}/${Date.now()}-${i}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('tree-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('tree-images')
          .getPublicUrl(fileName);
        
        imageUrls[i] = publicUrl;
      }

      // Insert tree with image URLs
      const { error } = await supabase.from("trees").insert({
        user_id: session.user.id,
        latitude: newTree.latitude,
        longitude: newTree.longitude,
        species: newTree.species || null,
        notes: newTree.notes || null,
        tree_count: newTree.tree_count,
        image_1: imageUrls[0],
        image_2: imageUrls[1],
        image_3: imageUrls[2],
      });

      if (error) throw error;

      toast.success("Tree planted successfully! 🌱");
      
      // Remove the placement marker
      if (newTreeMarkerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(newTreeMarkerRef.current);
        newTreeMarkerRef.current = null;
      }
      
      setIsDialogOpen(false);
      setNewTree({
        latitude: 0.3476,
        longitude: 32.6056,
        species: "",
        notes: "",
        tree_count: 1,
      });
      setUploadedImages([]);
      fetchTrees();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add tree");
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
            <p className="text-muted-foreground">Click anywhere on the map to place a tree marker</p>
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
          <DialogContent className="z-[9999]">
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
              
              <div className="space-y-2">
                <Label htmlFor="tree_count">Number of Trees</Label>
                <Input
                  id="tree_count"
                  type="number"
                  min="1"
                  placeholder="e.g., 15"
                  value={newTree.tree_count}
                  onChange={(e) => setNewTree({ ...newTree, tree_count: parseInt(e.target.value) || 1 })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="images">Upload Images (Up to 3)</Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                />
                {uploadedImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {uploadedImages.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-20 h-20 object-cover rounded border"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <Button onClick={handleAddTree} className="w-full" size="lg">
                <Leaf className="w-4 h-4 mr-2" />
                Plant Tree
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl z-[9999]">
            <DialogHeader>
              <DialogTitle>Tree Image</DialogTitle>
            </DialogHeader>
            {selectedImage && (
              <img 
                src={selectedImage} 
                alt="Tree" 
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default MapPage;
