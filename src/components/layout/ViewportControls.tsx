import { useSolarStore } from '../../store/useSolarStore';
import {
  Sun,
  Eye,
  EyeOff,
  Layers,
  Sunrise,
  Sunset,
  Play,
  Pause,
  RotateCw,
  Compass as CompassIcon,
} from 'lucide-react';

export function ViewportControls() {
  const timeDecimal = useSolarStore((s) => s.dateTime.timeDecimal);
  const setTimeOfDay = useSolarStore((s) => s.setTimeOfDay);
  const sunState = useSolarStore((s) => s.sunState);
  const showHeatmap = useSolarStore((s) => s.showHeatmap);
  const setShowHeatmap = useSolarStore((s) => s.setShowHeatmap);
  const showShadows = useSolarStore((s) => s.showShadows);
  const setShowShadows = useSolarStore((s) => s.setShowShadows);
  const showSunPath = useSolarStore((s) => s.showSunPath);
  const setShowSunPath = useSolarStore((s) => s.setShowSunPath);
  const showCompass = useSolarStore((s) => s.showCompass);
  const setShowCompass = useSolarStore((s) => s.setShowCompass);
  const heatmapMode = useSolarStore((s) => s.heatmapMode);
  const setHeatmapMode = useSolarStore((s) => s.setHeatmapMode);

  // Playback state (FR-2.4)
  const isPlayingDay = useSolarStore((s) => s.isPlayingDay);
  const isPlayingYear = useSolarStore((s) => s.isPlayingYear);
  const togglePlayDay = useSolarStore((s) => s.togglePlayDay);
  const togglePlayYear = useSolarStore((s) => s.togglePlayYear);
  const playSpeed = useSolarStore((s) => s.playSpeed);
  const setPlaySpeed = useSolarStore((s) => s.setPlaySpeed);

  // Jump to sunrise/sunset if available
  const handleJumpSunrise = () => {
    if (sunState.sunrise) {
      const parts = sunState.sunrise.localTimeFormatted.split(':').map(Number);
      setTimeOfDay(parts[0] + parts[1] / 60);
    }
  };

  const handleJumpSunset = () => {
    if (sunState.sunset) {
      const parts = sunState.sunset.localTimeFormatted.split(':').map(Number);
      setTimeOfDay(parts[0] + parts[1] / 60);
    }
  };

  return (
    <div className="absolute bottom-6 left-6 right-6 lg:right-auto lg:left-6 z-10 pointer-events-auto">
      <div className="glass-panel rounded-2xl p-4 shadow-2xl border border-slate-800/90 max-w-xl backdrop-blur-xl">
        <div className="flex flex-col gap-3">
          {/* Header Row: Sun Time, Playback Controls & Coordinates */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-slate-200">NOAA Sun Model</span>
              <span className="font-mono text-amber-300 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                {sunState.formattedTime}
              </span>
            </div>

            {/* Play Day & Play Year Animation Controls (FR-2.4) */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={togglePlayDay}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  isPlayingDay
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30 ring-1 ring-amber-400'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80'
                }`}
                title={isPlayingDay ? 'Pause Day Animation' : 'Play Day (Diurnal Sun Cycle)'}
              >
                {isPlayingDay ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                <span>{isPlayingDay ? 'Pause' : 'Play Day'}</span>
              </button>

              <button
                onClick={togglePlayYear}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  isPlayingYear
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/30 ring-1 ring-sky-400'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80'
                }`}
                title={isPlayingYear ? 'Pause Year Animation' : 'Play Year (Seasonal Solstice & Equinox Cycle)'}
              >
                {isPlayingYear ? <Pause className="w-3 h-3 fill-current" /> : <RotateCw className="w-3 h-3" />}
                <span>{isPlayingYear ? 'Pause' : 'Play Year'}</span>
              </button>

              {/* Speed Multiplier */}
              <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-0.5 text-[10px] font-mono">
                {[1, 2, 4].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaySpeed(spd)}
                    className={`px-1.5 py-0.5 rounded transition-colors ${
                      playSpeed === spd
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={`Playback speed: ${spd}x`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
              <span title="Solar elevation angle above horizon">Elev: {sunState.elevationDeg}°</span>
              <span title="Solar azimuth relative to North">Az: {sunState.azimuthDeg}°</span>
            </div>
          </div>

          {/* Time Slider (00:00 to 24:00) */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-slate-400 w-9">00:00</span>
            <input
              type="range"
              min={0}
              max={24}
              step={0.1}
              value={timeDecimal}
              onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400"
            />
            <span className="text-[10px] font-mono text-slate-400 w-9 text-right">24:00</span>
          </div>

          {/* Quick Sun Anchors & Scene Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
            {/* Quick Astronomical Solar Anchors */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              {sunState.sunrise && (
                <button
                  onClick={handleJumpSunrise}
                  className="px-2 py-1 rounded-md bg-slate-900/60 hover:bg-slate-800 text-slate-300 flex items-center gap-1 border border-slate-800"
                  title="Jump to Sunrise"
                >
                  <Sunrise className="w-3 h-3 text-amber-400" />
                  <span>Rise {sunState.sunrise.localTimeFormatted}</span>
                </button>
              )}

              <button
                onClick={() => {
                  const parts = sunState.solarNoon.localTimeFormatted.split(':').map(Number);
                  setTimeOfDay(parts[0] + parts[1] / 60);
                }}
                className="px-2 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 flex items-center gap-1 border border-amber-500/30 font-semibold"
                title="Jump to Solar Noon"
              >
                <Sun className="w-3 h-3 text-amber-400" />
                <span>Noon {sunState.solarNoon.localTimeFormatted}</span>
              </button>

              {sunState.sunset && (
                <button
                  onClick={handleJumpSunset}
                  className="px-2 py-1 rounded-md bg-slate-900/60 hover:bg-slate-800 text-slate-300 flex items-center gap-1 border border-slate-800"
                  title="Jump to Sunset"
                >
                  <Sunset className="w-3 h-3 text-orange-400" />
                  <span>Set {sunState.sunset.localTimeFormatted}</span>
                </button>
              )}
            </div>

            {/* Visual Toggles */}
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Heatmap Mode Quick Toggle */}
              <button
                onClick={() => setHeatmapMode(heatmapMode === 'live' ? 'annual' : 'live')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  heatmapMode === 'live'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
                title="Switch between Live Shading and Annual Exposure"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${heatmapMode === 'live' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span>{heatmapMode === 'live' ? 'Live Shading' : 'Annual'}</span>
              </button>

              {/* Heatmap Visibility Toggle */}
              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  showHeatmap
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800'
                }`}
                title="Toggle Rooftop Solar Heatmap"
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
                title="Toggle Real-Time Shadow Casting"
              >
                {showShadows ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>Shadows</span>
              </button>

              {/* 3D Sun Path Arc Toggle (FR-4.6) */}
              <button
                onClick={() => setShowSunPath(!showSunPath)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  showSunPath
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800'
                }`}
                title="Toggle 3D Solar Path Arcs & Solstices"
              >
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Sun Path</span>
              </button>

              {/* 3D North Compass Rose Toggle (FR-4.6) */}
              <button
                onClick={() => setShowCompass(!showCompass)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  showCompass
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800'
                }`}
                title="Toggle 3D North Compass Rose"
              >
                <CompassIcon className="w-3.5 h-3.5 text-red-400" />
                <span>Compass</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
