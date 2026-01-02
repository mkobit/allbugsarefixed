import React, { useEffect, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';

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
  const mapInstanceRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const initMap = async () => {
      if (!mapRef.current) return;
      if (mapInstanceRef.current) return; // Already initialized

      // Dynamically import Leaflet to ensure it only runs on client
      const L = (await import('leaflet')).default;

      // Fix for default marker icons missing in Leaflet + Webpack/Vite
      // This is often needed when using Leaflet with bundlers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });

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
