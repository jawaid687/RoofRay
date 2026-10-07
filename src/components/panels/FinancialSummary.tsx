import { useSolarStore } from '../../store/useSolarStore';
import { MetricCard } from '../ui/MetricCard';
import { Zap } from 'lucide-react';

export function FinancialSummary() {
  const energy = useSolarStore((s) => s.getEnergyProfile());
  const financial = useSolarStore((s) => s.getFinancialResult());
  const environmental = useSolarStore((s) => s.getEnvironmentalResult());
  const analysis = useSolarStore((s) => s.getCurrentAnalysis());

  if (!analysis) return null;

  return (
    <div className="space-y-3.5">
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
