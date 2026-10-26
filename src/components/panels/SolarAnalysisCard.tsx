import { useSolarStore } from '../../store/useSolarStore';
import { Sparkles, Loader2, AlertTriangle, CheckCircle2, Info, XCircle, Calendar } from 'lucide-react';
import { MetricCard } from '../ui/MetricCard';

const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function SolarAnalysisCard() {
  const selectedBuildingId = useSolarStore((s) => s.selectedBuildingId);
  const buildings = useSolarStore((s) => s.buildings);
  const analysisResults = useSolarStore((s) => s.analysisResults);
  const analysisStatus = useSolarStore((s) => s.analysisStatus);
  const analysisSuccessMessage = useSolarStore((s) => s.analysisSuccessMessage);
  const analysisErrorMessage = useSolarStore((s) => s.analysisErrorMessage);
  const analysisStaleMessage = useSolarStore((s) => s.analysisStaleMessage);
  const isAnalyzing = useSolarStore((s) => s.isAnalyzing);
  const runAnalysis = useSolarStore((s) => s.runAnalysisForSelectedBuilding);
  const cancelAnalysis = useSolarStore((s) => s.cancelAnalysis);
  const analysisProgress = useSolarStore((s) => s.analysisProgress);
  const annualAnalysisResult = useSolarStore((s) => s.annualAnalysisResult);
  const analysisExecutionTimeMs = useSolarStore((s) => s.analysisExecutionTimeMs);
  const selectedMonth = useSolarStore((s) => s.selectedMonth);
  const setSelectedMonth = useSolarStore((s) => s.setSelectedMonth);
  const setHeatmapMode = useSolarStore((s) => s.setHeatmapMode);

  const building = buildings.find((b) => b.id === selectedBuildingId);
  const analysis = selectedBuildingId ? analysisResults[selectedBuildingId] : undefined;

  if (!building) return null;

  const isAnalyzed = analysisStatus === 'analyzed' && (!!analysis || !!annualAnalysisResult);
  const isStale = analysisStatus === 'stale';
  const isBusy = isAnalyzing || analysisStatus === 'analyzing';

  const suitabilityPercent = analysis && analysis.totalRoofArea > 0
    ? Math.round((analysis.recommendedInstallationArea / analysis.totalRoofArea) * 100)
    : annualAnalysisResult && annualAnalysisResult.totalRoofArea > 0
    ? Math.round((annualAnalysisResult.recommendedArea / annualAnalysisResult.totalRoofArea) * 100)
    : 0;

  // Find max monthly kWh/m² for bar chart scaling
  const maxMonthlyVal = annualAnalysisResult
    ? Math.max(...annualAnalysisResult.monthlyAveragesKWhPerM2, 1)
    : 180;

  return (
    <div className="space-y-3.5">
      {/* Primary Action Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => runAnalysis()}
          disabled={isBusy}
          className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
            isBusy
              ? 'bg-sky-600/50 text-sky-200 cursor-wait'
              : isStale
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25 active:scale-[0.99]'
              : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/20 hover:shadow-sky-500/35 active:scale-[0.99]'
          }`}
        >
          {isBusy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing 12 Months ({analysisProgress}%)...</span>
            </>
          ) : isStale ? (
            <>
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Re-analyze Solar Potential</span>
            </>
          ) : isAnalyzed ? (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Re-run Annual Analysis</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Analyze Solar Potential</span>
            </>
          )}
        </button>

        {isBusy && (
          <button
            onClick={() => cancelAnalysis()}
            title="Cancel running analysis"
            className="py-2.5 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-semibold flex items-center gap-1 transition-all"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        )}
      </div>

      {/* Web Worker Simulation Scanning State */}
      {isBusy && (
        <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-800/60 text-xs space-y-2.5">
          <div className="flex items-center justify-between text-sky-300">
            <span className="font-semibold flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
              Web Worker Solar Simulation
            </span>
            <span className="text-[11px] font-mono font-bold text-sky-400">{analysisProgress}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-150 rounded-full"
              style={{ width: `${Math.max(5, analysisProgress)}%` }}
            />
          </div>

          <p className="text-[11px] text-sky-400/80 leading-relaxed">
            Off-thread raycasting across 12 representative days and clear-sky plane-of-array irradiance models.
          </p>
        </div>
      )}

      {/* Stale Geometry Advisory */}
      {isStale && (
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold text-amber-300">
              {analysisStaleMessage || 'Roof geometry changed — re-analysis required.'}
            </div>
            <p className="text-[11px] text-amber-300/80 leading-relaxed">
              Location or settings changed. Run re-analysis to calculate updated shadow vectors.
            </p>
          </div>
        </div>
      )}

      {/* Success Notification with Execution Time */}
      {isAnalyzed && !isBusy && (
        <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium text-[11px]">
              {analysisSuccessMessage || 'Annual solar potential analyzed successfully.'}
            </span>
          </div>
          {analysisExecutionTimeMs !== null && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
              ⚡ {analysisExecutionTimeMs} ms
            </span>
          )}
        </div>
      )}

      {/* Error Notification */}
      {analysisErrorMessage && (
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-red-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Solar Analysis Error</div>
            <p className="text-[11px] text-red-300 mt-0.5">{analysisErrorMessage}</p>
          </div>
        </div>
      )}

      {/* Not Analyzed Empty Prompt */}
      {!isAnalyzed && !isBusy && !isStale && (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
          <Info className="w-5 h-5 text-sky-400/60 mx-auto" />
          <div className="text-xs font-semibold text-slate-300">
            Run solar analysis to evaluate rooftop exposure.
          </div>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
            Click above to raycast diurnal sun angles, detect parapet & high-rise shadows, and find the highest-yield installation zones.
          </p>
        </div>
      )}

      {/* Analyzed Results */}
      {isAnalyzed && (
        <div className="space-y-3.5">
          {/* Solar Suitability Overview Header */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-300">Rooftop Solar Suitability</span>
                <span className="text-[10px] text-sky-400 font-mono px-1.5 py-0.2 rounded bg-sky-500/10 border border-sky-500/20">
                  Clear-sky estimate
                </span>
              </div>
              <span className="text-sm font-bold font-mono text-emerald-400">
                {suitabilityPercent}% Viable
              </span>
            </div>

            {/* Proportional Stacked Exposure Bar */}
            {analysis && (
              <>
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden flex">
                  <div
                    style={{ width: `${(analysis.excellentArea / analysis.totalRoofArea) * 100}%` }}
                    className="bg-emerald-500 h-full"
                    title={`Excellent: ${analysis.excellentArea} m²`}
                  />
                  <div
                    style={{ width: `${(analysis.goodArea / analysis.totalRoofArea) * 100}%` }}
                    className="bg-amber-500 h-full"
                    title={`Good: ${analysis.goodArea} m²`}
                  />
                  <div
                    style={{ width: `${(analysis.poorArea / analysis.totalRoofArea) * 100}%` }}
                    className="bg-red-500 h-full"
                    title={`Poor/Shaded: ${analysis.poorArea} m²`}
                  />
                  <div
                    style={{ width: `${(analysis.obstacleArea / analysis.totalRoofArea) * 100}%` }}
                    className="bg-slate-600 h-full"
                    title={`Obstacle: ${analysis.obstacleArea} m²`}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    {analysis.excellentArea} m² Exc
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                    {analysis.goodArea} m² Good
                  </span>
                  <span className="flex items-center gap-1 text-red-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                    {analysis.poorArea} m² Shaded
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 inline-block" />
                    {analysis.obstacleArea} m² Obs
                  </span>
                </div>
              </>
            )}
          </div>

          {/* 12-Month Insolation Interactive Mini-Chart */}
          {annualAnalysisResult && (
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  Monthly Solar Insolation (kWh/m²)
                </span>
                <span className="text-[10px] text-amber-300 font-mono font-bold">
                  {MONTH_NAMES_SHORT[selectedMonth]}: {annualAnalysisResult.monthlyAveragesKWhPerM2[selectedMonth]} kWh/m²
                </span>
              </div>

              {/* 12 Month Bar Graph */}
              <div className="flex items-end justify-between gap-1 h-16 pt-2">
                {annualAnalysisResult.monthlyAveragesKWhPerM2.map((kwh, mIdx) => {
                  const barHeight = Math.max(12, Math.round((kwh / maxMonthlyVal) * 100));
                  const isSelected = selectedMonth === mIdx;

                  return (
                    <button
                      key={mIdx}
                      onClick={() => {
                        setSelectedMonth(mIdx);
                        setHeatmapMode('monthly');
                      }}
                      title={`${MONTH_NAMES_SHORT[mIdx]}: ${kwh} kWh/m² (click to view monthly heatmap)`}
                      className="flex-1 flex flex-col items-center gap-1 group transition-all"
                    >
                      <div className="w-full bg-slate-800 rounded-t-sm h-full flex items-end overflow-hidden">
                        <div
                          style={{ height: `${barHeight}%` }}
                          className={`w-full rounded-t-sm transition-all duration-300 ${
                            isSelected
                              ? 'bg-amber-400 shadow-md shadow-amber-400/30'
                              : 'bg-sky-500/60 group-hover:bg-sky-400'
                          }`}
                        />
                      </div>
                      <span
                        className={`text-[9px] font-mono transition-colors ${
                          isSelected ? 'text-amber-300 font-bold' : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      >
                        {MONTH_NAMES_SHORT[mIdx]}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="text-[10px] text-slate-500 text-center font-sans">
                Click any bar to inspect that month on the 3D rooftop heatmap.
              </div>
            </div>
          )}

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 gap-2">
            <MetricCard
              label="Recommended Area"
              value={annualAnalysisResult ? annualAnalysisResult.recommendedArea : (analysis?.recommendedInstallationArea ?? 0)}
              unit="m²"
              subtext="Contiguous unshaded zone"
              variant="success"
            />
            <MetricCard
              label="Annual Insolation"
              value={annualAnalysisResult ? annualAnalysisResult.averageAnnualKWhPerM2 : '--'}
              unit={annualAnalysisResult ? 'kWh/m²' : ''}
              subtext="Clear-sky estimate"
              variant="highlight"
            />
            <MetricCard
              label="Avg Exposure Score"
              value={
                annualAnalysisResult
                  ? `${Math.round(annualAnalysisResult.averageAnnualExposure * 100)}%`
                  : analysis
                  ? `${Math.round(analysis.averageExposureScore * 100)}%`
                  : '--'
              }
              subtext="12-month daylight factor"
              variant="highlight"
            />
            <MetricCard
              label="Obstacle Footprint"
              value={annualAnalysisResult ? annualAnalysisResult.obstacleArea : (analysis?.obstacleArea ?? 0)}
              unit="m²"
              subtext="Physical HVAC & tanks"
              variant="default"
            />
          </div>

          {/* Contiguous Zone Details */}
          {analysis?.recommendedZone && (
            <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-800/40 text-xs text-sky-200">
              <div className="font-semibold flex items-center justify-between">
                <span>Best Contiguous Placement Zone</span>
                <span className="font-mono text-sky-400">{analysis.recommendedZone.area} m²</span>
              </div>
              <p className="text-[11px] text-sky-300/80 mt-1">
                Identified rectangular zone ({analysis.recommendedZone.width}m × {analysis.recommendedZone.length}m) with average {(analysis.recommendedZone.avgExposure * 100).toFixed(0)}% solar exposure unblocked by obstacles.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
