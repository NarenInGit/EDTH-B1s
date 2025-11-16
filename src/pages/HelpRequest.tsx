import { useMemo, useState } from "react";
import { MapPin, Clock, Shield, ArrowLeft } from "lucide-react";

type GeoLocation = { latitude: number; longitude: number };

interface HelpRequestProps {
  userLocation?: GeoLocation | null;
  onNavigate: (screen: string) => void;
}

type HelpType = "emergency" | "trapped" | "other";

export function HelpRequest({ userLocation = null, onNavigate }: HelpRequestProps) {
  const [helpType, setHelpType] = useState<HelpType>("emergency");
  const [description, setDescription] = useState("");
  const [statusBanner, setStatusBanner] = useState<null | { tone: "success" | "error"; text: string }>(null);

  const formattedTime = useMemo(() => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }, []);

  const formatCoordinates = (coords: GeoLocation) => `${coords.latitude.toFixed(4)}° N, ${coords.longitude.toFixed(4)}° E`;

  const submitRequest = () => {
    if (!userLocation) {
      setStatusBanner({
        tone: "error",
        text: "Location unavailable. Enable GPS before submitting the request.",
      });
      return;
    }
    setStatusBanner({
      tone: "success",
      text: "Emergency team notified with your coordinates.",
    });
  };

  return (
    <div className="min-h-screen bg-[#1d0007] text-white">
      <header className="px-5 py-8 border-b border-white/10 relative">
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{ background: "linear-gradient(90deg, rgba(255,77,77,0.6), rgba(255,150,150,0.6))" }}
        />
        <button
          onClick={() => onNavigate("landing")}
          className="absolute left-5 top-8 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold text-center">Help Request</h1>
      </header>

      <main className="px-5 py-8 space-y-6">
        <section className="rounded-2xl border border-white/15 bg-[#2a000b] p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-white/70" />
            <p className="text-sm uppercase tracking-[0.3em] text-white/60">Auto-detected</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/15 bg-[#32000d] p-4">
              <div className="flex items-center gap-2 text-white/60 text-sm uppercase tracking-[0.3em]">
                <MapPin className="w-4 h-4" />
                Location
              </div>
              <p className="text-lg font-mono mt-2">
                {userLocation ? formatCoordinates(userLocation) : "Awaiting coordinates…"}
              </p>
              <p className="text-sm text-white/50 mt-1">Kyiv, Ukraine</p>
            </div>

            <div className="rounded-xl border border-white/15 bg-[#32000d] p-4">
              <div className="flex items-center gap-2 text-white/60 text-sm uppercase tracking-[0.3em]">
                <Clock className="w-4 h-4" />
                Time
              </div>
              <p className="text-lg font-mono mt-2">{formattedTime}</p>
              <p className="text-sm text-white/50 mt-1">Local device time</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/15 bg-[#2a000b] p-5 space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">Type of Help Needed *</p>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { id: "emergency", label: "Medical Emergency" },
              { id: "trapped", label: "Trapped / Stuck" },
              { id: "other", label: "Other Emergency" },
            ].map((option) => {
              const active = helpType === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setHelpType(option.id as HelpType)}
                  className="rounded-xl px-4 py-4 text-left transition"
                  style={{
                    backgroundColor: active ? "rgba(255,77,77,0.35)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${active ? "rgba(255,77,77,0.6)" : "rgba(255,255,255,0.1)"}`,
                  }}
                >
                  <p className="font-semibold">{option.label}</p>
                  <p className="text-xs text-white/60 mt-1">
                    {option.id === "emergency"
                      ? "Serious injuries, critical health issues."
                      : option.id === "trapped"
                      ? "Unable to evacuate or move to safety."
                      : "Suspicious activity or other urgent concern."}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-white/15 bg-[#2a000b] p-5 space-y-3">
          <label className="text-sm uppercase tracking-[0.3em] text-white/50">Additional Details (Optional)</label>
          <textarea
            rows={5}
            className="w-full rounded-xl border border-white/15 bg-[#1a0005] px-4 py-3 text-sm text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
            placeholder="Include injuries, nearby landmarks, hazards, or number of people."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </section>

        {statusBanner && (
          <div
            className="rounded-xl px-4 py-3 text-sm"
            style={{
              backgroundColor: statusBanner.tone === "success" ? "rgba(51,255,153,0.15)" : "rgba(255,77,77,0.2)",
              border: `1px solid ${statusBanner.tone === "success" ? "rgba(51,255,153,0.4)" : "rgba(255,77,77,0.4)"}`,
              color: statusBanner.tone === "success" ? "#7CFFBF" : "#FF6B81",
            }}
          >
            {statusBanner.text}
          </div>
        )}

        <button
          onClick={submitRequest}
          className="w-full rounded-2xl py-4 text-lg font-semibold tracking-wide uppercase transition hover:bg-[#9c001f]"
          style={{
            backgroundColor: "#b30024",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          Send Report
        </button>
      </main>
    </div>
  );
}