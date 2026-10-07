import { useSolarStore } from '../../store/useSolarStore';
import { Play, CheckCircle2, X } from 'lucide-react';

export function DemoTourOverlay() {
  const isDemoPlaying = useSolarStore((s) => s.isDemoPlaying);
  const demoStep = useSolarStore((s) => s.demoStep);
  const demoStatusText = useSolarStore((s) => s.demoStatusText);
  const stopDemoTour = useSolarStore((s) => s.stopDemoTour);

  if (!isDemoPlaying && demoStep === 0) return null;

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
      <div className="glass-panel border-amber-500/40 rounded-2xl px-5 py-3 shadow-2xl flex items-center gap-4 text-sm animate-pulse-subtle">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
          {isDemoPlaying ? (
            <Play className="w-4 h-4 fill-amber-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
        </div>

        <div>
          <div className="font-semibold text-slate-100 flex items-center gap-2">
            <span>Automated Hackathon Demo</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
              Step {demoStep}/6
            </span>
          </div>
          <div className="text-xs text-slate-300 font-mono mt-0.5 max-w-md">
            {demoStatusText}
          </div>
        </div>

        <button
          onClick={stopDemoTour}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Close Tour Banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
