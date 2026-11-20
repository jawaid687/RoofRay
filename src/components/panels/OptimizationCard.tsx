import { useSolarStore } from '../../store/useSolarStore';
import { useLanguage } from '../../i18n/useLanguage';
import { OptimizationMode } from '../../types';
import { Target, Zap, DollarSign, Scale, Sparkles, Loader2, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export function OptimizationCard() {
  const { t } = useLanguage();
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
      title: t.optimization.meetDemand,
      description: t.optimization.meetDemandDesc,
      icon: Target,
      badge: t.optimization.badges.demandMatch,
    },
    {
      id: 'max_generation',
      title: t.optimization.maxGeneration,
      description: t.optimization.maxGenerationDesc,
      icon: Zap,
      badge: t.optimization.badges.maxYield,
    },
    {
      id: 'lowest_cost',
      title: t.optimization.lowestCost,
      description: t.optimization.lowestCostDesc,
      icon: DollarSign,
      badge: t.optimization.badges.budgetCapex,
    },
    {
      id: 'balanced',
      title: t.optimization.balanced,
      description: t.optimization.balancedDesc,
      icon: Scale,
      badge: t.optimization.badges.recommended,
    },
  ];

  return (
    <div className="space-y-3.5">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>{t.optimization.mode}</span>
          <span className="text-[10px] text-amber-400 font-mono">Strategy</span>
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
              {t.optimization.prerequisiteTitle}
            </span>
            <p className="text-[11px] text-amber-400/80 leading-relaxed">
              {t.optimization.prerequisiteDesc}
            </p>
          </div>
        </div>
      )}

      {/* Outdated Layout Warning */}
      {isOutdated && isAnalysisReady && (
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">{t.optimization.outdatedTitle}</span>
            <p className="text-[11px] text-amber-300/80 leading-relaxed">
              {t.optimization.outdatedDesc}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {layoutErrorMessage && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{layoutErrorMessage}</span>
        </div>
      )}

      {/* Primary Generation Action Button */}
      <button
        onClick={() => generateSolarLayout()}
        disabled={!isAnalysisReady || isGenerating}
        className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
          !isAnalysisReady
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            : isGenerating
            ? 'bg-sky-600/50 text-sky-200 cursor-wait'
            : isOutdated
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25 active:scale-[0.99]'
            : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/30 hover:shadow-amber-500/40 active:scale-[0.99]'
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-sky-300" />
            <span>{t.optimization.optimizing}</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>
              {isGenerated
                ? isOutdated
                  ? t.optimization.regenerateLayout
                  : t.optimization.reoptimizeLayout
                : t.optimization.runOptimization}
            </span>
          </>
        )}
      </button>

      {/* Success Feedback Summary */}
      {isGenerated && !isGenerating && (
        <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/50 text-xs text-emerald-300 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{t.optimization.layoutGeneratedSuccess}</span>
          </div>
          {layoutFeedback && (
            <p className="text-[11px] text-emerald-300/80 leading-relaxed pl-5.5">
              {layoutFeedback}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
