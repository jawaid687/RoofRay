import { useState } from 'react';
import { useSolarStore } from '../../store/useSolarStore';
import { SIMULATION_ASSUMPTIONS } from '../../config/assumptions';
import { Building2, Sliders, Plus, Trash2, Box } from 'lucide-react';
import { ObstacleType } from '../../types';

export function BuildingInspector() {
  const selectedBuildingId = useSolarStore((s) => s.selectedBuildingId);
  const buildings = useSolarStore((s) => s.buildings);
  const building = buildings.find((b) => b.id === selectedBuildingId);
  const updateBuildingDimensions = useSolarStore((s) => s.updateBuildingDimensions);
  const addObstacle = useSolarStore((s) => s.addObstacle);
  const removeObstacle = useSolarStore((s) => s.removeObstacle);

  const [showAddMenu, setShowAddMenu] = useState(false);

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

  const handleQuickAddObstacle = (type: ObstacleType) => {
    if (type === 'hvac') {
      addObstacle(building.id, {
        name: 'Packaged HVAC Unit',
        type: 'hvac',
        relX: (Math.random() - 0.5) * (building.width - 6),
        relZ: (Math.random() - 0.5) * (building.length - 6),
        width: 2.4,
        length: 2.0,
        height: 1.5,
      });
    } else if (type === 'water_tank') {
      addObstacle(building.id, {
        name: 'Rooftop Water Tank',
        type: 'water_tank',
        relX: (Math.random() - 0.5) * (building.width - 6),
        relZ: (Math.random() - 0.5) * (building.length - 6),
        width: 1.8,
        length: 1.8,
        height: 2.2,
      });
    } else {
      addObstacle(building.id, {
        name: 'Roof Access Penthouse',
        type: 'utility_room',
        relX: (Math.random() - 0.5) * (building.width - 8),
        relZ: (Math.random() - 0.5) * (building.length - 8),
        width: 3.2,
        length: 3.5,
        height: 2.6,
      });
    }
    setShowAddMenu(false);
  };

  return (
    <div className="space-y-4">
      {/* Title & Type */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight">{building.name}</h2>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
            {building.type}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{building.description}</p>
      </div>

      {/* Geometry Sliders */}
      <div className="space-y-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            Building Dimensions
          </span>
          <span className="text-[10px] font-mono text-slate-400">SI Meters</span>
        </div>

        {/* Width Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Width (X)</span>
            <span className="font-mono text-slate-200 font-semibold">{building.width} m</span>
          </div>
          <input
            type="range"
            min={10}
            max={35}
            step={1}
            value={building.width}
            onChange={(e) =>
              updateBuildingDimensions(building.id, parseInt(e.target.value), building.length, building.height)
            }
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
        </div>

        {/* Length Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Length (Z)</span>
            <span className="font-mono text-slate-200 font-semibold">{building.length} m</span>
          </div>
          <input
            type="range"
            min={10}
            max={35}
            step={1}
            value={building.length}
            onChange={(e) =>
              updateBuildingDimensions(building.id, building.width, parseInt(e.target.value), building.height)
            }
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
        </div>

        {/* Height Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Height (Y)</span>
            <span className="font-mono text-slate-200 font-semibold">{building.height} m</span>
          </div>
          <input
            type="range"
            min={5}
            max={35}
            step={1}
            value={building.height}
            onChange={(e) =>
              updateBuildingDimensions(building.id, building.width, building.length, parseInt(e.target.value))
            }
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
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
            w × l = {building.width} × {building.length}
          </div>
        </div>
      </div>

      {/* Rooftop Obstacles */}
      <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-amber-400" />
            Rooftop Obstacles ({building.roofObstacles.length})
          </span>
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] border border-amber-500/30 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Add</span>
          </button>
        </div>

        {/* Quick Add Dropdown */}
        {showAddMenu && (
          <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-950 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => handleQuickAddObstacle('hvac')}
              className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 rounded text-slate-200 text-center"
            >
              + HVAC Unit
            </button>
            <button
              onClick={() => handleQuickAddObstacle('water_tank')}
              className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 rounded text-slate-200 text-center"
            >
              + Water Tank
            </button>
            <button
              onClick={() => handleQuickAddObstacle('utility_room')}
              className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 rounded text-slate-200 text-center"
            >
              + Utility Rm
            </button>
          </div>
        )}

        {/* Obstacle List */}
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
          {building.roofObstacles.length === 0 ? (
            <div className="text-[11px] text-slate-400 py-2 text-center">
              No rooftop obstacles present.
            </div>
          ) : (
            building.roofObstacles.map((obs) => (
              <div
                key={obs.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs"
              >
                <div>
                  <div className="font-medium text-slate-200">{obs.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {obs.width}m × {obs.length}m • h: {obs.height}m
                  </div>
                </div>
                <button
                  onClick={() => removeObstacle(building.id, obs.id)}
                  className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                  title="Remove obstacle"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
