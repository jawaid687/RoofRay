import { useMemo } from 'react';
import { useSolarStore } from '../../store/useSolarStore';
import { calculateSunPosition } from '../../simulation/sunPosition';
import {
  Sun,
  Eye,
  EyeOff,
  Layers,
} from 'lucide-react';

export function ViewportControls() {
  const timeOfDay = useSolarStore((s) => s.timeOfDay);
  const setTimeOfDay = useSolarStore((s) => s.setTimeOfDay);
  const showHeatmap = useSolarStore((s) => s.showHeatmap);
  const setShowHeatmap = useSolarStore((s) => s.setShowHeatmap);
  const showShadows = useSolarStore((s) => s.showShadows);
  const setShowShadows = useSolarStore((s) => s.setShowShadows);

  const sunState = useMemo(() => calculateSunPosition(timeOfDay), [timeOfDay]);

  return (
    <div className="absolute bottom-6 left-6 right-6 lg:right-auto lg:left-6 z-10 pointer-events-auto">
      <div className="glass-panel rounded-2xl p-4 shadow-2xl border border-slate-800/90 max-w-xl backdrop-blur-xl">
        <div className="flex flex-col gap-3">
          {/* Header Row: Sun Time & Coordinates */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-slate-200">Diurnal Sunlight Simulation</span>
              <span className="font-mono text-amber-300 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                {sunState.formattedTime}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
              <span title="Solar elevation angle above horizon">Elev: {sunState.elevationDeg}°</span>
              <span title="Solar azimuth relative to North">Az: {sunState.azimuthDeg}°</span>
            </div>
          </div>

          {/* Time Slider */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-slate-400 w-9">06:00</span>
            <input
              type="range"
              min={6}
              max={18}
              step={0.1}
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400"
            />
            <span className="text-[10px] font-mono text-slate-400 w-9 text-right">18:00</span>
          </div>

          {/* Quick Time Presets & Scene Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
            {/* Quick Sun Time Anchors */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setTimeOfDay(8.5)}
                className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors ${
                  Math.abs(timeOfDay - 8.5) < 0.3
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400'
                }`}
              >
                08:30 (Morning)
              </button>
              <button
                onClick={() => setTimeOfDay(12.0)}
                className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors ${
                  Math.abs(timeOfDay - 12.0) < 0.3
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400'
                }`}
              >
                12:00 (Noon)
              </button>
              <button
                onClick={() => setTimeOfDay(16.0)}
                className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors ${
                  Math.abs(timeOfDay - 16.0) < 0.3
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400'
                }`}
              >
                16:00 (Afternoon)
              </button>
            </div>

            {/* Visual Toggles */}
            <div className="flex items-center gap-2">
              {/* Heatmap Toggle */}
              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  showHeatmap
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Heatmap</span>
              </button>

              {/* Dynamic Shadows Toggle */}
              <button
                onClick={() => setShowShadows(!showShadows)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  showShadows
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800'
                }`}
              >
                {showShadows ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>Shadows</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
