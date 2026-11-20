import { useSolarStore } from '../../store/useSolarStore';
import { useLanguage } from '../../i18n/useLanguage';
import { Zap, Home, Building2 } from 'lucide-react';

export function EnergyDemandCard() {
  const { t } = useLanguage();
  const monthlyConsumptionKWh = useSolarStore((s) => s.monthlyConsumptionKWh);
  const setMonthlyConsumption = useSolarStore((s) => s.setMonthlyConsumption);

  const annualConsumptionKWh = monthlyConsumptionKWh * 12;

  const presets = [
    { label: t.energyDemand.presets.apartment, kwh: 450, icon: Home },
    { label: t.energyDemand.presets.townhouse, kwh: 650, icon: Home },
    { label: t.energyDemand.presets.familyHome, kwh: 950, icon: Home },
    { label: t.energyDemand.presets.commercial, kwh: 2400, icon: Building2 },
  ];

  return (
    <div className="space-y-3.5">
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            {t.energyDemand.monthlyConsumption}
          </span>
          <span className="text-[10px] font-mono text-slate-400">{t.energyDemand.annualConsumption}</span>
        </div>

        {/* Input & Unit */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="number"
              min={100}
              max={25000}
              step={50}
              value={monthlyConsumptionKWh}
              onChange={(e) => setMonthlyConsumption(parseInt(e.target.value) || 100)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-base font-bold font-mono text-white focus:outline-none focus:border-amber-400 pr-14"
            />
            <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">
              kWh/mo
            </span>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-400">{t.energyDemand.annualConsumption}</div>
            <div className="text-xs font-bold font-mono text-amber-300">
              {annualConsumptionKWh.toLocaleString()} kWh/yr
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="text-[11px] text-slate-400 mb-1.5">{t.energyDemand.monthlyConsumption} {t.energyDemand.presetsLabel}</div>
          <div className="grid grid-cols-4 gap-1.5">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setMonthlyConsumption(preset.kwh)}
                className={`p-2 rounded-lg text-center transition-all border ${
                  monthlyConsumptionKWh === preset.kwh
                    ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                    : 'border-slate-800 bg-slate-950 hover:bg-slate-800/60 text-slate-400'
                }`}
              >
                <div className="text-xs font-bold font-mono">{preset.kwh}</div>
                <div className="text-[9px] text-slate-400 truncate">{preset.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
