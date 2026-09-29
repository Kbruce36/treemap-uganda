import L from "leaflet";

// Free background maps that need no API key.
// Satellite: Esri World Imagery (sharp down to building level around Kyambogo up to
// zoom 19) with Esri's road and place-name overlays on top, like Google's hybrid view.
// Street map: standard OpenStreetMap.

const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services";
const ESRI_ATTRIBUTION =
  "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const MAX_ZOOM = 20;
const STORAGE_KEY = "unau_map_base_layer";

const satelliteLayer = () =>
  L.layerGroup([
    L.tileLayer(`${ESRI}/World_Imagery/MapServer/tile/{z}/{y}/{x}`, {
      maxNativeZoom: 19,
      maxZoom: MAX_ZOOM,
      attribution: ESRI_ATTRIBUTION,
      zIndex: 1,
    }),
    L.tileLayer(`${ESRI}/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}`, {
      maxNativeZoom: 19,
      maxZoom: MAX_ZOOM,
      opacity: 0.85,
      zIndex: 2,
    }),
    L.tileLayer(`${ESRI}/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}`, {
      maxNativeZoom: 19,
      maxZoom: MAX_ZOOM,
      zIndex: 3,
    }),
  ]);

const streetLayer = () =>
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxNativeZoom: 19,
    maxZoom: MAX_ZOOM,
    attribution: OSM_ATTRIBUTION,
  });

/**
 * Adds the background map. Satellite by default; with `switcher`, a control lets
 * people flip to the street map, and their choice is remembered on this device.
 */
export function addBaseLayers(map: L.Map, { switcher = false }: { switcher?: boolean } = {}) {
  map.setMaxZoom(MAX_ZOOM);
  // Keep the credits the tile licences require, without the Leaflet logo.
  map.attributionControl?.setPrefix(false);

  const layers: Record<string, L.Layer> = { Satellite: satelliteLayer(), "Street map": streetLayer() };

  let initial = "Satellite";
  if (switcher) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved in layers) initial = saved;
    } catch {
      // Storage unavailable; use the default.
    }
  }
  layers[initial].addTo(map);

  if (switcher) {
    L.control.layers(layers, undefined, { position: "topright", collapsed: false }).addTo(map);
    map.on("baselayerchange", (e: L.LayersControlEvent) => {
      try {
        localStorage.setItem(STORAGE_KEY, e.name);
      } catch {
        // Not critical.
      }
    });
  }
}
