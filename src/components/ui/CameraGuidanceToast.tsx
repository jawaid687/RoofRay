import { useSolarStore } from '../../store/useSolarStore';
import { useGuidanceStore } from '../../store/useGuidanceStore';
import { useLanguage } from '../../i18n/useLanguage';
import { Maximize2, X, Compass } from 'lucide-react';

export function CameraGuidanceToast() {
  const isCameraGuidanceOpen = useGuidanceStore((s) => s.isCameraGuidanceOpen);
  const dismissCameraGuidance = useGuidanceStore((s) => s.dismissCameraGuidance);
  const fitFullModel = useSolarStore((s) => s.fitFullModel);
  const { t } = useLanguage();

  if (!isCameraGuidanceOpen) return null;

  const handleFitFull = () => {
    fitFullModel();
    dismissCameraGuidance(true);
  };

  const handleGotIt = () => {
    dismissCameraGuidance(true);
  };

  return (
    <div
      id="camera-guidance-toast"
      className="absolute top-4 left-4 z-20 max-w-sm pointer-events-auto animate-fade-in"
    >
      <div className="glass-panel bg-[#0d1628]/95 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl backdrop-blur-xl flex flex-col gap-2.5">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400 mt-0.5">
            <Compass className="w-4 h-4" />
          </div>

          <div className="flex-1 pr-1">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{t.cameraGuidance?.heading || 'Welcome to RoofRay!'}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
              {t.cameraGuidance?.message || 'Zoom out for a better view of the complete 3D building model.'}
            </p>
          </div>

          <button
            onClick={handleGotIt}
            className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors shrink-0 -mr-1 -mt-1"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/80">
          <button
            onClick={handleFitFull}
            className="px-2.5 py-1 rounded-md bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="Reset camera to complete neighborhood view"
          >
            <Maximize2 className="w-3 h-3" />
            <span>{t.cameraGuidance?.fitFullModel || 'Fit Full Model'}</span>
          </button>

          <button
            onClick={handleGotIt}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[11px] font-medium transition-colors"
          >
            {t.cameraGuidance?.gotIt || 'Got It'}
          </button>
        </div>
      </div>
    </div>
  );
}
