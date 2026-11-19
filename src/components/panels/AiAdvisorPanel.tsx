import { useState } from 'react';
import { useSolarStore } from '../../store/useSolarStore';
import { useLanguage } from '../../i18n/useLanguage';
import { PANEL_TYPES } from '../../data/panelTypes';
import {
  Sparkles,
  Bot,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  ShieldCheck,
  FileText,
  Key,
} from 'lucide-react';
import { SolarAdvisorRequest, SolarAdvisorResponse } from '../../server/advisorService';

interface AiAdvisorPanelProps {
  onOpenReportModal?: () => void;
}

export function AiAdvisorPanel({ onOpenReportModal }: AiAdvisorPanelProps) {
  const { t } = useLanguage();
  const selectedBuildingId = useSolarStore((s) => s.selectedBuildingId);
  const buildings = useSolarStore((s) => s.buildings);
  const location = useSolarStore((s) => s.location);
  const energy = useSolarStore((s) => s.energyProfile);
  const financial = useSolarStore((s) => s.financialResult);
  const environmental = useSolarStore((s) => s.environmentalResult);
  const analysisResults = useSolarStore((s) => s.analysisResults);
  const liveShading = useSolarStore((s) => s.liveShading);
  const placedPanels = useSolarStore((s) => s.placedPanels);
  const selectedPanelTypeId = useSolarStore((s) => s.selectedPanelTypeId);
  const currency = useSolarStore((s) => s.currency);

  const building = buildings.find((b) => b.id === selectedBuildingId);
  const panelType = PANEL_TYPES.find((p) => p.id === selectedPanelTypeId) || PANEL_TYPES[0];
  const analysis = selectedBuildingId ? analysisResults[selectedBuildingId] : undefined;

  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [advisorData, setAdvisorData] = useState<SolarAdvisorResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const quickPrompts = [
    t.aiAdvisor.quickPrompt1,
    t.aiAdvisor.quickPrompt2,
    t.aiAdvisor.quickPrompt3,
    t.aiAdvisor.quickPrompt4,
  ];

  const handleConsultAdvisor = async (customQuery?: string) => {
    if (!building) return;

    const queryToSend = customQuery !== undefined ? customQuery : question;
    setLoading(true);
    setErrorMsg(null);

    const payload: SolarAdvisorRequest = {
      userQuestion: queryToSend.trim() || undefined,
      selectedBuilding: {
        id: building.id,
        name: building.name,
        width: building.width,
        length: building.length,
        height: building.height,
        roofType: building.roofType,
        obstaclesCount: building.roofObstacles.length,
        roofOrientation: building.roofType === 'flat' ? 'horizontal flat (0° tilt)' : building.roofType,
        roofAzimuthDeg: location.northOffsetDeg || 0,
      },
      location: {
        city: location.city,
        country: location.country,
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone,
        northOffsetDeg: location.northOffsetDeg,
      },
      solarAnalysis: analysis
        ? {
            annualExposurePercent: Math.round(analysis.averageExposureScore * 100),
            unshadedAreaM2: analysis.recommendedInstallationArea,
            recommendedZoneAreaM2: analysis.recommendedZone?.area,
            liveExposurePercent: liveShading ? Math.round(liveShading.litRatio * 100) : undefined,
          }
        : liveShading
        ? {
            annualExposurePercent: Math.round(liveShading.litRatio * 100),
            unshadedAreaM2: Math.round(building.width * building.length * liveShading.litRatio * 10) / 10,
            liveExposurePercent: Math.round(liveShading.litRatio * 100),
          }
        : undefined,
      energyProfile: {
        installedCapacityKW: energy.installedCapacityKW,
        panelCount: energy.panelCount,
        annualGenerationKWh: energy.annualGenerationKWh,
        annualConsumptionKWh: energy.annualConsumptionKWh,
        solarCoveragePercent: energy.solarCoveragePercent,
        surplusKWh: energy.surplusKWh,
      },
      financialResult: {
        totalSystemCost: financial.totalSystemCost,
        annualSavings: financial.annualSavings ?? financial.annualSavingsUSD,
        annualSavingsUSD: financial.annualSavingsUSD,
        paybackYears: financial.paybackYears,
        twentyYearNetSavings: financial.twentyYearNetSavings ?? financial.twentyYearNetSavingsUSD,
        twentyYearNetSavingsUSD: financial.twentyYearNetSavingsUSD,
        roiPercent: financial.roiPercent,
        currency: currency,
        tariffPerKWh: financial.tariffPerKWh,
      },
      environmentalResult: {
        annualCO2ReductionTonnes: environmental.annualCO2ReductionTonnes,
        equivalentTreesPlanted: environmental.equivalentTreesPlanted,
        gridEmissionFactorKgPerKWh: environmental.gridEmissionFactorKgPerKWh,
        gridEmissionFactorSource: environmental.gridEmissionFactorSource,
      },
      panelConfig: {
        panelName: panelType.name,
        wattage: panelType.wattage,
        tiltDegrees: placedPanels[0]?.tiltDegrees ?? 15,
        orientation: placedPanels[0]?.orientation || 'portrait',
      },
    };

    try {
      const res = await fetch('/api/ai/solar-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Server returned HTTP ${res.status}`);
      }

      const data: SolarAdvisorResponse = await res.json();
      setAdvisorData(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to consult AI Solar Advisor';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!building) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
        <Bot className="w-8 h-8 text-slate-500 mx-auto" />
        <h4 className="text-xs font-bold text-slate-300">{t.aiAdvisor.selectBuildingPrompt}</h4>
        <p className="text-[11px] text-slate-500">{t.aiAdvisor.selectBuildingDesc}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Advisor Header Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900/80 to-purple-950/40 border border-indigo-800/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{t.aiAdvisor.title}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                  Gemini Grounded RAG
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">
                {t.aiAdvisor.subtitle}
              </p>
            </div>
          </div>

          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-semibold flex items-center gap-1 transition-all"
              title="Generate comprehensive exportable PDF/printable report"
            >
              <FileText className="w-3 h-3 text-sky-400" />
              <span>{t.aiAdvisor.fullReport}</span>
            </button>
          )}
        </div>

        {/* Input Question Area */}
        <div className="space-y-2">
          <div className="relative">
            <textarea
              rows={2}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t.aiAdvisor.promptPlaceholder}
              className="w-full p-2.5 pr-10 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none font-sans"
            />
            <button
              onClick={() => handleConsultAdvisor()}
              disabled={loading}
              className="absolute right-2.5 bottom-3 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-all shadow-md shadow-indigo-600/30"
              title="Send to AI Solar Advisor"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Quick Prompts Chips */}
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuestion(qp);
                  handleConsultAdvisor(qp);
                }}
                className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900/80 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500/40 text-slate-400 hover:text-indigo-200 transition-all"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">{t.aiAdvisor.consultationError}</span>
            <p className="text-[11px] text-red-300/80">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Unconfigured Gemini API Key Notice Card (Rule 11) */}
      {advisorData && !advisorData.configured && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/50 space-y-3 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <Key className="w-4 h-4 text-amber-400" />
            <span>{t.aiAdvisor.keySetupRequired}</span>
          </div>
          <p className="text-[11px] text-amber-200/90 leading-relaxed font-sans">
            {t.aiAdvisor.keySetupDesc}
          </p>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-slate-300 space-y-1">
            <div>1. Get an API key: <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline">aistudio.google.com</a></div>
            <div>2. Add to server environment: <code className="text-amber-300">GEMINI_API_KEY=your_key</code></div>
            <div>3. Restart RoofRay</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-300 block">{t.aiAdvisor.citationsGrounding}:</span>
            {advisorData.sources.map((src, i) => (
              <div key={i} className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>• {src.title} ({src.authorOrg})</span>
                {src.url && (
                  <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 flex items-center gap-0.5">
                    <span>Source</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Structured Advisor Response Display */}
      {advisorData && advisorData.configured && (
        <div className="space-y-3 animate-fade-in">
          {/* Executive Summary */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>{t.aiAdvisor.executiveSummary}</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {advisorData.summary}
            </p>
          </div>

          {/* Actionable Recommendations */}
          {advisorData.recommendations.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                {t.aiAdvisor.engineeringRecommendations}
              </span>
              <ul className="space-y-1.5 text-slate-300 text-[11px] pl-2">
                {advisorData.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-400 mt-0.5">▸</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Advantages & Risks Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-1.5">
              <span className="font-bold text-emerald-300 flex items-center gap-1 text-[11px]">
                <span>{t.aiAdvisor.keyAdvantages}</span>
              </span>
              <ul className="space-y-1 text-slate-300 text-[10px]">
                {advisorData.advantages.map((adv, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-emerald-400">✓</span>
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-1.5">
              <span className="font-bold text-amber-300 flex items-center gap-1 text-[11px]">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>{t.aiAdvisor.risksLimitations}</span>
              </span>
              <ul className="space-y-1 text-slate-300 text-[10px]">
                {advisorData.risks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-amber-400">!</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Grounded Sources & Citations */}
          {advisorData.sources.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                  <Info className="w-3 h-3 text-sky-400" />
                  <span>{t.aiAdvisor.citationsGrounding}</span>
                </span>
                <span className="text-[9px] font-mono text-slate-500">
                  {advisorData.modelUsed || 'Gemini'}
                </span>
              </div>
              <div className="space-y-1 text-[10px] text-slate-400 font-sans">
                {advisorData.sources.map((src, i) => (
                  <div key={i} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/50">
                    <div>
                      <span className="text-slate-300 font-medium">{src.title}</span>
                      {src.authorOrg && <span className="text-slate-500 ml-1">({src.authorOrg})</span>}
                    </div>
                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:text-sky-300 shrink-0 ml-2 flex items-center gap-0.5"
                      >
                        <span>Ref</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
