import { create } from 'zustand';
import {
  Building,
  SolarAnalysisResult,
  OptimizationMode,
  PlacedPanel,
  EnergyResult,
  FinancialResult,
  EnvironmentalResult,
  SolarRecommendation,
  AnalysisStatus,
  LayoutStatus,
  PanelType,
  LocationState,
  DateTimeState,
  HeatmapMode,
  LiveShadingResult,
  PanelOrientation,
  PlacementMode,
} from '../types';
import { INITIAL_BUILDINGS } from '../data/buildings';
import { PANEL_TYPES } from '../data/panelTypes';
import { CITY_PRESETS, SIMULATION_ASSUMPTIONS } from '../config/assumptions';
import { generateRoofGrid } from '../simulation/roofGrid';
import { calculateLiveShading } from '../simulation/shadowRaycaster';
import { runOptimization } from '../optimization/optimizationEngine';
import { calculateEnergyProfile } from '../calculations/energy';
import { calculateFinancials } from '../calculations/financial';
import { calculateEmissions } from '../calculations/emissions';
import { generateSolarRecommendation } from '../calculations/recommendation';
import { calculateNOAASunPosition, SunState } from '../simulation/sunPosition';
import {
  runAnnualAnalysisSync,
  AnnualAnalysisOutput,
  convertAnnualOutputToSolarAnalysisResult,
  getAnnualAnalysisCacheKey,
} from '../simulation/annualAnalysis';
import {
  validatePanelPlacement,
  snapToGrid,
  getPanelBounds,
  suggestNextPanel,
  fillAreaWithPanels,
  getBestRemainingSpots,
  evaluatePanelSolarPotential,
  CandidateSlot,
  PanelBounds,
} from '../optimization/manualPlacement';

// Cache generated roof grids to avoid re-allocating grid structures on every frame
const roofGridCache = new Map<string, ReturnType<typeof generateRoofGrid>>();

function getRoofGridForBuilding(building: Building) {
  let grid = roofGridCache.get(building.id);
  if (!grid) {
    grid = generateRoofGrid(building);
    roofGridCache.set(building.id, grid);
  }
  return grid;
}

function computeLiveShadingForBuilding(
  building: Building,
  allBuildings: readonly Building[],
  sunVector: readonly [number, number, number]
): LiveShadingResult {
  const grid = getRoofGridForBuilding(building);
  return calculateLiveShading(building, allBuildings, grid.cells, sunVector);
}

export interface SolarStoreState {
  // Scene & Buildings (Read-only, immutable)
  buildings: readonly Building[];
  selectedBuildingId: string | null;
  hoveredBuildingId: string | null;

  // Astronomical & Geographic State (FR-2)
  location: LocationState;
  dateTime: DateTimeState;
  sunState: SunState;
  heatmapMode: HeatmapMode;
  liveShading: LiveShadingResult | null;

  // Visual Display Toggles
  showHeatmap: boolean;
  showShadows: boolean;
  showObstacles: boolean;
  showSunPath: boolean;
  showCompass: boolean;

  // Animation Playback State (FR-2.4)
  isPlayingDay: boolean;
  isPlayingYear: boolean;
  playSpeed: number; // 1, 2, 4

  // Analysis & Placement Lifecycles
  analysisStatus: AnalysisStatus;
  analysisSuccessMessage: string | null;
  analysisErrorMessage: string | null;
  analysisStaleMessage: string | null;
  isAnalyzing: boolean;
  analysisResults: Record<string, SolarAnalysisResult>;
  selectedMonth: number; // 0 to 11 (0 = January)
  annualAnalysisResult: AnnualAnalysisOutput | null;
  annualAnalysisOutputs: Record<string, AnnualAnalysisOutput>;
  analysisProgress: number; // 0 to 100
  analysisExecutionTimeMs: number | null;

  layoutStatus: LayoutStatus;
  layoutFeedback: string | null;
  layoutErrorMessage: string | null;
  placedPanels: PlacedPanel[];
  maxPossiblePanels: number;

  // Manual Layout & Placement State (FR-7)
  placementMode: PlacementMode;
  selectedPanelIds: string[];
  panelOrientation: PanelOrientation;
  showBestSpots: boolean;
  bestSpotsList: CandidateSlot[];
  ghostPanel: {
    localX: number;
    localZ: number;
    orientation: PanelOrientation;
    isValid: boolean;
    exposureScore: number;
    annualKWh: number;
    isLitNow: boolean;
    rejectionReason?: string;
    rejectionDetail?: string;
  } | null;
  history: {
    past: PlacedPanel[][];
    future: PlacedPanel[][];
  };

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
  setLocation: (loc: Partial<LocationState>) => void;
  setCityPreset: (cityId: string) => void;
  setDate: (year: number, month: number, day: number) => void;
  setTimeOfDay: (time: number) => void;
  setHeatmapMode: (mode: HeatmapMode) => void;
  setSelectedMonth: (month: number) => void;
  setShowHeatmap: (show: boolean) => void;
  setShowShadows: (show: boolean) => void;
  setShowSunPath: (show: boolean) => void;
  setShowCompass: (show: boolean) => void;

  // Animation Playback Actions (FR-2.4)
  setPlayDay: (playing: boolean) => void;
  setPlayYear: (playing: boolean) => void;
  togglePlayDay: () => void;
  togglePlayYear: () => void;
  setPlaySpeed: (speed: number) => void;
  tickPlayDay: (deltaSeconds: number) => void;
  tickPlayYear: (deltaSeconds: number) => void;
  setSelectedPanelType: (panelId: string) => void;
  setMonthlyConsumption: (kwh: number) => void;
  setOptimizationMode: (mode: OptimizationMode) => void;
  runAnalysisForSelectedBuilding: () => Promise<void>;
  cancelAnalysis: () => void;
  generateSolarLayout: () => Promise<void>;

  // Manual Placement Actions (FR-7)
  setPlacementMode: (mode: PlacementMode) => void;
  setSelectedPanelIds: (ids: string[]) => void;
  setPanelOrientation: (orientation: PanelOrientation) => void;
  togglePanelOrientation: () => void;
  setShowBestSpots: (show: boolean) => void;
  updateGhostPosition: (rawX: number, rawZ: number) => void;
  clearGhostPanel: () => void;
  addPlacedPanel: (panel: PlacedPanel) => boolean;
  deleteSelectedPanels: () => void;
  clearAllPanels: () => void;
  setPlacedPanelsWithHistory: (panels: PlacedPanel[]) => void;
  undo: () => boolean;
  redo: () => boolean;
  suggestNextManualPanel: () => void;
  fillAreaManual: (bounds: PanelBounds) => void;
  convertAutoLayoutToManual: () => void;
  movePanel: (id: string, newLocalX: number, newLocalZ: number) => boolean;

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
  buildings: readonly Building[],
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
          maxPossiblePanels,
          placedPanels
        )
      : null;

  return {
    energyProfile,
    financialResult,
    environmentalResult,
    solarRecommendation,
  };
}

let analysisWorker: Worker | null = null;
let currentWorkerAnalysisId: string | null = null;

function getAnalysisWorker(): Worker | null {
  if (typeof Worker === 'undefined') return null;
  if (!analysisWorker) {
    try {
      analysisWorker = new Worker(
        new URL('../simulation/analysis.worker.ts', import.meta.url),
        { type: 'module' }
      );
    } catch (e) {
      console.warn('Web Worker creation failed, falling back to sync execution:', e);
      analysisWorker = null;
    }
  }
  return analysisWorker;
}

export const useSolarStore = create<SolarStoreState>((set, get) => {
  const initialBuildings = INITIAL_BUILDINGS;
  const initialTarget = initialBuildings[0]; // Apex Lofts

  // Default geographical location: San Francisco, CA
  const initialLocation: LocationState = {
    city: CITY_PRESETS[0].name,
    country: CITY_PRESETS[0].country,
    latitude: CITY_PRESETS[0].latitude,
    longitude: CITY_PRESETS[0].longitude,
    timezone: CITY_PRESETS[0].timezone,
    northOffsetDeg: SIMULATION_ASSUMPTIONS.sceneNorthOffsetDeg,
  };

  // Default date and time: Summer Solstice at 13:00 local time
  const initialDateTime: DateTimeState = {
    year: 2026,
    month: 6,
    day: 21,
    timeDecimal: 13.0,
  };

  const initialSunState = calculateNOAASunPosition({
    latitude: initialLocation.latitude,
    longitude: initialLocation.longitude,
    date: { year: initialDateTime.year, month: initialDateTime.month, day: initialDateTime.day },
    time: initialDateTime.timeDecimal,
    timezone: initialLocation.timezone,
    northOffsetDeg: initialLocation.northOffsetDeg,
  });

  const initialLiveShading = computeLiveShadingForBuilding(
    initialTarget,
    initialBuildings,
    initialSunState.vectorToSun
  );

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

    // Astronomical & Geographic State
    location: initialLocation,
    dateTime: initialDateTime,
    sunState: initialSunState,
    heatmapMode: 'live', // Default to Live Shading in v2
    liveShading: initialLiveShading,

    showHeatmap: true,
    showShadows: true,
    showObstacles: true,
    showSunPath: true,
    showCompass: true,

    isPlayingDay: false,
    isPlayingYear: false,
    playSpeed: 1,

    // Initial lifecycle state
    analysisStatus: 'not_analyzed',
    analysisSuccessMessage: null,
    analysisErrorMessage: null,
    analysisStaleMessage: null,
    isAnalyzing: false,
    analysisResults: {},
    selectedMonth: 5, // June default (summer peak)
    annualAnalysisResult: null,
    annualAnalysisOutputs: {},
    analysisProgress: 0,
    analysisExecutionTimeMs: null,

    layoutStatus: 'not_generated',
    layoutFeedback: null,
    layoutErrorMessage: null,
    placedPanels: [],
    maxPossiblePanels: 0,

    // Manual Layout & Placement State (FR-7)
    placementMode: 'select',
    selectedPanelIds: [],
    panelOrientation: 'portrait',
    showBestSpots: false,
    bestSpotsList: [],
    ghostPanel: null,
    history: { past: [], future: [] },

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
      if (currentWorkerAnalysisId) {
        get().cancelAnalysis();
      }

      if (id === null) {
        set({
          selectedBuildingId: null,
          cameraFocusTarget: [0, 0, 0],
          cameraPositionTarget: [45, 45, 55],
          liveShading: null,
          annualAnalysisResult: null,
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

      const tiltDeg = Math.min(45, Math.max(10, Math.abs(state.location.latitude)));
      const azimuthDeg = state.location.latitude >= 0 ? 180 : 0;
      const cacheKey = getAnnualAnalysisCacheKey(
        bldg.id,
        state.location.latitude,
        state.location.longitude,
        tiltDeg,
        azimuthDeg,
        state.dateTime.year
      );
      const existingAnnual = state.annualAnalysisOutputs[cacheKey] || null;
      const existingAnalysis = state.analysisResults[bldg.id];
      const hasAnalysis = !!existingAnalysis || !!existingAnnual;

      const liveShading = computeLiveShadingForBuilding(bldg, state.buildings, state.sunState.vectorToSun);

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
        liveShading,
        annualAnalysisResult: existingAnnual,
        analysisExecutionTimeMs: existingAnnual?.executionTimeMs ?? null,
        analysisStatus: hasAnalysis ? 'analyzed' : 'not_analyzed',
        analysisSuccessMessage: existingAnnual
          ? `Analysis active (${existingAnnual.executionTimeMs} ms) — ${Math.round((existingAnnual.recommendedArea / existingAnnual.totalRoofArea) * 100)}% viable.`
          : existingAnalysis
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

    setLocation: (locUpdate: Partial<LocationState>) => {
      const state = get();
      const updatedLocation: LocationState = {
        ...state.location,
        ...locUpdate,
      };

      const updatedSunState = calculateNOAASunPosition({
        latitude: updatedLocation.latitude,
        longitude: updatedLocation.longitude,
        date: { year: state.dateTime.year, month: state.dateTime.month, day: state.dateTime.day },
        time: state.dateTime.timeDecimal,
        timezone: updatedLocation.timezone,
        northOffsetDeg: updatedLocation.northOffsetDeg,
      });

      const currentBldg = state.getSelectedBuilding();
      const updatedLiveShading = currentBldg
        ? computeLiveShadingForBuilding(currentBldg, state.buildings, updatedSunState.vectorToSun)
        : null;

      // Look up if updated location has cached annual analysis
      let activeAnnual = state.annualAnalysisResult;
      if (currentBldg) {
        const tiltDeg = Math.min(45, Math.max(10, Math.abs(updatedLocation.latitude)));
        const azimuthDeg = updatedLocation.latitude >= 0 ? 180 : 0;
        const cacheKey = getAnnualAnalysisCacheKey(
          currentBldg.id,
          updatedLocation.latitude,
          updatedLocation.longitude,
          tiltDeg,
          azimuthDeg,
          state.dateTime.year
        );
        activeAnnual = state.annualAnalysisOutputs[cacheKey] || null;
      }

      set({
        location: updatedLocation,
        sunState: updatedSunState,
        liveShading: updatedLiveShading,
        annualAnalysisResult: activeAnnual,
      });
    },

    setCityPreset: (cityId: string) => {
      const preset = CITY_PRESETS.find((c) => c.id === cityId);
      if (!preset) return;

      get().setLocation({
        city: preset.name,
        country: preset.country,
        latitude: preset.latitude,
        longitude: preset.longitude,
        timezone: preset.timezone,
      });
    },

    setDate: (year: number, month: number, day: number) => {
      const state = get();
      const updatedDateTime: DateTimeState = {
        ...state.dateTime,
        year,
        month,
        day,
      };

      const updatedSunState = calculateNOAASunPosition({
        latitude: state.location.latitude,
        longitude: state.location.longitude,
        date: { year, month, day },
        time: updatedDateTime.timeDecimal,
        timezone: state.location.timezone,
        northOffsetDeg: state.location.northOffsetDeg,
      });

      const currentBldg = state.getSelectedBuilding();
      const updatedLiveShading = currentBldg
        ? computeLiveShadingForBuilding(currentBldg, state.buildings, updatedSunState.vectorToSun)
        : null;

      set({
        dateTime: updatedDateTime,
        sunState: updatedSunState,
        liveShading: updatedLiveShading,
      });
    },

    setTimeOfDay: (time: number) => {
      const state = get();
      const clampedTime = Math.max(0, Math.min(24, time));
      const updatedDateTime: DateTimeState = {
        ...state.dateTime,
        timeDecimal: clampedTime,
      };

      const updatedSunState = calculateNOAASunPosition({
        latitude: state.location.latitude,
        longitude: state.location.longitude,
        date: { year: state.dateTime.year, month: state.dateTime.month, day: state.dateTime.day },
        time: clampedTime,
        timezone: state.location.timezone,
        northOffsetDeg: state.location.northOffsetDeg,
      });

      const currentBldg = state.getSelectedBuilding();
      const updatedLiveShading = currentBldg
        ? computeLiveShadingForBuilding(currentBldg, state.buildings, updatedSunState.vectorToSun)
        : null;

      set({
        dateTime: updatedDateTime,
        sunState: updatedSunState,
        liveShading: updatedLiveShading,
      });
    },

    setHeatmapMode: (mode: HeatmapMode) => {
      set({ heatmapMode: mode });
      const state = get();
      if ((mode === 'annual' || mode === 'monthly') && !state.annualAnalysisResult && state.analysisStatus !== 'analyzing') {
        get().runAnalysisForSelectedBuilding();
      }
    },

    setSelectedMonth: (month: number) => {
      set({ selectedMonth: Math.max(0, Math.min(11, month)) });
    },

    setShowHeatmap: (show: boolean) => set({ showHeatmap: show }),

    setShowShadows: (show: boolean) => set({ showShadows: show }),

    setShowSunPath: (show: boolean) => set({ showSunPath: show }),

    setShowCompass: (show: boolean) => set({ showCompass: show }),

    setPlayDay: (playing: boolean) => {
      set({ isPlayingDay: playing, ...(playing ? { isPlayingYear: false } : {}) });
    },

    setPlayYear: (playing: boolean) => {
      set({ isPlayingYear: playing, ...(playing ? { isPlayingDay: false } : {}) });
    },

    togglePlayDay: () => {
      const state = get();
      const next = !state.isPlayingDay;
      set({ isPlayingDay: next, ...(next ? { isPlayingYear: false } : {}) });
    },

    togglePlayYear: () => {
      const state = get();
      const next = !state.isPlayingYear;
      set({ isPlayingYear: next, ...(next ? { isPlayingDay: false } : {}) });
    },

    setPlaySpeed: (speed: number) => {
      set({ playSpeed: Math.max(0.25, Math.min(10, speed)) });
    },

    tickPlayDay: (deltaSeconds: number) => {
      const state = get();
      if (!state.isPlayingDay) return;
      // Advance diurnal time: 1.5 wall-clock hours per second at 1x speed (24h loop in 16s)
      const hoursToAdd = deltaSeconds * 1.5 * state.playSpeed;
      const newTime = (state.dateTime.timeDecimal + hoursToAdd) % 24;
      state.setTimeOfDay(newTime);
    },

    tickPlayYear: (deltaSeconds: number) => {
      const state = get();
      if (!state.isPlayingYear) return;
      // Advance annual date: ~24.3 days per second at 1x speed (365 days in 15s)
      const daysToAdd = deltaSeconds * 24.3 * state.playSpeed;
      const currentMs = new Date(state.dateTime.year, state.dateTime.month - 1, state.dateTime.day).getTime();
      const startOfYearMs = new Date(state.dateTime.year, 0, 1).getTime();
      const dayOfYear = (currentMs - startOfYearMs) / 86400000;
      const nextDayOfYear = (dayOfYear + daysToAdd) % 365;
      const nextDate = new Date(startOfYearMs + nextDayOfYear * 86400000);
      state.setDate(state.dateTime.year, nextDate.getMonth() + 1, nextDate.getDate());
    },

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

    runAnalysisForSelectedBuilding: async () => {
      const state = get();
      const bldg = state.getSelectedBuilding();
      if (!bldg) return;

      if (get().analysisStatus === 'analyzing') return;

      const grid = getRoofGridForBuilding(bldg);
      const { latitude, longitude, timezone } = state.location;
      const year = state.dateTime.year;
      const tiltDeg = Math.min(45, Math.max(10, Math.abs(latitude)));
      const azimuthDeg = latitude >= 0 ? 180 : 0;

      // Check cache first
      const cacheKey = getAnnualAnalysisCacheKey(bldg.id, latitude, longitude, tiltDeg, azimuthDeg, year);
      const existing = state.annualAnalysisOutputs[cacheKey];
      if (existing) {
        const legacyAnalysis = convertAnnualOutputToSolarAnalysisResult(existing, bldg, grid.cols, grid.rows);
        const updatedAnalysisResults = { ...get().analysisResults, [bldg.id]: legacyAnalysis };
        const derived = computeDerivedSnapshots(
          get().buildings,
          bldg.id,
          updatedAnalysisResults,
          get().placedPanels,
          get().selectedPanelTypeId,
          get().monthlyConsumptionKWh,
          get().optimizationMode,
          get().maxPossiblePanels
        );
        set({
          annualAnalysisResult: existing,
          analysisProgress: 100,
          isAnalyzing: false,
          analysisStatus: 'analyzed',
          analysisExecutionTimeMs: existing.executionTimeMs,
          analysisResults: updatedAnalysisResults,
          analysisSuccessMessage: `Cached annual analysis loaded (${existing.executionTimeMs} ms) — ${Math.round((existing.recommendedArea / existing.totalRoofArea) * 100)}% viable.`,
          showHeatmap: true,
          ...derived,
        });
        return;
      }

      set({
        isAnalyzing: true,
        analysisStatus: 'analyzing',
        analysisProgress: 0,
        analysisErrorMessage: null,
        analysisSuccessMessage: null,
        analysisStaleMessage: null,
      });

      const analysisId = `analysis_${bldg.id}_${Date.now()}`;
      currentWorkerAnalysisId = analysisId;

      const worker = getAnalysisWorker();

      if (worker) {
        return new Promise<void>((resolve) => {
          const handleMessage = (e: MessageEvent) => {
            const data = e.data;
            if (!data || data.id !== analysisId) return;

            if (data.type === 'PROGRESS') {
              set({ analysisProgress: data.progress });
            } else if (data.type === 'COMPLETE') {
              worker.removeEventListener('message', handleMessage);
              const output: AnnualAnalysisOutput = data.output;
              const currentBldg = get().getSelectedBuilding();
              if (!currentBldg || currentBldg.id !== bldg.id) {
                resolve();
                return;
              }

              const legacyAnalysis = convertAnnualOutputToSolarAnalysisResult(output, currentBldg, grid.cols, grid.rows);
              const updatedOutputs = { ...get().annualAnalysisOutputs, [cacheKey]: output };
              const updatedAnalysisResults = { ...get().analysisResults, [currentBldg.id]: legacyAnalysis };

              const derived = computeDerivedSnapshots(
                get().buildings,
                currentBldg.id,
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
                analysisProgress: 100,
                annualAnalysisResult: output,
                annualAnalysisOutputs: updatedOutputs,
                analysisResults: updatedAnalysisResults,
                analysisExecutionTimeMs: output.executionTimeMs,
                showHeatmap: true,
                analysisSuccessMessage: `Analysis completed in ${output.executionTimeMs} ms — ${Math.round((output.recommendedArea / output.totalRoofArea) * 100)}% viable (${output.averageAnnualKWhPerM2} kWh/m²/yr clear-sky).`,
                analysisErrorMessage: null,
                layoutStatus: get().layoutStatus === 'generated' ? 'outdated' : get().layoutStatus,
                ...derived,
              });
              resolve();
            } else if (data.type === 'CANCELLED') {
              worker.removeEventListener('message', handleMessage);
              set({ isAnalyzing: false, analysisStatus: 'not_analyzed', analysisProgress: 0 });
              resolve();
            } else if (data.type === 'ERROR') {
              worker.removeEventListener('message', handleMessage);
              set({
                isAnalyzing: false,
                analysisStatus: 'not_analyzed',
                analysisProgress: 0,
                analysisErrorMessage: data.error || 'Annual solar analysis failed',
              });
              resolve();
            }
          };

          worker.addEventListener('message', handleMessage);
          worker.postMessage({
            type: 'START',
            id: analysisId,
            params: {
              targetBuilding: bldg,
              allBuildings: get().buildings,
              cells: grid.cells,
              latitude,
              longitude,
              timezone,
              panelTiltDeg: tiltDeg,
              panelAzimuthDeg: azimuthDeg,
              year,
            },
          });
        });
      } else {
        // Synchronous fallback (e.g. Node / testing environments)
        try {
          const output = runAnnualAnalysisSync({
            targetBuilding: bldg,
            allBuildings: get().buildings,
            cells: grid.cells,
            latitude,
            longitude,
            timezone,
            panelTiltDeg: tiltDeg,
            panelAzimuthDeg: azimuthDeg,
            year,
            onProgress: (progress) => set({ analysisProgress: progress }),
          });

          const legacyAnalysis = convertAnnualOutputToSolarAnalysisResult(output, bldg, grid.cols, grid.rows);
          const updatedOutputs = { ...get().annualAnalysisOutputs, [cacheKey]: output };
          const updatedAnalysisResults = { ...get().analysisResults, [bldg.id]: legacyAnalysis };

          const derived = computeDerivedSnapshots(
            get().buildings,
            bldg.id,
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
            analysisProgress: 100,
            annualAnalysisResult: output,
            annualAnalysisOutputs: updatedOutputs,
            analysisResults: updatedAnalysisResults,
            analysisExecutionTimeMs: output.executionTimeMs,
            showHeatmap: true,
            analysisSuccessMessage: `Analysis completed in ${output.executionTimeMs} ms — ${Math.round((output.recommendedArea / output.totalRoofArea) * 100)}% viable (${output.averageAnnualKWhPerM2} kWh/m²/yr clear-sky).`,
            analysisErrorMessage: null,
            layoutStatus: get().layoutStatus === 'generated' ? 'outdated' : get().layoutStatus,
            ...derived,
          });
        } catch (err: unknown) {
          set({
            isAnalyzing: false,
            analysisStatus: 'not_analyzed',
            analysisProgress: 0,
            analysisErrorMessage: err instanceof Error ? err.message : 'Solar analysis failed.',
          });
        }
      }
    },

    cancelAnalysis: () => {
      const worker = getAnalysisWorker();
      if (worker && currentWorkerAnalysisId) {
        worker.postMessage({ type: 'CANCEL', id: currentWorkerAnalysisId });
      }
      currentWorkerAnalysisId = null;
      set({
        isAnalyzing: false,
        analysisStatus: 'not_analyzed',
        analysisProgress: 0,
      });
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

    // Manual Placement Actions (FR-7)
    setPlacementMode: (mode: PlacementMode) => {
      set((state) => ({
        placementMode: mode,
        ghostPanel: mode === 'place' ? state.ghostPanel : null,
        selectedPanelIds: mode === 'select' ? state.selectedPanelIds : [],
      }));
    },

    setSelectedPanelIds: (ids: string[]) => {
      set({ selectedPanelIds: ids });
    },

    setPanelOrientation: (orientation: PanelOrientation) => {
      const state = get();
      if (state.panelOrientation === orientation) return;
      set({ panelOrientation: orientation });
      if (state.ghostPanel) {
        state.updateGhostPosition(state.ghostPanel.localX, state.ghostPanel.localZ);
      }
    },

    togglePanelOrientation: () => {
      const current = get().panelOrientation;
      get().setPanelOrientation(current === 'portrait' ? 'landscape' : 'portrait');
    },

    setShowBestSpots: (show: boolean) => {
      if (!show) {
        set({ showBestSpots: false, bestSpotsList: [] });
        return;
      }
      const state = get();
      const bldg = state.getSelectedBuilding();
      const panelType = state.getCurrentPanelType();
      if (!bldg) {
        set({ showBestSpots: true, bestSpotsList: [] });
        return;
      }
      const cells = getRoofGridForBuilding(bldg).cells;
      const liveShadingCells = state.liveShading?.cellShading;
      const spots = getBestRemainingSpots(
        bldg,
        state.placedPanels,
        panelType,
        state.panelOrientation,
        cells,
        state.annualAnalysisResult,
        liveShadingCells,
        10
      );
      set({ showBestSpots: true, bestSpotsList: spots });
    },

    updateGhostPosition: (rawX: number, rawZ: number) => {
      const state = get();
      const bldg = state.getSelectedBuilding();
      const panelType = state.getCurrentPanelType();
      if (!bldg) {
        set({ ghostPanel: null });
        return;
      }

      const snappedX = snapToGrid(rawX);
      const snappedZ = snapToGrid(rawZ);
      const width = state.panelOrientation === 'portrait' ? panelType.width : panelType.length;
      const length = state.panelOrientation === 'portrait' ? panelType.length : panelType.width;
      const cells = getRoofGridForBuilding(bldg).cells;
      const liveShadingCells = state.liveShading?.cellShading;

      const validation = validatePanelPlacement(
        { localX: snappedX, localZ: snappedZ, width, length },
        bldg,
        state.placedPanels,
        cells,
        state.annualAnalysisResult,
        liveShadingCells
      );

      const bounds = getPanelBounds(snappedX, snappedZ, width, length);
      const potential = evaluatePanelSolarPotential(
        bounds,
        cells,
        state.annualAnalysisResult,
        liveShadingCells
      );

      let isLitNow = false;
      if (state.sunState.isDaylight) {
        if (state.liveShading && state.liveShading.isSunUp) {
          let closestDistSq = Infinity;
          let closestIdx = -1;
          for (let i = 0; i < cells.length; i++) {
            const dx = cells[i].localX - snappedX;
            const dz = cells[i].localZ - snappedZ;
            const dsq = dx * dx + dz * dz;
            if (dsq < closestDistSq) {
              closestDistSq = dsq;
              closestIdx = i;
            }
          }
          if (closestIdx >= 0 && state.liveShading.cellShading[closestIdx]) {
            isLitNow = true;
          }
        } else {
          isLitNow = true;
        }
      }

      set({
        ghostPanel: {
          localX: snappedX,
          localZ: snappedZ,
          orientation: state.panelOrientation,
          isValid: validation.isValid,
          exposureScore: potential.exposureScore,
          annualKWh: potential.annualKWh,
          isLitNow,
          rejectionReason: validation.rejectionReason,
          rejectionDetail: validation.rejectionDetail,
        },
      });
    },

    clearGhostPanel: () => set({ ghostPanel: null }),

    addPlacedPanel: (panel: PlacedPanel) => {
      const state = get();
      const bldg = state.getSelectedBuilding();
      const panelType = state.getCurrentPanelType();
      if (!bldg) return false;

      const cells = getRoofGridForBuilding(bldg).cells;
      const liveShadingCells = state.liveShading?.cellShading;

      const validation = validatePanelPlacement(
        { localX: panel.localX, localZ: panel.localZ, width: panel.width, length: panel.length },
        bldg,
        state.placedPanels,
        cells,
        state.annualAnalysisResult,
        liveShadingCells
      );

      if (!validation.isValid) {
        return false;
      }

      let annualKWh = panel.annualKWh;
      let exposureScore = panel.exposureScore;
      if (annualKWh === undefined || exposureScore === undefined) {
        const bounds = getPanelBounds(panel.localX, panel.localZ, panel.width, panel.length);
        const potential = evaluatePanelSolarPotential(
          bounds,
          cells,
          state.annualAnalysisResult,
          liveShadingCells
        );
        annualKWh = potential.annualKWh;
        exposureScore = potential.exposureScore;
      }

      const panelWithMetrics: PlacedPanel = {
        ...panel,
        annualKWh,
        exposureScore,
      };

      const newPast = [...state.history.past, state.placedPanels].slice(-50);
      const newPanels = [...state.placedPanels, panelWithMetrics];

      const derived = computeDerivedSnapshots(
        state.buildings,
        state.selectedBuildingId,
        state.analysisResults,
        newPanels,
        state.selectedPanelTypeId,
        state.monthlyConsumptionKWh,
        state.optimizationMode,
        state.maxPossiblePanels
      );

      const bestSpotsList = state.showBestSpots
        ? getBestRemainingSpots(
            bldg,
            newPanels,
            panelType,
            state.panelOrientation,
            cells,
            state.annualAnalysisResult,
            liveShadingCells,
            10
          )
        : state.bestSpotsList;

      set({
        placedPanels: newPanels,
        layoutStatus: 'generated',
        history: { past: newPast, future: [] },
        bestSpotsList,
        ...derived,
      });

      return true;
    },

    deleteSelectedPanels: () => {
      const state = get();
      if (state.selectedPanelIds.length === 0) return;

      const newPast = [...state.history.past, state.placedPanels].slice(-50);
      const newPanels = state.placedPanels.filter((p) => !state.selectedPanelIds.includes(p.id));
      const bldg = state.getSelectedBuilding();
      const panelType = state.getCurrentPanelType();

      const derived = computeDerivedSnapshots(
        state.buildings,
        state.selectedBuildingId,
        state.analysisResults,
        newPanels,
        state.selectedPanelTypeId,
        state.monthlyConsumptionKWh,
        state.optimizationMode,
        state.maxPossiblePanels
      );

      const cells = bldg ? getRoofGridForBuilding(bldg).cells : [];
      const liveShadingCells = state.liveShading?.cellShading;
      const bestSpotsList = state.showBestSpots && bldg
        ? getBestRemainingSpots(
            bldg,
            newPanels,
            panelType,
            state.panelOrientation,
            cells,
            state.annualAnalysisResult,
            liveShadingCells,
            10
          )
        : state.bestSpotsList;

      set({
        placedPanels: newPanels,
        selectedPanelIds: [],
        history: { past: newPast, future: [] },
        bestSpotsList,
        ...derived,
      });
    },

    clearAllPanels: () => {
      const state = get();
      if (state.placedPanels.length === 0) return;

      const newPast = [...state.history.past, state.placedPanels].slice(-50);
      const bldg = state.getSelectedBuilding();
      const panelType = state.getCurrentPanelType();

      const derived = computeDerivedSnapshots(
        state.buildings,
        state.selectedBuildingId,
        state.analysisResults,
        [],
        state.selectedPanelTypeId,
        state.monthlyConsumptionKWh,
        state.optimizationMode,
        state.maxPossiblePanels
      );

      const cells = bldg ? getRoofGridForBuilding(bldg).cells : [];
      const liveShadingCells = state.liveShading?.cellShading;
      const bestSpotsList = state.showBestSpots && bldg
        ? getBestRemainingSpots(
            bldg,
            [],
            panelType,
            state.panelOrientation,
            cells,
            state.annualAnalysisResult,
            liveShadingCells,
            10
          )
        : state.bestSpotsList;

      set({
        placedPanels: [],
        selectedPanelIds: [],
        history: { past: newPast, future: [] },
        bestSpotsList,
        ...derived,
      });
    },

    setPlacedPanelsWithHistory: (panels: PlacedPanel[]) => {
      const state = get();
      const newPast = [...state.history.past, state.placedPanels].slice(-50);
      const bldg = state.getSelectedBuilding();
      const panelType = state.getCurrentPanelType();

      const derived = computeDerivedSnapshots(
        state.buildings,
        state.selectedBuildingId,
        state.analysisResults,
        panels,
        state.selectedPanelTypeId,
        state.monthlyConsumptionKWh,
        state.optimizationMode,
        state.maxPossiblePanels
      );

      const cells = bldg ? getRoofGridForBuilding(bldg).cells : [];
      const liveShadingCells = state.liveShading?.cellShading;
      const bestSpotsList = state.showBestSpots && bldg
        ? getBestRemainingSpots(
            bldg,
            panels,
            panelType,
            state.panelOrientation,
            cells,
            state.annualAnalysisResult,
            liveShadingCells,
            10
          )
        : state.bestSpotsList;

      set({
        placedPanels: panels,
        history: { past: newPast, future: [] },
        bestSpotsList,
        ...derived,
      });
    },

    undo: () => {
      const state = get();
      if (state.history.past.length === 0) return false;

      const previous = state.history.past[state.history.past.length - 1];
      const newPast = state.history.past.slice(0, -1);
      const newFuture = [state.placedPanels, ...state.history.future].slice(0, 50);
      const bldg = state.getSelectedBuilding();
      const panelType = state.getCurrentPanelType();

      const derived = computeDerivedSnapshots(
        state.buildings,
        state.selectedBuildingId,
        state.analysisResults,
        previous,
        state.selectedPanelTypeId,
        state.monthlyConsumptionKWh,
        state.optimizationMode,
        state.maxPossiblePanels
      );

      const cells = bldg ? getRoofGridForBuilding(bldg).cells : [];
      const liveShadingCells = state.liveShading?.cellShading;
      const bestSpotsList = state.showBestSpots && bldg
        ? getBestRemainingSpots(
            bldg,
            previous,
            panelType,
            state.panelOrientation,
            cells,
            state.annualAnalysisResult,
            liveShadingCells,
            10
          )
        : state.bestSpotsList;

      set({
        placedPanels: previous,
        selectedPanelIds: [],
        history: { past: newPast, future: newFuture },
        bestSpotsList,
        ...derived,
      });

      return true;
    },

    redo: () => {
      const state = get();
      if (state.history.future.length === 0) return false;

      const next = state.history.future[0];
      const newFuture = state.history.future.slice(1);
      const newPast = [...state.history.past, state.placedPanels].slice(-50);
      const bldg = state.getSelectedBuilding();
      const panelType = state.getCurrentPanelType();

      const derived = computeDerivedSnapshots(
        state.buildings,
        state.selectedBuildingId,
        state.analysisResults,
        next,
        state.selectedPanelTypeId,
        state.monthlyConsumptionKWh,
        state.optimizationMode,
        state.maxPossiblePanels
      );

      const cells = bldg ? getRoofGridForBuilding(bldg).cells : [];
      const liveShadingCells = state.liveShading?.cellShading;
      const bestSpotsList = state.showBestSpots && bldg
        ? getBestRemainingSpots(
            bldg,
            next,
            panelType,
            state.panelOrientation,
            cells,
            state.annualAnalysisResult,
            liveShadingCells,
            10
          )
        : state.bestSpotsList;

      set({
        placedPanels: next,
        selectedPanelIds: [],
        history: { past: newPast, future: newFuture },
        bestSpotsList,
        ...derived,
      });

      return true;
    },

    suggestNextManualPanel: () => {
      const state = get();
      const bldg = state.getSelectedBuilding();
      const panelType = state.getCurrentPanelType();
      if (!bldg) return;

      const cells = getRoofGridForBuilding(bldg).cells;
      const liveShadingCells = state.liveShading?.cellShading;

      const suggestion = suggestNextPanel(
        bldg,
        state.placedPanels,
        panelType,
        state.panelOrientation,
        cells,
        state.annualAnalysisResult,
        liveShadingCells
      );

      if (!suggestion) return;

      state.addPlacedPanel(suggestion);
    },

    fillAreaManual: (bounds: PanelBounds) => {
      const state = get();
      const bldg = state.getSelectedBuilding();
      const panelType = state.getCurrentPanelType();
      if (!bldg) return;

      const cells = getRoofGridForBuilding(bldg).cells;
      const liveShadingCells = state.liveShading?.cellShading;

      const newPanels = fillAreaWithPanels(
        bounds,
        bldg,
        state.placedPanels,
        panelType,
        state.panelOrientation,
        cells,
        state.annualAnalysisResult,
        liveShadingCells
      );

      if (newPanels.length === 0) return;

      const combined = [...state.placedPanels, ...newPanels];
      state.setPlacedPanelsWithHistory(combined);
    },

    convertAutoLayoutToManual: () => {
      set({ placementMode: 'select' });
    },

    movePanel: (id: string, newLocalX: number, newLocalZ: number) => {
      const state = get();
      const bldg = state.getSelectedBuilding();
      if (!bldg) return false;

      const panel = state.placedPanels.find((p) => p.id === id);
      if (!panel) return false;

      const snappedX = snapToGrid(newLocalX);
      const snappedZ = snapToGrid(newLocalZ);
      const cells = getRoofGridForBuilding(bldg).cells;
      const liveShadingCells = state.liveShading?.cellShading;

      const validation = validatePanelPlacement(
        { localX: snappedX, localZ: snappedZ, width: panel.width, length: panel.length, id },
        bldg,
        state.placedPanels,
        cells,
        state.annualAnalysisResult,
        liveShadingCells
      );

      if (!validation.isValid) return false;

      const bounds = getPanelBounds(snappedX, snappedZ, panel.width, panel.length);
      const potential = evaluatePanelSolarPotential(
        bounds,
        cells,
        state.annualAnalysisResult,
        liveShadingCells
      );

      const updatedPanels = state.placedPanels.map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          localX: snappedX,
          localZ: snappedZ,
          exposureScore: potential.exposureScore,
          annualKWh: potential.annualKWh,
        };
      });

      state.setPlacedPanelsWithHistory(updatedPanels);
      return true;
    },

    resetToDefaultView: () => {
      set((state) => ({
        selectedBuildingId: null,
        cameraFocusTarget: [0, 0, 0],
        cameraPositionTarget: [45, 45, 55],
        cameraResetTrigger: state.cameraResetTrigger + 1,
        isDemoPlaying: false,
        liveShading: null,
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
          if (currentHour >= 16.5) {
            clearInterval(interval);
            get().setTimeOfDay(13.0);
          }
        }, 120);
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
