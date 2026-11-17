import { retrieveGroundedContext } from '../rag/retrievalEngine';

export interface SolarAdvisorRequest {
  userQuestion?: string;
  selectedBuilding: {
    id: string;
    name: string;
    width: number;
    length: number;
    height: number;
    roofType: string;
    obstaclesCount: number;
  };
  location: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  solarAnalysis?: {
    annualExposurePercent: number;
    unshadedAreaM2: number;
    recommendedZoneAreaM2?: number;
    averageAnnualKWhPerM2?: number;
  };
  energyProfile: {
    installedCapacityKW: number;
    panelCount: number;
    annualGenerationKWh: number;
    annualConsumptionKWh: number;
    solarCoveragePercent: number;
    surplusKWh: number;
  };
  financialResult: {
    totalSystemCost: number;
    annualSavingsUSD: number;
    paybackYears: number | null;
    twentyYearNetSavingsUSD: number;
    roiPercent: number;
    currency?: 'USD' | 'BDT';
    tariffPerKWh?: number;
  };
  environmentalResult: {
    annualCO2ReductionTonnes: number;
    equivalentTreesPlanted: number;
    gridEmissionFactorKgPerKWh?: number;
    gridEmissionFactorSource?: string;
  };
  panelConfig: {
    panelName: string;
    wattage: number;
    tiltDegrees: number;
    orientation: string;
  };
}

export interface SolarAdvisorResponse {
  configured: boolean;
  summary: string;
  recommendations: string[];
  advantages: string[];
  risks: string[];
  assumptions: string[];
  next_steps: string[];
  sources: {
    title: string;
    authorOrg?: string;
    url?: string;
    relevance: string;
  }[];
  timestamp: string;
  modelUsed?: string;
  error?: string;
  setupGuide?: string;
}

// In-memory sliding window rate limiter: 30 requests per minute per IP
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;

export function checkRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(clientIp) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(clientIp, validTimestamps);
    return false; // Exceeded limit
  }

  validTimestamps.push(now);
  rateLimitMap.set(clientIp, validTimestamps);
  return true;
}

export function validateAdvisorPayload(body: any): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a valid JSON object' };
  }
  if (!body.selectedBuilding || !body.energyProfile || !body.location) {
    return { valid: false, error: 'Missing required solar configuration fields (selectedBuilding, energyProfile, location)' };
  }
  if (typeof body.energyProfile.installedCapacityKW !== 'number' || isNaN(body.energyProfile.installedCapacityKW)) {
    return { valid: false, error: 'Invalid energy profile installed capacity' };
  }
  return { valid: true };
}

export async function handleSolarAdvisorRequest(
  payload: SolarAdvisorRequest,
  apiKey?: string,
  modelName: string = 'gemini-2.5-flash'
): Promise<SolarAdvisorResponse> {
  const effectiveKey = apiKey || process.env.GEMINI_API_KEY;
  const effectiveModel = process.env.GEMINI_MODEL || modelName;

  // 1. Perform Lexical RAG Retrieval
  const userQuery = payload.userQuestion || 'Provide an engineering and financial solar recommendation for this rooftop layout';
  const retrievedSources = retrieveGroundedContext(
    userQuery,
    {
      country: payload.location.country,
      city: payload.location.city,
      hasShading: (payload.solarAnalysis?.annualExposurePercent ?? 100) < 85,
      currency: payload.financialResult.currency || 'USD',
      panelCount: payload.energyProfile.panelCount,
    },
    3
  );

  // 2. Check if API Key is configured
  if (!effectiveKey || effectiveKey.trim() === '' || effectiveKey === 'your_gemini_api_key_here') {
    return {
      configured: false,
      summary: 'AI Solar Advisor requires a server-side Gemini API key configuration to generate live natural-language evaluations.',
      recommendations: [
        'Configure GEMINI_API_KEY in the server .env environment file.',
        'Obtain a free or commercial API key from Google AI Studio (https://aistudio.google.com).',
        'Restart the RoofRay application to enable live grounded solar recommendations.',
      ],
      advantages: [
        'Full physical raycast calculations and financial metrics remain 100% active and deterministic without AI.',
      ],
      risks: [
        'Live contextual LLM synthesis is currently paused until credentials are provided.',
      ],
      assumptions: [
        'No external API calls are dispatched when GEMINI_API_KEY is not configured.',
      ],
      next_steps: [
        'Create a .env file containing: GEMINI_API_KEY=your_key_here',
        'Optional: Set GEMINI_MODEL=gemini-2.5-flash',
      ],
      sources: retrievedSources.map((r) => ({
        title: r.chunk.title,
        authorOrg: r.chunk.authorOrg,
        url: r.chunk.officialUrl,
        relevance: `Grounding citation: ${r.chunk.sourceTitle} (${r.chunk.publicationYear})`,
      })),
      timestamp: new Date().toISOString(),
      error: 'MISSING_API_KEY',
      setupGuide:
        'To enable the AI Solar Advisor:\n1. Get an API key from https://aistudio.google.com\n2. Add GEMINI_API_KEY=your_key to .env\n3. Restart RoofRay',
    };
  }

  // 3. Build Prompt with Strict Grounding
  const retrievedContextText = retrievedSources
    .map(
      (s, idx) =>
        `[Citation ${idx + 1}] "${s.chunk.title}" by ${s.chunk.authorOrg} (${s.chunk.publicationYear}): ${s.chunk.content}`
    )
    .join('\n\n');

  const currencySymbol = payload.financialResult.currency === 'BDT' ? '৳' : '$';

  const systemPrompt = `You are the RoofRay AI Solar Advisor, a senior solar engineering and economic specialist at the International AI Builders Congress 2026.
Your role is to interpret the user's solar configuration and provide explainable, rigorous recommendations.

STRICT GROUNDING & RESPONSIBLE AI RULES:
1. SINGLE SOURCE OF TRUTH: You must NOT recalculate, guess, or invent physical solar production, capacity, or financial figures. Use ONLY the exact numbers provided in the structured context below.
2. CITATION GROUNDING: You must ground regulatory, net-metering, and design recommendations in the verified technical citations provided.
3. CLEAR-SKY VS ACTUAL: Explicitly note that the raycasted annual generation is a clear-sky geometric simulation and recommend on-site shading or structural audits.
4. TARIFFS & CURRENCY: Use the provided currency (${payload.financialResult.currency || 'USD'}) and tariff (${currencySymbol}${payload.financialResult.tariffPerKWh || 'N/A'}/kWh).
5. STRUCTURED OUTPUT: Return your response strictly as valid JSON adhering to the specified schema.

STRUCTURED SOLAR CONTEXT:
- Location: ${payload.location.city}, ${payload.location.country} (Lat: ${payload.location.latitude}°, Lon: ${payload.location.longitude}°, Timezone: ${payload.location.timezone})
- Building Geometry: ${payload.selectedBuilding.name} (${payload.selectedBuilding.width}m x ${payload.selectedBuilding.length}m, Height: ${payload.selectedBuilding.height}m, Type: ${payload.selectedBuilding.roofType})
- Rooftop Obstacles: ${payload.selectedBuilding.obstaclesCount} utility obstacles (HVAC / water tanks)
- Array Configuration: ${payload.energyProfile.panelCount} panels (${payload.panelConfig.panelName}, ${payload.panelConfig.wattage}W each, Tilt: ${payload.panelConfig.tiltDegrees}°, Orientation: ${payload.panelConfig.orientation})
- System Capacity: ${payload.energyProfile.installedCapacityKW} kW
- Annual Generation: ${payload.energyProfile.annualGenerationKWh} kWh/yr
- Annual Consumption Demand: ${payload.energyProfile.annualConsumptionKWh} kWh/yr
- Solar Demand Coverage: ${payload.energyProfile.solarCoveragePercent}%
- Grid Export Surplus: ${payload.energyProfile.surplusKWh} kWh/yr
- Financial Capital Cost: ${currencySymbol}${payload.financialResult.totalSystemCost.toLocaleString()}
- Annual Bill Savings: ${currencySymbol}${payload.financialResult.annualSavingsUSD.toLocaleString()}/yr
- Estimated Payback: ${payload.financialResult.paybackYears !== null ? `${payload.financialResult.paybackYears} years` : 'Unspecified tariff'}
- 20-Year Net Benefit: ${currencySymbol}${payload.financialResult.twentyYearNetSavingsUSD.toLocaleString()} (ROI: ${payload.financialResult.roiPercent}%)
- Environmental Offset: ${payload.environmentalResult.annualCO2ReductionTonnes} tonnes CO2/yr (~${payload.environmentalResult.equivalentTreesPlanted} trees)
- Grid Emission Factor: ${payload.environmentalResult.gridEmissionFactorKgPerKWh || 0.42} kg CO2/kWh (${payload.environmentalResult.gridEmissionFactorSource || 'IEA Benchmark'})

VERIFIED KNOWLEDGE CITATIONS:
${retrievedContextText}
`;

  const userPrompt = `User Question / Scenario: "${userQuery}"

Provide a comprehensive, professional assessment formatted as valid JSON adhering to this schema:
{
  "summary": "Concise executive overview of the solar system viability and primary takeaway",
  "recommendations": ["Actionable engineering and economic recommendations"],
  "advantages": ["Key physical and financial advantages of this specific layout"],
  "risks": ["Potential risks (shading penalties, thermal derating, grid limits, structural constraints)"],
  "assumptions": ["Key engineering and economic assumptions behind these figures"],
  "next_steps": ["Concrete next actions for project development"],
  "sources": [{"title": "Source title", "authorOrg": "Publishing entity", "url": "URL if known", "relevance": "Why relevant"}]
}`;

  // 4. Dispatch to Gemini API
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${effectiveModel}:generateContent?key=${effectiveKey}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2, // Low temperature for factual precision
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Gemini API HTTP ${res.status}: ${errorText.substring(0, 200)}`);
    }

    const resJson = await res.json();
    const candidateText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('Gemini API returned empty text part');
    }

    const parsed = JSON.parse(candidateText);

    // Merge retrieved knowledge sources into the response sources list
    const combinedSources = [
      ...retrievedSources.map((r) => ({
        title: r.chunk.title,
        authorOrg: r.chunk.authorOrg,
        url: r.chunk.officialUrl,
        relevance: `Knowledge Retrieval Grounding: ${r.chunk.sourceTitle} (${r.chunk.publicationYear})`,
      })),
      ...(parsed.sources || []),
    ];

    return {
      configured: true,
      summary: parsed.summary || 'Solar configuration analysis generated successfully.',
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      advantages: Array.isArray(parsed.advantages) ? parsed.advantages : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks : [],
      assumptions: Array.isArray(parsed.assumptions) ? parsed.assumptions : [],
      next_steps: Array.isArray(parsed.next_steps) ? parsed.next_steps : [],
      sources: combinedSources.slice(0, 5),
      timestamp: new Date().toISOString(),
      modelUsed: effectiveModel,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const message = err instanceof Error ? err.message : 'Unknown AI generation error';

    return {
      configured: true,
      summary: 'Failed to complete AI synthesis due to an external network or provider error.',
      recommendations: [
        'Review the deterministic 3D raycast metrics and financial tabs directly.',
        'Verify your server internet connectivity and Gemini API key quota.',
      ],
      advantages: [],
      risks: ['External LLM response unavailable; falling back to deterministic calculations.'],
      assumptions: ['Physical solar calculations remain accurate and unaffected.'],
      next_steps: ['Retry the inquiry in a few moments.'],
      sources: retrievedSources.map((r) => ({
        title: r.chunk.title,
        authorOrg: r.chunk.authorOrg,
        url: r.chunk.officialUrl,
        relevance: `Grounding Citation: ${r.chunk.sourceTitle}`,
      })),
      timestamp: new Date().toISOString(),
      error: message,
    };
  }
}
