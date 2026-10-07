import { useState } from 'react';
import { BuildingInspector } from './BuildingInspector';
import { SolarAnalysisCard } from './SolarAnalysisCard';
import { PanelConfigCard } from './PanelConfigCard';
import { EnergyDemandCard } from './EnergyDemandCard';
import { OptimizationCard } from './OptimizationCard';
import { FinancialSummary } from './FinancialSummary';
import { RecommendationCard } from './RecommendationCard';
import {
  Building2,
  Sparkles,
  Cpu,
  Zap,
  Target,
  BarChart3,
  HelpCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

type SectionKey = 'building' | 'analysis' | 'panels' | 'demand' | 'optimization' | 'financials' | 'recommendation';

export function ControlPanel() {
  const [activeTab, setActiveTab] = useState<'planner' | 'analytics' | 'rationale'>('planner');
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    building: true,
    analysis: true,
    panels: true,
    demand: true,
    optimization: true,
    financials: true,
    recommendation: true,
  });

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside className="w-full lg:w-[440px] xl:w-[480px] h-[calc(100vh-4rem)] glass-panel border-l border-slate-800/80 flex flex-col shrink-0 z-10 overflow-hidden">
      {/* Top Tab Switcher */}
      <div className="flex border-b border-slate-800/80 bg-slate-950/40 p-2 gap-1 shrink-0">
        <button
          onClick={() => setActiveTab('planner')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'planner'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Rooftop Planner</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'analytics'
              ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Economics</span>
        </button>

        <button
          onClick={() => setActiveTab('rationale')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'rationale'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Why This Plan</span>
        </button>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'planner' && (
          <>
            {/* Section 1: Building Inspector */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/50 overflow-hidden shadow-sm">
              <button
                onClick={() => toggleSection('building')}
                className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-slate-200 hover:bg-slate-900/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-sky-400" />
                  <span>1. Selected Building & Roof Geometry</span>
                </div>
                {openSections.building ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>
              {openSections.building && (
                <div className="p-3.5 pt-0 border-t border-slate-800/40">
                  <BuildingInspector />
                </div>
              )}
            </div>

            {/* Section 2: Solar Potential Analysis */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/50 overflow-hidden shadow-sm">
              <button
                onClick={() => toggleSection('analysis')}
                className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-slate-200 hover:bg-slate-900/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>2. Raycast Sunlight & Shading Analysis</span>
                </div>
                {openSections.analysis ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>
              {openSections.analysis && (
                <div className="p-3.5 pt-0 border-t border-slate-800/40">
                  <SolarAnalysisCard />
                </div>
              )}
            </div>

            {/* Section 3: Solar Module Specification */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/50 overflow-hidden shadow-sm">
              <button
                onClick={() => toggleSection('panels')}
                className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-slate-200 hover:bg-slate-900/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-sky-400" />
                  <span>3. Solar Panel Hardware Configuration</span>
                </div>
                {openSections.panels ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>
              {openSections.panels && (
                <div className="p-3.5 pt-0 border-t border-slate-800/40">
                  <PanelConfigCard />
                </div>
              )}
            </div>

            {/* Section 4: Target Electricity Demand */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/50 overflow-hidden shadow-sm">
              <button
                onClick={() => toggleSection('demand')}
                className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-slate-200 hover:bg-slate-900/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>4. Electricity Consumption Target</span>
                </div>
                {openSections.demand ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>
              {openSections.demand && (
                <div className="p-3.5 pt-0 border-t border-slate-800/40">
                  <EnergyDemandCard />
                </div>
              )}
            </div>

            {/* Section 5: Optimization Objective */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/50 overflow-hidden shadow-sm">
              <button
                onClick={() => toggleSection('optimization')}
                className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-slate-200 hover:bg-slate-900/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span>5. Optimization Strategy & Layout</span>
                </div>
                {openSections.optimization ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>
              {openSections.optimization && (
                <div className="p-3.5 pt-0 border-t border-slate-800/40">
                  <OptimizationCard />
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <FinancialSummary />
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1.5">
              <div className="font-semibold text-slate-300">Engineering Assumptions</div>
              <p className="text-[11px] leading-relaxed">
                Calculated assuming 4.6 peak sun-hours/day, 82% system performance ratio, $0.165/kWh grid power rate, and $1,850/kW turnkey installation cost. Self-consumed electricity offsets retail utility tariffs directly.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'rationale' && (
          <div className="space-y-4">
            <RecommendationCard />
          </div>
        )}
      </div>
    </aside>
  );
}
