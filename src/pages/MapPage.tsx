import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Plus, Leaf, Loader2, LocateFixed, MapPin } from "lucide-react";
import { TREE_SPECIES } from "@/data/treeSpecies";
import { requestTreeCareAdvice } from "@/services/geminiService";
import { downscaleImage } from "@/lib/media";
import { addBaseLayers } from "@/lib/map-tiles";
import { KYAMBOGO_CENTER } from "@/components/site/TreeMapPreview";
import {
  MIN_PLANTED_DATE,
  isInUganda,
  isValidLatLng,
  parseCoordinate,
  parseCoordinatePair,
  plantedDateError,
  todayISO,
} from "@/lib/coords";

import { STATIC_PAGES } from "@/lib/seo-core";
import { usePageMeta } from "@/lib/seo";
// Tree data is user-supplied and Leaflet popups are raw HTML, so escape everything.
const escapeHtml = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const safeImageUrl = (url: string) => (/^https:\/\//i.test(url) ? url : null);

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
  usePageMeta(STATIC_PAGES["/map"]);
  const [session, setSession] = useState<Session | null>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [locating, setLocating] = useState(false);
  // GPS accuracy in metres when the pin came from "Use my location".
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const emptyTree = () => ({
    species: "",
    notes: "",
    tree_count: 1,
    latitude: NaN,
    longitude: NaN,
    planted_date: todayISO(),
  });
  const [newTree, setNewTree] = useState(emptyTree);
  // What the user typed in the coordinate boxes (kept separately so typing isn't reformatted).
  const [coordText, setCoordText] = useState({ lat: "", lng: "" });
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const newTreeMarkerRef = useRef<L.Marker | null>(null);
  const sessionRef = useRef<Session | null>(null);
  
  // Keep ref in sync with session state
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);
  const treeId = searchParams.get('treeId');
  const focusLat = searchParams.get('lat');
  const focusLng = searchParams.get('lng');
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    fetchTrees();
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // If we have focus coordinates from URL, use those as initial view
    const initialLat = focusLat ? parseFloat(focusLat) : KYAMBOGO_CENTER[0];
    const initialLng = focusLng ? parseFloat(focusLng) : KYAMBOGO_CENTER[1];
    const initialZoom = focusLat && focusLng ? 18 : 16;

    const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], initialZoom);
    addBaseLayers(map, { switcher: true });

    // Ensure proper sizing after mount and on resize
    const handleResize = () => map.invalidateSize();
    map.whenReady(() => {
      setTimeout(() => map.invalidateSize(), 0);
    });
    window.addEventListener('resize', handleResize);

    // Only try to locate user if NOT navigating to a specific tree
    if (!focusLat && !focusLng) {
      map.locate({ setView: true, maxZoom: 18, enableHighAccuracy: true });

      // When location is found
      map.on('locationfound', (e) => {
        map.setView(e.latlng, 18);
        
        L.circleMarker(e.latlng, {
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.5,
          radius: 8
        }).addTo(map).bindPopup("Your current location");
        
        toast.success("Location found! Click anywhere on the map to place a tree marker.");
      });

      map.on('locationerror', () => {
        toast.info("Couldn't get your location, so the map is showing Kyambogo. Tap where you planted.");
      });
    }

    mapInstanceRef.current = map;

    return () => {
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [focusLat, focusLng]);

  /** Drops (or moves) the draggable "new tree" pin and syncs the form. */
  const placePin = useCallback(
    (latlng: L.LatLngExpression, { pan = false, syncText = true }: { pan?: boolean; syncText?: boolean } = {}) => {
      const map = mapInstanceRef.current;
      if (!map) return;
      const position = L.latLng(latlng);

      const sync = (p: L.LatLng, updateText: boolean) => {
        setNewTree((prev) => ({ ...prev, latitude: p.lat, longitude: p.lng }));
        if (updateText) setCoordText({ lat: p.lat.toFixed(6), lng: p.lng.toFixed(6) });
      };

      if (newTreeMarkerRef.current) {
        newTreeMarkerRef.current.setLatLng(position);
      } else {
        const marker = L.marker(position, { draggable: true })
          .addTo(map)
          .bindPopup("🌱 Tree location<br><small>Drag to adjust or click Plant Tree</small>");
        marker.on('dragend', () => sync(marker.getLatLng(), true));
        newTreeMarkerRef.current = marker;
      }
      newTreeMarkerRef.current.openPopup();
      if (pan) map.setView(position, Math.max(map.getZoom(), 17));

      setHasPin(true);
      sync(position, syncText);
    },
    []
  );

  // Handle map clicks separately (session is read from a ref to avoid a stale closure)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!sessionRef.current) {
        toast.info("Please sign in to plant trees");
        return;
      }
      placePin(e.latlng);
      setAccuracy(null);
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [placePin]);

  /** Drops the pin at the device's GPS position, for people who don't know their coordinates. */
  const locateMe = () => {
    if (!sessionRef.current) {
      toast.info("Please sign in to plant trees");
      return;
    }
    if (!("geolocation" in navigator)) {
      toast.error("This browser can't share your location. Tap the map where you planted instead.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        placePin([position.coords.latitude, position.coords.longitude], { pan: true });
        setAccuracy(Math.round(position.coords.accuracy));
        toast.success("Pin placed at your location. Drag it if it's slightly off.");
      },
      (error) => {
        setLocating(false);
        toast.error(
          error.code === error.PERMISSION_DENIED
            ? "Location access was blocked. Allow location for this site in your browser settings, or tap the map instead."
            : error.code === error.TIMEOUT
              ? "Finding your location took too long. Try again outside, or tap the map instead."
              : "Couldn't get your location. Check that location (GPS) is on, or tap the map instead."
        );
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  /** Typed or pasted coordinates. A pasted "lat, lng" pair fills both boxes. */
  const handleCoordChange = (field: "lat" | "lng", value: string) => {
    setAccuracy(null);
    const pair = parseCoordinatePair(value);
    if (pair) {
      placePin([pair.lat, pair.lng], { pan: true });
      return;
    }

    const next = { ...coordText, [field]: value };
    setCoordText(next);
    const lat = parseCoordinate(next.lat);
    const lng = parseCoordinate(next.lng);
    if (lat !== null && lng !== null && isValidLatLng(lat, lng)) {
      placePin([lat, lng], { pan: true, syncText: false });
    } else {
      setNewTree((prev) => ({ ...prev, latitude: NaN, longitude: NaN }));
    }
  };

  const coordsValid = isValidLatLng(newTree.latitude, newTree.longitude);

  const fetchTrees = async () => {
    // Check if user is authenticated
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    
    if (currentSession) {
      // Authenticated users can see full tree data with profiles
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
    } else {
      // Anonymous users use the public view (no user_id exposed)
      const { data, error } = await supabase
        .from("trees_public")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load trees");
      } else {
        // Map public data to Tree interface (profiles will be empty)
        setTrees((data || []).map(tree => ({
          ...tree,
          profiles: { full_name: 'Community Member' }
        })) as Tree[]);
      }
    }
  };

  // Render tree markers on the map
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers for each tree
    trees.forEach((tree) => {
      const images = [tree.image_1, tree.image_2, tree.image_3]
        .map((img) => (img ? safeImageUrl(img) : null))
        .filter((img): img is string => !!img);
      const imagesHtml = images.length > 0 
        ? `<div style="display: flex; gap: 4px; margin-top: 8px; overflow-x: auto;">
            ${images.map((img) => `<img data-image="${escapeHtml(img)}" class="tree-image-thumbnail" src="${escapeHtml(img)}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px; cursor: pointer;" />`).join('')}
          </div>`
        : '';
      
      const marker = L.marker([tree.latitude, tree.longitude])
        .addTo(map)
        .bindPopup(
          `<div style="min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 4px;">${escapeHtml(tree.species || 'Tree')}</h3>
            <p style="margin: 2px 0;">Trees planted: ${escapeHtml(tree.tree_count)}</p>
            <p style="margin: 2px 0;">Date: ${escapeHtml(new Date(tree.planted_date).toLocaleDateString())}</p>
            <p style="margin: 2px 0;">By: ${escapeHtml(tree.profiles?.full_name || 'Unknown')}</p>
            ${tree.notes ? `<p style="margin: 2px 0;">Notes: ${escapeHtml(tree.notes)}</p>` : ''}
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

  // Object URLs for previews, released when the selection changes.
  const previewUrls = useMemo(() => uploadedImages.map((f) => URL.createObjectURL(f)), [uploadedImages]);
  useEffect(() => () => previewUrls.forEach((u) => URL.revokeObjectURL(u)), [previewUrls]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    e.target.value = "";
    
    if (uploadedImages.length + validFiles.length > 3) {
      toast.error("You can only upload up to 3 images");
      return;
    }
    
    setUploadedImages([...uploadedImages, ...validFiles].slice(0, 3));
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const openPlantDialog = () => setIsDialogOpen(true);

  const handleAddTree = async () => {
    if (!session?.user || saving) return;
    if (!coordsValid) {
      toast.error("Add the tree's location: tap the map, or enter its latitude and longitude.");
      return;
    }
    const dateError = plantedDateError(newTree.planted_date);
    if (dateError) {
      toast.error(dateError);
      return;
    }
    if (!Number.isFinite(newTree.tree_count) || newTree.tree_count < 1 || newTree.tree_count > 10000) {
      toast.error("Number of trees must be between 1 and 10,000.");
      return;
    }

    setSaving(true);
    try {
      // Upload images first
      const imageUrls: (string | null)[] = [null, null, null];
      
      for (let i = 0; i < uploadedImages.length; i++) {
        const file = await downscaleImage(uploadedImages[i]);
        const fileExt = file.type === "image/jpeg" ? "jpg" : uploadedImages[i].name.split('.').pop();
        const fileName = `${session.user.id}/${Date.now()}-${i}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('tree-images')
          .upload(fileName, file, { contentType: file.type || uploadedImages[i].type });

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('tree-images')
          .getPublicUrl(fileName);
        
        imageUrls[i] = publicUrl;
      }

      // Insert tree with image URLs
      const { data: treeData, error } = await supabase.from("trees").insert({
        user_id: session.user.id,
        latitude: newTree.latitude,
        longitude: newTree.longitude,
        species: newTree.species || null,
        notes: newTree.notes || null,
        tree_count: newTree.tree_count,
        planted_date: newTree.planted_date,
        image_1: imageUrls[0],
        image_2: imageUrls[1],
        image_3: imageUrls[2],
      }).select().single();

      if (error) throw error;

      toast.success("Tree planted successfully! 🌱");
      
      // GreenBot writes survival advice for the new tree (weather + Gemini run server-side).
      if (treeData) {
        const species = newTree.species;
        toast.promise(requestTreeCareAdvice(treeData.id), {
          loading: "GreenBot is preparing care advice for your tree…",
          success: (advice) => `Advice ready for your ${advice.recommendedSpecies || species || "tree"}! Check the GreenBot dashboard.`,
          error: "Couldn't generate care advice right now.",
        });
      }

      // Remove the placement marker
      if (newTreeMarkerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(newTreeMarkerRef.current);
        newTreeMarkerRef.current = null;
      }
      setHasPin(false);
      
      setIsDialogOpen(false);
      setNewTree(emptyTree());
      setCoordText({ lat: "", lng: "" });
      setAccuracy(null);
      setUploadedImages([]);
      fetchTrees();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add tree");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">UNAU TreeMap</p>
            <h1 className="mt-2 font-display text-3xl font-black text-primary md:text-4xl">Every tree, on the map</h1>
            <p className="mt-1 text-muted-foreground">
              {session
                ? hasPin
                  ? "Pin placed. Drag it to adjust, then tap Plant Tree."
                  : "Tap the map where you planted, or tap Plant Tree to type the coordinates."
                : "Explore the trees our community has planted. Sign in to add yours."}
            </p>
          </div>
          {session ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button size="lg" variant="outline" onClick={locateMe} disabled={locating} className="border-primary/30 font-bold text-primary">
                {locating ? <Loader2 className="w-5 h-5 animate-spin" /> : <LocateFixed className="w-5 h-5" />}
                {locating ? "Finding you…" : "Use my location"}
              </Button>
              <Button size="lg" onClick={openPlantDialog} className="bg-secondary font-bold hover:bg-brand-green-dark">
                <Plus className="w-5 h-5" />
                Plant Tree
              </Button>
            </div>
          ) : (
            <Button size="lg" onClick={() => navigate("/auth")} className="bg-primary font-bold">
              <MapPin className="w-5 h-5" /> Sign in to plant
            </Button>
          )}
        </div>

        <Card className="overflow-hidden rounded-2xl shadow-card">
          <div ref={mapContainerRef} className="h-[70vh] min-h-[420px] w-full" />
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="z-[9999] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Plant a New Tree 🌳</DialogTitle>
              <DialogDescription>
                Add details about the tree you're planting
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Location *</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={locateMe}
                  disabled={locating}
                  className="w-full border-secondary/40 font-bold text-brand-green-dark hover:bg-secondary/10"
                >
                  {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
                  {locating ? "Finding your location…" : "Use my current location"}
                </Button>
                {accuracy !== null && (
                  <p className={`text-xs font-semibold ${accuracy > 50 ? "text-amber-700" : "text-brand-green-dark"}`}>
                    {accuracy > 50
                      ? `Location is only accurate to about ${accuracy} m. Close this form and drag the pin to the exact spot, or try again outside.`
                      : `Located to within about ${accuracy} m.`}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {hasPin
                    ? "Or adjust it: drag the pin on the map, or type exact coordinates below."
                    : "Or tap the map to drop a pin, or type the coordinates. You can paste \"0.3497, 32.6300\" from Google Maps into either box."}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="latitude" className="text-xs text-muted-foreground">Latitude</Label>
                    <Input
                      id="latitude"
                      inputMode="decimal"
                      placeholder="0.349700"
                      value={coordText.lat}
                      onChange={(e) => handleCoordChange("lat", e.target.value)}
                      aria-invalid={!!coordText.lat && !coordsValid}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="longitude" className="text-xs text-muted-foreground">Longitude</Label>
                    <Input
                      id="longitude"
                      inputMode="decimal"
                      placeholder="32.630000"
                      value={coordText.lng}
                      onChange={(e) => handleCoordChange("lng", e.target.value)}
                      aria-invalid={!!coordText.lng && !coordsValid}
                    />
                  </div>
                </div>
                {coordsValid && !isInUganda(newTree.latitude, newTree.longitude) && (
                  <p className="text-xs font-semibold text-amber-700">
                    This point is outside Uganda. Check that latitude comes first, then longitude.
                  </p>
                )}
                {!coordsValid && coordText.lat && coordText.lng && (
                  <p className="text-xs text-destructive">
                    Enter a latitude between -90 and 90 and a longitude between -180 and 180.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="planted_date">Date planted *</Label>
                <Input
                  id="planted_date"
                  type="date"
                  min={MIN_PLANTED_DATE}
                  max={todayISO()}
                  value={newTree.planted_date}
                  onChange={(e) => setNewTree({ ...newTree, planted_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="species">Tree Species (Optional)</Label>
                <Select
                  value={newTree.species}
                  onValueChange={(value) => setNewTree({ ...newTree, species: value === "__other__" ? "" : value })}
                >
                  <SelectTrigger id="species">
                    <SelectValue placeholder="Select a species..." />
                  </SelectTrigger>
                  <SelectContent className="z-[10000] max-h-60">
                    {TREE_SPECIES.map((s) => (
                      <SelectItem key={s.name} value={s.name}>
                        {s.name} <span className="text-muted-foreground text-xs">({s.scientificName})</span>
                      </SelectItem>
                    ))}
                    <SelectItem value="__other__">Other (type below)</SelectItem>
                  </SelectContent>
                </Select>
                {(newTree.species === "" || !TREE_SPECIES.find((s) => s.name === newTree.species)) && (
                  <Input
                    placeholder="Enter species name..."
                    value={newTree.species}
                    onChange={(e) => setNewTree({ ...newTree, species: e.target.value })}
                  />
                )}
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
                  max="10000"
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
                          src={previewUrls[index]}
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
              
              <Button onClick={handleAddTree} className="w-full bg-secondary font-bold hover:bg-brand-green-dark" size="lg" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Leaf className="w-4 h-4" />}
                {saving ? "Planting…" : "Plant Tree"}
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
