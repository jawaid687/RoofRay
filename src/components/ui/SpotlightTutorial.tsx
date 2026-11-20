import { useState, useEffect, useRef, useCallback } from 'react';
import { useGuidanceStore } from '../../store/useGuidanceStore';
import { useLanguage } from '../../i18n/useLanguage';
import { getTutorialSteps } from '../../config/tutorialContent';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Sparkles,
  Building2,
  MousePointer,
  BarChart3,
  HelpCircle,
} from 'lucide-react';

interface ElementRect {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

export function SpotlightTutorial() {
  const activeTutorial = useGuidanceStore((s) => s.activeTutorial);
  const tutorialStepIndex = useGuidanceStore((s) => s.tutorialStepIndex);
  const nextTutorialStep = useGuidanceStore((s) => s.nextTutorialStep);
  const prevTutorialStep = useGuidanceStore((s) => s.prevTutorialStep);
  const skipTutorial = useGuidanceStore((s) => s.skipTutorial);
  const finishTutorial = useGuidanceStore((s) => s.finishTutorial);

  const { language, t } = useLanguage();
  const [targetRect, setTargetRect] = useState<ElementRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const steps = activeTutorial ? getTutorialSteps(activeTutorial, language) : [];
  const currentStep = steps[tutorialStepIndex] || null;
  const totalSteps = steps.length;
  const isLastStep = tutorialStepIndex === totalSteps - 1;

  // Locate target DOM element and measure rect
  const updateTargetRect = useCallback(() => {
    if (!currentStep) {
      setTargetRect(null);
      return;
    }

    const el = document.querySelector(currentStep.targetSelector) as HTMLElement | null;
    if (el) {
      // Ensure element is visible in view
      try {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      } catch {
        // ignore scroll error
      }

      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          right: rect.right,
          bottom: rect.bottom,
        });
        return;
      }
    }

    setTargetRect(null);
  }, [currentStep]);

  useEffect(() => {
    if (!activeTutorial || !currentStep) return;

    // Small delay to allow any tab transitions to settle
    const timer = setTimeout(updateTargetRect, 80);

    const handleScrollOrResize = () => {
      updateTargetRect();
    };

    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('scroll', handleScrollOrResize, { passive: true, capture: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [activeTutorial, currentStep, tutorialStepIndex, updateTargetRect]);

  // Global Keyboard shortcuts: ArrowRight / Enter -> Next, ArrowLeft -> Prev, Escape -> Skip
  useEffect(() => {
    if (!activeTutorial) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowRight' || (e.key === 'Enter' && !e.shiftKey)) {
        e.preventDefault();
        if (isLastStep) {
          finishTutorial();
        } else {
          nextTutorialStep(totalSteps);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevTutorialStep();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        skipTutorial();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTutorial, isLastStep, totalSteps, nextTutorialStep, prevTutorialStep, finishTutorial, skipTutorial]);

  if (!activeTutorial || !currentStep) return null;

  // Determine section icon
  const getSectionIcon = () => {
    switch (activeTutorial) {
      case 'planner':
        return <Building2 className="w-3.5 h-3.5 text-amber-400" />;
      case 'manual':
        return <MousePointer className="w-3.5 h-3.5 text-purple-400" />;
      case 'analytics':
        return <BarChart3 className="w-3.5 h-3.5 text-sky-400" />;
      case 'advisor':
        return <Sparkles className="w-3.5 h-3.5 text-indigo-400" />;
      case 'rationale':
        return <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  // Compute tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    const cardWidth = 360;
    const cardMargin = 16;
    const padding = 12;

    if (!targetRect) {
      // Floating center fallback
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: cardWidth,
        maxWidth: 'calc(100vw - 32px)',
        zIndex: 50,
      };
    }

    const preferred = currentStep.position || 'bottom';
    let top = 0;
    let left = 0;

    if (preferred === 'left') {
      left = targetRect.left - cardWidth - cardMargin;
      top = targetRect.top + targetRect.height / 2 - 100;
      // If overflowing left edge of window, flip to right or bottom
      if (left < padding) {
        left = targetRect.right + cardMargin;
      }
    } else if (preferred === 'right') {
      left = targetRect.right + cardMargin;
      top = targetRect.top + targetRect.height / 2 - 100;
      // If overflowing right edge, flip to left
      if (left + cardWidth > window.innerWidth - padding) {
        left = targetRect.left - cardWidth - cardMargin;
      }
    } else if (preferred === 'top') {
      left = targetRect.left + (targetRect.width - cardWidth) / 2;
      top = targetRect.top - 200 - cardMargin;
    } else {
      // bottom
      left = targetRect.left + (targetRect.width - cardWidth) / 2;
      top = targetRect.bottom + cardMargin;
    }

    // Viewport edge clamping
    left = Math.max(padding, Math.min(left, window.innerWidth - cardWidth - padding));
    top = Math.max(padding, Math.min(top, window.innerHeight - 260 - padding));

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: cardWidth,
      maxWidth: 'calc(100vw - 32px)',
      zIndex: 50,
    };
  };

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      {/* Dark backdrop overlay */}
      <div className="absolute inset-0 bg-slate-950/40 transition-opacity duration-300 pointer-events-none" />

      {/* Spotlight cutout around the target element */}
      {targetRect && (
        <div
          id="spotlight-cutout"
          style={{
            position: 'fixed',
            top: `${Math.max(0, targetRect.top - 6)}px`,
            left: `${Math.max(0, targetRect.left - 6)}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
            borderRadius: '14px',
            boxShadow: '0 0 0 9999px rgba(2, 6, 23, 0.65), 0 0 24px rgba(168, 85, 247, 0.5)',
            border: '2px solid rgba(168, 85, 247, 0.85)',
            pointerEvents: 'none',
            zIndex: 45,
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="animate-pulse-subtle"
        />
      )}

      {/* Floating Tutorial Card */}
      <div
        ref={cardRef}
        id="spotlight-tutorial-card"
        data-testid="spotlight-tutorial"
        style={getTooltipStyle()}
        className="pointer-events-auto glass-panel bg-slate-900/95 border border-purple-500/40 rounded-2xl p-4 shadow-2xl shadow-purple-950/40 backdrop-blur-xl flex flex-col gap-3 animate-fade-in"
      >
        {/* Header Row: Badge, Step counter, Close */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100">
            {getSectionIcon()}
            <span id="spotlight-step-badge">{currentStep.badge}</span>
            <span id="spotlight-step-counter" className="text-[11px] font-mono text-purple-300 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 ml-1">
              {t.tourUI?.stepOf || 'Step'} {tutorialStepIndex + 1}/{totalSteps}
            </span>
          </div>

          <button
            id="spotlight-close-btn"
            onClick={skipTutorial}
            className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title={t.tourUI?.skip || 'Skip Tour'}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step Title & Explanation */}
        <div className="space-y-1.5">
          <h4 id="spotlight-step-title" className="text-sm font-bold text-white tracking-tight">
            {currentStep.title}
          </h4>
          <p id="spotlight-step-content" className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
            {currentStep.content}
          </p>
        </div>

        {/* Navigation Actions Row */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <button
            id="spotlight-skip-btn"
            onClick={skipTutorial}
            className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors px-1.5 py-1"
          >
            {t.tourUI?.skip || 'Skip'}
          </button>

          <div className="flex items-center gap-1.5">
            <button
              id="spotlight-back-btn"
              onClick={prevTutorialStep}
              disabled={tutorialStepIndex === 0}
              className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white flex items-center gap-1 transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>{t.tourUI?.back || 'Back'}</span>
            </button>

            {isLastStep ? (
              <button
                id="spotlight-finish-btn"
                onClick={finishTutorial}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t.tourUI?.finish || 'Finish'}</span>
              </button>
            ) : (
              <button
                id="spotlight-next-btn"
                onClick={() => nextTutorialStep(totalSteps)}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-500/20 active:scale-95"
              >
                <span>{t.tourUI?.next || 'Next'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
