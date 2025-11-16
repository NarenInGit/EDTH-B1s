import { useEffect, useState, useRef, ChangeEvent } from "react";
import { ArrowLeft, Plane, Users, Bomb, Eye, MapPin, Upload, Send, Navigation, AlertTriangle } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { BACKEND_URL } from "../utils/backendUrl";

type GeoLocation = { latitude: number; longitude: number };
type ReportDraft = {
  selectedThreat: string | null;
  direction: string;
  description: string;
};

interface CivilianReportProps {
  onNavigate: (screen: string, data?: any) => void;
  userLocation?: GeoLocation | null;
  navigationData?: Record<string, any>;
  onClearNavigationData?: () => void;
  draft?: ReportDraft;
  onDraftChange?: (draft: ReportDraft) => void;
}

const threatTypes = [
  { id: 'drone', label: 'Drone', icon: Plane },
  { id: 'troops', label: 'Troop Movement', icon: Users },
  { id: 'explosion', label: 'Explosion / Impact', icon: Bomb },
  { id: 'suspicious', label: 'Suspicious Activity', icon: Eye },
];

export function CivilianReport({
  onNavigate,
  userLocation = null,
  navigationData,
  onClearNavigationData,
  draft,
  onDraftChange,
}: CivilianReportProps) {
  const [formDraft, setFormDraft] = useState<ReportDraft>({
    selectedThreat: draft?.selectedThreat ?? null,
    direction: draft?.direction ?? "",
    description: draft?.description ?? "",
  });
  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoUploadStatus, setPhotoUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [photoMessage, setPhotoMessage] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState('');
  const [currentLocation, setCurrentLocation] = useState<GeoLocation | null>(userLocation ?? null);
  const [locationMessage, setLocationMessage] = useState('');
  const [locationStatus, setLocationStatus] = useState<"idle" | "resolving" | "ready" | "error">(
    userLocation ? "ready" : "idle"
  );
  
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (userLocation) {
      setCurrentLocation(userLocation);
      setLocationStatus("ready");
      setLocationMessage("Location locked from confirmation screen.");
    }
  }, [userLocation]);

  useEffect(() => {
    if (currentLocation || locationStatus === "resolving") {
      return;
    }
    if (!("geolocation" in navigator)) {
      setLocationStatus("error");
      setLocationMessage("Location unavailable on this device.");
      return;
    }
    setLocationStatus("resolving");
    setLocationMessage("Acquiring your position…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCurrentLocation({ latitude: coords.latitude, longitude: coords.longitude });
        setLocationStatus("ready");
        setLocationMessage("Location locked.");
      },
      (error) => {
        setLocationStatus("error");
        setLocationMessage(error.message || "Unable to retrieve location.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [currentLocation, locationStatus]);

  const normalizeThreatType = (value: string | null) => {
    if (!value) return null;
    const mapping: Record<string, string> = {
      drone: "drone",
      troops: "troop",
      explosion: "explosion",
      suspicious: "suspicious_activity",
    };
    return mapping[value] ?? value;
  };

  useEffect(() => {
    setFormDraft({
      selectedThreat: draft?.selectedThreat ?? null,
      direction: draft?.direction ?? "",
      description: draft?.description ?? "",
    });
  }, [draft?.selectedThreat, draft?.direction, draft?.description]);

  const updateDraft = (updates: Partial<ReportDraft>) => {
    setFormDraft((prev) => {
      const next = { ...prev, ...updates };
      onDraftChange?.(next);
      return next;
    });
  };

  const orientationListenerRef = useRef<(event: DeviceOrientationEvent) => void>();
  const [orientationHeading, setOrientationHeading] = useState<number | null>(null);
  const [orientationStatus, setOrientationStatus] = useState<"idle" | "tracking" | "error">("idle");
  const [orientationError, setOrientationError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (orientationListenerRef.current) {
        window.removeEventListener("deviceorientation", orientationListenerRef.current);
      }
    };
  }, []);

  const headingToDirection = (angle: number) => {
    const normalized = (Math.round(angle / 45) + 8) % 8;
    const labels = ["North", "Northeast", "East", "Southeast", "South", "Southwest", "West", "Northwest"];
    return labels[normalized];
  };

  const startOrientationListener = () => {
    const handler = (event: DeviceOrientationEvent) => {
      const webkitHeading = (event as any).webkitCompassHeading;
      const alpha = typeof event.alpha === "number" ? event.alpha : null;
      if (typeof webkitHeading === "number") {
        setOrientationHeading((webkitHeading + 360) % 360);
      } else if (alpha !== null) {
        const heading = (360 - alpha + 360) % 360;
        setOrientationHeading(heading);
      }
    };
    orientationListenerRef.current = handler;
    window.addEventListener("deviceorientation", handler);
    setOrientationStatus("tracking");
    setOrientationError(null);
  };

  const enableCompass = async () => {
    if (orientationStatus === "tracking") {
      return;
    }
    if (typeof window === "undefined") {
      setOrientationStatus("error");
      setOrientationError("Compass not supported in this environment.");
      return;
    }
    try {
      setOrientationError(null);
      if (typeof DeviceOrientationEvent !== "undefined" && typeof (DeviceOrientationEvent as any).requestPermission === "function") {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response !== "granted") {
          setOrientationStatus("error");
          setOrientationError("Permission denied. Enable motion & orientation access in browser settings.");
          return;
        }
      }
      startOrientationListener();
    } catch (error: any) {
      setOrientationStatus("error");
      setOrientationError(error?.message || "Unable to access orientation sensors.");
    }
  };

  const captureHeading = () => {
    if (orientationHeading == null) {
      setOrientationError("Point your device and wait for the compass to settle before capturing.");
      return;
    }
    const directionLabel = headingToDirection(orientationHeading);
    updateDraft({ direction: directionLabel });
  };

  useEffect(() => {
    if (navigationData?.photoCaptured) {
      setHasPhoto(true);
      setPhotoUploadStatus("success");
      setPhotoMessage("Photo captured via secure camera.");
      onClearNavigationData?.();
    } else if (navigationData?.photoError) {
      setPhotoUploadStatus("error");
      setPhotoMessage(navigationData.photoError);
      onClearNavigationData?.();
    }
  }, [navigationData, onClearNavigationData]);

  const uploadPhoto = async (file: File) => {
    setPhotoUploadStatus("uploading");
    setPhotoMessage("Uploading photo…");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch(`${BACKEND_URL}/capture`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        throw new Error(detail?.detail || "Unable to upload image.");
      }
      setHasPhoto(true);
      setPhotoUploadStatus("success");
      setPhotoMessage("Photo captured securely.");
    } catch (error: any) {
      setPhotoUploadStatus("error");
      const text =
        error?.message === "Failed to fetch"
          ? `Unable to reach ${BACKEND_URL}/capture. Ensure the backend server is running and accessible.`
          : error?.message || "Photo upload failed.";
      setPhotoMessage(text);
    }
  };

  const handlePhotoSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    await uploadPhoto(file);
    event.target.value = "";
  };

  const formatCoordinates = (coords: GeoLocation) => {
    const latHemisphere = coords.latitude >= 0 ? 'N' : 'S';
    const lonHemisphere = coords.longitude >= 0 ? 'E' : 'W';
    return `${Math.abs(coords.latitude).toFixed(4)}° ${latHemisphere}, ${Math.abs(coords.longitude).toFixed(4)}° ${lonHemisphere}`;
  };

  const handleSubmit = async () => {
    if (!formDraft.selectedThreat || !formDraft.direction) return;
    if (!currentLocation) {
      setSubmitStatus("error");
      setSubmitMessage("Device location is required to submit a report.");
      return;
    }

    setSubmitStatus("loading");
    setSubmitMessage('');

    const normalizedType = normalizeThreatType(formDraft.selectedThreat);
    if (!normalizedType) {
      setSubmitStatus("error");
      setSubmitMessage("Select a threat type before submitting.");
      return;
    }
    const payload = {
      type: normalizedType,
      lat: currentLocation.latitude,
      lon: currentLocation.longitude,
      direction: formDraft.direction,
      description: formDraft.description,
      timestamp: Date.now(),
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("reports").insert([payload]);

    if (error) {
      setSubmitStatus("error");
      setSubmitMessage(error.message);
      return;
    }

    setSubmitStatus("success");
    setSubmitMessage("Report transmitted successfully.");
    setFormDraft({ selectedThreat: null, direction: "", description: "" });
    onDraftChange?.({ selectedThreat: null, direction: "", description: "" });
    const reportId = Math.random().toString(36).substring(2, 8).toUpperCase();
    onNavigate('report-confirmation', { reportId });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-4 border-b border-white/10" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={() => onNavigate('landing')}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl" style={{ fontWeight: 700 }}>Report a Threat</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 pb-24">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Question */}
          <div className="space-y-4">
            <h2 className="text-xl" style={{ fontWeight: 700 }}>What did you see?</h2>
            
            {/* Threat Type Selection */}
            <div className="grid grid-cols-2 gap-3">
              {threatTypes.map((threat) => {
                const Icon = threat.icon;
                const isSelected = formDraft.selectedThreat === threat.id;
                
                return (
                  <button
                    key={threat.id}
                    onClick={() => updateDraft({ selectedThreat: threat.id })}
                    className="relative p-6 rounded-xl transition-all duration-200"
                    style={{
                      backgroundColor: isSelected ? 'rgba(255, 77, 77, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      border: `2px solid ${isSelected ? 'var(--threat-urgent)' : 'rgba(255, 255, 255, 0.1)'}`,
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    }}
                  >
                    <Icon 
                      className="w-10 h-10 mx-auto mb-3" 
                      style={{ color: isSelected ? 'var(--threat-urgent)' : '#fff' }}
                    />
                    <p style={{ fontWeight: isSelected ? 700 : 500 }}>{threat.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location (Auto-detected) */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5" style={{ color: 'var(--threat-validated)' }} />
              <div className="flex-1">
                <p className="text-sm opacity-70">Location (Auto-detected)</p>
                {currentLocation ? (
                  <>
                    <p style={{ fontWeight: 600 }}>{formatCoordinates(currentLocation)}</p>
                    <p className="text-sm opacity-50">{locationMessage}</p>
                  </>
                ) : (
                  <div className="space-y-1 text-sm">
                    <p className="opacity-60">{locationMessage || "Determining your position…"}</p>
                    {locationStatus === "error" && (
                      <p className="text-red-400">Location unavailable. Return to home to grant permission.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Direction - Compass capture */}
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <label className="block" style={{ fontWeight: 600 }}>
        Direction of Movement
      </label>
      <span
        className="text-xs px-2 py-1 rounded"
        style={{ backgroundColor: 'rgba(255, 77, 77, 0.2)', color: 'var(--threat-urgent)' }}
      >
        Required
      </span>
    </div>
    <div
      className="rounded-2xl border border-white/15 bg-black/30 p-4 space-y-4"
      style={{ boxShadow: "0 15px 40px rgba(0,0,0,0.35)" }}
    >
      <div className="flex flex-col items-center text-center gap-2">
        <Navigation className="w-8 h-8" style={{ color: 'var(--threat-interactive)' }} />
        <p className="text-sm text-white/70">
          Point your phone toward the threat, steady it, then capture direction in one tap.
        </p>
        <p className="text-lg font-semibold" style={{ color: 'var(--threat-validated)' }}>
          Live heading:{" "}
          {orientationHeading != null
            ? `${Math.round(orientationHeading)}° (${headingToDirection(orientationHeading)})`
            : orientationStatus === "tracking"
            ? "Calibrating…"
            : "Compass idle"}
        </p>
        {formDraft.direction && (
          <p className="text-sm text-white/60">
            Locked direction: <span className="font-semibold text-white">{formDraft.direction}</span>
          </p>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={enableCompass}
          className="flex-1 rounded-xl bg-white/10 hover:bg-white/20 transition-colors py-3 text-sm font-semibold"
          disabled={orientationStatus === "tracking"}
        >
          {orientationStatus === "tracking" ? "Compass Active" : "Enable Compass"}
        </button>
        <button
          type="button"
          onClick={captureHeading}
          disabled={orientationHeading == null}
          className="flex-1 rounded-xl py-3 text-sm font-semibold transition-colors"
          style={{
            backgroundColor: orientationHeading == null ? "rgba(255,255,255,0.1)" : "var(--threat-validated)",
            color: orientationHeading == null ? "rgba(255,255,255,0.6)" : "#000",
          }}
        >
          Capture Direction
        </button>
      </div>
      {orientationError && (
        <p className="text-sm text-red-400">{orientationError}</p>
      )}
    </div>
  </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block" style={{ fontWeight: 600 }}>
              Description (Optional)
            </label>
            <textarea
              value={formDraft.description}
              onChange={(e) => updateDraft({ description: e.target.value })}
              placeholder="Additional details about what you observed..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[var(--threat-interactive)] focus:outline-none resize-none transition-colors"
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoSelected}
            />
            <button
              onClick={() => onNavigate("camera-capture")}
              className="w-full p-4 rounded-xl border-2 border-dashed transition-all"
              style={{
                borderColor: hasPhoto ? 'var(--threat-validated)' : 'rgba(255, 255, 255, 0.2)',
                backgroundColor: hasPhoto ? 'rgba(51, 255, 153, 0.05)' : 'transparent',
              }}
              type="button"
            >
              <div className="flex items-center justify-center gap-3">
                <Upload className="w-6 h-6" style={{ color: hasPhoto ? 'var(--threat-validated)' : '#fff' }} />
                <span style={{ fontWeight: 600 }}>
                  {hasPhoto ? "Photo Added ✓" : "Add Photo (Camera)"}
                </span>
              </div>
            </button>
            {photoMessage && (
              <p
                className="text-sm"
                style={{ color: photoUploadStatus === "error" ? "var(--threat-urgent)" : "var(--threat-validated)" }}
              >
                {photoMessage}
              </p>
            )}
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="text-sm text-white/70 underline underline-offset-4"
            >
              Upload from device instead
            </button>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-white/10" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="space-y-3">
            <button
              onClick={handleSubmit}
              disabled={!formDraft.selectedThreat || !formDraft.direction || submitStatus === "loading"}
              className="w-full py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
              style={{
                backgroundColor: (formDraft.selectedThreat && formDraft.direction) ? 'var(--threat-urgent)' : 'rgba(255, 255, 255, 0.1)',
                opacity: (formDraft.selectedThreat && formDraft.direction && submitStatus !== "loading") ? 1 : 0.5,
                cursor: (formDraft.selectedThreat && formDraft.direction && submitStatus !== "loading") ? 'pointer' : 'not-allowed',
                fontWeight: 700,
              }}
            >
              <Send className="w-5 h-5" />
              {submitStatus === "loading" ? "SENDING..." : "SEND REPORT"}
            </button>
            {submitMessage && (
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm"
                style={{
                  backgroundColor: submitStatus === "error" ? "rgba(255,77,77,0.15)" : "rgba(51,255,153,0.1)",
                  color: submitStatus === "error" ? "var(--threat-urgent)" : "var(--threat-validated)",
                }}
              >
                {submitStatus === "error" && <AlertTriangle className="w-4 h-4" />}
                <span>{submitMessage}</span>
              </div>
            )}
          </div>
          <button
            onClick={() => onNavigate('landing')}
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
