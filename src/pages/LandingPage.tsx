import { useState } from 'react';
import { useRouter } from '../router/Router';
import { useLanguage } from '../i18n/useLanguage';
import {
  Sun,
  Sparkles,
  ArrowRight,
  Play,
  Layers,
  ShieldCheck,
  Zap,
  BarChart3,
  Compass,
  Cpu,
  CheckCircle2,
  ExternalLink,
  Menu,
  X,
  Database,
  Scale,
} from 'lucide-react';

export function LandingPage() {
  const { navigate } = useRouter();
  const { language, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLaunchApp = (demoTour = false) => {
    navigate(demoTour ? '/app?tour=true' : '/app');
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden">
      {/* Background Ambient Glow Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-amber-500/10 via-emerald-500/5 to-transparent blur-3xl rounded-full opacity-60" />
        <div className="absolute top-1/3 -left-60 w-[600px] h-[600px] bg-emerald-600/5 blur-3xl rounded-full opacity-40" />
        <div className="absolute top-2/3 -right-60 w-[600px] h-[600px] bg-amber-600/5 blur-3xl rounded-full opacity-40" />
      </div>

      {/* ========================================================================= */}
      {/* A. NAVIGATION */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 backdrop-blur-xl bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                Roof<span className="text-amber-400">Ray</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                v3.0 AI
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-amber-400 transition-colors">
              {t.nav.home}
            </button>
            <button onClick={() => scrollToSection('features')} className="hover:text-amber-400 transition-colors">
              {t.nav.features}
            </button>
            <button onClick={() => scrollToSection('workflow')} className="hover:text-amber-400 transition-colors">
              {t.nav.howItWorks}
            </button>
            <button onClick={() => scrollToSection('ai-tech')} className="hover:text-amber-400 transition-colors">
              {t.nav.aiTech}
            </button>
            <button onClick={() => scrollToSection('impact')} className="hover:text-amber-400 transition-colors">
              {t.nav.impact}
            </button>
            <a href="https://github.com/jawaid687/RoofRay" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors flex items-center gap-1">
              <span>{t.nav.docs}</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </nav>

          {/* Language Switcher & Launch App Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-600 transition-all"
              title="Toggle English / বাংলা"
            >
              {language === 'en' ? 'বাংলা' : 'English'}
            </button>

            <button
              onClick={() => handleLaunchApp()}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 transition-all active:scale-95"
            >
              <span>{t.nav.launchApp}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950/95 px-4 pt-3 pb-5 space-y-3">
            <button onClick={() => { scrollToSection('features'); }} className="block w-full text-left py-2 text-sm text-slate-300 hover:text-amber-400">
              {t.nav.features}
            </button>
            <button onClick={() => { scrollToSection('workflow'); }} className="block w-full text-left py-2 text-sm text-slate-300 hover:text-amber-400">
              {t.nav.howItWorks}
            </button>
            <button onClick={() => { scrollToSection('ai-tech'); }} className="block w-full text-left py-2 text-sm text-slate-300 hover:text-amber-400">
              {t.nav.aiTech}
            </button>
            <button onClick={() => { scrollToSection('impact'); }} className="block w-full text-left py-2 text-sm text-slate-300 hover:text-amber-400">
              {t.nav.impact}
            </button>
            <button
              onClick={() => handleLaunchApp()}
              className="w-full py-2.5 rounded-xl text-center text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 transition-colors"
            >
              {t.nav.launchApp}
            </button>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* B. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative z-10 pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Competition Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 shadow-sm shadow-slate-950/50">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-semibold text-slate-300 tracking-wide">
              {t.hero.badge}
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            {language === 'bn' ? (
              <span>{t.hero.headline}</span>
            ) : (
              <>
                Turn Every Rooftop Into a <span className="bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-400 bg-clip-text text-transparent">Smarter Solar Opportunity.</span>
              </>
            )}
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t.hero.subheadline}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handleLaunchApp(false)}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Sun className="w-4 h-4 fill-slate-950" />
              <span>{t.hero.ctaPrimary}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleLaunchApp(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-sm font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-slate-950/40"
            >
              <Play className="w-4 h-4 fill-current text-amber-400" />
              <span>{t.hero.ctaSecondary}</span>
            </button>
          </div>

          {/* Quick Metrics Ticker */}
          <div className="pt-8 grid grid-cols-3 gap-2 sm:gap-4 max-w-xl mx-auto border-t border-slate-800/80">
            <div className="p-2 sm:p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <div className="text-xs sm:text-sm font-bold text-amber-400 font-mono">{t.hero.stat1Value}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{t.hero.stat1Label}</div>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <div className="text-xs sm:text-sm font-bold text-emerald-400 font-mono">{t.hero.stat2Value}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{t.hero.stat2Label}</div>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <div className="text-xs sm:text-sm font-bold text-sky-400 font-mono">{t.hero.stat3Value}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{t.hero.stat3Label}</div>
            </div>
          </div>
        </div>

        {/* Hero Visual Preview Container */}
        <div className="mt-12 relative max-w-5xl mx-auto rounded-3xl p-2 bg-gradient-to-b from-slate-800/80 via-slate-900/40 to-slate-950 border border-slate-700/60 shadow-2xl overflow-hidden group">
          <div className="relative rounded-2xl bg-slate-950 overflow-hidden aspect-[16/9] border border-slate-800/80 flex items-center justify-center">
            {/* Visual simulation graphics */}
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/90 to-indigo-950/40 opacity-90" />
            
            {/* Simulated 3D Rooftop Grid & Isometric Wireframe Graphic */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10">
                <Sun className="w-8 h-8 animate-pulse" />
              </div>

              <div className="space-y-1.5 max-w-md">
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  {t.hero.simulatedEphemerisBadge}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {t.hero.heroEngineTitle}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t.hero.heroEngineDesc}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => handleLaunchApp(false)}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/25"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t.hero.launchStudio}</span>
                </button>
                <button
                  onClick={() => handleLaunchApp(true)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium transition-all"
                >
                  {t.hero.startTour}
                </button>
              </div>
            </div>

            {/* Simulated Corner Badges */}
            <div className="absolute top-4 left-4 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[10px] font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{t.hero.diurnalBadge}</span>
            </div>

            <div className="absolute bottom-4 right-4 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[10px] font-mono text-slate-300">
              <Scale className="w-3.5 h-3.5 text-sky-400" />
              <span>{t.hero.netMeteringBadge}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* C. PROBLEM AND SOLUTION */}
      {/* ========================================================================= */}
      <section className="py-20 bg-slate-900/40 border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              {t.problemSolution.badge}
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              {t.problemSolution.title}
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t.problemSolution.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider">{t.problemSolution.problemBadge || 'Problem'} 01</span>
                <h3 className="text-base font-bold text-white">{t.problemSolution.p1Title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{t.problemSolution.p1Desc}</p>
              </div>
              <div className="pt-3 border-t border-slate-800/80 space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.problemSolution.solutionBadge || 'RoofRay Solution'}</span>
                </span>
                <h4 className="text-sm font-semibold text-slate-200">{t.problemSolution.s1Title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{t.problemSolution.s1Desc}</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider">{t.problemSolution.problemBadge || 'Problem'} 02</span>
                <h3 className="text-base font-bold text-white">{t.problemSolution.p2Title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{t.problemSolution.p2Desc}</p>
              </div>
              <div className="pt-3 border-t border-slate-800/80 space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.problemSolution.solutionBadge || 'RoofRay Solution'}</span>
                </span>
                <h4 className="text-sm font-semibold text-slate-200">{t.problemSolution.s2Title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{t.problemSolution.s2Desc}</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider">{t.problemSolution.problemBadge || 'Problem'} 03</span>
                <h3 className="text-base font-bold text-white">{t.problemSolution.p3Title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{t.problemSolution.p3Desc}</p>
              </div>
              <div className="pt-3 border-t border-slate-800/80 space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.problemSolution.solutionBadge || 'RoofRay Solution'}</span>
                </span>
                <h4 className="text-sm font-semibold text-slate-200">{t.problemSolution.s3Title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{t.problemSolution.s3Desc}</p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider">{t.problemSolution.problemBadge || 'Problem'} 04</span>
                <h3 className="text-base font-bold text-white">{t.problemSolution.p4Title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{t.problemSolution.p4Desc}</p>
              </div>
              <div className="pt-3 border-t border-slate-800/80 space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.problemSolution.solutionBadge || 'RoofRay Solution'}</span>
                </span>
                <h4 className="text-sm font-semibold text-slate-200">{t.problemSolution.s4Title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{t.problemSolution.s4Desc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* D. FEATURE SHOWCASE */}
      {/* ========================================================================= */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            {t.features.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t.features.title}
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            {t.features.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900/80 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">{t.features.f1Title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.features.f1Desc}</p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-sky-500/40 hover:bg-slate-900/80 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
              <Sun className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">{t.features.f2Title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.features.f2Desc}</p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900/80 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">{t.features.f3Title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.features.f3Desc}</p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-purple-500/40 hover:bg-slate-900/80 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">{t.features.f4Title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.features.f4Desc}</p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-yellow-500/40 hover:bg-slate-900/80 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">{t.features.f5Title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.features.f5Desc}</p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900/80 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">{t.features.f6Title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.features.f6Desc}</p>
          </div>

          {/* Feature 7 (Spans full row on large screens) */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-purple-950/40 border border-indigo-800/50 hover:border-indigo-500/60 transition-all space-y-3 md:col-span-2 lg:col-span-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{t.features.f7Title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                AI + RAG GROUNDING
              </span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              {t.features.f7Desc}
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* E. HOW IT WORKS */}
      {/* ========================================================================= */}
      <section id="workflow" className="py-20 bg-slate-900/30 border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              {t.workflow.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {t.workflow.title}
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t.workflow.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800 space-y-3 relative">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-bold text-xs font-mono flex items-center justify-center">
                01
              </div>
              <h3 className="text-sm font-bold text-white">{t.workflow.step1Title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t.workflow.step1Desc}</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800 space-y-3 relative">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 font-bold text-xs font-mono flex items-center justify-center">
                02
              </div>
              <h3 className="text-sm font-bold text-white">{t.workflow.step2Title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t.workflow.step2Desc}</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800 space-y-3 relative">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs font-mono flex items-center justify-center">
                03
              </div>
              <h3 className="text-sm font-bold text-white">{t.workflow.step3Title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t.workflow.step3Desc}</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800 space-y-3 relative">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 font-bold text-xs font-mono flex items-center justify-center">
                04
              </div>
              <h3 className="text-sm font-bold text-white">{t.workflow.step4Title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t.workflow.step4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* F. AI TECHNOLOGY SECTION */}
      {/* ========================================================================= */}
      <section id="ai-tech" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
            {t.aiTech.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t.aiTech.title}
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            {t.aiTech.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">{t.aiTech.groundingTitle}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.aiTech.groundingDesc}</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">{t.aiTech.ragTitle}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.aiTech.ragDesc}</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">{t.aiTech.deterministicTitle}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.aiTech.deterministicDesc}</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Scale className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">{t.aiTech.noHallucinationTitle}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.aiTech.noHallucinationDesc}</p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* G. BANGLADESH AND GLOBAL IMPACT */}
      {/* ========================================================================= */}
      <section id="impact" className="py-20 bg-slate-900/40 border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              {t.impact.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {t.impact.title}
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t.impact.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="text-emerald-400 font-bold text-sm">{t.impact.bdTitle}</div>
              <p className="text-slate-400 leading-relaxed">{t.impact.bdDesc}</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="text-sky-400 font-bold text-sm">{t.impact.globalTitle}</div>
              <p className="text-slate-400 leading-relaxed">{t.impact.globalDesc}</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="text-amber-400 font-bold text-sm">{t.impact.netMeteringTitle}</div>
              <p className="text-slate-400 leading-relaxed">{t.impact.netMeteringDesc}</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="text-emerald-400 font-bold text-sm">{t.impact.co2Title}</div>
              <p className="text-slate-400 leading-relaxed">{t.impact.co2Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* H. FINAL CTA */}
      {/* ========================================================================= */}
      <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="p-10 md:p-14 rounded-3xl bg-gradient-to-tr from-amber-950/30 via-slate-900 to-emerald-950/30 border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/20">
            <Sun className="w-7 h-7" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {t.cta.headline}
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t.cta.description}
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => handleLaunchApp(false)}
              className="px-8 py-4 rounded-2xl text-base font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 active:scale-95"
            >
              <span>{t.cta.button}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* I. FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 text-xs text-slate-500 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Sun className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white">RoofRay</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <button onClick={() => scrollToSection('features')} className="hover:text-amber-400 transition-colors">{t.footer.footerFeatures}</button>
              <button onClick={() => scrollToSection('workflow')} className="hover:text-amber-400 transition-colors">{t.footer.footerWorkflow}</button>
              <button onClick={() => scrollToSection('ai-tech')} className="hover:text-amber-400 transition-colors">{t.footer.footerAiTech}</button>
              <a href="https://github.com/jawaid687/RoofRay" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">{t.footer.footerGithub}</a>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-[11px] leading-relaxed text-slate-400">
            <strong>Engineering Disclaimer:</strong> {t.footer.disclaimer}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/60 pt-6 text-[11px]">
            <span>© 2026 {t.footer.copyright}</span>
            <span>{t.footer.targetTrack}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
