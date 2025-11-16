import React from "react";

type ThreatLevel = "LOW" | "MEDIUM" | "HIGH";

interface NewsCardProps {
  level: ThreatLevel;
  time: string;
  title: string;
  description: string;
}

const LEVEL_STYLES: Record<ThreatLevel, { label: string; chip: string; dot: string }> = {
  LOW: {
    label: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    chip: "bg-emerald-500/20",
    dot: "bg-emerald-400",
  },
  MEDIUM: {
    label: "bg-amber-500/15 text-amber-200 border border-amber-400/30",
    chip: "bg-amber-500/20",
    dot: "bg-amber-400",
  },
  HIGH: {
    label: "bg-rose-500/20 text-rose-200 border border-rose-500/40",
    chip: "bg-rose-500/30",
    dot: "bg-rose-400",
  },
};

export function NewsCard({ level, time, title, description }: NewsCardProps) {
  const levelStyles = LEVEL_STYLES[level];

  return (
    <article
      className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 via-white/5 to-transparent p-4 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-sm transition hover:border-white/10"
      aria-label={title}
    >
      <div className="flex items-center justify-between text-xs mb-3">
        <span
          className={`px-3 py-1 rounded-full uppercase tracking-wide font-semibold text-[10px] ${levelStyles.label}`}
        >
          {level} RISK
        </span>
        <div className="flex items-center gap-2 text-white/70">
          <span className={`inline-block h-2 w-2 rounded-full ${levelStyles.dot}`} />
          {time}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/70 leading-relaxed">{description}</p>
    </article>
  );
}

export default NewsCard;
