import { useSolarStore } from '../../store/useSolarStore';
import { Sparkles } from 'lucide-react';
import { MetricCard } from '../ui/MetricCard';

export function SolarAnalysisCard() {
  const analysis = useSolarStore((s) => s.getCurrentAnalysis());
  const isAnalyzing = useSolarStore((s) => s.isAnalyzing);
  const runAnalysis = useSolarStore((s) => s.runAnalysisForSelectedBuilding);
  const building = useSolarStore((s) => s.getSelectedBuilding());

  if (!building) return null;

  const suitabilityPercent = analysis && analysis.totalRoofArea > 0
    ? Math.round((analysis.recommendedInstallationArea / analysis.totalRoofArea) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Primary Action Button */}
      <button
        onClick={runAnalysis}
        disabled={isAnalyzing}
        className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
          isAnalyzing
            ? 'bg-sky-600/50 text-sky-200 cursor-wait'
            : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/20 hover:shadow-sky-500/35 active:scale-[0.99]'
        }`}
      >
        <Sparkles className="w-4 h-4" />
        <span>{isAnalyzing ? 'Simulating Raycast Shadows...' : 'Analyze Solar Potential'}</span>
      </button>

      {analysis && (
        <div className="space-y-3.5">
          {/* Solar Suitability Overview Header */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">Rooftop Solar Suitability</span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                {suitabilityPercent}% Viable
              </span>
            </div>

            {/* Proportional Stacked Exposure Bar */}
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

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-2">
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
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 gap-2">
            <MetricCard
              label="Recommended Area"
              value={analysis.recommendedInstallationArea}
              unit="m²"
              subtext="Contiguous unshaded zone"
              variant="success"
            />
            <MetricCard
              label="Obstacle Footprint"
              value={analysis.obstacleArea}
              unit="m²"
              subtext="Physical HVAC & tanks"
              variant="default"
            />
            <MetricCard
              label="Avg Exposure Score"
              value={`${Math.round(analysis.averageExposureScore * 100)}%`}
              subtext="Diurnal daylight factor"
              variant="highlight"
            />
            <MetricCard
              label="Shaded Perimeter"
              value={analysis.poorArea}
              unit="m²"
              subtext="Excluded low sun angles"
              variant="default"
            />
          </div>

          {/* Contiguous Zone Details */}
          {analysis.recommendedZone && (
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
