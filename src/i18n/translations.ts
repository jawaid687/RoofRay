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
    guideHelp: string;
    exportReport: string;
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
    problemPrefix: string;
    solutionPrefix: string;
    problemBadge: string;
    solutionBadge: string;
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
  controlPanel: {
    locationHeader: string;
    buildingHeader: string;
    analysisHeader: string;
    panelsHeader: string;
    demandHeader: string;
    optimizationHeader: string;
    section1: string;
    section2: string;
    section3: string;
    section4: string;
    section5: string;
    section6: string;
    engineeringAssumptions: string;
    assumptionsDesc: string;
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
    cardinalNorth: string;
    cardinalNorthEast: string;
    cardinalEast: string;
    cardinalSouthEast: string;
    cardinalSouth: string;
    cardinalSouthWest: string;
    cardinalWest: string;
    cardinalNorthWest: string;
    springEquinoxBtn: string;
    summerSolsticeBtn: string;
    autumnEquinoxBtn: string;
    winterSolsticeBtn: string;
    playYearBtn: string;
    pauseYearBtn: string;
    playDayBtn: string;
    pauseDayBtn: string;
    speedPrefix: string;
    localTimeOfDay: string;
    polarDayBadge: string;
    polarNightBadge: string;
    daylightBadge: string;
    civilTwilightBadge: string;
    nightBadge: string;
    riseMarker: string;
    setMarker: string;
    astronomicalReadout: string;
    utcPrefix: string;
    solarElevationTitle: string;
    geomSuffix: string;
    solarAzimuthTitle: string;
    sunriseSunsetTitle: string;
    solarNoonDayLenTitle: string;
    sunNeverSets: string;
    sunNeverRises: string;
    dayLenHoursMinutes: string;
    heatmapModeTitle: string;
    roofLitNow: string;
    liveMode: string;
    annualMode: string;
    monthlyMode: string;
    selectMonthLabel: string;
    litCellsLabel: string;
    shadedCellsLabel: string;
    obstaclesCellsLabel: string;
    months: string[];
    monthsShort: string[];
    cardinalDirections: {
      North: string;
      'North-East': string;
      East: string;
      'South-East': string;
      South: string;
      'South-West': string;
      West: string;
      'North-West': string;
    };
    seasonPresets: {
      springEquinox: string;
      summerSolstice: string;
      autumnEquinox: string;
      winterSolstice: string;
      mar20: string;
      jun21: string;
      sep22: string;
      dec21: string;
    };
    pauseAnnual: string;
    playYear: string;
    pauseDay: string;
    playDay: string;
    daylight: string;
    civilTwilight: string;
    night: string;
    solarElevation: string;
    solarAzimuth: string;
    solarNoonDayLen: string;
    selectMonth: string;
    monthNames: string[];
    monthNamesShort: string[];
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
    noBuildingSelected: string;
    widthX: string;
    lengthZ: string;
    heightY: string;
    worldPosition: string;
    obstacleBufferLabel: string;
    noObstacles: string;
    hvacType: string;
    waterTankType: string;
    stairwellType: string;
    parapetType: string;
    buffer05m: string;
    obstacleTypes: {
      hvac: string;
      water_tank: string;
      stairwell: string;
      parapet: string;
      [key: string]: string;
    };
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
    excShort: string;
    goodShort: string;
    shadedShort: string;
    obsShort: string;
    inspectToggle: string;
    hideToggle: string;
    queryingNasa: string;
    nasaOfflineTitle: string;
    nasaOfflineDesc: string;
    subtextRecommendedArea: string;
    subtextAnnualInsolation: string;
    subtextExposureScore: string;
    subtextObstacleFootprint: string;
    contiguousZoneDesc: string;
    hide: string;
    inspect: string;
    contiguousZoneSubtext: string;
    clearSkySubtext: string;
    daylightFactorSubtext: string;
    obstacleSubtext: string;
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
    demoConfigBadge: string;
    effLabel: string;
    perModule: string;
    activeModulesLabel: string;
    maxPossibleSuffix: string;
    demoConfigs: string;
    activeModules: string;
    max: string;
  };
  energyDemand: {
    title: string;
    monthlyConsumption: string;
    annualConsumption: string;
    installedCapacity: string;
    annualGeneration: string;
    gridCoverage: string;
    surplusExport: string;
    apartment: string;
    townhouse: string;
    familyHome: string;
    commercial: string;
    presetsLabel: string;
    kwhPerMonth: string;
    kwhPerYear: string;
    presets: {
      apartment: string;
      townhouse: string;
      familyHome: string;
      commercial: string;
    };
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
    strategyBadge: string;
    demandMatchBadge: string;
    maxYieldBadge: string;
    budgetCapexBadge: string;
    recommendedBadge: string;
    prerequisiteTitle: string;
    prerequisiteDesc: string;
    layoutOutdatedTitle: string;
    layoutOutdatedDesc: string;
    regenerateLayout: string;
    reoptimizeLayout: string;
    layoutSuccessTitle: string;
    layoutSuccessFeedback: string;
    badges: {
      demandMatch: string;
      maxYield: string;
      budgetCapex: string;
      recommended: string;
    };
    outdatedTitle: string;
    outdatedDesc: string;
    layoutGeneratedSuccess: string;
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
    selectMove: string;
    placePanel: string;
    gridSnapBadge: string;
    delButton: string;
    clearButton: string;
    smartPlacementTitle: string;
    hideSpots: string;
    showBestSpots: string;
    smartPlacementDesc: string;
    suggestNextPanel: string;
    arraySummaryTitle: string;
    modulesCount: string;
    totalCapacityLabel: string;
    avgExposureLabel: string;
    stringMismatchWarningTitle: string;
    stringMismatchNotice: string;
    selectedPanelTitle: string;
    deselectBtn: string;
    localPositionLabel: string;
    orientationLabel: string;
    annualExposureLabel: string;
    annualGenerationLabel: string;
    shortcutsTitle: string;
    rotateShortcut: string;
    removeShortcut: string;
    undoShortcut: string;
    redoShortcut: string;
    selectAllShortcut: string;
    dragShortcut: string;
    selectBuildingPrompt: string;
    gridSnap: string;
    clearAll: string;
    smartSolarPlacement: string;
    smartSolarDesc: string;
    suggestNext: string;
    rooftopArraySummary: string;
    moduleSingular: string;
    modulePlural: string;
    totalCapacity: string;
    avgExposure: string;
    stringMismatchTitle: string;
    lowExposureWarning: string;
    mismatchWarning: string;
    selectedPanel: string;
    deselect: string;
    localPosition: string;
    annualExposure: string;
    annualGeneration: string;
    rotate90: string;
    removePanel: string;
    undoAction: string;
    redoAction: string;
    selectAllAction: string;
    moveSlotAction: string;
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
    projectionsUnavailableTitle: string;
    projectionsUnavailableDesc: string;
    goToPlanner: string;
    layoutOutdatedTitle: string;
    layoutOutdatedDesc: string;
    activeModulesSubtext: string;
    capacityFactorSubtext: string;
    turnkeyInstallSubtext: string;
    tariffSubtext: string;
    twentyYearNetSubtext: string;
    treesPlantedSubtext: string;
    demandCoverageTitle: string;
    generationLabel: string;
    demandLabel: string;
    gridExportNotice: string;
    netMeteringCreditNotice: string;
    hideToggle: string;
    configureToggle: string;
    electricityTariffInputLabel: string;
    turnkeyCostInputLabel: string;
    basePermittingInputLabel: string;
    exportCreditInputLabel: string;
    gridEmissionInputLabel: string;
    flatTariffDesc: string;
    benchmarkDesc: string;
    interconnectionFeeDesc: string;
    exportPolicyDesc: string;
    emissionFactorDesc: string;
    assumptionsDisclosureTitle: string;
    flatTariffDisclosure: string;
    simplifiedPaybackDisclosure: string;
    netMeteringDisclosure: string;
    simulationEstimateDisclosure: string;
    sourcePrefix: string;
    engineeringAssumptionsTitle: string;
    engineeringAssumptionsText: string;
    emptyTitle: string;
    emptyDesc: string;
    outdatedTitle: string;
    outdatedDesc: string;
    atTariffSubtext: string;
    years: string;
    demandCoverage: string;
    gridExportLabel: string;
    netMeteringCreditLabel: string;
    wholesaleRateLabel: string;
    hideConfig: string;
    showConfig: string;
    basePermitFee: string;
    exportCreditRate: string;
    gridEmissionFactor: string;
    disclosuresTitle: string;
    paybackDisclosure: string;
  };
  recommendation: {
    emptyTitle: string;
    emptyDesc: string;
    goToPlanner: string;
    outdatedTitle: string;
    outdatedDesc: string;
    systemRecommendationTitle: string;
    keySelectionFactors: string;
    spatialExclusionsTitle: string;
    installationComplianceTitle: string;
    noPlanTitle: string;
    noPlanDesc: string;
    systemRecommendation: string;
    keyFactors: string;
    spatialExclusions: string;
    technicalCompliance: string;
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
    welcomeTitle: string;
    welcomeDesc: string;
    suggestedViability: string;
    suggestedPlacement: string;
    suggestedShading: string;
    suggestedPayback: string;
    suggestedNetMetering: string;
    suggestedOrientation: string;
    suggestedUsRegs: string;
    suggestedUsInterconnect: string;
    suggestedBdNetMetering: string;
    suggestedBdBPDB: string;
    suggestedAuRegs: string;
    suggestedUkRegs: string;
    financialDisclosure: string;
    financialDisclosureText: string;
    annualEnergyCoverage: string;
    expandChat: string;
    collapseChat: string;
    chatInputPlaceholder: string;
    analyzing: string;
    newChat: string;
    clearChat: string;
    clearConfirm: string;
    copy: string;
    copied: string;
    retry: string;
    scrollToBottom: string;
    expandWorkspace: string;
    collapseWorkspace: string;
    activeBuildingBadge: string;
    inquiryLocationBadge: string;
    followUpBd1: string;
    followUpBd2: string;
    followUpBd3: string;
    followUpUs1: string;
    followUpUs2: string;
    followUpUs3: string;
    followUpGeneral1: string;
    followUpGeneral2: string;
    followUpGeneral3: string;
    panels: string;
    sun: string;
    notAnalyzed: string;
    annualCoverage: string;
    startNewChat: string;
    clearConversation: string;
    groundedNotice: string;
    singleSourceOfTruth: string;
    locationQuestions: string;
    advantagesRisksTitle: string;
    advantagesTitle: string;
    risksTitle: string;
    financialPerformanceTitle: string;
    totalCapitalCost: string;
    annualBillSavings: string;
    estimatedPayback: string;
    twentyYearNetBenefit: string;
    projectRoi: string;
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
    simulationEstimateBadge: string;
    dateLabel: string;
    copiedLabel: string;
    systemSizeLabel: string;
    annualYieldLabel: string;
    turnkeyCapexLabel: string;
    simplePaybackLabel: string;
    includesInstallSubtext: string;
    demandOffsetSubtext: string;
    annualSavingsSubtext: string;
    rooftopLocationProfileTitle: string;
    targetBuildingLabel: string;
    totalRoofDimensionsLabel: string;
    gridResolutionLabel: string;
    astronomicalSiteLabel: string;
    solarPVTechLayoutTitle: string;
    selectedPanelTypeLabel: string;
    totalInstalledPanelsLabel: string;
    perimeterSetbackLabel: string;
    obstacleBufferLabel: string;
    azimuthOrientationLabel: string;
    environmentalDecarbImpactTitle: string;
    co2AbatementLabel: string;
    treeEquivalenceLabel: string;
    verifiedEmissionFactorLabel: string;
    officialSourceLabel: string;
    executiveRecommendationTitle: string;
    engineeringNoteLabel: string;
    statutoryDisclaimersTitle: string;
    disclaimerFullText: string;
    simulationEstimate: string;
    copied: string;
    systemSize: string;
    solarModules: string;
    annualYield: string;
    demandOffset: string;
    turnkeyCapex: string;
    includesInstallation: string;
    simplePayback: string;
    years: string;
    rooftopProfile: string;
    targetBuilding: string;
    totalRoofDimensions: string;
    raycastResolution: string;
    astronomicalSite: string;
    utilityTimezone: string;
    decarbonizationBenefit: string;
    annualCO2Offset: string;
    tonnesPerYear: string;
    seedlingTrees: string;
    treesEquivalent: string;
    vehicleMiles: string;
    gridEmissionFactor: string;
    legalNoticeTitle: string;
    dataSources: string;
    ephemerisRadiation: string;
    regulatoryTariffs: string;
    disclaimerText: string;
  };
  demoTour: {
    title: string;
    next: string;
    previous: string;
    finish: string;
    exit: string;
    stepOf: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    step5: string;
    step6: string;
    step: string;
  };
  heatmapLegend: {
    livePass: string;
    annualExposure: string;
    monthlyInsolation: string;
    instantRaycast: string;
    clearSkyEstimate: string;
    litBySun: string;
    inShadow: string;
    rooftopObstacle: string;
    unobstructed: string;
    occluded: string;
    blocked: string;
    monthlyAvg: string;
    runAnalysisPrompt: string;
    shadedLow: string;
    moderate: string;
    peakSun: string;
    annualAvg: string;
    excellentExposure: string;
    goodExposure: string;
    poorExposure: string;
    liveShadingPass: string;
    insolation: string;
    runAnalysis: string;
    annualAverage: string;
    poorShaded: string;
    obstacleZone: string;
    recommendedZone: string;
  };
  viewportControls: {
    noaaSunModel: string;
    elevLabel: string;
    azLabel: string;
    jumpSunrise: string;
    jumpNoon: string;
    jumpSunset: string;
    risePrefix: string;
    noonPrefix: string;
    setPrefix: string;
    liveShadingLabel: string;
    annualLabel: string;
    heatmapLabel: string;
    shadowsLabel: string;
    sunPathLabel: string;
    compassLabel: string;
    playDayTitle: string;
    pauseDayTitle: string;
    playYearTitle: string;
    pauseYearTitle: string;
    speedPrefix: string;
    pause: string;
    playDay: string;
    playYear: string;
    elev: string;
    az: string;
    rise: string;
    noon: string;
    set: string;
    liveShading: string;
    annual: string;
    heatmap: string;
    shadows: string;
    sunPath: string;
    compass: string;
  };
  cameraGuidance: {
    heading: string;
    message: string;
    fitFullModel: string;
    gotIt: string;
  };
  guideHelp: {
    title: string;
    subtitle: string;
    button: string;
    close: string;
    cameraGuide: string;
    cameraDesc: string;
    plannerGuide: string;
    plannerDesc: string;
    manualGuide: string;
    manualDesc: string;
    economicsGuide: string;
    economicsDesc: string;
    advisorGuide: string;
    advisorDesc: string;
    whyPlanGuide: string;
    whyPlanDesc: string;
    startGuide: string;
    completed: string;
  };
  tourUI: {
    next: string;
    back: string;
    skip: string;
    finish: string;
    stepOf: string;
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
      guideHelp: 'Guide & Help',
      exportReport: 'Report',
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
      problemPrefix: 'Problem',
      solutionPrefix: 'RoofRay Solution',
      problemBadge: 'Problem',
      solutionBadge: 'RoofRay Solution',
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
      subtitle: 'From astronomical solar modeling to bankable investment advisory in four cohesive steps.',
      step1Title: '1. Select Location & Roof',
      step1Desc: 'Choose from 8 Bangladesh divisions or global coordinate presets. Inspect 3D roof dimensions and obstacles.',
      step2Title: '2. Simulate Sun & Shadows',
      step2Desc: 'Execute 0.8m grid raycasting across 12 monthly sun vectors to map unshaded solar harvest zones.',
      step3Title: '3. Optimize Panel Layout',
      step3Desc: 'Generate automated panel arrangements matching energy demand, maximizing yield, or minimizing initial CapEx.',
      step4Title: '4. Analyze ROI & Consult AI',
      step4Desc: 'Review transparent financial returns, payback timelines, and consult the grounded AI Solar Advisor.',
    },
    aiTech: {
      badge: 'Responsible AI Architecture',
      title: 'Physics-Grounded Solar Intelligence',
      subtitle: 'Our AI Solar Advisor never guesses engineering numbers; it interprets verified physical calculations with regulatory grounding.',
      groundingTitle: 'Deterministic Physics Grounding',
      groundingDesc: 'Solar raycasting, NOAA sun ephemeris, and physical panel derating establish an unalterable single source of truth.',
      ragTitle: 'Regulatory RAG Retrieval',
      ragDesc: 'Synthesizes recommendations using official SREDA Net Metering Guidelines 2025 and BPDB utility tariffs.',
      deterministicTitle: 'Single Source of Truth',
      deterministicDesc: 'All numerical outputs (kW, kWh, BDT/USD, payback) originate from deterministic algorithms, not generative hallucinations.',
      noHallucinationTitle: 'Explainable Advice & Citations',
      noHallucinationDesc: 'Every AI advisory card cites authoritative technical publications and provides transparent assumptions.',
    },
    impact: {
      badge: 'National & Global Impact',
      title: 'Accelerating Clean Energy Adoption',
      subtitle: 'Empowering urban planners, commercial real estate developers, and homeowners with bankable solar insights.',
      bdTitle: 'Bangladesh Clean Energy Vision',
      bdDesc: 'Supporting national renewable energy targets across Dhaka, Chattogram, and regional industrial rooftop corridors.',
      globalTitle: 'Universal Geographic Engine',
      globalDesc: 'NOAA ephemeris engine computes precise sun vectors for any latitude and longitude from the equator to polar zones.',
      netMeteringTitle: 'SREDA Net-Metering Compliance',
      netMeteringDesc: 'Pre-configured with SREDA 2025 guidelines: 100% sanctioned load cap, 80% transformer limit, and phase matching.',
      co2Title: 'Verifiable Carbon Abatement',
      co2Desc: 'Calculated using official Department of Environment grid emission factors (0.62 kg CO2/kWh for Bangladesh).',
    },
    cta: {
      headline: 'Ready to Discover Your Rooftop Solar Potential?',
      description: 'Experience real-time 3D solar simulation, automated layout optimization, and grounded engineering advisory.',
      button: 'Launch RoofRay Studio',
    },
    footer: {
      description: 'RoofRay is an AI-powered 3D solar rooftop planning and simulation platform developed for the International AI Builders Congress 2026.',
      product: 'Product',
      documentation: 'Documentation',
      community: 'Community',
      disclaimer: 'RoofRay provides engineering simulation estimates. Commercial procurement requires professional on-site structural engineering verification and utility interconnection approval.',
      copyright: 'RoofRay. Built for the International AI Builders Congress 2026. All rights reserved.',
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
      illustrativeNotice: 'Illustrative Archetypes: 3D buildings provide demonstration geometry for raycast testing. Choosing a city updates true sun coordinates.',
      weatherInformedBadge: 'NASA POWER Satellite Data',
      clearSkyBadge: 'Clear-Sky Raycasting',
      currencyToggle: 'Currency',
      tariffLabel: 'Electricity Tariff',
      costPerKWLabel: 'Turnkey Cost / kW',
      paybackLabel: 'Simple Payback',
      systemCostLabel: 'Total System Cost',
      annualSavingsLabel: 'Annual Bill Savings',
      co2OffsetLabel: 'Annual CO2 Abatement',
      exportReport: 'Download Solar Report',
    },
    controlPanel: {
      locationHeader: '1. Location, Time & Sun Ephemeris',
      buildingHeader: '2. Selected Building & Roof Geometry',
      analysisHeader: '3. Raycast Sunlight & Shading Analysis',
      panelsHeader: '4. Solar Panel Hardware Configuration',
      demandHeader: '5. Electricity Consumption Target',
      optimizationHeader: '6. Optimization Strategy & Layout',
      section1: '1. Location & Sun Simulation',
      section2: '2. Building & Rooftop Inspector',
      section3: '3. Solar Potential Analysis',
      section4: '4. Solar Module Specification',
      section5: '5. Target Electricity Demand',
      section6: '6. Optimization Objective',
      engineeringAssumptions: 'Engineering Assumptions & Rationale',
      assumptionsDesc: 'Calculations utilize deterministic 3D raycasting, NOAA solar position ephemeris, and regional tariff models. All projections represent clear-sky or weather-informed estimates.',
    },
    locationTime: {
      title: 'Astronomical Location & Time',
      cityPreset: 'City Selection',
      dateTime: 'Date & Time',
      sunPosition: 'NOAA Sun Position',
      elevation: 'Elevation Angle',
      azimuth: 'Azimuth Angle',
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
      diurnalPlayback: '24-Hour Diurnal Sun Cycle',
      speed: 'Playback Speed',
      simple: 'Simple',
      bdDivisionsLabel: '🇧🇩 Bangladesh Divisions (Verified Coordinates)',
      globalSitesLabel: '🌐 Global Reference Sites',
      customLocation: 'Custom Location',
      simulatedArchetypeNotice: 'Simulated Archetypes: Current 3D buildings provide illustrative geometry for raycast shading analysis. Selecting a city updates astronomical solar coordinates and insolation.',
      latLabel: 'Latitude (-90 to +90)',
      lonLabel: 'Longitude (-180 to +180)',
      tzLabel: 'IANA Timezone (DST-aware)',
      applyCoordinates: 'Apply Custom Coordinates',
      cardinalNorth: 'North',
      cardinalNorthEast: 'North-East',
      cardinalEast: 'East',
      cardinalSouthEast: 'South-East',
      cardinalSouth: 'South',
      cardinalSouthWest: 'South-West',
      cardinalWest: 'West',
      cardinalNorthWest: 'North-West',
      springEquinoxBtn: '🌸 Mar 20\nEquinox',
      summerSolsticeBtn: '☀️ Jun 21\nSolstice',
      autumnEquinoxBtn: '🍂 Sep 22\nEquinox',
      winterSolsticeBtn: '❄️ Dec 21\nSolstice',
      playYearBtn: 'Play Year (365-Day Cycle)',
      pauseYearBtn: 'Pause Annual Cycle',
      playDayBtn: 'Play Day',
      pauseDayBtn: 'Pause',
      speedPrefix: 'Speed:',
      localTimeOfDay: 'Local Time of Day',
      polarDayBadge: 'Midnight Sun (Polar Day)',
      polarNightBadge: 'Polar Night (0h Sun)',
      daylightBadge: 'Daylight',
      civilTwilightBadge: 'Civil Twilight',
      nightBadge: 'Night',
      riseMarker: 'Rise',
      setMarker: 'Set',
      astronomicalReadout: 'Astronomical Readout',
      utcPrefix: 'UTC:',
      solarElevationTitle: 'Solar Elevation',
      geomSuffix: 'geom',
      solarAzimuthTitle: 'Solar Azimuth',
      sunriseSunsetTitle: 'Sunrise / Sunset',
      solarNoonDayLenTitle: 'Solar Noon / Day Len',
      sunNeverSets: 'Sun never sets (24h)',
      sunNeverRises: 'Sun never rises',
      dayLenHoursMinutes: 'h',
      heatmapModeTitle: 'Heatmap Analysis Mode',
      roofLitNow: 'Roof Lit Now',
      liveMode: 'Live',
      annualMode: 'Annual',
      monthlyMode: 'Monthly',
      selectMonthLabel: 'Select Evaluation Month:',
      litCellsLabel: 'Lit:',
      shadedCellsLabel: 'Shaded:',
      obstaclesCellsLabel: 'Obstacles:',
      months: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ],
      monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      cardinalDirections: {
        North: 'North',
        'North-East': 'North-East',
        East: 'East',
        'South-East': 'South-East',
        South: 'South',
        'South-West': 'South-West',
        West: 'West',
        'North-West': 'North-West',
      },
      seasonPresets: {
        springEquinox: 'Spring Equinox',
        summerSolstice: 'Summer Solstice',
        autumnEquinox: 'Autumn Equinox',
        winterSolstice: 'Winter Solstice',
        mar20: 'Mar 20',
        jun21: 'Jun 21',
        sep22: 'Sep 22',
        dec21: 'Dec 21',
      },
      pauseAnnual: 'Pause Year',
      playYear: 'Play Year',
      pauseDay: 'Pause Day',
      playDay: 'Play Day',
      daylight: 'Daylight',
      civilTwilight: 'Civil Twilight',
      night: 'Night',
      solarElevation: 'Solar Elevation Angle',
      solarAzimuth: 'Solar Azimuth Angle',
      solarNoonDayLen: 'Solar Noon & Day Length',
      selectMonth: 'Select Month',
      monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    },
    buildingInspector: {
      title: 'Building & Roof Geometry',
      targetBuilding: 'Active Building',
      dimensions: 'Dimensions',
      roofArea: 'Total Roof Area',
      usableArea: 'Usable Installation Area',
      obstacles: 'Rooftop Obstacles',
      setbackNotice: '0.8m perimeter fire setback and 0.5m obstacle clearances enforced.',
      fixedGeometry: 'Fixed Geometry',
      noBuildingSelected: 'Select a building in the 3D neighborhood to inspect roof geometry.',
      widthX: 'X (Width)',
      lengthZ: 'Z (Length)',
      heightY: 'Y (Height)',
      worldPosition: 'World Coordinates',
      obstacleBufferLabel: '0.5m safety buffer',
      noObstacles: 'No rooftop obstacles present on this roof.',
      hvacType: 'HVAC Unit',
      waterTankType: 'Water Tank',
      stairwellType: 'Stairwell Access',
      parapetType: 'Roof Parapet',
      buffer05m: '0.5m buffer',
      obstacleTypes: {
        hvac: 'HVAC',
        water_tank: 'Water Tank',
        stairwell: 'Stairwell',
        parapet: 'Parapet',
      },
    },
    solarAnalysis: {
      title: '3D Solar & Shading Analysis',
      runAnalysis: 'Run Annual Solar Analysis',
      analyzing: 'Simulating Solar Raycasting...',
      recommendedArea: 'Recommended Area',
      annualInsolation: 'Annual Solar Insolation',
      exposureScore: 'Average Daylight Score',
      obstacleFootprint: 'Obstacle Footprint',
      nasaClimatology: 'NASA POWER Satellite Climatology',
      clearSkyNotice: 'Pure geometric raycasting simulation using NOAA sun ephemeris.',
      offlineNotice: 'NASA service offline. Pure clear-sky raycasting running with zero interruption.',
      viewHeatmap: 'Switch Heatmap Mode',
      rerunAnalysis: 'Re-run Annual Analysis',
      reanalyzePotential: 'Re-analyze Solar Potential',
      analyzingProgress: 'Analyzing 12 Monthly Sun Vectors',
      cancel: 'Cancel',
      webWorkerTitle: 'Web Worker Solar Raycast Simulation',
      webWorkerDesc: 'Off-thread raycasting across 12 representative monthly solar ephemeris samples.',
      roofSuitability: 'Roof Solar Suitability',
      clearSkyEstimate: 'Clear-Sky Model',
      viable: 'Viable',
      monthlyInsolation: 'Monthly Solar Irradiance (kWh/m²)',
      clickBarInspect: 'Click any monthly bar to inspect the 3D rooftop heatmap for that period.',
      satelliteClimatology: 'Satellite Climatology Resource (NASA POWER)',
      allSkyInsolation: 'All-Sky Solar Irradiance',
      cloudAttenuation: 'Cloud Cover Attenuation',
      weatherInformedYield: 'Weather-Informed Yield Estimate',
      sourceDistinctionNotice: 'Source & Methodology Notice:',
      bestContiguousZone: 'Best Contiguous Installation Zone',
      excShort: 'Exc',
      goodShort: 'Good',
      shadedShort: 'Shaded',
      obsShort: 'Obs',
      inspectToggle: 'Inspect',
      hideToggle: 'Hide',
      queryingNasa: 'Querying NASA POWER satellite irradiance database...',
      nasaOfflineTitle: 'NASA POWER Service Offline / Unavailable',
      nasaOfflineDesc: 'External satellite climatology could not be retrieved. The application continues running pure astronomical clear-sky raycasting simulation with zero interruption.',
      subtextRecommendedArea: 'Contiguous unshaded zone',
      subtextAnnualInsolation: 'Clear-sky estimate',
      subtextExposureScore: '12-month daylight factor',
      subtextObstacleFootprint: 'Physical HVAC & tanks',
      contiguousZoneDesc: 'Identified prime rectangular zone with unobstructed solar exposure.',
      hide: 'Hide',
      inspect: 'Inspect',
      contiguousZoneSubtext: 'Contiguous unshaded zone',
      clearSkySubtext: 'Clear-sky estimate',
      daylightFactorSubtext: '12-month daylight factor',
      obstacleSubtext: 'Physical HVAC & tanks',
    },
    panelConfig: {
      title: 'Solar Panel Hardware Configuration',
      moduleSpec: 'Select Solar Module',
      wattage: 'Rated Wattage',
      dimensions: 'Dimensions',
      efficiency: 'Efficiency',
      warranty: 'Warranty',
      tiltAngle: 'Tilt Angle (°)',
      orientation: 'Array Orientation',
      portrait: 'Portrait (Vertical)',
      landscape: 'Landscape (Horizontal)',
      demoConfigBadge: 'Standard Configurations',
      effLabel: 'Eff',
      perModule: '/module',
      activeModulesLabel: 'Active Modules',
      maxPossibleSuffix: 'max possible',
      demoConfigs: 'Industry Standard Modules',
      activeModules: 'Active Placed Modules',
      max: 'max',
    },
    energyDemand: {
      title: 'Electricity Consumption Target',
      monthlyConsumption: 'Monthly Consumption',
      annualConsumption: 'Annual Demand',
      installedCapacity: 'System Capacity',
      annualGeneration: 'Annual Generation',
      gridCoverage: 'Demand Offset Coverage',
      surplusExport: 'Grid Export Surplus',
      apartment: 'Apartment',
      townhouse: 'Townhouse',
      familyHome: 'Family Home',
      commercial: 'Commercial',
      presetsLabel: 'Consumption Presets',
      kwhPerMonth: 'kWh/month',
      kwhPerYear: 'kWh/year',
      presets: {
        apartment: 'Apartment',
        townhouse: 'Townhouse',
        familyHome: 'Family Home',
        commercial: 'Commercial',
      },
    },
    optimization: {
      title: 'Panel Placement Optimization',
      mode: 'Optimization Strategy',
      balanced: 'Best Value / Balanced',
      balancedDesc: 'Ranks rooftop cells to balance capital budget, energy offset, and optimal yield.',
      maxGeneration: 'Maximum Energy Generation',
      maxGenerationDesc: 'Populates all viable roof area to harvest maximum annual kilowatt-hours.',
      lowestCost: 'Lowest Initial Investment',
      lowestCostDesc: 'Places only the highest-yielding panels to minimize total capital expenditure.',
      meetDemand: 'Demand Matching',
      meetDemandDesc: 'Sizes array to offset approximately 100% of annual electricity consumption.',
      runOptimization: 'Generate Solar Layout',
      optimizing: 'Optimizing Panel Layout...',
      clearPanels: 'Clear Array',
      strategyBadge: 'Strategy',
      demandMatchBadge: 'Demand Match',
      maxYieldBadge: 'Max Yield',
      budgetCapexBadge: 'Budget CapEx',
      recommendedBadge: 'Recommended',
      prerequisiteTitle: 'Analyze the rooftop before generating a solar layout.',
      prerequisiteDesc: 'Raycast solar exposure metrics are required to determine optimal panel placement and exclude shaded roof zones.',
      layoutOutdatedTitle: 'Layout Outdated',
      layoutOutdatedDesc: 'Solar analysis or building settings have changed. Regenerate to update panel placement.',
      regenerateLayout: 'Regenerate Solar Layout',
      reoptimizeLayout: 'Re-optimize Layout',
      layoutSuccessTitle: 'Layout Generated Successfully',
      layoutSuccessFeedback: 'Automated solar layout generated based on selected strategy.',
      badges: {
        demandMatch: 'Demand Match',
        maxYield: 'Max Yield',
        budgetCapex: 'Budget CapEx',
        recommended: 'Recommended',
      },
      outdatedTitle: 'Layout Outdated',
      outdatedDesc: 'Settings changed. Re-run optimization to update layout.',
      layoutGeneratedSuccess: 'Optimized Layout Active',
    },
    manualLayout: {
      title: 'Manual Studio',
      clickToPlace: 'Click on unobstructed roof grid slots to place or adjust solar panels.',
      tools: 'Layout Tools',
      rotate: 'Rotate Panel (Q/E/T)',
      undo: 'Undo (Ctrl+Z)',
      redo: 'Redo (Ctrl+Y)',
      delete: 'Delete Panel (Del)',
      fillZone: 'Fill Selected Zone',
      collisionWarning: 'Panel overlaps an obstacle or another module.',
      setbackWarning: 'Panel violates the 0.8m perimeter safety setback.',
      selectMove: 'Select / Move',
      placePanel: 'Place Panel',
      gridSnapBadge: '0.5m grid snap',
      delButton: 'Del',
      clearButton: 'Clear All',
      smartPlacementTitle: 'Smart Solar Placement',
      hideSpots: 'Hide Spots',
      showBestSpots: 'Show Best Spots',
      smartPlacementDesc: 'Raytraces available rooftop slots ranked by unobstructed annual kilowatt-hours.',
      suggestNextPanel: 'Suggest Next Panel (Greedy Optimal)',
      arraySummaryTitle: 'Rooftop Array Summary',
      modulesCount: 'modules',
      totalCapacityLabel: 'Total Capacity',
      avgExposureLabel: 'Average Exposure',
      stringMismatchWarningTitle: 'String Mismatch Warning:',
      stringMismatchNotice: 'Some modules experience significantly lower exposure due to parapet or obstacle shadows. Consider micro-inverters or relocating affected panels.',
      selectedPanelTitle: 'Selected Panel',
      deselectBtn: 'Deselect',
      localPositionLabel: 'Local Position:',
      orientationLabel: 'Orientation:',
      annualExposureLabel: 'Annual Exposure:',
      annualGenerationLabel: 'Annual Generation:',
      shortcutsTitle: 'Interactive Shortcuts',
      rotateShortcut: 'Rotate 90°',
      removeShortcut: 'Remove panel',
      undoShortcut: 'Undo',
      redoShortcut: 'Redo',
      selectAllShortcut: 'Select all',
      dragShortcut: 'Move slot',
      selectBuildingPrompt: 'Select a building in the 3D scene to start placing solar panels.',
      gridSnap: '0.5m Snap',
      clearAll: 'Clear All Panels',
      smartSolarPlacement: 'Smart Solar Placement',
      smartSolarDesc: 'Analyzes annual exposure and obstacle shadows to pinpoint the most productive unshaded location.',
      suggestNext: 'Place at Best Location',
      rooftopArraySummary: 'Rooftop Array Summary',
      moduleSingular: 'module',
      modulePlural: 'modules',
      totalCapacity: 'Total Capacity',
      avgExposure: 'Avg Exposure',
      stringMismatchTitle: 'String Mismatch Warning',
      lowExposureWarning: '{count} panel(s) have <60% exposure.',
      mismatchWarning: 'panel(s) are >20% below string average. Consider micro-inverters or moving them.',
      selectedPanel: 'Selected Panel',
      deselect: 'Deselect',
      localPosition: 'Local Position',
      annualExposure: 'Annual Exposure',
      annualGeneration: 'Est. Annual Generation',
      rotate90: 'Rotate 90°',
      removePanel: 'Remove',
      undoAction: 'Undo',
      redoAction: 'Redo',
      selectAllAction: 'Select All',
      moveSlotAction: 'Move Slot',
    },
    financialSummary: {
      title: 'Financial Projections & Economics',
      currency: 'Currency',
      capex: 'Turnkey Installation CapEx',
      annualSavings: 'Annual Utility Bill Savings',
      payback: 'Estimated Payback Period',
      twentyYearNet: '20-Year Net Benefit',
      roi: 'Project ROI',
      carbonAbated: 'Annual Carbon Reduction',
      assumptionsToggle: 'Financial & Emission Assumptions',
      electricityTariff: 'Electricity Tariff',
      costPerKW: 'Turnkey Cost / kW',
      baseCost: 'Base Interconnection Fee',
      exportCredit: 'Export Credit Rate (% of tariff)',
      emissionFactor: 'Grid Emission Factor',
      resetDefaults: 'Reset to Defaults',
      disclaimer: 'Calculations represent engineering simulation estimates and do not constitute formal commercial financing agreements.',
      projectionsUnavailableTitle: 'Financial Projections Unavailable',
      projectionsUnavailableDesc: 'Generate a solar layout to view financial projections, capex estimations, payback periods, and utility tariff savings.',
      goToPlanner: 'Go to Rooftop Planner',
      layoutOutdatedTitle: 'Layout Outdated with Current Settings',
      layoutOutdatedDesc: 'Financial projections below reflect the last generated layout. Regenerate in Rooftop Planner to update calculations.',
      activeModulesSubtext: 'active modules',
      capacityFactorSubtext: 'Capacity factor:',
      turnkeyInstallSubtext: 'Turnkey + install',
      tariffSubtext: 'At applied utility tariff',
      twentyYearNetSubtext: '20-Year Net Benefit',
      treesPlantedSubtext: 'trees planted',
      demandCoverageTitle: 'Electricity Demand Coverage',
      generationLabel: 'Generation:',
      demandLabel: 'Demand:',
      gridExportNotice: 'grid export',
      netMeteringCreditNotice: 'Net Metering Credit at applied rollover rate',
      hideToggle: 'Hide',
      configureToggle: 'Configure',
      electricityTariffInputLabel: 'Electricity Tariff',
      turnkeyCostInputLabel: 'Turnkey Cost / kW',
      basePermittingInputLabel: 'Base Permitting & Meter Fee',
      exportCreditInputLabel: 'Export Credit Rate (% of tariff)',
      gridEmissionInputLabel: 'Grid Emission Factor (kg CO2/kWh)',
      flatTariffDesc: 'Flat Tariff Model (Configurable)',
      benchmarkDesc: 'Regional PV Cost Benchmark',
      interconnectionFeeDesc: 'Fixed interconnection and metering expense',
      exportPolicyDesc: 'Net Metering Rollover Policy',
      emissionFactorDesc: 'Verified Grid Emission Factor',
      assumptionsDisclosureTitle: 'Financial Assumptions & Boundaries (Engineering Disclosure):',
      flatTariffDisclosure: 'Flat Tariff Model: Calculations utilize a flat single-rate utility tariff. Progressive multi-slab utility billing structures are not simulated.',
      simplifiedPaybackDisclosure: 'Simplified Payback: Metrics do not model financing interest, cost of capital discount rates, annual PV degradation (~0.5%/yr), or inverter replacement at Year 10–12.',
      netMeteringDisclosure: 'Net-Metering Policy: Applied in accordance with statutory regional regulations (e.g. SREDA Net Metering Guidelines 2025 in Bangladesh).',
      simulationEstimateDisclosure: 'Simulation Estimate: Financial projections are indicative planning models and do not represent guaranteed cash flows.',
      sourcePrefix: 'Source:',
      engineeringAssumptionsTitle: 'Engineering Assumptions',
      engineeringAssumptionsText: 'Calculated assuming peak sun-hours, verified system performance ratio, applicable grid tariff, and turnkey installation benchmark. Self-consumed electricity offsets retail utility tariffs directly.',
      emptyTitle: 'Economics Pending',
      emptyDesc: 'Generate or manually place solar panels on the rooftop to calculate turnkey capital expenditure, annual savings, and payback period.',
      outdatedTitle: 'Projections Need Refresh',
      outdatedDesc: 'Rooftop array layout or financial settings have changed. Re-run optimization or refresh to update projections.',
      atTariffSubtext: 'at tariff',
      years: 'years',
      demandCoverage: 'Demand Coverage',
      gridExportLabel: 'Annual Grid Export',
      netMeteringCreditLabel: 'Net Metering Credit',
      wholesaleRateLabel: 'wholesale rate',
      hideConfig: 'Hide',
      showConfig: 'Configure',
      basePermitFee: 'Base Permitting & Interconnection Fee',
      exportCreditRate: 'Export Credit Buyback Rate (% of retail)',
      gridEmissionFactor: 'Grid Emission Factor (kg CO₂/kWh)',
      disclosuresTitle: 'Engineering & Financial Disclosures',
      paybackDisclosure: 'Simple payback = net system cost ÷ first-year annual electricity savings. Does not account for panel degradation (typically 0.5%/yr) or loan financing interest.',
    },
    recommendation: {
      emptyTitle: 'No solar plan has been generated yet',
      emptyDesc: 'Analyze the rooftop and generate a solar layout to see why RoofRay recommends the configuration.',
      goToPlanner: 'Go to Rooftop Planner',
      outdatedTitle: 'Rationale Reflects Previous Layout',
      outdatedDesc: 'Optimization settings or building dimensions were modified. Regenerate in Rooftop Planner to update the technical rationale.',
      systemRecommendationTitle: 'System Recommendation & Engineering Rationale',
      keySelectionFactors: 'Key Selection Factors',
      spatialExclusionsTitle: 'Spatial Exclusions & Shading Analysis',
      installationComplianceTitle: 'Installation Specifications & Compliance',
      noPlanTitle: 'No Plan Generated Yet',
      noPlanDesc: 'Run the solar optimization in the Planner tab or manually place panels to see engineering rationale.',
      systemRecommendation: 'System Recommendation',
      keyFactors: 'Key Selection Factors',
      spatialExclusions: 'Spatial Exclusions & Shading Analysis',
      technicalCompliance: 'Technical Compliance & Performance Highlights',
    },
    aiAdvisor: {
      title: 'AI Solar Engineering Advisor',
      subtitle: 'Physics-grounded 3D raycast interpretation with SREDA, IEEE, and IEC regulatory grounding.',
      promptPlaceholder: 'Ask specific engineering questions (e.g., net-metering limits, payback period, shading mitigation)...',
      generateEvaluation: 'Generate Advisory Report',
      generating: 'Synthesizing Engineering Recommendations...',
      keyNotConfigured: 'Gemini API key is not configured on the server.',
      setupGuide: 'Obtain an API key from aistudio.google.com and configure GEMINI_API_KEY in your server .env environment.',
      ragCitations: 'Verified Standards & Regulatory References',
      summary: 'Executive Summary',
      recommendations: 'Engineering & Layout Recommendations',
      advantages: 'Key System Advantages',
      risks: 'Shading & Technical Risk Disclosures',
      assumptions: 'Engineering & Economic Assumptions',
      nextSteps: 'Concrete Project Next Steps',
      quickPrompt1: 'Analyze my rooftop solar viability & investment payback',
      quickPrompt2: 'Does shading from neighboring buildings impact my annual yield?',
      quickPrompt3: 'Verify Bangladesh SREDA 2025 net metering and capacity limits',
      quickPrompt4: 'Suggest optimal panel tilt angle, orientation, and safety setbacks',
      selectBuildingPrompt: 'Select a Building to Begin',
      selectBuildingDesc: 'Choose a building in the Planner tab to consult the AI Solar Advisor.',
      fullReport: 'Full Advisory Report',
      consultationError: 'Consultation Error',
      keySetupRequired: 'Gemini API Configuration Required',
      keySetupDesc: 'For credential security, the AI Solar Advisor runs server-side. To enable live natural-language advisory:',
      executiveSummary: 'Executive Advisory Synthesis',
      engineeringRecommendations: 'Engineering Recommendations',
      keyAdvantages: 'Key Advantages',
      risksLimitations: 'Risks & Technical Limitations',
      citationsGrounding: 'Technical & Regulatory Citations',
      welcomeTitle: 'Your AI Solar Engineering Assistant',
      welcomeDesc: 'Ask questions about rooftop solar potential, layout optimization, shading impact, annual generation, and financial returns.',
      suggestedViability: 'Analyze my rooftop solar viability & payback.',
      suggestedPlacement: 'Optimize solar panel placement on this roof.',
      suggestedShading: 'Explain current shading conditions & obstacle impact.',
      suggestedPayback: 'Calculate solar investment payback in applied currency.',
      suggestedNetMetering: 'Check local net metering guidelines and capacity limits.',
      suggestedOrientation: 'Suggest optimal panel orientation and tilt angle.',
      suggestedUsRegs: 'Explain California solar regulations and NEM 3.0 export credits.',
      suggestedUsInterconnect: 'What are US utility interconnection and NEC setback requirements?',
      suggestedBdNetMetering: 'Check Bangladesh SREDA 2025 Net Metering Guideline eligibility & capacity limits.',
      suggestedBdBPDB: 'What are BPDB grid interconnection & tariff rules?',
      suggestedAuRegs: 'Explain Australian Clean Energy Council guidelines and STC incentives.',
      suggestedUkRegs: 'Explain UK Smart Export Guarantee (SEG) and G98/G99 connection standards.',
      financialDisclosure: 'Financial Transparency & Simulation Disclosure',
      financialDisclosureText: 'Annual savings and payback calculations represent flat-tariff annualized estimates. Actual savings depend on hourly load profiles and utility rate structures.',
      annualEnergyCoverage: 'Annual Energy Coverage',
      expandChat: 'Expand Chat',
      collapseChat: 'Collapse Chat',
      chatInputPlaceholder: 'Ask anything about your solar project (Enter to send, Shift+Enter for new line)...',
      analyzing: 'Analyzing your solar data...',
      newChat: 'New Chat',
      clearChat: 'Clear Conversation',
      clearConfirm: 'Clear all conversation messages?',
      copy: 'Copy',
      copied: 'Copied!',
      retry: 'Retry Inquiry',
      scrollToBottom: 'Scroll to bottom',
      expandWorkspace: 'Expand chat view',
      collapseWorkspace: 'Collapse chat view',
      activeBuildingBadge: 'Active 3D Context Synchronized',
      inquiryLocationBadge: 'Inquiry Target Location',
      followUpBd1: 'Explain Bangladesh SREDA 2025 net metering and sanctioned load rules',
      followUpBd2: 'Show 20-year net savings breakdown in BDT',
      followUpBd3: 'What are BPDB bi-directional meter requirements?',
      followUpUs1: 'Explain California NEM 3.0 export credits',
      followUpUs2: 'Show 20-year net savings breakdown in USD',
      followUpUs3: 'What are Title 24 solar mandate requirements?',
      followUpGeneral1: 'Explain shading impact on annual solar yield',
      followUpGeneral2: 'Show 20-year net savings and payback breakdown',
      followUpGeneral3: 'What are perimeter setback and obstacle buffer requirements?',
      panels: 'panels',
      sun: 'sun',
      notAnalyzed: 'Not Analyzed',
      annualCoverage: 'annual coverage',
      startNewChat: 'Start New Chat',
      clearConversation: 'Clear Conversation',
      groundedNotice: 'Grounded in RoofRay 3D Raycasting & verified engineering knowledge',
      singleSourceOfTruth: 'Single Source of Truth',
      locationQuestions: 'Location-Specific Questions ({city})',
      advantagesRisksTitle: 'Key Advantages & Risk Analysis',
      advantagesTitle: 'Advantages',
      risksTitle: 'Risks & Limitations',
      financialPerformanceTitle: 'Financial Performance & Economic Transparency',
      totalCapitalCost: 'Total Capital Cost',
      annualBillSavings: 'Annual Bill Savings',
      estimatedPayback: 'Estimated Payback',
      twentyYearNetBenefit: '20-Year Net Benefit',
      projectRoi: 'Project ROI',
    },
    solarReportModal: {
      title: 'RoofRay Solar Feasibility & Engineering Report',
      downloadPdf: 'Print / Save PDF',
      copyJson: 'Copy Audit JSON',
      close: 'Close',
      executiveSummary: 'Executive Summary',
      technicalHighlights: 'Technical Specifications',
      financialProjection: 'Financial Projections',
      environmentalImpact: 'Environmental Sustainability',
      disclaimer: 'Notice: This report is generated by the RoofRay 3D simulation engine. On-site structural engineering verification and utility interconnection approval are required prior to installation.',
      simulationEstimateBadge: 'SIMULATION ESTIMATE',
      dateLabel: 'Date:',
      copiedLabel: 'Copied',
      systemSizeLabel: 'System Capacity',
      annualYieldLabel: 'Annual Yield',
      turnkeyCapexLabel: 'Turnkey CapEx',
      simplePaybackLabel: 'Simple Payback',
      includesInstallSubtext: 'Includes installation & hardware',
      demandOffsetSubtext: 'demand offset',
      annualSavingsSubtext: 'Annual savings:',
      rooftopLocationProfileTitle: 'Rooftop & Geographic Profile',
      targetBuildingLabel: 'Target Building:',
      totalRoofDimensionsLabel: 'Total Roof Dimensions:',
      gridResolutionLabel: 'Raycast Grid Resolution:',
      astronomicalSiteLabel: 'Astronomical Site:',
      solarPVTechLayoutTitle: 'Solar PV Technology & Layout',
      selectedPanelTypeLabel: 'Selected Panel Model:',
      totalInstalledPanelsLabel: 'Total Installed Panels:',
      perimeterSetbackLabel: 'Perimeter Fire Setback:',
      obstacleBufferLabel: 'Obstacle Safety Buffer:',
      azimuthOrientationLabel: 'Array Orientation:',
      environmentalDecarbImpactTitle: 'Environmental & Decarbonization Impact',
      co2AbatementLabel: 'Annual CO2 Abatement:',
      treeEquivalenceLabel: 'Tree Planting Equivalence:',
      verifiedEmissionFactorLabel: 'Verified Grid Emission Factor:',
      officialSourceLabel: 'Official Source:',
      executiveRecommendationTitle: 'Executive Recommendation & Regulatory RAG',
      engineeringNoteLabel: 'Engineering Note:',
      statutoryDisclaimersTitle: 'Statutory & Technical Disclaimers',
      disclaimerFullText: 'Calculations represent deterministic 3D raycast simulation estimates and annualized flat-tariff projections. They do not constitute guaranteed commercial power delivery or binding EPC proposals.',
      simulationEstimate: 'SIMULATION ESTIMATE',
      copied: 'Copied',
      systemSize: 'System Capacity',
      solarModules: 'solar modules',
      annualYield: 'Annual Yield',
      demandOffset: 'demand offset',
      turnkeyCapex: 'Turnkey CapEx',
      includesInstallation: 'Includes installation',
      simplePayback: 'Simple Payback',
      years: 'years',
      rooftopProfile: 'Rooftop & Geographic Profile',
      targetBuilding: 'Target Building',
      totalRoofDimensions: 'Total Roof Dimensions',
      raycastResolution: 'Raycast Grid Resolution',
      astronomicalSite: 'Astronomical Site',
      utilityTimezone: 'Utility Timezone',
      decarbonizationBenefit: 'Environmental & Decarbonization Impact',
      annualCO2Offset: 'Annual CO2 Abatement',
      tonnesPerYear: 'Tonnes/yr',
      seedlingTrees: 'Tree Planting Equivalence',
      treesEquivalent: 'trees',
      vehicleMiles: 'Avoided Vehicle Miles',
      gridEmissionFactor: 'Verified Grid Emission Factor',
      legalNoticeTitle: 'Statutory & Technical Disclaimers',
      dataSources: 'Data Sources',
      ephemerisRadiation: 'NOAA Solar Ephemeris & 3D Deterministic Raycasting Engine',
      regulatoryTariffs: 'Regulatory Tariffs',
      disclaimerText: 'Calculations represent deterministic 3D raycast simulation estimates and annualized flat-tariff projections. They do not constitute guaranteed commercial power delivery or binding EPC proposals.',
    },
    demoTour: {
      title: 'RoofRay Guided Studio Tour',
      next: 'Next Step',
      previous: 'Previous Step',
      finish: 'Finish Tour',
      exit: 'Exit Tour',
      stepOf: 'Step',
      step1: 'Active building selected in 3D scene.',
      step2: 'Simulating diurnal sun path & shadow casting.',
      step3: 'Raytracing rooftop grid & detecting shade exposure.',
      step4: 'Calibrating monthly consumption demand & hardware specifications.',
      step5: 'Synthesizing optimal layout under Demand Matching mode.',
      step6: 'Demo complete! Solar plan generated with deterministic financials & explainability.',
      step: 'Step',
    },
    heatmapLegend: {
      livePass: 'Live Shading Pass',
      annualExposure: 'Annual Solar Exposure',
      monthlyInsolation: 'Insolation',
      instantRaycast: 'Instant Raycast',
      clearSkyEstimate: 'Clear-sky estimate',
      litBySun: 'Lit by Sun',
      inShadow: 'In Shadow',
      rooftopObstacle: 'Rooftop Obstacle',
      unobstructed: 'Unobstructed',
      occluded: 'Occluded',
      blocked: 'Blocked',
      monthlyAvg: 'Monthly Avg:',
      runAnalysisPrompt: 'Run analysis',
      shadedLow: 'Shaded (Low)',
      moderate: 'Moderate',
      peakSun: 'Peak Sun',
      annualAvg: 'Annual Average:',
      excellentExposure: 'Excellent Exposure',
      goodExposure: 'Good Exposure',
      poorExposure: 'Poor / Shaded',
      liveShadingPass: 'Live Shading Pass',
      insolation: 'Insolation',
      runAnalysis: 'Run Analysis',
      annualAverage: 'Annual Average',
      poorShaded: 'Shaded (< 60%)',
      obstacleZone: 'Obstacle Zone',
      recommendedZone: 'Recommended Zone',
    },
    viewportControls: {
      noaaSunModel: 'NOAA Sun Model',
      elevLabel: 'Elev:',
      azLabel: 'Az:',
      jumpSunrise: 'Jump to Sunrise',
      jumpNoon: 'Jump to Solar Noon',
      jumpSunset: 'Jump to Sunset',
      risePrefix: 'Rise',
      noonPrefix: 'Noon',
      setPrefix: 'Set',
      liveShadingLabel: 'Live Shading',
      annualLabel: 'Annual',
      heatmapLabel: 'Heatmap',
      shadowsLabel: 'Shadows',
      sunPathLabel: 'Sun Path',
      compassLabel: 'Compass',
      playDayTitle: 'Play diurnal 24-hour sun cycle',
      pauseDayTitle: 'Pause diurnal animation',
      playYearTitle: 'Play seasonal solstice & equinox cycle',
      pauseYearTitle: 'Pause annual cycle',
      speedPrefix: 'Speed:',
      pause: 'Pause',
      playDay: 'Play Day',
      playYear: 'Play Year',
      elev: 'Elev',
      az: 'Az',
      rise: 'Rise',
      noon: 'Noon',
      set: 'Set',
      liveShading: 'Live Shading',
      annual: 'Annual',
      heatmap: 'Heatmap',
      shadows: 'Shadows',
      sunPath: 'Sun Path',
      compass: 'Compass',
    },
    cameraGuidance: {
      heading: 'Welcome to RoofRay!',
      message: 'Zoom out for a better view of the complete 3D building model.',
      fitFullModel: 'Fit Full Model',
      gotIt: 'Got It',
    },
    guideHelp: {
      title: 'Guide & Help',
      subtitle: 'Interactive step-by-step guidance for RoofRay modules',
      button: 'Guide & Help',
      close: 'Close',
      cameraGuide: 'Camera & 3D Navigation Guide',
      cameraDesc: 'Explore orbit rotation, panning, zoom, and full neighborhood framing.',
      plannerGuide: 'Planner Guide',
      plannerDesc: 'Learn building selection, ephemeris sun paths, and 3D raycasting.',
      manualGuide: 'Manual Studio Guide',
      manualDesc: 'Master panel placement, rotation, setbacks, and heuristic layout.',
      economicsGuide: 'Economics Guide',
      economicsDesc: 'Understand CapEx, payback, tariffs, net metering, and 20-year ROI.',
      advisorGuide: 'AI Advisor Guide',
      advisorDesc: 'Consult the conversational AI engineer grounded in regional regulations.',
      whyPlanGuide: 'Why Plan Guide',
      whyPlanDesc: 'Review engineering rationale, obstacle setbacks, and shade avoidance.',
      startGuide: 'Start Guide',
      completed: 'Completed',
    },
    tourUI: {
      next: 'Next',
      back: 'Back',
      skip: 'Skip',
      finish: 'Finish',
      stepOf: 'Step',
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
      guideHelp: 'গাইড ও সহায়তা',
      exportReport: 'রিপোর্ট',
    },
    hero: {
      badge: 'ইন্টারন্যাশনাল এআই বিল্ডার্স কংগ্রেস ২০২৬ • আইডিয়া টু ইউনিকর্ন',
      headline: 'প্রতিটি ছাদকে রূপান্তর করুন পরিবেশবান্ধব সৌরশক্তিতে।',
      subheadline:
        'রূফরে প্ল্যাটফর্মের মাধ্যমে আপনার ছাদের সৌরবিদ্যুৎ উৎপাদনের সম্ভাবনা জানুন, রিয়েল-টাইম থ্রি-ডি ছায়া বিশ্লেষণ করুন, সোলার প্যানেল স্থাপন অপ্টিমাইজ করুন এবং নির্ভরযোগ্য এআই প্রকৌশলগত সুপারিশ গ্রহণ করুন।',
      ctaPrimary: 'সোলার প্ল্যানার শুরু করুন',
      ctaSecondary: 'গাইডেড ডেমো দেখুন',
      stat1Label: 'রে-কাস্টিং রেজোলিউশন',
      stat1Value: '০.৮ মিটার গ্রিড',
      stat2Label: 'সৌর গণনা ইঞ্জিন',
      stat2Value: 'নোয়া (NOAA) পজিশন',
      stat3Label: 'এআই গ্রাউন্ডিং',
      stat3Value: 'শ্রেডা ও এনআরইএল র্যাগ',
      simulatedEphemerisBadge: '⚡ ৩ডি রে-কাস্টিং এবং লাইভ সৌর অবস্থান',
      heroEngineTitle: 'রিয়েল-টাইম ছায়া বিশ্লেষণ ও সৌর সম্ভাবনা ইঞ্জিন',
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
        'প্রথাগত সৌর পরিকল্পনা ধীরগতির এবং ছায়ার কারণে ভুল গণনার ঝুঁকি থাকে। রূফরে ফিজিক্স-নির্ভর থ্রি-ডি রে-কাস্টিং এবং যাচাইকৃত এআই দিয়ে এই সমাধান নিশ্চিত করে।',
      p1Title: 'ছাদের পরিকল্পনা জটিল',
      p1Desc: 'সৌর প্যানেলের কোণ, দিক, ছাদের বাধা এবং সেফটি বাফার নির্ণয় করতে বিশেষ সিএডি দক্ষতার প্রয়োজন হয়।',
      s1Title: 'ইন্টারেক্টিভ থ্রি-ডি সিমুলেশন',
      s1Desc: 'রিয়েল-টাইম ছায়া তৈরি, বাধার সাথে সংঘর্ষ পরীক্ষা এবং ০.৮ মিটার গ্রিড রে-ট্রেসিং বিশিষ্ট সহজ থ্রি-ডি পরিবেশ।',
      p2Title: 'ছায়ার কারণে বিদ্যুৎ উৎপাদন হ্রাস',
      p2Desc: 'পাশের বহুতল ভবন, পানির ট্যাংক ও সিঁড়িঘরের ছায়া বার্ষিক বিদ্যুৎ উৎপাদনে বড় ধরনের লোকসান ঘটায়।',
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
      problemPrefix: 'সমস্যা',
      solutionPrefix: 'রূফরে সমাধান',
      problemBadge: 'সমস্যা',
      solutionBadge: 'রূফরে সমাধান',
    },
    features: {
      badge: 'প্ল্যাটফর্মের সক্ষমতা',
      title: 'নির্ভুলতা ও স্বচ্ছতার জন্য প্রকৌশলীকৃত',
      subtitle: 'থ্রি-ডি স্থানিক সিমুলেশন, জ্যোতির্বিজ্ঞান গণনা ও নির্ভরযোগ্য এআই বিজ্ঞ পরামর্শের সমন্বয়।',
      f1Title: 'ইন্টারেক্টিভ থ্রি-ডি সৌর দৃশ্যমানতা',
      f1Desc: 'থ্রি.জেএস ও ওয়েবজিএল চালিত ডিজিটাল টুইন যেখানে সূর্যের ২৪ ঘণ্টার অবস্থান অনুযায়ী আলোর পরিবর্তন দেখা যায়।',
      f2Title: 'রিয়েল-টাইম ছায়া সিমুলেশন',
      f2Desc: 'হার্ডওয়্যার-ত্বরান্বিত রে-কাস্টিং পাশের বড় ভবন ও ছাদের পানির ট্যাংক থেকে পড়া ছায়া সরাসরি দেখায়।',
      f3Title: 'বার্ষিক সৌর উপযোগিতা বিশ্লেষণ',
      f3Desc: '১২ মাসের শত শত সূর্যের অবস্থান বিশ্লেষণ করে ছাদের অংশগুলোকে চমৎকার, ভালো ও দুর্বল অঞ্চলে ভাগ করে।',
      f4Title: 'বুদ্ধিমান প্যানেল প্লেসমেন্ট',
      f4Desc: '০.৮ মিটার ফায়ার সেফটি বাউন্ডারি ও ০.৫ মিটার বাধার দূরত্ব নিশ্চিত করে স্বয়ংক্রিয় বা ম্যানুয়াল প্যানেল বসানো।',
      f5Title: 'সৌর বিদ্যুৎ উৎপাদন প্রাক্কলন',
      f5Desc: 'প্রতিটি প্যানেলের পিক সান আওয়ার, টিল্ট কোণ ও ছায়ার স্কোর যোগ করে নিশ্চিত বার্ষিক কিলোওয়াট-ঘণ্টা হিসাব।',
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
      step2Title: '২. রোদ ও ছায়া বিশ্লেষণ',
      step2Desc: 'রে-কাস্টিং বিশ্লেষণ চালিয়ে ছাদের হিটম্যাপ দেখুন এবং দিনের বিভিন্ন সময়ে ছায়ার গতিবিধি লক্ষ্য করুন।',
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
      groundingDesc: 'নোয়া (NOAA) ও থ্রি.জেএস রে-কাস্টিং সূর্যের উন্নতি কোণ, ছায়া এবং প্রতিটি প্যানেলের কিলোওয়াট উৎপাদন নিশ্চিত করে।',
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
      netMeteringDesc: 'স্রেডা নেট-মিটারিং নির্দেশিকা ২০২৫ (অনুমোদিত লোডের ১০০% পর্যন্ত ও ৮০% ট্রান্সফরমার সীমা) অনুযায়ী পরিকল্পনা প্রণয়ন।',
      co2Title: 'কার্বন নিঃসরণ হ্রাস',
      co2Desc: 'পরিবেশ অধিদপ্তরের জাতীয় গ্রিড কম্বাইন্ড মার্জিন (০.৬২ কেজি CO₂/kWh, ২০২১–২০২৩ মেয়াদ) অনুযায়ী গাছ লাগানো ও যানবাহন চলাচলের সমতুল্য হিসাব।',
    },
    cta: {
      headline: 'আপনার ছাদেই রয়েছে পরিচ্ছন্ন শক্তির সম্ভাবনা।',
      description: 'থ্রি-ডি ছায়া সিমুলেশন, স্বয়ংক্রিয় প্যানেল অপ্টিমাইজেশন এবং এআই উপদেষ্টার মাধ্যমে আজই পরিকল্পনা শুরু করুন।',
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
      paybackLabel: 'বিনিয়োগ ফেরতের সময়',
      systemCostLabel: 'প্রাথমিক স্থাপন ব্যয়',
      annualSavingsLabel: 'বার্ষিক বিদ্যুৎ বিল সাশ্রয়',
      co2OffsetLabel: 'কার্বন নিঃসরণ হ্রাস',
      exportReport: 'সোলার রিপোর্ট ডাউনলোড',
    },
    controlPanel: {
      locationHeader: '১. ভৌগোলিক অবস্থান, সময় ও সৌর গতিপথ',
      buildingHeader: '২. নির্বাচিত ভবন ও ছাদের জ্যামিতিক গঠন',
      analysisHeader: '৩. রে-কাস্ট সূর্যালোক ও ছায়া বিশ্লেষণ',
      panelsHeader: '৪. সোলার প্যানেল হার্ডওয়্যার কনফিগারেশন',
      demandHeader: '৫. বিদ্যুৎ ব্যবহারের লক্ষ্যমাত্রা',
      optimizationHeader: '৬. সর্বোত্তম বিন্যাস নির্ধারণ ও পরিকল্পনা',
      section1: '১. ভৌগোলিক অবস্থান ও সূর্য সিমুলেশন',
      section2: '২. ভবন ও ছাদ পরিদর্শন',
      section3: '৩. সৌর সম্ভাব্যতা বিশ্লেষণ',
      section4: '৪. সোলার প্যানেল স্পেসিফিকেশন',
      section5: '৫. লক্ষ্য বিদ্যুৎ চাহিদা',
      section6: '৬. অপ্টিমাইজেশন লক্ষ্য',
      engineeringAssumptions: 'প্রকৌশলগত অনুমান ও ব্যাখ্যা',
      assumptionsDesc: 'গণনাগুলো গাণিতিক ৩ডি রে-কাস্টিং, নোয়া (NOAA) সৌর অবস্থান এবং আঞ্চলিক ট্যারিফ মডেল ব্যবহার করে। সমস্ত প্রাক্কলন বাস্তবসম্মত পরিষ্কার আকাশ বা আবহাওয়া-ভিত্তিক অনুমান।',
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
      cardinalNorth: 'উত্তর',
      cardinalNorthEast: 'উত্তর-পূর্ব',
      cardinalEast: 'পূর্ব',
      cardinalSouthEast: 'দক্ষিণ-পূর্ব',
      cardinalSouth: 'দক্ষিণ',
      cardinalSouthWest: 'দক্ষিণ-পশ্চিম',
      cardinalWest: 'পশ্চিম',
      cardinalNorthWest: 'উত্তর-পশ্চিম',
      springEquinoxBtn: '🌸 ২০ মার্চ\nবিষুব',
      summerSolsticeBtn: '☀️ ২১ জুন\nঅয়নান্ত',
      autumnEquinoxBtn: '🍂 ২২ সেপ্টে\nবিষুব',
      winterSolsticeBtn: '❄️ ২১ ডিসে\nঅয়নান্ত',
      playYearBtn: '৩৬৫ দিনের বার্ষিক চক্র চালু করুন',
      pauseYearBtn: 'বার্ষিক চক্র থামান',
      playDayBtn: 'দিনের চক্র দেখুন',
      pauseDayBtn: 'থামান',
      speedPrefix: 'গতি:',
      localTimeOfDay: 'স্থানীয় সময়',
      polarDayBadge: 'মধ্যরাতের সূর্য (পোলার ডে)',
      polarNightBadge: 'পোলার নাইট (সূর্যহীন)',
      daylightBadge: 'দিনের আলো',
      civilTwilightBadge: 'গোধূলি আলো',
      nightBadge: 'রাত',
      riseMarker: 'উদয়',
      setMarker: 'অস্ত',
      astronomicalReadout: 'জ্যোতির্বৈজ্ঞানিক পরিমাপ',
      utcPrefix: 'ইউটিসি (UTC):',
      solarElevationTitle: 'সূর্যের উন্নতি কোণ',
      geomSuffix: 'জ্যামিতিক',
      solarAzimuthTitle: 'সৌর দিক কোণ (অ্যাজিমুথ)',
      sunriseSunsetTitle: 'সূর্যোদয় / সূর্যাস্ত',
      solarNoonDayLenTitle: 'সৌর দুপুর / দিনের দৈর্ঘ্য',
      sunNeverSets: 'সূর্য অস্ত যায় না (২৪ ঘণ্টা)',
      sunNeverRises: 'সূর্য উদিত হয় না',
      dayLenHoursMinutes: 'ঘণ্টা',
      heatmapModeTitle: 'হিটম্যাপ বিশ্লেষণ মোড',
      roofLitNow: 'বর্তমানে আলোকিত ছাদ',
      liveMode: 'লাইভ',
      annualMode: 'বার্ষিক',
      monthlyMode: 'মাসিক',
      selectMonthLabel: 'মূল্যায়নের মাস নির্বাচন করুন:',
      litCellsLabel: 'আলোকিত:',
      shadedCellsLabel: 'ছায়াযুক্ত:',
      obstaclesCellsLabel: 'প্রতিবন্ধকতা:',
      months: [
        'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
        'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
      ],
      monthsShort: ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'],
      cardinalDirections: {
        North: 'উত্তর',
        'North-East': 'উত্তর-পূর্ব',
        East: 'পূর্ব',
        'South-East': 'দক্ষিণ-পূর্ব',
        South: 'দক্ষিণ',
        'South-West': 'দক্ষিণ-পশ্চিম',
        West: 'পশ্চিম',
        'North-West': 'উত্তর-পশ্চিম',
      },
      seasonPresets: {
        springEquinox: 'বসন্ত বিষুব',
        summerSolstice: 'গ্রীষ্ম সংক্রান্তি',
        autumnEquinox: 'শরৎ বিষুব',
        winterSolstice: 'শীত সংক্রান্তি',
        mar20: '২০ মার্চ',
        jun21: '২১ জুন',
        sep22: '২২ সেপ্টে',
        dec21: '২১ ডিসে',
      },
      pauseAnnual: 'বছর থামান',
      playYear: 'বছর চালান',
      pauseDay: 'দিন থামান',
      playDay: 'দিন চালান',
      daylight: 'দিনের আলো',
      civilTwilight: 'গোধূলি',
      night: 'রাত',
      solarElevation: 'সৌর উন্নতি কোণ',
      solarAzimuth: 'সৌর দিগংশ কোণ',
      solarNoonDayLen: 'দ্বিপ্রহর ও দিনের দৈর্ঘ্য',
      selectMonth: 'মাস নির্বাচন করুন',
      monthNames: ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'],
      monthNamesShort: ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'],
    },
    buildingInspector: {
      title: 'ভবনের জ্যামিতিক গঠন ও ছাদ',
      targetBuilding: 'সক্রিয় ভবন',
      dimensions: 'পরিমাপ',
      roofArea: 'ছাদের মোট আয়তন',
      usableArea: 'ব্যবহারযোগ্য আয়তন',
      obstacles: 'ছাদের প্রতিবন্ধকতা',
      setbackNotice: '০.৮ মিটার ফায়ার সেফটি ও ০.৫ মিটার বাধার নিরাপদ দূরত্ব নিশ্চিত।',
      fixedGeometry: 'নির্দিষ্ট জ্যামিতি',
      noBuildingSelected: 'ছাদের জ্যামিতি পরীক্ষা করতে ৩ডি দৃশ্যে একটি ভবন নির্বাচন করুন।',
      widthX: 'এক্স (প্রস্থ)',
      lengthZ: 'জেড (দৈর্ঘ্য)',
      heightY: 'ওয়াই (উচ্চতা)',
      worldPosition: 'বিশ্ব স্থানাঙ্ক',
      obstacleBufferLabel: '০.৫ মিটার বাফার',
      noObstacles: 'এই ছাদে কোনো প্রতিবন্ধকতা নেই।',
      hvacType: 'এইচভিএসি ইউনিট',
      waterTankType: 'পানির ট্যাংক',
      stairwellType: 'সিঁড়িঘর প্রবেশদ্বার',
      parapetType: 'ছাদের সীমানা প্রাচীর',
      buffer05m: '০.৫মি বাফার',
      obstacleTypes: {
        hvac: 'এইচভিএসি (HVAC)',
        water_tank: 'পানির ট্যাংক',
        stairwell: 'সিঁড়িঘর',
        parapet: 'প্যারাফেট',
      },
    },
    solarAnalysis: {
      title: 'সৌর বিকিরণ ও ছায়া বিশ্লেষণ',
      runAnalysis: 'বার্ষিক সৌর বিশ্লেষণ শুরু করুন',
      analyzing: 'সৌর রশ্মি সিমুলেট হচ্ছে...',
      recommendedArea: 'সুপারিশকৃত এলাকা',
      annualInsolation: 'সৌর বিকিরণের পরিমাণ',
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
      excShort: 'চমৎকার',
      goodShort: 'ভালো',
      shadedShort: 'ছায়াযুক্ত',
      obsShort: 'প্রতিবন্ধকতা',
      inspectToggle: 'বিস্তারিত',
      hideToggle: 'লুকান',
      queryingNasa: 'নাসা স্যাটেলাইট বিকিরণ তথ্য অনুসন্ধান করা হচ্ছে...',
      nasaOfflineTitle: 'নাসা পাওয়ার সার্ভিস অফলাইন / অনুপলব্ধ',
      nasaOfflineDesc: 'বাহ্যিক স্যাটেলাইট ডেটা পাওয়া যায়নি। কোনো বাধা ছাড়াই সরাসরি জ্যোতির্বৈজ্ঞানিক ক্লিয়ার-স্কাই রে-কাস্টিং সিমুলেশন চলছে।',
      subtextRecommendedArea: 'অবিচ্ছিন্ন ছায়ামুক্ত অঞ্চল',
      subtextAnnualInsolation: 'পরিষ্কার আকাশ মডেলের হিসাব',
      subtextExposureScore: '১২ মাসের দিনের আলোর অনুপাত',
      subtextObstacleFootprint: 'ছাদের যন্ত্রপাতি ও পানির ট্যাংক',
      contiguousZoneDesc: 'বাধা ও ছায়ামুক্ত সেরা আয়তাকার স্থাপন অঞ্চল চিহ্নিত করা হয়েছে।',
      hide: 'লুকান',
      inspect: 'পরিদর্শন',
      contiguousZoneSubtext: 'সংলগ্ন ছায়ামুক্ত এলাকা',
      clearSkySubtext: 'পরিষ্কার আকাশ প্রাক্কলন',
      daylightFactorSubtext: '১২ মাসের সূর্যালোক গুণক',
      obstacleSubtext: 'এইচভিএসি ও পানির ট্যাংক',
    },
    panelConfig: {
      title: 'সোলার প্যানেল হার্ডওয়্যার কনফিগারেশন',
      moduleSpec: 'মডিউল নির্বাচন',
      wattage: 'উৎপাদন ক্ষমতা',
      dimensions: 'পরিমাপ',
      efficiency: 'কার্যক্ষমতা',
      warranty: 'ওয়ারেন্টি',
      tiltAngle: 'টিল্ট কোণ (°)',
      orientation: 'দিক বিন্যাস',
      portrait: 'লম্বালম্বি (Portrait)',
      landscape: 'আড়াআড়ি (Landscape)',
      demoConfigBadge: 'স্ট্যান্ডার্ড কনফিগারেশন',
      effLabel: 'দক্ষতা',
      perModule: '/মডিউল',
      activeModulesLabel: 'সক্রিয় মডিউল',
      maxPossibleSuffix: 'সর্বোচ্চ সম্ভব',
      demoConfigs: 'আন্তর্জাতিক মানের মডিউল',
      activeModules: 'সক্রিয় স্থাপিত প্যানেল',
      max: 'সর্বোচ্চ',
    },
    energyDemand: {
      title: 'বিদ্যুৎ ব্যবহারের লক্ষ্যমাত্রা',
      monthlyConsumption: 'মাসিক ব্যবহার',
      annualConsumption: 'বার্ষিক ব্যবহার',
      installedCapacity: 'সিস্টেমের বিদ্যুৎ উৎপাদন ক্ষমতা',
      annualGeneration: 'বার্ষিক বিদ্যুৎ উৎপাদন',
      gridCoverage: 'বার্ষিক বিদ্যুৎ চাহিদা পূরণের হার',
      surplusExport: 'গ্রিডে উদ্বৃত্ত বিদ্যুৎ',
      apartment: 'অ্যাপার্টমেন্ট',
      townhouse: 'টাউনহাউস',
      familyHome: 'পারিবারিক বাড়ি',
      commercial: 'বাণিজ্যিক ভবন',
      presetsLabel: 'বিদ্যুৎ ব্যবহারের প্রিসেট',
      kwhPerMonth: 'কিলোওয়াট-ঘণ্টা/মাস',
      kwhPerYear: 'কিলোওয়াট-ঘণ্টা/বছর',
      presets: {
        apartment: 'অ্যাপার্টমেন্ট',
        townhouse: 'টাউনহাউস',
        familyHome: 'পারিবারিক বাড়ি',
        commercial: 'বাণিজ্যিক ভবন',
      },
    },
    optimization: {
      title: 'সর্বোত্তম বিন্যাস নির্ধারণ',
      mode: 'অপ্টিমাইজেশনের কৌশল',
      balanced: 'ভারসাম্যপূর্ণ / সেরা মান',
      balancedDesc: 'খরচ ও সর্বোচ্চ উৎপাদনের মধ্যে সমন্বয় রেখে সেরা স্থানে প্যানেল বসায়।',
      maxGeneration: 'সর্বোচ্চ বিদ্যুৎ উৎপাদন',
      maxGenerationDesc: 'ছাদের সর্বোচ্চ রোদযুক্ত অংশে সর্বাধিক সংখ্যক প্যানেল স্থাপন করে।',
      lowestCost: 'সর্বনিম্ন প্রাথমিক খরচ',
      lowestCostDesc: 'কম খরচে বেশি রিটার্ন নিশ্চিত করে প্রয়োজনীয় সংখ্যক প্যানেল বসায়।',
      meetDemand: 'চাহিদা অনুযায়ী সাজান',
      meetDemandDesc: 'ব্যবহারকারীর মাসিক চাহিদার প্রায় ১০০% পূরণ উপযোগী সিস্টেম সাজায়।',
      runOptimization: 'স্বয়ংক্রিয় বিন্যাস তৈরি',
      optimizing: 'বিন্যাস অপ্টিমাইজ হচ্ছে...',
      clearPanels: 'প্যানেল মুছুন',
      strategyBadge: 'কৌশল',
      demandMatchBadge: 'চাহিদা মাফিক',
      maxYieldBadge: 'সর্বোচ্চ ফলন',
      budgetCapexBadge: 'বাজেট ক্যাপেক্স',
      recommendedBadge: 'সুপারিশকৃত',
      prerequisiteTitle: 'সোলার লেআউট তৈরির আগে ছাদ বিশ্লেষণ করুন।',
      prerequisiteDesc: 'ছায়াযুক্ত অঞ্চল বাদ দিয়ে সর্বোত্তম প্যানেল স্থাপনের জন্য রে-কাস্ট সূর্যালোক বিশ্লেষণ প্রয়োজন।',
      layoutOutdatedTitle: 'লেআউট আপডেট প্রয়োজন',
      layoutOutdatedDesc: 'সৌর বিশ্লেষণ বা ভবনের সেটিং পরিবর্তন করা হয়েছে। নতুন প্যানেল বিন্যাস পেতে পুনরায় তৈরি করুন।',
      regenerateLayout: 'সোলার লেআউট পুনরায় তৈরি করুন',
      reoptimizeLayout: 'পুনরায় অপ্টিমাইজ করুন',
      layoutSuccessTitle: 'সফলভাবে লেআউট তৈরি হয়েছে',
      layoutSuccessFeedback: 'নির্বাচিত কৌশলের ভিত্তিতে স্বয়ংক্রিয় সোলার প্যানেল বিন্যাস সম্পন্ন হয়েছে।',
      badges: {
        demandMatch: 'চাহিদা সমন্বয়',
        maxYield: 'সর্বোচ্চ উৎপাদন',
        budgetCapex: 'সাশ্রয়ী বাজেট',
        recommended: 'প্রস্তাবিত',
      },
      outdatedTitle: 'বিন্যাস আপডেট প্রয়োজন',
      outdatedDesc: 'প্যারামিটার পরিবর্তিত হয়েছে। বিন্যাস আপডেট করতে পুনরায় অপ্টিমাইজ করুন।',
      layoutGeneratedSuccess: 'অপ্টিমাইজড বিন্যাস কার্যকর',
    },
    manualLayout: {
      title: 'ম্যানুয়াল স্টুডিও',
      clickToPlace: 'প্যানেল বসাতে বা সরাতে ছাদের ফাঁকা গ্রিডে ক্লিক করুন।',
      tools: 'নিয়ন্ত্রণ টুলসমূহ',
      rotate: 'ঘোরান (Q/E/T)',
      undo: 'পূর্বাবস্থায় (Ctrl+Z)',
      redo: 'পুনরায় (Ctrl+Y)',
      delete: 'মুছুন (Del)',
      fillZone: 'অঞ্চল পূর্ণ করুন',
      collisionWarning: 'প্যানেল অন্য প্যানেল বা ছাদের বাধার উপর পড়েছে।',
      setbackWarning: 'প্যানেল ০.৮ মিটার ফায়ার সেফটি সীমানা অতিক্রম করেছে।',
      selectMove: 'নির্বাচন / সরানো',
      placePanel: 'প্যানেল বসান',
      gridSnapBadge: '০.৫ মিটার গ্রিড স্ন্যাপ',
      delButton: 'মুছুন',
      clearButton: 'সব মুছুন',
      smartPlacementTitle: 'স্মার্ট সোলার প্লেসমেন্ট',
      hideSpots: 'স্পট লুকান',
      showBestSpots: 'সেরা স্থান দেখুন',
      smartPlacementDesc: 'বার্ষিক রোদ পাওয়ার হারের ভিত্তিতে ফাঁকা ছাদের সেরা স্থানগুলো রে-কাস্ট করে দেখায়।',
      suggestNextPanel: 'পরবর্তী প্যানেল প্রস্তাব (অপ্টিমাল)',
      arraySummaryTitle: 'ছাদের প্যানেল বিন্যাস সারাংশ',
      modulesCount: 'টি মডিউল',
      totalCapacityLabel: 'মোট ক্যাপাসিটি',
      avgExposureLabel: 'গড় রোদ প্রাপ্তি',
      stringMismatchWarningTitle: 'স্ট্রিং অমিল সতর্কবার্তা:',
      stringMismatchNotice: 'কিছু প্যানেল প্রাচীর বা বাধার কারণে কম রোদ পাচ্ছে। মাইক্রো-ইনভার্টার ব্যবহার বা প্যানেল সরানোর পরামর্শ দেওয়া হচ্ছে।',
      selectedPanelTitle: 'নির্বাচিত প্যানেল',
      deselectBtn: 'নির্বাচন বাতিল',
      localPositionLabel: 'স্থানীয় অবস্থান:',
      orientationLabel: 'দিক বিন্যাস:',
      annualExposureLabel: 'বার্ষিক রোদ প্রাপ্তি:',
      annualGenerationLabel: 'বার্ষিক বিদ্যুৎ উৎপাদন:',
      shortcutsTitle: 'শর্টকাট কমান্ড',
      rotateShortcut: '৯০° ঘোরান',
      removeShortcut: 'প্যানেল মুছুন',
      undoShortcut: 'পূর্বাবস্থায় ফিরুন',
      redoShortcut: 'পুনরায় করুন',
      selectAllShortcut: 'সব নির্বাচন',
      dragShortcut: 'টেনে সরান',
      selectBuildingPrompt: 'প্যানেল বসানো শুরু করতে ৩ডি দৃশ্যে একটি ভবন নির্বাচন করুন।',
      gridSnap: '০.৫মি গ্রিড',
      clearAll: 'সব প্যানেল মুছুন',
      smartSolarPlacement: 'স্মার্ট প্যানেল প্লেসমেন্ট',
      smartSolarDesc: 'বার্ষিক সূর্যরশ্মি ও বাধার ছায়া বিশ্লেষণ করে সর্বোচ্চ উৎপাদনশীল স্থান চিহ্নিত করে।',
      suggestNext: 'সেরা স্থানে প্যানেল বসান',
      rooftopArraySummary: 'ছাদের প্যানেল সারসংক্ষেপ',
      moduleSingular: 'প্যানেল',
      modulePlural: 'প্যানেলসমূহ',
      totalCapacity: 'মোট ক্ষমতা',
      avgExposure: 'গড় সূর্যরশ্মি',
      stringMismatchTitle: 'স্ট্রিং অমিল সতর্কতা',
      lowExposureWarning: '{count}টি প্যানেলে ৬০% এর কম রোদ পড়ে।',
      mismatchWarning: 'টি প্যানেল স্ট্রিং গড়ের চেয়ে ২০% কম রোদ পায়। মাইক্রো-ইনভার্টার বিবেচনা করুন বা অবস্থান পরিবর্তন করুন।',
      selectedPanel: 'নির্বাচিত প্যানেল',
      deselect: 'নির্বাচন বাতিল',
      localPosition: 'ছাদে অবস্থান',
      annualExposure: 'বার্ষিক সূর্যরশ্মি',
      annualGeneration: 'আনুমানিক বার্ষিক উৎপাদন',
      rotate90: '৯০° ঘোরান',
      removePanel: 'মুছুন',
      undoAction: 'পূর্বাবস্থায়',
      redoAction: 'পুনরাবৃত্তি',
      selectAllAction: 'সব নির্বাচন',
      moveSlotAction: 'স্থানান্তর',
    },
    financialSummary: {
      title: 'আর্থিক ফলাফল ও অর্থনীতি',
      currency: 'মুদ্রা',
      capex: 'প্রাথমিক স্থাপন ব্যয়',
      annualSavings: 'বার্ষিক বিদ্যুৎ বিল সাশ্রয়',
      payback: 'বিনিয়োগ ফেরতের সময়',
      twentyYearNet: '২০ বছরের নিট লাভ',
      roi: 'বিনিয়োগের রিটার্ন (ROI)',
      carbonAbated: 'কার্বন নিঃসরণ হ্রাস',
      assumptionsToggle: 'হিসাবের ভিত্তি ও আর্থিক অনুমানসমূহ',
      electricityTariff: 'বিদ্যুৎ ট্যারিফ',
      costPerKW: 'টার্নকি খরচ / কিলোওয়াট',
      baseCost: 'বেস ইন্টারকানেকশন ফি',
      exportCredit: 'রপ্তানি ক্রেডিট হার (% অফ ট্যারিফ)',
      emissionFactor: 'গ্রিড কার্বন নির্গমন গুণক',
      resetDefaults: 'ডিফল্ট রিসেট',
      disclaimer: 'হিসাবসমূহ সিমুলেশন মডেলের উপর ভিত্তি করে তৈরি এবং বাস্তব কাজের চুক্তিনামা নয়।',
      projectionsUnavailableTitle: 'আর্থিক প্রাক্কলন অনুপলব্ধ',
      projectionsUnavailableDesc: 'আর্থিক প্রাক্কলন, প্রাথমিক খরচ, বিনিয়োগ ফেরতের সময় এবং বিল সাশ্রয় দেখতে প্রথমে একটি সোলার লেআউট তৈরি করুন।',
      goToPlanner: 'সোলার প্ল্যানারে যান',
      layoutOutdatedTitle: 'বর্তমান সেটিংসের সাথে লেআউট অসামঞ্জস্যপূর্ণ',
      layoutOutdatedDesc: 'নিচের আর্থিক প্রাক্কলন সর্বশেষ তৈরি করা লেআউটের হিসাব দেখাচ্ছে। আপডেট পেতে প্ল্যানারে পুনরায় লেআউট তৈরি করুন।',
      activeModulesSubtext: 'টি সক্রিয় মডিউল',
      capacityFactorSubtext: 'ক্যাপাসিটি ফ্যাক্টর:',
      turnkeyInstallSubtext: 'যন্ত্রাংশ + স্থাপন ব্যয় সহ',
      tariffSubtext: 'প্রযোজ্য গ্রিড ট্যারিফ অনুযায়ী',
      twentyYearNetSubtext: '২০ বছরের নিট আর্থিক সাশ্রয়',
      treesPlantedSubtext: 'টি গাছ লাগানোর সমতুল্য',
      demandCoverageTitle: 'বার্ষিক বিদ্যুৎ চাহিদা পূরণের হার',
      generationLabel: 'উৎপাদন:',
      demandLabel: 'চাহিদা:',
      gridExportNotice: 'গ্রিডে উদ্বৃত্ত বিদ্যুৎ সরবরাহ',
      netMeteringCreditNotice: 'নির্ধারিত হারে নেট মিটারিং সমন্বয় সুবিধা',
      hideToggle: 'লুকান',
      configureToggle: 'কনফিগার',
      electricityTariffInputLabel: 'বিদ্যুৎ ট্যারিফ',
      turnkeyCostInputLabel: 'টার্নকি খরচ / কিলোওয়াট',
      basePermittingInputLabel: 'সংযোগ ও অনুমতি ফি',
      exportCreditInputLabel: 'রপ্তানি ক্রেডিট হার (% অফ ট্যারিফ)',
      gridEmissionInputLabel: 'গ্রিড নির্গমন গুণক (kg CO2/kWh)',
      flatTariffDesc: 'ফ্ল্যাট ট্যারিফ মডেল (পরিবর্তনযোগ্য)',
      benchmarkDesc: 'আঞ্চলিক খরচের বেঞ্চমার্ক',
      interconnectionFeeDesc: 'নির্দিষ্ট ইন্টারকানেকশন ও মিটারিং ব্যয়',
      exportPolicyDesc: 'নেট মিটারিং রোলওভার নীতিমালা',
      emissionFactorDesc: 'যাচাইকৃত জাতীয় গ্রিড নির্গমন গুণক',
      assumptionsDisclosureTitle: 'আর্থিক হিসাবের ভিত্তি ও সীমাবদ্ধতা (প্রকৌশল প্রকাশনা):',
      flatTariffDisclosure: 'ফ্ল্যাট ট্যারিফ মডেল: হিসাবগুলো একক-রেট ফ্ল্যাট ট্যারিফে করা হয়েছে। ধাপে ধাপে পরিবর্তিত স্ল্যাবভিত্তিক বিলিং সিমুলেট করা হয়নি।',
      simplifiedPaybackDisclosure: 'বিনিয়োগ ফেরতের সরল হিসাব: অর্থায়নের সুদ, বাৎসরিক প্যানেল অবক্ষয় (~০.৫%/বছর) বা ১০-১২ বছরে ইনভার্টার পরিবর্তনের খরচ এতে অন্তর্ভুক্ত নয়।',
      netMeteringDisclosure: 'নেট মিটারিং নীতিমালা: সরকারি স্রেডা নেট মিটারিং নির্দেশিকা ২০২৫ অনুযায়ী প্রস্তুতকৃত।',
      simulationEstimateDisclosure: 'সিমুলেশন প্রাক্কলন: আর্থিক হিসাবগুলো আনুমানিক এবং নিশ্চিত আর্থিক রিটার্ন নির্দেশ করে না।',
      sourcePrefix: 'তথ্যসূত্র:',
      engineeringAssumptionsTitle: 'হিসাবের ভিত্তি ও প্রকৌশলীয় শর্তাবলী',
      engineeringAssumptionsText: 'দৈনিক গড় পিক সান আওয়ার, সিস্টেমের কার্যকারিতা অনুপাত, গ্রিড ট্যারিফ এবং টার্নকি খরচের ভিত্তিতে হিসাব করা হয়েছে। উৎপাদিত সৌরবিদ্যুৎ সরাসরি বিদ্যুৎ বিল কমায়।',
      emptyTitle: 'অর্থনৈতিক হিসাব অপেক্ষমাণ',
      emptyDesc: 'টার্নকি স্থাপন ব্যয়, বার্ষিক সাশ্রয় এবং বিনিয়োগ ফেরতের সময় হিসাব করতে ছাদে প্যানেল স্থাপন করুন।',
      outdatedTitle: 'প্রাক্কলন নবায়ন প্রয়োজন',
      outdatedDesc: 'ছাদের প্যানেল বিন্যাস বা আর্থিক সেটিংসে পরিবর্তন হয়েছে। হিসাব নবায়ন করতে অপ্টিমাইজেশন পুনরায় চালান।',
      atTariffSubtext: 'ট্যারিফ মূল্যে',
      years: 'বছর',
      demandCoverage: 'চাহিদা পূরণ',
      gridExportLabel: 'বার্ষিক গ্রিড রপ্তানি',
      netMeteringCreditLabel: 'নেট মিটারিং ক্রেডিট',
      wholesaleRateLabel: 'পাইকারি রেট',
      hideConfig: 'লুকান',
      showConfig: 'পরিবর্তন',
      basePermitFee: 'অনুমোদন ও গ্রিড সংযোগ ফি',
      exportCreditRate: 'রপ্তানি ক্রেডিট বাইব্যাক রেট (খুচরা মূল্যের %)',
      gridEmissionFactor: 'গ্রিড নির্গমন গুণক (কেজি CO₂/kWh)',
      disclosuresTitle: 'প্রকৌশল ও আর্থিক প্রকাশনা',
      paybackDisclosure: 'সহজ বিনিয়োগ ফেরত = মোট সিস্টেম ব্যয় ÷ প্রথম বছরের বার্ষিক বিদ্যুৎ সাশ্রয়। প্যানেলের ক্ষমতা হ্রাস (সাধারণত ০.৫%/বছর) বা ঋণের সুদ অন্তর্ভুক্ত নয়।',
    },
    recommendation: {
      emptyTitle: 'এখনও কোনো সৌর পরিকল্পনা তৈরি করা হয়নি',
      emptyDesc: 'রূফরে কেন এই কনফিগারেশন প্রস্তাব করছে তা দেখতে ছাদ বিশ্লেষণ করে সোলার লেআউট তৈরি করুন।',
      goToPlanner: 'সোলার প্ল্যানারে যান',
      outdatedTitle: 'যৌক্তিকতা আগের লেআউটের হিসাব দেখাচ্ছে',
      outdatedDesc: 'অপ্টিমাইজেশন সেটিংস বা ভবনের মাপ পরিবর্তন করা হয়েছে। প্রযুক্তিগত ব্যাখ্যা আপডেট করতে প্ল্যানারে পুনরায় লেআউট তৈরি করুন।',
      systemRecommendationTitle: 'প্রকৌশলগত সুপারিশ ও যৌক্তিকতা',
      keySelectionFactors: 'প্রধান নির্বাচনীয় বিষয়সমূহ',
      spatialExclusionsTitle: 'স্থানিক বাধা ও ছায়া বিশ্লেষণ',
      installationComplianceTitle: 'স্থাপনের স্পেসিফিকেশন ও প্রকৌশলগত সম্মতি',
      noPlanTitle: 'এখনও কোনো পরিকল্পনা তৈরি হয়নি',
      noPlanDesc: 'প্রকৌশলগত যুক্তি দেখতে প্ল্যানার ট্যাবে অপ্টিমাইজেশন চালান অথবা ম্যানুয়ালি প্যানেল স্থাপন করুন।',
      systemRecommendation: 'সিস্টেম সুপারিশ',
      keyFactors: 'মূল বিবেচ্য বিষয়সমূহ',
      spatialExclusions: 'স্থানিক সীমাবদ্ধতা ও ছায়া বিশ্লেষণ',
      technicalCompliance: 'কারিগরি মান ও পারফরম্যান্স হাইলাইটস',
    },
    aiAdvisor: {
      title: 'এআই সোলার ইঞ্জিনিয়ারিং উপদেষ্টা',
      subtitle: 'পদার্থবিজ্ঞান-ভিত্তিক থ্রি-ডি রে-কাস্টিং এবং স্রেডা/বিপিডিবি নির্দেশিকা আশ্রিত।',
      promptPlaceholder: 'নির্দিষ্ট প্রশ্ন করুন (যেমন: নেট-মিটারিং সীমা, ঢাকার পেব্যাক সময়কাল, ছায়া হ্রাস)...',
      generateEvaluation: 'এআই মূল্যায়ন রিপোর্ট তৈরি করুন',
      generating: 'পেশাদার পরামর্শ তৈরি হচ্ছে...',
      keyNotConfigured: 'সার্ভারে জেমিনাই (Gemini) এআই কী কনফিগার করা নেই।',
      setupGuide: 'aistudio.google.com থেকে বিনামূল্যে এআই কী নিয়ে .env ফাইলে GEMINI_API_KEY যুক্ত করুন।',
      ragCitations: 'যাচাইকৃত রেফারেন্স ও নির্দেশিকা',
      summary: 'নির্বাহী সারাংশ',
      recommendations: 'প্রকৌশলগত সুপারিশ',
      advantages: 'সিস্টেমের মূল সুবিধাসমূহ',
      risks: 'ঝুঁকি ও কারিগরি সীমাবদ্ধতা',
      assumptions: 'হিসাবের ভিত্তি ও অনুমানসমূহ',
      nextSteps: 'পরবর্তী কার্যকর পদক্ষেপ',
      quickPrompt1: 'আমার ছাদের সৌর কার্যক্ষমতা ও পে-ব্যাক বিশ্লেষণ করুন',
      quickPrompt2: 'কাছের টাওয়ার বা বাধার ছায়া কি উৎপাদনে ক্ষতি করবে?',
      quickPrompt3: 'বাংলাদেশের জন্য স্রেডা ২০২৫ নেট-মিটারিং নির্দেশিকা যাচাই করুন',
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
      welcomeTitle: 'আপনার এআই সোলার ইঞ্জিনিয়ারিং সহকারী',
      welcomeDesc: 'ছাদের সৌর সম্ভাবনা, প্যানেল অপ্টিমাইজেশন, শেডিং, বিদ্যুৎ উৎপাদন এবং আর্থিক কর্মক্ষমতা সম্পর্কে প্রশ্ন করুন।',
      suggestedViability: 'আমার ছাদের সৌর কার্যক্ষমতা ও পে-ব্যাক বিশ্লেষণ করুন।',
      suggestedPlacement: 'সোলার প্যানেলের বিন্যাস অপ্টিমাইজ করুন।',
      suggestedShading: 'বর্তমান ছায়া পরিস্থিতি ও বাধার প্রভাব ব্যাখ্যা করুন।',
      suggestedPayback: 'প্রযোজ্য মুদ্রায় সৌর বিনিয়োগের পে-ব্যাক হিসাব করুন।',
      suggestedNetMetering: 'স্থানীয় নেট-মিটারিং নীতিমালা ও ইউটিলিটি নিয়ম যাচাই করুন।',
      suggestedOrientation: 'অনুকূল প্যানেল ওরিয়েন্টেশন ও টিল্ট কোণ প্রস্তাব করুন।',
      suggestedUsRegs: 'ক্যালিফোর্নিয়া সৌর নীতিমালা ও NEM 3.0 যাচাই করুন।',
      suggestedUsInterconnect: 'যুক্তরাষ্ট্রের ইউটিলিটি ইন্টারকানেকশন নিয়মাবলী কি?',
      suggestedBdNetMetering: 'স্রেডা নেট-মিটারিং নির্দেশিকা ২০২৫ অনুযায়ী সংযোগ ও সক্ষমতার সীমা যাচাই করুন।',
      suggestedBdBPDB: 'বিপিডিবি গ্রিড সংযোগ ও ট্যারিফ নিয়মাবলী কি?',
      suggestedAuRegs: 'অস্ট্রেলিয়ার ক্লিন এনার্জি কাউন্সিল নির্দেশিকা ও এসটিসি প্রণোদনা যাচাই করুন।',
      suggestedUkRegs: 'যুক্তরাজ্যের স্মার্ট এক্সপোর্ট গ্যারান্টি (SEG) ও G98/G99 নীতিমালা যাচাই করুন।',
      financialDisclosure: 'আর্থিক স্বচ্ছতা ও সিমুলেশন প্রকাশনা',
      financialDisclosureText: 'বার্ষিক সাশ্রয় ও পে-ব্যাক হিসাব প্রযোজ্য ফ্ল্যাট ট্যারিফে বার্ষিক অফসেটের ভিত্তিতে তৈরি। প্রকৃত বিল সাশ্রয় ইউটিলিটি রেট কাঠামো, ব্যবহারের সময় এবং লোড প্রোফাইলের উপর নির্ভরশীল।',
      annualEnergyCoverage: 'বার্ষিক বিদ্যুৎ চাহিদা পূরণের হার',
      expandChat: 'চ্যাট বড় করুন',
      collapseChat: 'চ্যাট ছোট করুন',
      chatInputPlaceholder: 'আপনার সোলার প্রকল্প সম্পর্কে যা কিছু জিজ্ঞাসা করুন (Enter পাঠান, Shift+Enter নতুন লাইন)...',
      analyzing: 'আপনার সৌর তথ্য বিশ্লেষণ করা হচ্ছে...',
      newChat: 'নতুন চ্যাট',
      clearChat: 'চ্যাট মুছুন',
      clearConfirm: 'এই কথোপকথনের সব বার্তা মুছে ফেলতে চান?',
      copy: 'কপি',
      copied: 'কপি হয়েছে!',
      retry: 'পুনরায় চেষ্টা',
      scrollToBottom: 'নতুন বার্তা',
      expandWorkspace: 'চ্যাট বড় করুন',
      collapseWorkspace: 'সাধারণ আকার',
      activeBuildingBadge: 'সক্রিয় সিমুলেশন ডেটা সিঙ্ক করা',
      inquiryLocationBadge: 'অনুসন্ধানকৃত এলাকা',
      followUpBd1: 'বাংলাদেশের স্রেডা ২০২৫ নেট-মিটারিং ও অনুমোদিত লোডের নিয়ম ব্যাখ্যা করুন',
      followUpBd2: 'টাকায় (BDT) ২০ বছরের নিট সঞ্চয়ের বিবরণ দেখান',
      followUpBd3: 'বিপিডিবি বাই-ডিরেকশনাল মিটারের প্রয়োজনীয়তা কী?',
      followUpUs1: 'ক্যালিফোর্নিয়ার NEM 3.0 এক্সপোর্ট ক্রেডিট ব্যাখ্যা করুন',
      followUpUs2: 'ডলারে ২০ বছরের নিট সাশ্রয়ের হিসাব দেখান',
      followUpUs3: 'টাইটেল ২৪ সোলার ম্যান্ডেটের নিয়মাবলী কি?',
      followUpGeneral1: 'বিদ্যুৎ উৎপাদনের উপর ছায়ার প্রভাব ব্যাখ্যা করুন',
      followUpGeneral2: '২০ বছরের নিট সাশ্রয় ও বিনিয়োগ রিটার্ন বিশ্লেষণ করুন',
      followUpGeneral3: 'ছাদের নিরাপদ দূরত্ব ও বাধার বাফার নিয়মাবলী কি?',
      panels: 'প্যানেল',
      sun: 'সূর্যরশ্মি',
      notAnalyzed: 'বিশ্লেষণ করা হয়নি',
      annualCoverage: 'বার্ষিক চাহিদা পূরণ',
      startNewChat: 'নতুন কথোপকথন শুরু করুন',
      clearConversation: 'কথোপকথন মুছে ফেলুন',
      groundedNotice: 'রূফরে ৩ডি রে-কাস্টিং এবং পরীক্ষিত প্রকৌশল জ্ঞানের ভিত্তিতে তৈরি',
      singleSourceOfTruth: 'যাচাইকৃত মূল উৎস',
      locationQuestions: 'অবস্থানভিত্তিক নির্দিষ্ট প্রশ্নোত্তর ({city})',
      advantagesRisksTitle: 'প্রধান সুবিধাসমূহ ও ঝুঁকি বিশ্লেষণ',
      advantagesTitle: 'সুবিধাসমূহ',
      risksTitle: 'ঝুঁকি ও সীমাবদ্ধতা',
      financialPerformanceTitle: 'আর্থিক বিশ্লেষণ ও স্বচ্ছ অর্থনৈতিক পরিমাপ',
      totalCapitalCost: 'মোট প্রাথমিক স্থাপন ব্যয়',
      annualBillSavings: 'বার্ষিক বিদ্যুৎ বিল সাশ্রয়',
      estimatedPayback: 'আনুমানিক বিনিয়োগ ফেরতের সময়',
      twentyYearNetBenefit: '২০ বছরের মোট নিট সুবিধা',
      projectRoi: 'প্রকল্পের আরওআই (ROI)',
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
      simulationEstimateBadge: 'সিমুলেশন প্রাক্কলন',
      dateLabel: 'তারিখ:',
      copiedLabel: 'কপি হয়েছে!',
      systemSizeLabel: 'সিস্টেমের বিদ্যুৎ উৎপাদন ক্ষমতা',
      annualYieldLabel: 'বার্ষিক বিদ্যুৎ উৎপাদন',
      turnkeyCapexLabel: 'প্রাথমিক স্থাপন ব্যয়',
      simplePaybackLabel: 'বিনিয়োগ ফেরতের সময়',
      includesInstallSubtext: 'যন্ত্রাংশ ও স্থাপন ব্যয় সহ',
      demandOffsetSubtext: 'চাহিদা পূরণ',
      annualSavingsSubtext: 'বার্ষিক বিল সাশ্রয়:',
      rooftopLocationProfileTitle: 'ছাদ ও ভৌগোলিক পরিচিতি',
      targetBuildingLabel: 'নির্বাচিত ভবন:',
      totalRoofDimensionsLabel: 'ছাদের মোট পরিমাপ:',
      gridResolutionLabel: 'রে-কাস্ট গ্রিড রেজোলিউশন:',
      astronomicalSiteLabel: 'জ্যোতির্বৈজ্ঞানিক অবস্থান:',
      solarPVTechLayoutTitle: 'সোলার পিভি প্রযুক্তি ও বিন্যাস',
      selectedPanelTypeLabel: 'নির্বাচিত প্যানেল মডেল:',
      totalInstalledPanelsLabel: 'মোট স্থাপিত প্যানেল:',
      perimeterSetbackLabel: 'সীমানা ফায়ার সেটব্যাক:',
      obstacleBufferLabel: 'প্রতিবন্ধকতা থেকে নিরাপদ দূরত্ব:',
      azimuthOrientationLabel: 'অ্যারে ওরিয়েন্টেশন:',
      environmentalDecarbImpactTitle: 'পরিবেশ ও কার্বন নিঃসরণ হ্রাস',
      co2AbatementLabel: 'বার্ষিক কার্বন নিঃসরণ হ্রাস:',
      treeEquivalenceLabel: 'গাছ লাগানোর সমতুল্য প্রভাব:',
      verifiedEmissionFactorLabel: 'গ্রিড নির্গমন গুণক:',
      officialSourceLabel: 'সরকারি উৎস:',
      executiveRecommendationTitle: 'প্রকৌশলগত সুপারিশ ও নীতিগত রেফারেন্স',
      engineeringNoteLabel: 'প্রকৌশলীয় নোট:',
      statutoryDisclaimersTitle: 'আইনগত ও কারিগরি শর্তাবলী',
      disclaimerFullText: 'এই হিসাবগুলো গাণিতিক ৩ডি রে-কাস্ট সিমুলেশন ও ফ্ল্যাট ট্যারিফের ভিত্তিতে তৈরি। এগুলো বাণিজ্যিক গ্যারান্টি বা বাধ্যতামূলক ঠিকাদারি চুক্তি নয়।',
      simulationEstimate: 'সিমুলেশন প্রাক্কলন',
      copied: 'কপি হয়েছে!',
      systemSize: 'সিস্টেমের ক্ষমতা',
      solarModules: 'সোলার প্যানেল',
      annualYield: 'বার্ষিক বিদ্যুৎ উৎপাদন',
      demandOffset: 'চাহিদা পূরণ',
      turnkeyCapex: 'প্রাথমিক স্থাপন ব্যয়',
      includesInstallation: 'স্থাপন ব্যয় সহ',
      simplePayback: 'বিনিয়োগ ফেরতের সময়',
      years: 'বছর',
      rooftopProfile: 'ছাদ ও ভৌগোলিক পরিচিতি',
      targetBuilding: 'নির্বাচিত ভবন',
      totalRoofDimensions: 'ছাদের মোট পরিমাপ',
      raycastResolution: 'রে-কাস্ট গ্রিড রেজোলিউশন',
      astronomicalSite: 'জ্যোতির্বৈজ্ঞানিক অবস্থান',
      utilityTimezone: 'টাইমজোন',
      decarbonizationBenefit: 'পরিবেশ ও কার্বন নিঃসরণ হ্রাস',
      annualCO2Offset: 'বার্ষিক কার্বন নিঃসরণ হ্রাস',
      tonnesPerYear: 'টন/বছর',
      seedlingTrees: 'গাছ লাগানোর সমতুল্য প্রভাব',
      treesEquivalent: 'টি গাছ',
      vehicleMiles: 'গাড়ির মাইল সমতুল্য',
      gridEmissionFactor: 'গ্রিড নির্গমন গুণক',
      legalNoticeTitle: 'আইনগত ও কারিগরি শর্তাবলী',
      dataSources: 'তথ্যের উৎস',
      ephemerisRadiation: 'নোয়া (NOAA) সৌর অবস্থান এবং ৩ডি গাণিতিক রে-কাস্টিং ইঞ্জিন',
      regulatoryTariffs: 'নিয়ন্ত্রক ট্যারিফ',
      disclaimerText: 'এই হিসাবগুলো গাণিতিক ৩ডি রে-কাস্ট সিমুলেশন ও ফ্ল্যাট ট্যারিফের ভিত্তিতে তৈরি। এগুলো বাণিজ্যিক গ্যারান্টি বা বাধ্যতামূলক ঠিকাদারি চুক্তি নয়।',
    },
    demoTour: {
      title: 'রূফরে গাইডেড স্টুডিও ট্যুর',
      next: 'পরবর্তী ধাপ',
      previous: 'পূর্ববর্তী ধাপ',
      finish: 'ট্যুর সম্পন্ন',
      exit: 'ট্যুর বন্ধ করুন',
      stepOf: 'ধাপ',
      step1: '৩ডি দৃশ্যে সক্রিয় ভবন নির্বাচন করা হয়েছে।',
      step2: 'সূর্যের দৈনিক গতিপথ ও ছায়া সিমুলেশন চলছে।',
      step3: 'ছাদের গ্রিডে রে-ট্রেসিং এবং ছায়ার প্রভাব বিশ্লেষণ।',
      step4: 'মাসিক বিদ্যুতের চাহিদা ও প্যানেল স্পেসিফিকেশন নির্ধারণ।',
      step5: 'চাহিদা মাফিক সর্বোত্তম প্যানেল বিন্যাস তৈরি হচ্ছে।',
      step6: 'ডেমো সম্পন্ন! সঠিক হিসাব ও যুক্তিযুক্ত সৌর পরিকল্পনা প্রস্তুত।',
      step: 'ধাপ',
    },
    heatmapLegend: {
      livePass: 'লাইভ ছায়া বিশ্লেষণ',
      annualExposure: 'বার্ষিক সৌর রোদ প্রাপ্তি',
      monthlyInsolation: 'সৌর বিকিরণ',
      instantRaycast: 'তাত্ক্ষণিক রে-কাস্ট',
      clearSkyEstimate: 'পরিষ্কার আকাশ অনুমান',
      litBySun: 'সূর্যালোকিত',
      inShadow: 'ছায়াযুক্ত',
      rooftopObstacle: 'ছাদের প্রতিবন্ধকতা',
      unobstructed: 'ছায়াহীন',
      occluded: 'আচ্ছাদিত',
      blocked: 'বাধাগ্রস্ত',
      monthlyAvg: 'মাসিক গড়:',
      runAnalysisPrompt: 'বিশ্লেষণ চালান',
      shadedLow: 'ছায়াযুক্ত (কম)',
      moderate: 'মাঝারি',
      peakSun: 'সর্বোচ্চ রোদ',
      annualAvg: 'বার্ষিক গড়:',
      excellentExposure: 'চমৎকার রোদ প্রাপ্তি',
      goodExposure: 'ভালো রোদ প্রাপ্তি',
      poorExposure: 'দুর্বল / ছায়াযুক্ত',
      liveShadingPass: 'লাইভ শ্যাডো বিশ্লেষণ',
      insolation: 'সৌর বিকিরণ',
      runAnalysis: 'বিশ্লেষণ চালান',
      annualAverage: 'বার্ষিক গড়',
      poorShaded: 'ছায়াযুক্ত (< ৬০%)',
      obstacleZone: 'বাধা এলাকা',
      recommendedZone: 'সুপারিশকৃত এলাকা',
    },
    viewportControls: {
      noaaSunModel: 'নোয়া (NOAA) সৌর মডেল',
      elevLabel: 'উন্নতি:',
      azLabel: 'অ্যাজিমুথ:',
      jumpSunrise: 'সূর্যোদয়ে যান',
      jumpNoon: 'সৌর দুপুরে যান',
      jumpSunset: 'সূর্যাস্তে যান',
      risePrefix: 'উদয়',
      noonPrefix: 'দুপুর',
      setPrefix: 'অস্ত',
      liveShadingLabel: 'লাইভ ছায়া',
      annualLabel: 'বার্ষিক',
      heatmapLabel: 'হিটম্যাপ',
      shadowsLabel: 'ছায়া',
      sunPathLabel: 'সূর্যের পথ',
      compassLabel: 'কম্পাস',
      playDayTitle: '২৪ ঘণ্টার সূর্য চক্র দেখুন',
      pauseDayTitle: 'সূর্য চক্র থামান',
      playYearTitle: '৩৬৫ দিনের বার্ষিক অয়নান্ত চক্র চালান',
      pauseYearTitle: 'বার্ষিক চক্র থামান',
      speedPrefix: 'গতি:',
      pause: 'থামান',
      playDay: 'দিন সিমুলেশন',
      playYear: 'বছর সিমুলেশন',
      elev: 'উন্নতি',
      az: 'দিগংশ',
      rise: 'সূর্যোদয়',
      noon: 'দ্বিপ্রহর',
      set: 'সূর্যাস্ত',
      liveShading: 'সরাসরি ছায়া',
      annual: 'বার্ষিক',
      heatmap: 'হিটম্যাপ',
      shadows: 'ছায়া',
      sunPath: 'সূর্যের গতিপথ',
      compass: 'কম্পাস',
    },
    cameraGuidance: {
      heading: 'রুফরে-তে স্বাগতম!',
      message: 'সম্পূর্ণ ৩ডি ভবনটি আরও ভালোভাবে দেখতে জুম আউট করুন।',
      fitFullModel: 'সম্পূর্ণ মডেল দেখুন',
      gotIt: 'বুঝেছি',
    },
    guideHelp: {
      title: 'গাইড ও সহায়তা',
      subtitle: 'রূফরে মডিউলসমূহের ইন্টারঅ্যাক্টিভ ধাপে ধাপে নির্দেশিকা',
      button: 'গাইড ও সহায়তা',
      close: 'বন্ধ করুন',
      cameraGuide: 'ক্যামেরা ও ৩ডি নেভিগেশন গাইড',
      cameraDesc: 'অরবিট রোটেশন, প্যানিং, জুম এবং সম্পূর্ণ এলাকা দেখার নিয়ম জানুন।',
      plannerGuide: 'প্ল্যানার গাইড',
      plannerDesc: 'বিল্ডিং নির্বাচন, সৌর গতিপথ ও ৩ডি রে-কাস্টিং বিশ্লেষণ শিখুন।',
      manualGuide: 'ম্যানুয়াল স্টুডিও গাইড',
      manualDesc: 'প্যানেল বসানো, ঘোরানো, নিরাপত্তা দূরত্ব ও অপ্টিমাইজেশন কৌশল জানুন।',
      economicsGuide: 'ইকোনমিক্স গাইড',
      economicsDesc: 'ক্যাপেক্স, পে-ব্যাক, ট্যারিফ, নেট-মিটারিং ও ২০ বছরের লাভ-ক্ষতি বুঝুন।',
      advisorGuide: 'এআই উপদেষ্টা গাইড',
      advisorDesc: 'স্থানীয় বিধিমালায় প্রশিক্ষিত এআই ইঞ্জিনিয়ারের সাথে পরামর্শ করুন।',
      whyPlanGuide: 'হোয়াই প্ল্যান গাইড',
      whyPlanDesc: 'প্রকৌশলগত যৌক্তিকতা, বাধা দূরীকরণ ও ছায়া পরিহারের কারণ বুঝুন।',
      startGuide: 'টিউটোরিয়াল শুরু করুন',
      completed: 'সম্পন্ন',
    },
    tourUI: {
      next: 'পরবর্তী',
      back: 'পূর্ববর্তী',
      skip: 'টিউটোরিয়াল বাদ দিন',
      finish: 'সম্পন্ন',
      stepOf: 'ধাপ',
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
