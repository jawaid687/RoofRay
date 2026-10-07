import { useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Scene } from './three/Scene';
import { ControlPanel } from './components/panels/ControlPanel';
import { ViewportControls } from './components/layout/ViewportControls';
import { HeatmapLegend } from './components/ui/HeatmapLegend';
import { DemoTourOverlay } from './components/ui/DemoTourOverlay';
import { useSolarStore } from './store/useSolarStore';

export function App() {
  const resetToDefaultView = useSolarStore((s) => s.resetToDefaultView);
  const showHeatmap = useSolarStore((s) => s.showHeatmap);
  const setShowHeatmap = useSolarStore((s) => s.setShowHeatmap);
  const startDemoTour = useSolarStore((s) => s.startDemoTour);

  // Global keyboard shortcuts for pro demoing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        resetToDefaultView();
      } else if (e.key === 'h' || e.key === 'H') {
        setShowHeatmap(!showHeatmap);
      } else if (e.code === 'Space') {
        e.preventDefault();
        startDemoTour();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetToDefaultView, showHeatmap, setShowHeatmap, startDemoTour]);

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Application Navigation Bar */}
      <Header />

      {/* Main Workspace Body */}
      <main className="flex-1 flex w-full h-[calc(100vh-4rem)] relative overflow-hidden">
        {/* Left 3D Interactive Viewport */}
        <div className="flex-1 h-full relative overflow-hidden bg-slate-950">
          {/* Three.js R3F 3D Canvas */}
          <Scene />

          {/* Floating Exposure Heatmap Legend */}
          <HeatmapLegend />

          {/* Floating Time of Day & Diurnal Lighting Controls */}
          <ViewportControls />

          {/* Automated Hackathon Demo Banner */}
          <DemoTourOverlay />

          {/* Subtle Viewport Watermark & Controls Tooltip */}
          <div className="absolute top-4 right-4 z-10 pointer-events-none hidden md:flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-slate-950/70 px-2.5 py-1 rounded-md border border-slate-800/60">
            <span>Left-Click: Rotate / Select</span>
            <span>•</span>
            <span>Right-Click: Pan</span>
            <span>•</span>
            <span>Scroll: Zoom</span>
          </div>
        </div>

        {/* Right Analysis, Optimization & Economics Panel */}
        <ControlPanel />
      </main>
    </div>
  );
}

export default App;
