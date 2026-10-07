import { useSolarStore } from '../../store/useSolarStore';

export function HeatmapLegend() {
  const showHeatmap = useSolarStore((s) => s.showHeatmap);
  const selectedBuildingId = useSolarStore((s) => s.selectedBuildingId);

  if (!showHeatmap || !selectedBuildingId) return null;

  return (
    <div className="absolute top-20 left-4 z-10 glass-panel rounded-xl p-3 text-xs text-slate-200 pointer-events-auto shadow-2xl border border-slate-700/50">
      <div className="font-semibold text-slate-300 mb-2 flex items-center justify-between gap-4">
        <span>Rooftop Solar Exposure</span>
        <span className="text-[10px] text-sky-400 font-mono">Raycast 5-point</span>
      </div>

      <div className="space-y-1.5 font-mono text-[11px]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
          <span className="text-slate-300">Excellent Exposure</span>
          <span className="text-slate-400 ml-auto font-sans">≥ 80%</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-amber-500 shadow-sm shadow-amber-500/50"></span>
          <span className="text-slate-300">Good Exposure</span>
          <span className="text-slate-400 ml-auto font-sans">60–79%</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-red-500 shadow-sm shadow-red-500/50"></span>
          <span className="text-slate-300">Poor / Shaded</span>
          <span className="text-slate-400 ml-auto font-sans">&lt; 60%</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-slate-600 border border-slate-500"></span>
          <span className="text-slate-300">Obstacle Zone</span>
          <span className="text-slate-400 ml-auto font-sans">Blocked</span>
        </div>

        <div className="pt-1.5 border-t border-slate-800 flex items-center gap-2">
          <span className="w-3 h-3 rounded border border-sky-400 bg-sky-500/20"></span>
          <span className="text-sky-300">Recommended Array Zone</span>
        </div>
      </div>
    </div>
  );
}
