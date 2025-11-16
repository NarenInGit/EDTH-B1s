import { useEffect, useState } from "react";
import { AlertTriangle, BookOpen, MapPin, Shield } from "lucide-react";

type GeoLocation = { latitude: number; longitude: number };
const LOCATION_STORAGE_KEY = "threatlink:last-location";

const persistLocationRecord = (coords: GeoLocation) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(coords));
  } catch {
    // ignore storage errors (private browsing, etc.)
  }
};

interface LandingPageProps {
  onNavigate: (screen: string) => void;
  userLocation?: GeoLocation | null;
  onLocationUpdate?: (coords: GeoLocation | null) => void;
}

export function LandingPage({ onNavigate, userLocation: storedLocation = null, onLocationUpdate }: LandingPageProps) {
  const [userLocation, setUserLocation] = useState<GeoLocation | null>(storedLocation);
  const [locationStatus, setLocationStatus] = useState<"idle" | "prompt" | "requesting" | "granted" | "denied" | "unsupported" | "error">(
    storedLocation ? "granted" : "prompt"
  );
  const [locationConfirmed, setLocationConfirmed] = useState(Boolean(storedLocation));
  useEffect(() => {
    if (storedLocation) {
      persistLocationRecord(storedLocation);
    }
    if (!storedLocation) {
      return;
    }
    setUserLocation(storedLocation);
    setLocationStatus("granted");
    setLocationConfirmed(true);
  }, [storedLocation]);

  // Restore last known location (if previously granted)
  useEffect(() => {
    if (storedLocation || typeof window === "undefined") {
      return;
    }
    try {
      const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as GeoLocation;
      if (typeof parsed.latitude === "number" && typeof parsed.longitude === "number") {
        setUserLocation(parsed);
        setLocationStatus("granted");
        setLocationConfirmed(true);
        onLocationUpdate?.(parsed);
      }
    } catch {
      // ignore invalid storage contents
    }
  }, [storedLocation, onLocationUpdate]);

  const requestLocation = () => {
    if (typeof window === "undefined") return;
    if (!("geolocation" in navigator)) {
      setLocationStatus("unsupported");
      return;
    }
    setLocationStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords = { latitude, longitude };
        persistLocationRecord(coords);
        setUserLocation(coords);
        setLocationStatus("granted");
        setLocationConfirmed(false);
        onLocationUpdate?.(null);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus("denied");
          onLocationUpdate?.(null);
        } else {
          setLocationStatus("error");
          onLocationUpdate?.(null);
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const formatCoordinates = (coords: { latitude: number; longitude: number }) =>
    `${coords.latitude.toFixed(4)}°, ${coords.longitude.toFixed(4)}°`;

  const canConfirmLocation = locationStatus === "granted" && !locationConfirmed;

  const handleConfirmLocation = () => {
    if (!userLocation) {
      return;
    }
    setLocationConfirmed(true);
    persistLocationRecord(userLocation);
    onLocationUpdate?.(userLocation);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a]">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Logo and Title */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Shield className="w-12 h-12" style={{ color: 'var(--threat-interactive)' }} />
            <h1 className="text-4xl md:text-5xl" style={{ fontWeight: 700 }}>ThreatLink</h1>
          </div>
          <p className="text-lg opacity-80">by B1s</p>
          <p className="text-xl opacity-70 max-w-lg mx-auto">
            Real-time civilian-to-military threat reporting
          </p>
        </div>

        {/* Location confirmation */}
        <div
          className="rounded-2xl border border-white/10 bg-black/40 p-6 text-center space-y-3"
          style={{ boxShadow: "0 15px 35px rgba(0,0,0,0.45)" }}
        >
          <div className="flex justify-center">
            <div className="flex items-center justify-center rounded-2xl bg-white/10 p-3">
              <MapPin className="w-6 h-6" style={{ color: "var(--threat-interactive)" }} />
            </div>
          </div>
          <p className="text-lg font-semibold">Confirm your location</p>
          <p className="text-sm text-white/70">
            {userLocation ? formatCoordinates(userLocation) : "Awaiting coordinates…"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {locationConfirmed && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: "rgba(51,255,153,0.2)", color: "var(--threat-validated)", border: "1px solid rgba(51,255,153,0.5)" }}>
                Confirmed
              </span>
            )}
            {locationStatus !== "granted" && (
              <button
                onClick={requestLocation}
                className="px-4 py-2 rounded-xl font-semibold transition-colors"
                style={{
                  backgroundColor: "var(--threat-interactive)",
                  color: "#000",
                }}
              >
                {locationStatus === "requesting" ? "Requesting…" : "Enable Location"}
              </button>
            )}
            <button
              onClick={handleConfirmLocation}
              disabled={!canConfirmLocation}
              className="px-4 py-2 rounded-xl font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: canConfirmLocation ? "var(--threat-interactive)" : "rgba(255,255,255,0.08)",
                color: canConfirmLocation ? "#000" : "rgba(255,255,255,0.6)",
              }}
            >
              {locationConfirmed ? "Reconfirm" : "Confirm"}
            </button>
          </div>
          {locationStatus === "denied" && (
            <p className="text-sm text-red-400">Location denied. Allow location access in browser settings.</p>
          )}
          {locationStatus === "unsupported" && (
            <p className="text-sm text-red-400">Location not supported on this device.</p>
          )}
          {locationStatus === "error" && (
            <p className="text-sm text-red-400">Unable to detect location. Try again.</p>
          )}
        </div>

        {/* Help Quick Request */}

        {/* Role Selection Buttons */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {/* Civilian Button */}
          <button
            onClick={() => onNavigate('civilian-report')}
            className="group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 77, 77, 0.1) 0%, rgba(255, 77, 77, 0.05) 100%)',
              border: '2px solid rgba(255, 77, 77, 0.3)',
            }}
          >
            <div className="relative z-10 space-y-4">
              <AlertTriangle className="w-16 h-16 mx-auto" style={{ color: 'var(--threat-urgent)' }} />
              <h2 className="text-2xl" style={{ fontWeight: 700 }}>Report a Threat</h2>
              <p className="opacity-70">Civilian Access</p>
            </div>
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
              style={{ backgroundColor: 'var(--threat-urgent)' }}
            />
          </button>

          {/* Help Button */}
          <button
            onClick={() => onNavigate('help')}
            className="group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 77, 77, 0.2) 0%, rgba(139, 0, 29, 0.4) 100%)',
              border: '2px solid rgba(255, 77, 77, 0.3)',
            }}
          >
            <div className="relative z-10 space-y-4">
              <Shield className="w-16 h-16 mx-auto" style={{ color: 'var(--threat-urgent)' }} />
              <h2 className="text-2xl" style={{ fontWeight: 700 }}>Help Request</h2>
              <p className="opacity-70">Immediate SOS channel</p>
            </div>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
              style={{ backgroundColor: 'var(--threat-urgent)' }}
            />
          </button>

          {/* Heatmap Button */}
          <button
            onClick={() => onNavigate('command-dashboard')}
            className="group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 220, 247, 0.1) 0%, rgba(59, 220, 247, 0.05) 100%)',
              border: '2px solid rgba(59, 220, 247, 0.3)',
            }}
          >
            <div className="relative z-10 space-y-4">
              <Shield className="w-16 h-16 mx-auto" style={{ color: 'var(--threat-interactive)' }} />
              <h2 className="text-2xl" style={{ fontWeight: 700 }}>Heatmap</h2>
              <p className="opacity-70">Command Access</p>
            </div>
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
              style={{ backgroundColor: 'var(--threat-interactive)' }}
            />
          </button>

          {/* Learn Button */}
          <button
            onClick={() => onNavigate('learn')}
            className="group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(51, 255, 153, 0.1) 0%, rgba(51, 255, 153, 0.05) 100%)',
              border: '2px solid rgba(51, 255, 153, 0.3)',
            }}
          >
            <div className="relative z-10 space-y-4">
              <BookOpen className="w-16 h-16 mx-auto" style={{ color: 'var(--threat-validated)' }} />
              <h2 className="text-2xl" style={{ fontWeight: 700 }}>Learn &amp; Prepare</h2>
              <p className="opacity-70">Guides &amp; Updates</p>
            </div>
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
              style={{ backgroundColor: 'var(--threat-validated)' }}
            />
          </button>
        </div>

        {/* Footer */}
        <div className="pt-8 opacity-50">
          <p className="text-sm">Secure • Real-time • Software-only</p>
        </div>
      </div>
    </div>
  );
}
