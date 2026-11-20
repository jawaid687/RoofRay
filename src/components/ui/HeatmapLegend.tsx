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
    <div data-tour="heatmap-legend" className="absolute top-16 left-4 z-10 glass-panel bg-[#0c1424]/95 rounded-xl p-3 text-xs text-slate-200 pointer-events-auto shadow-xl border border-slate-800 backdrop-blur-md max-w-[260px]">
      <div className="font-semibold text-slate-200 mb-2 flex items-center justify-between gap-4">
        <span>
          {heatmapMode === 'live'
            ? t.heatmapLegend.liveShadingPass
            : heatmapMode === 'monthly'
            ? `${monthName} ${t.heatmapLegend.insolation}`
            : t.heatmapLegend.annualExposure}
        </span>
        <span className="text-[10px] text-amber-400 font-mono">
          {heatmapMode === 'live' ? t.heatmapLegend.instantRaycast : t.heatmapLegend.clearSkyEstimate}
        </span>
      </div>

      {heatmapMode === 'live' ? (
        <div className="space-y-1.5 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400"></span>
            <span className="text-slate-300 font-sans">{t.heatmapLegend.litBySun}</span>
            <span className="text-emerald-400 ml-auto font-mono text-[10px]">
              {liveShading ? `${liveShading.litCellsCount} cells` : 'Unobstructed'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
            <span className="text-slate-300 font-sans">{t.heatmapLegend.inShadow}</span>
            <span className="text-rose-400 ml-auto font-mono text-[10px]">
              {liveShading ? `${liveShading.shadedCellsCount} cells` : 'Occluded'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-600 border border-slate-500"></span>
            <span className="text-slate-300 font-sans">{t.heatmapLegend.rooftopObstacle}</span>
            <span className="text-slate-400 ml-auto font-mono text-[10px]">{t.heatmapLegend.blocked}</span>
          </div>
        </div>
      ) : heatmapMode === 'monthly' ? (
        <div className="space-y-2 font-mono text-[11px]">
          <div className="text-[11px] text-slate-300 flex items-center justify-between font-sans">
            <span>{t.heatmapLegend.monthlyAvg}:</span>
            <span className="font-bold text-amber-300 font-mono">
              {annualAnalysisResult
                ? `${annualAnalysisResult.monthlyAveragesKWhPerM2[selectedMonth]} kWh/m²`
                : t.heatmapLegend.runAnalysis}
            </span>
          </div>

          {/* Continuous Insolation Color Gradient Bar */}
          <div className="space-y-1">
            <div className="w-full h-2.5 rounded bg-gradient-to-r from-[#1e1b4b] via-[#0284c7] via-50% via-[#f59e0b] to-[#fef08a] border border-slate-700/60" />
            <div className="flex justify-between text-[9px] text-slate-400 font-sans">
              <span>{t.heatmapLegend.shadedLow}</span>
              <span>{t.heatmapLegend.moderate}</span>
              <span>{t.heatmapLegend.peakSun}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-600 border border-slate-500"></span>
            <span className="text-slate-300 font-sans">{t.heatmapLegend.rooftopObstacle}</span>
            <span className="text-slate-400 ml-auto font-mono text-[10px]">{t.heatmapLegend.blocked}</span>
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
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400"></span>
            <span className="text-slate-300 font-sans">{t.heatmapLegend.excellentExposure}</span>
            <span className="text-slate-400 ml-auto font-mono text-[10px]">≥ 80%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400"></span>
            <span className="text-slate-300 font-sans">{t.heatmapLegend.goodExposure}</span>
            <span className="text-slate-400 ml-auto font-mono text-[10px]">60–79%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
            <span className="text-slate-300 font-sans">{t.heatmapLegend.poorShaded}</span>
            <span className="text-slate-400 ml-auto font-mono text-[10px]">&lt; 60%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-600 border border-slate-500"></span>
            <span className="text-slate-300 font-sans">{t.heatmapLegend.obstacleZone}</span>
            <span className="text-slate-400 ml-auto font-mono text-[10px]">{t.heatmapLegend.blocked}</span>
          </div>

          <div className="pt-1.5 border-t border-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm border border-sky-400 bg-sky-500/20"></span>
            <span className="text-sky-300 font-sans text-[11px]">{t.heatmapLegend.recommendedZone}</span>
          </div>
        </div>
      )}
    </div>
  );
}
