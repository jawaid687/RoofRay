import { useSolarStore } from '../../store/useSolarStore';
import { OptimizationMode } from '../../types';
import { Target, Zap, DollarSign, Scale, Sparkles, Loader2, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export function OptimizationCard() {
  const optimizationMode = useSolarStore((s) => s.optimizationMode);
  const setOptimizationMode = useSolarStore((s) => s.setOptimizationMode);
  const generateSolarLayout = useSolarStore((s) => s.generateSolarLayout);
  const layoutStatus = useSolarStore((s) => s.layoutStatus);
  const layoutFeedback = useSolarStore((s) => s.layoutFeedback);
  const layoutErrorMessage = useSolarStore((s) => s.layoutErrorMessage);
  const analysisStatus = useSolarStore((s) => s.analysisStatus);
  const placedPanels = useSolarStore((s) => s.placedPanels);

  const isAnalysisReady = analysisStatus === 'analyzed';
  const isGenerating = layoutStatus === 'generating';
  const isGenerated = layoutStatus === 'generated' && placedPanels.length > 0;
  const isOutdated = layoutStatus === 'outdated';

  const modes: {
    id: OptimizationMode;
    title: string;
    description: string;
    icon: typeof Target;
    badge: string;
  }[] = [
    {
      id: 'need',
      title: 'Meet My Electricity Need',
      description: 'Sizes system to match ~100% of demand without oversizing excess export.',
      icon: Target,
      badge: 'Demand Match',
    },
    {
      id: 'max_generation',
      title: 'Maximum Solar Generation',
      description: 'Maximizes panel density on all unshaded roof cells for peak power yield.',
      icon: Zap,
      badge: 'Max Yield',
    },
    {
      id: 'lowest_cost',
      title: 'Lowest Initial Cost',
      description: 'Deploys a compact array covering baseline daytime load with low upfront cost.',
      icon: DollarSign,
      badge: 'Budget Capex',
    },
    {
      id: 'balanced',
      title: 'Best Value / Balanced',
      description: 'Optimal 85–95% demand coverage balancing ROI, roof quality, and payback.',
      icon: Scale,
      badge: 'Recommended',
    },
  ];

  return (
    <div className="space-y-3.5">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>Optimization Objective</span>
          <span className="text-[10px] text-amber-400 font-mono">Select Strategy</span>
        </label>

        <div className="space-y-2">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = optimizationMode === mode.id;

            return (
              <div
                key={mode.id}
                onClick={() => setOptimizationMode(mode.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-sky-400 bg-sky-950/40 shadow-md shadow-sky-500/10'
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`w-4 h-4 ${
                        isSelected ? 'text-sky-400' : 'text-slate-400'
                      }`}
                    />
                    <span className="text-xs font-bold text-white">{mode.title}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {mode.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pl-6">{mode.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prerequisite Check Banner if Analysis Not Done */}
      {!isAnalysisReady && (
        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/50 text-xs text-amber-300 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold">
              Analyze the rooftop before generating a solar layout.
            </span>
            <p className="text-[11px] text-amber-400/80 leading-relaxed">
              Raycast solar exposure metrics are required to determine optimal panel placement and exclude shaded roof zones.
            </p>
          </div>
        </div>
      )}

      {/* Outdated Layout Warning */}
      {isOutdated && isAnalysisReady && (
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Settings or geometry changed — layout outdated.</span>
            <p className="text-[11px] text-amber-300/80 leading-relaxed">
              Click Regenerate Solar Layout to update 3D panel placement and recalculated economics.
            </p>
          </div>
        </div>
      )}

      {/* Success Result Banner */}
      {isGenerated && layoutFeedback && !isOutdated && (
        <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium text-[11px]">{layoutFeedback}</span>
        </div>
      )}

      {/* Error Banner */}
      {layoutErrorMessage && (
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Layout Placement Notice</div>
            <p className="text-[11px] text-red-300 mt-0.5">{layoutErrorMessage}</p>
          </div>
        </div>
      )}

      {/* CTA Button */}
      <button
        onClick={() => generateSolarLayout()}
        disabled={isGenerating || !isAnalysisReady}
        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
          !isAnalysisReady
            ? 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-slate-700/50'
            : isGenerating
            ? 'bg-amber-600/50 text-amber-200 cursor-wait'
            : isOutdated
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25 active:scale-[0.99]'
            : isGenerated
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 active:scale-[0.99]'
            : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 active:scale-[0.99]'
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating Solar Layout...</span>
          </>
        ) : isOutdated ? (
          <>
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Regenerate Solar Layout</span>
          </>
        ) : isGenerated ? (
          <>
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Regenerate Solar Layout</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Generate Solar Layout</span>
          </>
        )}
      </button>
    </div>
  );
}
