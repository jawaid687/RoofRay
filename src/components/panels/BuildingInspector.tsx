import { useSolarStore } from '../../store/useSolarStore';
import { SIMULATION_ASSUMPTIONS } from '../../config/assumptions';
import { Building2, Box, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function BuildingInspector() {
  const selectedBuildingId = useSolarStore((s) => s.selectedBuildingId);
  const buildings = useSolarStore((s) => s.buildings);
  const selectBuilding = useSolarStore((s) => s.selectBuilding);
  const building = buildings.find((b) => b.id === selectedBuildingId);

  if (!building) {
    return (
      <div className="p-6 text-center text-slate-500">
        <Building2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Select a building in the 3D neighborhood to inspect roof geometry.</p>
      </div>
    );
  }

  const roofAreaM2 = Math.round(building.width * building.length * 10) / 10;
  const roofAreaSqFt = Math.round(roofAreaM2 * SIMULATION_ASSUMPTIONS.sqMetersToSqFeet);

  return (
    <div className="space-y-4">
      {/* Building Selector Dropdown */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
          <span>Target Building</span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
            <ShieldCheck className="w-3 h-3" />
            Fixed Geometry (v2)
          </span>
        </label>
        <select
          value={building.id}
          onChange={(e) => selectBuilding(e.target.value)}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 font-medium focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
        >
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} ({b.width}m × {b.length}m • {b.type})
            </option>
          ))}
        </select>
      </div>

      {/* Building Header & Description */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0 border border-white/20"
              style={{ backgroundColor: building.color || '#55667b' }}
            />
            <h2 className="text-sm font-bold text-white tracking-tight">{building.name}</h2>
          </div>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
            {building.type}
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">{building.description}</p>
      </div>

      {/* Read-Only Geometry Constants (FR-1.1, FR-1.2) */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-sky-400" />
            Structural Geometry
          </span>
          <span className="text-[10px] font-mono text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Read-only Constant
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Width (X)</div>
            <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">{building.width} m</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Length (Z)</div>
            <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">{building.length} m</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Height (Y)</div>
            <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">{building.height} m</div>
          </div>
        </div>

        {/* Total Roof Area Display */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400">Total Roof Area</div>
            <div className="text-sm font-bold text-slate-100 font-mono">
              {roofAreaM2} m²
              <span className="text-xs text-slate-400 font-normal ml-1">
                ({roofAreaSqFt.toLocaleString()} sq ft)
              </span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono text-right">
            World: [{building.position[0]}, {building.position[1]}, {building.position[2]}]
          </div>
        </div>
      </div>

      {/* Rooftop Obstacles (Read-only, FR-1.3) */}
      <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-amber-400" />
            Fixed Roof Obstacles ({building.roofObstacles.length})
          </span>
          <span className="text-[10px] font-mono text-slate-400">0.5m buffer required</span>
        </div>

        {/* Obstacle List */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {building.roofObstacles.length === 0 ? (
            <div className="text-[11px] text-slate-400 py-3 text-center">
              No rooftop obstacles present on this roof.
            </div>
          ) : (
            building.roofObstacles.map((obs) => (
              <div
                key={obs.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs"
              >
                <div>
                  <div className="font-medium text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{obs.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5 ml-4.5">
                    {obs.width}m × {obs.length}m • h: {obs.height}m • pos: [{obs.relX > 0 ? `+${obs.relX}` : obs.relX}, {obs.relZ > 0 ? `+${obs.relZ}` : obs.relZ}]
                  </div>
                </div>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  {obs.type.replace('_', ' ')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
