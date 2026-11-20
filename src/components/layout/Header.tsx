import { useState } from 'react';
import { useSolarStore } from '../../store/useSolarStore';
import { useGuidanceStore } from '../../store/useGuidanceStore';
import { useRouter } from '../../router/Router';
import { useLanguage } from '../../i18n/useLanguage';
import { Play, RotateCcw, Building2, Home, FileText, HelpCircle } from 'lucide-react';
import { SolarReportModal } from '../ui/SolarReportModal';
import { RoofRayLogo } from '../ui/RoofRayLogo';

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
      <header className="h-14 w-full glass-panel border-b border-slate-800 bg-[#080c15]/95 px-4 sm:px-5 flex items-center justify-between z-20 shrink-0">
        {/* Brand & Building Selection */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => navigate('/')}
            title="Return to Public Landing Page"
          >
            <RoofRayLogo size={28} />
            <span className="text-base font-bold tracking-tight text-white font-sans">
              RoofRay
            </span>
          </div>

          {/* Building Selector Dropdown */}
          <div data-tour="building-selector" className="hidden lg:flex items-center ml-2 pl-3 border-l border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400 text-[11px]">{t.nav.activeBuilding}</span>
              <select
                value={selectedBuilding?.id || ''}
                onChange={(e) => selectBuilding(e.target.value || null)}
                className="bg-slate-900 border border-slate-700/80 rounded-md px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-medium cursor-pointer"
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
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Back to Home Button */}
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-all"
            title={t.nav.home || 'Home'}
            aria-label={t.nav.home || 'Home'}
          >
            <Home className="w-4 h-4 text-slate-300" />
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all"
            title="Switch Language (English / বাংলা)"
            aria-label="Switch Language"
          >
            <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
          </button>

          {/* Export Report Button */}
          <button
            onClick={() => setIsReportOpen(true)}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-medium transition-all"
            title={t.nav.exportReport || 'Report'}
            aria-label={t.nav.exportReport || 'Report'}
          >
            <FileText className="w-4 h-4 text-sky-400" />
          </button>

          {/* Reset Camera Button */}
          <button
            data-tour="reset-camera"
            onClick={resetToDefaultView}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-all"
            title={t.nav.resetCamera || 'Reset Camera'}
            aria-label={t.nav.resetCamera || 'Reset Camera'}
          >
            <RotateCcw className="w-4 h-4 text-slate-300" />
          </button>

          {/* Guide & Help Button */}
          <button
            id="tour-guide-help"
            data-tour="guide-help"
            onClick={openHelpModal}
            className="p-2 rounded-lg border border-slate-700/80 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold transition-all shadow-sm"
            title={t.nav.guideHelp || 'Guide & Help'}
            aria-label={t.nav.guideHelp || 'Guide & Help'}
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </button>

          {/* Run Demo Button (Primary Hackathon CTA) */}
          <button
            onClick={startDemoTour}
            disabled={isDemoPlaying}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
              isDemoPlaying
                ? 'bg-amber-600/50 text-amber-200 cursor-not-allowed'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold active:scale-95'
            }`}
            title={t.nav.runDemo || 'Run Demo'}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">{t.nav.runDemo}</span>
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
