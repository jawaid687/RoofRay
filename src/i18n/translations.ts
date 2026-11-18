export type Language = 'en' | 'bn';

export interface TranslationSchema {
  // Navigation
  nav: {
    home: string;
    features: string;
    howItWorks: string;
    aiTech: string;
    impact: string;
    docs: string;
    launchApp: string;
    backToHome: string;
    resetCamera: string;
    runDemo: string;
    activeBuilding: string;
  };
  // Landing Page
  hero: {
    badge: string;
    headline: string;
    subheadline: string;
    ctaPrimary: string;
    ctaSecondary: string;
    stat1Label: string;
    stat1Value: string;
    stat2Label: string;
    stat2Value: string;
    stat3Label: string;
    stat3Value: string;
    simulatedEphemerisBadge: string;
    heroEngineTitle: string;
    heroEngineDesc: string;
    launchStudio: string;
    startTour: string;
    diurnalBadge: string;
    netMeteringBadge: string;
  };
  problemSolution: {
    badge: string;
    title: string;
    subtitle: string;
    p1Title: string;
    p1Desc: string;
    s1Title: string;
    s1Desc: string;
    p2Title: string;
    p2Desc: string;
    s2Title: string;
    s2Desc: string;
    p3Title: string;
    p3Desc: string;
    s3Title: string;
    s3Desc: string;
    p4Title: string;
    p4Desc: string;
    s4Title: string;
    s4Desc: string;
  };
  features: {
    badge: string;
    title: string;
    subtitle: string;
    f1Title: string;
    f1Desc: string;
    f2Title: string;
    f2Desc: string;
    f3Title: string;
    f3Desc: string;
    f4Title: string;
    f4Desc: string;
    f5Title: string;
    f5Desc: string;
    f6Title: string;
    f6Desc: string;
    f7Title: string;
    f7Desc: string;
  };
  workflow: {
    badge: string;
    title: string;
    subtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
  };
  aiTech: {
    badge: string;
    title: string;
    subtitle: string;
    groundingTitle: string;
    groundingDesc: string;
    ragTitle: string;
    ragDesc: string;
    deterministicTitle: string;
    deterministicDesc: string;
    noHallucinationTitle: string;
    noHallucinationDesc: string;
  };
  impact: {
    badge: string;
    title: string;
    subtitle: string;
    bdTitle: string;
    bdDesc: string;
    globalTitle: string;
    globalDesc: string;
    netMeteringTitle: string;
    netMeteringDesc: string;
    co2Title: string;
    co2Desc: string;
  };
  cta: {
    headline: string;
    description: string;
    button: string;
  };
  footer: {
    description: string;
    product: string;
    documentation: string;
    community: string;
    disclaimer: string;
    copyright: string;
    github: string;
    footerFeatures: string;
    footerWorkflow: string;
    footerAiTech: string;
    footerGithub: string;
    targetTrack: string;
  };
  // App UI
  app: {
    plannerTab: string;
    manualTab: string;
    analyticsTab: string;
    rationaleTab: string;
    aiAdvisorTab: string;
    illustrativeNotice: string;
    weatherInformedBadge: string;
    clearSkyBadge: string;
    currencyToggle: string;
    tariffLabel: string;
    costPerKWLabel: string;
    paybackLabel: string;
    systemCostLabel: string;
    annualSavingsLabel: string;
    co2OffsetLabel: string;
    exportReport: string;
  };
  locationTime: {
    title: string;
    cityPreset: string;
    dateTime: string;
    sunPosition: string;
    elevation: string;
    azimuth: string;
    solarNoon: string;
    sunriseSunset: string;
    summerSolstice: string;
    winterSolstice: string;
    equinox: string;
    customCoordinates: string;
    latitude: string;
    longitude: string;
    timezone: string;
    apply: string;
    diurnalPlayback: string;
    speed: string;
    simple: string;
    bdDivisionsLabel: string;
    globalSitesLabel: string;
    customLocation: string;
    simulatedArchetypeNotice: string;
    latLabel: string;
    lonLabel: string;
    tzLabel: string;
    applyCoordinates: string;
  };
  buildingInspector: {
    title: string;
    targetBuilding: string;
    dimensions: string;
    roofArea: string;
    usableArea: string;
    obstacles: string;
    setbackNotice: string;
    fixedGeometry: string;
  };
  solarAnalysis: {
    title: string;
    runAnalysis: string;
    analyzing: string;
    recommendedArea: string;
    annualInsolation: string;
    exposureScore: string;
    obstacleFootprint: string;
    nasaClimatology: string;
    clearSkyNotice: string;
    offlineNotice: string;
    viewHeatmap: string;
    rerunAnalysis: string;
    reanalyzePotential: string;
    analyzingProgress: string;
    cancel: string;
    webWorkerTitle: string;
    webWorkerDesc: string;
    roofSuitability: string;
    clearSkyEstimate: string;
    viable: string;
    monthlyInsolation: string;
    clickBarInspect: string;
    satelliteClimatology: string;
    allSkyInsolation: string;
    cloudAttenuation: string;
    weatherInformedYield: string;
    sourceDistinctionNotice: string;
    bestContiguousZone: string;
  };
  panelConfig: {
    title: string;
    moduleSpec: string;
    wattage: string;
    dimensions: string;
    efficiency: string;
    warranty: string;
    tiltAngle: string;
    orientation: string;
    portrait: string;
    landscape: string;
  };
  energyDemand: {
    title: string;
    monthlyConsumption: string;
    annualConsumption: string;
    installedCapacity: string;
    annualGeneration: string;
    gridCoverage: string;
    surplusExport: string;
  };
  optimization: {
    title: string;
    mode: string;
    balanced: string;
    balancedDesc: string;
    maxGeneration: string;
    maxGenerationDesc: string;
    lowestCost: string;
    lowestCostDesc: string;
    meetDemand: string;
    meetDemandDesc: string;
    runOptimization: string;
    optimizing: string;
    clearPanels: string;
  };
  manualLayout: {
    title: string;
    clickToPlace: string;
    tools: string;
    rotate: string;
    undo: string;
    redo: string;
    delete: string;
    fillZone: string;
    collisionWarning: string;
    setbackWarning: string;
  };
  financialSummary: {
    title: string;
    currency: string;
    capex: string;
    annualSavings: string;
    payback: string;
    twentyYearNet: string;
    roi: string;
    carbonAbated: string;
    assumptionsToggle: string;
    electricityTariff: string;
    costPerKW: string;
    baseCost: string;
    exportCredit: string;
    emissionFactor: string;
    resetDefaults: string;
    disclaimer: string;
  };
  aiAdvisor: {
    title: string;
    subtitle: string;
    promptPlaceholder: string;
    generateEvaluation: string;
    generating: string;
    keyNotConfigured: string;
    setupGuide: string;
    ragCitations: string;
    summary: string;
    recommendations: string;
    advantages: string;
    risks: string;
    assumptions: string;
    nextSteps: string;
    quickPrompt1: string;
    quickPrompt2: string;
    quickPrompt3: string;
    quickPrompt4: string;
    selectBuildingPrompt: string;
    selectBuildingDesc: string;
    fullReport: string;
    consultationError: string;
    keySetupRequired: string;
    keySetupDesc: string;
    executiveSummary: string;
    engineeringRecommendations: string;
    keyAdvantages: string;
    risksLimitations: string;
    citationsGrounding: string;
  };
  solarReportModal: {
    title: string;
    downloadPdf: string;
    copyJson: string;
    close: string;
    executiveSummary: string;
    technicalHighlights: string;
    financialProjection: string;
    environmentalImpact: string;
    disclaimer: string;
  };
  demoTour: {
    title: string;
    next: string;
    previous: string;
    finish: string;
    exit: string;
  };
  common: {
    loading: string;
    error: string;
    success: string;
    meters: string;
    sqMeters: string;
    sqFeet: string;
    years: string;
    kwh: string;
    kw: string;
    tonnesCO2: string;
  };
}

export const translations: Record<Language, TranslationSchema> = {
  en: {
    nav: {
      home: 'Home',
      features: 'Features',
      howItWorks: 'How It Works',
      aiTech: 'AI Technology',
      impact: 'Impact',
      docs: 'Documentation',
      launchApp: 'Launch Solar App',
      backToHome: '← Back to Home',
      resetCamera: 'Reset Camera',
      runDemo: 'Run Demo',
      activeBuilding: 'Active Building:',
    },
    hero: {
      badge: 'International AI Builders Congress 2026 • Idea to Unicorn',
      headline: 'Turn Every Rooftop Into a Smarter Solar Opportunity.',
      subheadline:
        'Explore rooftop solar potential, simulate shading in real-time 3D, optimize panel placement, and receive grounded AI solar recommendations with RoofRay.',
      ctaPrimary: 'Explore Solar Planner',
      ctaSecondary: 'Watch Guided Tour',
      stat1Label: 'Raycasting Resolution',
      stat1Value: '0.8m Grid',
      stat2Label: 'Solar Calculation Engine',
      stat2Value: 'NOAA Ephemeris',
      stat3Label: 'AI Grounding',
      stat3Value: 'SREDA & NREL RAG',
      simulatedEphemerisBadge: '⚡ 3D RAYCASTING & LIVE SOLAR EPHEMERIS',
      heroEngineTitle: 'Real-Time Shading & Solar Potential Engine',
      heroEngineDesc: 'Discretized 0.8m rooftop raycast grid, NOAA astronomical sun ephemeris, automated panel layout, and Gemini-grounded advisory.',
      launchStudio: 'Launch Interactive 3D Studio',
      startTour: 'Start Automated Tour',
      diurnalBadge: 'Live Diurnal Solar Engine',
      netMeteringBadge: 'SREDA & BPDB Net-Metering Compatible',
    },
    problemSolution: {
      badge: 'Challenges & Technological Solution',
      title: 'Bridging the Rooftop Solar Planning Gap',
      subtitle:
        'Traditional solar planning is opaque, slow, and prone to costly shading errors. RoofRay replaces manual guesswork with physics-accurate raycasting and grounded AI intelligence.',
      p1Title: 'Rooftop Planning is Difficult',
      p1Desc: 'Calculating azimuth, tilt angles, obstacle setbacks, and inter-panel spacing requires specialized CAD expertise.',
      s1Title: 'Interactive 3D Simulation',
      s1Desc: 'RoofRay provides an intuitive 3D canvas with real-time shadow casting, obstacle collision checks, and 0.8m grid raytracing.',
      p2Title: 'Shading Severely Penalizes Yield',
      p2Desc: 'Surrounding skyscrapers, parapets, and rooftop water tanks cause unseen shading that drastically cuts annual power generation.',
      s2Title: 'Annual Clear-Sky & Weather Analysis',
      s2Desc: 'Simulate annual solar exposure across all 12 months with NOAA solar vectors, identifying optimal solar harvest zones.',
      p3Title: 'Sub-Optimal Panel Placement',
      p3Desc: 'Arbitrary panel positioning leads to high shade degradation and violates fire safety setbacks.',
      s3Title: 'Multi-Objective Layout Optimization',
      s3Desc: 'Automated placement engines rank roof coordinates by solar yield, balancing capital budget, demand offset, and layout efficiency.',
      p4Title: 'Opaque Financial Decisions',
      p4Desc: 'Homeowners and businesses struggle to verify payback periods, net-metering benefits, and true ROI without trustworthy figures.',
      s4Title: 'Transparent Economics & AI Advisor',
      s4Desc: 'Configurable local grid tariffs (BDT / USD), verifiable carbon offsets, and an AI Solar Advisor grounded in official SREDA guidelines.',
    },
    features: {
      badge: 'Platform Capabilities',
      title: 'Engineered for Precision & Explainability',
      subtitle: 'A unified suite of 3D spatial simulation, astronomical computation, and grounded AI advisory.',
      f1Title: 'Interactive 3D Solar Visualization',
      f1Desc: 'Web-based Three.js digital twin with dynamic diurnal sunlight and true astronomical ephemeris.',
      f2Title: 'Real-Time Shadow Simulation',
      f2Desc: 'Hardware-accelerated raycasting projects exact real-time shadows from towers, parapets, and rooftop utilities.',
      f3Title: 'Annual Solar Suitability Analysis',
      f3Desc: 'Multi-month solar insolation analysis maps roof suitability into prime, moderate, and shaded zones.',
      f4Title: 'Intelligent Panel Placement',
      f4Desc: 'Automated packing and spatial validation enforcing fire safety setbacks (0.8m) and obstacle buffers.',
      f5Title: 'Solar Energy Estimation',
      f5Desc: 'Deterministic energy calculation modeling panel tilt, azimuth, efficiency derating, and annual kWh yields.',
      f6Title: 'Financial and ROI Analysis',
      f6Desc: 'Configurable utility tariffs (BDT ৳ / USD $), turnkey installation costs, net-metering export credits, and 20-year net benefit projections.',
      f7Title: 'AI Solar Advisor with Grounded RAG',
      f7Desc: 'Server-side LLM synthesis grounded in physical simulation data and authoritative SREDA/NREL technical corpus.',
    },
    workflow: {
      badge: 'Step-by-Step Workflow',
      title: 'How RoofRay Operates',
      subtitle: 'A streamlined four-stage journey from astronomical sun vectoring to engineering reports.',
      step1Title: '1. Select Location & Roof',
      step1Desc: 'Choose from 8 Bangladesh divisional hubs or global locations, and inspect rooftop dimensions and utility obstacles.',
      step2Title: '2. Simulate Shading & Insolation',
      step2Desc: 'Run annual raycast analysis to identify peak solar zones and reveal shadow impacts across all seasons.',
      step3Title: '3. Optimize PV Module Layout',
      step3Desc: 'Auto-pack panels under Balanced, Maximum Generation, or Budget modes, or manually position individual modules.',
      step4Title: '4. Analyze ROI & Consult AI',
      step4Desc: 'Examine detailed cash-flow metrics, payback timelines, CO₂ reductions, and receive grounded recommendations from our AI Solar Advisor.',
    },
    aiTech: {
      badge: 'Responsible AI Architecture',
      title: 'Physics-Grounded Solar Intelligence',
      subtitle: 'Our AI Solar Advisor does not guess or hallucinate numbers — it explains verified engineering calculations.',
      groundingTitle: 'Deterministic Single Source of Truth',
      groundingDesc: 'NOAA solar equations and Three.js raycasting calculate physical production, kW capacity, and financial numbers.',
      ragTitle: 'Lexical RAG Knowledge Retrieval',
      ragDesc: 'Domain knowledge retrieved from official SREDA guidelines, BPDB tariff schedules, and NREL technical benchmarks.',
      deterministicTitle: 'Strict Grounding Architecture',
      deterministicDesc: 'LLM receives structured calculated context as ground truth and is prohibited from recalculating or inventing numbers.',
      noHallucinationTitle: 'Explainable Advice with Attribution',
      noHallucinationDesc: 'Every recommendation includes regulatory citations, physical risk disclosures, financial boundaries, and next steps.',
    },
    impact: {
      badge: 'Sustainable Development',
      title: 'Empowering the Clean Energy Transition',
      subtitle: 'Accelerating rooftop solar adoption for homeowners, commercial facilities, and EPC engineers.',
      bdTitle: 'Bangladesh National Solar Targets',
      bdDesc: 'Supporting the 2,000 MW rooftop solar expansion across Dhaka, Chattogram, and key industrial export corridors.',
      globalTitle: 'Universal Astronomical Engine',
      globalDesc: 'Applicable worldwide from the Equator to the Arctic Circle using NOAA ephemeris and NASA POWER climatology.',
      netMeteringTitle: 'SREDA Net-Metering Readiness',
      netMeteringDesc: 'Pre-configured with SREDA net-metering guidelines (up to 70% sanctioned load) to streamline utility grid interconnection.',
      co2Title: 'Verifiable Carbon Offsets',
      co2Desc: 'Calculated using Department of Environment (0.637 kg CO2/kWh for BD) and IEA factors with tree-planting and vehicle equivalents.',
    },
    cta: {
      headline: 'Your Rooftop Has Potential. Discover It.',
      description: 'Start planning with precision 3D shadow simulation, intelligent layout optimization, and grounded AI guidance.',
      button: 'Start Planning With RoofRay',
    },
    footer: {
      description: 'RoofRay is an AI-powered 3D solar planning, simulation, and recommendation platform built for the International AI Builders Congress 2026.',
      product: 'Product',
      documentation: 'Documentation',
      community: 'Community',
      disclaimer: 'RoofRay provides engineering simulation estimates for solar planning. Official rooftop structural audits and utility interconnection assessments must be performed prior to installation.',
      copyright: 'RoofRay. Developed for AI Builders Congress 2026. All rights reserved.',
      github: 'GitHub Repository',
      footerFeatures: 'Features',
      footerWorkflow: 'How It Works',
      footerAiTech: 'AI Architecture',
      footerGithub: 'GitHub Repository',
      targetTrack: 'Target Track: Idea to Unicorn • ClimateSphere AI',
    },
    app: {
      plannerTab: 'Planner',
      manualTab: 'Manual Studio',
      analyticsTab: 'Economics',
      rationaleTab: 'Why Plan',
      aiAdvisorTab: 'AI Advisor',
      illustrativeNotice: 'Illustrative Geometry: 3D buildings are archetype models for raycasting simulation. City presets update astronomical sun paths & solar irradiance.',
      weatherInformedBadge: 'NASA POWER Climatology',
      clearSkyBadge: 'Clear-Sky Raycasting',
      currencyToggle: 'Currency',
      tariffLabel: 'Electricity Tariff',
      costPerKWLabel: 'Turnkey Cost / kW',
      paybackLabel: 'Payback Period',
      systemCostLabel: 'System Capital Cost',
      annualSavingsLabel: 'Annual Bill Savings',
      co2OffsetLabel: 'Annual CO₂ Displaced',
      exportReport: 'Export Solar Report',
    },
    locationTime: {
      title: 'Astronomical Location & Time',
      cityPreset: 'City Preset',
      dateTime: 'Date & Time',
      sunPosition: 'Sun Position (NOAA)',
      elevation: 'Elevation',
      azimuth: 'Azimuth',
      solarNoon: 'Solar Noon',
      sunriseSunset: 'Sunrise / Sunset',
      summerSolstice: 'Summer Solstice',
      winterSolstice: 'Winter Solstice',
      equinox: 'Equinox',
      customCoordinates: 'Custom Coordinates',
      latitude: 'Latitude (°N)',
      longitude: 'Longitude (°E)',
      timezone: 'Timezone',
      apply: 'Apply Coordinates',
      diurnalPlayback: 'Diurnal Sun Simulation',
      speed: 'Playback Speed',
      simple: 'Simple',
      bdDivisionsLabel: '🇧🇩 Bangladesh Divisions (Verified Coordinates)',
      globalSitesLabel: '🌐 Global & Reference Sites',
      customLocation: 'Custom Location',
      simulatedArchetypeNotice: 'Simulated Archetype: Current 3D buildings represent illustrative geometries for raycast shading analysis. City selection updates astronomical sun coordinates and irradiance ephemeris.',
      latLabel: 'Latitude (-90 to +90)',
      lonLabel: 'Longitude (-180 to +180)',
      tzLabel: 'IANA Timezone (Handles DST)',
      applyCoordinates: 'Apply Custom Coordinates',
    },
    buildingInspector: {
      title: 'Target Building Geometry',
      targetBuilding: 'Active Building',
      dimensions: 'Dimensions',
      roofArea: 'Total Roof Area',
      usableArea: 'Usable Area',
      obstacles: 'Rooftop Obstacles',
      setbackNotice: '0.8m perimeter setback & 0.5m obstacle clearances enforced.',
      fixedGeometry: 'Preset Geometry',
    },
    solarAnalysis: {
      title: '3D Solar & Shadow Analysis',
      runAnalysis: 'Run Annual Solar Analysis',
      analyzing: 'Simulating Solar Rays...',
      recommendedArea: 'Recommended Zone',
      annualInsolation: 'Annual Insolation',
      exposureScore: 'Average Exposure',
      obstacleFootprint: 'Obstacle Footprint',
      nasaClimatology: 'NASA POWER Satellite Climatology',
      clearSkyNotice: 'Pure astronomical clear-sky simulation via NOAA ephemeris.',
      offlineNotice: 'NASA service offline. Running pure geometric raycasting.',
      viewHeatmap: 'Toggle Solar Heatmap',
      rerunAnalysis: 'Re-run Annual Analysis',
      reanalyzePotential: 'Re-analyze Solar Potential',
      analyzingProgress: 'Analyzing 12 Months',
      cancel: 'Cancel',
      webWorkerTitle: 'Web Worker Solar Simulation',
      webWorkerDesc: 'Off-thread raycasting across 12 representative days and clear-sky plane-of-array irradiance models.',
      roofSuitability: 'Rooftop Solar Suitability',
      clearSkyEstimate: 'Clear-sky estimate',
      viable: 'Viable',
      monthlyInsolation: 'Monthly Solar Insolation (kWh/m²)',
      clickBarInspect: 'Click any bar to inspect that month on the 3D rooftop heatmap.',
      satelliteClimatology: 'Satellite Climatology Resource (NASA POWER)',
      allSkyInsolation: 'All-Sky Insolation',
      cloudAttenuation: 'Cloud Attenuation',
      weatherInformedYield: 'Weather-Informed Yield Estimate',
      sourceDistinctionNotice: 'Source & Distinction Notice:',
      bestContiguousZone: 'Best Contiguous Placement Zone',
    },
    panelConfig: {
      title: 'PV Module Specifications',
      moduleSpec: 'Module Specification',
      wattage: 'Rated Wattage',
      dimensions: 'Dimensions',
      efficiency: 'Module Efficiency',
      warranty: 'Performance Warranty',
      tiltAngle: 'Tilt Angle (°)',
      orientation: 'Orientation',
      portrait: 'Portrait',
      landscape: 'Landscape',
    },
    energyDemand: {
      title: 'Energy Demand & Consumption',
      monthlyConsumption: 'Monthly Demand',
      annualConsumption: 'Annual Demand',
      installedCapacity: 'System Capacity',
      annualGeneration: 'Annual Generation',
      gridCoverage: 'Demand Offset Coverage',
      surplusExport: 'Surplus Grid Export',
    },
    optimization: {
      title: 'Layout Optimization',
      mode: 'Optimization Objective',
      balanced: 'Balanced / Best Value',
      balancedDesc: 'Balances capital expenditure, energy production, and high solar yield zones.',
      maxGeneration: 'Maximum Generation',
      maxGenerationDesc: 'Packs maximum allowable modules into prime exposure areas.',
      lowestCost: 'Lowest Initial Cost',
      lowestCostDesc: 'Minimizes upfront capital cost while delivering high return on investment.',
      meetDemand: 'Meet Consumption Need',
      meetDemandDesc: 'Sizes array to offset approximately 100% of user consumption.',
      runOptimization: 'Auto-Generate Layout',
      optimizing: 'Optimizing Placements...',
      clearPanels: 'Clear Array',
    },
    manualLayout: {
      title: 'Manual Layout Studio',
      clickToPlace: 'Click on unobstructed roof grid to place or remove solar panels.',
      tools: 'Placement Controls',
      rotate: 'Rotate Module (Q/E)',
      undo: 'Undo (Ctrl+Z)',
      redo: 'Redo (Ctrl+Y)',
      delete: 'Delete Selected (Del)',
      fillZone: 'Fill Selected Zone',
      collisionWarning: 'Panel overlaps with existing module or rooftop obstacle.',
      setbackWarning: 'Panel violates 0.8m fire safety setback boundary.',
    },
    financialSummary: {
      title: 'Financial Performance & Economics',
      currency: 'Currency',
      capex: 'Estimated Capex',
      annualSavings: 'Annual Savings',
      payback: 'Payback Period',
      twentyYearNet: '20-Year Net Benefit',
      roi: 'Return on Investment',
      carbonAbated: 'CO₂ Abatement',
      assumptionsToggle: 'Financial & Emission Assumptions',
      electricityTariff: 'Electricity Tariff',
      costPerKW: 'Turnkey Cost / kW',
      baseCost: 'Base Permitting & Meter Fee',
      exportCredit: 'Export Credit Rate (% of tariff)',
      emissionFactor: 'Grid Emission Factor',
      resetDefaults: 'Reset Defaults',
      disclaimer: 'Figures are simulation estimates for planning purposes and do not constitute binding contractor quotations.',
    },
    aiAdvisor: {
      title: 'AI Solar Engineering Advisor',
      subtitle: 'Grounded in real-time 3D raycasting and official SREDA / BPDB guidelines.',
      promptPlaceholder: 'Ask a specific question (e.g. net-metering limits, shading mitigation, ROI payback in Dhaka)...',
      generateEvaluation: 'Generate AI Solar Assessment',
      generating: 'Synthesizing Engineering Recommendations...',
      keyNotConfigured: 'Gemini API key is not configured on the server.',
      setupGuide: 'Obtain a free API key at aistudio.google.com and configure GEMINI_API_KEY in .env.',
      ragCitations: 'Verified Knowledge Base Grounding',
      summary: 'Executive Summary',
      recommendations: 'Engineering & Layout Recommendations',
      advantages: 'Key System Advantages',
      risks: 'Operational & Shading Risks',
      assumptions: 'Engineering & Economic Assumptions',
      nextSteps: 'Actionable Next Steps',
      quickPrompt1: 'Analyze my rooftop solar viability & payback',
      quickPrompt2: 'Will shading from nearby towers or obstacles penalize yield?',
      quickPrompt3: 'Check SREDA 70% net-metering limit for Bangladesh',
      quickPrompt4: 'Suggest optimal panel orientation and safety setbacks',
      selectBuildingPrompt: 'Select a Building',
      selectBuildingDesc: 'Please choose a rooftop in the Planner tab to consult the AI Advisor.',
      fullReport: 'Full Report',
      consultationError: 'Consultation Error',
      keySetupRequired: 'Gemini API Key Setup Required',
      keySetupDesc: 'The AI Solar Advisor runs server-side to protect secret credentials. To activate live generative responses from Google Gemini:',
      executiveSummary: 'Executive Advisory Synthesis',
      engineeringRecommendations: 'Engineering Recommendations',
      keyAdvantages: 'Key Advantages',
      risksLimitations: 'Risks & Limitations',
      citationsGrounding: 'Technical & Policy Citations Grounding',
    },
    solarReportModal: {
      title: 'RoofRay Feasibility & Engineering Report',
      downloadPdf: 'Print / Save PDF',
      copyJson: 'Copy Audit JSON',
      close: 'Close',
      executiveSummary: 'Executive Summary',
      technicalHighlights: 'Technical Highlights',
      financialProjection: 'Financial Projections',
      environmentalImpact: 'Environmental Sustainability',
      disclaimer: 'Notice: This report is generated by RoofRay simulation engine. An on-site engineering and structural survey is required before procurement.',
    },
    demoTour: {
      title: 'RoofRay Guided Tour',
      next: 'Next',
      previous: 'Previous',
      finish: 'Finish Tour',
      exit: 'Exit Tour',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      meters: 'm',
      sqMeters: 'm²',
      sqFeet: 'sq ft',
      years: 'years',
      kwh: 'kWh',
      kw: 'kW',
      tonnesCO2: 't CO₂/yr',
    },
  },
  bn: {
    nav: {
      home: 'হোম',
      features: 'বৈশিষ্ট্যসমূহ',
      howItWorks: 'কীভাবে কাজ করে',
      aiTech: 'এআই প্রযুক্তি',
      impact: 'প্রভাব ও সম্ভাবনা',
      docs: 'ডকুমেন্টেশন',
      launchApp: 'অ্যাপ চালু করুন',
      backToHome: '← হোমে ফিরে যান',
      resetCamera: 'ক্যামেরা রিসেট',
      runDemo: 'ডেমো দেখুন',
      activeBuilding: 'সক্রিয় ভবন:',
    },
    hero: {
      badge: 'ইন্টারন্যাশনাল এআই বিল্ডার্স কংগ্রেস ২০২৬ • আইডিয়া টু ইউনিকর্ন',
      headline: 'প্রতিটি ছাদকে রূপান্তর করুন পরিবেশবান্ধব সৌরশক্তিতে।',
      subheadline:
        'রূফরের মাধ্যমে আপনার ছাদের সৌর সম্ভাবনা জানুন, রিয়েল-টাইম থ্রি-ডি ছায়া বিশ্লেষণ করুন, প্যানেল স্থাপন অপ্টিমাইজ করুন এবং নির্ভরযোগ্য এআই পরামর্শ পান।',
      ctaPrimary: 'সোলার প্ল্যানার শুরু করুন',
      ctaSecondary: 'গাইডেড ডেমো দেখুন',
      stat1Label: 'রে-কাস্টিং রেজোলিউশন',
      stat1Value: '০.৮ মিটার গ্রিড',
      stat2Label: 'সৌর গণনা ইঞ্জিন',
      stat2Value: 'নোয়া (NOAA) পজিশন',
      stat3Label: 'এআই গ্রাউন্ডিং',
      stat3Value: 'শ্রেডা ও এনআরইএল র্যাগ',
      simulatedEphemerisBadge: '⚡ ৩ডি রে-কাস্টিং এবং লাইভ সৌর অবস্থান',
      heroEngineTitle: 'রিয়েল-টাইম শেডিং এবং সৌর সম্ভাবনা ইঞ্জিন',
      heroEngineDesc: '০.৮ মিটার গ্রিড রে-কাস্টিং, নোয়া জ্যোতির্বিজ্ঞান সূর্য অবস্থান, স্বয়ংক্রিয় প্যানেল বিন্যাস এবং জেমিনি এআই উপদেষ্টা।',
      launchStudio: 'ইন্টারেক্টিভ ৩ডি স্টুডিও চালু করুন',
      startTour: 'স্বয়ংক্রিয় ট্যুর শুরু করুন',
      diurnalBadge: 'লাইভ দৈনিক সৌর ইঞ্জিন',
      netMeteringBadge: 'স্রেডা ও বিপিডিবি নেট-মিটারিং উপযোগী',
    },
    problemSolution: {
      badge: 'সমস্যা ও প্রযুক্তিগত সমাধান',
      title: 'ছাদের সৌর পরিকল্পনার জটিলতা দূরীকরণ',
      subtitle:
        'প্রথাগত সৌর পরিকল্পনা ধীরগতির এবং ছায়ার কারণে ভুল গণনার ঝুঁকি থাকে। রূফরে ফিজিক্স-নির্ভর থ্রি-ডি রে-কাস্টিং এবং যাচাইকৃত এআই দিয়ে এই সমাধান নিশ্চিত করে।',
      p1Title: 'ছাদের পরিকল্পনা জটিল',
      p1Desc: 'সৌর প্যানেলের কোণ, দিক, ছাদের বাধা এবং সেফটি বাফার নির্ণয় করতে বিশেষ সিএডি দক্ষতার প্রয়োজন হয়।',
      s1Title: 'ইন্টারেক্টিভ থ্রি-ডি সিমুলেশন',
      s1Desc: 'রিয়েল-টাইম ছায়া তৈরি, বাধার সাথে সংঘর্ষ পরীক্ষা এবং ০.৮ মিটার গ্রিড রে-ট্রেসিং বিশিষ্ট সহজ থ্রি-ডি পরিবেশ।',
      p2Title: 'ছায়ার কারণে বিদ্যুৎ উৎপাদন হ্রাস',
      p2Desc: 'পাশের বহুতল ভবন, পানির ট্যাংক ও সিঁড়িঘরের ছায়া বার্ষিক সৌরবিদ্যুৎ উৎপাদনে বড় ধরনের লোকসান ঘটায়।',
      s2Title: '১২ মাসের বার্ষিক সৌর বিশ্লেষণ',
      s2Desc: 'নোয়া অ্যাস্ট্রোনমিক্যাল ভেক্টরের মাধ্যমে ১২ মাসের সার্বিক সৌর অবস্থান হিসাব করে সেরা ফলন এলাকা চিহ্নিত করে।',
      p3Title: 'অদক্ষ প্যানেল বিন্যাস',
      p3Desc: 'সঠিক পরিকল্পনা ছাড়া প্যানেল বসালে কম রোদ পাওয়া যায় এবং অগ্নিনির্বাপক চলাচলের নিয়ম ভঙ্গ হয়।',
      s3Title: 'মাল্টি-অবজেক্টিভ অপ্টিমাইজেশন',
      s3Desc: 'বাজেট, চাহিদা মেটানো বা সর্বোচ্চ উৎপাদন—তিনটি লক্ষ্য অনুযায়ী স্বয়ংক্রিয়ভাবে সেরা স্থানে প্যানেল বসানোর ইঞ্জিন।',
      p4Title: 'অস্পষ্ট আর্থিক ও বিনিয়োগ হিসাব',
      p4Desc: 'সঠিক ট্যারিফ ও খরচ ছাড়া বিনিয়োগ উঠে আসার সময়কাল (Payback) ও নিট-মিটারিং সঞ্চয় যাচাই করা কঠিন।',
      s4Title: 'স্বচ্ছ অর্থনীতি ও এআই উপদেষ্টা',
      s4Desc: 'বাংলাদেশি টাকা (৳) বা ডলারে কাস্টম ট্যারিফ নির্ধারণ, নিট সঞ্চয় হিসাব এবং শ্রেডা নির্দেশিকা ভিত্তিক এআই পরামর্শ।',
    },
    features: {
      badge: 'প্ল্যাটফর্মের সক্ষমতা',
      title: 'নির্ভুলতা ও স্বচ্ছতার জন্য প্রকৌশলীকৃত',
      subtitle: 'থ্রি-ডি স্থানিক সিমুলেশন, জ্যোতির্বিজ্ঞান গণনা ও নির্ভরযোগ্য এআই বিজ্ঞ পরামর্শের সমন্বয়।',
      f1Title: 'ইন্টারেক্টিভ থ্রি-ডি সৌর দৃশ্যমানতা',
      f1Desc: 'থ্রি.জেএস ও ওয়েবজিএল চালিত ডিজিটাল টুইন যেখানে সূর্যের ২৪ ঘণ্টার অবস্থান অনুযায়ী আলোর পরিবর্তন দেখা যায়।',
      f2Title: 'রিয়েল-টাইম ছায়া সিমুলেশন',
      f2Desc: 'হার্ডওয়্যার-ত্বরান্বিত রে-কাস্টিং পাশের বড় ভবন ও ছাদের পানির ট্যাংক থেকে পড়া ছায়া সরাসরি দেখায়।',
      f3Title: 'বার্ষিক সৌর উপযোগিতা বিশ্লেষণ',
      f3Desc: '১২ মাসের শত শত সূর্যের অবস্থান বিশ্লেষণ করে ছাদের অংশগুলোকে চমৎকার, ভালো ও দুর্বল অঞ্চলে ভাগ করে।',
      f4Title: 'বুদ্ধিমান প্যানেল প্লেসমেন্ট',
      f4Desc: '০.৮ মিটার ফায়ার সেফটি বাউন্ডারি ও ০.৫ মিটার বাধার দূরত্ব নিশ্চিত করে স্বয়ংক্রিয় বা ম্যানুয়াল প্যানেল বসানো।',
      f5Title: 'সৌর বিদ্যুৎ উৎপাদন প্রাক্কলন',
      f5Desc: 'প্রতিটি প্যানেলের পিক সান আওয়ার, টিল্ট কোণ ও ছায়ার স্কোর যোগ করে নিশ্চিত বার্ষিক কিলোওয়াট-ঘণ্টা হিসাব।',
      f6Title: 'আর্থিক ও বিনিয়োগ বিশ্লেষণ (ROI)',
      f6Desc: 'টাকা (৳) বা ডলারে বিদ্যুৎ বিলের সঞ্চয়, টার্নকি ইনস্টলেশন খরচ, নেট-মিটারিং সুবিধা এবং ২০ বছরের নিট লাভ হিসাব।',
      f7Title: 'এআই সোলার অ্যাডভাইজর ও নলেজ র্যাগ',
      f7Desc: 'সার্ভার-সাইড এআই যা সরাসরি সিমুলেশন ডেটা এবং শ্রেডা (SREDA) ও বিপিডিবি (BPDB) নীতিমালার উপর ভিত্তি করে পরামর্শ দেয়।',
    },
    workflow: {
      badge: 'চার ধাপের কর্মপদ্ধতি',
      title: 'রূফরে যেভাবে কাজ করে',
      subtitle: 'সূর্যের অবস্থানের হিসাব থেকে শুরু করে বিনিয়োগ প্রতিবেদন পাওয়া পর্যন্ত সম্পূর্ণ প্রক্রিয়া।',
      step1Title: '১. অবস্থান ও ছাদ নির্বাচন',
      step1Desc: 'বাংলাদেশের ৮টি বিভাগীয় শহর বা বৈশ্বিক অবস্থান থেকে শহর বেছে নিন এবং ছাদের আয়তন ও বাধাগুলো পরীক্ষা করুন।',
      step2Title: '২. রোদ ও ছায়া বিশ্লেষণ',
      step2Desc: 'রে-কাস্টিং বিশ্লেষণ চালিয়ে ছাদের হিটম্যাপ দেখুন এবং দিনের বিভিন্ন সময়ে ছায়ার গতিবিধি লক্ষ্য করুন।',
      step3Title: '৩. প্যানেল বিন্যাস অপ্টিমাইজ',
      step3Desc: 'সর্বোচ্চ উৎপাদন, কম খরচ বা ভারসাম্যপূর্ণ মোডে স্বয়ংক্রিয়ভাবে প্যানেল সাজান অথবা নিজের সুবিধামতো বসান।',
      step4Title: '৪. আর্থিক ফলাফল ও এআই পরামর্শ',
      step4Desc: 'বিদ্যুৎ উৎপাদন, বিনিয়োগ উঠে আসার সময়কাল, কার্বন হ্রাস এবং এআই উপদেষ্টার কৌশলগত প্রতিবেদন দেখুন।',
    },
    aiTech: {
      badge: 'দায়িত্বশীল এআই আর্কিটেকচার',
      title: 'পদার্থবিজ্ঞান-নির্ভর সৌর বুদ্ধিমত্তা',
      subtitle: 'আমাদের এআই উপদেষ্টা অনুমাননির্ভর কোনো হিসাব করে না; এটি যাচাইকৃত সিমুলেশন ডেটার ব্যাখ্যা প্রদান করে।',
      groundingTitle: 'সুনির্দিষ্ট ফিজিক্স ইঞ্জিন',
      groundingDesc: 'নোয়া (NOAA) ও থ্রি.জেএস রে-কাস্টিং সূর্যের উন্নতি কোণ, ছায়া এবং প্রতিটি প্যানেলের কিলোওয়াট উৎপাদন নিশ্চিত করে।',
      ragTitle: 'নলেজ রিট্রিভাল (RAG)',
      ragDesc: 'শ্রেডা নেট-মিটারিং নীতিমালা, বিপিডিবি বিদ্যুৎ ট্যারিফ এবং এনআরইএল নলেজবেস থেকে তথ্য সংগ্রহ করে পরামর্শ দেওয়া হয়।',
      deterministicTitle: 'একক সত্যের উৎস',
      deterministicDesc: 'এলএলএম (LLM) কেবল গণনা করা বাস্তব সংখ্যাগুলো গ্রহণ করে। এটি কোনো মনগড়া সংখ্যা তৈরি করে না।',
      noHallucinationTitle: 'ব্যাখ্যাযোগ্য পরামর্শ ও রেফারেন্স',
      noHallucinationDesc: 'প্রতিটি পরামর্শের সাথে আর্থিক অনুমান, প্রযুক্তিগত ঝুঁকি, সুবিধা এবং রেফারেন্সের তথ্য স্পষ্টভাবে উল্লেখিত থাকে।',
    },
    impact: {
      badge: 'জাতীয় ও বৈশ্বিক প্রভাব',
      title: 'পরিচ্ছন্ন জ্বালানি রূপান্তরে সহায়ক',
      subtitle: 'পরিকল্পনাবিদ, বাণিজ্যিক প্রতিষ্ঠান ও সাধারণ নাগরিকদের জন্য নির্ভরযোগ্য সৌর বিশ্লেষণ।',
      bdTitle: 'বাংলাদেশের পরিচ্ছন্ন জ্বালানি লক্ষ্যমাত্রা',
      bdDesc: 'ঢাকা, চট্টগ্রাম এবং দেশের অন্যান্য শিল্পাঞ্চলের ছাদগুলোকে কাজে লাগিয়ে জাতীয় গ্রিডের চাপ কমানো।',
      globalTitle: 'আন্তর্জাতিক উপযোগিতা',
      globalDesc: 'বিষুবরেখা থেকে শুরু করে মেরু অঞ্চল পর্যন্ত পৃথিবীর যেকোনো অক্ষাংশ ও দ্রাঘিমাংশে কার্যকর সৌর হিসাব।',
      netMeteringTitle: 'শ্রেডা নেট-মিটারিং সুবিধা',
      netMeteringDesc: 'অনুমোদিত লোডের ৭০% পর্যন্ত নেট-মিটারিং সংযোগের নিয়মাবলীর সাথে সামঞ্জস্য রেখে পরিকল্পনা প্রণয়ন।',
      co2Title: 'কার্বন নিঃসরণ হ্রাস',
      co2Desc: 'পরিবেশ অধিদপ্তরের জাতীয় গ্রিড গুণক (০.৬৩৭ কেজি CO₂/kWh) অনুযায়ী গাছ লাগানো ও যানবাহন চলাচলের সমতুল্য হিসাব।',
    },
    cta: {
      headline: 'আপনার ছাদেই রয়েছে পরিচ্ছন্ন শক্তির সম্ভাবনা।',
      description: 'থ্রি-ডি ছায়া সিমুলেশন, স্বয়ংক্রিয় প্যানেল অপ্টিমাইজেশন এবং এআই উপদেষ্টার মাধ্যমে আজই পরিকল্পনা শুরু করুন।',
      button: 'রূফরে দিয়ে পরিকল্পনা শুরু করুন',
    },
    footer: {
      description: 'রূফরে একটি এআই-চালিত থ্রি-ডি সৌর পরিকল্পনা ও সিমুলেশন প্ল্যাটফর্ম, যা ইন্টারন্যাশনাল এআই বিল্ডার্স কংগ্রেস ২০২৬-এর জন্য নির্মিত।',
      product: 'প্রোডাক্ট',
      documentation: 'ডকুমেন্টেশন',
      community: 'কমিউনিটি',
      disclaimer: 'রূফরে প্রযুক্তিগত সিমুলেশন প্রদান করে। সৌর প্রকল্প বাস্তবায়নের পূর্বে পেশাদার স্ট্রাকচারাল অডিট ও বিদ্যুৎ বিতরণ কর্তৃপক্ষের অনুমতি আবশ্যক।',
      copyright: 'রূফরে (RoofRay)। এআই বিল্ডার্স কংগ্রেস ২০২৬-এর জন্য নির্মিত। সর্বস্বত্ব সংরক্ষিত।',
      github: 'গিটহাব রিপোজিটরি',
      footerFeatures: 'বৈশিষ্ট্যসমূহ',
      footerWorkflow: 'কীভাবে কাজ করে',
      footerAiTech: 'এআই আর্কিটেকচার',
      footerGithub: 'গিটহাব রিপোজিটরি',
      targetTrack: 'লক্ষ্য ট্র্যাক: আইডিয়া টু ইউনিকর্ন • ক্লাইমেটস্ফিয়ার এআই',
    },
    app: {
      plannerTab: 'প্ল্যানার',
      manualTab: 'ম্যানুয়াল স্টুডিও',
      analyticsTab: 'অর্থনীতি',
      rationaleTab: 'কেন প্ল্যান করবেন',
      aiAdvisorTab: 'এআই উপদেষ্টা',
      illustrativeNotice: 'দৃষ্টান্তমূলক মডেল: থ্রি-ডি ভবনগুলো রে-কাস্টিং পরীক্ষার জন্য সিমুলেটেড আর্কিটাইপ। শহর নির্বাচনে সূর্যের পথ ও রোদ আপডেট হয়।',
      weatherInformedBadge: 'নাসা পাওয়ার ওয়েদার ডেটা',
      clearSkyBadge: 'ক্লিয়ার-স্কাই রে-কাস্টিং',
      currencyToggle: 'মুদ্রা',
      tariffLabel: 'বিদ্যুৎ ট্যারিফ',
      costPerKWLabel: 'টার্নকি খরচ / কিলোওয়াট',
      paybackLabel: 'বিনিয়োগ ওঠার সময়',
      systemCostLabel: 'মোট ক্যাপিটাল খরচ',
      annualSavingsLabel: 'বার্ষিক বিল সাশ্রয়',
      co2OffsetLabel: 'বার্ষিক কার্বন হ্রাস',
      exportReport: 'সোলার রিপোর্ট ডাউনলোড',
    },
    locationTime: {
      title: 'জ্যোতির্বিজ্ঞান অবস্থান ও সময়',
      cityPreset: 'শহর নির্বাচন',
      dateTime: 'তারিখ ও সময়',
      sunPosition: 'সূর্যের অবস্থান (নোয়া)',
      elevation: 'উন্নতি কোণ',
      azimuth: 'দিক কোণ',
      solarNoon: 'সৌর দুপুর',
      sunriseSunset: 'সূর্যোদয় / সূর্যাস্ত',
      summerSolstice: 'গ্রীষ্মের দীর্ঘতম দিন',
      winterSolstice: 'শীতের ক্ষুদ্রতম দিন',
      equinox: 'বিষুব (দিন-রাত সমান)',
      customCoordinates: 'কাস্টম স্থানাঙ্ক',
      latitude: 'অক্ষাংশ (°উ)',
      longitude: 'দ্রাঘিমাংশ (°পূ)',
      timezone: 'সময় অঞ্চল',
      apply: 'স্থানাঙ্ক প্রয়োগ করুন',
      diurnalPlayback: '২৪ ঘণ্টার সৌর সিমুলেশন',
      speed: 'গতিবেগ',
      simple: 'সহজ',
      bdDivisionsLabel: '🇧🇩 বাংলাদেশ বিভাগসমূহ (যাচাইকৃত স্থানাঙ্ক)',
      globalSitesLabel: '🌐 বৈশ্বিক ও রেফারেন্স সাইট',
      customLocation: 'কাস্টম অবস্থান',
      simulatedArchetypeNotice: 'সিমুলেটেড আর্কিটাইপ: বর্তমান ৩ডি ভবনগুলি রে-কাস্ট শেডিং বিশ্লেষণের জন্য দৃষ্টান্তমূলক জ্যামিতি উপস্থাপন করে। শহর নির্বাচন জ্যোতির্বিজ্ঞান সূর্য স্থানাঙ্ক ও বিকিরণ আপডেট করে।',
      latLabel: 'অক্ষাংশ (-৯০ থেকে +৯০)',
      lonLabel: 'দ্রাঘিমাংশ (-১৮০ থেকে +১৮০)',
      tzLabel: 'আইএএনএ টাইমজোন (ডিএসটি সমর্থন)',
      applyCoordinates: 'কাস্টম স্থানাঙ্ক প্রয়োগ করুন',
    },
    buildingInspector: {
      title: 'ভবন ও ছাদের জ্যামিতি',
      targetBuilding: 'সক্রিয় ভবন',
      dimensions: 'পরিমাপ',
      roofArea: 'ছাদের মোট আয়তন',
      usableArea: 'ব্যবহারযোগ্য আয়তন',
      obstacles: 'ছাদের প্রতিবন্ধকতা',
      setbackNotice: '০.৮ মিটার ফায়ার সেফটি ও ০.৫ মিটার বাধার নিরাপদ দূরত্ব নিশ্চিত।',
      fixedGeometry: 'নির্দিষ্ট জ্যামিতি',
    },
    solarAnalysis: {
      title: 'থ্রি-ডি সৌর ও ছায়া বিশ্লেষণ',
      runAnalysis: 'বার্ষিক সৌর বিশ্লেষণ শুরু করুন',
      analyzing: 'সৌর রশ্মি সিমুলেট হচ্ছে...',
      recommendedArea: 'সুপারিশকৃত এলাকা',
      annualInsolation: 'বার্ষিক সৌর ইনসোলেশন',
      exposureScore: 'গড় সূর্যালোক স্কোর',
      obstacleFootprint: 'বাধার আয়তন',
      nasaClimatology: 'নাসা পাওয়ার স্যাটেলাইট ক্লাইমেটোলজি',
      clearSkyNotice: 'নোয়া সূত্র অনুযায়ী ক্লিয়ার-স্কাই জ্যামিতিক সিমুলেশন।',
      offlineNotice: 'নাসা সার্ভিস অফলাইন। পিউর রে-কাস্টিং চলছে।',
      viewHeatmap: 'সৌর হিটম্যাপ পরিবর্তন',
      rerunAnalysis: 'বার্ষিক বিশ্লেষণ পুনরায় চালান',
      reanalyzePotential: 'সৌর সম্ভাবনা পুনরায় বিশ্লেষণ করুন',
      analyzingProgress: '১২ মাসের বিশ্লেষণ চলছে',
      cancel: 'বাতিল',
      webWorkerTitle: 'ওয়েব ওয়ার্কার সৌর সিমুলেশন',
      webWorkerDesc: '১২টি প্রতিনিধিত্বমূলক দিন ও ক্লিয়ার-স্কাই বিকিরণ মডেলে অফ-থ্রেড রে-কাস্টিং।',
      roofSuitability: 'ছাদের সৌর উপযোগিতা',
      clearSkyEstimate: 'পরিষ্কার আকাশ অনুমান',
      viable: 'কার্যোপযোগী',
      monthlyInsolation: 'মাসিক সৌর বিকিরণ (kWh/m²)',
      clickBarInspect: '৩ডি ছাদের হিটম্যাপে সেই মাসটি পরীক্ষা করতে যেকোনো বারে ক্লিক করুন।',
      satelliteClimatology: 'স্যাটেলাইট জলবায়ু সম্পদ (নাসা পাওয়ার)',
      allSkyInsolation: 'অল-স্কাই সৌর বিকিরণ',
      cloudAttenuation: 'মেঘের বাধা (হ্রাস)',
      weatherInformedYield: 'আবহাওয়া-নির্ভর উৎপাদন অনুমান',
      sourceDistinctionNotice: 'উৎস ও পার্থক্য বিজ্ঞপ্তি:',
      bestContiguousZone: 'সেরা অবিচ্ছিন্ন স্থাপন অঞ্চল',
    },
    panelConfig: {
      title: 'পিভি মডিউল স্পেসিফিকেশন',
      moduleSpec: 'মডিউল নির্বাচন',
      wattage: 'উৎপাদন ক্ষমতা',
      dimensions: 'পরিমাপ',
      efficiency: 'কার্যক্ষমতা',
      warranty: 'ওয়ারেন্টি',
      tiltAngle: 'টিল্ট কোণ (°)',
      orientation: 'দিক বিন্যাস',
      portrait: 'লম্বালম্বি (Portrait)',
      landscape: 'আড়াআড়ি (Landscape)',
    },
    energyDemand: {
      title: 'বিদ্যুতের চাহিদা ও ব্যবহার',
      monthlyConsumption: 'মাসিক চাহিদা',
      annualConsumption: 'বার্ষিক চাহিদা',
      installedCapacity: 'সিস্টেম ক্যাপাসিটি',
      annualGeneration: 'বার্ষিক উৎপাদন',
      gridCoverage: 'গ্রিড বিদ্যুৎ সাশ্রয়',
      surplusExport: 'গ্রিডে উদ্বৃত্ত বিদ্যুৎ',
    },
    optimization: {
      title: 'প্যানেল বিন্যাস অপ্টিমাইজেশন',
      mode: 'অপ্টিমাইজেশনের লক্ষ্য',
      balanced: 'ভারসাম্যপূর্ণ / সেরা মান',
      balancedDesc: 'খরচ ও সর্বোচ্চ উৎপাদনের মধ্যে সমন্বয় রেখে সেরা স্থানে প্যানেল বসায়।',
      maxGeneration: 'সর্বোচ্চ উৎপাদন',
      maxGenerationDesc: 'ছাদের সর্বোচ্চ রোদযুক্ত অংশে সর্বাধিক সংখ্যক প্যানেল স্থাপন করে।',
      lowestCost: 'সর্বনিম্ন প্রাথমিক খরচ',
      lowestCostDesc: 'কম খরচে বেশি রিটার্ন নিশ্চিত করে প্রয়োজনীয় সংখ্যক প্যানেল বসায়।',
      meetDemand: 'চাহিদা অনুযায়ী সাজান',
      meetDemandDesc: 'ব্যবহারকারীর মাসিক চাহিদার প্রায় ১০০% পূরণ উপযোগী সিস্টেম সাজায়।',
      runOptimization: 'স্বয়ংক্রিয় বিন্যাস তৈরি',
      optimizing: 'বিন্যাস অপ্টিমাইজ হচ্ছে...',
      clearPanels: 'প্যানেল মুছুন',
    },
    manualLayout: {
      title: 'ম্যানুয়াল স্টুডিও',
      clickToPlace: 'প্যানেল বসাতে বা সরাতে ছাদের ফাঁকা গ্রিডে ক্লিক করুন।',
      tools: 'নিয়ন্ত্রণ টুলসমূহ',
      rotate: 'ঘোরান (Q/E)',
      undo: 'পূর্বাবস্থায় (Ctrl+Z)',
      redo: 'পুনরায় (Ctrl+Y)',
      delete: 'মুছুন (Del)',
      fillZone: 'অঞ্চল পূর্ণ করুন',
      collisionWarning: 'প্যানেল অন্য প্যানেল বা ছাদের বাধার উপর পড়েছে।',
      setbackWarning: 'প্যানেল ০.৮ মিটার ফায়ার সেফটি সীমানা অতিক্রম করেছে।',
    },
    financialSummary: {
      title: 'আর্থিক ফলাফল ও অর্থনীতি',
      currency: 'মুদ্রা',
      capex: 'আনুমানিক টার্নকি খরচ',
      annualSavings: 'বার্ষিক বিল সাশ্রয়',
      payback: 'বিনিয়োগ ওঠার সময়কাল',
      twentyYearNet: '২০ বছরের নিট লাভ',
      roi: 'রিটার্ন অন ইনভেস্টমেন্ট',
      carbonAbated: 'কার্বন নিঃসরণ হ্রাস',
      assumptionsToggle: 'আর্থিক ও নির্গমন অনুমানসমূহ',
      electricityTariff: 'বিদ্যুৎ ট্যারিফ',
      costPerKW: 'টার্নকি খরচ / কিলোওয়াট',
      baseCost: 'বেস ইন্টারকানেকশন ফি',
      exportCredit: 'রপ্তানি ক্রেডিট হার (% অফ ট্যারিফ)',
      emissionFactor: 'গ্রিড কার্বন নির্গমন গুণক',
      resetDefaults: 'ডিফল্ট রিসেট',
      disclaimer: 'হিসাবসমূহ সিমুলেশন মডেলের উপর ভিত্তি করে তৈরি এবং বাস্তব কাজের চুক্তিনামা নয়।',
    },
    aiAdvisor: {
      title: 'এআই সোলার ইঞ্জিনিয়ারিং উপদেষ্টা',
      subtitle: 'পদার্থবিজ্ঞান-ভিত্তিক থ্রি-ডি রে-কাস্টিং এবং শ্রেডা/বিপিডিবি নির্দেশিকা আশ্রিত।',
      promptPlaceholder: 'নির্দিষ্ট প্রশ্ন করুন (যেমন: নেট-মিটারিং সীমা, ঢাকার পেব্যাক সময়কাল, ছায়া হ্রাস)...',
      generateEvaluation: 'এআই মূল্যায়ন রিপোর্ট তৈরি করুন',
      generating: 'পেশাদার পরামর্শ তৈরি হচ্ছে...',
      keyNotConfigured: 'সার্ভারে জেমিনাই (Gemini) এআই কী কনফিগার করা নেই।',
      setupGuide: 'aistudio.google.com থেকে বিনামূল্যে এআই কী নিয়ে .env ফাইলে GEMINI_API_KEY যুক্ত করুন।',
      ragCitations: 'যাচাইকৃত রেফারেন্স ও নির্দেশিকা',
      summary: 'নির্বাহী সারাংশ',
      recommendations: 'প্রকৌশল ও লেআউট সুপারিশ',
      advantages: 'সিস্টেমের মূল সুবিধাসমূহ',
      risks: 'ছায়াজনিত ও প্রযুক্তিগত ঝুঁকি',
      assumptions: 'প্রকৌশল ও আর্থিক অনুমানসমূহ',
      nextSteps: 'পরবর্তী কার্যকর পদক্ষেপ',
      quickPrompt1: 'আমার ছাদের সৌর কার্যক্ষমতা ও পে-ব্যাক বিশ্লেষণ করুন',
      quickPrompt2: 'কাছের টাওয়ার বা বাধার ছায়া কি উৎপাদনে ক্ষতি করবে?',
      quickPrompt3: 'বাংলাদেশের জন্য স্রেডা ৭০% নেট-মিটারিং সীমা যাচাই করুন',
      quickPrompt4: 'অনুকূল প্যানেল ওরিয়েন্টেশন এবং সুরক্ষা সেটব্যাকের পরামর্শ দিন',
      selectBuildingPrompt: 'একটি ভবন নির্বাচন করুন',
      selectBuildingDesc: 'এআই উপদেষ্টার সাথে পরামর্শ করতে প্ল্যানার ট্যাবে একটি ছাদ নির্বাচন করুন।',
      fullReport: 'সম্পূর্ণ রিপোর্ট',
      consultationError: 'পরামর্শ ত্রুটি',
      keySetupRequired: 'জেমিনি এপিআই কি সেটআপ প্রয়োজন',
      keySetupDesc: 'গোপন তথ্য সুরক্ষার জন্য এআই সোলার অ্যাডভাইজার সার্ভার-সাইডে চলে। গুগল জেমিনি থেকে লাইভ উত্তর পেতে:',
      executiveSummary: 'কার্যনির্বাহী উপদেষ্টা সংশ্লেষণ',
      engineeringRecommendations: 'প্রকৌশলগত সুপারিশমালা',
      keyAdvantages: 'প্রধান সুবিধাসমূহ',
      risksLimitations: 'ঝুঁকি ও সীমাবদ্ধতা',
      citationsGrounding: 'প্রযুক্তিগত ও নীতিগত তথ্যসূত্র',
    },
    solarReportModal: {
      title: 'রূফরে সৌর সম্ভাব্যতা ও প্রকৌশল রিপোর্ট',
      downloadPdf: 'প্রিন্ট / পিডিএফ সংরক্ষণ',
      copyJson: 'অডিট JSON কপি',
      close: 'বন্ধ করুন',
      executiveSummary: 'নির্বাহী সারাংশ',
      technicalHighlights: 'প্রযুক্তিগত বৈশিষ্ট্যসমূহ',
      financialProjection: 'আর্থিক প্রাক্কলন',
      environmentalImpact: 'পরিবেশগত স্থায়িত্ব',
      disclaimer: 'বিজ্ঞপ্তি: এই প্রতিবেদনটি রূফরে সিমুলেশন ইঞ্জিন দ্বারা তৈরিকৃত। ক্রয়ের পূর্বে অন-সাইট কাঠামোগত জরিপ প্রয়োজন।',
    },
    demoTour: {
      title: 'রূফরে গাইডেড ট্যুর',
      next: 'পরবর্তী',
      previous: 'পূর্ববর্তী',
      finish: 'ট্যুর সম্পন্ন',
      exit: 'ট্যুর বন্ধ করুন',
    },
    common: {
      loading: 'লোড হচ্ছে...',
      error: 'ত্রুটি',
      success: 'সফল',
      meters: 'মিটার',
      sqMeters: 'বর্গমিটার',
      sqFeet: 'বর্গফুট',
      years: 'বছর',
      kwh: 'কিলোওয়াট-ঘণ্টা',
      kw: 'কিলোওয়াট',
      tonnesCO2: 'টন CO₂/বছর',
    },
  },
};
