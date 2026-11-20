import { useState, useEffect, useCallback } from 'react';
import { useSolarStore } from '../../store/useSolarStore';
import { Maximize2, X, Compass } from 'lucide-react';

const STORAGE_KEY = 'roofray_camera_guidance_dismissed';

export function CameraGuidanceToast() {
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return !window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return false;
    }
  });

  const fitFullModel = useSolarStore((s) => s.fitFullModel);

  const dismiss = useCallback(() => {
    setVisible(false);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, 'true');
      } catch {
        // ignore
      }
    }
  }, []);

  const handleFitFull = () => {
    fitFullModel();
    dismiss();
  };

  useEffect(() => {
    if (!visible) return;

    // Auto-dismiss after 8 seconds
    const timer = setTimeout(() => {
      dismiss();
    }, 8000);

    // Auto-dismiss on user camera interaction (mouse wheel or drag gesture)
    const handleInteraction = (e: Event) => {
      // If clicking inside the toast itself, don't dismiss immediately
      const target = e.target as HTMLElement | null;
      if (target?.closest('#camera-guidance-toast')) return;
      dismiss();
    };

    window.addEventListener('wheel', handleInteraction, { passive: true, once: true });
    window.addEventListener('pointerdown', handleInteraction, { passive: true, once: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('wheel', handleInteraction);
      window.removeEventListener('pointerdown', handleInteraction);
    };
  }, [visible, dismiss]);

  if (!visible) return null;

  return (
    <div
      id="camera-guidance-toast"
      className="absolute top-4 left-4 z-20 max-w-sm pointer-events-auto animate-fade-in"
    >
      <div className="glass-panel bg-slate-900/90 border border-purple-500/40 rounded-xl p-3.5 shadow-2xl backdrop-blur-xl flex flex-col gap-2.5">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0 text-purple-300 mt-0.5">
            <Compass className="w-4 h-4" />
          </div>

          <div className="flex-1 pr-1">
            <div className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
              <span>Explore 3D Neighborhood</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
              Zoom out for a better view! Use your mouse scroll wheel or trackpad to explore the complete 3D model and surrounding buildings.
            </p>
          </div>

          <button
            onClick={dismiss}
            className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors shrink-0 -mr-1 -mt-1"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/80">
          <button
            onClick={handleFitFull}
            className="px-2.5 py-1 rounded-md bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-200 text-[11px] font-medium flex items-center gap-1.5 transition-all shadow-sm"
            title="Reset camera to complete neighborhood view"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Fit Full Model</span>
          </button>

          <button
            onClick={dismiss}
            className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
