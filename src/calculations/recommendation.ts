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
import { formatCurrency } from '../utils/currency';

export function generateSolarRecommendation(
  building: Building,
  analysis: SolarAnalysisResult,
  energy: EnergyResult,
  financial: FinancialResult,
  panelType: PanelType,
  mode: OptimizationMode,
  maxPossiblePanels: number,
  placedPanels?: PlacedPanel[],
  language: 'en' | 'bn' = 'en'
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

  const isBn = language === 'bn';

  const modeTitles: Record<OptimizationMode, string> = isBn
    ? {
        need: 'চাহিদা সমন্বয়',
        max_generation: 'সর্বোচ্চ সৌর উৎপাদন',
        lowest_cost: 'সর্বনিম্ন প্রাথমিক বিনিয়োগ',
        balanced: 'ভারসাম্যপূর্ণ অপটিমাইজেশন',
      }
    : {
        need: 'Demand Matching',
        max_generation: 'Maximum Energy Generation',
        lowest_cost: 'Lowest Initial Investment',
        balanced: 'Best Value / Balanced Optimization',
      };

  // Headline
  const headline = isBn
    ? `${energy.installedCapacityKW} kW সিস্টেম সুপারিশকৃত (${energy.panelCount} × ${panelType.wattage}W মডিউল)`
    : `${energy.installedCapacityKW} kW System Recommended (${energy.panelCount} × ${panelType.wattage}W Modules)`;

  // Narrative summary
  const narrative = isBn
    ? `${analysis.cells.length}টি ছাদ গ্রিড পয়েন্টে ৩ডি রেইট্রেসড সূর্যালোক সিমুলেশনের ভিত্তিতে, ${building.name}-এর ছাদের ${suitabilityPercent}% (${analysis.recommendedInstallationArea} m²) এলাকা আদর্শ সৌরবিদ্যুৎ সম্ভাবনাময়। "${modeTitles[mode]}" স্ট্র্যাটেজির অধীনে মাসিক আনুমানিক ${energy.monthlyConsumptionKWh.toLocaleString()} kWh বিদ্যুৎ চাহিদার বিপরীতে প্রস্তাবিত ${energy.installedCapacityKW} kW সোলার অ্যারে বছরে আনুমানিক ${energy.annualGenerationKWh.toLocaleString()} kWh বিদ্যুৎ উৎপাদন করবে, যা জাতীয় গ্রিড বিদ্যুতের ${energy.solarCoveragePercent}% পূরণ করবে।`
    : `Based on raytraced 3D solar exposure simulation across ${analysis.cells.length} rooftop grid points, ${suitabilityPercent}% (${analysis.recommendedInstallationArea} m²) of ${building.name}'s rooftop demonstrates prime solar viability. Configured under "${modeTitles[mode]}" mode for an estimated monthly demand of ${energy.monthlyConsumptionKWh.toLocaleString()} kWh, the recommended ${energy.installedCapacityKW} kW array is projected to generate ${energy.annualGenerationKWh.toLocaleString()} kWh annually, providing ${energy.solarCoveragePercent}% grid electricity coverage.`;

  // Key reasoning points
  const keyPoints: string[] = isBn
    ? [
        `সৌর সম্ভাব্যতা: মোট ছাদের আয়তন ${analysis.totalRoofArea} m²-এর মধ্যে ${suitabilityPercent}% অংশে চমৎকার বা পর্যাপ্ত সূর্যালোক পৌঁছায় (গড় সূর্যালোক ফ্যাক্টর ${(analysis.averageExposureScore * 100).toFixed(0)}%)।`,
        `চাহিদা সমন্বয়: সিস্টেমটি বার্ষিক মোট ${energy.annualConsumptionKWh.toLocaleString()} kWh ব্যবহারের বিপরীতে ${energy.annualGenerationKWh.toLocaleString()} kWh উৎপাদন করবে, যার ফলে ${energy.solarCoveragePercent}% শক্তি স্বনির্ভরতা অর্জিত হবে।`,
        `অর্থনৈতিক রিটার্ন: আনুমানিক বার্ষিক বিদ্যুৎ বিল সাশ্রয় ${formatCurrency(financial.annualSavings ?? financial.annualSavingsUSD, financial.currency || 'USD')}, যা আনুমানিক ${financial.paybackYears ? `${financial.paybackYears} বছরে` : 'দীর্ঘমেয়াদে'} প্রাথমিক বিনিয়োগ তুলে আনবে এবং ২০ বছরে নিট ক্যাশ রিটার্ন দেবে ${formatCurrency(financial.twentyYearNetSavings ?? financial.twentyYearNetSavingsUSD, financial.currency || 'USD')}।`,
      ]
    : [
        `Solar Viability: ${suitabilityPercent}% of the ${analysis.totalRoofArea} m² roof area receives excellent or good unblocked sunlight (average ${(analysis.averageExposureScore * 100).toFixed(0)}% daylight factor).`,
        `Demand Alignment: The array produces ${energy.annualGenerationKWh.toLocaleString()} kWh/yr against ${energy.annualConsumptionKWh.toLocaleString()} kWh/yr total consumption, achieving ${energy.solarCoveragePercent}% energy independence.`,
        `Economic Return: Estimated annual bill savings of ${formatCurrency(financial.annualSavings ?? financial.annualSavingsUSD, financial.currency || 'USD')} yield an estimated simple payback period of ${financial.paybackYears ? `${financial.paybackYears} years` : 'long-term'} with a 20-year net cash return of ${formatCurrency(financial.twentyYearNetSavings ?? financial.twentyYearNetSavingsUSD, financial.currency || 'USD')}.`,
      ];

  // Specific spatial exclusions explaining why parts were left uninstalled
  const exclusions: string[] = [];

  if (obstaclePercent > 0) {
    exclusions.push(
      isBn
        ? `ছাদের প্রতিবন্ধকতা: ছাদের উপরিভাগের ${building.roofObstacles.length}টি স্থাপনা (${building.roofObstacles.map(o => o.name).join(', ')}) এবং ০.৫ মিটার নিরাপত্তা বাফারের কারণে ${analysis.obstacleArea} m² (${obstaclePercent}%) এলাকা প্যানেল স্থাপনের বাইরে রাখা হয়েছে।`
        : `Mechanical Obstructions: ${analysis.obstacleArea} m² (${obstaclePercent}% of rooftop) was excluded due to ${building.roofObstacles.length} rooftop fixture(s) (${building.roofObstacles.map(o => o.name).join(', ')}) plus 0.5m safety clearances.`
    );
  }

  if (poorPercent > 0) {
    exclusions.push(
      isBn
        ? `ছায়া বর্জন: পিক সৌর সময়ে পার্শ্ববর্তী উঁচু ভবন ও ছাদের প্যারাপেটের কাঠামোগত ছায়ার কারণে ${analysis.poorArea} m² (${poorPercent}%) এলাকা অযোগ্য হিসেবে বাদ দেওয়া হয়েছে।`
        : `Shadow Exclusion: ${analysis.poorArea} m² (${poorPercent}% of rooftop) was disqualified due to structural shading cast by neighboring structures and rooftop parapets during peak solar hours.`
    );
  } else {
    exclusions.push(
      isBn
        ? `ছায়ামুক্ত দিক: সকাল ০৮:০০ থেকে বিকাল ১৬:০০ পর্যন্ত পিক সৌর উৎপাদন সময়ে ছাদটিতে সংলগ্ন উঁচু ভবনের ছায়া ন্যূনতম থাকে।`
        : `Unshaded Horizon: The rooftop benefits from minimal adjacent high-rise shadow cast during the 08:00 - 16:00 peak solar production window.`
    );
  }

  if (energy.panelCount < maxPossiblePanels) {
    const unplacedSlots = maxPossiblePanels - energy.panelCount;
    exclusions.push(
      isBn
        ? `অপটিমাইজেশন সংরক্ষণ: নির্বাচিত "${modeTitles[mode]}" লক্ষ্যমাত্রার অধীনে গ্রিডে কম মূল্যের অতিরিক্ত বিদ্যুৎ রপ্তানি এড়াতে অতিরিক্ত ${unplacedSlots}টি কার্যকর স্লট সংরক্ষিত রাখা হয়েছে।`
        : `Optimization Headroom: ${unplacedSlots} additional viable panel slots were intentionally reserved to prevent low-value grid export surplus under the selected "${modeTitles[mode]}" objective.`
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
        isBn
          ? `প্লেসমেন্ট ঝুঁকি: ${lowExposurePanels.length}টি মডিউল কম বিকিরণযুক্ত এলাকায় (<৬০% সূর্যালোক) স্থাপিত, ফলে ছায়ার কারণে বছরে প্রায় ${lowExposureLostKWh.toLocaleString()} kWh বিদ্যুৎ ক্ষয় হতে পারে। পাওয়ার অপটিমাইজার ব্যবহার বা প্যানেল পুনঃবিন্যাস বাঞ্ছনীয়।`
          : `Placement Risk: ${lowExposurePanels.length} module(s) sit in low-exposure zones (<60% daylight), losing ~${lowExposureLostKWh.toLocaleString()} kWh/yr to structural shadow. Module-level power optimizers or repositioning recommended.`
      );
      exclusions.push(
        isBn
          ? `ছায়াযুক্ত প্যানেল সতর্কতা: ${lowExposurePanels.length}টি মডিউল কম সূর্যালোকযুক্ত স্থানে রয়েছে, যা স্ট্রিং উৎপাদন বছরে প্রায় ${lowExposureLostKWh.toLocaleString()} kWh কমিয়ে দিতে পারে।`
          : `Shaded Module Warning: ${lowExposurePanels.length} module(s) sit in low-exposure spots, reducing potential string performance by ~${lowExposureLostKWh.toLocaleString()} kWh/yr.`
      );
    } else {
      keyPoints.push(
        isBn
          ? `প্লেসমেন্ট মান: স্থাপিত ${panelsList.length}টি মডিউলের ১০০% উৎকৃষ্ট ছায়ামুক্ত স্থানে (≥৬০% সূর্যালোক ফ্যাক্টর) অবস্থিত, ফলে কোনো স্ট্রিং পেনাল্টি ছাড়াই সর্বোচ্চ সৌর উৎপাদন নিশ্চিত হবে।`
          : `Placement Quality: 100% of the ${panelsList.length} modules sit in prime unshaded zones (≥60% daylight factor), capturing maximum insolation with zero low-exposure string penalties.`
      );
    }
  }

  // Technical Highlights
  const technicalHighlights: string[] = isBn
    ? [
        `মডিউল স্পেসিফিকেশন: ${panelType.name} (${panelType.efficiencyPercent}% কার্যক্ষমতা, ${panelType.wattage}W রেটেড ক্ষমতা)।`,
        `সেটব্যাক ও অগ্নিনির্বাপক সুরক্ষা: সীমানা ঘেঁষে ০.৮ মিটার অগ্নিনির্বাপক সেটব্যাক এবং সারির মাঝে ০.২৫ মিটার করিডোর নিশ্চিত করা হয়েছে।`,
        `কার্বন নিঃসরণ হ্রাস: বার্ষিক প্রায় ${(energy.annualGenerationKWh * 0.42).toFixed(0)} কেজি CO₂ গ্যাস নিঃসরণ হ্রাস করবে (যা প্রায় ${Math.round(energy.annualGenerationKWh * 0.42 / 1000 * 45)}টি বৃক্ষরোপণের সমতুল্য)।`,
      ]
    : [
        `Module Specifications: ${panelType.name} (${panelType.efficiencyPercent}% efficiency, ${panelType.wattage}W rated output).`,
        `Setbacks & Safety: 0.8m perimeter firefighting setback and 0.25m inter-row maintenance corridors strictly enforced.`,
        `Carbon Abatement: Displaces an estimated ${(energy.annualGenerationKWh * 0.42).toFixed(0)} kg CO₂ per annum (equivalent to ${Math.round(energy.annualGenerationKWh * 0.42 / 1000 * 45)} trees).`,
      ];

  if (energy.panelCount > 0) {
    technicalHighlights.push(
      isBn
        ? `প্রতি প্যানেল উৎপাদন: মডিউল প্রতি গড় বার্ষিক উৎপাদন ${Math.round(energy.annualGenerationKWh / energy.panelCount)} kWh (${(energy.installedCapacityKW / energy.panelCount * 1000).toFixed(0)}W নমিনাল)।`
        : `Per-Panel Output: Average generation is ${Math.round(energy.annualGenerationKWh / energy.panelCount)} kWh/yr per module (${(energy.installedCapacityKW / energy.panelCount * 1000).toFixed(0)}W nominal).`
    );
  }

  if (totalLostKWh > 0) {
    technicalHighlights.push(
      isBn
        ? `ছায়াজনিত ড্রপ: সম্পূর্ণ অ্যারে জুড়ে তাত্ত্বিক ছায়াজনিত ক্ষয় বার্ষিক ${totalLostKWh.toLocaleString()} kWh।`
        : `Shading Derate: Total theoretical unshaded loss is ${totalLostKWh.toLocaleString()} kWh/yr across the array.`
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
