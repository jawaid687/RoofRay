import { useSolarStore } from '../../store/useSolarStore';
import { PANEL_TYPES } from '../../data/panelTypes';
import { formatCurrency } from '../../utils/currency';
import {
  Printer,
  Copy,
  X,
  Sun,
  ShieldCheck,
  Building2,
  Leaf,
  Check,
  Info,
} from 'lucide-react';
import { useState } from 'react';

interface SolarReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SolarReportModal({ isOpen, onClose }: SolarReportModalProps) {
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

  if (!isOpen || !building) return null;

  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleCopyJSON = () => {
    const reportData = {
      project: 'RoofRay V3 Solar Rooftop Feasibility Assessment',
      competition: 'International AI Builders Congress 2026 • Idea to Unicorn',
      date: reportDate,
      location: {
        city: location.city,
        country: location.country,
        coordinates: `${location.latitude}°N, ${location.longitude}°E`,
        timezone: location.timezone,
      },
      building: {
        name: building.name,
        dimensionsMeters: `${building.width}m x ${building.length}m`,
        roofAreaM2: building.width * building.length,
        obstaclesCount: building.roofObstacles.length,
      },
      solarPVSystem: {
        capacityKW: energy.installedCapacityKW,
        panelCount: energy.panelCount,
        panelModel: `${panelType.name} (${panelType.wattage}W)`,
        annualGenerationKWh: energy.annualGenerationKWh,
        demandCoveragePercent: energy.solarCoveragePercent,
      },
      economics: {
        currency: currency,
        totalCapex: financial.totalSystemCost,
        annualSavings: financial.annualSavingsUSD,
        paybackPeriodYears: financial.paybackYears,
        twentyYearNetSavings: financial.twentyYearNetSavingsUSD,
        roiPercent: financial.roiPercent,
      },
      environmentalImpact: {
        annualCO2ReductionTonnes: environmental.annualCO2ReductionTonnes,
        equivalentTreesPlanted: environmental.equivalentTreesPlanted,
        emissionFactor: environmental.gridEmissionFactorSource,
      },
    };

    navigator.clipboard.writeText(JSON.stringify(reportData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Modal Actions */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>RoofRay Solar Feasibility Report</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  VERIFIED SIMULATION
                </span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">Date: {reportDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJSON}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1.5 transition-all"
              title="Copy structured report JSON"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'JSON'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
              title="Print or export to PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-400 block">System Size</span>
            <div className="text-lg font-bold text-amber-400 mt-1">
              {energy.installedCapacityKW} <span className="text-xs text-slate-400">kW</span>
            </div>
            <span className="text-[10px] text-slate-500">{energy.panelCount} solar modules</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-400 block">Annual Yield</span>
            <div className="text-lg font-bold text-sky-400 mt-1">
              {energy.annualGenerationKWh.toLocaleString()} <span className="text-xs text-slate-400">kWh</span>
            </div>
            <span className="text-[10px] text-slate-500">{energy.solarCoveragePercent}% demand offset</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-400 block">Turnkey Capex</span>
            <div className="text-lg font-bold text-white mt-1">
              {formatCurrency(financial.totalSystemCost, currency)}
            </div>
            <span className="text-[10px] text-slate-500">Includes installation</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-400 block">Simple Payback</span>
            <div className="text-lg font-bold text-emerald-400 mt-1">
              {financial.paybackYears ? `${financial.paybackYears} yrs` : '—'}
            </div>
            <span className="text-[10px] text-slate-500">Annual: {formatCurrency(financial.annualSavingsUSD, currency)}</span>
          </div>
        </div>

        {/* Technical & Spatial Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Spatial Rooftop Specifications */}
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <Building2 className="w-4 h-4 text-sky-400" />
              <span>Rooftop & Location Profile</span>
            </div>
            <div className="space-y-1.5 text-slate-300 font-mono text-[11px]">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Target Building:</span>
                <span className="text-white">{building.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Total Roof Dimensions:</span>
                <span>{building.width}m × {building.length}m ({building.width * building.length} m²)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Raycast Grid Resolution:</span>
                <span>0.8m x 0.8m discretized</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Astronomical Site:</span>
                <span>{location.city}, {location.country} ({location.latitude}°N, {location.longitude}°E)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Utility Timezone:</span>
                <span>{location.timezone}</span>
              </div>
            </div>
          </div>

          {/* Environmental Carbon Displacement */}
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span>Decarbonization & Environmental Benefit</span>
            </div>
            <div className="space-y-1.5 text-slate-300 font-mono text-[11px]">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Annual CO₂ Offset:</span>
                <span className="text-emerald-400 font-bold">{environmental.annualCO2ReductionTonnes} Tonnes/yr</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Seedling Trees Equivalent:</span>
                <span>~{environmental.equivalentTreesPlanted} trees grown for 10 yrs</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Displaced Vehicle Miles:</span>
                <span>{environmental.equivalentMilesDriven.toLocaleString()} miles avoided</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Grid Emission Factor:</span>
                <span>{environmental.gridEmissionFactorKgPerKWh || 0.42} kg CO₂/kWh</span>
              </div>
            </div>
          </div>
        </div>

        {/* Narrative & Recommendations */}
        {recommendation && (
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <ShieldCheck className="w-4 h-4" />
              <span>{recommendation.headline}</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
              {recommendation.narrative}
            </p>
            <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px]">
              {recommendation.keyPoints.map((kp, i) => (
                <div key={i} className="flex items-start gap-1.5 text-slate-300">
                  <span className="text-amber-400">▸</span>
                  <span>{kp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Source Attributions & Compliance Disclaimers */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/60 text-[10px] text-slate-400 space-y-1.5 leading-relaxed font-sans">
          <div className="flex items-center gap-1 font-bold text-slate-300">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span>Authoritative Data Sources & Legal Engineering Notice:</span>
          </div>
          <p>
            • <strong>Ephemeris & Radiation:</strong> NOAA Solar Position Algorithm & NASA POWER satellite-observed climatological database.
          </p>
          <p>
            • <strong>Regulatory & Tariffs:</strong> SREDA Net Metering Guidelines (2018/2021) and BPDB 2024 Gazette Tariff Schedules.
          </p>
          <p className="text-amber-400/90 font-medium">
            ⚠️ DISCLAIMER: This document constitutes a preliminary feasibility simulation. A licensed structural engineer must verify rooftop load-bearing capacity and a certified electrical contractor must inspect the distribution panel before equipment procurement.
          </p>
        </div>
      </div>
    </div>
  );
}
