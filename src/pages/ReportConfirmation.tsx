import { CheckCircle2, Home } from "lucide-react";

interface ReportConfirmationProps {
  onNavigate: (screen: string) => void;
  reportId?: string;
}

export function ReportConfirmation({ onNavigate, reportId = 'A1B2C3' }: ReportConfirmationProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div 
              className="absolute inset-0 blur-xl opacity-50"
              style={{ backgroundColor: 'var(--threat-validated)' }}
            />
            <CheckCircle2 
              className="relative w-24 h-24" 
              style={{ color: 'var(--threat-validated)' }}
              strokeWidth={2}
            />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h1 className="text-3xl" style={{ fontWeight: 700 }}>Thank You!</h1>
          <p className="text-lg opacity-80">
            Your report has been shared with emergency authorities.
          </p>
          <div 
            className="inline-block px-4 py-2 rounded-lg"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
          >
            <p className="text-sm opacity-70">Your report ID:</p>
            <p className="text-xl" style={{ fontWeight: 700, color: 'var(--threat-interactive)' }}>
              #{reportId}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div 
          className="p-4 rounded-xl border"
          style={{ 
            backgroundColor: 'rgba(59, 220, 247, 0.05)',
            borderColor: 'rgba(59, 220, 247, 0.3)'
          }}
        >
          <p className="text-sm opacity-80">
            Your report is being reviewed by command personnel and will be acted upon immediately.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onNavigate('landing')}
          className="w-full py-4 rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-3"
          style={{
            backgroundColor: 'var(--threat-interactive)',
            color: '#000',
            fontWeight: 700,
          }}
        >
          <Home className="w-5 h-5" />
          Back to Home
        </button>
      </div>
    </div>
  );
}
