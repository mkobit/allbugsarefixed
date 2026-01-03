import React, { useEffect, useRef } from 'react';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import type L from 'leaflet';

// Leaflet styles must be loaded globally or via import in global css.
// We assume 'leaflet/dist/leaflet.css' is imported in global.css.

interface MapProps {
  latitude: number;
  longitude: number;
  zoom: number;
  height?: string;
  markers?: {
    lat: number;
    lng: number;
    title: string;
  }[];
}

export const Map: React.FC<MapProps> = ({
  latitude,
  longitude,
  zoom,
  height = "400px",
  markers = []
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const initMap = async () => {
      if (!mapRef.current) return;
      if (mapInstanceRef.current) return; // Already initialized

      // Leaflet must be imported dynamically because it accesses 'window' on import.
      // Even with client:only, the build process attempts to bundle imports, causing SSR failures.
      const L = (await import('leaflet')).default;

      // Configure default icon using imported assets
      const DefaultIcon = L.icon({
        iconAnchor: [12, 41],
        iconSize: [25, 41],
        iconUrl: icon.src, // Vite imports image as object with src
        shadowUrl: iconShadow.src,
      });
      L.Marker.prototype.options.icon = DefaultIcon;

      const map = L.map(mapRef.current).setView([latitude, longitude], zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      markers.forEach(marker => {
        L.marker([marker.lat, marker.lng]).addTo(map)
          .bindPopup(marker.title);
      });

      mapInstanceRef.current = map;

      cleanup = () => {
        map.remove();
        mapInstanceRef.current = null;
      };
    };

    initMap();

    return () => {
      if (cleanup) cleanup();
      else if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, zoom, markers]);

  return (
    <div
      ref={mapRef}
      style={{ borderRadius: '8px', height, width: '100%', zIndex: 0 }}
      className="leaflet-container-react"
    />
  );
};

export default Map;
