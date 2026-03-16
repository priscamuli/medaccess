import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css"; // ✅ Import CSS here

export interface Clinic {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  lowStock: boolean;
  medicines: {
    id: string;
    name: string;
    category: string;
    quantity: number;
    isMaternal?: boolean;
  }[];
  status?: "available" | "low" | "maternal" | "unknown";
}

interface ClinicMapProps {
  clinics: Clinic[];
  selectedClinic?: string;
  onSelectClinic?: (id: string) => void;
}

export function ClinicMap({ clinics, selectedClinic, onSelectClinic }: ClinicMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    import("leaflet").then((L) => {
      const map = L.map(mapRef.current!, { zoomControl: true }).setView([-1.309, 36.814], 8); // Default center Kenya
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      mapInstance.current = map;
      updateMarkers(L);
    });

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;
    import("leaflet").then((L) => updateMarkers(L));
  }, [clinics, selectedClinic]);

  function updateMarkers(L: any) {
    const map = mapInstance.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    clinics.forEach((clinic) => {
      const color =
        clinic.status === "maternal" ? "#ef4444" :
        clinic.status === "low" ? "#f59e0b" :
        clinic.status === "available" ? "#22c55e" :
        "#9ca3af"; // grey for unknown

      const label =
        clinic.status === "maternal" ? "⚠ Maternal medicine shortage" :
        clinic.status === "low" ? "⚠ Some medicines low/out" :
        clinic.status === "available" ? "✓ All medicines available" :
        "No data";

      const isSelected = clinic.id === selectedClinic;

      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="
          width: ${isSelected ? "20px" : "14px"};
          height: ${isSelected ? "20px" : "14px"};
          background: ${color};
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: all 0.2s;
        "></div>`,
        iconSize: [isSelected ? 20 : 14, isSelected ? 20 : 14],
        iconAnchor: [isSelected ? 10 : 7, isSelected ? 10 : 7],
      });

      const marker = L.marker([clinic.lat, clinic.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: Inter, sans-serif; min-width: 180px;">
            <strong>${clinic.name}</strong><br/>
            <span style="color: #666; font-size: 12px;">${clinic.address}</span><br/>
            <span style="color: ${color}; font-weight: 600; font-size: 12px;">
              ${label}
            </span>
          </div>
        `);

      marker.on("click", () => onSelectClinic?.(clinic.id));
      markersRef.current.push(marker);
    });
  }

  return (
    <div ref={mapRef} className="h-[400px] w-full rounded-lg border overflow-hidden" />
  );
}
