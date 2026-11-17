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
      f1Desc: 'Three.js & WebGL powered digital twin environment with realistic diurnal sun motion, smooth orbit controls, and customizable buildings.',
      f2Title: 'Real-Time Shadow Simulation',
      f2Desc: 'Hardware-accelerated raycasting projects dynamic shadows cast by neighboring high-rises and rooftop utility obstacles.',
      f3Title: 'Annual Solar Suitability Analysis',
      f3Desc: 'Simulates hundreds of astronomical sun positions across all 12 months to classify roof surface into excellent, good, and poor exposure.',
      f4Title: 'Intelligent Panel Placement',
      f4Desc: 'Automated and manual placement with 0.8m firefighter perimeter setbacks, 0.5m obstacle clearance, and best-spot ranking.',
      f5Title: 'Solar Energy Estimation',
      f5Desc: 'Deterministic energy modeling aggregating per-panel peak sun hours, tilt, orientation, and cell exposure scores.',
      f6Title: 'Financial and ROI Analysis',
      f6Desc: 'Configurable utility tariffs (BDT ৳ / USD $), turnkey installation costs, net-metering export credits, and 20-year net benefit projections.',
      f7Title: 'AI Solar Advisor & RAG',
      f7Desc: 'Server-side LLM advisor grounded in physical simulation data and verified policy knowledge from SREDA, BPDB, and NREL.',
    },
    workflow: {
      badge: 'Four-Step Workflow',
      title: 'How RoofRay Works',
      subtitle: 'From astronomical ephemeris to an exportable investment report in minutes.',
      step1Title: '1. Select Location & Rooftop',
      step1Desc: 'Choose your city across Bangladesh divisional presets or global coordinates, and inspect roof dimensions and utility obstacles.',
      step2Title: '2. Analyze Exposure & Shading',
      step2Desc: 'Run real-time raycasting to visualize solar exposure heatmaps and inspect seasonal shadow dynamics from surrounding structures.',
      step3Title: '3. Optimize Panel Placement',
      step3Desc: 'Generate automated layout configurations targeting Maximum Generation, Lowest Cost, or Balanced Value, or design manually.',
      step4Title: '4. Review Financials & AI Guidance',
      step4Desc: 'Inspect energy yields, configurable payback timelines, carbon mitigation, and consult the AI Solar Advisor for strategic insights.',
    },
    aiTech: {
      badge: 'Responsible AI Architecture',
      title: 'Physics-Grounded Solar Intelligence',
      subtitle: 'Our AI Solar Advisor never guesses physical calculations. It interprets verified simulation truth.',
      groundingTitle: 'Deterministic Physics Engine',
      groundingDesc: 'NOAA ephemeris and Three.js raycasting calculate sun elevation, azimuth, shadow projection, and per-panel kWh output.',
      ragTitle: 'Knowledge Retrieval (RAG)',
      ragDesc: 'Lexical retrieval indexes official documentation from SREDA, BPDB retail tariffs, and NREL PV fundamentals for contextual citations.',
      deterministicTitle: 'Single Source of Truth',
      deterministicDesc: 'The LLM receives verified structured numbers (capacity, annual kWh, costs, exposure). It does not hallucinate math.',
      noHallucinationTitle: 'Explainable Advice & Citations',
      noHallucinationDesc: 'Every recommendation is accompanied by transparent assumptions, risk notices, technical advantages, and cited sources.',
    },
    impact: {
      badge: 'National & Global Impact',
      title: 'Accelerating the Clean Energy Transition',
      subtitle: 'Empowering urban planners, commercial enterprises, and homeowners with verifiable solar intelligence.',
      bdTitle: 'Bangladesh Clean Energy Vision',
      bdDesc: 'Supporting Bangladesh’s renewable energy targets by unlocking dense urban rooftop capacity in Dhaka, Chattogram, and regional industrial zones.',
      globalTitle: 'Global Scalability',
      globalDesc: 'NOAA ephemeris engine operates across any latitude or longitude worldwide, from equatorial Quito to high-latitude Oslo.',
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
  },
};
