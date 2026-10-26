import {
  Building,
  SolarAnalysisResult,
  OptimizationMode,
  EnergyResult,
  FinancialResult,
  PanelType,
  PlacedPanel,
  SolarRecommendation,
} from '../types';
import { SIMULATION_ASSUMPTIONS } from '../config/assumptions';

export function generateSolarRecommendation(
  building: Building,
  analysis: SolarAnalysisResult,
  energy: EnergyResult,
  financial: FinancialResult,
  panelType: PanelType,
  mode: OptimizationMode,
  maxPossiblePanels: number,
  placedPanels?: PlacedPanel[]
): SolarRecommendation {
  const suitabilityPercent = analysis.totalRoofArea > 0
    ? Math.round((analysis.recommendedInstallationArea / analysis.totalRoofArea) * 100)
    : 0;

  const obstaclePercent = analysis.totalRoofArea > 0
    ? Math.round((analysis.obstacleArea / analysis.totalRoofArea) * 100)
    : 0;

  const poorPercent = analysis.totalRoofArea > 0
    ? Math.round((analysis.poorArea / analysis.totalRoofArea) * 100)
    : 0;

  const modeTitles: Record<OptimizationMode, string> = {
    need: 'Demand Matching',
    max_generation: 'Maximum Energy Generation',
    lowest_cost: 'Lowest Initial Investment',
    balanced: 'Best Value / Balanced Optimization',
  };

  // Headline
  const headline = `${energy.installedCapacityKW} kW System Recommended (${energy.panelCount} × ${panelType.wattage}W Modules)`;

  // Narrative summary
  const narrative = `Based on raytraced 3D solar exposure simulation across ${analysis.cells.length} rooftop grid points, ${suitabilityPercent}% (${analysis.recommendedInstallationArea} m²) of ${building.name}'s rooftop demonstrates prime solar viability. Configured under "${modeTitles[mode]}" mode for an estimated monthly demand of ${energy.monthlyConsumptionKWh.toLocaleString()} kWh, the recommended ${energy.installedCapacityKW} kW array is projected to generate ${energy.annualGenerationKWh.toLocaleString()} kWh annually, providing ${energy.solarCoveragePercent}% grid electricity coverage.`;

  // Key reasoning points
  const keyPoints: string[] = [
    `Solar Viability: ${suitabilityPercent}% of the ${analysis.totalRoofArea} m² roof area receives excellent or good unblocked sunlight (average ${(analysis.averageExposureScore * 100).toFixed(0)}% daylight factor).`,
    `Demand Alignment: The array produces ${energy.annualGenerationKWh.toLocaleString()} kWh/yr against ${energy.annualConsumptionKWh.toLocaleString()} kWh/yr total consumption, achieving ${energy.solarCoveragePercent}% energy independence.`,
    `Economic Return: Estimated annual bill savings of $${financial.annualSavingsUSD.toLocaleString()} yield an estimated simple payback period of ${financial.paybackYears ? `${financial.paybackYears} years` : 'long-term'} with a 20-year net cash return of $${financial.twentyYearNetSavingsUSD.toLocaleString()}.`,
  ];

  // Specific spatial exclusions explaining why parts were left uninstalled
  const exclusions: string[] = [];

  if (obstaclePercent > 0) {
    exclusions.push(
      `Mechanical Obstructions: ${analysis.obstacleArea} m² (${obstaclePercent}% of rooftop) was excluded due to ${building.roofObstacles.length} rooftop fixture(s) (${building.roofObstacles.map(o => o.name).join(', ')}) plus 0.5m safety clearances.`
    );
  }

  if (poorPercent > 0) {
    exclusions.push(
      `Shadow Exclusion: ${analysis.poorArea} m² (${poorPercent}% of rooftop) was disqualified due to structural shading cast by neighboring structures and rooftop parapets during peak solar hours.`
    );
  } else {
    exclusions.push(
      `Unshaded Horizon: The rooftop benefits from minimal adjacent high-rise shadow cast during the 08:00 - 16:00 peak solar production window.`
    );
  }

  if (energy.panelCount < maxPossiblePanels) {
    const unplacedSlots = maxPossiblePanels - energy.panelCount;
    exclusions.push(
      `Optimization Headroom: ${unplacedSlots} additional viable panel slots were intentionally reserved to prevent low-value grid export surplus under the selected "${modeTitles[mode]}" objective.`
    );
  }

  // Per-Panel placement hints (PRD FR-8.3)
  const panelsList = placedPanels || [];
  const unshadedGenPerPanel = Math.round(
    (panelType.wattage / 1000) *
      SIMULATION_ASSUMPTIONS.peakSunHoursPerDay *
      365 *
      SIMULATION_ASSUMPTIONS.performanceRatio
  );

  let totalLostKWh = 0;
  if (panelsList.length > 0) {
    const lowExposurePanels = panelsList.filter((p) => p.exposureScore < 0.60);
    const lowExposureLostKWh = lowExposurePanels.reduce((sum, p) => {
      const yieldKWh = p.annualKWh ?? Math.round(unshadedGenPerPanel * p.exposureScore);
      return sum + Math.max(0, unshadedGenPerPanel - yieldKWh);
    }, 0);

    totalLostKWh = panelsList.reduce((sum, p) => {
      const yieldKWh = p.annualKWh ?? Math.round(unshadedGenPerPanel * p.exposureScore);
      return sum + Math.max(0, unshadedGenPerPanel - yieldKWh);
    }, 0);

    if (lowExposurePanels.length > 0) {
      keyPoints.push(
        `Placement Risk: ${lowExposurePanels.length} module(s) sit in low-exposure zones (<60% daylight), losing ~${lowExposureLostKWh.toLocaleString()} kWh/yr to structural shadow. Module-level power optimizers or repositioning recommended.`
      );
      exclusions.push(
        `Shaded Module Warning: ${lowExposurePanels.length} module(s) sit in low-exposure spots, reducing potential string performance by ~${lowExposureLostKWh.toLocaleString()} kWh/yr.`
      );
    } else {
      keyPoints.push(
        `Placement Quality: 100% of the ${panelsList.length} modules sit in prime unshaded zones (≥60% daylight factor), capturing maximum insolation with zero low-exposure string penalties.`
      );
    }
  }

  // Technical Highlights
  const technicalHighlights: string[] = [
    `Module Specifications: ${panelType.name} (${panelType.efficiencyPercent}% efficiency, ${panelType.wattage}W rated output).`,
    `Setbacks & Safety: 0.8m perimeter firefighting setback and 0.25m inter-row maintenance corridors strictly enforced.`,
    `Carbon Abatement: Displaces an estimated ${(energy.annualGenerationKWh * 0.42).toFixed(0)} kg CO₂ per annum (equivalent to ${Math.round(energy.annualGenerationKWh * 0.42 / 1000 * 45)} trees).`,
  ];

  if (energy.panelCount > 0) {
    technicalHighlights.push(
      `Per-Panel Output: Average generation is ${Math.round(energy.annualGenerationKWh / energy.panelCount)} kWh/yr per module (${(energy.installedCapacityKW / energy.panelCount * 1000).toFixed(0)}W nominal).`
    );
  }

  if (totalLostKWh > 0) {
    technicalHighlights.push(
      `Shading Derate: Total theoretical unshaded loss is ${totalLostKWh.toLocaleString()} kWh/yr across the array.`
    );
  }

  return {
    headline,
    narrative,
    keyPoints,
    exclusions,
    technicalHighlights,
  };
}
