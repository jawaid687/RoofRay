import { Building, OptimizationMode, PanelType, PlacedPanel, SolarAnalysisResult } from '../types';
import { SIMULATION_ASSUMPTIONS } from '../config/assumptions';
import { placeSolarPanels } from './panelPlacement';

export interface OptimizationRunResult {
  mode: OptimizationMode;
  placedPanels: PlacedPanel[];
  maxPossiblePanels: number;
  targetPanelCount: number;
  orientationUsed: 'portrait' | 'landscape';
  description: string;
}

/**
 * Executes deterministic optimization mode heuristics based on roof analysis and energy demand.
 */
export function runOptimization(
  building: Building,
  analysis: SolarAnalysisResult,
  panelType: PanelType,
  monthlyConsumptionKWh: number,
  mode: OptimizationMode
): OptimizationRunResult {
  const cells = analysis.cells;
  const annualConsumptionKWh = monthlyConsumptionKWh * 12;

  // First, probe the roof to find absolute maximum physical placement capacity
  const maxProbe = placeSolarPanels(building, cells, panelType);
  const maxPossible = maxProbe.maxPossiblePanels;

  if (maxPossible === 0) {
    return {
      mode,
      placedPanels: [],
      maxPossiblePanels: 0,
      targetPanelCount: 0,
      orientationUsed: 'portrait',
      description: 'No suitable unobstructed rooftop areas available for panel installation.',
    };
  }

  // Baseline expected generation per single panel per year (kWh)
  const singlePanelKW = panelType.wattage / 1000;
  const exposure = analysis.averageExposureScore || 0.85;
  const annualKWhPerPanel =
    singlePanelKW *
    SIMULATION_ASSUMPTIONS.peakSunHoursPerDay *
    365 *
    SIMULATION_ASSUMPTIONS.performanceRatio *
    exposure;

  let targetPanelCount = maxPossible;
  let description = '';

  switch (mode) {
    case 'need': {
      // Size system to match ~100% of annual electricity consumption
      const neededPanels = Math.ceil(annualConsumptionKWh / Math.max(10, annualKWhPerPanel));
      targetPanelCount = Math.max(1, Math.min(maxPossible, neededPanels));
      description = `Sized to match ${monthlyConsumptionKWh.toLocaleString()} kWh/mo demand (${targetPanelCount} of ${maxPossible} maximum capacity).`;
      break;
    }

    case 'max_generation': {
      // Maximize rooftop yield by filling every viable non-shaded slot
      targetPanelCount = maxPossible;
      description = `Maximized rooftop capacity: deploying all ${maxPossible} viable panel positions for peak energy yield.`;
      break;
    }

    case 'lowest_cost': {
      // Minimum entry configuration covering 35% - 50% baseline load with lowest initial capex
      const baselinePanels = Math.max(2, Math.round(annualConsumptionKWh * 0.45 / Math.max(10, annualKWhPerPanel)));
      targetPanelCount = Math.min(maxPossible, Math.max(2, Math.min(8, baselinePanels)));
      description = `Budget-optimized configuration (${targetPanelCount} panels) targeting low upfront capital with high solar ROI.`;
      break;
    }

    case 'balanced':
    default: {
      // Sweet-spot target: 85%-95% demand coverage to avoid exporting low-tariff excess
      const sweetSpotPanels = Math.round(annualConsumptionKWh * 0.88 / Math.max(10, annualKWhPerPanel));
      targetPanelCount = Math.max(2, Math.min(maxPossible, sweetSpotPanels));
      description = `Optimal balance: ${targetPanelCount} panels targeting 88% solar coverage without diminishing export returns.`;
      break;
    }
  }

  const finalPlacement = placeSolarPanels(building, cells, panelType, targetPanelCount);

  return {
    mode,
    placedPanels: finalPlacement.panels,
    maxPossiblePanels: maxPossible,
    targetPanelCount,
    orientationUsed: finalPlacement.chosenOrientation,
    description,
  };
}
