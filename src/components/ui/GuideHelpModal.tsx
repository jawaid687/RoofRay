import { useGuidanceStore } from '../../store/useGuidanceStore';
import { useLanguage } from '../../i18n/useLanguage';
import {
  X,
  Compass,
  Building2,
  MousePointer,
  BarChart3,
  Sparkles,
  HelpCircle,
  Play,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { TutorialSectionKey } from '../../config/tutorialContent';

interface GuideItem {
  id: 'camera' | TutorialSectionKey;
  icon: React.ReactNode;
  titleKey: string;
  descKey: string;
  isSection: boolean;
}

export function GuideHelpModal() {
  const isHelpModalOpen = useGuidanceStore((s) => s.isHelpModalOpen);
  const closeHelpModal = useGuidanceStore((s) => s.closeHelpModal);
  const showCameraGuidance = useGuidanceStore((s) => s.showCameraGuidance);
  const startSectionTutorial = useGuidanceStore((s) => s.startSectionTutorial);
  const isSectionCompleted = useGuidanceStore((s) => s.isSectionCompleted);
  const isCameraCompleted = useGuidanceStore((s) => s.isCameraCompleted);

  const { t } = useLanguage();

  if (!isHelpModalOpen) return null;

  const guideItems: GuideItem[] = [
    {
      id: 'camera',
      icon: <Compass className="w-4 h-4 text-amber-400" />,
      titleKey: t.guideHelp?.cameraGuide || 'Camera & 3D Navigation Guide',
      descKey: t.guideHelp?.cameraDesc || 'Explore orbit rotation, panning, zoom, and full neighborhood framing.',
      isSection: false,
    },
    {
      id: 'planner',
      icon: <Building2 className="w-4 h-4 text-amber-400" />,
      titleKey: t.guideHelp?.plannerGuide || 'Planner Guide',
      descKey: t.guideHelp?.plannerDesc || 'Learn building selection, ephemeris sun paths, and 3D raycasting.',
      isSection: true,
    },
    {
      id: 'manual',
      icon: <MousePointer className="w-4 h-4 text-amber-400" />,
      titleKey: t.guideHelp?.manualGuide || 'Manual Studio Guide',
      descKey: t.guideHelp?.manualDesc || 'Master panel placement, rotation, setbacks, and heuristic layout.',
      isSection: true,
    },
    {
      id: 'analytics',
      icon: <BarChart3 className="w-4 h-4 text-sky-400" />,
      titleKey: t.guideHelp?.economicsGuide || 'Economics Guide',
      descKey: t.guideHelp?.economicsDesc || 'Understand CapEx, payback, tariffs, net metering, and 20-year ROI.',
      isSection: true,
    },
    {
      id: 'advisor',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      titleKey: t.guideHelp?.advisorGuide || 'AI Advisor Guide',
      descKey: t.guideHelp?.advisorDesc || 'Consult the conversational AI engineer grounded in regional regulations.',
      isSection: true,
    },
    {
      id: 'rationale',
      icon: <HelpCircle className="w-4 h-4 text-emerald-400" />,
      titleKey: t.guideHelp?.whyPlanGuide || 'Why Plan Guide',
      descKey: t.guideHelp?.whyPlanDesc || 'Review engineering rationale, obstacle setbacks, and shade avoidance.',
      isSection: true,
    },
  ];

  const handleLaunch = (item: GuideItem) => {
    closeHelpModal();
    if (item.id === 'camera') {
      showCameraGuidance();
    } else {
      startSectionTutorial(item.id, true);
    }
  };

  return (
    <div id="guide-help-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-xl glass-panel bg-[#0d1527] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {t.guideHelp?.title || 'Guide & Help'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {t.guideHelp?.subtitle || 'Interactive step-by-step guidance for RoofRay modules'}
              </p>
            </div>
          </div>

          <button
            id="guide-help-close-btn"
            onClick={closeHelpModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Guide & Help"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Guides List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
          {guideItems.map((item) => {
            const completed = item.id === 'camera' ? isCameraCompleted() : isSectionCompleted(item.id);

            return (
              <div
                key={item.id}
                id={`guide-card-${item.id}`}
                data-guide-id={item.id}
                className="p-3.5 rounded-xl border border-slate-800 bg-[#080d19] hover:bg-slate-900/90 hover:border-slate-700 transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors truncate">
                        {item.titleKey}
                      </h4>
                      {completed && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>{t.guideHelp?.completed || 'Completed'}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5 line-clamp-2">
                      {item.descKey}
                    </p>
                  </div>
                </div>

                <button
                  id={`guide-launch-${item.id}`}
                  data-guide-launch={item.id}
                  onClick={() => handleLaunch(item)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all active:scale-95 ${
                    completed
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold'
                  }`}
                >
                  {completed ? (
                    <>
                      <RotateCcw className="w-3 h-3 text-amber-400" />
                      <span>Restart</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>Start</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#080d19] flex items-center justify-between text-[11px] text-slate-500">
          <span>Tutorials can be reviewed anytime without losing simulation progress.</span>
          <button
            id="guide-help-footer-close-btn"
            onClick={closeHelpModal}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            {t.guideHelp?.close || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
