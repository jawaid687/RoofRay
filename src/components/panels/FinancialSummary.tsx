import { useState } from 'react';
import { useSolarStore } from '../../store/useSolarStore';
import { useLanguage } from '../../i18n/useLanguage';
import { MetricCard } from '../ui/MetricCard';
import { Zap, BarChart3, Building2, AlertTriangle, Settings2, RotateCcw, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { formatCurrency, getDefaultFinancialParams, getCurrencySymbol } from '../../utils/currency';
import { CurrencyCode } from '../../types';

interface FinancialSummaryProps {
  onNavigateToPlanner?: () => void;
}

export function FinancialSummary({ onNavigateToPlanner }: FinancialSummaryProps) {
  const { t } = useLanguage();
  const energy = useSolarStore((s) => s.energyProfile);
  const financial = useSolarStore((s) => s.financialResult);
  const environmental = useSolarStore((s) => s.environmentalResult);
  const location = useSolarStore((s) => s.location);
  const selectedBuildingId = useSolarStore((s) => s.selectedBuildingId);
  const analysisResults = useSolarStore((s) => s.analysisResults);
  const placedPanels = useSolarStore((s) => s.placedPanels);
  const layoutStatus = useSolarStore((s) => s.layoutStatus);
  const analysisStatus = useSolarStore((s) => s.analysisStatus);

  const currency = useSolarStore((s) => s.currency);
  const setCurrency = useSolarStore((s) => s.setCurrency);
  const customElectricityTariff = useSolarStore((s) => s.customElectricityTariff);
  const customCostPerKW = useSolarStore((s) => s.customCostPerKW);
  const customBaseCost = useSolarStore((s) => s.customBaseCost);
  const customGridEmissionFactor = useSolarStore((s) => s.customGridEmissionFactor);
  const customExportCreditRatio = useSolarStore((s) => s.customExportCreditRatio);
  const setCustomFinancials = useSolarStore((s) => s.setCustomFinancials);
  const resetFinancialDefaults = useSolarStore((s) => s.resetFinancialDefaults);

  const [showConfig, setShowConfig] = useState(false);

  const defaults = getDefaultFinancialParams(currency);
  const activeTariff = customElectricityTariff ?? defaults.tariffPerKWh;
  const activeCostPerKW = customCostPerKW ?? defaults.costPerKW;
  const activeBaseCost = customBaseCost ?? defaults.baseInstallationCost;
  const activeEmissionFactor = customGridEmissionFactor ?? defaults.gridEmissionFactor;
  const activeExportCreditRatio = customExportCreditRatio ?? 0.5;

  const isBangladeshGrid = location.timezone === 'Asia/Dhaka' ||
    (location.latitude >= 20.5 && location.latitude <= 26.7 && location.longitude >= 88.0 && location.longitude <= 92.7);

  const currencySymbol = getCurrencySymbol(currency);
  const analysis = selectedBuildingId ? analysisResults[selectedBuildingId] : undefined;
  const hasPanels = placedPanels.length > 0 && !!analysis && analysisStatus === 'analyzed';
  const isOutdated = layoutStatus === 'outdated';

  // Empty state when no solar layout exists
  if (!hasPanels) {
    return (
      <div data-tour="econ-capacity" className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-amber-400" />
        </div>
        <div className="space-y-1.5">
          <h4 className="text-sm font-bold text-white">{t.financialSummary.emptyTitle}</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            {t.financialSummary.emptyDesc}
          </p>
        </div>
        {onNavigateToPlanner && (
          <button
            onClick={onNavigateToPlanner}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 active:scale-95"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{t.financialSummary.goToPlanner}</span>
          </button>
        )}
      </div>
    );
  }

  const handleCurrencySwitch = (newCurrency: CurrencyCode) => {
    if (newCurrency !== currency) {
      setCurrency(newCurrency);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Outdated Notice Banner if settings or geometry changed */}
      {isOutdated && (
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-amber-300">{t.financialSummary.outdatedTitle}</span>
            <p className="text-[11px] text-amber-300/80 leading-relaxed">
              {t.financialSummary.outdatedDesc}
            </p>
          </div>
        </div>
      )}

      {/* Top Header & Currency Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          {t.financialSummary.title}
        </h3>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => handleCurrencySwitch('USD')}
            className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${
              currency === 'USD'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            USD ($)
          </button>
          <button
            onClick={() => handleCurrencySwitch('BDT')}
            className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${
              currency === 'BDT'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            BDT (৳)
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div data-tour="econ-capacity">
          <MetricCard
            label={t.energyDemand.installedCapacity}
            value={energy.installedCapacityKW}
            unit="kW"
            subtext={`${energy.panelCount} ${t.financialSummary.activeModulesSubtext}`}
            variant="highlight"
          />
        </div>
        <div data-tour="econ-demand">
          <MetricCard
            label={t.energyDemand.annualGeneration}
            value={energy.annualGenerationKWh.toLocaleString()}
            unit="kWh/yr"
            subtext={`${t.financialSummary.capacityFactorSubtext}: ${energy.averageCapacityFactorPercent}%`}
            variant="default"
          />
        </div>
        <div data-tour="econ-capex">
          <MetricCard
            label={t.financialSummary.capex}
            value={formatCurrency(financial.totalSystemCost, currency)}
            subtext={`${t.financialSummary.turnkeyInstallSubtext} (${currency})`}
            variant="default"
          />
        </div>
        <div data-tour="econ-savings">
          <MetricCard
            label={t.financialSummary.annualSavings}
            value={formatCurrency(financial.annualSavings ?? financial.annualSavingsUSD, currency)}
            unit="/yr"
            subtext={`${t.financialSummary.atTariffSubtext} ${currencySymbol}${activeTariff}/kWh`}
            variant="success"
          />
        </div>
        <div data-tour="econ-lifecycle">
          <MetricCard
            label={t.financialSummary.payback}
            value={financial.paybackYears !== null ? `${financial.paybackYears}` : '—'}
            unit={financial.paybackYears !== null ? (t.financialSummary.years || 'years') : ''}
            subtext={`${t.financialSummary.twentyYearNetSubtext}: ${formatCurrency(financial.twentyYearNetSavings ?? financial.twentyYearNetSavingsUSD, currency)}`}
            variant="warning"
          />
        </div>
        <MetricCard
          label={t.financialSummary.carbonAbated}
          value={environmental.annualCO2ReductionTonnes}
          unit="t CO₂/yr"
          subtext={`~${environmental.equivalentTreesPlanted} ${t.financialSummary.treesPlantedSubtext}`}
          variant="success"
        />
      </div>

      {/* Net Metering & Grid Offset Bar */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
        <div className="flex justify-between items-center text-slate-300">
          <span>{t.financialSummary.demandCoverage}</span>
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
          <span>{t.financialSummary.generationLabel}: {energy.annualGenerationKWh.toLocaleString()} kWh</span>
          <span>{t.financialSummary.demandLabel}: {energy.annualConsumptionKWh.toLocaleString()} kWh</span>
        </div>
        {energy.surplusKWh > 0 && (
          <div className="text-[11px] text-sky-400 font-mono pt-1 border-t border-slate-800 flex justify-between items-center">
            <span>+ {energy.surplusKWh.toLocaleString()} {t.financialSummary.gridExportLabel}</span>
            <span className="text-[10px] text-slate-500">
              {t.financialSummary.netMeteringCreditLabel} ({Math.round(activeExportCreditRatio * 100)}% {t.financialSummary.wholesaleRateLabel})
            </span>
          </div>
        )}
      </div>

      {/* Configurable Financial & Emission Assumptions Toggle */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 overflow-hidden">
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="w-full p-2.5 flex items-center justify-between text-xs font-semibold text-slate-300 hover:bg-slate-900/40 transition-colors"
        >
          <div className="flex items-center gap-1.5 text-sky-400">
            <Settings2 className="w-3.5 h-3.5" />
            <span>{t.financialSummary.assumptionsToggle}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <span>{showConfig ? t.financialSummary.hideConfig : t.financialSummary.showConfig}</span>
            {showConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {showConfig && (
          <div className="p-3 border-t border-slate-800/60 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1">
                  {t.financialSummary.electricityTariff} ({currency}/kWh)
                </label>
                <input
                  type="number"
                  step={currency === 'BDT' ? '0.1' : '0.005'}
                  value={activeTariff}
                  onChange={(e) => setCustomFinancials({ tariff: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-400"
                />
                <span className="text-[9px] text-slate-500 block mt-0.5">
                  {currency === 'BDT' ? 'Flat Tariff Model (Configurable, e.g. ৳10.50/kWh)' : 'Flat Tariff Model (Configurable, e.g. $0.16/kWh)'}
                </span>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1">
                  {t.financialSummary.costPerKW} ({currency})
                </label>
                <input
                  type="number"
                  step={currency === 'BDT' ? '1000' : '50'}
                  value={activeCostPerKW}
                  onChange={(e) => setCustomFinancials({ costPerKW: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-400"
                />
                <span className="text-[9px] text-slate-500 block mt-0.5">
                  {currency === 'BDT' ? 'SREDA Accredited Benchmark' : 'NREL PV Cost Benchmark'}
                </span>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1">
                  {t.financialSummary.basePermitFee} ({currency})
                </label>
                <input
                  type="number"
                  step={currency === 'BDT' ? '1000' : '100'}
                  value={activeBaseCost}
                  onChange={(e) => setCustomFinancials({ baseCost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-400"
                />
                <span className="text-[9px] text-slate-500 block mt-0.5">
                  Fixed interconnection expense
                </span>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono block mb-1">
                  {t.financialSummary.exportCreditRate}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="5"
                  value={Math.round(activeExportCreditRatio * 100)}
                  onChange={(e) => setCustomFinancials({ exportCreditRatio: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)) / 100 })}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-400"
                />
                <span className="text-[9px] text-slate-500 block mt-0.5">
                  {isBangladeshGrid ? 'SREDA Net Metering Rollover Policy' : 'Utility Wholesale Buyback Rate'}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-[10px] text-slate-400 font-mono block mb-1">
                  {t.financialSummary.gridEmissionFactor}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={activeEmissionFactor}
                  onChange={(e) => setCustomFinancials({ emissionFactor: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-400"
                />
                <span className="text-[9px] text-slate-500 block mt-0.5">
                  {isBangladeshGrid ? 'DoE / SREDA 2023 Grid Factor (Bangladesh Grid)' : 'IEA Global Baseline 2022'}
                </span>
              </div>
            </div>

            {/* Assumptions & Limitations Collapsible */}
            <details className="group rounded-lg bg-slate-900/40 border border-slate-800 text-[10px] text-slate-400">
              <summary className="p-2 font-medium text-slate-300 cursor-pointer flex items-center justify-between select-none">
                <span>{t.financialSummary.disclosuresTitle}</span>
                <span className="text-slate-500 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="p-2.5 pt-0 space-y-1 border-t border-slate-800/40 text-slate-400">
                <p>• <strong>Tariff & Net Metering:</strong> Single-rate flat tariff with statutory export credit.</p>
                <p>• <strong>Payback:</strong> Initial system cost ÷ Year-1 net savings.</p>
                <p className="text-amber-400/90">• <strong>Estimate:</strong> Feasibility screening model, not metered billing.</p>
              </div>
            </details>

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <Info className="w-3 h-3 text-sky-400" />
                <span>Source: {environmental.gridEmissionFactorSource}</span>
              </div>

              <button
                onClick={resetFinancialDefaults}
                className="px-2.5 py-1 rounded-md text-[10px] font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1 transition-all"
                title="Reset to default regional benchmarks"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t.financialSummary.resetDefaults}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
