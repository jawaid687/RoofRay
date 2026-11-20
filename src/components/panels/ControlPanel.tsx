import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../i18n/useLanguage';
import { useGuidanceStore } from '../../store/useGuidanceStore';
import { LocationTimeCard } from './LocationTimeCard';
import { BuildingInspector } from './BuildingInspector';
import { SolarAnalysisCard } from './SolarAnalysisCard';
import { PanelConfigCard } from './PanelConfigCard';
import { EnergyDemandCard } from './EnergyDemandCard';
import { OptimizationCard } from './OptimizationCard';
import { FinancialSummary } from './FinancialSummary';
import { RecommendationCard } from './RecommendationCard';
import { ManualLayoutPanel } from './ManualLayoutPanel';
import { AiAdvisorPanel } from './AiAdvisorPanel';
import { SolarReportModal } from '../ui/SolarReportModal';
import {
  Globe,
  Building2,
  Sparkles,
  Cpu,
  Zap,
  Target,
  BarChart3,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  MousePointer,
} from 'lucide-react';

type SectionKey = 'location' | 'building' | 'analysis' | 'panels' | 'demand' | 'optimization' | 'financials' | 'recommendation';

export function ControlPanel() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'planner' | 'manual' | 'analytics' | 'advisor' | 'rationale'>('planner');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isWide, setIsWide] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const notifyTabChange = useGuidanceStore((s) => s.notifyTabChange);
  const activeSectionTab = useGuidanceStore((s) => s.activeSectionTab);

  // Sync activeTab when guidance store switches tab
  useEffect(() => {
    if (activeSectionTab && activeSectionTab !== activeTab) {
      setActiveTab(activeSectionTab);
    }
  }, [activeSectionTab, activeTab]);

  // Initial tab notification on mount
  useEffect(() => {
    notifyTabChange('planner');
  }, [notifyTabChange]);

  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    location: true,
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

  // Reset scroll container to top whenever active tab changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  const handleTabChange = (tab: 'planner' | 'manual' | 'analytics' | 'advisor' | 'rationale') => {
    setActiveTab(tab);
    notifyTabChange(tab);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  return (
    <aside className={`w-full ${isWide && activeTab === 'advisor' ? 'lg:w-[680px] xl:w-[780px] 2xl:w-[860px]' : 'lg:w-[440px] xl:w-[480px]'} h-[calc(100vh-3.5rem)] glass-panel bg-[#080c15]/98 border-l border-slate-800 flex flex-col shrink-0 z-10 overflow-hidden transition-all duration-300 ease-in-out`}>
      {/* Top Segmented Tab Switcher */}
      <div className="flex border-b border-slate-800 bg-[#0a0f1d] p-1.5 gap-1 shrink-0 overflow-x-auto">
        <button
          onClick={() => handleTabChange('planner')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'planner'
              ? 'bg-slate-800 text-amber-400 font-semibold border border-slate-700/80 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent font-medium'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>{t.app.plannerTab}</span>
        </button>

        <button
          onClick={() => handleTabChange('manual')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'manual'
              ? 'bg-slate-800 text-amber-400 font-semibold border border-slate-700/80 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent font-medium'
          }`}
        >
          <MousePointer className="w-3.5 h-3.5" />
          <span>{t.app.manualTab}</span>
        </button>

        <button
          onClick={() => handleTabChange('analytics')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-slate-800 text-amber-400 font-semibold border border-slate-700/80 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent font-medium'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>{t.app.analyticsTab}</span>
        </button>

        <button
          onClick={() => handleTabChange('advisor')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'advisor'
              ? 'bg-slate-800 text-amber-400 font-semibold border border-slate-700/80 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent font-medium'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.app.aiAdvisorTab}</span>
        </button>

        <button
          onClick={() => handleTabChange('rationale')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'rationale'
              ? 'bg-slate-800 text-amber-400 font-semibold border border-slate-700/80 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent font-medium'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{t.app.rationaleTab}</span>
        </button>
      </div>

      {/* Content Body with Guaranteed Scroll Reset */}
      <div
        ref={scrollContainerRef}
        className={`flex-1 ${
          activeTab === 'advisor'
            ? 'overflow-hidden flex flex-col p-0'
            : 'overflow-y-auto p-3.5 space-y-3'
        }`}
      >
        {activeTab === 'planner' && (
          <>
            {/* Section 1: Astronomical Location & Time */}
            <div className="rounded-xl border border-slate-800 bg-[#0c1322] overflow-hidden shadow-sm">
              <button
                onClick={() => toggleSection('location')}
                className="w-full p-3 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.controlPanel.section1}</span>
                </div>
                {openSections.location ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
              {openSections.location && (
                <div className="p-3 pt-0 border-t border-slate-800/60">
                  <LocationTimeCard />
                </div>
              )}
            </div>

            {/* Section 2: Building Inspector */}
            <div className="rounded-xl border border-slate-800 bg-[#0c1322] overflow-hidden shadow-sm">
              <button
                onClick={() => toggleSection('building')}
                className="w-full p-3 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>{t.controlPanel.section2}</span>
                </div>
                {openSections.building ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
              {openSections.building && (
                <div className="p-3 pt-0 border-t border-slate-800/60">
                  <BuildingInspector />
                </div>
              )}
            </div>

            {/* Section 3: Solar Potential Analysis */}
            <div className="rounded-xl border border-slate-800 bg-[#0c1322] overflow-hidden shadow-sm">
              <button
                onClick={() => toggleSection('analysis')}
                className="w-full p-3 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.controlPanel.section3}</span>
                </div>
                {openSections.analysis ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
              {openSections.analysis && (
                <div className="p-3 pt-0 border-t border-slate-800/60">
                  <SolarAnalysisCard />
                </div>
              )}
            </div>

            {/* Section 4: Solar Module Specification */}
            <div className="rounded-xl border border-slate-800 bg-[#0c1322] overflow-hidden shadow-sm">
              <button
                onClick={() => toggleSection('panels')}
                className="w-full p-3 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-sky-400" />
                  <span>{t.controlPanel.section4}</span>
                </div>
                {openSections.panels ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
              {openSections.panels && (
                <div className="p-3 pt-0 border-t border-slate-800/60">
                  <PanelConfigCard />
                </div>
              )}
            </div>

            {/* Section 5: Target Electricity Demand */}
            <div className="rounded-xl border border-slate-800 bg-[#0c1322] overflow-hidden shadow-sm">
              <button
                onClick={() => toggleSection('demand')}
                className="w-full p-3 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.controlPanel.section5}</span>
                </div>
                {openSections.demand ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
              {openSections.demand && (
                <div className="p-3 pt-0 border-t border-slate-800/60">
                  <EnergyDemandCard />
                </div>
              )}
            </div>

            {/* Section 6: Optimization Objective */}
            <div className="rounded-xl border border-slate-800 bg-[#0c1322] overflow-hidden shadow-sm">
              <button
                onClick={() => toggleSection('optimization')}
                className="w-full p-3 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.controlPanel.section6}</span>
                </div>
                {openSections.optimization ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
              {openSections.optimization && (
                <div className="p-3 pt-0 border-t border-slate-800/60">
                  <OptimizationCard />
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'manual' && (
          <div className="space-y-4">
            <ManualLayoutPanel />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-3">
            <FinancialSummary onNavigateToPlanner={() => handleTabChange('planner')} />
            <div className="p-2.5 rounded-lg bg-[#0c1322] border border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
              <span className="font-medium text-slate-300">{t.controlPanel.engineeringAssumptions}</span>
              <span className="font-mono text-sky-400">NREL • SREDA • NOAA</span>
            </div>
          </div>
        )}

        {activeTab === 'advisor' && (
          <AiAdvisorPanel
            onOpenReportModal={() => setIsReportOpen(true)}
            isWide={isWide}
            onToggleWide={() => setIsWide((prev) => !prev)}
          />
        )}

        {activeTab === 'rationale' && (
          <div className="space-y-4">
            <RecommendationCard onNavigateToPlanner={() => handleTabChange('planner')} />
          </div>
        )}
      </div>

      {/* Exportable Solar Recommendation Report Modal */}
      <SolarReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </aside>
  );
}
