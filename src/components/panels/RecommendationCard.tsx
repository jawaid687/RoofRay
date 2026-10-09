import { useSolarStore } from '../../store/useSolarStore';
import { CheckCircle2, AlertOctagon, Cpu, Lightbulb, HelpCircle, Building2, AlertTriangle } from 'lucide-react';

interface RecommendationCardProps {
  onNavigateToPlanner?: () => void;
}

export function RecommendationCard({ onNavigateToPlanner }: RecommendationCardProps) {
  const recommendation = useSolarStore((s) => s.solarRecommendation);
  const placedPanels = useSolarStore((s) => s.placedPanels);
  const layoutStatus = useSolarStore((s) => s.layoutStatus);
  const analysisStatus = useSolarStore((s) => s.analysisStatus);

  const hasPanels = placedPanels.length > 0 && !!recommendation && analysisStatus === 'analyzed';
  const isOutdated = layoutStatus === 'outdated';

  // Empty state when no solar plan has been generated yet
  if (!hasPanels) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <HelpCircle className="w-6 h-6 text-emerald-400" />
        </div>
        <div className="space-y-1.5">
          <h4 className="text-sm font-bold text-white">No solar plan has been generated yet</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Analyze the rooftop and generate a solar layout to see why RoofRay recommends the configuration.
          </p>
        </div>
        {onNavigateToPlanner && (
          <button
            onClick={onNavigateToPlanner}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Go to Rooftop Planner</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {/* Outdated Notice if settings changed */}
      {isOutdated && (
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-amber-300">Rationale Reflects Previous Layout</span>
            <p className="text-[11px] text-amber-300/80 leading-relaxed">
              Optimization settings or building dimensions were modified. Regenerate in Rooftop Planner to update the technical rationale.
            </p>
          </div>
        </div>
      )}

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
