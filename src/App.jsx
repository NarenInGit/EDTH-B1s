import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { CivilianReport } from "./pages/CivilianReport";
import { CameraCapture } from "./pages/CameraCapture";
import { ReportConfirmation } from "./pages/ReportConfirmation";
import { HeatmapView } from "./pages/HeatmapView";
import { PitchScreens } from "./pages/PitchScreens";
import NewsScreen from "./screens/Learn/News";
import { HelpRequest } from "./pages/HelpRequest";
import Heatmap2 from "./pages/Heatmap2";

const SCREEN_ROUTE_MAP = {
  landing: "/",
  "civilian-report": "/report",
  "report-confirmation": "/report/confirmation",
  "command-dashboard": "/dashboard",
  heatmap: "/dashboard",
  pitch: "/pitch",
  "camera-capture": "/report/capture",
  learn: "/learn",
  help: "/help",
  "heatmap-2": "/heatmap2",
};

function AppLayout() {
  const [navigationData, setNavigationData] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [reportDraft, setReportDraft] = useState({
    selectedThreat: null,
    direction: "",
    description: "",
  });
  const navigate = useNavigate();

  const handleNavigate = (screen, data) => {
    const nextRoute = SCREEN_ROUTE_MAP[screen] || SCREEN_ROUTE_MAP.landing;
    if (data) {
      setNavigationData(data);
    }
    navigate(nextRoute);
  };

  return (
    <div className="dark min-h-screen bg-[#0a0a0a] text-white">
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              onNavigate={handleNavigate}
              userLocation={userLocation}
              onLocationUpdate={setUserLocation}
            />
          }
        />
        <Route
          path="/report"
          element={
            <CivilianReport
              onNavigate={handleNavigate}
              userLocation={userLocation}
              navigationData={navigationData}
              onClearNavigationData={() => setNavigationData({})}
              draft={reportDraft}
              onDraftChange={setReportDraft}
            />
          }
        />
        <Route
          path="/report/capture"
          element={
            <CameraCapture
              onNavigate={handleNavigate}
            />
          }
        />
        <Route
          path="/report/confirmation"
          element={
            <ReportConfirmation
              onNavigate={handleNavigate}
              reportId={navigationData.reportId}
            />
          }
        />
        <Route
          path="/dashboard"
          element={<HeatmapView onNavigate={handleNavigate} />}
        />
        <Route path="/heatmap2" element={<Heatmap2 onNavigate={handleNavigate} />} />
        <Route
          path="/pitch"
          element={<PitchScreens onNavigate={handleNavigate} />}
        />
        <Route path="/learn" element={<NewsScreen />} />
        <Route
          path="/help"
          element={
            <HelpRequest
              onNavigate={handleNavigate}
              userLocation={userLocation}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
