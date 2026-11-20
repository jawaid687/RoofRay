import { useState, useMemo, useEffect } from 'react';
import { useRouter } from '../router/Router';
import { useLanguage } from '../i18n/useLanguage';
import { RoofRayLogo } from '../components/ui/RoofRayLogo';
import { calculateSunPosition } from '../simulation/sunPosition';
import { INITIAL_BUILDINGS } from '../data/buildings';
import {
  Sun,
  ArrowRight,
  Play,
  Pause,
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
  Sliders,
} from 'lucide-react';

// Isometric projection helper from 3D space to 2D SVG coordinates
// North: -Z, South: +Z, East: +X, West: -X, Up: +Y
function projectIso(
  x: number,
  y: number,
  z: number,
  cx = 220,
  cy = 155,
  kx = 6.8,
  kz = 3.8,
  ky = 4.8
): [number, number] {
  const u = cx + (x - z) * kx;
  const v = cy + (x + z) * kz - y * ky;
  return [Math.round(u * 10) / 10, Math.round(v * 10) / 10];
}

// 2D Convex Hull (Monotone Chain) for guaranteed attached, non-shearing shadows
function convexHull(points: [number, number][]): [number, number][] {
  const pts = points.slice().sort((a, b) => (a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]));
  const cross = (o: [number, number], a: [number, number], b: [number, number]) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

  const lower: [number, number][] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }
  const upper: [number, number][] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

export function LandingPage() {
  const { navigate } = useRouter();
  const { language, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Interactive CAD Hero Preview States
  const [heroMode, setHeroMode] = useState<'raycast' | 'annual' | 'pv'>('raycast');
  const [heroHour, setHeroHour] = useState<number>(12.5); // 12:30 PM
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Auto-play sun diurnal animation loop
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setHeroHour((prev) => {
        const next = Math.round((prev + 0.1) * 10) / 10;
        return next > 18.8 ? 6.2 : next;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [isPlaying]);

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

  // Model reference: Apex Lofts (15m x 18m, height 10m)
  const apexBuilding = INITIAL_BUILDINGS[0];

  // Authentic NOAA astronomical sun ephemeris for San Francisco (Summer Solstice, June 21)
  const sunState = useMemo(() => {
    return calculateSunPosition({
      latitude: 37.7749,
      longitude: -122.4194,
      date: { year: 2026, month: 6, day: 21 },
      time: heroHour,
      timezone: 'America/Los_Angeles',
    });
  }, [heroHour]);

  // Discrete Roof Grid Cells (270 discrete 1.0m analysis cells: 15 cols x 18 rows)
  const gridCells = useMemo(() => {
    const cells: { x: number; z: number; iso: [number, number]; annualScore: number }[] = [];
    for (let x = -6.5; x <= 6.5; x += 1.0) {
      for (let z = -8.0; z <= 8.0; z += 1.0) {
        let annual = 0.96;
        for (const obs of apexBuilding.roofObstacles) {
          const dx = x - obs.relX;
          const dz = z - obs.relZ;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (z < obs.relZ && Math.abs(dx) < obs.width / 2 + 1.2 && dist < obs.height * 2.2) {
            annual = Math.min(annual, 0.62 + (dist / (obs.height * 2.2)) * 0.28);
          }
        }
        cells.push({ x, z, iso: projectIso(x, 0, z), annualScore: annual });
      }
    }
    return cells;
  }, [apexBuilding]);

  // Live raycasted cell exposure calculation
  const { unshadedCount, totalCells, exposurePct } = useMemo(() => {
    const [vx, vy, vz] = sunState.vectorToSun;
    if (vy <= 0.05) {
      return { unshadedCount: 0, totalCells: gridCells.length, exposurePct: '0.0' };
    }
    let unshaded = 0;
    for (const cell of gridCells) {
      let shaded = false;
      for (const obs of apexBuilding.roofObstacles) {
        const hw = obs.width / 2;
        const hl = obs.length / 2;
        const xMin = obs.relX - hw;
        const xMax = obs.relX + hw;
        const zMin = obs.relZ - hl;
        const zMax = obs.relZ + hl;
        if (cell.x >= xMin && cell.x <= xMax && cell.z >= zMin && cell.z <= zMax) {
          shaded = true;
          break;
        }
        const sx = vx / vy;
        const sz = vz / vy;
        const yMinX = sx === 0 ? (cell.x >= xMin && cell.x <= xMax ? 0 : Infinity) : Math.min((xMin - cell.x) / sx, (xMax - cell.x) / sx);
        const yMaxX = sx === 0 ? (cell.x >= xMin && cell.x <= xMax ? Infinity : -Infinity) : Math.max((xMin - cell.x) / sx, (xMax - cell.x) / sx);
        const yMinZ = sz === 0 ? (cell.z >= zMin && cell.z <= zMax ? 0 : Infinity) : Math.min((zMin - cell.z) / sz, (zMax - cell.z) / sz);
        const yMaxZ = sz === 0 ? (cell.z >= zMin && cell.z <= zMax ? Infinity : -Infinity) : Math.max((zMin - cell.z) / sz, (zMax - cell.z) / sz);
        const yEnter = Math.max(0, yMinX, yMinZ);
        const yExit = Math.min(obs.height, yMaxX, yMaxZ);
        if (yEnter < yExit) {
          shaded = true;
          break;
        }
      }
      if (!shaded) unshaded++;
    }
    return {
      unshadedCount: unshaded,
      totalCells: gridCells.length,
      exposurePct: ((unshaded / gridCells.length) * 100).toFixed(1),
    };
  }, [sunState, gridCells, apexBuilding]);

  // Pre-calculated PV array (55 modules arranged in uniform rows avoiding obstacles)
  const pvModules = useMemo(() => {
    const pW = 1.0;
    const pL = 1.65;
    const modules: { points: string }[] = [];
    for (let z = -7.5; z <= 7.5; z += 2.05) {
      for (let x = -6.2; x <= 6.2; x += 1.35) {
        let collides = false;
        for (const obs of apexBuilding.roofObstacles) {
          const hw = obs.width / 2 + 0.5;
          const hl = obs.length / 2 + 0.5;
          if (
            x + pW / 2 >= obs.relX - hw &&
            x - pW / 2 <= obs.relX + hw &&
            z + pL / 2 >= obs.relZ - hl &&
            z - pL / 2 <= obs.relZ + hl
          ) {
            collides = true;
            break;
          }
        }
        if (!collides) {
          const hw = pW / 2;
          const hl = pL / 2;
          const p0 = projectIso(x - hw, 0.08, z - hl);
          const p1 = projectIso(x + hw, 0.08, z - hl);
          const p2 = projectIso(x + hw, 0.08, z + hl);
          const p3 = projectIso(x - hw, 0.08, z + hl);
          modules.push({
            points: `${p0[0]},${p0[1]} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]}`,
          });
        }
      }
    }
    return modules.slice(0, 55);
  }, [apexBuilding]);

  // Dynamic 3D Obstacle geometries and non-shearing Convex Hull Shadows
  const obstacleVisuals = useMemo(() => {
    const [vx, vy, vz] = sunState.vectorToSun;
    const isSunUp = vy > 0.04;
    return apexBuilding.roofObstacles.map((obs) => {
      const hw = obs.width / 2;
      const hl = obs.length / 2;
      const x1 = obs.relX - hw;
      const x2 = obs.relX + hw;
      const z1 = obs.relZ - hl;
      const z2 = obs.relZ + hl;
      const h = obs.height;

      // Base corners (Y = 0)
      const b0 = projectIso(x1, 0, z1); // NW
      const b1 = projectIso(x2, 0, z1); // NE
      const b2 = projectIso(x2, 0, z2); // SE
      const b3 = projectIso(x1, 0, z2); // SW

      // Top corners (Y = h)
      const t0 = projectIso(x1, h, z1);
      const t1 = projectIso(x2, h, z1);
      const t2 = projectIso(x2, h, z2);
      const t3 = projectIso(x1, h, z2);

      let shadowPoints = '';
      if (isSunUp) {
        const t = Math.min(10, h / vy);
        const dx = -t * vx;
        const dz = -t * vz;
        const s0 = projectIso(x1 + dx, 0, z1 + dz);
        const s1 = projectIso(x2 + dx, 0, z1 + dz);
        const s2 = projectIso(x2 + dx, 0, z2 + dz);
        const s3 = projectIso(x1 + dx, 0, z2 + dz);
        const hull = convexHull([b0, b1, b2, b3, s0, s1, s2, s3]);
        shadowPoints = hull.map((p) => `${p[0]},${p[1]}`).join(' ');
      }

      return {
        id: obs.id,
        name: obs.name,
        type: obs.type,
        southFace: `${b3[0]},${b3[1]} ${b2[0]},${b2[1]} ${t2[0]},${t2[1]} ${t3[0]},${t3[1]}`,
        eastFace: `${b2[0]},${b2[1]} ${b1[0]},${b1[1]} ${t1[0]},${t1[1]} ${t2[0]},${t2[1]}`,
        topFace: `${t0[0]},${t0[1]} ${t1[0]},${t1[1]} ${t2[0]},${t2[1]} ${t3[0]},${t3[1]}`,
        shadowPoints,
      };
    });
  }, [sunState, apexBuilding]);

  // Projected building structure vertices
  const buildingGeometry = useMemo(() => {
    // 15m x 18m roof
    const nwRoof = projectIso(-7.5, 0, -9.0);
    const neRoof = projectIso(7.5, 0, -9.0);
    const seRoof = projectIso(7.5, 0, 9.0);
    const swRoof = projectIso(-7.5, 0, 9.0);

    // Setback line (0.5m setback)
    const nwSetback = projectIso(-7.0, 0, -8.5);
    const neSetback = projectIso(7.0, 0, -8.5);
    const seSetback = projectIso(7.0, 0, 8.5);
    const swSetback = projectIso(-7.0, 0, 8.5);

    // Ground corners (Y = -7.5 for realistic architectural extrusion)
    const swGround = projectIso(-7.5, -7.5, 9.0);
    const seGround = projectIso(7.5, -7.5, 9.0);
    const neGround = projectIso(7.5, -7.5, -9.0);

    // Ground plane drop shadow
    const groundShadow = [
      projectIso(-8.5, -7.5, -10.0),
      projectIso(8.5, -7.5, -10.0),
      projectIso(8.5, -7.5, 10.0),
      projectIso(-8.5, -7.5, 10.0),
    ];

    return {
      roofPolygon: `${nwRoof[0]},${nwRoof[1]} ${neRoof[0]},${neRoof[1]} ${seRoof[0]},${seRoof[1]} ${swRoof[0]},${swRoof[1]}`,
      setbackPolygon: `${nwSetback[0]},${nwSetback[1]} ${neSetback[0]},${neSetback[1]} ${seSetback[0]},${seSetback[1]} ${swSetback[0]},${swSetback[1]}`,
      southWall: `${swRoof[0]},${swRoof[1]} ${seRoof[0]},${seRoof[1]} ${seGround[0]},${seGround[1]} ${swGround[0]},${swGround[1]}`,
      eastWall: `${seRoof[0]},${seRoof[1]} ${neRoof[0]},${neRoof[1]} ${neGround[0]},${neGround[1]} ${seGround[0]},${seGround[1]}`,
      groundShadow: groundShadow.map((p) => `${p[0]},${p[1]}`).join(' '),
      roofCenter: projectIso(0, 0, 0),
      northMarker: projectIso(0, 0, -9.8),
    };
  }, []);

  const [vx, vy, vz] = sunState.vectorToSun;
  const sunSvgX = 220 + vx * 175 - vz * 32;
  const sunSvgY = Math.max(16, 75 - vy * 58 + vz * 16);
  const isDaylight = vy > 0.04;

  return (
    <div className="min-h-screen bg-[#080c15] text-slate-100 font-sans selection:bg-amber-500/20 selection:text-amber-200 overflow-x-hidden">
      {/* Subtle CAD Grid Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 cad-grid-bg opacity-40" />

      {/* ========================================================================= */}
      {/* A. NAVIGATION */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-[#080c15]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <RoofRayLogo size={32} />
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white font-sans flex items-center gap-1.5">
                RoofRay
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-amber-400 transition-colors"
            >
              {t.nav.home}
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-amber-400 transition-colors"
            >
              {t.nav.features}
            </button>
            <button
              onClick={() => scrollToSection('workflow')}
              className="hover:text-amber-400 transition-colors"
            >
              {t.nav.howItWorks}
            </button>
            <button
              onClick={() => scrollToSection('ai-tech')}
              className="hover:text-amber-400 transition-colors"
            >
              {t.nav.aiTech}
            </button>
            <button
              onClick={() => scrollToSection('impact')}
              className="hover:text-amber-400 transition-colors"
            >
              {t.nav.impact}
            </button>
            <a
              href="https://github.com/jawaid687/RoofRay"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-400 transition-colors flex items-center gap-1 text-slate-400 hover:text-slate-200"
            >
              <span>{t.nav.docs}</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </nav>

          {/* Language Switcher & Launch App Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-600 transition-all"
              title="Toggle English / বাংলা"
            >
              {language === 'en' ? 'বাংলা' : 'English'}
            </button>

            <button
              onClick={() => handleLaunchApp()}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-sm active:scale-95"
            >
              <span>{t.nav.launchApp}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-[#080c15] px-4 pt-3 pb-5 space-y-3">
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left py-2 text-sm text-slate-300 hover:text-amber-400"
            >
              {t.nav.features}
            </button>
            <button
              onClick={() => scrollToSection('workflow')}
              className="block w-full text-left py-2 text-sm text-slate-300 hover:text-amber-400"
            >
              {t.nav.howItWorks}
            </button>
            <button
              onClick={() => scrollToSection('ai-tech')}
              className="block w-full text-left py-2 text-sm text-slate-300 hover:text-amber-400"
            >
              {t.nav.aiTech}
            </button>
            <button
              onClick={() => scrollToSection('impact')}
              className="block w-full text-left py-2 text-sm text-slate-300 hover:text-amber-400"
            >
              {t.nav.impact}
            </button>
            <button
              onClick={() => handleLaunchApp()}
              className="w-full py-2.5 rounded-xl text-center text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors"
            >
              {t.nav.launchApp}
            </button>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* B. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative z-10 pt-14 pb-20 md:pt-20 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-5">
          {/* Competition Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="font-medium">{t.hero.badge}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
            {language === 'bn' ? (
              <span>{t.hero.headline}</span>
            ) : (
              <>
                Turn Every Rooftop Into a{' '}
                <span className="text-amber-400 font-black">Smarter Solar Opportunity.</span>
              </>
            )}
          </h1>

          {/* Subheadline */}
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t.hero.subheadline}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              onClick={() => handleLaunchApp(false)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
            >
              <Sun className="w-4 h-4 fill-slate-950" />
              <span>{t.hero.ctaPrimary}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleLaunchApp(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span>{t.hero.ctaSecondary}</span>
            </button>
          </div>

          {/* Precision Metrics Strip */}
          <div className="pt-6 grid grid-cols-3 gap-2 sm:gap-4 max-w-xl mx-auto border-t border-slate-800">
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <div className="text-xs sm:text-sm font-bold text-amber-400 font-mono">
                {t.hero.stat1Value}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{t.hero.stat1Label}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <div className="text-xs sm:text-sm font-bold text-emerald-400 font-mono">
                {t.hero.stat2Value}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{t.hero.stat2Label}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
              <div className="text-xs sm:text-sm font-bold text-sky-400 font-mono">
                {t.hero.stat3Value}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{t.hero.stat3Label}</div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE 3D SOLAR DIGITAL TWIN HERO PREVIEW */}
        {/* ========================================================================= */}
        <div className="mt-12 max-w-5xl mx-auto rounded-2xl bg-[#0b1120] border border-slate-800 shadow-2xl overflow-hidden">
          {/* Studio Header Bar */}
          <div className="px-4 py-3 bg-[#0e1628] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white font-mono text-[11px]">Apex Lofts (15m × 18m)</span>
              </div>
              <span className="text-slate-500 hidden sm:inline">|</span>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                Lat: 37.7749°N • Lon: 122.4194°W • San Francisco
              </span>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-900/80 rounded-lg p-0.5 border border-slate-800 text-[11px]">
              <button
                onClick={() => setHeroMode('raycast')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  heroMode === 'raycast'
                    ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Live Raycast
              </button>
              <button
                onClick={() => setHeroMode('annual')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  heroMode === 'annual'
                    ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Annual Insolation
              </button>
              <button
                onClick={() => setHeroMode('pv')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  heroMode === 'pv'
                    ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                PV Array (55 Mods)
              </button>
            </div>
          </div>

          {/* Interactive Rooftop Simulation Canvas View */}
          <div className="relative aspect-[16/9] bg-[#070b14] overflow-hidden flex items-center justify-center p-4 sm:p-6 cad-grid-dense">
            {/* Background Sky Grid Horizon */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0c1527]/70 via-transparent to-[#070b14] pointer-events-none" />

            {/* Simulated Celestial Sun Telemetry Pill */}
            <div className="absolute top-4 right-4 sm:right-6 z-20 flex items-center gap-2 bg-[#0d1628]/95 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300 shadow-lg">
              <Sun className={`w-3.5 h-3.5 ${isDaylight ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>
                {Math.floor(heroHour)}:{String(Math.floor((heroHour % 1) * 60)).padStart(2, '0')} {heroHour >= 12 ? 'PM' : 'AM'}
              </span>
              <span className="text-amber-400 font-semibold">({sunState.elevationDeg.toFixed(1)}° Alt)</span>
              <span className="text-slate-400 hidden sm:inline">({sunState.azimuthDeg.toFixed(0)}° Az)</span>
            </div>

            {/* True North Orientation Marker in Viewport */}
            <div className="absolute top-4 left-4 z-20 hidden sm:flex items-center gap-1.5 bg-[#0d1628]/90 border border-slate-800 rounded-md px-2 py-1 text-[10px] font-mono text-slate-400">
              <Compass className="w-3 h-3 text-sky-400" />
              <span>True North (-Z)</span>
            </div>

            {/* 3D Isometric Rooftop Simulation Graphic */}
            <div className="relative z-10 w-full max-w-xl aspect-[4/3] flex items-center justify-center">
              <svg viewBox="0 0 440 320" className="w-full h-full drop-shadow-2xl" fill="none">
                <defs>
                  {/* Clip path containing shadows strictly on the rooftop surface */}
                  <clipPath id="hero-roof-clip">
                    <polygon points={buildingGeometry.roofPolygon} />
                  </clipPath>

                  {/* Sun Glow Gradient */}
                  <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
                    <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </radialGradient>

                  {/* Annual Insolation Gradient */}
                  <linearGradient id="hero-annual-heatmap" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0284c7" />
                    <stop offset="35%" stopColor="#10b981" />
                    <stop offset="70%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fef08a" />
                  </linearGradient>
                </defs>

                {/* Sky Dome Sun Trajectory Arc */}
                <path
                  d="M70,70 Q220,10 370,70"
                  stroke="#1e293b"
                  strokeWidth="1.2"
                  strokeDasharray="3,3"
                />

                {/* Sun Ray Line & Celestial Sun Orb in Sky */}
                {isDaylight && (
                  <>
                    <line
                      x1={sunSvgX}
                      y1={sunSvgY}
                      x2={buildingGeometry.roofCenter[0]}
                      y2={buildingGeometry.roofCenter[1]}
                      stroke="#f59e0b"
                      strokeWidth="0.75"
                      strokeDasharray="2,3"
                      strokeOpacity="0.4"
                    />
                    <circle cx={sunSvgX} cy={sunSvgY} r="18" fill="url(#sun-glow)" />
                    <circle cx={sunSvgX} cy={sunSvgY} r="5" fill="#fef08a" />
                  </>
                )}

                {/* Ground plane shadow footprint */}
                <polygon
                  points={buildingGeometry.groundShadow}
                  fill="#030712"
                  fillOpacity="0.65"
                />

                {/* Building Extrusion Walls (South and East Facades) */}
                <polygon
                  points={buildingGeometry.southWall}
                  fill="#152238"
                  stroke="#1e293b"
                  strokeWidth="1.2"
                />
                <polygon
                  points={buildingGeometry.eastWall}
                  fill="#0f192b"
                  stroke="#1e293b"
                  strokeWidth="1.2"
                />

                {/* Architectural Floor Division Accent Seams on South Facade */}
                <line
                  x1={projectIso(-7.5, -2.5, 9.0)[0]}
                  y1={projectIso(-7.5, -2.5, 9.0)[1]}
                  x2={projectIso(7.5, -2.5, 9.0)[0]}
                  y2={projectIso(7.5, -2.5, 9.0)[1]}
                  stroke="#1e293b"
                  strokeWidth="0.8"
                />
                <line
                  x1={projectIso(-7.5, -5.0, 9.0)[0]}
                  y1={projectIso(-7.5, -5.0, 9.0)[1]}
                  x2={projectIso(7.5, -5.0, 9.0)[0]}
                  y2={projectIso(7.5, -5.0, 9.0)[1]}
                  stroke="#1e293b"
                  strokeWidth="0.8"
                />

                {/* Rooftop Base Surface (15m x 18m) */}
                <polygon
                  points={buildingGeometry.roofPolygon}
                  fill={heroMode === 'annual' ? '#0d1f3c' : '#101b30'}
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />

                {/* Rooftop Safety Setback Boundary (0.5m setback margin) */}
                <polygon
                  points={buildingGeometry.setbackPolygon}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="0.9"
                  strokeDasharray="4,3"
                  strokeOpacity="0.6"
                />

                {/* ------------------------------------------------------------- */}
                {/* MODE 1: LIVE RAYCASTING & DYNAMIC CONVEX HULL SHADOWS */}
                {/* ------------------------------------------------------------- */}
                {heroMode === 'raycast' && (
                  <>
                    {/* Discrete Rooftop Grid Nodes */}
                    {gridCells.map((cell, idx) => (
                      <circle
                        key={idx}
                        cx={cell.iso[0]}
                        cy={cell.iso[1]}
                        r="1.0"
                        fill="#38bdf8"
                        fillOpacity="0.25"
                      />
                    ))}

                    {/* Sunlight Ambient Lit Wash across roof */}
                    {isDaylight && (
                      <polygon
                        points={buildingGeometry.setbackPolygon}
                        fill="#f59e0b"
                        fillOpacity="0.08"
                      />
                    )}

                    {/* Dynamic Obstacle Shadows on Roof (Clipped strictly to rooftop plane) */}
                    <g clipPath="url(#hero-roof-clip)">
                      {obstacleVisuals.map((obs) =>
                        obs.shadowPoints ? (
                          <polygon
                            key={`shadow-${obs.id}`}
                            points={obs.shadowPoints}
                            fill="#020617"
                            fillOpacity="0.75"
                          />
                        ) : null
                      )}
                    </g>
                  </>
                )}

                {/* ------------------------------------------------------------- */}
                {/* MODE 2: ANNUAL SOLAR INSOLATION HEATMAP */}
                {/* ------------------------------------------------------------- */}
                {heroMode === 'annual' && (
                  <>
                    <polygon
                      points={buildingGeometry.roofPolygon}
                      fill="url(#hero-annual-heatmap)"
                      fillOpacity="0.55"
                    />
                    {/* Heatmap Cell Contours */}
                    {gridCells
                      .filter((_, idx) => idx % 4 === 0)
                      .map((cell, idx) => {
                        const isShadedZone = cell.annualScore < 0.8;
                        return (
                          <circle
                            key={`annual-cell-${idx}`}
                            cx={cell.iso[0]}
                            cy={cell.iso[1]}
                            r={isShadedZone ? '1.8' : '1.4'}
                            fill={isShadedZone ? '#0284c7' : '#f59e0b'}
                            fillOpacity="0.7"
                          />
                        );
                      })}
                  </>
                )}

                {/* ------------------------------------------------------------- */}
                {/* MODE 3: PHOTOVOLTAIC ARRAY (55 HIGH-EFFICIENCY MODULES) */}
                {/* ------------------------------------------------------------- */}
                {heroMode === 'pv' && (
                  <g>
                    {pvModules.map((m, idx) => (
                      <polygon
                        key={`pv-${idx}`}
                        points={m.points}
                        fill="#0b213b"
                        stroke="#38bdf8"
                        strokeWidth="0.9"
                      />
                    ))}
                  </g>
                )}

                {/* ------------------------------------------------------------- */}
                {/* 3D ROOFTOP OBSTACLES (Rendered above shadows and grid) */}
                {/* ------------------------------------------------------------- */}
                {obstacleVisuals.map((obs) => (
                  <g key={`obs-${obs.id}`}>
                    {/* South Facing Wall */}
                    <polygon
                      points={obs.southFace}
                      fill="#334155"
                      stroke="#475569"
                      strokeWidth="0.8"
                    />
                    {/* East Facing Wall */}
                    <polygon
                      points={obs.eastFace}
                      fill="#1e293b"
                      stroke="#334155"
                      strokeWidth="0.8"
                    />
                    {/* Top Surface */}
                    <polygon
                      points={obs.topFace}
                      fill="#64748b"
                      stroke="#94a3b8"
                      strokeWidth="0.9"
                    />

                    {/* Specific Architectural Detailing */}
                    {obs.type === 'hvac' && (
                      <circle
                        cx={(projectIso(2.5, 1.5, 2.0)[0])}
                        cy={(projectIso(2.5, 1.5, 2.0)[1])}
                        r="3.5"
                        fill="#1e293b"
                        stroke="#475569"
                        strokeWidth="0.6"
                      />
                    )}
                  </g>
                ))}

                {/* True North Arrow Indicator at NW Roof Edge */}
                <g>
                  <text
                    x={buildingGeometry.northMarker[0] - 3}
                    y={buildingGeometry.northMarker[1] - 4}
                    fill="#38bdf8"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    N
                  </text>
                  <line
                    x1={buildingGeometry.northMarker[0]}
                    y1={buildingGeometry.northMarker[1] + 3}
                    x2={buildingGeometry.northMarker[0]}
                    y2={buildingGeometry.northMarker[1] - 3}
                    stroke="#38bdf8"
                    strokeWidth="1.2"
                  />
                </g>
              </svg>
            </div>

            {/* Precision HUD Telemetry Readout */}
            <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-1 text-[11px] font-mono text-slate-300 bg-[#0d1628]/95 border border-slate-800 p-2.5 rounded-lg shadow-xl backdrop-blur-sm">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Telemetry Readout
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Exposure:</span>
                <span className="font-bold text-emerald-400 font-sans">
                  {heroMode === 'raycast'
                    ? `${exposurePct}% Direct Solar`
                    : heroMode === 'annual'
                    ? '1,842 kWh/m²/yr'
                    : '22.0 kW (55 Mods)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Raycast Grid:</span>
                <span className="text-sky-300">
                  {heroMode === 'raycast'
                    ? `${unshadedCount} Lit / ${totalCells} Cells`
                    : '270 Sub-Meter Cells'}
                </span>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 z-20 hidden sm:flex items-center gap-2 bg-[#0d1628]/95 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 shadow-xl backdrop-blur-sm">
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span>SREDA & Net Metering Ready</span>
            </div>
          </div>

          {/* Interactive Sun Scrubber Bar */}
          <div className="px-5 py-3 bg-[#0d1628] border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3 flex-1 min-w-[280px]">
              {/* Play / Pause diurnal loop button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-1.5 rounded-md border transition-all ${
                  isPlaying
                    ? 'bg-amber-400/20 text-amber-400 border-amber-400/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
                title={isPlaying ? 'Pause Diurnal Motion' : 'Play Diurnal Motion'}
                aria-label={isPlaying ? 'Pause Diurnal Motion' : 'Play Diurnal Motion'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </button>

              <span className="text-slate-400 text-[11px] font-mono flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Time Scrubber:
              </span>
              <input
                type="range"
                min="6"
                max="19"
                step="0.25"
                value={heroHour}
                onChange={(e) => {
                  setIsPlaying(false);
                  setHeroHour(parseFloat(e.target.value));
                }}
                className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                aria-label="Simulated Sun Time Scrubber"
              />
              <span className="text-amber-400 font-mono font-semibold text-[11px] min-w-[56px]">
                {Math.floor(heroHour)}:{String(Math.floor((heroHour % 1) * 60)).padStart(2, '0')} {heroHour >= 12 ? 'PM' : 'AM'}
              </span>

              {/* Quick time jump presets */}
              <div className="hidden lg:flex items-center gap-1 text-[10px] font-mono">
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setHeroHour(9);
                  }}
                  className={`px-1.5 py-0.5 rounded border transition-colors ${
                    Math.abs(heroHour - 9) < 0.25
                      ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                      : 'border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  9 AM
                </button>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setHeroHour(12.5);
                  }}
                  className={`px-1.5 py-0.5 rounded border transition-colors ${
                    Math.abs(heroHour - 12.5) < 0.25
                      ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                      : 'border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Noon
                </button>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setHeroHour(15.5);
                  }}
                  className={`px-1.5 py-0.5 rounded border transition-colors ${
                    Math.abs(heroHour - 15.5) < 0.25
                      ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                      : 'border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  3:30 PM
                </button>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setHeroHour(18);
                  }}
                  className={`px-1.5 py-0.5 rounded border transition-colors ${
                    Math.abs(heroHour - 18) < 0.25
                      ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                      : 'border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  6 PM
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleLaunchApp(false)}
                className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Launch Studio</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* C. PROBLEM AND SOLUTION: ARCHITECTURAL COMPARISON */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#0b101d] border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider">
              {t.problemSolution.badge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t.problemSolution.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {t.problemSolution.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-[#080c15] border border-slate-800 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-semibold text-rose-400 uppercase tracking-wider">
                  {t.problemSolution.problemBadge || 'Problem'} 01
                </span>
                <h3 className="text-sm font-bold text-white">{t.problemSolution.p1Title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{t.problemSolution.p1Desc}</p>
              </div>
              <div className="pt-3 border-t border-slate-800/80 space-y-1">
                <span className="text-[10px] font-mono font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.problemSolution.solutionBadge || 'RoofRay Solution'}</span>
                </span>
                <h4 className="text-xs font-semibold text-slate-200">{t.problemSolution.s1Title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{t.problemSolution.s1Desc}</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-[#080c15] border border-slate-800 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-semibold text-rose-400 uppercase tracking-wider">
                  {t.problemSolution.problemBadge || 'Problem'} 02
                </span>
                <h3 className="text-sm font-bold text-white">{t.problemSolution.p2Title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{t.problemSolution.p2Desc}</p>
              </div>
              <div className="pt-3 border-t border-slate-800/80 space-y-1">
                <span className="text-[10px] font-mono font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.problemSolution.solutionBadge || 'RoofRay Solution'}</span>
                </span>
                <h4 className="text-xs font-semibold text-slate-200">{t.problemSolution.s2Title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{t.problemSolution.s2Desc}</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-[#080c15] border border-slate-800 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-semibold text-rose-400 uppercase tracking-wider">
                  {t.problemSolution.problemBadge || 'Problem'} 03
                </span>
                <h3 className="text-sm font-bold text-white">{t.problemSolution.p3Title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{t.problemSolution.p3Desc}</p>
              </div>
              <div className="pt-3 border-t border-slate-800/80 space-y-1">
                <span className="text-[10px] font-mono font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.problemSolution.solutionBadge || 'RoofRay Solution'}</span>
                </span>
                <h4 className="text-xs font-semibold text-slate-200">{t.problemSolution.s3Title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{t.problemSolution.s3Desc}</p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl bg-[#080c15] border border-slate-800 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-semibold text-rose-400 uppercase tracking-wider">
                  {t.problemSolution.problemBadge || 'Problem'} 04
                </span>
                <h3 className="text-sm font-bold text-white">{t.problemSolution.p4Title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{t.problemSolution.p4Desc}</p>
              </div>
              <div className="pt-3 border-t border-slate-800/80 space-y-1">
                <span className="text-[10px] font-mono font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.problemSolution.solutionBadge || 'RoofRay Solution'}</span>
                </span>
                <h4 className="text-xs font-semibold text-slate-200">{t.problemSolution.s4Title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{t.problemSolution.s4Desc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* D. FEATURE SHOWCASE (BENTO GRID) */}
      {/* ========================================================================= */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider">
            {t.features.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t.features.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {t.features.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Feature 1 */}
          <div className="p-5 rounded-2xl bg-[#0b101d] border border-slate-800 hover:border-slate-700 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">{t.features.f1Title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.features.f1Desc}</p>
          </div>

          {/* Feature 2 */}
          <div className="p-5 rounded-2xl bg-[#0b101d] border border-slate-800 hover:border-slate-700 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Sun className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">{t.features.f2Title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.features.f2Desc}</p>
          </div>

          {/* Feature 3 */}
          <div className="p-5 rounded-2xl bg-[#0b101d] border border-slate-800 hover:border-slate-700 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">{t.features.f3Title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.features.f3Desc}</p>
          </div>

          {/* Feature 4 */}
          <div className="p-5 rounded-2xl bg-[#0b101d] border border-slate-800 hover:border-slate-700 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Compass className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">{t.features.f4Title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.features.f4Desc}</p>
          </div>

          {/* Feature 5 */}
          <div className="p-5 rounded-2xl bg-[#0b101d] border border-slate-800 hover:border-slate-700 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">{t.features.f5Title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.features.f5Desc}</p>
          </div>

          {/* Feature 6 */}
          <div className="p-5 rounded-2xl bg-[#0b101d] border border-slate-800 hover:border-slate-700 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Scale className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">{t.features.f6Title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.features.f6Desc}</p>
          </div>

          {/* Feature 7 (Full row) */}
          <div className="p-6 rounded-2xl bg-[#0e1628] border border-slate-800 space-y-3 md:col-span-2 lg:col-span-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{t.features.f7Title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-amber-300 font-mono border border-slate-800">
                  RAG Grounded
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              {t.features.f7Desc}
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* E. HOW IT WORKS */}
      {/* ========================================================================= */}
      <section id="workflow" className="py-20 bg-[#0b101d] border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider">
              {t.workflow.badge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t.workflow.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {t.workflow.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-[#080c15] border border-slate-800 space-y-2.5">
              <div className="w-7 h-7 rounded-md bg-slate-900 border border-slate-800 text-amber-400 font-bold text-xs font-mono flex items-center justify-center">
                1
              </div>
              <h3 className="text-xs font-bold text-white">{t.workflow.step1Title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t.workflow.step1Desc}</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#080c15] border border-slate-800 space-y-2.5">
              <div className="w-7 h-7 rounded-md bg-slate-900 border border-slate-800 text-sky-400 font-bold text-xs font-mono flex items-center justify-center">
                2
              </div>
              <h3 className="text-xs font-bold text-white">{t.workflow.step2Title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t.workflow.step2Desc}</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#080c15] border border-slate-800 space-y-2.5">
              <div className="w-7 h-7 rounded-md bg-slate-900 border border-slate-800 text-emerald-400 font-bold text-xs font-mono flex items-center justify-center">
                3
              </div>
              <h3 className="text-xs font-bold text-white">{t.workflow.step3Title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t.workflow.step3Desc}</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#080c15] border border-slate-800 space-y-2.5">
              <div className="w-7 h-7 rounded-md bg-slate-900 border border-slate-800 text-amber-400 font-bold text-xs font-mono flex items-center justify-center">
                4
              </div>
              <h3 className="text-xs font-bold text-white">{t.workflow.step4Title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t.workflow.step4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* F. AI TECHNOLOGY SECTION */}
      {/* ========================================================================= */}
      <section id="ai-tech" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-semibold text-sky-400 uppercase tracking-wider">
            {t.aiTech.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t.aiTech.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {t.aiTech.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-2xl bg-[#0b101d] border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">{t.aiTech.groundingTitle}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.aiTech.groundingDesc}</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0b101d] border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">{t.aiTech.ragTitle}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.aiTech.ragDesc}</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0b101d] border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">{t.aiTech.deterministicTitle}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.aiTech.deterministicDesc}</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0b101d] border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <Scale className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">{t.aiTech.noHallucinationTitle}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.aiTech.noHallucinationDesc}</p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* G. BANGLADESH AND GLOBAL IMPACT */}
      {/* ========================================================================= */}
      <section id="impact" className="py-20 bg-[#0b101d] border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
              {t.impact.badge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t.impact.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {t.impact.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
            <div className="p-5 rounded-2xl bg-[#080c15] border border-slate-800 space-y-2">
              <div className="text-emerald-400 font-bold text-sm">{t.impact.bdTitle}</div>
              <p className="text-slate-400 leading-relaxed">{t.impact.bdDesc}</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#080c15] border border-slate-800 space-y-2">
              <div className="text-sky-400 font-bold text-sm">{t.impact.globalTitle}</div>
              <p className="text-slate-400 leading-relaxed">{t.impact.globalDesc}</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#080c15] border border-slate-800 space-y-2">
              <div className="text-amber-400 font-bold text-sm">{t.impact.netMeteringTitle}</div>
              <p className="text-slate-400 leading-relaxed">{t.impact.netMeteringDesc}</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#080c15] border border-slate-800 space-y-2">
              <div className="text-emerald-400 font-bold text-sm">{t.impact.co2Title}</div>
              <p className="text-slate-400 leading-relaxed">{t.impact.co2Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* H. FINAL CTA */}
      {/* ========================================================================= */}
      <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="p-8 sm:p-12 rounded-2xl bg-[#0e1628] border border-slate-800 space-y-5 shadow-xl">
          <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Sun className="w-6 h-6" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t.cta.headline}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t.cta.description}
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => handleLaunchApp(false)}
              className="px-6 py-3 rounded-xl text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all inline-flex items-center gap-2 active:scale-95 shadow-sm"
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
      <footer className="border-t border-slate-800/80 bg-[#060911] text-xs text-slate-500 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <RoofRayLogo size={28} />
              <span className="text-sm font-bold text-white font-sans">
                RoofRay
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <button
                onClick={() => scrollToSection('features')}
                className="hover:text-amber-400 transition-colors"
              >
                {t.footer.footerFeatures}
              </button>
              <button
                onClick={() => scrollToSection('workflow')}
                className="hover:text-amber-400 transition-colors"
              >
                {t.footer.footerWorkflow}
              </button>
              <button
                onClick={() => scrollToSection('ai-tech')}
                className="hover:text-amber-400 transition-colors"
              >
                {t.footer.footerAiTech}
              </button>
              <a
                href="https://github.com/jawaid687/RoofRay"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-400 transition-colors"
              >
                {t.footer.footerGithub}
              </a>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] leading-relaxed text-slate-400">
            <strong className="text-slate-300">Engineering Disclaimer:</strong> {t.footer.disclaimer}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 pt-5 text-[11px]">
            <span>© 2026 {t.footer.copyright}</span>
            <span>{t.footer.targetTrack}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
