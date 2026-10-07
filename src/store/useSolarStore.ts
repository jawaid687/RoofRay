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

  // Analysis & Placement
  isAnalyzing: boolean;
  analysisResults: Record<string, SolarAnalysisResult>;
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
  runAnalysisForSelectedBuilding: () => void;
  generateSolarLayout: () => void;
  resetToDefaultView: () => void;
  startDemoTour: () => void;
  stopDemoTour: () => void;

  // Computed Accessors
  getSelectedBuilding: () => Building | undefined;
  getCurrentAnalysis: () => SolarAnalysisResult | undefined;
  getCurrentPanelType: () => typeof PANEL_TYPES[0];
  getEnergyProfile: () => EnergyResult;
  getFinancialResult: () => FinancialResult;
  getEnvironmentalResult: () => EnvironmentalResult;
  getSolarRecommendation: () => SolarRecommendation | null;
}

export const useSolarStore = create<SolarStoreState>((set, get) => {
  // Pre-run analysis for Apex Lofts so initial load has immediate rich data
  const initialBuildings = [...INITIAL_BUILDINGS];
  const initialTarget = initialBuildings[0]; // Apex Lofts
  const initialGrid = generateRoofGrid(initialTarget);
  const initialAnalyzedCells = analyzeRoofExposure(initialTarget, initialBuildings, initialGrid.cells);
  const initialAnalysis = calculateSolarMetrics(
    initialTarget,
    initialAnalyzedCells,
    initialGrid.cols,
    initialGrid.rows,
    initialGrid.cellWidth,
    initialGrid.cellLength
  );

  const initialOpt = runOptimization(
    initialTarget,
    initialAnalysis,
    PANEL_TYPES[0],
    initialTarget.defaultMonthlyKWh,
    'balanced'
  );

  return {
    buildings: initialBuildings,
    selectedBuildingId: initialTarget.id,
    hoveredBuildingId: null,
    timeOfDay: 13.0, // 1:00 PM
    showHeatmap: true,
    showShadows: true,
    showObstacles: true,

    isAnalyzing: false,
    analysisResults: { [initialTarget.id]: initialAnalysis },
    placedPanels: initialOpt.placedPanels,
    maxPossiblePanels: initialOpt.maxPossiblePanels,

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

      // Check if analysis already exists; if not, perform it
      let analysis = state.analysisResults[bldg.id];
      if (!analysis) {
        const grid = generateRoofGrid(bldg);
        const analyzedCells = analyzeRoofExposure(bldg, state.buildings, grid.cells);
        analysis = calculateSolarMetrics(bldg, analyzedCells, grid.cols, grid.rows, grid.cellWidth, grid.cellLength);
      }

      const panelType = PANEL_TYPES.find((p) => p.id === state.selectedPanelTypeId) || PANEL_TYPES[0];
      const opt = runOptimization(bldg, analysis, panelType, bldg.defaultMonthlyKWh, state.optimizationMode);

      set({
        selectedBuildingId: bldg.id,
        monthlyConsumptionKWh: bldg.defaultMonthlyKWh,
        analysisResults: { ...state.analysisResults, [bldg.id]: analysis },
        placedPanels: opt.placedPanels,
        maxPossiblePanels: opt.maxPossiblePanels,
        cameraFocusTarget: targetPos,
        cameraPositionTarget: camPos,
      });
    },

    setHoveredBuilding: (id: string | null) => set({ hoveredBuildingId: id }),

    setTimeOfDay: (time: number) => set({ timeOfDay: time }),

    setShowHeatmap: (show: boolean) => set({ showHeatmap: show }),

    setShowShadows: (show: boolean) => set({ showShadows: show }),

    setSelectedPanelType: (panelId: string) => {
      set({ selectedPanelTypeId: panelId });
      get().generateSolarLayout();
    },

    setMonthlyConsumption: (kwh: number) => {
      set({ monthlyConsumptionKWh: Math.max(100, Math.min(25000, kwh)) });
      get().generateSolarLayout();
    },

    setOptimizationMode: (mode: OptimizationMode) => {
      set({ optimizationMode: mode });
      get().generateSolarLayout();
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

      set({ buildings: updated });
      // Re-run analysis & layout for updated geometry
      setTimeout(() => {
        get().runAnalysisForSelectedBuilding();
      }, 50);
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

      set({ buildings: updated });
      get().runAnalysisForSelectedBuilding();
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

      set({ buildings: updated });
      get().runAnalysisForSelectedBuilding();
    },

    runAnalysisForSelectedBuilding: () => {
      const state = get();
      const bldg = state.getSelectedBuilding();
      if (!bldg) return;

      set({ isAnalyzing: true });

      // Run synchronous raytracing
      const grid = generateRoofGrid(bldg);
      const analyzedCells = analyzeRoofExposure(bldg, state.buildings, grid.cells);
      const analysis = calculateSolarMetrics(
        bldg,
        analyzedCells,
        grid.cols,
        grid.rows,
        grid.cellWidth,
        grid.cellLength
      );

      const panelType = state.getCurrentPanelType();
      const opt = runOptimization(
        bldg,
        analysis,
        panelType,
        state.monthlyConsumptionKWh,
        state.optimizationMode
      );

      set({
        isAnalyzing: false,
        analysisResults: { ...state.analysisResults, [bldg.id]: analysis },
        placedPanels: opt.placedPanels,
        maxPossiblePanels: opt.maxPossiblePanels,
      });
    },

    generateSolarLayout: () => {
      const state = get();
      const bldg = state.getSelectedBuilding();
      const analysis = state.getCurrentAnalysis();
      const panelType = state.getCurrentPanelType();
      if (!bldg || !analysis) return;

      const opt = runOptimization(
        bldg,
        analysis,
        panelType,
        state.monthlyConsumptionKWh,
        state.optimizationMode
      );

      set({
        placedPanels: opt.placedPanels,
        maxPossiblePanels: opt.maxPossiblePanels,
      });
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
      // Step-by-step hackathon demo flow
      set({ isDemoPlaying: true, demoStep: 1, demoStatusText: '1/6 Selecting target building: Apex Lofts...' });
      get().selectBuilding('bldg-3');

      // Step 2: Time of Day simulation (after 1.2s)
      setTimeout(() => {
        set({ demoStep: 2, demoStatusText: '2/6 Simulating diurnal sun path & Meridian Tower shadow...' });
        let currentHour = 8;
        const interval = setInterval(() => {
          currentHour += 0.5;
          get().setTimeOfDay(currentHour);
          if (currentHour >= 15.5) {
            clearInterval(interval);
            get().setTimeOfDay(12.5); // return to midday
          }
        }, 150);
      }, 1500);

      // Step 3: Solar Potential Heatmap Analysis (after 4.2s)
      setTimeout(() => {
        set({ demoStep: 3, demoStatusText: '3/6 Raytracing rooftop grid & detecting shade exposure...' });
        get().setShowHeatmap(true);
        get().runAnalysisForSelectedBuilding();
      }, 4200);

      // Step 4: Configure Energy Demand & Panel Type (after 6.0s)
      setTimeout(() => {
        set({ demoStep: 4, demoStatusText: '4/6 Calibrating 950 kWh monthly demand & 450W bifacial modules...' });
        get().setSelectedPanelType('panel-450w');
        get().setMonthlyConsumption(950);
      }, 6000);

      // Step 5: Run Automated Panel Placement (after 7.5s)
      setTimeout(() => {
        set({ demoStep: 5, demoStatusText: '5/6 Synthesizing optimal layout under "Demand Matching" mode...' });
        get().setOptimizationMode('need');
        get().generateSolarLayout();
      }, 7500);

      // Step 6: Present Recommendation & Financial Payback (after 9.2s)
      setTimeout(() => {
        set({
          demoStep: 6,
          demoStatusText: '6/6 Demo complete! Solar plan generated with deterministic financials & explainability.',
          isDemoPlaying: false,
        });
      }, 9200);
    },

    stopDemoTour: () => {
      set({ isDemoPlaying: false, demoStep: 0, demoStatusText: '' });
    },

    // Computed Selectors
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

    getEnergyProfile: () => {
      const state = get();
      const panelType = state.getCurrentPanelType();
      return calculateEnergyProfile(state.monthlyConsumptionKWh, state.placedPanels, panelType);
    },

    getFinancialResult: () => {
      const state = get();
      const energy = state.getEnergyProfile();
      const panelType = state.getCurrentPanelType();
      return calculateFinancials(
        energy.installedCapacityKW,
        energy.panelCount,
        panelType,
        energy.annualGenerationKWh,
        energy.annualConsumptionKWh
      );
    },

    getEnvironmentalResult: () => {
      const state = get();
      const energy = state.getEnergyProfile();
      return calculateEmissions(energy.annualGenerationKWh);
    },

    getSolarRecommendation: () => {
      const state = get();
      const bldg = state.getSelectedBuilding();
      const analysis = state.getCurrentAnalysis();
      if (!bldg || !analysis) return null;

      const energy = state.getEnergyProfile();
      const financial = state.getFinancialResult();
      const panelType = state.getCurrentPanelType();

      return generateSolarRecommendation(
        bldg,
        analysis,
        energy,
        financial,
        panelType,
        state.optimizationMode,
        state.maxPossiblePanels
      );
    },
  };
});
