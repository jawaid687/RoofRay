import { useSolarStore } from '../../store/useSolarStore';
import { CheckCircle2, AlertOctagon, Cpu, Lightbulb } from 'lucide-react';

export function RecommendationCard() {
  const recommendation = useSolarStore((s) => s.getSolarRecommendation());

  if (!recommendation) {
    return null;
  }

  return (
    <div className="space-y-3.5">
      <div className="p-4 rounded-xl bg-gradient-to-b from-sky-950/40 to-slate-900/60 border border-sky-800/40 space-y-3">
        {/* Title */}
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
          <h3 className="text-xs font-bold text-sky-200 uppercase tracking-wider font-mono">
            System Recommendation & Rationale
          </h3>
        </div>

        {/* Headline */}
        <div className="text-sm font-bold text-white tracking-tight leading-snug">
          {recommendation.headline}
        </div>

        {/* Narrative */}
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {recommendation.narrative}
        </p>

        {/* Why this recommendation section */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <div className="text-[11px] font-semibold text-slate-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Key Selection Factors</span>
          </div>
          <ul className="space-y-1.5 pl-1">
            {recommendation.keyPoints.map((point, i) => (
              <li key={i} className="text-[11px] text-slate-300 flex items-start gap-2">
                <span className="text-emerald-400 text-xs leading-none">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Spatial Exclusions (Shade & Obstacle explainability) */}
        {recommendation.exclusions.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <div className="text-[11px] font-semibold text-slate-200 flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Spatial Exclusions & Shading Analysis</span>
            </div>
            <ul className="space-y-1.5 pl-1">
              {recommendation.exclusions.map((exclusion, i) => (
                <li key={i} className="text-[11px] text-slate-300/90 flex items-start gap-2">
                  <span className="text-amber-400 text-xs leading-none">•</span>
                  <span>{exclusion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Technical Highlights */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <div className="text-[11px] font-semibold text-slate-200 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>Installation Specifications & Compliance</span>
          </div>
          <ul className="space-y-1.5 pl-1">
            {recommendation.technicalHighlights.map((tech, i) => (
              <li key={i} className="text-[11px] text-slate-400 flex items-start gap-2">
                <span className="text-sky-400 text-xs leading-none">•</span>
                <span>{tech}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
