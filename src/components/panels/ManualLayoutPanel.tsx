import {
  MousePointer,
  PlusSquare,
  Maximize2,
  RotateCw,
  Undo2,
  Redo2,
  Trash2,
  Sparkles,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useSolarStore } from '../../store/useSolarStore';
import { useLanguage } from '../../i18n/useLanguage';

export function ManualLayoutPanel() {
  const { t } = useLanguage();
  const getSelectedBuilding = useSolarStore((s) => s.getSelectedBuilding);
  const getCurrentPanelType = useSolarStore((s) => s.getCurrentPanelType);

  const placementMode = useSolarStore((s) => s.placementMode);
  const setPlacementMode = useSolarStore((s) => s.setPlacementMode);
  const panelOrientation = useSolarStore((s) => s.panelOrientation);
  const setPanelOrientation = useSolarStore((s) => s.setPanelOrientation);
  const togglePanelOrientation = useSolarStore((s) => s.togglePanelOrientation);

  const showBestSpots = useSolarStore((s) => s.showBestSpots);
  const setShowBestSpots = useSolarStore((s) => s.setShowBestSpots);
  const suggestNextManualPanel = useSolarStore((s) => s.suggestNextManualPanel);

  const placedPanels = useSolarStore((s) => s.placedPanels);
  const selectedPanelIds = useSolarStore((s) => s.selectedPanelIds);
  const setSelectedPanelIds = useSolarStore((s) => s.setSelectedPanelIds);
  const deleteSelectedPanels = useSolarStore((s) => s.deleteSelectedPanels);
  const clearAllPanels = useSolarStore((s) => s.clearAllPanels);
  const undo = useSolarStore((s) => s.undo);
  const redo = useSolarStore((s) => s.redo);
  const history = useSolarStore((s) => s.history);

  const building = getSelectedBuilding();
  const panelType = getCurrentPanelType();

  if (!building) {
    return (
      <div className="p-4 text-center text-slate-400 text-xs">
        {t.manualLayout.selectBuildingPrompt}
      </div>
    );
  }

  // Calculate layout statistics
  const totalCapacityKW = Math.round((placedPanels.length * panelType.wattage) / 10) / 100;
  const avgExposure =
    placedPanels.length > 0
      ? Math.round((placedPanels.reduce((sum, p) => sum + p.exposureScore, 0) / placedPanels.length) * 100)
      : 0;

  // Check for string mismatch / low-exposure panels (< 60% exposure or >20% below average)
  const lowExposurePanels = placedPanels.filter((p) => p.exposureScore < 0.60);
  const avgExposureDecimal = avgExposure / 100;
  const mismatchedPanels = placedPanels.filter(
    (p) => avgExposureDecimal - p.exposureScore > 0.20
  );
  const hasStringMismatch = lowExposurePanels.length > 0 || mismatchedPanels.length > 0;

  // Selected panel details (if exactly one selected)
  const singleSelectedPanel =
    selectedPanelIds.length === 1
      ? placedPanels.find((p) => p.id === selectedPanelIds[0])
      : null;

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* Tool Selector Bar (FR-7.1) */}
      <div data-tour="manual-tools" className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
          <span>{t.manualLayout.tools}</span>
          <span className="text-[10px] text-slate-500 font-mono">{t.manualLayout.gridSnap}</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
          <button
            data-tour="manual-select-mode"
            onClick={() => setPlacementMode('select')}
            className={`py-2 px-2 rounded-lg font-medium flex flex-col items-center gap-1 transition-all ${
              placementMode === 'select'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <MousePointer className="w-4 h-4" />
            <span className="text-[10px]">{t.manualLayout.selectMove}</span>
          </button>

          <button
            data-tour="manual-place-mode"
            onClick={() => setPlacementMode('place')}
            className={`py-2 px-2 rounded-lg font-medium flex flex-col items-center gap-1 transition-all ${
              placementMode === 'place'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <PlusSquare className="w-4 h-4" />
            <span className="text-[10px]">{t.manualLayout.placePanel}</span>
          </button>

          <button
            onClick={() => setPlacementMode('fill')}
            className={`py-2 px-2 rounded-lg font-medium flex flex-col items-center gap-1 transition-all ${
              placementMode === 'fill'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <Maximize2 className="w-4 h-4" />
            <span className="text-[10px]">{t.manualLayout.fillZone}</span>
          </button>
        </div>
      </div>

      {/* Orientation & Rotate Controls (FR-7.5) */}
      <div data-tour="manual-orientation" className="glass-panel p-3 rounded-xl border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-300">{t.panelConfig.orientation}</span>
          <span className="text-[10px] text-slate-400 font-mono">
            {panelOrientation === 'portrait'
              ? `${panelType.width}m × ${panelType.length}m`
              : `${panelType.length}m × ${panelType.width}m`}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setPanelOrientation('portrait')}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all ${
              panelOrientation === 'portrait'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {t.panelConfig.portrait} (T)
          </button>
          <button
            onClick={() => setPanelOrientation('landscape')}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all ${
              panelOrientation === 'landscape'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {t.panelConfig.landscape} (T)
          </button>
        </div>

        <button
          onClick={togglePanelOrientation}
          className="w-full py-1.5 px-2 rounded-lg text-[11px] font-medium bg-slate-900/60 hover:bg-slate-800/60 text-slate-300 hover:text-slate-100 border border-slate-800 flex items-center justify-center gap-1.5 transition-all"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>{t.manualLayout.rotate}</span>
        </button>
      </div>

      {/* History & Edit Operations Bar (FR-7.7) */}
      <div data-tour="manual-history" className="flex items-center gap-1.5">
        <button
          onClick={undo}
          disabled={history.past.length === 0}
          title="Undo (Ctrl+Z)"
          className="flex-1 py-1.5 px-2 rounded-lg font-medium text-[11px] bg-slate-900/80 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 border border-slate-800 flex items-center justify-center gap-1 transition-all"
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span>{t.manualLayout.undo} ({history.past.length})</span>
        </button>

        <button
          onClick={redo}
          disabled={history.future.length === 0}
          title="Redo (Ctrl+Y)"
          className="flex-1 py-1.5 px-2 rounded-lg font-medium text-[11px] bg-slate-900/80 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 border border-slate-800 flex items-center justify-center gap-1 transition-all"
        >
          <Redo2 className="w-3.5 h-3.5" />
          <span>{t.manualLayout.redo} ({history.future.length})</span>
        </button>

        {selectedPanelIds.length > 0 && (
          <button
            onClick={deleteSelectedPanels}
            title="Delete Selected Panels (Del)"
            className="py-1.5 px-2.5 rounded-lg font-medium text-[11px] bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 flex items-center justify-center gap-1 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.manualLayout.delete} ({selectedPanelIds.length})</span>
          </button>
        )}

        {placedPanels.length > 0 && selectedPanelIds.length === 0 && (
          <button
            onClick={clearAllPanels}
            title="Clear all panels"
            className="py-1.5 px-2.5 rounded-lg font-medium text-[11px] bg-slate-900/60 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-slate-800 hover:border-red-500/30 flex items-center justify-center gap-1 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.manualLayout.clearAll}</span>
          </button>
        )}
      </div>

      {/* Smart Optimization Suggestions (FR-7.6) */}
      <div data-tour="manual-smart" className="glass-panel p-3 rounded-xl border border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.manualLayout.smartSolarPlacement}</span>
          </div>
          <button
            onClick={() => setShowBestSpots(!showBestSpots)}
            className={`py-1 px-2 rounded-md text-[10px] font-medium flex items-center gap-1 transition-all ${
              showBestSpots
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {showBestSpots ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>{showBestSpots ? t.manualLayout.hideSpots : t.manualLayout.showBestSpots}</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-400 leading-relaxed">
          {t.manualLayout.smartSolarDesc}
        </p>

        <button
          onClick={suggestNextManualPanel}
          className="w-full py-2 px-3 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4" />
          <span>{t.manualLayout.suggestNext}</span>
        </button>
      </div>

      {/* Placed Panels Metrics Card (FR-7.8) */}
      <div data-tour="manual-setbacks" className="glass-panel p-3 rounded-xl border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
          <span className="text-[11px] font-semibold text-slate-300">{t.manualLayout.rooftopArraySummary}</span>
          <span className="text-[10px] text-slate-500 font-mono">
            {placedPanels.length} {placedPanels.length === 1 ? t.manualLayout.moduleSingular : t.manualLayout.modulePlural}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800/60">
            <div className="text-[10px] text-slate-400">{t.manualLayout.totalCapacity}</div>
            <div className="text-sm font-bold text-sky-300 font-mono">{totalCapacityKW} kW</div>
          </div>
          <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800/60">
            <div className="text-[10px] text-slate-400">{t.manualLayout.avgExposure}</div>
            <div className="text-sm font-bold text-emerald-300 font-mono">{avgExposure}%</div>
          </div>
        </div>

        {/* String Mismatch Warning Indicator (FR-7.8) */}
        {hasStringMismatch && (
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-amber-300 text-[10px]">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <span className="font-semibold">{t.manualLayout.stringMismatchTitle}:</span>{' '}
              {lowExposurePanels.length > 0 &&
                (t.manualLayout.lowExposureWarning || '').replace('{count}', lowExposurePanels.length.toString())}
              {mismatchedPanels.length > 0 &&
                ` ${mismatchedPanels.length} ${t.manualLayout.mismatchWarning || 'panel(s) are >20% below string average. Consider micro-inverters or moving them.'}`}
            </div>
          </div>
        )}
      </div>

      {/* Single Selected Panel Inspector (FR-7.8) */}
      {singleSelectedPanel && (
        <div className="glass-panel p-3 rounded-xl border border-sky-500/40 bg-sky-950/20 space-y-2">
          <div className="flex items-center justify-between border-b border-sky-500/30 pb-1">
            <span className="text-[11px] font-bold text-sky-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t.manualLayout.selectedPanel} ({singleSelectedPanel.id})</span>
            </span>
            <button
              onClick={() => setSelectedPanelIds([])}
              className="text-[10px] text-sky-400 hover:text-sky-200 underline font-sans"
            >
              {t.manualLayout.deselect}
            </button>
          </div>

          <div className="space-y-1 text-[11px] font-mono">
            <div className="flex justify-between text-slate-300">
              <span>{t.manualLayout.localPosition}:</span>
              <span className="text-slate-200">
                ({singleSelectedPanel.localX.toFixed(1)}m, {singleSelectedPanel.localZ.toFixed(1)}m)
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>{t.panelConfig.orientation}:</span>
              <span className="capitalize text-slate-200">{singleSelectedPanel.orientation}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>{t.manualLayout.annualExposure}:</span>
              <span
                className={`font-bold ${
                  singleSelectedPanel.exposureScore >= 0.8
                    ? 'text-emerald-400'
                    : singleSelectedPanel.exposureScore >= 0.6
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              >
                {Math.round(singleSelectedPanel.exposureScore * 100)}%
              </span>
            </div>
            {singleSelectedPanel.annualKWh !== undefined && (
              <div className="flex justify-between text-slate-300">
                <span>{t.manualLayout.annualGeneration}:</span>
                <span className="font-bold text-sky-300">
                  ~{singleSelectedPanel.annualKWh} kWh/yr
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Reference */}
      <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/60 space-y-1.5 text-[10px] text-slate-400">
        <div className="font-semibold text-slate-300 flex items-center gap-1 text-[10px]">
          <HelpCircle className="w-3 h-3 text-slate-400" />
          <span>{t.manualLayout.shortcutsTitle}</span>
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 font-mono text-[9px]">
          <div><span className="text-slate-300 font-bold">Q / E / T:</span> {t.manualLayout.rotate90}</div>
          <div><span className="text-slate-300 font-bold">Del:</span> {t.manualLayout.removePanel}</div>
          <div><span className="text-slate-300 font-bold">Ctrl+Z:</span> {t.manualLayout.undoAction}</div>
          <div><span className="text-slate-300 font-bold">Ctrl+Y:</span> {t.manualLayout.redoAction}</div>
          <div><span className="text-slate-300 font-bold">Ctrl+A:</span> {t.manualLayout.selectAllAction}</div>
          <div><span className="text-slate-300 font-bold">Drag:</span> {t.manualLayout.moveSlotAction}</div>
        </div>
      </div>
    </div>
  );
}
