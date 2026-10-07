import { useSolarStore } from '../../store/useSolarStore';
import { PANEL_TYPES } from '../../data/panelTypes';
import { Cpu, Grid } from 'lucide-react';

export function PanelConfigCard() {
  const selectedPanelTypeId = useSolarStore((s) => s.selectedPanelTypeId);
  const setSelectedPanelType = useSolarStore((s) => s.setSelectedPanelType);
  const placedPanels = useSolarStore((s) => s.placedPanels);
  const maxPossiblePanels = useSolarStore((s) => s.maxPossiblePanels);
  const currentPanel = useSolarStore((s) => s.getCurrentPanelType());

  const totalKW = Math.round((placedPanels.length * currentPanel.wattage) / 10) / 100;
  const orientation = placedPanels[0]?.orientation || 'portrait';

  return (
    <div className="space-y-4">
      {/* Panel Selection Grid */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            PV Module Specification
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Demo Configurations</span>
        </label>

        <div className="grid grid-cols-1 gap-2">
          {PANEL_TYPES.map((panel) => {
            const isSelected = panel.id === selectedPanelTypeId;
            return (
              <div
                key={panel.id}
                onClick={() => setSelectedPanelType(panel.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/10'
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{panel.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {panel.category}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {panel.wattage}W
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                  <span>
                    {panel.length}m × {panel.width}m
                  </span>
                  <span>{panel.efficiencyPercent}% Eff</span>
                  <span className="text-slate-300">${panel.cost}/mod</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Array Layout Status */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Grid className="w-3.5 h-3.5 text-sky-400" />
            Rooftop Array Placement
          </span>
          <span className="text-[10px] font-mono uppercase text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded">
            {orientation}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 font-sans">Active Modules</div>
            <div className="text-base font-bold text-white mt-0.5">
              {placedPanels.length}{' '}
              <span className="text-xs text-slate-400 font-normal">/ {maxPossiblePanels} max</span>
            </div>
          </div>

          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 font-sans">System Capacity</div>
            <div className="text-base font-bold text-amber-400 mt-0.5">
              {totalKW} <span className="text-xs text-slate-400 font-normal">kW</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
