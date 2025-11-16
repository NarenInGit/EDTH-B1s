import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpenCheck, Radar, ShieldCheck, Stethoscope } from "lucide-react";
import NewsCard from "../../components/NewsCard";

export interface NewsItem {
  id: string;
  level: "LOW" | "MEDIUM" | "HIGH";
  time: string;
  title: string;
  description: string;
  region: "local" | "national";
}

const mockNews: NewsItem[] = [
  {
    id: "1",
    level: "HIGH",
    time: "12 minutes ago",
    title: "Air defense activity detected near Kyiv outskirts",
    description:
      "Civilians reported multiple interceptor launches. Authorities advise remaining indoors until sirens stop.",
    region: "local",
  },
  {
    id: "2",
    level: "MEDIUM",
    time: "38 minutes ago",
    title: "Checkpoint delays reported on Highway M06",
    description: "Expect longer travel times due to heightened inspections. Essential travel only is recommended.",
    region: "local",
  },
  {
    id: "3",
    level: "LOW",
    time: "1 hour ago",
    title: "National shelter network status update",
    description: "All shelters remain operational with medical supplies replenished for the next 72 hours.",
    region: "national",
  },
  {
    id: "4",
    level: "MEDIUM",
    time: "2 hours ago",
    title: "Evacuation corridor confirmed for eastern districts",
    description:
      "Humanitarian corridor opens tomorrow at 09:00 with military escort. Carry ID and essential documents.",
    region: "national",
  },
];

async function fetchNewsItems(): Promise<NewsItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockNews;
}

const SECTION_ORDER = ["news", "recognize", "regions", "firstAid"] as const;

export function NewsScreen() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [activeSection, setActiveSection] = useState<(typeof SECTION_ORDER)[number]>("news");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    fetchNewsItems()
      .then((items) => {
        if (mounted) {
          setNews(items);
        }
      })
      .finally(() => mounted && setLoadingNews(false));
    return () => {
      mounted = false;
    };
  }, []);

  const localNews = useMemo(() => news.filter((item) => item.region === "local"), [news]);
  const nationalNews = useMemo(() => news.filter((item) => item.region === "national"), [news]);

  const sectionButtons = [
    { id: "news", label: "News & Updates", icon: BookOpenCheck },
    { id: "recognize", label: "Recognize Drones & Weapons", icon: Radar },
    { id: "regions", label: "Understand Region Threat Level", icon: ShieldCheck },
    { id: "firstAid", label: "First Aid Hub", icon: Stethoscope },
  ] as const;

  const renderNewsSection = () => (
    <>
      <SectionHeading title="Your Area (100km)" />
      <SectionList loading={loadingNews}>
        {localNews.map((item) => (
          <NewsCard key={item.id} level={item.level} time={item.time} title={item.title} description={item.description} />
        ))}
      </SectionList>
      <SectionHeading title="National Updates" />
      <SectionList loading={loadingNews}>
        {nationalNews.map((item) => (
          <NewsCard key={item.id} level={item.level} time={item.time} title={item.title} description={item.description} />
        ))}
      </SectionList>
    </>
  );

  const renderRecognitionSection = () => (
    <div className="space-y-4">
      <p className="text-white/70 text-sm leading-relaxed">
        Quick visual cues to help you distinguish between civilian aircraft, drones, and weapon systems. Report anything suspicious.
      </p>
      <div className="space-y-3">
        {[
          { title: "Micro Drones", details: "Foldable arms, blinking nav lights, audible buzzing under 30m altitude." },
          { title: "Fixed-Wing UAV", details: "Glider-like silhouette, single prop tail, persistent contrails at high altitude." },
          { title: "Ground Weapons", details: "Tripod setups with thermal scopes, improvised launch tubes, or concealed mortar bases." },
        ].map((item) => (
          <InfoCard key={item.title} title={item.title} description={item.details} />
        ))}
      </div>
    </div>
  );

  const renderRegionSection = () => (
    <div className="space-y-4">
      <p className="text-white/70 text-sm leading-relaxed">
        Regional threat scores combine validated reports, sensor grids, and civilian check-ins updated hourly.
      </p>
      <div className="grid gap-3">
        {[
          { region: "Kyiv Oblast", level: "High", detail: "Increased interceptor launches and troop movements east of river." },
          { region: "Lviv Corridor", level: "Low", detail: "Logistics lanes stable. Occasional signal disruptions only." },
          { region: "Black Sea Coast", level: "Medium", detail: "Naval drone alerts overnight. Ports remain on guarded status." },
        ].map((item) => (
          <RegionCard key={item.region} {...item} />
        ))}
      </div>
    </div>
  );

  const renderFirstAidSection = () => (
    <div className="space-y-4">
      <p className="text-white/70 text-sm leading-relaxed">
        Keep these rapid-response steps in mind before responders arrive. Always prioritize personal safety.
      </p>
      <ol className="space-y-4 text-sm text-white/80">
        {[
          { title: "Check breathing:", detail: "If unconscious and not breathing, begin CPR with 30 compressions." },
          { title: "Control bleeding:", detail: "Apply direct pressure using fabric. Use a tourniquet for severe limb wounds." },
          { title: "Stabilize fractures:", detail: "Immobilize using makeshift splints (sticks, boards, rigid fabric)." },
          { title: "Heat exposure:", detail: "Move casualty to shade, provide sips of water, loosen clothing layers." },
        ].map((item, idx) => (
          <li key={idx} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <span className="font-semibold text-white">{idx + 1}. {item.title}</span>
            <p className="text-white/70 mt-1">{item.detail}</p>
          </li>
        ))}
      </ol>
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-sm text-emerald-100 leading-relaxed">
        <strong className="block mb-2">📥 Download the offline aid kit:</strong> 
        Includes printable checklists, bandage improvisation tips, and trauma hotline QR codes.
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case "news":
        return renderNewsSection();
      case "recognize":
        return renderRecognitionSection();
      case "regions":
        return renderRegionSection();
      case "firstAid":
        return renderFirstAidSection();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white">
      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-8 pt-6 pb-8 bg-gradient-to-b from-[#0f1419] to-transparent border-b border-white/10">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Title Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Civic Readiness Hub</h1>
          <p className="text-white/60 text-sm">Guides for staying informed, spotting threats, and helping neighbors.</p>
        </div>

        {/* Section Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {sectionButtons.map(({ id, label, icon: Icon }) => {
            const active = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`flex flex-col items-start justify-between rounded-2xl p-4 text-left transition-all border ${
                  active 
                    ? "bg-white/10 border-white/20 shadow-lg" 
                    : "bg-white/5 border-white/10 hover:bg-white/8"
                }`}
              >
                <Icon className={`w-6 h-6 mb-3 ${active ? "text-cyan-400" : "text-white/60"}`} />
                <p className={`font-semibold text-sm leading-tight ${active ? "text-white" : "text-white/70"}`}>
                  {label}
                </p>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {renderActiveSection()}
      </main>
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold text-white mb-1">{title}</h2>
      <div className="h-0.5 w-16 bg-gradient-to-r from-cyan-400 to-transparent rounded-full" />
    </div>
  );
}

function SectionList({ children, loading }: { children: React.ReactNode; loading: boolean }) {
  if (loading) {
    return (
      <div className="text-center text-white/60 text-sm py-8 rounded-2xl border border-white/10 bg-white/5">
        Loading latest intel…
      </div>
    );
  }
  return (
    <div className="space-y-3 mb-8">
      {children}
    </div>
  );
}

function InfoCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 p-5 shadow-lg">
      <h3 className="font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/70 leading-relaxed">{description}</p>
    </div>
  );
}

function RegionCard({ region, level, detail }: { region: string; level: string; detail: string }) {
  const colorScheme =
    level === "High" 
      ? { bg: "from-red-500/10 to-orange-500/5", border: "border-red-400/30", badge: "bg-red-500/30 text-red-200" }
      : level === "Medium" 
      ? { bg: "from-yellow-500/10 to-orange-500/5", border: "border-yellow-400/30", badge: "bg-yellow-500/30 text-yellow-100" }
      : { bg: "from-emerald-500/10 to-green-500/5", border: "border-emerald-400/30", badge: "bg-emerald-500/20 text-emerald-100" };

  return (
    <div className={`rounded-2xl border ${colorScheme.border} bg-gradient-to-br ${colorScheme.bg} p-5 shadow-lg`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold">{region}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorScheme.badge}`}>
          {level} Risk
        </span>
      </div>
      <p className="text-sm text-white/70 leading-relaxed">{detail}</p>
    </div>
  );
}

export default NewsScreen;