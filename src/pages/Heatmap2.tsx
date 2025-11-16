// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { HeatmapLayer } from "react-leaflet-heatmap-layer-v3";
import "leaflet/dist/leaflet.css";
import type { LatLngExpression } from "leaflet";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { BACKEND_URL } from "../utils/backendUrl";

interface HeatPoint {
  lat: number;
  lon: number;
  intensity: number;
  direction?: string;
  type?: string;
  timestamp?: number | null;
  description?: string;
}

interface Heatmap2Props {
  onNavigate: (screen: string) => void;
}

export function Heatmap2({ onNavigate }: Heatmap2Props) {
  const [points, setPoints] = useState<HeatPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiBase = useMemo(() => BACKEND_URL?.replace(/\/$/, "") || "http://localhost:8000", []);

  const center: LatLngExpression = points.length ? [points[0].lat, points[0].lon] : [50.4501, 30.5234];

  const fetchHeatmap = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/heatmap`);
      if (!res.ok) throw new Error("Heatmap unavailable");
      const payload = await res.json();
      setPoints(Array.isArray(payload) ? payload : []);
    } catch (err: any) {
      setError(err?.message || "Unable to load heatmap");
      setPoints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmap();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex flex-col gap-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("landing")}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <p className="text-xl font-semibold">Heatmap 2</p>
            <p className="text-xs text-white/60">DBSCAN output from backend</p>
          </div>
        </div>
        <button
          onClick={fetchHeatmap}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-sm"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="relative rounded-[24px] overflow-hidden border border-white/10 bg-gradient-to-br from-[#0f1419] to-[#1a1f24] shadow-[0_25px_60px_rgba(0,0,0,0.45)] min-h-[420px]">
        <MapContainer
          center={center}
          zoom={points.length ? 12 : 5}
          scrollWheelZoom
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {points.length > 0 && (
            <HeatmapLayer
              fitBoundsOnLoad
              fitBoundsOnUpdate
              points={points}
              latitudeExtractor={(m: any) => m.lat}
              longitudeExtractor={(m: any) => m.lon}
              intensityExtractor={(m: any) => m.intensity ?? 0}
              maxOpacity={0.8}
              radius={35}
              blur={25}
            />
          )}
        </MapContainer>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm text-sm">
            Loading heatmap…
          </div>
        )}
        {error && (
          <div className="absolute top-4 left-4 px-3 py-2 rounded-lg bg-red-500/20 border border-red-400/40 text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Latest Sightings</p>
          <span className="text-sm text-white/60">{points.length} points</span>
        </div>
        <div className="space-y-3">
          {points.slice(0, 20).map((point, idx) => (
            <div
              key={`${point.lat}-${point.lon}-${idx}`}
              className="rounded-2xl p-3 bg-white/5 border border-white/10"
            >
              <div className="flex items-center justify-between text-sm text-white/80">
                <span className="font-semibold capitalize">{point.type || "unknown"}</span>
                <span>{point.direction || "Unknown dir"}</span>
              </div>
              <div className="text-xs text-white/60 mt-1">
                {point.lat.toFixed(4)}°, {point.lon.toFixed(4)}°
              </div>
              {point.description && (
                <p className="text-xs text-white/60 mt-1 line-clamp-2">{point.description}</p>
              )}
            </div>
          ))}
          {points.length === 0 && !loading && (
            <p className="text-sm text-white/70">No sightings available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Heatmap2;
