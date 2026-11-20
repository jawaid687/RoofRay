import { useEffect, useState } from 'react';
import { useSolarStore } from '../../store/useSolarStore';
import { useLanguage } from '../../i18n/useLanguage';
import { PANEL_TYPES } from '../../data/panelTypes';
import { SIMULATION_ASSUMPTIONS } from '../../config/assumptions';
import { formatCurrency } from '../../utils/currency';
import { RoofRayLogo } from './RoofRayLogo';
import {
  Printer,
  Copy,
  X,
  ShieldCheck,
  Building2,
  Leaf,
  Check,
  AlertTriangle,
  Zap,
  TrendingUp,
  CheckCircle2,
  SunMedium,
  FileCheck,
} from 'lucide-react';

interface SolarReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SolarReportModal({ isOpen, onClose }: SolarReportModalProps) {
  const { language, t } = useLanguage();
  const selectedBuildingId = useSolarStore((s) => s.selectedBuildingId);
  const buildings = useSolarStore((s) => s.buildings);
  const location = useSolarStore((s) => s.location);
  const energy = useSolarStore((s) => s.energyProfile);
  const financial = useSolarStore((s) => s.financialResult);
  const environmental = useSolarStore((s) => s.environmentalResult);
  const selectedPanelTypeId = useSolarStore((s) => s.selectedPanelTypeId);
  const currency = useSolarStore((s) => s.currency);
  const recommendation = useSolarStore((s) => s.solarRecommendation);

  const building = buildings.find((b) => b.id === selectedBuildingId);
  const panelType = PANEL_TYPES.find((p) => p.id === selectedPanelTypeId) || PANEL_TYPES[0];

  const [copied, setCopied] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !building) return null;

  const reportDate = new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const cityCode = location.city.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'LOC';
  const reportId = `RR-${cityCode}-${building.id.toUpperCase()}-2026`;
  const specificYield = Math.round(energy.annualGenerationKWh / Math.max(energy.installedCapacityKW, 0.1));
  const grossRoofArea = building.width * building.length;
  const annualSavingsValue = financial.annualSavings ?? financial.annualSavingsUSD;
  const twentyYearSavingsValue = financial.twentyYearNetSavings ?? financial.twentyYearNetSavingsUSD;
  const estimatedInverterKW = (energy.installedCapacityKW / 1.2).toFixed(1);

  const handleCopyJSON = () => {
    const reportData = {
      reportType: 'Solar Photovoltaic Rooftop Feasibility Study',
      auditId: reportId,
      engine: 'RoofRay 3D Simulation Platform (NOAA Ephemeris & Raycast Shading)',
      date: reportDate,
      site: {
        buildingName: building.name,
        city: location.city,
        country: location.country,
        coordinates: `${location.latitude}°N, ${location.longitude}°E`,
        timezone: location.timezone,
        grossRoofAreaM2: grossRoofArea,
        roofDimensions: `${building.width}m x ${building.length}m`,
        obstaclesCount: building.roofObstacles.length,
      },
      pvSystem: {
        installedCapacityKWp: energy.installedCapacityKW,
        estimatedInverterKWac: Number(estimatedInverterKW),
        dcAcRatio: 1.2,
        panelModel: `${panelType.name} (${panelType.category})`,
        moduleCount: energy.panelCount,
        moduleWattage: panelType.wattage,
        moduleEfficiencyPercent: panelType.efficiencyPercent,
        annualGenerationKWh: energy.annualGenerationKWh,
        specificYieldKWhPerKWp: specificYield,
        solarDemandOffsetPercent: energy.solarCoveragePercent,
      },
      economics: {
        currency,
        totalCapEx: financial.totalSystemCost,
        equipmentCost: financial.equipmentCost,
        installationAndBOSCost: financial.baseInstallationCost,
        yearOneSavings: annualSavingsValue,
        paybackPeriodYears: financial.paybackYears,
        twentyYearNetBenefit: twentyYearSavingsValue,
        roiPercent: financial.roiPercent,
        electricityTariffPerKWh: financial.tariffPerKWh,
      },
      decarbonization: {
        annualCO2ReductionTonnes: environmental.annualCO2ReductionTonnes,
        twentyYearCO2ReductionTonnes: Number((environmental.annualCO2ReductionTonnes * 20).toFixed(1)),
        equivalentTreeSeedlings: environmental.equivalentTreesPlanted,
        avoidedVehicleMiles: environmental.equivalentMilesDriven,
        gridEmissionFactorKgPerKWh: environmental.gridEmissionFactorKgPerKWh,
        source: environmental.gridEmissionFactorSource,
      },
      engineeringRecommendations: recommendation
        ? {
            verdict: recommendation.headline,
            narrative: recommendation.narrative,
            keyDirectives: recommendation.keyPoints,
          }
        : null,
    };

    navigator.clipboard.writeText(JSON.stringify(reportData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="report-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="report-modal-container relative w-full max-w-4xl bg-[#0d1424] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-100 max-h-[92vh] flex flex-col print:bg-white print:text-slate-900 print:border-none print:shadow-none print:max-h-none print:overflow-visible">
        
        {/* Sticky Header / Action Toolbar */}
        <div className="px-6 py-4 bg-[#0a0f1d] border-b border-slate-800 flex items-center justify-between gap-4 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <RoofRayLogo size={32} />
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                {t.solarReportModal.title}
              </h2>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                {t.solarReportModal.dateLabel} {reportDate} • Ref: {reportId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJSON}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
              title="Copy structured JSON audit data"
              aria-label="Copy Audit JSON"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span className="hidden sm:inline">{copied ? (t.solarReportModal.copiedLabel || 'Copied!') : (t.solarReportModal.copyJson || 'Copy JSON')}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-amber-500/20"
              title="Print or save as PDF"
              aria-label="Print or Save PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.solarReportModal.downloadPdf}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors ml-1"
              aria-label="Close report modal"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Report Body */}
        <div className="p-6 md:p-8 space-y-6 overflow-y-auto text-slate-200 print:p-0 print:space-y-5 print:overflow-visible print:text-slate-900">
          
          {/* Document Masthead (Prints crisp on paper & looks executive on screen) */}
          <div className="pb-5 border-b border-slate-800 report-border flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400 font-semibold block mb-1">
                RoofRay Feasibility & Technical Study
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-white print:text-slate-900">
                {building.name} — Solar Rooftop Engineering Assessment
              </h1>
              <p className="text-xs text-slate-400 report-text-muted mt-1">
                Site: {location.city}, {location.country} ({location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E) • Timezone: {location.timezone}
              </p>
            </div>

            <div className="text-right font-mono text-[11px] text-slate-400 report-text-muted bg-slate-950/60 report-card px-3.5 py-2 rounded-xl border border-slate-800 report-border">
              <div><span className="text-slate-500">Document ID:</span> <span className="text-slate-200 report-text-dark font-semibold">{reportId}</span></div>
              <div><span className="text-slate-500">Methodology:</span> <span className="text-slate-200 report-text-dark">NOAA + Clear Sky + 3D Raycasting</span></div>
              <div><span className="text-slate-500">Status:</span> <span className="text-emerald-400 font-semibold">VALIDATED DIGITAL TWIN</span></div>
            </div>
          </div>

          {/* Executive KPI Summary Dashboard */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.solarReportModal.executiveSummary || 'Executive Summary'}</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Metric 1: System Size */}
              <div className="p-4 rounded-2xl bg-[#090e1a] report-card border border-slate-800 report-border flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 report-text-muted block">
                    {t.solarReportModal.systemSizeLabel}
                  </span>
                  <div className="text-2xl font-bold text-amber-400 print:text-amber-700 mt-1">
                    {energy.installedCapacityKW} <span className="text-xs font-normal text-slate-400 report-text-muted">kWp</span>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 report-border text-[11px] text-slate-400 report-text-muted">
                  <div className="font-semibold text-slate-200 report-text-dark">{energy.panelCount} modules</div>
                  <div>~{estimatedInverterKW} kWac Inverter</div>
                </div>
              </div>

              {/* Metric 2: Annual Generation */}
              <div className="p-4 rounded-2xl bg-[#090e1a] report-card border border-slate-800 report-border flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 report-text-muted block">
                    {t.solarReportModal.annualYieldLabel}
                  </span>
                  <div className="text-2xl font-bold text-sky-400 print:text-sky-700 mt-1">
                    {energy.annualGenerationKWh.toLocaleString()} <span className="text-xs font-normal text-slate-400 report-text-muted">kWh/yr</span>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 report-border text-[11px] text-slate-400 report-text-muted">
                  <div className="font-semibold text-slate-200 report-text-dark">{specificYield} kWh/kWp/yr</div>
                  <div>{energy.solarCoveragePercent}% demand offset</div>
                </div>
              </div>

              {/* Metric 3: Turnkey CapEx */}
              <div className="p-4 rounded-2xl bg-[#090e1a] report-card border border-slate-800 report-border flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 report-text-muted block">
                    {t.solarReportModal.turnkeyCapexLabel}
                  </span>
                  <div className="text-2xl font-bold text-white print:text-slate-900 mt-1">
                    {formatCurrency(financial.totalSystemCost, currency)}
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 report-border text-[11px] text-slate-400 report-text-muted">
                  <div className="font-semibold text-slate-200 report-text-dark">
                    Payback: {financial.paybackYears ? `${financial.paybackYears} yrs` : '—'}
                  </div>
                  <div>Includes full BOS & permit</div>
                </div>
              </div>

              {/* Metric 4: 20-Year Net Benefit */}
              <div className="p-4 rounded-2xl bg-[#090e1a] report-card border border-slate-800 report-border flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 report-text-muted block">
                    20-Year Net Value
                  </span>
                  <div className="text-2xl font-bold text-emerald-400 print:text-emerald-700 mt-1">
                    {formatCurrency(twentyYearSavingsValue, currency)}
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 report-border text-[11px] text-slate-400 report-text-muted">
                  <div className="font-semibold text-slate-200 report-text-dark">+{financial.roiPercent}% ROI</div>
                  <div>{formatCurrency(annualSavingsValue, currency)}/yr savings</div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specifications Grid (2 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left: Rooftop & Boundary Spatial Data */}
            <div className="p-5 rounded-2xl bg-[#090e1a] report-card border border-slate-800 report-border">
              <div className="flex items-center gap-2 font-semibold text-slate-200 report-text-dark text-xs mb-3">
                <Building2 className="w-4 h-4 text-sky-400" />
                <span>{t.solarReportModal.rooftopLocationProfileTitle || 'Rooftop Geometry & Spatial Constraints'}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/70 report-border">
                  <span className="text-slate-400 report-text-muted">{t.solarReportModal.targetBuildingLabel || 'Building Archetype:'}</span>
                  <span className="font-medium text-white report-text-dark">{building.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/70 report-border">
                  <span className="text-slate-400 report-text-muted">{t.solarReportModal.totalRoofDimensionsLabel || 'Gross Rooftop Footprint:'}</span>
                  <span className="font-mono text-slate-300 report-text-dark">{building.width}m × {building.length}m ({grossRoofArea} m²)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/70 report-border">
                  <span className="text-slate-400 report-text-muted">Identified Roof Obstacles:</span>
                  <span className="font-mono text-slate-300 report-text-dark">{building.roofObstacles.length} units (HVAC/Vents)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/70 report-border">
                  <span className="text-slate-400 report-text-muted">{t.solarReportModal.perimeterSetbackLabel || 'Perimeter Safety Setback:'}</span>
                  <span className="font-mono text-slate-300 report-text-dark">{SIMULATION_ASSUMPTIONS.roofEdgeMargin}m (Fire & Wind Buffer)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/70 report-border">
                  <span className="text-slate-400 report-text-muted">{t.solarReportModal.obstacleBufferLabel || 'Obstacle Clearance Buffer:'}</span>
                  <span className="font-mono text-slate-300 report-text-dark">{SIMULATION_ASSUMPTIONS.obstacleBufferMargin}m Service Radius</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400 report-text-muted">{t.solarReportModal.gridResolutionLabel || 'Raycast Grid Resolution:'}</span>
                  <span className="font-mono text-slate-300 report-text-dark">{SIMULATION_ASSUMPTIONS.roofGridResolution}m discrete analysis cells</span>
                </div>
              </div>
            </div>

            {/* Right: Photovoltaic Hardware & Energy Profile */}
            <div className="p-5 rounded-2xl bg-[#090e1a] report-card border border-slate-800 report-border">
              <div className="flex items-center gap-2 font-semibold text-slate-200 report-text-dark text-xs mb-3">
                <SunMedium className="w-4 h-4 text-amber-400" />
                <span>{t.solarReportModal.solarPVTechLayoutTitle || 'PV Hardware & Generation Profile'}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/70 report-border">
                  <span className="text-slate-400 report-text-muted">{t.solarReportModal.selectedPanelTypeLabel || 'Module Model:'}</span>
                  <span className="font-medium text-white report-text-dark">{panelType.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/70 report-border">
                  <span className="text-slate-400 report-text-muted">Module Rating & Form Factor:</span>
                  <span className="font-mono text-slate-300 report-text-dark">{panelType.wattage}W • {panelType.width}m × {panelType.length}m</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/70 report-border">
                  <span className="text-slate-400 report-text-muted">Cell Technology & Efficiency:</span>
                  <span className="font-mono text-slate-300 report-text-dark">{panelType.category} ({panelType.efficiencyPercent}%)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/70 report-border">
                  <span className="text-slate-400 report-text-muted">Estimated Annual Facility Demand:</span>
                  <span className="font-mono text-slate-300 report-text-dark">{energy.annualConsumptionKWh.toLocaleString()} kWh/yr</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/70 report-border">
                  <span className="text-slate-400 report-text-muted">Grid Net Surplus Export:</span>
                  <span className="font-mono text-emerald-400 print:text-emerald-700 font-semibold">
                    {energy.surplusKWh > 0 ? `${energy.surplusKWh.toLocaleString()} kWh/yr` : '0 kWh (100% On-Site Offset)'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400 report-text-muted">Capacity Factor:</span>
                  <span className="font-mono text-slate-300 report-text-dark">{energy.averageCapacityFactorPercent}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial & Environmental Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Financial Performance */}
            <div className="p-5 rounded-2xl bg-[#090e1a] report-card border border-slate-800 report-border">
              <div className="flex items-center gap-2 font-semibold text-slate-200 report-text-dark text-xs mb-3">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>{t.solarReportModal.financialProjection || 'Financial Performance & Cash Flow'}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/70 report-border">
                  <span className="text-slate-400 report-text-muted">Initial Capital Investment (CapEx):</span>
                  <span className="font-mono font-bold text-white report-text-dark">{formatCurrency(financial.totalSystemCost, currency)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/70 report-border">
                  <span className="text-slate-400 report-text-muted">Year-1 Electricity Bill Savings:</span>
                  <span className="font-mono font-semibold text-emerald-400 print:text-emerald-700">
                    {formatCurrency(annualSavingsValue, currency)}/yr
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/70 report-border">
                  <span className="text-slate-400 report-text-muted">Applied Electricity Tariff:</span>
                  <span className="font-mono text-slate-300 report-text-dark">
                    {formatCurrency(financial.tariffPerKWh || (currency === 'BDT' ? 10.5 : 0.24), currency)}/kWh
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/70 report-border">
                  <span className="text-slate-400 report-text-muted">Net Metering Export Settlement:</span>
                  <span className="font-mono text-slate-300 report-text-dark">
                    {((financial.exportCreditRatio ?? 0.5) * 100).toFixed(0)}% wholesale export credit
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/70 report-border">
                  <span className="text-slate-400 report-text-muted">Simple Payback Period:</span>
                  <span className="font-mono font-semibold text-amber-400 print:text-amber-700">
                    {financial.paybackYears ? `${financial.paybackYears} years` : '—'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400 report-text-muted">20-Year Lifetime Net Benefit:</span>
                  <span className="font-mono font-bold text-emerald-400 print:text-emerald-700">
                    {formatCurrency(twentyYearSavingsValue, currency)} (+{financial.roiPercent}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Environmental Sustainability */}
            <div className="p-5 rounded-2xl bg-[#090e1a] report-card border border-slate-800 report-border">
              <div className="flex items-center gap-2 font-semibold text-slate-200 report-text-dark text-xs mb-3">
                <Leaf className="w-4 h-4 text-emerald-400" />
                <span>{t.solarReportModal.environmentalImpact || 'Environmental Sustainability & Carbon Audit'}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/70 report-border">
                  <span className="text-slate-400 report-text-muted">{t.solarReportModal.co2AbatementLabel || 'Annual CO₂ Abatement:'}</span>
                  <span className="font-mono font-bold text-emerald-400 print:text-emerald-700">
                    {environmental.annualCO2ReductionTonnes} {t.solarReportModal.tonnesPerYear || 'Tonnes/yr'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/70 report-border">
                  <span className="text-slate-400 report-text-muted">20-Year Cumulative CO₂ Avoided:</span>
                  <span className="font-mono font-semibold text-slate-300 report-text-dark">
                    {(environmental.annualCO2ReductionTonnes * 20).toFixed(1)} Metric Tonnes
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/70 report-border">
                  <span className="text-slate-400 report-text-muted">{t.solarReportModal.treeEquivalenceLabel || 'Urban Forestry Equivalence:'}</span>
                  <span className="font-mono text-slate-300 report-text-dark">
                    ~{environmental.equivalentTreesPlanted.toLocaleString()} tree seedlings (10-yr growth)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/70 report-border">
                  <span className="text-slate-400 report-text-muted">Avoided Passenger Car Travel:</span>
                  <span className="font-mono text-slate-300 report-text-dark">
                    ~{environmental.equivalentMilesDriven.toLocaleString()} vehicle miles/yr
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400 report-text-muted">{t.solarReportModal.verifiedEmissionFactorLabel || 'Grid Emission Factor:'}</span>
                  <span className="font-mono text-slate-300 report-text-dark">
                    {environmental.gridEmissionFactorKgPerKWh || (currency === 'BDT' ? 0.62 : 0.42)} kg CO₂/kWh
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Engineering Narrative & Directives */}
          {recommendation && (
            <div className="p-5 rounded-2xl bg-[#090e1a] report-card border border-slate-800 report-border space-y-3">
              <div className="flex items-center gap-2 font-semibold text-amber-400 print:text-amber-700 text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{recommendation.headline}</span>
              </div>
              <p className="text-xs text-slate-300 report-text-dark leading-relaxed font-sans">
                {recommendation.narrative}
              </p>
              
              <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {recommendation.keyPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-300 report-text-dark">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 print:text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statutory Disclaimers & Methodology Citations */}
          <div className="p-4 rounded-2xl bg-[#070b14] report-card border border-slate-800/80 report-border text-[11px] text-slate-400 report-text-muted space-y-2 leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold text-slate-300 report-text-dark text-xs">
              <FileCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>{t.solarReportModal.statutoryDisclaimersTitle || 'Statutory Compliance & Engineering Methodology'}</span>
            </div>
            
            <p>
              • <strong>Methodology Standards:</strong> Astronomical ephemeris computed using NOAA Solar Position algorithms (Jean Meeus). Shading geometry resolved via 3D AABB raycasting across 0.8m discretized rooftop cells. Solar insolation modeled via Bird Clear Sky formulation.
            </p>
            <p>
              • <strong>Regulatory Context:</strong> Financial models conform to regional net metering standards (SREDA Bangladesh Net Metering Guidelines 2025 / IEEE 1547 Interconnection). Actual utility interconnection capacity is subject to distribution transformer ratings and local substation permits.
            </p>
            <p className="text-amber-400/90 print:text-amber-800 flex items-start gap-1.5 pt-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                {t.solarReportModal.disclaimerFullText || 'This document presents a deterministic engineering feasibility assessment. Physical structural inspection, roof load-bearing analysis, and electrical interconnection filings must be verified by a licensed professional solar contractor before commercial installation.'}
              </span>
            </p>
          </div>

          {/* Document Footer Verification */}
          <div className="pt-2 pb-1 border-t border-slate-800 report-border flex flex-wrap items-center justify-between text-[10px] text-slate-500 report-text-muted font-mono">
            <span>Generated with RoofRay Solar Intelligence Engine</span>
            <span>Audit Ref: {reportId} • All Values Deterministic SI</span>
          </div>

        </div>
      </div>
    </div>
  );
}
