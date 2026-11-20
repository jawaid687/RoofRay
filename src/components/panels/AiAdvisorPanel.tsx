import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSolarStore } from '../../store/useSolarStore';
import { useLanguage } from '../../i18n/useLanguage';
import { PANEL_TYPES } from '../../data/panelTypes';
import {
  Sparkles,
  Bot,
  User,
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
  RotateCcw,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Zap,
  TrendingUp,
  ArrowRightCircle,
  Sun,
  Layers,
  MapPin,
} from 'lucide-react';
import { SolarAdvisorRequest, SolarAdvisorResponse, ConversationMessageContext } from '../../server/advisorService';

export interface AiAdvisorPanelProps {
  onOpenReportModal?: () => void;
  isWide?: boolean;
  onToggleWide?: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  data?: SolarAdvisorResponse;
  isError?: boolean;
  errorType?: string;
  userPromptOriginal?: string;
}

export function AiAdvisorPanel({ onOpenReportModal, isWide, onToggleWide }: AiAdvisorPanelProps) {
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

  // Conversational State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const [inquiryLocation, setInquiryLocation] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamic Context-Aware Suggested Prompts based on Building Location
  const suggestedPrompts = useMemo(() => {
    const country = (location.country || '').toLowerCase();
    const city = (location.city || '').toLowerCase();

    const isBangladesh = country.includes('bangladesh') || /dhaka|chattogram|sylhet|rajshahi|khulna|barishal|rangpur|mymensingh/.test(city);
    const isUSA = country.includes('usa') || country.includes('united states') || /san francisco|phoenix|new york|california/.test(city);
    const isAustralia = country.includes('australia') || /sydney|melbourne|brisbane/.test(city);
    const isUK = country.includes('uk') || country.includes('united kingdom') || /london|manchester/.test(city);

    if (isBangladesh) {
      return [
        {
          id: 'viability',
          text: t.aiAdvisor.suggestedViability || 'Analyze my rooftop solar viability & payback.',
          icon: Zap,
          color: 'text-amber-400',
        },
        {
          id: 'placement',
          text: t.aiAdvisor.suggestedPlacement || 'Optimize solar panel placement on this roof.',
          icon: Layers,
          color: 'text-sky-400',
        },
        {
          id: 'shading',
          text: t.aiAdvisor.suggestedShading || 'Explain current shading conditions & obstacle impact.',
          icon: Sun,
          color: 'text-amber-300',
        },
        {
          id: 'payback',
          text: t.aiAdvisor.suggestedPayback || 'Calculate solar investment payback in BDT.',
          icon: TrendingUp,
          color: 'text-emerald-400',
        },
        {
          id: 'bd-netmetering',
          text: t.aiAdvisor.suggestedBdNetMetering || 'Check Bangladesh SREDA 2025 Net Metering Guideline eligibility & capacity limits.',
          icon: ShieldCheck,
          color: 'text-purple-400',
        },
        {
          id: 'bd-bpdb',
          text: t.aiAdvisor.suggestedBdBPDB || 'What are BPDB grid interconnection & tariff rules?',
          icon: MapPin,
          color: 'text-cyan-400',
        },
      ];
    }

    if (isUSA) {
      return [
        {
          id: 'viability',
          text: t.aiAdvisor.suggestedViability || 'Analyze my rooftop solar viability & payback.',
          icon: Zap,
          color: 'text-amber-400',
        },
        {
          id: 'placement',
          text: t.aiAdvisor.suggestedPlacement || 'Optimize solar panel placement on this roof.',
          icon: Layers,
          color: 'text-sky-400',
        },
        {
          id: 'shading',
          text: t.aiAdvisor.suggestedShading || 'Explain current shading conditions & obstacle impact.',
          icon: Sun,
          color: 'text-amber-300',
        },
        {
          id: 'payback',
          text: t.aiAdvisor.suggestedPayback || 'Calculate solar investment payback & energy coverage.',
          icon: TrendingUp,
          color: 'text-emerald-400',
        },
        {
          id: 'us-regs',
          text: t.aiAdvisor.suggestedUsRegs || 'Check California solar regulations & NEM 3.0 rules.',
          icon: ShieldCheck,
          color: 'text-purple-400',
        },
        {
          id: 'us-interconnect',
          text: t.aiAdvisor.suggestedUsInterconnect || 'What are US utility interconnection requirements?',
          icon: MapPin,
          color: 'text-cyan-400',
        },
      ];
    }

    if (isAustralia) {
      return [
        {
          id: 'viability',
          text: t.aiAdvisor.suggestedViability || 'Analyze my rooftop solar viability & payback.',
          icon: Zap,
          color: 'text-amber-400',
        },
        {
          id: 'placement',
          text: t.aiAdvisor.suggestedPlacement || 'Optimize solar panel placement on this roof.',
          icon: Layers,
          color: 'text-sky-400',
        },
        {
          id: 'shading',
          text: t.aiAdvisor.suggestedShading || 'Explain current shading conditions & obstacle impact.',
          icon: Sun,
          color: 'text-amber-300',
        },
        {
          id: 'payback',
          text: t.aiAdvisor.suggestedPayback || 'Calculate solar investment payback & feed-in tariffs.',
          icon: TrendingUp,
          color: 'text-emerald-400',
        },
        {
          id: 'au-regs',
          text: t.aiAdvisor.suggestedAuRegs || 'Check Clean Energy Council guidelines & STC incentives.',
          icon: ShieldCheck,
          color: 'text-purple-400',
        },
        {
          id: 'orientation',
          text: 'Recommend equator-facing North orientation for Australia.',
          icon: MapPin,
          color: 'text-cyan-400',
        },
      ];
    }

    if (isUK) {
      return [
        {
          id: 'viability',
          text: t.aiAdvisor.suggestedViability || 'Analyze my rooftop solar viability & payback.',
          icon: Zap,
          color: 'text-amber-400',
        },
        {
          id: 'placement',
          text: t.aiAdvisor.suggestedPlacement || 'Optimize solar panel placement on this roof.',
          icon: Layers,
          color: 'text-sky-400',
        },
        {
          id: 'shading',
          text: t.aiAdvisor.suggestedShading || 'Explain current shading conditions & seasonal variation.',
          icon: Sun,
          color: 'text-amber-300',
        },
        {
          id: 'payback',
          text: t.aiAdvisor.suggestedPayback || 'Calculate solar investment payback & energy coverage.',
          icon: TrendingUp,
          color: 'text-emerald-400',
        },
        {
          id: 'uk-regs',
          text: t.aiAdvisor.suggestedUkRegs || 'Check UK Smart Export Guarantee (SEG) & G98/G99 rules.',
          icon: ShieldCheck,
          color: 'text-purple-400',
        },
        {
          id: 'orientation',
          text: t.aiAdvisor.suggestedOrientation || 'Recommend optimal south-facing tilt for UK latitude.',
          icon: MapPin,
          color: 'text-cyan-400',
        },
      ];
    }

    // Default global fallback
    return [
      {
        id: 'viability',
        text: t.aiAdvisor.suggestedViability || 'Analyze my rooftop solar viability & payback.',
        icon: Zap,
        color: 'text-amber-400',
      },
      {
        id: 'placement',
        text: t.aiAdvisor.suggestedPlacement || 'Optimize solar panel placement on this roof.',
        icon: Layers,
        color: 'text-sky-400',
      },
      {
        id: 'shading',
        text: t.aiAdvisor.suggestedShading || 'Explain current shading conditions & obstacle impact.',
        icon: Sun,
        color: 'text-amber-300',
      },
      {
        id: 'payback',
        text: t.aiAdvisor.suggestedPayback || 'Calculate solar investment payback & energy coverage.',
        icon: TrendingUp,
        color: 'text-emerald-400',
      },
      {
        id: 'netmetering',
        text: t.aiAdvisor.suggestedNetMetering || 'Check local net-metering regulations & utility caps.',
        icon: ShieldCheck,
        color: 'text-purple-400',
      },
      {
        id: 'orientation',
        text: t.aiAdvisor.suggestedOrientation || 'Recommend optimal panel orientation & tilt angle.',
        icon: MapPin,
        color: 'text-cyan-400',
      },
    ];
  }, [location.country, location.city, t]);

  // Context-aware follow-up suggestion chips when chat has history
  const followUpChips = useMemo(() => {
    const country = (location.country || '').toLowerCase();
    if (country.includes('bangladesh')) {
      return [
        'Explain Bangladesh SREDA 2025 net metering and sanctioned load rules',
        'Show 20-year net savings breakdown in BDT',
        'What are BPDB bi-directional meter requirements?',
      ];
    }
    if (country.includes('usa') || country.includes('united states')) {
      return [
        'Explain California NEM 3.0 export credits',
        'Show 20-year net savings breakdown in USD',
        'What are Title 24 solar mandate requirements?',
      ];
    }
    return [
      'Explain shading impact on yield',
      'Show 20-year net savings breakdown',
      'What are the setback & clearance requirements?',
    ];
  }, [location.country]);

  // Format currency
  const currencySymbol = currency === 'BDT' ? '৳' : '$';
  const formattedCapex = useMemo(() => {
    const cost = financial.totalSystemCost;
    if (currency === 'BDT') {
      if (cost >= 100000) return `৳${(cost / 100000).toFixed(2)}L`;
      return `৳${cost.toLocaleString('en-IN')}`;
    }
    return `$${cost.toLocaleString()}`;
  }, [financial.totalSystemCost, currency]);

  // Exposure calculation
  const exposureScore = analysis
    ? Math.round(analysis.averageExposureScore * 100)
    : liveShading
    ? Math.round(liveShading.litRatio * 100)
    : null;

  // Toggle individual collapsible sections in assistant messages
  const toggleSection = (sectionKey: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // Scroll tracking to avoid disturbing user reading history
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 120;
    setUserScrolledUp(isUp);
  };

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    setUserScrolledUp(false);
  };

  useEffect(() => {
    if (!userScrolledUp) {
      scrollToBottom(true);
    }
  }, [messages, loading]);

  // Detect explicit location in query
  const checkQueryLocation = (text: string) => {
    const lower = text.toLowerCase();
    if (/\b(dhaka|chattogram|chittagong|sylhet|rajshahi|khulna|barishal|bangladesh)\b/i.test(lower)) {
      setInquiryLocation('Dhaka, Bangladesh');
    } else if (/\b(san francisco|california|usa)\b/i.test(lower)) {
      setInquiryLocation('San Francisco, CA');
    } else if (/\b(sydney|australia)\b/i.test(lower)) {
      setInquiryLocation('Sydney, Australia');
    }
  };

  // Send message
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt !== undefined ? customPrompt : input).trim();
    if (!textToSend || loading || !building) return;

    checkQueryLocation(textToSend);
    setErrorMsg(null);
    setInput('');

    const userMessageId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLoading(true);

    // Build rolling conversation history for multi-turn context (last 6 messages)
    const conversationHistory: ConversationMessageContext[] = newMessages.slice(-6).map((m) => ({
      role: m.role,
      content: m.text,
    }));

    const payload: SolarAdvisorRequest = {
      userQuestion: textToSend,
      conversationHistory,
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
        city: building.city || (building.id === 'bldg-2' ? 'Rajshahi' : undefined),
        country: building.country || (building.id === 'bldg-2' ? 'Bangladesh' : undefined),
        latitude: building.latitude ?? (building.id === 'bldg-2' ? 24.3636 : undefined),
        longitude: building.longitude ?? (building.id === 'bldg-2' ? 88.6241 : undefined),
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
            annualExposurePercent: undefined,
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
        const errorJson = (await res.json().catch(() => null)) as { message?: string; error?: string } | null;
        const msg = errorJson?.message || `Server returned HTTP ${res.status}`;
        throw new Error(msg);
      }

      const data: SolarAdvisorResponse = await res.json();
      const assistantMessageId = `assistant-${Date.now()}`;
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        text: data.summary,
        data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        userPromptOriginal: textToSend,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Automatically expand primary sections for first assistant message
      setExpandedSections((prev) => ({
        ...prev,
        [`${assistantMessageId}-recs`]: true,
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to consult AI Solar Advisor';
      setErrorMsg(msg);

      const errorMessageId = `assistant-err-${Date.now()}`;
      const errorMessage: ChatMessage = {
        id: errorMessageId,
        role: 'assistant',
        text: msg,
        isError: true,
        errorType: msg.includes('429') ? 'RATE_LIMIT' : msg.includes('401') ? 'AUTH' : 'NETWORK',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        userPromptOriginal: textToSend,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  // Keyboard navigation: Enter sends, Shift+Enter adds newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Copy message text
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy citation URL
  const handleCopyCitation = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Clear conversation
  const handleClearConversation = () => {
    setMessages([]);
    setErrorMsg(null);
    setShowClearConfirm(false);
    setInquiryLocation(null);
  };

  // Retry last query
  const handleRetryLast = (promptToRetry?: string) => {
    if (!promptToRetry) {
      const lastUser = [...messages].reverse().find((m) => m.role === 'user');
      if (lastUser) {
        handleSendMessage(lastUser.text);
      }
    } else {
      handleSendMessage(promptToRetry);
    }
  };

  if (!building) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 max-w-sm">
          <Bot className="w-10 h-10 text-slate-500 mx-auto" />
          <h4 className="text-sm font-bold text-slate-200">{t.aiAdvisor.selectBuildingPrompt}</h4>
          <p className="text-xs text-slate-400 leading-relaxed">{t.aiAdvisor.selectBuildingDesc}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden relative font-sans">
      {/* 1. TOP HEADER / PROJECT CONTEXT INDICATOR */}
      <div className="shrink-0 p-3 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-purple-950/40 border-b border-slate-800/80 flex items-center justify-between gap-2 z-10">
        <div data-tour="advisor-context" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 shadow-sm shadow-purple-500/20">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs font-bold text-white truncate flex items-center gap-1">
                <span>{building.name}</span>
                <span className="text-slate-400 font-normal">·</span>
                <span className="text-slate-300 font-medium">{location.city}, {location.country}</span>
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 truncate mt-0.5">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{energy.installedCapacityKW} kW</span>
              </span>
              <span>•</span>
              <span>{energy.panelCount} panels</span>
              <span>•</span>
              <span className="text-amber-300">{exposureScore !== null ? `${exposureScore}% sun` : 'Not Analyzed'}</span>
              <span>•</span>
              <span className="text-sky-300 font-mono">{formattedCapex}</span>
              <span>•</span>
              <span className="text-slate-300">{energy.solarCoveragePercent}% annual coverage</span>
            </div>
          </div>
        </div>

        {/* Top Controls: Report, New Chat, Clear, Expand/Collapse Toggle */}
        <div className="flex items-center gap-1 shrink-0">
          {onOpenReportModal && (
            <button
              data-tour="advisor-report"
              onClick={onOpenReportModal}
              className="px-2 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-all"
              title="Open full printable engineering report"
            >
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">{t.aiAdvisor.fullReport}</span>
            </button>
          )}

          <button
            onClick={() => handleClearConversation()}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-purple-300 transition-all"
            title="Start New Chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {messages.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-red-950/50 border border-slate-700/80 hover:border-red-800/60 text-slate-400 hover:text-red-400 transition-all"
              title="Clear Conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {onToggleWide && (
            <button
              onClick={onToggleWide}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-[11px] font-semibold transition-all shadow-sm"
              title={isWide ? (t.aiAdvisor.collapseChat || 'Collapse Chat') : (t.aiAdvisor.expandChat || 'Expand Chat')}
              aria-label={isWide ? 'Collapse chat view' : 'Expand chat view'}
            >
              {isWide ? <Minimize2 className="w-3.5 h-3.5 text-purple-400" /> : <Maximize2 className="w-3.5 h-3.5 text-purple-400" />}
              <span className="hidden sm:inline">{isWide ? (t.aiAdvisor.collapseChat || 'Collapse') : (t.aiAdvisor.expandChat || 'Expand')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Inquiry Location Discrepancy Banner */}
      {inquiryLocation && inquiryLocation !== `${location.city}, ${location.country}` && (
        <div className="shrink-0 px-3 py-1.5 bg-purple-950/40 border-b border-purple-800/40 text-[11px] text-purple-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>
              Target Inquiry: <strong className="text-white">{inquiryLocation}</strong> (Applying 3D building geometry to {inquiryLocation} solar ephemeris)
            </span>
          </div>
          <button
            onClick={() => setInquiryLocation(null)}
            className="text-[10px] text-purple-300 hover:text-white ml-2 underline shrink-0"
          >
            Reset
          </button>
        </div>
      )}

      {/* Clear Confirmation Modal Popover */}
      {showClearConfirm && (
        <div className="absolute top-14 right-3 z-30 p-3 bg-slate-900 border border-red-800/60 rounded-xl shadow-xl space-y-2 max-w-xs animate-in fade-in zoom-in-95">
          <p className="text-xs text-slate-200">{t.aiAdvisor.clearConfirm || 'Clear all messages in this conversation?'}</p>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-2.5 py-1 rounded-md text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleClearConversation}
              className="px-2.5 py-1 rounded-md text-xs text-white bg-red-600 hover:bg-red-500 font-semibold"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* 2. CHAT HISTORY / WELCOME SCREEN */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 space-y-4"
      >
        {/* WELCOME SCREEN (When no messages exist) */}
        {messages.length === 0 && (
          <div className="py-4 space-y-5 animate-in fade-in duration-300 max-w-2xl mx-auto">
            {/* Assistant Welcome Banner */}
            <div data-tour="advisor-recommendations" className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900/90 to-purple-950/30 border border-purple-500/20 space-y-3 shadow-lg shadow-purple-950/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>{t.aiAdvisor.welcomeTitle || 'Your AI Solar Engineering Assistant'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono font-normal">
                      Gemini 3.5 Flash-Lite
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {t.aiAdvisor.welcomeDesc || 'Ask questions about rooftop solar potential, panel optimization, shading, energy generation and financial performance.'}
                  </p>
                </div>
              </div>

              {/* Active Simulation Context Card */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300">
                    Grounded in RoofRay 3D Raycasting & verified engineering knowledge
                  </span>
                </div>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded">
                  Single Source of Truth
                </span>
              </div>
            </div>

            {/* Context-Aware Suggested Prompts Grid */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Location-Specific Questions ({location.city})
                </span>
                <span className="text-[10px] text-purple-300 font-mono">
                  {location.country}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {suggestedPrompts.map((sp) => {
                  const Icon = sp.icon;
                  return (
                    <button
                      key={sp.id}
                      onClick={() => handleSendMessage(sp.text)}
                      className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-purple-500/40 text-left transition-all group flex items-start gap-3 shadow-sm hover:shadow-md"
                    >
                      <div className={`p-2 rounded-lg bg-slate-950 border border-slate-800 ${sp.color} shrink-0 group-hover:scale-105 transition-transform`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[12px] sm:text-[13px] text-slate-200 group-hover:text-white leading-snug font-medium">
                        {sp.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* CONVERSATION MESSAGE LIST */}
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          if (isUser) {
            return (
              <div key={msg.id} className="flex justify-end items-end gap-2 group">
                <div className="max-w-[85%] sm:max-w-[78%] p-3.5 sm:p-4 rounded-2xl rounded-tr-sm bg-gradient-to-br from-indigo-700/60 via-indigo-600/50 to-purple-800/40 border border-indigo-400/50 text-white shadow-md space-y-1.5">
                  <p className="text-[13px] sm:text-[14px] leading-relaxed whitespace-pre-wrap font-sans text-slate-50">
                    {msg.text}
                  </p>
                  <div className="text-[10px] text-indigo-200/80 text-right font-mono">
                    {msg.timestamp}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-indigo-600/50 border border-indigo-400/50 flex items-center justify-center text-indigo-100 shrink-0 shadow-sm">
                  <User className="w-4 h-4" />
                </div>
              </div>
            );
          }

          // Assistant Bubble
          const data = msg.data;
          const recsOpen = expandedSections[`${msg.id}-recs`] ?? true;
          const advOpen = expandedSections[`${msg.id}-adv`] ?? false;
          const finOpen = expandedSections[`${msg.id}-fin`] ?? false;
          const nextOpen = expandedSections[`${msg.id}-next`] ?? false;
          const sourcesOpen = expandedSections[`${msg.id}-sources`] ?? false;

          return (
            <div key={msg.id} className="flex justify-start items-start gap-2.5 sm:gap-3 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-purple-600/20 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>

              <div className="max-w-[92%] sm:max-w-[88%] space-y-3">
                {/* Assistant Message Container */}
                <div className="p-4 sm:p-5 rounded-2xl rounded-tl-sm bg-slate-900/95 border border-purple-500/40 text-slate-100 shadow-xl shadow-purple-950/25 space-y-3.5">
                  {/* Assistant Header Row */}
                  <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                        <span>RoofRay Advisor</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono font-medium">
                        {data?.modelUsed || 'gemini-3.5-flash-lite'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span className="text-[10px] font-mono mr-1">{msg.timestamp}</span>
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
                        title="Copy Response"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      {msg.userPromptOriginal && (
                        <button
                          onClick={() => handleRetryLast(msg.userPromptOriginal)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-purple-300 transition-colors"
                          title="Retry Inquiry"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Primary Narrative Summary */}
                  <div className="text-[13px] sm:text-[14px] text-slate-100 leading-relaxed font-sans space-y-2.5">
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {/* Unconfigured Gemini Notice */}
                  {data && !data.configured && (
                    <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/50 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                        <Key className="w-4 h-4 text-amber-400" />
                        <span>{t.aiAdvisor.keySetupRequired}</span>
                      </div>
                      <p className="text-[12px] text-amber-200/90 leading-relaxed">
                        {t.aiAdvisor.keySetupDesc}
                      </p>
                      <div className="p-2.5 rounded-lg bg-slate-950/80 font-mono text-[11px] text-slate-300 space-y-1">
                        <div>1. Get free key: <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline">aistudio.google.com</a></div>
                        <div>2. In .env: <code className="text-amber-300">GEMINI_API_KEY=your_key</code></div>
                        <div>3. Restart RoofRay</div>
                      </div>
                    </div>
                  )}

                  {/* Collapsible Deep-Dive Sections */}
                  {data && data.configured && (
                    <div className="space-y-2.5 pt-1.5 border-t border-slate-800/80">
                      {/* 1. Engineering Recommendations */}
                      {data.recommendations && data.recommendations.length > 0 && (
                        <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                          <button
                            onClick={() => toggleSection(`${msg.id}-recs`)}
                            className="w-full p-3 flex items-center justify-between text-xs font-bold text-amber-300 hover:bg-slate-900/60 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-amber-400" />
                              <span>{t.aiAdvisor.engineeringRecommendations || 'Engineering Recommendations'}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                                {data.recommendations.length}
                              </span>
                            </div>
                            {recsOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </button>
                          {recsOpen && (
                            <div className="p-3.5 pt-0 border-t border-slate-800/50 space-y-2">
                              {data.recommendations.map((rec, i) => (
                                <div key={i} className="flex items-start gap-2 text-[12px] sm:text-[13px] text-slate-200">
                                  <span className="text-amber-400 mt-0.5 font-bold shrink-0">▸</span>
                                  <span className="leading-relaxed">{rec}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 2. Key Advantages & Operational Risks */}
                      {((data.advantages && data.advantages.length > 0) || (data.risks && data.risks.length > 0)) && (
                        <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                          <button
                            onClick={() => toggleSection(`${msg.id}-adv`)}
                            className="w-full p-3 flex items-center justify-between text-xs font-bold text-emerald-300 hover:bg-slate-900/60 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              <span>Key Advantages & Risk Analysis</span>
                            </div>
                            {advOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </button>
                          {advOpen && (
                            <div className="p-3.5 pt-0 border-t border-slate-800/50 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {/* Advantages */}
                              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/30 space-y-1.5">
                                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 uppercase tracking-wider">
                                  <span>Advantages</span>
                                </span>
                                <div className="space-y-1.5">
                                  {data.advantages?.map((adv, i) => (
                                    <div key={i} className="flex items-start gap-2 text-[12px] text-slate-200">
                                      <span className="text-emerald-400 shrink-0 font-bold">✓</span>
                                      <span className="leading-relaxed">{adv}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Risks */}
                              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/30 space-y-1.5">
                                <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1 uppercase tracking-wider">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Risks & Limitations</span>
                                </span>
                                <div className="space-y-1.5">
                                  {data.risks?.map((risk, i) => (
                                    <div key={i} className="flex items-start gap-2 text-[12px] text-slate-200">
                                      <span className="text-amber-400 shrink-0 font-bold">!</span>
                                      <span className="leading-relaxed">{risk}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 3. Financial Performance & Payback Metrics */}
                      <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                        <button
                          onClick={() => toggleSection(`${msg.id}-fin`)}
                          className="w-full p-3 flex items-center justify-between text-xs font-bold text-sky-300 hover:bg-slate-900/60 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-sky-400" />
                            <span>Financial Performance & Economic Transparency</span>
                          </div>
                          {finOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>
                        {finOpen && (
                          <div className="p-3.5 pt-0 border-t border-slate-800/50 space-y-3">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                              <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                                <span className="text-[10px] text-slate-400 block font-medium">Total Capital Cost</span>
                                <span className="text-[13px] font-mono font-bold text-white mt-0.5 block">{currencySymbol}{financial.totalSystemCost.toLocaleString()}</span>
                              </div>
                              <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                                <span className="text-[10px] text-slate-400 block font-medium">Annual Bill Savings</span>
                                <span className="text-[13px] font-mono font-bold text-emerald-400 mt-0.5 block">{currencySymbol}{(financial.annualSavings ?? financial.annualSavingsUSD ?? 0).toLocaleString()}/yr</span>
                              </div>
                              <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                                <span className="text-[10px] text-slate-400 block font-medium">Estimated Payback</span>
                                <span className="text-[13px] font-mono font-bold text-amber-300 mt-0.5 block">{financial.paybackYears !== null ? `${financial.paybackYears} years` : 'N/A'}</span>
                              </div>
                              <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                                <span className="text-[10px] text-slate-400 block font-medium">20-Year Net Benefit</span>
                                <span className="text-[13px] font-mono font-bold text-sky-300 mt-0.5 block">{currencySymbol}{(financial.twentyYearNetSavings ?? financial.twentyYearNetSavingsUSD ?? 0).toLocaleString()}</span>
                              </div>
                              <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                                <span className="text-[10px] text-slate-400 block font-medium">Project ROI</span>
                                <span className="text-[13px] font-mono font-bold text-purple-300 mt-0.5 block">{financial.roiPercent}%</span>
                              </div>
                              <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                                <span className="text-[10px] text-slate-400 block font-medium">Annual Energy Coverage</span>
                                <span className="text-[13px] font-mono font-bold text-slate-200 mt-0.5 block">{energy.solarCoveragePercent}%</span>
                              </div>
                            </div>

                            {/* Financial Disclosure & Transparency Note */}
                            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed space-y-1">
                              <span className="font-bold text-slate-300 block text-[10px] uppercase tracking-wider">
                                {t.aiAdvisor.financialDisclosure || 'Financial Transparency & Simulation Disclosure'}:
                              </span>
                              <p>
                                {t.aiAdvisor.financialDisclosureText || 'Annual bill savings and payback reflect annualized net-metering offset under the applied flat tariff. Actual bill savings depend on utility rate structures, time-of-use tariffs, and interval load profiles.'} Applied Tariff: <strong className="text-slate-200 font-mono">{currencySymbol}{financial.tariffPerKWh ?? 'N/A'}/kWh</strong>.
                              </p>
                              <p className="text-[10px] text-slate-500">
                                Note: This simulation models annualized geometric energy offset (annual generation / consumption). Real-world sub-hourly self-consumption requires interval smart-meter load monitoring.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 4. Actionable Next Steps & Engineering Assumptions */}
                      {((data.next_steps && data.next_steps.length > 0) || (data.assumptions && data.assumptions.length > 0)) && (
                        <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                          <button
                            onClick={() => toggleSection(`${msg.id}-next`)}
                            className="w-full p-3 flex items-center justify-between text-xs font-bold text-sky-300 hover:bg-slate-900/60 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <ArrowRightCircle className="w-4 h-4 text-sky-400" />
                              <span>Project Next Steps & Engineering Assumptions</span>
                            </div>
                            {nextOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </button>
                          {nextOpen && (
                            <div className="p-3.5 pt-0 border-t border-slate-800/50 space-y-2.5">
                              {data.next_steps && data.next_steps.length > 0 && (
                                <div className="space-y-1.5">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recommended Next Steps:</span>
                                  {data.next_steps.map((ns, i) => (
                                    <div key={i} className="flex items-start gap-2 text-[12px] text-slate-200">
                                      <span className="text-sky-400 font-bold">{i + 1}.</span>
                                      <span className="leading-relaxed">{ns}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {data.assumptions && data.assumptions.length > 0 && (
                                <div className="space-y-1.5 pt-2 border-t border-slate-800/50">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Physical Assumptions:</span>
                                  {data.assumptions.map((as, i) => (
                                    <div key={i} className="flex items-start gap-2 text-[11px] text-slate-400">
                                      <span className="text-slate-500">•</span>
                                      <span className="leading-relaxed">{as}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 5. Verified Citations & Regulatory Grounding */}
                      {data.sources && data.sources.length > 0 && (
                        <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                          <button
                            onClick={() => toggleSection(`${msg.id}-sources`)}
                            className="w-full p-3 flex items-center justify-between text-xs font-bold text-purple-300 hover:bg-slate-900/60 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Info className="w-4 h-4 text-purple-400" />
                              <span>{t.aiAdvisor.citationsGrounding || 'Technical Citations Grounding'}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                                {data.sources.length} sources
                              </span>
                            </div>
                            {sourcesOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </button>
                          {sourcesOpen && (
                            <div className="p-3.5 pt-0 border-t border-slate-800/50 space-y-2.5">
                              {data.sources.map((src, i) => (
                                <div
                                  key={i}
                                  className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/60 space-y-1.5"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="text-[12px] font-semibold text-slate-200">
                                      {src.title}
                                      {src.authorOrg && (
                                        <span className="text-slate-400 font-normal ml-1">
                                          ({src.authorOrg})
                                        </span>
                                      )}
                                    </div>
                                    {src.url && (
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                          onClick={() => handleCopyCitation(src.url!)}
                                          className="p-1 rounded text-slate-400 hover:text-white"
                                          title="Copy source link"
                                        >
                                          {copiedUrl === src.url ? (
                                            <Check className="w-3 h-3 text-emerald-400" />
                                          ) : (
                                            <Copy className="w-3 h-3" />
                                          )}
                                        </button>
                                        <a
                                          href={src.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sky-400 hover:text-sky-300 flex items-center gap-1 text-[11px] font-medium"
                                        >
                                          <span>Doc</span>
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-sans leading-relaxed">
                                    {src.relevance}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error Retry Message */}
                  {msg.isError && (
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-200 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{msg.text}</span>
                      </div>
                      {msg.userPromptOriginal && (
                        <button
                          onClick={() => handleRetryLast(msg.userPromptOriginal)}
                          className="px-2.5 py-1 rounded bg-red-800/50 hover:bg-red-700/60 text-[11px] font-bold text-white shrink-0"
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* 3. THINKING / LOADING INDICATOR */}
        {loading && (
          <div className="flex justify-start items-start gap-2.5 animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-purple-600/30">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-sm bg-slate-900/95 border border-purple-500/40 text-slate-200 shadow-md space-y-1.5 max-w-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-purple-300">
                  {t.aiAdvisor.analyzing || 'Analyzing your solar data...'}
                </span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Evaluating 3D raycasting, shading exposure & verified regulatory guidelines.
              </p>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {userScrolledUp && (
        <button
          onClick={() => scrollToBottom(true)}
          className="absolute right-4 bottom-20 z-20 px-3 py-1.5 rounded-full bg-purple-600/90 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition-all"
        >
          <span>↓</span>
          <span>{t.aiAdvisor.scrollToBottom || 'New message'}</span>
        </button>
      )}

      {/* 4. FIXED MESSAGE COMPOSER AT BOTTOM */}
      <div data-tour="advisor-chat" className="shrink-0 p-3 bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-sm space-y-2 z-10">
        {/* Error notification banner */}
        {errorMsg && (
          <div className="p-2 rounded-xl bg-red-950/40 border border-red-800/60 text-[11px] text-red-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="truncate">{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-[10px] text-red-300 hover:text-white underline shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Quick Follow-up Chips (When conversation is active) */}
        {messages.length > 0 && !loading && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] scrollbar-none">
            {followUpChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-purple-950/60 border border-slate-800 hover:border-purple-500/40 text-slate-300 hover:text-purple-200 whitespace-nowrap transition-all shrink-0 font-medium"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Composer Input Box */}
        <div className="relative flex items-end gap-2 bg-slate-900/90 border border-slate-800 rounded-xl p-1.5 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500/30 transition-all">
          <textarea
            ref={textareaRef}
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.aiAdvisor.chatInputPlaceholder || 'Ask anything about your solar project (Enter to send, Shift+Enter for newline)...'}
            className="flex-1 bg-transparent p-1.5 text-xs sm:text-[13px] text-slate-100 placeholder-slate-500 focus:outline-none resize-none font-sans max-h-24 leading-relaxed"
            disabled={loading}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || loading}
            className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-purple-600/20 shrink-0 mb-0.5"
            title="Send to AI Solar Advisor (Enter)"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
