import { useState } from 'react';
import { useSolarStore } from '../../store/useSolarStore';
import { useLanguage } from '../../i18n/useLanguage';
import { CITY_PRESETS } from '../../config/assumptions';
import { isValidTimezone } from '../../simulation/timezone';
import {
  Globe,
  Sun,
  Compass,
  Calendar,
  Clock,
  Sunrise,
  Layers,
  MapPin,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  RotateCw,
} from 'lucide-react';

export function LocationTimeCard() {
  const { t } = useLanguage();
  const location = useSolarStore((s) => s.location);
  const setLocation = useSolarStore((s) => s.setLocation);
  const setCityPreset = useSolarStore((s) => s.setCityPreset);

  const dateTime = useSolarStore((s) => s.dateTime);
  const setDate = useSolarStore((s) => s.setDate);
  const setTimeOfDay = useSolarStore((s) => s.setTimeOfDay);

  const sunState = useSolarStore((s) => s.sunState);
  const heatmapMode = useSolarStore((s) => s.heatmapMode);
  const setHeatmapMode = useSolarStore((s) => s.setHeatmapMode);
  const liveShading = useSolarStore((s) => s.liveShading);
  const selectedMonth = useSolarStore((s) => s.selectedMonth);
  const setSelectedMonth = useSolarStore((s) => s.setSelectedMonth);
  const annualAnalysisResult = useSolarStore((s) => s.annualAnalysisResult);

  // Playback state (FR-2.4)
  const isPlayingDay = useSolarStore((s) => s.isPlayingDay);
  const isPlayingYear = useSolarStore((s) => s.isPlayingYear);
  const togglePlayDay = useSolarStore((s) => s.togglePlayDay);
  const togglePlayYear = useSolarStore((s) => s.togglePlayYear);
  const playSpeed = useSolarStore((s) => s.playSpeed);
  const setPlaySpeed = useSolarStore((s) => s.setPlaySpeed);

  const [showAdvancedCoords, setShowAdvancedCoords] = useState(false);
  const [manualLat, setManualLat] = useState(location.latitude.toString());
  const [manualLon, setManualLon] = useState(location.longitude.toString());
  const [manualTz, setManualTz] = useState(location.timezone);
  const [coordError, setCoordError] = useState<string | null>(null);

  // Quick season preset handler
  const handleSeasonPreset = (month: number, day: number) => {
    setDate(dateTime.year, month, day);
  };

  // Manual coordinate submit
  const handleApplyCoordinates = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lon = parseFloat(manualLon);

    if (Number.isNaN(lat) || lat < -90 || lat > 90) {
      setCoordError('Latitude must be a valid number between -90° and +90°.');
      return;
    }
    if (Number.isNaN(lon) || lon < -180 || lon > 180) {
      setCoordError('Longitude must be a valid number between -180° and +180°.');
      return;
    }
    if (!isValidTimezone(manualTz)) {
      setCoordError(`Unrecognized IANA timezone "${manualTz}". Example: "America/Los_Angeles"`);
      return;
    }

    setCoordError(null);
    setLocation({
      city: `Custom (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
      country: 'Custom',
      latitude: Math.round(lat * 10000) / 10000,
      longitude: Math.round(lon * 10000) / 10000,
      timezone: manualTz,
    });
  };

  // Convert sunrise/sunset to percentages for slider markers
  const sunriseFraction = sunState.sunrise
    ? (() => {
        const parts = sunState.sunrise.localTimeFormatted.split(':').map(Number);
        return ((parts[0] + parts[1] / 60) / 24) * 100;
      })()
    : null;

  const sunsetFraction = sunState.sunset
    ? (() => {
        const parts = sunState.sunset.localTimeFormatted.split(':').map(Number);
        return ((parts[0] + parts[1] / 60) / 24) * 100;
      })()
    : null;

  // Format cardinal direction from azimuth
  const getCardinalDirection = (az: number): string => {
    let key: string;
    if (az >= 337.5 || az < 22.5) key = 'North';
    else if (az >= 22.5 && az < 67.5) key = 'North-East';
    else if (az >= 67.5 && az < 112.5) key = 'East';
    else if (az >= 112.5 && az < 157.5) key = 'South-East';
    else if (az >= 157.5 && az < 202.5) key = 'South';
    else if (az >= 202.5 && az < 247.5) key = 'South-West';
    else if (az >= 247.5 && az < 292.5) key = 'West';
    else key = 'North-West';
    return t.locationTime.cardinalDirections[key as keyof typeof t.locationTime.cardinalDirections] || key;
  };

  const formattedDateValue = `${dateTime.year}-${dateTime.month.toString().padStart(2, '0')}-${dateTime.day.toString().padStart(2, '0')}`;

  return (
    <div data-tour="location-time" className="space-y-4">
      {/* City Presets & Location Header */}
      <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Globe className="w-4 h-4 text-sky-400" />
            <span>{t.locationTime.title}</span>
          </div>
          <button
            onClick={() => setShowAdvancedCoords(!showAdvancedCoords)}
            className="text-[11px] font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1"
          >
            <span>{showAdvancedCoords ? t.locationTime.simple : t.locationTime.customCoordinates}</span>
            {showAdvancedCoords ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* City Presets Dropdown */}
        <select
          value={CITY_PRESETS.some((c) => c.name === location.city) ? CITY_PRESETS.find((c) => c.name === location.city)?.id : ''}
          onChange={(e) => {
            const id = e.target.value;
            if (id) {
              setCityPreset(id);
              const preset = CITY_PRESETS.find((c) => c.id === id);
              if (preset) {
                setManualLat(preset.latitude.toString());
                setManualLon(preset.longitude.toString());
                setManualTz(preset.timezone);
                setCoordError(null);
              }
            }
          }}
          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-medium focus:outline-none focus:border-sky-500 cursor-pointer"
        >
          <optgroup label={t.locationTime.bdDivisionsLabel}>
            {CITY_PRESETS.filter((c) => c.country === 'Bangladesh').map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.latitude > 0 ? `+${c.latitude}°N` : `${c.latitude}°S`}, {c.longitude > 0 ? `+${c.longitude}°E` : `${c.longitude}°W`})
              </option>
            ))}
          </optgroup>
          <optgroup label={t.locationTime.globalSitesLabel}>
            {CITY_PRESETS.filter((c) => c.country !== 'Bangladesh').map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.latitude > 0 ? `+${c.latitude}°N` : `${c.latitude}°S`}, {c.longitude > 0 ? `+${c.longitude}°E` : `${c.longitude}°W`})
              </option>
            ))}
          </optgroup>
          {!CITY_PRESETS.some((c) => c.name === location.city) && (
            <option value="">{location.city} ({t.locationTime.customLocation})</option>
          )}
        </select>

        {/* Illustrative Geometry Disclaimer (PRD & Rules 4.A, 10) */}
        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300/90 leading-relaxed flex items-start gap-2">
          <span className="shrink-0 text-xs">ℹ️</span>
          <span>{t.locationTime.simulatedArchetypeNotice}</span>
        </div>

        {/* Advanced Coordinates Form */}
        {showAdvancedCoords && (
          <form onSubmit={handleApplyCoordinates} className="pt-2 border-t border-slate-800/80 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 font-mono">{t.locationTime.latLabel}</label>
                <input
                  type="text"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  className="w-full mt-0.5 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-mono">{t.locationTime.lonLabel}</label>
                <input
                  type="text"
                  value={manualLon}
                  onChange={(e) => setManualLon(e.target.value)}
                  className="w-full mt-0.5 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-mono">{t.locationTime.tzLabel}</label>
              <input
                type="text"
                value={manualTz}
                onChange={(e) => setManualTz(e.target.value)}
                placeholder="e.g. America/Los_Angeles, Europe/London"
                className="w-full mt-0.5 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            {coordError && (
              <div className="text-[11px] text-red-400 bg-red-950/40 p-2 rounded-lg border border-red-500/20">
                {coordError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-1.5 px-3 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-semibold transition-colors"
            >
              {t.locationTime.applyCoordinates}
            </button>
          </form>
        )}

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-sky-400" />
            {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
          </span>
          <span>{location.timezone}</span>
        </div>
      </div>

      {/* Date & Astronomical Seasons */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>{t.locationTime.dateTime}</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">NOAA Ephemeris</span>
        </div>

        {/* Date Input */}
        <input
          type="date"
          value={formattedDateValue}
          onChange={(e) => {
            const parts = e.target.value.split('-').map(Number);
            if (parts.length === 3 && !Number.isNaN(parts[0])) {
              setDate(parts[0], parts[1], parts[2]);
            }
          }}
          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500 cursor-pointer"
        />

        {/* Season Solstice / Equinox Presets */}
        <div className="grid grid-cols-4 gap-1.5 text-[10px] font-medium pt-1">
          <button
            onClick={() => handleSeasonPreset(3, 20)}
            className={`py-1.5 px-1 rounded-lg text-center transition-colors border ${
              dateTime.month === 3 && dateTime.day === 20
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border-slate-800'
            }`}
            title="Spring Equinox"
          >
            {t.locationTime.seasonPresets.mar20}
          </button>
          <button
            onClick={() => handleSeasonPreset(6, 21)}
            className={`py-1.5 px-1 rounded-lg text-center transition-colors border ${
              dateTime.month === 6 && dateTime.day === 21
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border-slate-800'
            }`}
            title="Summer Solstice"
          >
            {t.locationTime.seasonPresets.jun21}
          </button>
          <button
            onClick={() => handleSeasonPreset(9, 22)}
            className={`py-1.5 px-1 rounded-lg text-center transition-colors border ${
              dateTime.month === 9 && dateTime.day === 22
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border-slate-800'
            }`}
            title="Autumn Equinox"
          >
            {t.locationTime.seasonPresets.sep22}
          </button>
          <button
            onClick={() => handleSeasonPreset(12, 21)}
            className={`py-1.5 px-1 rounded-lg text-center transition-colors border ${
              dateTime.month === 12 && dateTime.day === 21
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border-slate-800'
            }`}
            title="Winter Solstice"
          >
            {t.locationTime.seasonPresets.dec21}
          </button>
        </div>

        {/* Play Year Seasonal Animation Control (FR-2.4) */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <button
            onClick={togglePlayYear}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isPlayingYear
                ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/30'
                : 'bg-slate-950 hover:bg-slate-800 text-sky-300 border border-sky-500/30'
            }`}
          >
            {isPlayingYear ? <Pause className="w-3.5 h-3.5 fill-current" /> : <RotateCw className="w-3.5 h-3.5" />}
            <span>{isPlayingYear ? t.locationTime.pauseAnnual : t.locationTime.playYear}</span>
          </button>

          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
            <span>Speed:</span>
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaySpeed(spd)}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  playSpeed === spd
                    ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
                    : 'hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Diurnal Time Slider & Solar Status (FR-2.4) */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{t.locationTime.localTimeOfDay}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Play Day Button */}
            <button
              onClick={togglePlayDay}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                isPlayingDay
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/30'
                  : 'bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-500/30'
              }`}
              title="Play diurnal 24-hour sun cycle"
            >
              {isPlayingDay ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
              <span>{isPlayingDay ? t.locationTime.pauseDay : t.locationTime.playDay}</span>
            </button>
            {/* Solar State Badge */}
            {sunState.isPolarDay && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Midnight Sun (Polar Day)
              </span>
            )}
            {sunState.isPolarNight && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Polar Night (0h Sun)
              </span>
            )}
            {!sunState.isPolarDay && !sunState.isPolarNight && (
              <>
                {sunState.elevationDeg > 0 ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {t.locationTime.daylight}
                  </span>
                ) : sunState.elevationDeg >= -6 ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {t.locationTime.civilTwilight}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {t.locationTime.night}
                  </span>
                )}
              </>
            )}
            <span className="font-mono text-amber-300 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md text-xs">
              {sunState.formattedTime}
            </span>
          </div>
        </div>

        {/* 24-Hour Slider with Sunrise/Sunset Track Markers */}
        <div className="relative pt-2 pb-1">
          {/* Track Markers for Sunrise and Sunset */}
          {sunriseFraction !== null && (
            <div
              className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center pointer-events-none"
              style={{ left: `${sunriseFraction}%` }}
            >
              <span className="text-[9px] font-mono text-amber-400 font-bold">▲</span>
              <span className="text-[8px] font-mono text-amber-400 -mt-1">Rise</span>
            </div>
          )}
          {sunsetFraction !== null && (
            <div
              className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center pointer-events-none"
              style={{ left: `${sunsetFraction}%` }}
            >
              <span className="text-[9px] font-mono text-orange-400 font-bold">▲</span>
              <span className="text-[8px] font-mono text-orange-400 -mt-1">Set</span>
            </div>
          )}

          <input
            type="range"
            min={0}
            max={24}
            step={0.1}
            value={dateTime.timeDecimal}
            onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 mt-3"
          />

          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>
        </div>
      </div>

      {/* Persistent Astronomical Readout (FR-2.3) */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            {t.locationTime.astronomicalReadout}
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            UTC: {sunState.utcDate.toISOString().slice(11, 16)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase">{t.locationTime.solarElevation}</div>
            <div className="text-sm font-bold text-slate-100 mt-0.5 flex items-baseline gap-1">
              <span>{sunState.elevationDeg}°</span>
              <span className="text-[10px] text-slate-500 font-normal">
                ({sunState.unrefractedElevationDeg}° geom)
              </span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase">{t.locationTime.solarAzimuth}</div>
            <div className="text-sm font-bold text-slate-100 mt-0.5 flex items-baseline gap-1">
              <span>{sunState.azimuthDeg}°</span>
              <span className="text-[10px] text-sky-400 font-normal">
                ({getCardinalDirection(sunState.azimuthDeg)})
              </span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
              <Sunrise className="w-3 h-3 text-amber-400" />
              <span>{t.locationTime.sunriseSunset}</span>
            </div>
            <div className="text-xs font-bold text-slate-200 mt-1">
              {sunState.isPolarDay
                ? 'Sun never sets (24h)'
                : sunState.isPolarNight
                ? 'Sun never rises'
                : `${sunState.sunrise?.localTimeFormatted || '--'} / ${sunState.sunset?.localTimeFormatted || '--'}`}
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
              <Sun className="w-3 h-3 text-amber-400" />
              <span>{t.locationTime.solarNoonDayLen}</span>
            </div>
            <div className="text-xs font-bold text-slate-200 mt-1">
              {sunState.solarNoon.localTimeFormatted} ({sunState.solarNoon.elevationDeg}°) • {Math.floor(sunState.dayLengthMinutes / 60)}h {sunState.dayLengthMinutes % 60}m
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Mode & Shading Metric (FR-4.5, FR-5.3, FR-6.5) */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            {t.locationTime.heatmapModeTitle}
          </span>
          {heatmapMode === 'live' && liveShading && (
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              {Math.round(liveShading.litRatio * 100)}% Roof Lit Now
            </span>
          )}
          {heatmapMode === 'annual' && annualAnalysisResult && (
            <span className="text-[10px] font-mono text-sky-400 font-bold">
              {annualAnalysisResult.averageAnnualKWhPerM2} kWh/m²/yr
            </span>
          )}
          {heatmapMode === 'monthly' && annualAnalysisResult && (
            <span className="text-[10px] font-mono text-amber-400 font-bold">
              {annualAnalysisResult.monthlyAveragesKWhPerM2[selectedMonth]} kWh/m²
            </span>
          )}
        </div>

        {/* 3-Way Heatmap Mode Switcher */}
        <div className="grid grid-cols-3 gap-1 text-[11px] font-medium">
          <button
            onClick={() => setHeatmapMode('live')}
            className={`py-2 px-1.5 rounded-xl border flex items-center justify-center gap-1 transition-all ${
              heatmapMode === 'live'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10 font-semibold'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span>{t.locationTime.liveMode}</span>
          </button>

          <button
            onClick={() => setHeatmapMode('annual')}
            className={`py-2 px-1.5 rounded-xl border flex items-center justify-center gap-1 transition-all ${
              heatmapMode === 'annual'
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm shadow-sky-500/10 font-semibold'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
            <span>{t.locationTime.annualMode}</span>
          </button>

          <button
            onClick={() => setHeatmapMode('monthly')}
            className={`py-2 px-1.5 rounded-xl border flex items-center justify-center gap-1 transition-all ${
              heatmapMode === 'monthly'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10 font-semibold'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            <span>{t.locationTime.monthlyMode}</span>
          </button>
        </div>

        {/* 12-Month Selector (visible when Monthly mode is active) */}
        {heatmapMode === 'monthly' && (
          <div className="pt-1.5 border-t border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>{t.locationTime.selectMonth}</span>
              <span className="text-amber-300 font-bold">
                {t.locationTime.monthNames[selectedMonth]}
              </span>
            </div>

            <div className="grid grid-cols-6 gap-1 text-[10px] font-mono">
              {t.locationTime.monthNamesShort.map((monthName, idx) => (
                <button
                  key={monthName}
                  onClick={() => setSelectedMonth(idx)}
                  className={`py-1 rounded-lg border text-center transition-all ${
                    selectedMonth === idx
                      ? 'bg-amber-500/30 text-amber-200 border-amber-500/60 font-bold shadow-sm shadow-amber-500/20'
                      : 'bg-slate-950 hover:bg-slate-800/80 text-slate-400 border-slate-800/80'
                  }`}
                >
                  {monthName}
                </button>
              ))}
            </div>
          </div>
        )}

        {heatmapMode === 'live' && liveShading && (
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 font-mono">
            <span>Lit: {liveShading.litCellsCount} cells</span>
            <span>Shaded: {liveShading.shadedCellsCount} cells</span>
            <span>Obstacles: {liveShading.obstacleCellsCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}
