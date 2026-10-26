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
  const setCityPreset = useSolarStore((s) => s.setCityPreset);
  const setDate = useSolarStore((s) => s.setDate);
  const setTimeOfDay = useSolarStore((s) => s.setTimeOfDay);
  const selectBuilding = useSolarStore((s) => s.selectBuilding);
  const setHeatmapMode = useSolarStore((s) => s.setHeatmapMode);
  const setSelectedMonth = useSolarStore((s) => s.setSelectedMonth);

  // Initialize from URL search parameters if provided (e.g. ?city=syd&date=2026-12-21&time=12.0&mode=annual)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const city = params.get('city');
      const date = params.get('date');
      const time = params.get('time');
      const bldg = params.get('building');
      const mode = params.get('mode');
      const month = params.get('month');

      if (city) {
        setCityPreset(city);
      }
      if (date) {
        const parts = date.split('-').map(Number);
        if (parts.length === 3 && !Number.isNaN(parts[0])) {
          setDate(parts[0], parts[1], parts[2]);
        }
      }
      if (time !== null && !Number.isNaN(parseFloat(time))) {
        setTimeOfDay(parseFloat(time));
      }
      if (bldg) {
        selectBuilding(bldg);
      }
      if (mode === 'live' || mode === 'annual' || mode === 'monthly') {
        setHeatmapMode(mode);
      }
      if (month !== null && !Number.isNaN(parseInt(month, 10))) {
        setSelectedMonth(parseInt(month, 10));
      }
    } catch (err) {
      console.warn('Failed to parse URL search params:', err);
    }
  }, [setCityPreset, setDate, setTimeOfDay, selectBuilding, setHeatmapMode, setSelectedMonth]);

  const togglePanelOrientation = useSolarStore((s) => s.togglePanelOrientation);
  const deleteSelectedPanels = useSolarStore((s) => s.deleteSelectedPanels);
  const undo = useSolarStore((s) => s.undo);
  const redo = useSolarStore((s) => s.redo);
  const setSelectedPanelIds = useSolarStore((s) => s.setSelectedPanelIds);
  const placedPanels = useSolarStore((s) => s.placedPanels);

  // Global keyboard shortcuts for pro demoing and manual placement (PRD FR-7)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        redo();
        return;
      }

      // Select All panels
      if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
        if (placedPanels.length > 0) {
          e.preventDefault();
          setSelectedPanelIds(placedPanels.map((p) => p.id));
        }
        return;
      }

      // Rotate / orientation toggle
      if (e.key === 'q' || e.key === 'Q' || e.key === 'e' || e.key === 'E' || e.key === 't' || e.key === 'T') {
        togglePanelOrientation();
        return;
      }

      // Delete selected panels
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelectedPanels();
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
  }, [
    resetToDefaultView,
    showHeatmap,
    setShowHeatmap,
    startDemoTour,
    togglePanelOrientation,
    deleteSelectedPanels,
    undo,
    redo,
    setSelectedPanelIds,
    placedPanels,
  ]);

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
