import { useState } from "react";
import { ArrowLeft, Shield, MapPin, Clock, CheckCircle, X, AlertTriangle, Filter } from "lucide-react";

interface Report {
  id: string;
  type: 'drone' | 'troops' | 'explosion' | 'suspicious';
  time: string;
  location: string;
  coords: { x: number; y: number };
  status: 'pending' | 'validated' | 'dismissed';
  description?: string;
  direction?: string;
}

interface CommandDashboardProps {
  onNavigate: (screen: string, data?: any) => void;
}

const mockReports: Report[] = [
  {
    id: 'R001',
    type: 'drone',
    time: '2 min ago',
    location: 'Kyiv, District 7',
    coords: { x: 35, y: 40 },
    status: 'pending',
    description: 'Small UAV spotted heading northeast',
    direction: 'Northeast',
  },
  {
    id: 'R002',
    type: 'explosion',
    time: '8 min ago',
    location: 'Kyiv, District 3',
    coords: { x: 60, y: 25 },
    status: 'pending',
    description: 'Loud explosion heard, possible impact site',
  },
  {
    id: 'R003',
    type: 'troops',
    time: '15 min ago',
    location: 'Kyiv, District 5',
    coords: { x: 45, y: 70 },
    status: 'validated',
    direction: 'East',
  },
  {
    id: 'R004',
    type: 'suspicious',
    time: '22 min ago',
    location: 'Kyiv, District 2',
    coords: { x: 70, y: 55 },
    status: 'pending',
  },
];

export function CommandDashboard({ onNavigate }: CommandDashboardProps) {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [redZones, setRedZones] = useState<{ x: number; y: number }[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated': return 'var(--threat-validated)';
      case 'dismissed': return 'rgba(255, 255, 255, 0.3)';
      default: return 'var(--threat-caution)';
    }
  };

  const getThreatColor = (type: string) => {
    switch (type) {
      case 'drone':
      case 'explosion':
        return 'var(--threat-urgent)';
      case 'troops':
        return 'var(--threat-caution)';
      default:
        return 'var(--threat-interactive)';
    }
  };

  const handleValidate = (reportId: string) => {
    setReports(reports.map(r => 
      r.id === reportId ? { ...r, status: 'validated' as const } : r
    ));
    setSelectedReport(null);
  };

  const handleDismiss = (reportId: string) => {
    setReports(reports.map(r => 
      r.id === reportId ? { ...r, status: 'dismissed' as const } : r
    ));
    setSelectedReport(null);
  };

  const handleMarkRedZone = (report: Report) => {
    setRedZones([...redZones, report.coords]);
    handleValidate(report.id);
  };

  const pendingCount = reports.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col lg:flex-row">
      {/* Header (Mobile) */}
      <div className="lg:hidden sticky top-0 z-20 px-4 py-4 border-b border-white/10" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('landing')}
              className="p-2 rounded-lg hover:bg-white/5"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6" style={{ color: 'var(--threat-interactive)' }} />
              <h1 className="text-xl" style={{ fontWeight: 700 }}>Heatmap</h1>
            </div>
          </div>
          {pendingCount > 0 && (
            <div 
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: 'var(--threat-urgent)' }}
            >
              <span style={{ fontWeight: 700 }}>{pendingCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Map Panel */}
      <div className="flex-1 relative order-2 lg:order-1" style={{ minHeight: '400px' }}>
        {/* Header (Desktop) */}
        <div className="hidden lg:block absolute top-0 left-0 right-0 z-10 p-6 bg-gradient-to-b from-[#0a0a0a] to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('landing')}
                className="p-2 rounded-lg hover:bg-white/5"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <Shield className="w-8 h-8" style={{ color: 'var(--threat-interactive)' }} />
              <h1 className="text-2xl" style={{ fontWeight: 700 }}>Heatmap</h1>
            </div>
            <button
              onClick={() => onNavigate('heatmap')}
              className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
              style={{ border: '1px solid rgba(255, 255, 255, 0.2)' }}
            >
              <Filter className="w-4 h-4" />
              Heatmap View
            </button>
          </div>
        </div>

        {/* Map */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1419] to-[#1a1f24]">
          {/* Grid overlay */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />

          {/* Red Zones */}
          {redZones.map((zone, idx) => (
            <div
              key={idx}
              className="absolute rounded-full animate-pulse"
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: '120px',
                height: '120px',
                backgroundColor: 'rgba(255, 77, 77, 0.2)',
                border: '2px solid rgba(255, 77, 77, 0.5)',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}

          {/* Report Markers */}
          {reports.filter(r => r.status !== 'dismissed').map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className="absolute group"
              style={{
                left: `${report.coords.x}%`,
                top: `${report.coords.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Pulse effect for pending */}
              {report.status === 'pending' && (
                <div 
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{
                    backgroundColor: getThreatColor(report.type),
                    width: '40px',
                    height: '40px',
                    opacity: 0.4,
                  }}
                />
              )}
              
              {/* Marker */}
              <div
                className="relative w-10 h-10 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-125"
                style={{
                  backgroundColor: getThreatColor(report.type),
                  borderColor: '#0a0a0a',
                  boxShadow: `0 0 20px ${getThreatColor(report.type)}`,
                }}
              >
                <MapPin className="w-5 h-5" style={{ color: '#0a0a0a' }} />
              </div>

              {/* Tooltip */}
              <div 
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ backgroundColor: '#000', border: '1px solid rgba(255, 255, 255, 0.2)' }}
              >
                <p className="text-xs" style={{ fontWeight: 600 }}>{report.id} - {report.type}</p>
              </div>
            </button>
          ))}

          {/* Legend */}
          <div className="absolute bottom-6 left-6 p-4 rounded-xl" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <p className="text-sm mb-3 opacity-70" style={{ fontWeight: 600 }}>Threat Levels</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--threat-urgent)' }} />
                <span className="text-xs">High Threat</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--threat-caution)' }} />
                <span className="text-xs">Medium Threat</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--threat-validated)' }} />
                <span className="text-xs">Validated</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Sidebar */}
      <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-white/10 bg-[#0a0a0a] order-1 lg:order-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 72px)' }}>
        <div className="p-4 border-b border-white/10 sticky top-0 bg-[#0a0a0a] z-10">
          <h2 className="text-xl mb-1" style={{ fontWeight: 700 }}>Incoming Reports</h2>
          <p className="text-sm opacity-70">{pendingCount} pending validation</p>
        </div>

        <div className="p-4 space-y-3">
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className="w-full text-left p-4 rounded-xl border transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: report.status === 'dismissed' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: getStatusColor(report.status),
                opacity: report.status === 'dismissed' ? 0.5 : 1,
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span style={{ fontWeight: 700, color: getThreatColor(report.type) }}>
                    {report.id}
                  </span>
                  <span className="text-sm opacity-70">•</span>
                  <span className="text-sm capitalize">{report.type}</span>
                </div>
                <div className="flex items-center gap-1 text-xs opacity-70">
                  <Clock className="w-3 h-3" />
                  {report.time}
                </div>
              </div>

              <div className="flex items-start gap-2 mb-2">
                <MapPin className="w-4 h-4 mt-0.5 opacity-70" />
                <p className="text-sm opacity-80">{report.location}</p>
              </div>

              {report.status !== 'pending' && (
                <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: getStatusColor(report.status) }}>
                  {report.status === 'validated' ? (
                    <><CheckCircle className="w-4 h-4" /> Validated</>
                  ) : (
                    <><X className="w-4 h-4" /> Dismissed</>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedReport(null)}
        >
          <div 
            className="max-w-lg w-full rounded-2xl p-6 space-y-6"
            style={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255, 255, 255, 0.2)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl mb-1" style={{ fontWeight: 700 }}>
                  Report {selectedReport.id}
                </h2>
                <p className="capitalize opacity-70">{selectedReport.type} Sighting</p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 rounded-lg hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs opacity-70 mb-1">Timestamp</p>
                <p style={{ fontWeight: 600 }}>{selectedReport.time}</p>
              </div>

              <div className="p-3 rounded-lg bg-white/5">
                <p className="text-xs opacity-70 mb-1">Location</p>
                <p style={{ fontWeight: 600 }}>{selectedReport.location}</p>
              </div>

              {selectedReport.direction && (
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xs opacity-70 mb-1">Direction</p>
                  <p style={{ fontWeight: 600 }}>{selectedReport.direction}</p>
                </div>
              )}

              {selectedReport.description && (
                <div className="p-3 rounded-lg bg-white/5">
                  <p className="text-xs opacity-70 mb-1">Description</p>
                  <p>{selectedReport.description}</p>
                </div>
              )}
            </div>

            {selectedReport.status === 'pending' && (
              <div className="grid grid-cols-3 gap-3 pt-4">
                <button
                  onClick={() => handleValidate(selectedReport.id)}
                  className="col-span-1 py-3 rounded-xl transition-all hover:scale-105"
                  style={{ backgroundColor: 'var(--threat-validated)', color: '#000', fontWeight: 700 }}
                >
                  <CheckCircle className="w-5 h-5 mx-auto" />
                </button>
                <button
                  onClick={() => handleMarkRedZone(selectedReport)}
                  className="col-span-1 py-3 rounded-xl transition-all hover:scale-105"
                  style={{ backgroundColor: 'var(--threat-urgent)', color: '#fff', fontWeight: 700 }}
                >
                  <AlertTriangle className="w-5 h-5 mx-auto" />
                </button>
                <button
                  onClick={() => handleDismiss(selectedReport.id)}
                  className="col-span-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                >
                  <X className="w-5 h-5 mx-auto" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
