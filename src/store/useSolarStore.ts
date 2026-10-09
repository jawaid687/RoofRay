import { create } from 'zustand';
import {
  Building,
  SolarAnalysisResult,
  OptimizationMode,
  PlacedPanel,
  RoofObstacle,
  EnergyResult,
  FinancialResult,
  EnvironmentalResult,
  SolarRecommendation,
  AnalysisStatus,
  LayoutStatus,
  PanelType,
} from '../types';
import { INITIAL_BUILDINGS } from '../data/buildings';
import { PANEL_TYPES } from '../data/panelTypes';
import { generateRoofGrid } from '../simulation/roofGrid';
import { analyzeRoofExposure } from '../simulation/shadowRaycaster';
import { calculateSolarMetrics } from '../simulation/suitability';
import { runOptimization } from '../optimization/optimizationEngine';
import { calculateEnergyProfile } from '../calculations/energy';
import { calculateFinancials } from '../calculations/financial';
import { calculateEmissions } from '../calculations/emissions';
import { generateSolarRecommendation } from '../calculations/recommendation';

export interface SolarStoreState {
  // Scene & Buildings
  buildings: Building[];
  selectedBuildingId: string | null;
  hoveredBuildingId: string | null;
  timeOfDay: number; // 6.0 to 18.0
  showHeatmap: boolean;
  showShadows: boolean;
  showObstacles: boolean;

  // Analysis & Placement Lifecycles
  analysisStatus: AnalysisStatus;
  analysisSuccessMessage: string | null;
  analysisErrorMessage: string | null;
  analysisStaleMessage: string | null;
  isAnalyzing: boolean;
  analysisResults: Record<string, SolarAnalysisResult>;

  layoutStatus: LayoutStatus;
  layoutFeedback: string | null;
  layoutErrorMessage: string | null;
  placedPanels: PlacedPanel[];
  maxPossiblePanels: number;

  // User Preferences
  selectedPanelTypeId: string;
  monthlyConsumptionKWh: number;
  optimizationMode: OptimizationMode;

  // Camera Control
  cameraFocusTarget: [number, number, number] | null;
  cameraPositionTarget: [number, number, number] | null;
  cameraResetTrigger: number;

  // Guided Demo Flow
  isDemoPlaying: boolean;
  demoStep: number;
  demoStatusText: string;

  // Stable Derived State (Cached snapshots for React useSyncExternalStore)
  energyProfile: EnergyResult;
  financialResult: FinancialResult;
  environmentalResult: EnvironmentalResult;
  solarRecommendation: SolarRecommendation | null;

  // Actions
  selectBuilding: (id: string | null) => void;
  setHoveredBuilding: (id: string | null) => void;
  setTimeOfDay: (time: number) => void;
  setShowHeatmap: (show: boolean) => void;
  setShowShadows: (show: boolean) => void;
  setSelectedPanelType: (panelId: string) => void;
  setMonthlyConsumption: (kwh: number) => void;
  setOptimizationMode: (mode: OptimizationMode) => void;
  updateBuildingDimensions: (id: string, width: number, length: number, height: number) => void;
  addObstacle: (buildingId: string, obstacle: Omit<RoofObstacle, 'id'>) => void;
  removeObstacle: (buildingId: string, obstacleId: string) => void;
  runAnalysisForSelectedBuilding: () => Promise<void>;
  generateSolarLayout: () => Promise<void>;
  resetToDefaultView: () => void;
  startDemoTour: () => void;
  stopDemoTour: () => void;

  // Internal Accessor Helpers
  getSelectedBuilding: () => Building | undefined;
  getCurrentAnalysis: () => SolarAnalysisResult | undefined;
  getCurrentPanelType: () => PanelType;
  getEnergyProfile: () => EnergyResult;
  getFinancialResult: () => FinancialResult;
  getEnvironmentalResult: () => EnvironmentalResult;
  getSolarRecommendation: () => SolarRecommendation | null;
}

function computeDerivedSnapshots(
  buildings: Building[],
  selectedBuildingId: string | null,
  analysisResults: Record<string, SolarAnalysisResult>,
  placedPanels: PlacedPanel[],
  selectedPanelTypeId: string,
  monthlyConsumptionKWh: number,
  optimizationMode: OptimizationMode,
  maxPossiblePanels: number
) {
  const panelType = PANEL_TYPES.find((p) => p.id === selectedPanelTypeId) || PANEL_TYPES[0];
  const bldg = buildings.find((b) => b.id === selectedBuildingId);
  const analysis = selectedBuildingId ? analysisResults[selectedBuildingId] : undefined;

  const energyProfile = calculateEnergyProfile(monthlyConsumptionKWh, placedPanels, panelType);
  const financialResult = calculateFinancials(
    energyProfile.installedCapacityKW,
    energyProfile.panelCount,
    panelType,
    energyProfile.annualGenerationKWh,
    energyProfile.annualConsumptionKWh
  );
  const environmentalResult = calculateEmissions(energyProfile.annualGenerationKWh);

  const solarRecommendation =
    bldg && analysis && placedPanels.length > 0
      ? generateSolarRecommendation(
          bldg,
          analysis,
          energyProfile,
          financialResult,
          panelType,
          optimizationMode,
          maxPossiblePanels
        )
      : null;

  return {
    energyProfile,
    financialResult,
    environmentalResult,
    solarRecommendation,
  };
}

export const useSolarStore = create<SolarStoreState>((set, get) => {
  const initialBuildings = [...INITIAL_BUILDINGS];
  const initialTarget = initialBuildings[0]; // Apex Lofts

  const initialDerived = computeDerivedSnapshots(
    initialBuildings,
    initialTarget.id,
    {},
    [],
    PANEL_TYPES[0].id,
    initialTarget.defaultMonthlyKWh,
    'balanced',
    0
  );

  return {
    buildings: initialBuildings,
    selectedBuildingId: initialTarget.id,
    hoveredBuildingId: null,
    timeOfDay: 13.0, // 1:00 PM
    showHeatmap: true,
    showShadows: true,
    showObstacles: true,

    // Initial lifecycle state: NOT analyzed and NOT generated
    analysisStatus: 'not_analyzed',
    analysisSuccessMessage: null,
    analysisErrorMessage: null,
    analysisStaleMessage: null,
    isAnalyzing: false,
    analysisResults: {},

    layoutStatus: 'not_generated',
    layoutFeedback: null,
    layoutErrorMessage: null,
    placedPanels: [],
    maxPossiblePanels: 0,

    selectedPanelTypeId: PANEL_TYPES[0].id,
    monthlyConsumptionKWh: initialTarget.defaultMonthlyKWh,
    optimizationMode: 'balanced',

    cameraFocusTarget: [initialTarget.position[0], initialTarget.height, initialTarget.position[2]],
    cameraPositionTarget: [
      initialTarget.position[0] - 22,
      initialTarget.height + 20,
      initialTarget.position[2] + 24,
    ],
    cameraResetTrigger: 0,

    isDemoPlaying: false,
    demoStep: 0,
    demoStatusText: '',

    // Cached snapshots for React
    ...initialDerived,

    selectBuilding: (id: string | null) => {
      const state = get();
      if (id === null) {
        set({
          selectedBuildingId: null,
          cameraFocusTarget: [0, 0, 0],
          cameraPositionTarget: [45, 45, 55],
        });
        return;
      }

      const bldg = state.buildings.find((b) => b.id === id);
      if (!bldg) return;

      const targetPos: [number, number, number] = [bldg.position[0], bldg.height, bldg.position[2]];
      const camPos: [number, number, number] = [
        bldg.position[0] - Math.max(18, bldg.width * 1.3),
        bldg.height + Math.max(16, bldg.height * 0.9),
        bldg.position[2] + Math.max(20, bldg.length * 1.3),
      ];

      const existingAnalysis = state.analysisResults[bldg.id];
      const hasAnalysis = !!existingAnalysis;

      const derived = computeDerivedSnapshots(
        state.buildings,
        bldg.id,
        state.analysisResults,
        [],
        state.selectedPanelTypeId,
        bldg.defaultMonthlyKWh,
        state.optimizationMode,
        0
      );

      set({
        selectedBuildingId: bldg.id,
        monthlyConsumptionKWh: bldg.defaultMonthlyKWh,
        cameraFocusTarget: targetPos,
        cameraPositionTarget: camPos,
        analysisStatus: hasAnalysis ? 'analyzed' : 'not_analyzed',
        analysisSuccessMessage: hasAnalysis
          ? `Analysis active — ${Math.round((existingAnalysis.recommendedInstallationArea / existingAnalysis.totalRoofArea) * 100)}% of the rooftop is viable.`
          : null,
        analysisErrorMessage: null,
        analysisStaleMessage: null,
        layoutStatus: 'not_generated',
        placedPanels: [],
        maxPossiblePanels: 0,
        layoutFeedback: null,
        layoutErrorMessage: null,
        ...derived,
      });
    },

    setHoveredBuilding: (id: string | null) => set({ hoveredBuildingId: id }),

    setTimeOfDay: (time: number) => set({ timeOfDay: time }),

    setShowHeatmap: (show: boolean) => set({ showHeatmap: show }),

    setShowShadows: (show: boolean) => set({ showShadows: show }),

    setSelectedPanelType: (panelId: string) => {
      const state = get();
      const derived = computeDerivedSnapshots(
        state.buildings,
        state.selectedBuildingId,
        state.analysisResults,
        state.placedPanels,
        panelId,
        state.monthlyConsumptionKWh,
        state.optimizationMode,
        state.maxPossiblePanels
      );
      set({
        selectedPanelTypeId: panelId,
        layoutStatus: state.layoutStatus === 'generated' ? 'outdated' : state.layoutStatus,
        layoutFeedback: null,
        ...derived,
      });
    },

    setMonthlyConsumption: (kwh: number) => {
      const state = get();
      const targetKWh = Math.max(100, Math.min(25000, kwh));
      const derived = computeDerivedSnapshots(
        state.buildings,
        state.selectedBuildingId,
        state.analysisResults,
        state.placedPanels,
        state.selectedPanelTypeId,
        targetKWh,
        state.optimizationMode,
        state.maxPossiblePanels
      );
      set({
        monthlyConsumptionKWh: targetKWh,
        layoutStatus: state.layoutStatus === 'generated' ? 'outdated' : state.layoutStatus,
        layoutFeedback: null,
        ...derived,
      });
    },

    setOptimizationMode: (mode: OptimizationMode) => {
      const state = get();
      const derived = computeDerivedSnapshots(
        state.buildings,
        state.selectedBuildingId,
        state.analysisResults,
        state.placedPanels,
        state.selectedPanelTypeId,
        state.monthlyConsumptionKWh,
        mode,
        state.maxPossiblePanels
      );
      set({
        optimizationMode: mode,
        layoutStatus: state.layoutStatus === 'generated' ? 'outdated' : state.layoutStatus,
        layoutFeedback: null,
        ...derived,
      });
    },

    updateBuildingDimensions: (id: string, width: number, length: number, height: number) => {
      const state = get();
      const updated = state.buildings.map((b) => {
        if (b.id !== id) return b;
        return {
          ...b,
          width: Math.max(8, Math.min(45, width)),
          length: Math.max(8, Math.min(45, length)),
          height: Math.max(4, Math.min(50, height)),
        };
      });

      const updatedAnalysisResults = { ...state.analysisResults };
      delete updatedAnalysisResults[id];

      const derived = computeDerivedSnapshots(
        updated,
        state.selectedBuildingId,
        updatedAnalysisResults,
        state.selectedBuildingId === id ? [] : state.placedPanels,
        state.selectedPanelTypeId,
        state.monthlyConsumptionKWh,
        state.optimizationMode,
        state.selectedBuildingId === id ? 0 : state.maxPossiblePanels
      );

      set({
        buildings: updated,
        analysisResults: updatedAnalysisResults,
        analysisStatus: state.selectedBuildingId === id ? 'stale' : state.analysisStatus,
        analysisStaleMessage: state.selectedBuildingId === id ? 'Roof geometry changed — re-analysis required.' : state.analysisStaleMessage,
        analysisSuccessMessage: null,
        layoutStatus: state.selectedBuildingId === id ? 'outdated' : state.layoutStatus,
        placedPanels: state.selectedBuildingId === id ? [] : state.placedPanels,
        maxPossiblePanels: state.selectedBuildingId === id ? 0 : state.maxPossiblePanels,
        layoutFeedback: null,
        ...derived,
      });
    },

    addObstacle: (buildingId: string, obstacleData: Omit<RoofObstacle, 'id'>) => {
      const state = get();
      const newObs: RoofObstacle = {
        ...obstacleData,
        id: `obs-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      };

      const updated = state.buildings.map((b) => {
        if (b.id !== buildingId) return b;
        return {
          ...b,
          roofObstacles: [...b.roofObstacles, newObs],
        };
      });

      const updatedAnalysisResults = { ...state.analysisResults };
      delete updatedAnalysisResults[buildingId];

      const derived = computeDerivedSnapshots(
        updated,
        state.selectedBuildingId,
        updatedAnalysisResults,
        state.selectedBuildingId === buildingId ? [] : state.placedPanels,
        state.selectedPanelTypeId,
        state.monthlyConsumptionKWh,
        state.optimizationMode,
        state.selectedBuildingId === buildingId ? 0 : state.maxPossiblePanels
      );

      set({
        buildings: updated,
        analysisResults: updatedAnalysisResults,
        analysisStatus: state.selectedBuildingId === buildingId ? 'stale' : state.analysisStatus,
        analysisStaleMessage: state.selectedBuildingId === buildingId ? 'Roof geometry changed — re-analysis required.' : state.analysisStaleMessage,
        analysisSuccessMessage: null,
        layoutStatus: state.selectedBuildingId === buildingId ? 'outdated' : state.layoutStatus,
        placedPanels: state.selectedBuildingId === buildingId ? [] : state.placedPanels,
        maxPossiblePanels: state.selectedBuildingId === buildingId ? 0 : state.maxPossiblePanels,
        layoutFeedback: null,
        ...derived,
      });
    },

    removeObstacle: (buildingId: string, obstacleId: string) => {
      const state = get();
      const updated = state.buildings.map((b) => {
        if (b.id !== buildingId) return b;
        return {
          ...b,
          roofObstacles: b.roofObstacles.filter((o) => o.id !== obstacleId),
        };
      });

      const updatedAnalysisResults = { ...state.analysisResults };
      delete updatedAnalysisResults[buildingId];

      const derived = computeDerivedSnapshots(
        updated,
        state.selectedBuildingId,
        updatedAnalysisResults,
        state.selectedBuildingId === buildingId ? [] : state.placedPanels,
        state.selectedPanelTypeId,
        state.monthlyConsumptionKWh,
        state.optimizationMode,
        state.selectedBuildingId === buildingId ? 0 : state.maxPossiblePanels
      );

      set({
        buildings: updated,
        analysisResults: updatedAnalysisResults,
        analysisStatus: state.selectedBuildingId === buildingId ? 'stale' : state.analysisStatus,
        analysisStaleMessage: state.selectedBuildingId === buildingId ? 'Roof geometry changed — re-analysis required.' : state.analysisStaleMessage,
        analysisSuccessMessage: null,
        layoutStatus: state.selectedBuildingId === buildingId ? 'outdated' : state.layoutStatus,
        placedPanels: state.selectedBuildingId === buildingId ? [] : state.placedPanels,
        maxPossiblePanels: state.selectedBuildingId === buildingId ? 0 : state.maxPossiblePanels,
        layoutFeedback: null,
        ...derived,
      });
    },

    runAnalysisForSelectedBuilding: async () => {
      const state = get();
      const bldg = state.getSelectedBuilding();
      if (!bldg) return;

      if (get().analysisStatus === 'analyzing') return;

      set({
        isAnalyzing: true,
        analysisStatus: 'analyzing',
        analysisErrorMessage: null,
        analysisSuccessMessage: null,
        analysisStaleMessage: null,
      });

      try {
        await new Promise((resolve) => setTimeout(resolve, 450));

        const currentBldg = get().getSelectedBuilding();
        if (!currentBldg) return;

        const grid = generateRoofGrid(currentBldg);
        const analyzedCells = analyzeRoofExposure(currentBldg, get().buildings, grid.cells);
        const analysis = calculateSolarMetrics(
          currentBldg,
          analyzedCells,
          grid.cols,
          grid.rows,
          grid.cellWidth,
          grid.cellLength
        );

        const suitabilityPercent = analysis.totalRoofArea > 0
          ? Math.round((analysis.recommendedInstallationArea / analysis.totalRoofArea) * 100)
          : 0;

        const updatedAnalysisResults = { ...get().analysisResults, [currentBldg.id]: analysis };
        const derived = computeDerivedSnapshots(
          get().buildings,
          get().selectedBuildingId,
          updatedAnalysisResults,
          get().placedPanels,
          get().selectedPanelTypeId,
          get().monthlyConsumptionKWh,
          get().optimizationMode,
          get().maxPossiblePanels
        );

        set({
          isAnalyzing: false,
          analysisStatus: 'analyzed',
          analysisResults: updatedAnalysisResults,
          showHeatmap: true,
          analysisSuccessMessage: `Analysis complete — ${suitabilityPercent}% of the rooftop is viable.`,
          analysisErrorMessage: null,
          analysisStaleMessage: null,
          layoutStatus: get().layoutStatus === 'generated' ? 'outdated' : get().layoutStatus,
          ...derived,
        });
      } catch (err: unknown) {
        console.error('Solar analysis failed:', err);
        set({
          isAnalyzing: false,
          analysisStatus: 'not_analyzed',
          analysisErrorMessage: err instanceof Error ? err.message : 'Solar analysis failed.',
        });
      }
    },

    generateSolarLayout: async () => {
      const state = get();
      const bldg = state.getSelectedBuilding();
      const analysis = state.getCurrentAnalysis();

      if (!bldg) return;

      if (!analysis || state.analysisStatus !== 'analyzed') {
        set({
          layoutErrorMessage: 'Analyze the rooftop before generating a solar layout.',
        });
        return;
      }

      if (get().layoutStatus === 'generating') return;

      set({
        layoutStatus: 'generating',
        layoutErrorMessage: null,
        layoutFeedback: null,
      });

      try {
        await new Promise((resolve) => setTimeout(resolve, 400));

        const currentBldg = get().getSelectedBuilding();
        const currentAnalysis = get().getCurrentAnalysis();
        const currentPanel = get().getCurrentPanelType();
        const currentState = get();

        if (!currentBldg || !currentAnalysis) return;

        const opt = runOptimization(
          currentBldg,
          currentAnalysis,
          currentPanel,
          currentState.monthlyConsumptionKWh,
          currentState.optimizationMode
        );

        const panelCount = opt.placedPanels.length;
        const installedKW = Math.round((panelCount * currentPanel.wattage) / 10) / 100;

        const derived = computeDerivedSnapshots(
          currentState.buildings,
          currentState.selectedBuildingId,
          currentState.analysisResults,
          opt.placedPanels,
          currentState.selectedPanelTypeId,
          currentState.monthlyConsumptionKWh,
          currentState.optimizationMode,
          opt.maxPossiblePanels
        );

        set({
          placedPanels: opt.placedPanels,
          maxPossiblePanels: opt.maxPossiblePanels,
          layoutStatus: 'generated',
          layoutFeedback: `Layout generated — ${panelCount} panels, ${installedKW} kW system.`,
          layoutErrorMessage: null,
          ...derived,
        });
      } catch (err: unknown) {
        console.error('Solar layout generation failed:', err);
        set({
          layoutStatus: 'not_generated',
          layoutErrorMessage: err instanceof Error ? err.message : 'Layout generation failed.',
        });
      }
    },

    resetToDefaultView: () => {
      set((state) => ({
        selectedBuildingId: null,
        cameraFocusTarget: [0, 0, 0],
        cameraPositionTarget: [45, 45, 55],
        cameraResetTrigger: state.cameraResetTrigger + 1,
        isDemoPlaying: false,
      }));
    },

    startDemoTour: () => {
      set({ isDemoPlaying: true, demoStep: 1, demoStatusText: '1/6 Selecting target building: Apex Lofts...' });
      get().selectBuilding('bldg-3');

      setTimeout(() => {
        set({ demoStep: 2, demoStatusText: '2/6 Simulating diurnal sun path & Meridian Tower shadow...' });
        let currentHour = 8;
        const interval = setInterval(() => {
          currentHour += 0.5;
          get().setTimeOfDay(currentHour);
          if (currentHour >= 15.5) {
            clearInterval(interval);
            get().setTimeOfDay(12.5);
          }
        }, 150);
      }, 1500);

      setTimeout(async () => {
        set({ demoStep: 3, demoStatusText: '3/6 Raytracing rooftop grid & detecting shade exposure...' });
        get().setShowHeatmap(true);
        await get().runAnalysisForSelectedBuilding();
      }, 4200);

      setTimeout(() => {
        set({ demoStep: 4, demoStatusText: '4/6 Calibrating 950 kWh monthly demand & 450W bifacial modules...' });
        get().setSelectedPanelType('panel-450w');
        get().setMonthlyConsumption(950);
      }, 6200);

      setTimeout(async () => {
        set({ demoStep: 5, demoStatusText: '5/6 Synthesizing optimal layout under "Demand Matching" mode...' });
        get().setOptimizationMode('need');
        await get().generateSolarLayout();
      }, 7800);

      setTimeout(() => {
        set({
          demoStep: 6,
          demoStatusText: '6/6 Demo complete! Solar plan generated with deterministic financials & explainability.',
          isDemoPlaying: false,
        });
      }, 9800);
    },

    stopDemoTour: () => {
      set({ isDemoPlaying: false, demoStep: 0, demoStatusText: '' });
    },

    // Internal Accessors
    getSelectedBuilding: () => {
      const state = get();
      return state.buildings.find((b) => b.id === state.selectedBuildingId);
    },

    getCurrentAnalysis: () => {
      const state = get();
      if (!state.selectedBuildingId) return undefined;
      return state.analysisResults[state.selectedBuildingId];
    },

    getCurrentPanelType: () => {
      const state = get();
      return PANEL_TYPES.find((p) => p.id === state.selectedPanelTypeId) || PANEL_TYPES[0];
    },

    getEnergyProfile: () => get().energyProfile,

    getFinancialResult: () => get().financialResult,

    getEnvironmentalResult: () => get().environmentalResult,

    getSolarRecommendation: () => get().solarRecommendation,
  };
});
