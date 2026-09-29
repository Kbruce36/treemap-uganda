import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";

export const KYAMBOGO_CENTER: L.LatLngTuple = [0.3497, 32.63];

/** A lightweight, read-only map of every mapped tree for the home page. */
export const TreeMapPreview = ({ className }: { className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: !L.Browser.mobile,
      touchZoom: false,
      doubleClickZoom: false,
      keyboard: false,
    }).setView(KYAMBOGO_CENTER, 15);
    // Keep the tile credits the OSM/CARTO licences require, without the Leaflet logo.
    map.attributionControl.setPrefix(false);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);

    let cancelled = false;
    supabase
      .from("trees_public")
      .select("latitude, longitude, tree_count")
      .limit(1000)
      .then(({ data }) => {
        if (cancelled || !data?.length) return;
        const points: L.LatLngTuple[] = [];
        data.forEach((t) => {
          const p: L.LatLngTuple = [Number(t.latitude), Number(t.longitude)];
          points.push(p);
          L.circleMarker(p, {
            radius: Math.min(6 + Math.sqrt(t.tree_count ?? 1) * 2, 18),
            color: "#ffffff",
            weight: 2,
            fillColor: "#2ea84a",
            fillOpacity: 0.9,
          }).addTo(map);
        });
        map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 16 });
      });

    const t = setTimeout(() => map.invalidateSize(), 0);
    return () => {
      cancelled = true;
      clearTimeout(t);
      map.remove();
    };
  }, []);

  return <div ref={containerRef} className={className} aria-label="Map of trees planted by the community" />;
};
