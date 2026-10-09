import { useSolarStore } from '../../store/useSolarStore';
import { MetricCard } from '../ui/MetricCard';
import { Zap, BarChart3, Building2, AlertTriangle } from 'lucide-react';

interface FinancialSummaryProps {
  onNavigateToPlanner?: () => void;
}

export function FinancialSummary({ onNavigateToPlanner }: FinancialSummaryProps) {
  const energy = useSolarStore((s) => s.energyProfile);
  const financial = useSolarStore((s) => s.financialResult);
  const environmental = useSolarStore((s) => s.environmentalResult);
  const selectedBuildingId = useSolarStore((s) => s.selectedBuildingId);
  const analysisResults = useSolarStore((s) => s.analysisResults);
  const placedPanels = useSolarStore((s) => s.placedPanels);
  const layoutStatus = useSolarStore((s) => s.layoutStatus);
  const analysisStatus = useSolarStore((s) => s.analysisStatus);

  const analysis = selectedBuildingId ? analysisResults[selectedBuildingId] : undefined;
  const hasPanels = placedPanels.length > 0 && !!analysis && analysisStatus === 'analyzed';
  const isOutdated = layoutStatus === 'outdated';

  // Empty state when no solar layout exists
  if (!hasPanels) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-amber-400" />
        </div>
        <div className="space-y-1.5">
          <h4 className="text-sm font-bold text-white">Financial Projections Unavailable</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Generate a solar layout to view financial projections, capex estimations, payback periods, and utility tariff savings.
          </p>
        </div>
        {onNavigateToPlanner && (
          <button
            onClick={onNavigateToPlanner}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 active:scale-95"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Go to Rooftop Planner</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {/* Outdated Notice Banner if settings or geometry changed */}
      {isOutdated && (
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-amber-300">Layout Outdated with Current Settings</span>
            <p className="text-[11px] text-amber-300/80 leading-relaxed">
              Financial projections below reflect the last generated layout. Regenerate in Rooftop Planner to update calculations.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Dashboard Performance & Economics
        </h3>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
          {energy.solarCoveragePercent}% Offset
        </span>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          label="Installed Capacity"
          value={energy.installedCapacityKW}
          unit="kW"
          subtext={`${energy.panelCount} active modules`}
          variant="highlight"
        />
        <MetricCard
          label="Annual Generation"
          value={energy.annualGenerationKWh.toLocaleString()}
          unit="kWh/yr"
          subtext={`Capacity factor: ${energy.averageCapacityFactorPercent}%`}
          variant="default"
        />
        <MetricCard
          label="Estimated Capex"
          value={`$${financial.totalSystemCost.toLocaleString()}`}
          subtext="Turnkey system + install"
          variant="default"
        />
        <MetricCard
          label="Annual Bill Savings"
          value={`$${financial.annualSavingsUSD.toLocaleString()}`}
          unit="/yr"
          subtext="Displaced grid power"
          variant="success"
        />
        <MetricCard
          label="Payback Period"
          value={financial.paybackYears ? `${financial.paybackYears}` : '—'}
          unit={financial.paybackYears ? 'years' : ''}
          subtext={`20-Yr Net: $${financial.twentyYearNetSavingsUSD.toLocaleString()}`}
          variant="warning"
        />
        <MetricCard
          label="Carbon Abated"
          value={environmental.annualCO2ReductionTonnes}
          unit="t CO₂/yr"
          subtext={`~${environmental.equivalentTreesPlanted} trees planted`}
          variant="success"
        />
      </div>

      {/* Net Metering & Grid Offset Bar */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
        <div className="flex justify-between items-center text-slate-300">
          <span>Electricity Demand Coverage</span>
          <span className="font-mono font-bold text-amber-400">
            {energy.solarCoveragePercent}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, energy.solarCoveragePercent)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>Generation: {energy.annualGenerationKWh.toLocaleString()} kWh</span>
          <span>Demand: {energy.annualConsumptionKWh.toLocaleString()} kWh</span>
        </div>
        {energy.surplusKWh > 0 && (
          <div className="text-[11px] text-sky-400 font-mono pt-1 border-t border-slate-800">
            + {energy.surplusKWh.toLocaleString()} kWh/yr estimated export to grid
          </div>
        )}
      </div>
    </div>
  );
}
