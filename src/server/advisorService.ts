import { retrieveGroundedContext } from '../rag/retrievalEngine';

export interface ConversationMessageContext {
  role: 'user' | 'assistant' | 'model';
  content: string;
}

export interface SolarAdvisorRequest {
  userQuestion?: string;
  conversationHistory?: ConversationMessageContext[];
  language?: 'en' | 'bn';
  selectedBuilding: {
    id: string;
    name: string;
    width: number;
    length: number;
    height: number;
    roofType: string;
    obstaclesCount: number;
    roofOrientation?: string;
    roofAzimuthDeg?: number;
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  location: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
    northOffsetDeg?: number;
  };
  solarAnalysis?: {
    annualExposurePercent?: number;
    unshadedAreaM2: number;
    recommendedZoneAreaM2?: number;
    averageAnnualKWhPerM2?: number;
    liveExposurePercent?: number;
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
// Hardened with periodic pruning & max-tracked-IP LRU eviction to prevent unbounded memory growth
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;
const MAX_TRACKED_IPS = 10000;
let checkCounter = 0;

export function cleanupRateLimitStore(now: number = Date.now()): number {
  let prunedCount = 0;
  for (const [ip, timestamps] of rateLimitMap.entries()) {
    const valid = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (valid.length === 0) {
      rateLimitMap.delete(ip);
      prunedCount++;
    } else if (valid.length !== timestamps.length) {
      rateLimitMap.set(ip, valid);
    }
  }
  return prunedCount;
}

export function resetRateLimitStore(): void {
  rateLimitMap.clear();
}

export function getRateLimitStats() {
  return {
    trackedIpsCount: rateLimitMap.size,
    maxTrackedIps: MAX_TRACKED_IPS,
    windowMs: RATE_LIMIT_WINDOW_MS,
    maxRequestsPerWindow: MAX_REQUESTS_PER_WINDOW,
  };
}

export function checkRateLimit(clientIp: string): boolean {
  const now = Date.now();
  checkCounter++;
  
  // Periodic proactive eviction every 250 requests or if map exceeds threshold
  if (checkCounter % 250 === 0 || rateLimitMap.size > 2000) {
    cleanupRateLimitStore(now);
  }

  const timestamps = rateLimitMap.get(clientIp) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(clientIp, validTimestamps);
    return false; // Exceeded limit
  }

  // LRU protection against unbounded growth: evict oldest entry if capacity reached
  if (!rateLimitMap.has(clientIp) && rateLimitMap.size >= MAX_TRACKED_IPS) {
    const oldestKey = rateLimitMap.keys().next().value;
    if (oldestKey) rateLimitMap.delete(oldestKey);
  }

  validTimestamps.push(now);
  rateLimitMap.set(clientIp, validTimestamps);
  return true;
}

// ==============================================================================
// Circuit Breaker for Upstream LLM / Gemini Service (Release-It & DDIA Pattern)
// ==============================================================================
export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
  private state: CircuitBreakerState = 'CLOSED';
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private readonly failureThreshold: number;
  private readonly cooldownMs: number;

  constructor(failureThreshold: number = 3, cooldownMs: number = 30000) {
    this.failureThreshold = failureThreshold;
    this.cooldownMs = cooldownMs;
  }

  getState(): CircuitBreakerState {
    if (this.state === 'OPEN') {
      const now = Date.now();
      if (now - this.lastFailureTime >= this.cooldownMs) {
        this.state = 'HALF_OPEN';
      }
    }
    return this.state;
  }

  canExecute(): boolean {
    const currentState = this.getState();
    return currentState === 'CLOSED' || currentState === 'HALF_OPEN';
  }

  recordSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }

  getStats() {
    return {
      state: this.getState(),
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime ? new Date(this.lastFailureTime).toISOString() : null,
      failureThreshold: this.failureThreshold,
      cooldownMs: this.cooldownMs,
    };
  }
}

export const advisorCircuitBreaker = new CircuitBreaker(3, 30000);

export function validateAdvisorPayload(body: any): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a valid JSON object' };
  }
  if (!body.selectedBuilding || !body.energyProfile || !body.location) {
    return { valid: false, error: 'Missing required solar configuration fields (selectedBuilding, energyProfile, location)' };
  }

  // 1. Location Validation
  if (body.language !== undefined && body.language !== 'en' && body.language !== 'bn') {
    return { valid: false, error: 'Invalid language (must be "en" or "bn")' };
  }
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

  // 7. Conversation History Guard
  if (body.conversationHistory !== undefined) {
    if (!Array.isArray(body.conversationHistory)) {
      return { valid: false, error: 'Invalid conversationHistory (must be an array)' };
    }
    if (body.conversationHistory.length > 20) {
      return { valid: false, error: 'conversationHistory exceeds maximum allowed limit of 20 items' };
    }
    for (const msg of body.conversationHistory) {
      if (!msg || typeof msg !== 'object') {
        return { valid: false, error: 'Invalid conversation message entry' };
      }
      if (typeof msg.content !== 'string' || msg.content.length > 4000) {
        return { valid: false, error: 'Invalid conversation message content (must be string <= 4000 chars)' };
      }
      if (msg.role !== 'user' && msg.role !== 'assistant' && msg.role !== 'model') {
        return { valid: false, error: 'Invalid conversation message role (must be user, assistant, or model)' };
      }
    }
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

export interface DetectedLocation {
  city?: string;
  country: string;
  latitude: number;
  longitude: number;
  hemisphere: 'Northern' | 'Southern';
}

export interface LocationReconciliation {
  explicitQuestionLocation?: DetectedLocation;
  hasLocationConflict: boolean;
  effectiveTargetLocation: DetectedLocation;
  explanationNote?: string;
}

export function detectExplicitLocationInQuery(query?: string): DetectedLocation | null {
  if (!query || typeof query !== 'string') return null;
  const lower = query.toLowerCase();

  const bangladeshCities: Record<string, { city: string; lat: number; lon: number }> = {
    dhaka: { city: 'Dhaka', lat: 23.8103, lon: 90.4125 },
    chattogram: { city: 'Chattogram', lat: 22.3569, lon: 91.7832 },
    chittagong: { city: 'Chattogram', lat: 22.3569, lon: 91.7832 },
    sylhet: { city: 'Sylhet', lat: 24.8949, lon: 91.8687 },
    rajshahi: { city: 'Rajshahi', lat: 24.3636, lon: 88.6241 },
    khulna: { city: 'Khulna', lat: 22.8456, lon: 89.5403 },
    barishal: { city: 'Barishal', lat: 22.7010, lon: 90.3535 },
    barisal: { city: 'Barishal', lat: 22.7010, lon: 90.3535 },
    rangpur: { city: 'Rangpur', lat: 25.7439, lon: 89.2752 },
    mymensingh: { city: 'Mymensingh', lat: 24.7471, lon: 90.4203 },
    comilla: { city: 'Cumilla', lat: 23.4607, lon: 91.1809 },
    gazipur: { city: 'Gazipur', lat: 23.9999, lon: 90.4203 },
    narayanganj: { city: 'Narayanganj', lat: 23.6238, lon: 90.5000 },
  };

  for (const [key, data] of Object.entries(bangladeshCities)) {
    if (new RegExp(`\\b${key}\\b`, 'i').test(lower)) {
      return {
        city: data.city,
        country: 'Bangladesh',
        latitude: data.lat,
        longitude: data.lon,
        hemisphere: 'Northern',
      };
    }
  }

  if (/\b(meridian commercial tower|meridian tower)\b/i.test(lower)) {
    return {
      city: 'Rajshahi',
      country: 'Bangladesh',
      latitude: 24.3636,
      longitude: 88.6241,
      hemisphere: 'Northern',
    };
  }

  if (/\b(bangladesh|bd)\b/i.test(lower)) {
    return {
      country: 'Bangladesh',
      latitude: 23.8103,
      longitude: 90.4125,
      hemisphere: 'Northern',
    };
  }

  if (/\bsan francisco\b/i.test(lower)) {
    return {
      city: 'San Francisco, CA',
      country: 'United States',
      latitude: 37.7749,
      longitude: -122.4194,
      hemisphere: 'Northern',
    };
  }
  if (/\b(california|ca)\b/i.test(lower)) {
    return {
      city: 'California',
      country: 'United States',
      latitude: 36.7783,
      longitude: -119.4179,
      hemisphere: 'Northern',
    };
  }
  if (/\b(usa|united states|u\.s\.)\b/i.test(lower)) {
    return {
      country: 'United States',
      latitude: 37.0902,
      longitude: -95.7129,
      hemisphere: 'Northern',
    };
  }

  if (/\b(sydney|australia|melbourne|brisbane)\b/i.test(lower)) {
    return {
      city: 'Sydney',
      country: 'Australia',
      latitude: -33.8688,
      longitude: 151.2093,
      hemisphere: 'Southern',
    };
  }

  if (/\b(london|uk|united kingdom|great britain)\b/i.test(lower)) {
    return {
      city: 'London',
      country: 'United Kingdom',
      latitude: 51.5074,
      longitude: -0.1278,
      hemisphere: 'Northern',
    };
  }

  return null;
}

export function resolveLocationReconciliation(payload: SolarAdvisorRequest): LocationReconciliation {
  const queryLoc = detectExplicitLocationInQuery(payload.userQuestion);

  // Single Source of Truth: Check if selected building configuration defines its own location (e.g. Meridian Commercial Tower in Rajshahi)
  const isMeridianTower =
    payload.selectedBuilding?.name?.toLowerCase().includes('meridian') ||
    payload.selectedBuilding?.id === 'bldg-2';

  const buildingCity =
    payload.selectedBuilding?.city ||
    (isMeridianTower ? 'Rajshahi' : payload.location?.city || '');
  const buildingCountry =
    payload.selectedBuilding?.country ||
    (isMeridianTower ? 'Bangladesh' : payload.location?.country || '');
  const buildingLat =
    payload.selectedBuilding?.latitude ??
    (isMeridianTower ? 24.3636 : typeof payload.location?.latitude === 'number' ? payload.location.latitude : 0);
  const buildingLon =
    payload.selectedBuilding?.longitude ??
    (isMeridianTower ? 88.6241 : typeof payload.location?.longitude === 'number' ? payload.location.longitude : 0);
  const buildingHemisphere = buildingLat >= 0 ? 'Northern' : 'Southern';

  if (!queryLoc) {
    return {
      hasLocationConflict: false,
      effectiveTargetLocation: {
        city: buildingCity,
        country: buildingCountry,
        latitude: buildingLat,
        longitude: buildingLon,
        hemisphere: buildingHemisphere,
      },
    };
  }

  const isSameCountry =
    queryLoc.country.toLowerCase() === buildingCountry.toLowerCase() ||
    (queryLoc.country === 'United States' && (buildingCountry === 'USA' || buildingCountry === 'United States')) ||
    (queryLoc.country === 'Bangladesh' && buildingCountry === 'Bangladesh');

  const isSameCity =
    !queryLoc.city ||
    (Boolean(buildingCity) && Boolean(queryLoc.city) && (
      buildingCity.toLowerCase().includes(queryLoc.city.toLowerCase()) ||
      queryLoc.city.toLowerCase().includes(buildingCity.toLowerCase())
    ));

  if (isSameCountry && isSameCity) {
    return {
      explicitQuestionLocation: queryLoc,
      hasLocationConflict: false,
      effectiveTargetLocation: {
        city: queryLoc.city || buildingCity,
        country: queryLoc.country,
        latitude: queryLoc.city ? queryLoc.latitude : buildingLat,
        longitude: queryLoc.city ? queryLoc.longitude : buildingLon,
        hemisphere: queryLoc.hemisphere,
      },
    };
  }

  const targetCity = queryLoc.city ? `${queryLoc.city}, ${queryLoc.country}` : queryLoc.country;
  const buildingLocStr = buildingCity ? `${buildingCity}, ${buildingCountry}` : buildingCountry;
  const explanation = `User inquiry explicitly specifies ${targetCity}, whereas the currently active 3D model building ("${payload.selectedBuilding?.name || 'Selected Building'}") is situated in ${buildingLocStr}.`;

  return {
    explicitQuestionLocation: queryLoc,
    hasLocationConflict: true,
    effectiveTargetLocation: queryLoc,
    explanationNote: explanation,
  };
}

export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite';

export function resolveGeminiModel(customModel?: string): string {
  const envModel = process.env.GEMINI_MODEL?.trim();
  if (envModel) return envModel;
  if (customModel?.trim()) return customModel.trim();
  return DEFAULT_GEMINI_MODEL;
}

interface GeminiApiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
      role?: string;
    };
    finishReason?: string;
  }>;
  error?: {
    code?: number;
    message?: string;
    status?: string;
    details?: unknown[];
  };
}

export interface GeminiExecutionResult {
  ok: boolean;
  httpStatus: number;
  statusText: string;
  candidateText?: string;
  errorCode: string;
  userMessage: string;
  safeMessage: string;
  providerStatus?: string;
}

export async function executeGeminiRequest(
  targetModel: string,
  key: string,
  systemPrompt: string,
  userPrompt: string,
  timeoutMs: number = 25000
): Promise<GeminiExecutionResult> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key,
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

    const resJson = (await res.json().catch(() => null)) as GeminiApiResponse | null;

    if (!res.ok) {
      const providerStatus = resJson?.error?.status || '';
      let rawMsg = resJson?.error?.message || res.statusText || 'Unknown provider error';
      if (key) {
        rawMsg = rawMsg.split(key).join('[REDACTED_API_KEY]');
      }

      let errorCode = 'AI_PROVIDER_ERROR';
      let userMessage = 'Google Gemini service encountered an error. Your deterministic solar calculations remain available.';
      let safeMessage = `Gemini API error (HTTP ${res.status}): ${rawMsg}`;

      if (res.status === 400) {
        errorCode = 'INVALID_REQUEST';
        userMessage = 'Invalid request payload or configuration for AI Advisor.';
        safeMessage = `Invalid request or configuration (HTTP 400). Provider detail: ${rawMsg}${providerStatus ? ` [${providerStatus}]` : ''}`;
      } else if (res.status === 401) {
        errorCode = 'AUTHENTICATION_FAILED';
        userMessage = 'Gemini authentication or project permission needs attention.';
        safeMessage = `Authentication failed (HTTP 401). Verify that your Gemini API key is valid. Provider detail: ${rawMsg}`;
      } else if (res.status === 403) {
        errorCode = 'PERMISSION_DENIED';
        userMessage = 'Gemini authentication or project permission needs attention.';
        safeMessage = `Permission or API restriction failure (HTTP 403). Ensure Generative Language API is enabled and project permissions are active. Provider detail: ${rawMsg}${providerStatus ? ` [${providerStatus}]` : ''}`;
      } else if (res.status === 404) {
        errorCode = 'MODEL_UNAVAILABLE';
        userMessage = 'The configured Gemini model is unavailable. Please verify the model configuration.';
        safeMessage = `The configured Gemini model "${targetModel}" is unavailable (HTTP 404). Provider detail: ${rawMsg}`;
      } else if (res.status === 429) {
        errorCode = 'RATE_LIMIT_EXCEEDED';
        userMessage = 'Gemini AI Advisor has temporarily reached its API usage limit. Your deterministic solar calculations remain available.';
        safeMessage = `Gemini rate limit or quota exceeded (HTTP 429). Provider detail: ${rawMsg}`;
      } else if (res.status === 503) {
        errorCode = 'SERVICE_UNAVAILABLE';
        userMessage = 'Google Gemini service is temporarily unavailable or experiencing high demand. Your deterministic solar calculations remain available.';
        safeMessage = `Model "${targetModel}" is currently experiencing temporary high demand or outage (HTTP 503). Provider detail: ${rawMsg}`;
      } else if (res.status >= 500) {
        errorCode = 'PROVIDER_ERROR';
        userMessage = 'Google Gemini service encountered an internal error. Your deterministic solar calculations remain available.';
        safeMessage = `Google Gemini service error (HTTP ${res.status}). Provider detail: ${rawMsg}`;
      }

      return {
        ok: false,
        httpStatus: res.status,
        statusText: res.statusText,
        errorCode,
        userMessage,
        safeMessage,
        providerStatus,
      };
    }

    const candidateText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText || typeof candidateText !== 'string') {
      return {
        ok: false,
        httpStatus: 200,
        statusText: 'OK',
        errorCode: 'MALFORMED_AI_RESPONSE',
        userMessage: 'Gemini returned an empty candidate content block. Your deterministic solar calculations remain available.',
        safeMessage: 'Gemini returned an empty or invalid candidate content block.',
      };
    }

    return {
      ok: true,
      httpStatus: 200,
      statusText: 'OK',
      candidateText,
      errorCode: '',
      userMessage: '',
      safeMessage: '',
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    let errorCode = 'AI_PROVIDER_ERROR';
    let userMessage = 'Failed to communicate with Google Gemini service. Your deterministic solar calculations remain available.';
    let safeMessage = 'An unexpected error occurred while communicating with the AI advisor provider.';

    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        errorCode = 'TIMEOUT';
        userMessage = 'Gemini API request timed out. Your deterministic solar calculations remain available.';
        safeMessage = `Gemini API request timed out after ${Math.round(timeoutMs / 1000)} seconds.`;
      } else {
        safeMessage = err.message;
        if (key) {
          safeMessage = safeMessage.split(key).join('[REDACTED_API_KEY]');
        }
      }
    }

    return {
      ok: false,
      httpStatus: 0,
      statusText: 'FETCH_ERROR',
      errorCode,
      userMessage,
      safeMessage,
    };
  }
}

export async function handleSolarAdvisorRequest(
  payload: SolarAdvisorRequest,
  apiKey?: string,
  modelName: string = DEFAULT_GEMINI_MODEL
): Promise<SolarAdvisorResponse> {
  const rawKey = apiKey !== undefined ? apiKey : (process.env.GEMINI_API_KEY || '');
  const effectiveKey = rawKey.trim().replace(/^["']|["']$/g, '').trim();
  const effectiveModel = resolveGeminiModel(modelName);

  // 1. Resolve Location & Reconcile Explicit Query Location with Active 3D Model
  let locationReconciliation = resolveLocationReconciliation(payload);
  if (!locationReconciliation.explicitQuestionLocation && payload.conversationHistory?.length) {
    for (let i = payload.conversationHistory.length - 1; i >= 0; i--) {
      const msg = payload.conversationHistory[i];
      if (msg.role === 'user') {
        const prevLoc = detectExplicitLocationInQuery(msg.content);
        if (prevLoc) {
          const bCity = payload.location?.city || '';
          const bCountry = payload.location?.country || '';
          const hasConflict = prevLoc.country !== bCountry || (Boolean(prevLoc.city) && Boolean(bCity) && !bCity.toLowerCase().includes(prevLoc.city!.toLowerCase()));
          locationReconciliation = {
            explicitQuestionLocation: prevLoc,
            hasLocationConflict: hasConflict,
            effectiveTargetLocation: prevLoc,
            explanationNote: `Continuing discussion for ${prevLoc.city ? prevLoc.city + ', ' : ''}${prevLoc.country} based on prior conversational context.`,
          };
          break;
        }
      }
    }
  }
  const targetLoc = locationReconciliation.effectiveTargetLocation;
  const effectiveCountry = targetLoc.country;
  const effectiveCity = targetLoc.city;
  const effectiveCurrency = effectiveCountry === 'Bangladesh' ? 'BDT' : (payload.financialResult.currency || 'USD');

  // 2. Perform Lexical RAG Retrieval grounded in Target Location
  const userQuery = payload.userQuestion || 'Provide an engineering and financial solar recommendation for this rooftop layout';
  const retrievedSources = retrieveGroundedContext(
    userQuery,
    {
      country: effectiveCountry,
      city: effectiveCity,
      hasShading: (payload.solarAnalysis?.annualExposurePercent ?? 100) < 85,
      currency: effectiveCurrency,
      panelCount: payload.energyProfile.panelCount,
    },
    3
  );

  const formattedSources = retrievedSources.map((r) => ({
    title: r.chunk.title,
    authorOrg: r.chunk.authorOrg,
    url: r.chunk.officialUrl,
    relevance: `RAG Grounding (${r.chunk.category.includes('bangladesh') ? 'Official Bangladesh Policy/Tariff' : 'International Technical Reference'}): ${r.chunk.sourceTitle} (${r.chunk.publicationYear})${r.chunk.section ? ` [${r.chunk.section}]` : ''}`,
  }));

  // 3. Check if API Key is configured
  if (!effectiveKey || effectiveKey === 'your_gemini_api_key_here' || effectiveKey.length < 10) {
    if (payload.language === 'bn') {
      return {
        configured: false,
        summary: 'লাইভ এআই সৌর মূল্যায়ন তৈরির জন্য সার্ভার-সাইড Gemini API কি কনফিগার করা প্রয়োজন।',
        recommendations: [
          'সার্ভারের .env ফাইলে GEMINI_API_KEY কনফিগার করুন।',
          'Google AI Studio (https://aistudio.google.com) থেকে একটি ফ্রি বা বাণিজ্যিক API কি সংগ্রহ করুন।',
          'লাইভ সৌরবিদ্যুৎ সুপারিশ সক্রিয় করতে RoofRay অ্যাপ্লিকেশন পুনরায় চালু করুন।',
        ],
        advantages: [
          'এআই ছাড়াও সম্পূর্ণ ফিজিক্যাল রেইকাস্ট সিমুলেশন ও আর্থিক হিসাব ১০০% সক্রিয় এবং অপরিবর্তিত থাকে।',
        ],
        risks: [
          'API ক্রিডেনশিয়াল কনফিগার না করা পর্যন্ত লাইভ এলএলএম সিন্থেসিস স্থগিত থাকবে।',
        ],
        assumptions: [
          'GEMINI_API_KEY কনফিগার না থাকলে কোনো বাহ্যিক API কল পাঠানো হয় না।',
        ],
        next_steps: [
          'একটি .env ফাইল তৈরি করে লিখুন: GEMINI_API_KEY=your_key_here',
          `ঐচ্ছিক: সেট করুন GEMINI_MODEL=${DEFAULT_GEMINI_MODEL}`,
        ],
        sources: formattedSources,
        timestamp: new Date().toISOString(),
        error: 'MISSING_API_KEY',
        setupGuide:
          'এআই সোলার অ্যাডভাইজর চালু করতে:\n১. https://aistudio.google.com থেকে API কি নিন\n২. .env ফাইলে GEMINI_API_KEY=আপনার_কি যোগ করুন\n৩. RoofRay পুনরায় চালু করুন',
      };
    }

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
        `Optional: Set GEMINI_MODEL=${DEFAULT_GEMINI_MODEL}`,
      ],
      sources: formattedSources,
      timestamp: new Date().toISOString(),
      error: 'MISSING_API_KEY',
      setupGuide:
        'To enable the AI Solar Advisor:\n1. Get an API key from https://aistudio.google.com\n2. Add GEMINI_API_KEY=your_key to .env\n3. Restart RoofRay',
    };
  }

  // 4. Build Prompt with Strict Grounding & Separated Instructions
  const retrievedContextText = retrievedSources
    .map(
      (s, idx) =>
        `[Citation ${idx + 1}] "${s.chunk.title}" by ${s.chunk.authorOrg} (${s.chunk.publicationYear}):
Document Source: ${s.chunk.sourceTitle} [${s.chunk.section || 'General'}]
Document Classification: ${s.chunk.category.includes('bangladesh') ? 'BANGLADESH STATUTORY / REGULATORY FRAMEWORK' : 'INTERNATIONAL TECHNICAL & PHYSICAL PV GUIDANCE'}
Official Link: ${s.chunk.officialUrl}
Verified Excerpt: ${s.chunk.content}`
    )
    .join('\n\n');

  const currencySymbol = payload.financialResult.currency === 'BDT' ? '৳' : '$';
  const annualSavings = payload.financialResult.annualSavings ?? payload.financialResult.annualSavingsUSD ?? 0;
  const twentyYearNet = payload.financialResult.twentyYearNetSavings ?? payload.financialResult.twentyYearNetSavingsUSD ?? 0;

  let locationDirective = '';
  if (locationReconciliation.hasLocationConflict) {
    locationDirective = `
================================================================================
CRITICAL LOCATION DISCREPANCY & GEOGRAPHIC RECONCILIATION DIRECTIVE:
- TARGET LOCATION IN USER INQUIRY: ${targetLoc.city ? targetLoc.city + ', ' : ''}${targetLoc.country} (Latitude: ~${targetLoc.latitude}°, ${targetLoc.hemisphere} Hemisphere)
- ACTIVE 3D WORKSPACE SCENE: Building "${payload.selectedBuilding.name}" currently positioned at ${payload.location.city}, ${payload.location.country}
- ${locationReconciliation.explanationNote}

MANDATORY LOCATION RULES:
1. ACKNOWLEDGE THE INQUIRY LOCATION: You MUST acknowledge that the user specifically requested analysis for ${targetLoc.city ? targetLoc.city + ', ' : ''}${targetLoc.country}.
2. DO NOT DESCRIBE THE BUILDING AS BEING IN ${payload.location.city.toUpperCase()}: Under NO circumstances describe the installation as being in ${payload.location.city} or state "The ${payload.energyProfile.installedCapacityKW} kW solar rooftop installation at ${payload.selectedBuilding.name} in ${payload.location.city}...".
3. EXPLAIN THE DISTINCTION IN YOUR SUMMARY: Clearly explain in your summary that you are applying the physical rooftop dimensions (${payload.selectedBuilding.width}m x ${payload.selectedBuilding.length}m, ${payload.selectedBuilding.obstaclesCount} obstacles) and system layout (${payload.energyProfile.installedCapacityKW} kW) of the active 3D model to the requested location of ${targetLoc.city ? targetLoc.city + ', ' : ''}${targetLoc.country}.
4. SOLAR ORIENTATION & EPHEMERIS: Use ${targetLoc.country}'s geographic reality (${targetLoc.hemisphere} Hemisphere, latitude ~${targetLoc.latitude}°). Panels must face the equator (${targetLoc.hemisphere === 'Northern' ? 'due True South / Azimuth 180°' : 'due True North / Azimuth 0°'}). In ${targetLoc.city || targetLoc.country}, an optimal fixed tilt of ~15° balances year-round insolation with monsoon rain self-cleaning and reduced wind uplift.
5. REGULATORY & ECONOMIC FRAMEWORK: Apply ${targetLoc.country}'s regulatory guidelines (e.g. SREDA Net Metering Guidelines 2025 in Bangladesh: 100% sanctioned load cap, single-phase and three-phase consumer eligibility, 80% distribution transformer cap for MT/HT/EHT). DO NOT apply US tariffs, California NEM 3.0, or US tax incentives when answering for ${targetLoc.country}.
================================================================================
`;
  } else {
    locationDirective = `
GEOGRAPHICAL & BUILDING CONTEXT:
- Location: ${targetLoc.city || payload.location.city}, ${targetLoc.country || payload.location.country} (Lat: ${targetLoc.latitude}°, Lon: ${targetLoc.longitude}°, Timezone: ${payload.location.timezone}, ${targetLoc.hemisphere} Hemisphere)
- Building: "${payload.selectedBuilding.name}" in its active location of ${targetLoc.city || payload.location.city}, ${targetLoc.country || payload.location.country}.
`;
  }

  const systemPrompt = `You are the RoofRay AI Solar Advisor, a senior solar engineering and economic specialist at the International AI Builders Congress 2026.
Your role is to interpret the user's solar configuration and provide explainable, rigorous recommendations.

${locationDirective}
${payload.language === 'bn' ? `
================================================================================
CRITICAL LANGUAGE DIRECTIVE (BENGALI / বাংলা LOCALIZATION):
- The user has selected বাংলা (Bengali) as the active interface language.
- You MUST write the ENTIRE JSON response (summary, recommendations, advantages, risks, assumptions, next_steps) in natural, grammatically correct, highly fluent, professional Bengali (বাংলা).
- Do not produce awkward or machine-translated literal phrasing. Write as an authoritative Bangladeshi solar engineer and financial consultant.
- Use natural terminology (e.g. সৌরবিদ্যুৎ উৎপাদনের সম্ভাবনা, নেট মিটারিং, অনুমোদিত লোড, ছাদের প্রতিবন্ধকতা, দ্বিমুখী মিটার, বিনিয়োগ ফেরতের সময়, বার্ষিক বিদ্যুৎ সাশ্রয়, নিট ক্যাশ লাভ).
- Keep international engineering units and statutory acronyms intact (e.g. SREDA, BPDB, IEEE 1547, IEC 62116, IEC 61727, kW, kWh, kWh/m², ৳/BDT, USD, CO₂, ROI, Gemini, Inverter).
================================================================================
` : ''}
STRICT GROUNDING & RESPONSIBLE AI RULES:
1. SINGLE SOURCE OF TRUTH (STRICT NUMERICAL ACCURACY):
   - You must NOT recalculate, guess, or invent physical solar production, capacity, or financial figures. Use ONLY the exact numbers provided in the structured context below.
   - Installed capacity is EXACTLY ${payload.energyProfile.installedCapacityKW} kW (${payload.energyProfile.panelCount} panels).
   - Annual generation is EXACTLY ${payload.energyProfile.annualGenerationKWh} kWh/yr.
   - Annual consumption is EXACTLY ${payload.energyProfile.annualConsumptionKWh} kWh/yr (${payload.energyProfile.solarCoveragePercent}% coverage).
   - Capital cost is ${currencySymbol}${payload.financialResult.totalSystemCost.toLocaleString()}.
   - Electricity tariff is ${currencySymbol}${payload.financialResult.tariffPerKWh !== undefined ? payload.financialResult.tariffPerKWh : 'N/A'}/kWh.
   - Annual bill savings is ${currencySymbol}${annualSavings.toLocaleString()}/yr.
   - Payback period is ${payload.financialResult.paybackYears !== null ? `${payload.financialResult.paybackYears} years` : 'Unspecified tariff'}.
   - 20-Year net savings is ${currencySymbol}${twentyYearNet.toLocaleString()} (ROI: ${payload.financialResult.roiPercent}%).
   - Never mix or convert currencies: use ${payload.financialResult.currency || 'USD'} (${currencySymbol}) consistently as calculated by RoofRay.

2. CITATION GROUNDING & REGULATORY DISTINCTION:
   - Ground regulatory, net-metering, and design recommendations in the verified technical citations provided (prioritize SREDA Net Metering Guidelines 2025).
   - Distinguish strictly between legally mandated requirements and general engineering recommendations:
     * Mandated Bangladesh Regulations (SREDA Net Metering Guidelines 2025 / BPDB):
       - Eligibility: Both single-phase and three-phase consumers qualify for rooftop grid-tied solar. Inverter phase output must strictly match the consumer service connection phase.
       - AC Capacity Limit: Installed AC inverter capacity must not exceed 100% of the consumer sanctioned load (replacing the former 70% limit, which remains only as historical reference; do NOT present 70% as a universal current requirement).
       - Transformer Capacity Limit: For medium-voltage (MV), high-voltage (HV), and extra-high-voltage (EHT) consumers, total connected solar capacity must not exceed 80% of distribution transformer/substation rated capacity.
       - Grid Interconnection & Anti-Islanding Standards: Inverters must be tested according to IEC 62116 for anti-islanding (mandatory automatic disconnection within <= 2.0 seconds of utility power interruption) and comply with applicable utility interface standards (IEC 61727 or IEEE 1547). Do NOT claim all standards must be applied simultaneously.
       - Utility-grade bi-directional net energy meters required for energy accounting.
     * General Engineering Recommendations: 0.8m to 1.5m perimeter setbacks and 0.5m to 1.0m obstacle clearances are engineering design best practices for wind mitigation, maintenance access, and firefighter pathway egress. DO NOT claim 0.5m or 0.8m is an official statutory SREDA code without verified citation.
     * Never present an international NREL publication as a Bangladesh government regulation.

3. FINANCIAL TRANSPARENCY, GENERATION VS CONSUMPTION & LIFECYCLE LIMITATIONS:
   - Annual Energy Coverage vs Real-Time Self-Consumption: Refer to the ${payload.energyProfile.solarCoveragePercent}% metric specifically as "annual energy coverage" (ratio of annual solar generation to annual electricity consumption demand). Do NOT claim actual real-time self-consumption without 15-minute / hourly interval smart meter load profile data.
   - Tariff Modeling & Flat-Tariff Net Metering: Bill savings (${currencySymbol}${annualSavings.toLocaleString()}/yr) represent an annualized flat-tariff net-metering estimate under the applied tariff (${currencySymbol}${payload.financialResult.tariffPerKWh !== undefined ? payload.financialResult.tariffPerKWh : 'N/A'}/kWh).
   - Distinguish transparently among:
     * Theoretical generation (simulated clear-sky raycast generation: ${payload.energyProfile.annualGenerationKWh.toLocaleString()} kWh/yr).
     * Instantaneous self-consumption (solar energy consumed behind the meter during daylight hours).
     * Grid export surplus (${payload.energyProfile.surplusKWh.toLocaleString()} kWh/yr surplus delivered to utility).
     * Grid import (utility electricity drawn during nights and cloudy periods).
     * Export credits vs retail offset (credited at wholesale net-metering settlement rate vs retail offset).
   - 20-Year Financial Lifecycle Disclosures: Explicitly disclose that 20-year net savings (${currencySymbol}${twentyYearNet.toLocaleString()}) is a simplified linear projection that does not account for:
     * Annual PV module degradation (~0.5%/year).
     * Inverter replacement required around year 10–12 of operation.
     * Recurring operations and maintenance costs (O&M ~1%/year of capex).
     * Financial discount rates or inflation.

4. CARBON EMISSION FACTOR & REPORTING PERIOD:
   - For Bangladesh grid calculations, use the verified Department of Environment (DoE) & SREDA reported combined margin factor of 0.62 tCO2/MWh (0.62 kg CO2/kWh) for the 2021–2023 reporting period.
   - Do NOT cite or use unverified figures such as 0.637 kg CO2/kWh.
   - Calculate transparently: Annual Generation (kWh) × 0.62 / 1000 = Tonnes CO2/yr (e.g. 6,056 kWh × 0.62 / 1000 = 3.755 tonnes CO2/yr).

5. STRUCTURED OUTPUT:
   - Return your response strictly as valid JSON adhering to the specified schema.

STRUCTURED SOLAR CONTEXT:
- Active 3D Building Geometry: ${payload.selectedBuilding.name} (${payload.selectedBuilding.width}m width x ${payload.selectedBuilding.length}m length, Height: ${payload.selectedBuilding.height}m, Type: ${payload.selectedBuilding.roofType}, Roof Orientation: ${payload.selectedBuilding.roofOrientation || 'horizontal flat (0° tilt)'}, Azimuth: ${payload.selectedBuilding.roofAzimuthDeg ?? 0}°)
- Rooftop Obstacles: ${payload.selectedBuilding.obstaclesCount} utility obstacles (HVAC / water tanks / stairwells)
- Array Configuration: ${payload.energyProfile.panelCount} panels (${payload.panelConfig.panelName}, ${payload.panelConfig.wattage}W each, Tilt: ${payload.panelConfig.tiltDegrees}°, Orientation: ${payload.panelConfig.orientation})
- System Capacity: ${payload.energyProfile.installedCapacityKW} kW
- Annual Generation: ${payload.energyProfile.annualGenerationKWh} kWh/yr
- Annual Consumption Demand: ${payload.energyProfile.annualConsumptionKWh} kWh/yr
- Solar Demand Coverage: ${payload.energyProfile.solarCoveragePercent}%
- Grid Export Surplus: ${payload.energyProfile.surplusKWh} kWh/yr
- Shading Exposure: ${payload.solarAnalysis?.annualExposurePercent !== undefined ? `${payload.solarAnalysis.annualExposurePercent}% annual exposure (${payload.solarAnalysis.unshadedAreaM2 ?? payload.selectedBuilding.width * payload.selectedBuilding.length} m² usable area)` : payload.solarAnalysis?.liveExposurePercent !== undefined ? `${payload.solarAnalysis.liveExposurePercent}% instantaneous sunlit exposure at simulated sun position (${payload.solarAnalysis.unshadedAreaM2 ?? payload.selectedBuilding.width * payload.selectedBuilding.length} m² unshaded area)` : 'Not Analyzed (Rooftop raycast simulation has not been run for this building yet)'}
- Financial Capital Cost: ${currencySymbol}${payload.financialResult.totalSystemCost.toLocaleString()}
- Applied Electricity Tariff: ${currencySymbol}${payload.financialResult.tariffPerKWh !== undefined ? payload.financialResult.tariffPerKWh : 'N/A'}/kWh
- Annual Bill Savings: ${currencySymbol}${annualSavings.toLocaleString()}/yr
- Estimated Payback: ${payload.financialResult.paybackYears !== null ? `${payload.financialResult.paybackYears} years` : 'Unspecified tariff'}
- 20-Year Net Benefit: ${currencySymbol}${twentyYearNet.toLocaleString()} (ROI: ${payload.financialResult.roiPercent}%)
- Environmental Offset: ${payload.environmentalResult.annualCO2ReductionTonnes} tonnes CO2/yr (~${payload.environmentalResult.equivalentTreesPlanted} trees)
- Grid Emission Factor: ${payload.environmentalResult.gridEmissionFactorKgPerKWh || (effectiveCountry === 'Bangladesh' ? 0.62 : 0.42)} kg CO2/kWh (${payload.environmentalResult.gridEmissionFactorSource || 'Benchmark'})

VERIFIED KNOWLEDGE CITATIONS:
${retrievedContextText}
`;

  let conversationBlock = '';
  if (payload.conversationHistory && payload.conversationHistory.length > 0) {
    const recent = payload.conversationHistory.slice(-6);
    conversationBlock = `
PRIOR CONVERSATION CONTEXT (MULTI-TURN DIALOGUE):
${recent
  .map(
    (m) =>
      `[${m.role === 'user' ? 'User' : 'RoofRay AI'}] ${m.content.slice(0, 400)}`
  )
  .join('\n')}
`;
  }

  const userPrompt = `${conversationBlock ? conversationBlock + '\n' : ''}User Question / Follow-up: "${userQuery}"

Provide a comprehensive, conversational assessment formatted as valid JSON adhering to this schema:
{
  "summary": "Concise executive overview of the solar system viability and primary takeaway${locationReconciliation.hasLocationConflict ? ` (must acknowledge ${targetLoc.city ? targetLoc.city + ', ' : ''}${targetLoc.country} without describing building as in ${payload.location.city})` : ''}",
  "recommendations": ["Actionable engineering and economic recommendations"],
  "advantages": ["Key physical and financial advantages of this specific layout"],
  "risks": ["Potential risks (shading penalties, thermal derating, grid limits, structural constraints)"],
  "assumptions": ["Key engineering and economic assumptions behind these figures"],
  "next_steps": ["Concrete next actions for project development"],
  "sources": [{"title": "Source title", "authorOrg": "Publishing entity", "url": "URL if known", "relevance": "Why relevant"}]
}`;

  // 4. Dispatch to Gemini API via secured header (Guarded by Circuit Breaker)
  if (!advisorCircuitBreaker.canExecute()) {
    console.warn(`[RoofRay Advisor] Circuit breaker is OPEN. Fast-failing to deterministic advisory.`);
    if (payload.language === 'bn') {
      return {
        configured: true,
        summary: 'সার্ভিস সুরক্ষা নিশ্চিত করতে সার্কিট ব্রেকার সক্রিয়। আপনার ফিজিক্যাল সৌর হিসাব ও সিমুলেশন সম্পূর্ণ কার্যকর রয়েছে।',
        recommendations: [
          'সরাসরি থ্রি-ডি রেইকাস্ট সিমুলেশন ও ফিনান্সিয়াল অ্যানালিটিক্স ট্যাব পর্যালোচনা করুন।',
          'সার্ভার সংযোগ ও Google AI Studio কোটা কিছু সময় পর আবার যাচাই করুন।',
        ],
        advantages: [],
        risks: ['সার্কিট ব্রেকার সক্রিয় (আপস্ট্রিম সার্ভিস ত্রুটি প্রতিরোধে ফাস্ট-ফেইল)।'],
        assumptions: ['ফিজিক্যাল সৌর হিসাব ও সিমুলেশন সম্পূর্ণ অপরিবর্তিত ও নির্ভুল রয়েছে।'],
        next_steps: ['৩০ সেকেন্ড বিরতির পর পুনরায় অনুরোধ পাঠান।'],
        sources: formattedSources,
        timestamp: new Date().toISOString(),
        error: 'CIRCUIT_BREAKER_OPEN',
        modelUsed: effectiveModel,
      };
    }
    return {
      configured: true,
      summary: 'Upstream AI service is temporarily degraded (Circuit Breaker OPEN). Fast-failing to deterministic engineering advisory without latency.',
      recommendations: [
        'Review the deterministic 3D raycast metrics and financial tabs directly.',
        'Wait for the automatic 30-second cooldown period before re-evaluating.',
      ],
      advantages: [],
      risks: ['External AI provider unavailable (circuit breaker engaged).'],
      assumptions: ['Physical solar calculations remain accurate, deterministic, and unaffected.'],
      next_steps: ['Retry the inquiry after the cooldown period has elapsed.'],
      sources: formattedSources,
      timestamp: new Date().toISOString(),
      error: 'CIRCUIT_BREAKER_OPEN',
      modelUsed: effectiveModel,
    };
  }

  let execResult = await executeGeminiRequest(effectiveModel, effectiveKey, systemPrompt, userPrompt);

  // Temporary 503 handling: allow at most one bounded retry on the SAME configured model
  // Do not retry 404 or 429 automatically. Do not silently fallback to a different model.
  if (!execResult.ok && execResult.httpStatus === 503) {
    console.warn(`[RoofRay Advisor] Model "${effectiveModel}" returned HTTP 503. Performing bounded retry in 1500ms...`);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    execResult = await executeGeminiRequest(effectiveModel, effectiveKey, systemPrompt, userPrompt);
  }

  if (execResult.ok && execResult.candidateText) {
    advisorCircuitBreaker.recordSuccess();
  } else {
    // Record failure in circuit breaker for upstream outages or timeouts
    if (execResult.httpStatus >= 500 || execResult.errorCode === 'TIMEOUT' || execResult.errorCode === 'NETWORK_ERROR') {
      advisorCircuitBreaker.recordFailure();
    }
  }

  if (!execResult.ok || !execResult.candidateText) {
    console.error(`[RoofRay Advisor Diagnostics] ${execResult.errorCode} (${execResult.httpStatus}): ${execResult.safeMessage}`);
    if (payload.language === 'bn') {
      return {
        configured: true,
        summary: execResult.errorCode === 'RATE_LIMIT_EXCEEDED'
          ? 'Gemini এআই সাময়িকভাবে ব্যবহারের সীমায় পৌঁছেছে। আপনার সৌর হিসাব ও সিমুলেশন সম্পূর্ণ সক্রিয় রয়েছে।'
          : 'Google Gemini সার্ভিসের সাথে যোগাযোগে সাময়িক সমস্যা দেখা দিয়েছে। আপনার ফিজিক্যাল সোলার হিসাব ও সিমুলেশন সম্পূর্ণ কার্যকর রয়েছে।',
        recommendations: [
          'সরাসরি থ্রি-ডি রেইকাস্ট সিমুলেশন ও ফিনান্সিয়াল অ্যানালিটিক্স ট্যাব পর্যালোচনা করুন।',
          'সার্ভারের ইন্টারনেট সংযোগ এবং Google AI Studio-তে Gemini API কোটা যাচাই করুন।',
        ],
        advantages: [],
        risks: ['বাহ্যিক এলএলএম উত্তর অনুপলব্ধ; ডিটারমিনিস্টিক ফিজিক্যাল গণনার ওপর ভিত্তি করে কাজ চলছে।'],
        assumptions: ['ফিজিক্যাল সৌর হিসাব ও সিমুলেশন নির্ভুল ও সম্পূর্ণ অপরিবর্তিত রয়েছে।'],
        next_steps: ['কিছুক্ষণ পর আবার চেষ্টা করুন অথবা মডেল কনফিগারেশন পরীক্ষা করুন।'],
        sources: formattedSources,
        timestamp: new Date().toISOString(),
        error: execResult.errorCode || 'AI_PROVIDER_ERROR',
        modelUsed: effectiveModel,
      };
    }
    const displaySummary = execResult.userMessage || execResult.safeMessage;
    return {
      configured: true,
      summary: displaySummary,
      recommendations: [
        'Review the deterministic 3D raycast metrics and financial tabs directly.',
        'Verify your server internet connectivity and Gemini API key quota/status in Google AI Studio.',
      ],
      advantages: [],
      risks: ['External LLM response unavailable; falling back to deterministic physical calculations.'],
      assumptions: ['Physical solar calculations remain accurate, deterministic, and unaffected.'],
      next_steps: ['Retry the inquiry in a few moments or review model configuration.'],
      sources: formattedSources,
      timestamp: new Date().toISOString(),
      error: execResult.errorCode || 'AI_PROVIDER_ERROR',
      modelUsed: effectiveModel,
    };
  }

  let parsed: any;
  try {
    parsed = JSON.parse(execResult.candidateText);
  } catch {
    if (payload.language === 'bn') {
      return {
        configured: true,
        summary: 'এআই মডেলের আউটপুট পার্স করতে সমস্যা হয়েছে। আপনার ফিজিক্যাল সোলার হিসাব সম্পূর্ণ কার্যকর রয়েছে।',
        recommendations: [
          'সরাসরি থ্রি-ডি রেইকাস্ট সিমুলেশন ও ফিনান্সিয়াল অ্যানালিটিক্স ট্যাব পর্যালোচনা করুন।',
        ],
        advantages: [],
        risks: ['এআই ফরম্যাট প্রক্রিয়াকরণে ত্রুটি।'],
        assumptions: ['ফিজিক্যাল সৌর হিসাব ও সিমুলেশন নির্ভুল ও সম্পূর্ণ অপরিবর্তিত রয়েছে।'],
        next_steps: ['কিছুক্ষণ পর প্রশ্নটি পুনরায় পাঠান।'],
        sources: formattedSources,
        timestamp: new Date().toISOString(),
        error: 'MALFORMED_AI_RESPONSE',
        modelUsed: effectiveModel,
      };
    }
    return {
      configured: true,
      summary: 'AI model generated non-standard JSON output. Physical calculations remain fully valid.',
      recommendations: [
        'Review the deterministic 3D raycast metrics and financial tabs directly.',
      ],
      advantages: [],
      risks: ['AI JSON parsing failure.'],
      assumptions: ['Physical solar calculations remain accurate, deterministic, and unaffected.'],
      next_steps: ['Retry the inquiry in a few moments.'],
      sources: formattedSources,
      timestamp: new Date().toISOString(),
      error: 'MALFORMED_AI_RESPONSE',
      modelUsed: effectiveModel,
    };
  }

  // Strict schema validation for response structure (rejects malformed types, rejects [object Object])
  const schemaValidation = validateAdvisorResponseSchema(parsed);
  if (!schemaValidation.valid || !schemaValidation.data) {
    return {
      configured: true,
      summary: `AI response schema validation failed: ${schemaValidation.error || 'Unknown format'}. Physical calculations remain fully valid.`,
      recommendations: [
        'Review the deterministic 3D raycast metrics and financial tabs directly.',
      ],
      advantages: [],
      risks: ['AI response schema mismatch.'],
      assumptions: ['Physical solar calculations remain accurate, deterministic, and unaffected.'],
      next_steps: ['Retry the inquiry in a few moments.'],
      sources: formattedSources,
      timestamp: new Date().toISOString(),
      error: 'MALFORMED_AI_RESPONSE',
      modelUsed: effectiveModel,
    };
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
}
