import { useSolarStore } from '../../store/useSolarStore';
import { useLanguage } from '../../i18n/useLanguage';

export function HeatmapLegend() {
  const { t } = useLanguage();
  const showHeatmap = useSolarStore((s) => s.showHeatmap);
  const selectedBuildingId = useSolarStore((s) => s.selectedBuildingId);
  const heatmapMode = useSolarStore((s) => s.heatmapMode);
  const liveShading = useSolarStore((s) => s.liveShading);
  const annualAnalysisResult = useSolarStore((s) => s.annualAnalysisResult);
  const selectedMonth = useSolarStore((s) => s.selectedMonth);

  if (!showHeatmap || !selectedBuildingId) return null;

  const monthName = t.locationTime?.monthNames?.[selectedMonth] || 'Month';

  return (
    <div data-tour="heatmap-legend" className="absolute top-20 left-4 z-10 glass-panel rounded-xl p-3 text-xs text-slate-200 pointer-events-auto shadow-2xl border border-slate-700/50 backdrop-blur-md max-w-[260px]">
      <div className="font-semibold text-slate-300 mb-2 flex items-center justify-between gap-4">
        <span>
          {heatmapMode === 'live'
            ? t.heatmapLegend.liveShadingPass
            : heatmapMode === 'monthly'
            ? `${monthName} ${t.heatmapLegend.insolation}`
            : t.heatmapLegend.annualExposure}
        </span>
        <span className="text-[10px] text-sky-400 font-mono">
          {heatmapMode === 'live' ? t.heatmapLegend.instantRaycast : t.heatmapLegend.clearSkyEstimate}
        </span>
      </div>

      {heatmapMode === 'live' ? (
        <div className="space-y-1.5 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
            <span className="text-slate-300">{t.heatmapLegend.litBySun}</span>
            <span className="text-emerald-400 ml-auto font-sans">
              {liveShading ? `${liveShading.litCellsCount} cells` : 'Unobstructed'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-red-500 shadow-sm shadow-red-500/50"></span>
            <span className="text-slate-300">{t.heatmapLegend.inShadow}</span>
            <span className="text-red-400 ml-auto font-sans">
              {liveShading ? `${liveShading.shadedCellsCount} cells` : 'Occluded'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-slate-600 border border-slate-500"></span>
            <span className="text-slate-300">{t.heatmapLegend.rooftopObstacle}</span>
            <span className="text-slate-400 ml-auto font-sans">{t.heatmapLegend.blocked}</span>
          </div>
        </div>
      ) : heatmapMode === 'monthly' ? (
        <div className="space-y-2 font-mono text-[11px]">
          <div className="text-[11px] text-slate-300 flex items-center justify-between">
            <span>{t.heatmapLegend.monthlyAvg}:</span>
            <span className="font-bold text-amber-300 font-sans">
              {annualAnalysisResult
                ? `${annualAnalysisResult.monthlyAveragesKWhPerM2[selectedMonth]} kWh/m²`
                : t.heatmapLegend.runAnalysis}
            </span>
          </div>

          {/* Continuous Insolation Color Gradient Bar */}
          <div className="space-y-1">
            <div className="w-full h-3 rounded-md bg-gradient-to-r from-[#1e1b4b] via-[#0284c7] via-50% via-[#f59e0b] to-[#fef08a] border border-slate-700/60 shadow-inner" />
            <div className="flex justify-between text-[9px] text-slate-400 font-sans">
              <span>{t.heatmapLegend.shadedLow}</span>
              <span>{t.heatmapLegend.moderate}</span>
              <span>{t.heatmapLegend.peakSun}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
            <span className="w-3 h-3 rounded bg-slate-600 border border-slate-500"></span>
            <span className="text-slate-300">{t.heatmapLegend.rooftopObstacle}</span>
            <span className="text-slate-400 ml-auto font-sans">{t.heatmapLegend.blocked}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5 font-mono text-[11px]">
          {annualAnalysisResult && (
            <div className="text-[10px] text-slate-400 flex items-center justify-between pb-1 mb-1 border-b border-slate-800 font-sans">
              <span>{t.heatmapLegend.annualAverage}:</span>
              <span className="font-bold text-sky-300 font-mono">
                {annualAnalysisResult.averageAnnualKWhPerM2} kWh/m²/yr
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
            <span className="text-slate-300">{t.heatmapLegend.excellentExposure}</span>
            <span className="text-slate-400 ml-auto font-sans">≥ 80%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-amber-500 shadow-sm shadow-amber-500/50"></span>
            <span className="text-slate-300">{t.heatmapLegend.goodExposure}</span>
            <span className="text-slate-400 ml-auto font-sans">60–79%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-red-500 shadow-sm shadow-red-500/50"></span>
            <span className="text-slate-300">{t.heatmapLegend.poorShaded}</span>
            <span className="text-slate-400 ml-auto font-sans">&lt; 60%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-slate-600 border border-slate-500"></span>
            <span className="text-slate-300">{t.heatmapLegend.obstacleZone}</span>
            <span className="text-slate-400 ml-auto font-sans">{t.heatmapLegend.blocked}</span>
          </div>

          <div className="pt-1.5 border-t border-slate-800 flex items-center gap-2">
            <span className="w-3 h-3 rounded border border-sky-400 bg-sky-500/20"></span>
            <span className="text-sky-300 font-sans text-[11px]">{t.heatmapLegend.recommendedZone}</span>
          </div>
        </div>
      )}
    </div>
  );
}
