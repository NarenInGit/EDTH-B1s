// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { HeatmapLayer } from "react-leaflet-heatmap-layer-v3";
import "leaflet/dist/leaflet.css";
import type { LatLngExpression } from "leaflet";
import { ArrowLeft, Shield } from "lucide-react";
import { BACKEND_URL } from "../utils/backendUrl";

interface HeatmapViewProps {
  onNavigate: (screen: string) => void;
}

interface HeatmapPoint {
  lat: number;
  lon: number;
  intensity: number;
}

export function HeatmapView({ onNavigate }: HeatmapViewProps) {
  const fallbackCenter = useMemo(() => [50.4501, 30.5234] as LatLngExpression, []);
  const placeholderSrc = `${process.env.PUBLIC_URL || ""}/heatmap-placeholder.jpg`;

  const [heatmapPoints, setHeatmapPoints] = useState<HeatmapPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Clean backend URL
  const apiBase = useMemo(
    () => (BACKEND_URL ? BACKEND_URL.replace(/\/$/, "") : "http://localhost:8000"),
    []
  );

  // Load heatmap data from backend
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const loadHeatmap = async () => {
      setIsLoading(true);
      setFetchError(null);

      try {
        const res = await fetch(`${apiBase}/heatmap`, { 
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          }
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();

        if (!mounted) return;

        // Validate response is an array
        if (!Array.isArray(data)) {
          console.error("Invalid heatmap response format:", data);
          setFetchError("Invalid data format received");
          setHeatmapPoints([]);
          return;
        }

        // Clean and validate points
        const validPoints: HeatmapPoint[] = data
          .filter((p) => {
            return (
              p &&
              typeof p.lat === "number" &&
              typeof p.lon === "number" &&
              !isNaN(p.lat) &&
              !isNaN(p.lon) &&
              p.lat >= -90 &&
              p.lat <= 90 &&
              p.lon >= -180 &&
              p.lon <= 180
            );
          })
          .map((p) => {
            // Handle intensity normalization
            // Your backend returns values that can be > 1, so we need to normalize
            let intensity = typeof p.intensity === "number" && !isNaN(p.intensity) 
              ? p.intensity 
              : 0.6;
            
            // If intensity is greater than 1, normalize it (assuming max ~5.0 from severity)
            if (intensity > 1) {
              intensity = Math.min(intensity / 5.0, 1.0);
            }
            
            // Ensure it's at least 0.1 for visibility
            intensity = Math.max(0.1, Math.min(1.0, intensity));
            
            return {
              lat: p.lat,
              lon: p.lon,
              intensity: intensity,
            };
          });

        setHeatmapPoints(validPoints);

        // Debug logging
        console.log("Raw API response:", data);
        console.log("Valid points:", validPoints);
        console.log("Sample point:", validPoints[0]);

        if (validPoints.length === 0 && data.length > 0) {
          setFetchError("No valid heatmap points found");
        }
      } catch (err: any) {
        if (!mounted) return;
        
        // Don't show error for aborted requests
        if (err.name === 'AbortError') return;

        console.error("Heatmap load error:", err);
        setFetchError(err.message || "Unable to load heatmap data");
        setHeatmapPoints([]);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadHeatmap();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [apiBase]);

  // Calculate map center based on points
  const mapCenter: LatLngExpression = useMemo(() => {
    if (heatmapPoints.length > 0) {
      return [heatmapPoints[0].lat, heatmapPoints[0].lon] as LatLngExpression;
    }
    return fallbackCenter;
  }, [heatmapPoints, fallbackCenter]);

  const mapZoom = useMemo(() => {
    return heatmapPoints.length > 0 ? 12 : 10;
  }, [heatmapPoints]);

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 sm:p-6 lg:p-8">
        <button
          onClick={() => onNavigate("landing")}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3">
          <Shield className="w-7 h-7 text-red-500" />
          <div>
            <p className="text-2xl font-semibold">Threat Heatmap</p>
            <p className="text-sm text-white/60">
              {heatmapPoints.length > 0 
                ? `${heatmapPoints.length} active threat${heatmapPoints.length !== 1 ? 's' : ''}`
                : "Live threat intensity"}
            </p>
          </div>
        </div>
      </div>

      {/* Map container */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="relative rounded-[32px] overflow-hidden border border-white/10 bg-[#0f1419] shadow-xl" style={{ height: 'calc(100vh - 180px)', minHeight: '420px' }}>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            scrollWheelZoom={true}
            className="w-full"
            zoomControl={true}
            style={{ height: '100%', width: '100%', zIndex: 1 }}
          >
            {/* Dark theme tile layer */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              maxZoom={19}
            />

            {/* Heatmap layer - only render when we have points */}
            {heatmapPoints.length > 0 && (
              <HeatmapLayer
                fitBoundsOnLoad={false}
                fitBoundsOnUpdate={false}
                points={heatmapPoints}
                latitudeExtractor={(p: HeatmapPoint) => p.lat}
                longitudeExtractor={(p: HeatmapPoint) => p.lon}
                intensityExtractor={(p: HeatmapPoint) => p.intensity}
                radius={40}
                blur={25}
                max={1.0}
                maxOpacity={0.35}
                minOpacity={0.03}
                gradient={{
                  0.0: 'blue',
                  0.25: 'cyan',
                  0.5: 'lime',
                  0.75: 'yellow',
                  1.0: 'red'
                }}
              />
            )}
          </MapContainer>

          {/* Placeholder when no data */}
          {heatmapPoints.length === 0 && !isLoading && !fetchError && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="text-center">
                <img
                  src={placeholderSrc}
                  alt="Heatmap placeholder"
                  className="mx-auto max-h-64 opacity-50 mb-4"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="px-4 py-2 rounded-lg text-sm bg-black/70 border border-white/10 inline-block">
                  No threat data available
                </div>
              </div>
            </div>
          )}

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[1000]">
              <div className="px-6 py-3 rounded-xl bg-black/80 border border-white/20 text-sm flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Loading heatmap data...
              </div>
            </div>
          )}

          {/* Error banner */}
          {fetchError && !isLoading && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-400/40 text-sm max-w-md z-[1000]">
              <span className="font-semibold">Error:</span> {fetchError}
            </div>
          )}

          {/* Info badge */}
          {heatmapPoints.length > 0 && !isLoading && (
            <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg text-xs bg-black/70 border border-white/10 z-[1000]">
              DBSCAN clustered data • Updated live
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
