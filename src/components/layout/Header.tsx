import { useState } from 'react';
import { useSolarStore } from '../../store/useSolarStore';
import { useGuidanceStore } from '../../store/useGuidanceStore';
import { useRouter } from '../../router/Router';
import { useLanguage } from '../../i18n/useLanguage';
import { Sun, Play, RotateCcw, Building2, Home, FileText, HelpCircle } from 'lucide-react';
import { SolarReportModal } from '../ui/SolarReportModal';

export function Header() {
  const selectedBuildingId = useSolarStore((s) => s.selectedBuildingId);
  const buildings = useSolarStore((s) => s.buildings);
  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId);
  const resetToDefaultView = useSolarStore((s) => s.resetToDefaultView);
  const startDemoTour = useSolarStore((s) => s.startDemoTour);
  const isDemoPlaying = useSolarStore((s) => s.isDemoPlaying);
  const selectBuilding = useSolarStore((s) => s.selectBuilding);
  const openHelpModal = useGuidanceStore((s) => s.openHelpModal);

  const { navigate } = useRouter();
  const { language, toggleLanguage, t } = useLanguage();
  const [isReportOpen, setIsReportOpen] = useState(false);

  return (
    <>
      <header className="h-16 w-full glass-panel border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between z-20 shrink-0">
        {/* Brand & Logo */}
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => navigate('/')}
            title="Return to Public Landing Page"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1 font-sans">
                  Roof<span className="text-amber-400">Ray</span>
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  AI STUDIO v3.0
                </span>
              </div>
              <p className="hidden md:block text-[10px] text-slate-400">
                Interactive 3D Solar Rooftop Planning & Shade Analysis
              </p>
            </div>
          </div>

          {/* Building Selector Dropdown */}
          <div data-tour="building-selector" className="hidden lg:flex items-center ml-4 pl-4 border-l border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Building2 className="w-4 h-4 text-sky-400" />
              <span className="text-slate-400">{t.nav.activeBuilding}</span>
              <select
                value={selectedBuilding?.id || ''}
                onChange={(e) => selectBuilding(e.target.value || null)}
                className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-medium cursor-pointer"
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.width}m × {b.length}m)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Back to Home Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-all"
            title="Return to Public Landing Page"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.nav.home}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-all"
            title="Switch Language (English / বাংলা)"
          >
            <span className="font-semibold">{language === 'en' ? 'বাংলা' : 'EN'}</span>
          </button>

          {/* Export Report Button */}
          <button
            onClick={() => setIsReportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-medium transition-all shadow-sm"
            title="Open printable / downloadable solar assessment report"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">{t.nav.exportReport || 'Report'}</span>
          </button>

          {/* Reset Camera Button */}
          <button
            data-tour="reset-camera"
            onClick={resetToDefaultView}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-all"
            title="Reset Orbit Camera to Neighborhood Overview"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t.nav.resetCamera}</span>
          </button>

          {/* Guide & Help Button */}
          <button
            id="tour-guide-help"
            data-tour="guide-help"
            onClick={openHelpModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-950/30 hover:bg-purple-900/40 text-purple-200 hover:text-white text-xs font-semibold transition-all shadow-sm"
            title="Open interactive tutorials and navigation guides"
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">{t.nav.guideHelp || 'Guide & Help'}</span>
          </button>

          {/* Run Demo Button (Primary Hackathon CTA) */}
          <button
            onClick={startDemoTour}
            disabled={isDemoPlaying}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-lg text-xs font-semibold shadow-lg transition-all ${
              isDemoPlaying
                ? 'bg-amber-600/50 text-amber-200 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{t.nav.runDemo}</span>
          </button>
        </div>
      </header>

      {/* Global Report Modal */}
      <SolarReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </>
  );
}
