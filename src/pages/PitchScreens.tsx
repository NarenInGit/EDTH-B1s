import { useState } from "react";
import { ArrowLeft, ArrowRight, Shield, Users, Radio, Zap, DollarSign, Wifi, Clock, Target, AlertCircle, CheckCircle } from "lucide-react";

interface PitchScreensProps {
  onNavigate: (screen: string) => void;
}

export function PitchScreens({ onNavigate }: PitchScreensProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "The Problem",
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <AlertCircle className="w-20 h-20 mx-auto mb-4" style={{ color: 'var(--threat-urgent)' }} />
            <h2 className="text-3xl mb-4" style={{ fontWeight: 700 }}>Critical Communication Gap</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border" style={{ backgroundColor: 'rgba(255, 77, 77, 0.1)', borderColor: 'rgba(255, 77, 77, 0.3)' }}>
              <h3 className="text-xl mb-3" style={{ fontWeight: 700 }}>Current Challenges</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'var(--threat-urgent)' }} />
                  <span>Civilians lack direct channels to report threats</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'var(--threat-urgent)' }} />
                  <span>Emergency hotlines overwhelmed during active situations</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'var(--threat-urgent)' }} />
                  <span>Critical minutes lost in threat response</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'var(--threat-urgent)' }} />
                  <span>No centralized threat visualization for command</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-xl border" style={{ backgroundColor: 'rgba(59, 220, 247, 0.1)', borderColor: 'rgba(59, 220, 247, 0.3)' }}>
              <h3 className="text-xl mb-3" style={{ fontWeight: 700 }}>Impact</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm opacity-70">Average Response Delay</p>
                  <p className="text-3xl" style={{ fontWeight: 700, color: 'var(--threat-urgent)' }}>15-30 min</p>
                </div>
                <div>
                  <p className="text-sm opacity-70">Information Accuracy</p>
                  <p className="text-3xl" style={{ fontWeight: 700, color: 'var(--threat-caution)' }}>~60%</p>
                </div>
                <div>
                  <p className="text-sm opacity-70">Situational Awareness</p>
                  <p className="text-3xl" style={{ fontWeight: 700, color: 'var(--threat-urgent)' }}>Limited</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "How ThreatLink Works",
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <Shield className="w-20 h-20 mx-auto mb-4" style={{ color: 'var(--threat-interactive)' }} />
            <h2 className="text-3xl mb-4" style={{ fontWeight: 700 }}>Three Simple Steps</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="relative">
              <div className="p-6 rounded-xl border h-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--threat-urgent)' }}>
                  <span className="text-2xl" style={{ fontWeight: 700, color: '#000' }}>1</span>
                </div>
                <h3 className="text-xl mb-3" style={{ fontWeight: 700 }}>Civilian Reports</h3>
                <p className="opacity-70 mb-4">Citizens observe and report threats using mobile app with 2-3 taps</p>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--threat-validated)' }}>
                  <CheckCircle className="w-4 h-4" />
                  <span>GPS auto-location</span>
                </div>
                <div className="flex items-center gap-2 text-sm mt-2" style={{ color: 'var(--threat-validated)' }}>
                  <CheckCircle className="w-4 h-4" />
                  <span>Photo upload optional</span>
                </div>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-6 text-white/30">
                <ArrowRight className="w-6 h-6" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="p-6 rounded-xl border h-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--threat-caution)' }}>
                  <span className="text-2xl" style={{ fontWeight: 700, color: '#000' }}>2</span>
                </div>
                <h3 className="text-xl mb-3" style={{ fontWeight: 700 }}>Real-time Sync</h3>
                <p className="opacity-70 mb-4">Reports instantly transmitted to command center via secure channel</p>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--threat-validated)' }}>
                  <CheckCircle className="w-4 h-4" />
                  <span>Encrypted transmission</span>
                </div>
                <div className="flex items-center gap-2 text-sm mt-2" style={{ color: 'var(--threat-validated)' }}>
                  <CheckCircle className="w-4 h-4" />
                  <span>Offline queue & sync</span>
                </div>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-6 text-white/30">
                <ArrowRight className="w-6 h-6" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-xl border h-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--threat-validated)' }}>
                <span className="text-2xl" style={{ fontWeight: 700, color: '#000' }}>3</span>
              </div>
              <h3 className="text-xl mb-3" style={{ fontWeight: 700 }}>Command Action</h3>
              <p className="opacity-70 mb-4">Military personnel validate, mark zones, and coordinate response</p>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--threat-validated)' }}>
                <CheckCircle className="w-4 h-4" />
                <span>Map visualization</span>
              </div>
              <div className="flex items-center gap-2 text-sm mt-2" style={{ color: 'var(--threat-validated)' }}>
                <CheckCircle className="w-4 h-4" />
                <span>Red zone marking</span>
              </div>
            </div>
          </div>

          {/* Flow Diagram */}
          <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6" style={{ color: 'var(--threat-urgent)' }} />
                <span style={{ fontWeight: 600 }}>Civilian</span>
              </div>
              <ArrowRight className="w-6 h-6 opacity-50" />
              <div className="flex items-center gap-2">
                <Radio className="w-6 h-6" style={{ color: 'var(--threat-caution)' }} />
                <span style={{ fontWeight: 600 }}>ThreatLink</span>
              </div>
              <ArrowRight className="w-6 h-6 opacity-50" />
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6" style={{ color: 'var(--threat-validated)' }} />
                <span style={{ fontWeight: 600 }}>Command</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Key Benefits",
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <Zap className="w-20 h-20 mx-auto mb-4" style={{ color: 'var(--threat-caution)' }} />
            <h2 className="text-3xl mb-4" style={{ fontWeight: 700 }}>Why ThreatLink</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border" style={{ backgroundColor: 'rgba(59, 220, 247, 0.1)', borderColor: 'rgba(59, 220, 247, 0.3)' }}>
              <DollarSign className="w-10 h-10 mb-3" style={{ color: 'var(--threat-interactive)' }} />
              <h3 className="text-xl mb-3" style={{ fontWeight: 700 }}>Cost-Efficient</h3>
              <p className="opacity-80">Software-only solution requiring no additional hardware infrastructure. Deploy immediately on existing devices.</p>
            </div>

            <div className="p-6 rounded-xl border" style={{ backgroundColor: 'rgba(255, 211, 61, 0.1)', borderColor: 'rgba(255, 211, 61, 0.3)' }}>
              <Clock className="w-10 h-10 mb-3" style={{ color: 'var(--threat-caution)' }} />
              <h3 className="text-xl mb-3" style={{ fontWeight: 700 }}>Rapid Response</h3>
              <p className="opacity-80">Reduce emergency response time from 15-30 minutes to under 2 minutes with real-time reporting.</p>
            </div>

            <div className="p-6 rounded-xl border" style={{ backgroundColor: 'rgba(51, 255, 153, 0.1)', borderColor: 'rgba(51, 255, 153, 0.3)' }}>
              <Wifi className="w-10 h-10 mb-3" style={{ color: 'var(--threat-validated)' }} />
              <h3 className="text-xl mb-3" style={{ fontWeight: 700 }}>Works Offline</h3>
              <p className="opacity-80">Queue reports when offline and automatically sync when connection is restored. Critical for conflict zones.</p>
            </div>

            <div className="p-6 rounded-xl border" style={{ backgroundColor: 'rgba(255, 77, 77, 0.1)', borderColor: 'rgba(255, 77, 77, 0.3)' }}>
              <Target className="w-10 h-10 mb-3" style={{ color: 'var(--threat-urgent)' }} />
              <h3 className="text-xl mb-3" style={{ fontWeight: 700 }}>Ukraine-Ready</h3>
              <p className="opacity-80">Designed specifically for active conflict scenarios. Immediate applicability with mobile-first civilian interface.</p>
            </div>
          </div>

          <div className="p-6 rounded-xl text-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <p className="text-xl mb-2" style={{ fontWeight: 700 }}>Potential Impact</p>
            <p className="text-4xl mb-2" style={{ fontWeight: 700, color: 'var(--threat-validated)' }}>10,000+ lives</p>
            <p className="opacity-70">Protected through faster threat identification and response</p>
          </div>
        </div>
      ),
    },
    {
      title: "Technical Architecture",
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <Shield className="w-20 h-20 mx-auto mb-4" style={{ color: 'var(--threat-validated)' }} />
            <h2 className="text-3xl mb-4" style={{ fontWeight: 700 }}>System Architecture</h2>
            <p className="opacity-70">Frontend-focused, scalable design</p>
          </div>

          <div className="space-y-4">
            {/* Civilian Layer */}
            <div className="p-6 rounded-xl border" style={{ backgroundColor: 'rgba(255, 77, 77, 0.05)', borderColor: 'rgba(255, 77, 77, 0.2)' }}>
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-6 h-6" style={{ color: 'var(--threat-urgent)' }} />
                <h3 className="text-xl" style={{ fontWeight: 700 }}>Civilian Interface</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-white/5">
                  <p style={{ fontWeight: 600 }}>Mobile PWA</p>
                  <p className="opacity-70">React-based web app</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p style={{ fontWeight: 600 }}>Geolocation</p>
                  <p className="opacity-70">Browser GPS API</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p style={{ fontWeight: 600 }}>Offline Queue</p>
                  <p className="opacity-70">IndexedDB storage</p>
                </div>
              </div>
            </div>

            {/* Backend Layer */}
            <div className="p-6 rounded-xl border" style={{ backgroundColor: 'rgba(255, 211, 61, 0.05)', borderColor: 'rgba(255, 211, 61, 0.2)' }}>
              <div className="flex items-center gap-3 mb-3">
                <Radio className="w-6 h-6" style={{ color: 'var(--threat-caution)' }} />
                <h3 className="text-xl" style={{ fontWeight: 700 }}>Backend Services</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-white/5">
                  <p style={{ fontWeight: 600 }}>REST API</p>
                  <p className="opacity-70">Report ingestion</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p style={{ fontWeight: 600 }}>WebSocket</p>
                  <p className="opacity-70">Real-time updates</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p style={{ fontWeight: 600 }}>Database</p>
                  <p className="opacity-70">PostgreSQL/MongoDB</p>
                </div>
              </div>
            </div>

            {/* Command Layer */}
            <div className="p-6 rounded-xl border" style={{ backgroundColor: 'rgba(59, 220, 247, 0.05)', borderColor: 'rgba(59, 220, 247, 0.2)' }}>
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-6 h-6" style={{ color: 'var(--threat-interactive)' }} />
                <h3 className="text-xl" style={{ fontWeight: 700 }}>Heatmap</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-white/5">
                  <p style={{ fontWeight: 600 }}>Web Dashboard</p>
                  <p className="opacity-70">React + TypeScript</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p style={{ fontWeight: 600 }}>Map Rendering</p>
                  <p className="opacity-70">Mapbox/Leaflet</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <p style={{ fontWeight: 600 }}>Analytics</p>
                  <p className="opacity-70">Heatmap visualization</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl text-center" style={{ backgroundColor: 'rgba(51, 255, 153, 0.1)', border: '1px solid rgba(51, 255, 153, 0.3)' }}>
            <p style={{ fontWeight: 600, color: 'var(--threat-validated)' }}>
              ✓ Scalable • ✓ Secure • ✓ Fast deployment • ✓ Low infrastructure cost
            </p>
          </div>
        </div>
      ),
    },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 px-4 py-4 border-b border-white/10 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('landing')}
              className="p-2 rounded-lg hover:bg-white/5"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6" style={{ color: 'var(--threat-interactive)' }} />
              <h1 className="text-xl" style={{ fontWeight: 700 }}>ThreatLink Pitch</h1>
            </div>
          </div>
          <div className="text-sm opacity-70">
            {currentSlide + 1} / {slides.length}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-6xl mx-auto py-8">
          {slides[currentSlide].content}
        </div>
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 z-20 px-4 py-4 border-t border-white/10 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  backgroundColor: idx === currentSlide ? 'var(--threat-interactive)' : 'rgba(255, 255, 255, 0.3)',
                  width: idx === currentSlide ? '2rem' : '0.5rem',
                }}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="px-6 py-3 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            style={{
              backgroundColor: currentSlide === slides.length - 1 ? 'rgba(255, 255, 255, 0.05)' : 'var(--threat-interactive)',
              color: currentSlide === slides.length - 1 ? '#fff' : '#000',
            }}
          >
            Next
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
