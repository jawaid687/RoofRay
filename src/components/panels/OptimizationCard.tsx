import { useSolarStore } from '../../store/useSolarStore';
import { OptimizationMode } from '../../types';
import { Target, Zap, DollarSign, Scale, Sparkles } from 'lucide-react';

export function OptimizationCard() {
  const optimizationMode = useSolarStore((s) => s.optimizationMode);
  const setOptimizationMode = useSolarStore((s) => s.setOptimizationMode);
  const generateSolarLayout = useSolarStore((s) => s.generateSolarLayout);

  const modes: {
    id: OptimizationMode;
    title: string;
    description: string;
    icon: typeof Target;
    badge: string;
  }[] = [
    {
      id: 'need',
      title: 'Meet My Electricity Need',
      description: 'Sizes system to match ~100% of demand without oversizing excess export.',
      icon: Target,
      badge: 'Demand Match',
    },
    {
      id: 'max_generation',
      title: 'Maximum Solar Generation',
      description: 'Maximizes panel density on all unshaded roof cells for peak power yield.',
      icon: Zap,
      badge: 'Max Yield',
    },
    {
      id: 'lowest_cost',
      title: 'Lowest Initial Cost',
      description: 'Deploys a compact array covering baseline daytime load with low upfront cost.',
      icon: DollarSign,
      badge: 'Budget Capex',
    },
    {
      id: 'balanced',
      title: 'Best Value / Balanced',
      description: 'Optimal 85–95% demand coverage balancing ROI, roof quality, and payback.',
      icon: Scale,
      badge: 'Recommended',
    },
  ];

  return (
    <div className="space-y-3.5">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>Optimization Objective</span>
          <span className="text-[10px] text-amber-400 font-mono">Select Strategy</span>
        </label>

        <div className="space-y-2">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = optimizationMode === mode.id;

            return (
              <div
                key={mode.id}
                onClick={() => setOptimizationMode(mode.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-sky-400 bg-sky-950/40 shadow-md shadow-sky-500/10'
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`w-4 h-4 ${
                        isSelected ? 'text-sky-400' : 'text-slate-400'
                      }`}
                    />
                    <span className="text-xs font-bold text-white">{mode.title}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {mode.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pl-6">{mode.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Button to re-generate layout */}
      <button
        onClick={generateSolarLayout}
        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-[0.99]"
      >
        <Sparkles className="w-4 h-4 fill-current" />
        <span>Generate Solar Layout</span>
      </button>
    </div>
  );
}
