import { useEffect, useRef, useState, ChangeEvent } from "react";
import { ArrowLeft, Camera, RefreshCw, AlertTriangle } from "lucide-react";

interface CameraCaptureProps {
  onNavigate: (screen: string, data?: any) => void;
}

export function CameraCapture({ onNavigate }: CameraCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraStatus, setCameraStatus] = useState<"idle" | "preview" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("Use your camera to capture visual evidence.");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleOpenCamera = () => {
    if (cameraStatus === "uploading") return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setCameraStatus("idle");
      setMessage("No photo captured. Tap capture to open the camera.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(url);
    setCameraStatus("preview");
    setMessage("Photo ready. Upload it or retake another shot.");
  };

  const uploadPhoto = () => {
    if (!selectedFile) {
      setMessage("Take a photo before uploading.");
      setCameraStatus("error");
      return;
    }

    setCameraStatus("uploading");
    setMessage("Saving photo to your report…");
    setTimeout(() => {
      setCameraStatus("success");
      setMessage("Photo captured successfully.");
      onNavigate("civilian-report", { photoCaptured: true });
    }, 500);
  };

  const handlePrimaryAction = () => {
    if (cameraStatus === "uploading") return;
    if (!selectedFile) {
      handleOpenCamera();
      return;
    }
    uploadPhoto();
  };

  const handleRetake = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setCameraStatus("idle");
    setMessage("Use your camera to capture visual evidence.");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    handleOpenCamera();
  };

  const shouldShowError = cameraStatus === "error" && !selectedFile;
  const primaryLabel =
    cameraStatus === "uploading"
      ? "Uploading…"
      : !selectedFile
      ? "Open Camera"
      : cameraStatus === "error"
      ? "Retry Upload"
      : "Upload Photo";

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex flex-col">
      <header className="px-4 py-4 border-b border-white/10 flex items-center gap-3">
        <button
          onClick={() => onNavigate("civilian-report")}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <p className="text-xl font-semibold">Secure Camera Capture</p>
          <p className="text-sm text-white/60">{message}</p>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        <div className="relative w-full max-w-md aspect-[3/4] bg-black rounded-3xl overflow-hidden border border-white/10 flex items-center justify-center">
          {previewUrl ? (
            <img src={previewUrl} alt="Captured preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-3 text-white/70 px-6 text-center">
              <Camera className="w-12 h-12 text-white/60" />
              <p className="text-sm">Tap &ldquo;Open Camera&rdquo; to launch the iPhone camera and snap a photo.</p>
            </div>
          )}
          {shouldShowError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 p-6 text-center">
              <AlertTriangle className="w-10 h-10 text-red-400" />
              <p className="text-sm text-white/80">{message}</p>
              <button
                onClick={handleOpenCamera}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/30 hover:bg-white/20 transition"
              >
                Try Again
              </button>
            </div>
          )}
          {cameraStatus === "uploading" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white/80 text-lg">
              Uploading…
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="w-full max-w-md flex flex-col gap-3">
          <button
            type="button"
            onClick={handlePrimaryAction}
            disabled={cameraStatus === "uploading"}
            className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 text-black text-lg font-semibold transition disabled:opacity-40"
            style={{ backgroundColor: "var(--threat-validated)" }}
          >
            <Camera className="w-5 h-5" />
            {primaryLabel}
          </button>
          <div className="flex items-center justify-between gap-3 text-sm text-white/70">
            <button
              type="button"
              onClick={() => onNavigate("civilian-report")}
              className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRetake}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 transition"
              disabled={cameraStatus === "uploading"}
            >
              <RefreshCw className="w-4 h-4" />
              Retake Photo
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
