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
    annualSavingsUSD?: number;
    annualSavings?: number;
    paybackYears: number | null;
    twentyYearNetSavingsUSD?: number;
    twentyYearNetSavings?: number;
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

  // 1. Location Validation
  const loc = body.location;
  if (typeof loc.city !== 'string' || loc.city.trim().length === 0 || loc.city.length > 100) {
    return { valid: false, error: 'Invalid location city (must be 1-100 characters)' };
  }
  if (typeof loc.country !== 'string' || loc.country.trim().length === 0 || loc.country.length > 100) {
    return { valid: false, error: 'Invalid location country (must be 1-100 characters)' };
  }
  if (typeof loc.latitude !== 'number' || isNaN(loc.latitude) || loc.latitude < -90 || loc.latitude > 90) {
    return { valid: false, error: 'Invalid latitude (must be between -90 and 90)' };
  }
  if (typeof loc.longitude !== 'number' || isNaN(loc.longitude) || loc.longitude < -180 || loc.longitude > 180) {
    return { valid: false, error: 'Invalid longitude (must be between -180 and 180)' };
  }

  // 2. Building Validation (supports width/length/height or roofAreaM2/heightMeters)
  const bldg = body.selectedBuilding;
  if (typeof bldg.id !== 'string' || !bldg.id) {
    return { valid: false, error: 'Missing building id' };
  }
  const bldgWidth = bldg.width ?? (bldg.roofAreaM2 ? Math.round(Math.sqrt(bldg.roofAreaM2) * 10) / 10 : undefined);
  const bldgLength = bldg.length ?? (bldg.roofAreaM2 ? Math.round(Math.sqrt(bldg.roofAreaM2) * 10) / 10 : undefined);
  const bldgHeight = bldg.height ?? bldg.heightMeters;

  if (typeof bldgWidth !== 'number' || isNaN(bldgWidth) || bldgWidth <= 0 || bldgWidth > 500) {
    return { valid: false, error: 'Invalid building width (must be between 0.1 and 500 meters)' };
  }
  if (typeof bldgLength !== 'number' || isNaN(bldgLength) || bldgLength <= 0 || bldgLength > 500) {
    return { valid: false, error: 'Invalid building length (must be between 0.1 and 500 meters)' };
  }
  if (typeof bldgHeight !== 'number' || isNaN(bldgHeight) || bldgHeight <= 0 || bldgHeight > 1000) {
    return { valid: false, error: 'Invalid building height (must be between 0.1 and 1000 meters)' };
  }

  // 3. Energy Profile Validation
  const ep = body.energyProfile;
  if (typeof ep.installedCapacityKW !== 'number' || isNaN(ep.installedCapacityKW) || ep.installedCapacityKW < 0 || ep.installedCapacityKW > 10000) {
    return { valid: false, error: 'Invalid installed capacity (must be 0-10000 kW)' };
  }
  if (typeof ep.panelCount !== 'number' || isNaN(ep.panelCount) || ep.panelCount < 0 || ep.panelCount > 20000) {
    return { valid: false, error: 'Invalid panel count (must be 0-20000 modules)' };
  }
  if (typeof ep.annualGenerationKWh !== 'number' || isNaN(ep.annualGenerationKWh) || ep.annualGenerationKWh < 0) {
    return { valid: false, error: 'Invalid annual generation kWh (cannot be negative)' };
  }
  if (typeof ep.annualConsumptionKWh !== 'number' || isNaN(ep.annualConsumptionKWh) || ep.annualConsumptionKWh < 0) {
    return { valid: false, error: 'Invalid annual consumption kWh (cannot be negative)' };
  }

  // 4. Panel Config Validation
  if (body.panelConfig) {
    const pc = body.panelConfig;
    if (typeof pc.wattage === 'number' && (pc.wattage < 50 || pc.wattage > 2000)) {
      return { valid: false, error: 'Invalid panel wattage (must be between 50W and 2000W)' };
    }
    if (typeof pc.tiltDegrees === 'number' && (pc.tiltDegrees < 0 || pc.tiltDegrees > 90)) {
      return { valid: false, error: 'Invalid panel tilt degrees (must be between 0° and 90°)' };
    }
  }

  // 5. Financial Result Validation
  if (body.financialResult) {
    const fin = body.financialResult;
    if (typeof fin.totalSystemCost === 'number' && fin.totalSystemCost < 0) {
      return { valid: false, error: 'Invalid total system cost (cannot be negative)' };
    }
  }

  // 6. User Question Length Guard
  if (body.userQuestion !== undefined && typeof body.userQuestion === 'string' && body.userQuestion.length > 1000) {
    return { valid: false, error: 'User question exceeds maximum allowed length of 1000 characters' };
  }

  return { valid: true };
}

export interface AdvisorResponseSchemaValidationResult {
  valid: boolean;
  error?: string;
  data?: {
    summary: string;
    recommendations: string[];
    advantages: string[];
    risks: string[];
    assumptions: string[];
    next_steps: string[];
  };
}

/**
 * Validates the parsed AI Advisor response against the strict expected schema.
 * Rejects non-string array items (does not silently convert [object Object]).
 */
export function validateAdvisorResponseSchema(parsed: unknown): AdvisorResponseSchemaValidationResult {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { valid: false, error: 'Root must be a non-null JSON object' };
  }

  const obj = parsed as Record<string, unknown>;

  // 1. summary validation
  if (typeof obj.summary !== 'string' || obj.summary.trim().length === 0) {
    return { valid: false, error: 'Property "summary" must be a non-empty string' };
  }
  if (obj.summary.length > 3000) {
    return { valid: false, error: 'Property "summary" exceeds maximum allowed length of 3000 characters' };
  }

  // 2. Validate string arrays
  function validateStringArray(
    fieldName: string,
    required: boolean,
    maxItems: number = 20
  ): { valid: boolean; error?: string; items: string[] } {
    const val = obj[fieldName];
    if (val === undefined || val === null) {
      if (required) {
        return { valid: false, error: `Property "${fieldName}" is required and cannot be omitted`, items: [] };
      }
      return { valid: true, items: [] };
    }

    if (!Array.isArray(val)) {
      return { valid: false, error: `Property "${fieldName}" must be an array of strings`, items: [] };
    }

    if (required && val.length === 0) {
      return { valid: false, error: `Property "${fieldName}" must contain at least one recommendation`, items: [] };
    }

    if (val.length > maxItems) {
      return { valid: false, error: `Property "${fieldName}" exceeds maximum allowed item count of ${maxItems}`, items: [] };
    }

    const items: string[] = [];
    for (let i = 0; i < val.length; i++) {
      const item = val[i];
      // Reject non-string array items (never silently convert [object Object] into string)
      if (typeof item !== 'string') {
        return {
          valid: false,
          error: `Item at index ${i} in "${fieldName}" must be a string; received ${typeof item}`,
          items: [],
        };
      }
      if (item.trim().length === 0) {
        return {
          valid: false,
          error: `Item at index ${i} in "${fieldName}" cannot be an empty or whitespace string`,
          items: [],
        };
      }
      if (item.length > 1500) {
        return {
          valid: false,
          error: `Item at index ${i} in "${fieldName}" exceeds maximum length of 1500 characters`,
          items: [],
        };
      }
      items.push(item.trim());
    }

    return { valid: true, items };
  }

  const recs = validateStringArray('recommendations', true);
  if (!recs.valid) return { valid: false, error: recs.error };

  const advs = validateStringArray('advantages', false);
  if (!advs.valid) return { valid: false, error: advs.error };

  const risks = validateStringArray('risks', false);
  if (!risks.valid) return { valid: false, error: risks.error };

  const assumptions = validateStringArray('assumptions', false);
  if (!assumptions.valid) return { valid: false, error: assumptions.error };

  const nextSteps = validateStringArray('next_steps', false);
  if (!nextSteps.valid) return { valid: false, error: nextSteps.error };

  return {
    valid: true,
    data: {
      summary: obj.summary.trim(),
      recommendations: recs.items,
      advantages: advs.items,
      risks: risks.items,
      assumptions: assumptions.items,
      next_steps: nextSteps.items,
    },
  };
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

  const formattedSources = retrievedSources.map((r) => ({
    title: r.chunk.title,
    authorOrg: r.chunk.authorOrg,
    url: r.chunk.officialUrl,
    relevance: `Lexical RAG Grounding: ${r.chunk.sourceTitle} (${r.chunk.publicationYear})${r.chunk.section ? ` [${r.chunk.section}]` : ''}`,
  }));

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
      sources: formattedSources,
      timestamp: new Date().toISOString(),
      error: 'MISSING_API_KEY',
      setupGuide:
        'To enable the AI Solar Advisor:\n1. Get an API key from https://aistudio.google.com\n2. Add GEMINI_API_KEY=your_key to .env\n3. Restart RoofRay',
    };
  }

  // 3. Build Prompt with Strict Grounding & Separated Instructions
  const retrievedContextText = retrievedSources
    .map(
      (s, idx) =>
        `[Citation ${idx + 1}] "${s.chunk.title}" by ${s.chunk.authorOrg} (${s.chunk.publicationYear}): ${s.chunk.content}`
    )
    .join('\n\n');

  const currencySymbol = payload.financialResult.currency === 'BDT' ? '৳' : '$';
  const annualSavings = payload.financialResult.annualSavings ?? payload.financialResult.annualSavingsUSD ?? 0;
  const twentyYearNet = payload.financialResult.twentyYearNetSavings ?? payload.financialResult.twentyYearNetSavingsUSD ?? 0;

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
- Annual Bill Savings: ${currencySymbol}${annualSavings.toLocaleString()}/yr
- Estimated Payback: ${payload.financialResult.paybackYears !== null ? `${payload.financialResult.paybackYears} years` : 'Unspecified tariff'}
- 20-Year Net Benefit: ${currencySymbol}${twentyYearNet.toLocaleString()} (ROI: ${payload.financialResult.roiPercent}%)
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

  // 4. Dispatch to Gemini API via secured header (never pass credentials in URL parameter)
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${effectiveModel}:generateContent`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': effectiveKey,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }],
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
      if (res.status === 401 || res.status === 403) {
        throw new Error(`INVALID_API_KEY: Authentication failed (HTTP ${res.status}). Verify your Gemini API credential in Google AI Studio.`);
      }
      if (res.status === 429) {
        throw new Error(`QUOTA_EXCEEDED: Gemini API rate limit or quota exceeded (HTTP 429).`);
      }
      throw new Error(`AI_PROVIDER_ERROR: Gemini API responded with HTTP ${res.status}`);
    }

    const resJson = await res.json();
    const candidateText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText || typeof candidateText !== 'string') {
      throw new Error('MALFORMED_AI_RESPONSE: Gemini returned empty or invalid response text');
    }

    let parsed: any;
    try {
      parsed = JSON.parse(candidateText);
    } catch {
      throw new Error('MALFORMED_AI_RESPONSE: Failed to parse AI response as JSON');
    }

    // Strict schema validation for response structure (rejects malformed types, rejects [object Object])
    const schemaValidation = validateAdvisorResponseSchema(parsed);
    if (!schemaValidation.valid || !schemaValidation.data) {
      throw new Error(`MALFORMED_AI_RESPONSE: ${schemaValidation.error || 'Failed schema validation'}`);
    }

    const { summary, recommendations, advantages, risks, assumptions, next_steps } = schemaValidation.data;

    return {
      configured: true,
      summary,
      recommendations,
      advantages,
      risks,
      assumptions,
      next_steps,
      sources: formattedSources,
      timestamp: new Date().toISOString(),
      modelUsed: effectiveModel,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    let errorCode = 'AI_PROVIDER_ERROR';
    let safeMessage = 'An unexpected error occurred while communicating with the AI advisor provider.';

    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        errorCode = 'TIMEOUT';
        safeMessage = 'Gemini API request timed out after 25 seconds. Falling back to deterministic analysis.';
      } else if (err.message.startsWith('INVALID_API_KEY')) {
        errorCode = 'INVALID_API_KEY';
        safeMessage = 'The configured Gemini API key is invalid or unauthorized. Please verify the key in Google AI Studio.';
      } else if (err.message.startsWith('QUOTA_EXCEEDED')) {
        errorCode = 'QUOTA_EXCEEDED';
        safeMessage = 'Gemini API quota exceeded or rate limit reached. Please retry in a few moments.';
      } else if (err.message.startsWith('MALFORMED_AI_RESPONSE')) {
        errorCode = 'MALFORMED_AI_RESPONSE';
        safeMessage = 'AI model generated non-standard JSON. Physical solar calculations remain fully valid.';
      }
    }

    return {
      configured: true,
      summary: safeMessage,
      recommendations: [
        'Review the deterministic 3D raycast metrics and financial tabs directly.',
        'Verify your server internet connectivity and Gemini API key quota.',
      ],
      advantages: [],
      risks: ['External LLM response unavailable; falling back to deterministic calculations.'],
      assumptions: ['Physical solar calculations remain accurate, deterministic, and unaffected.'],
      next_steps: ['Retry the inquiry in a few moments.'],
      sources: formattedSources,
      timestamp: new Date().toISOString(),
      error: errorCode,
    };
  }
}
