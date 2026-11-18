/**
 * Solar Resource Service — NASA POWER Climatology Integration
 * 
 * Provides real-world, satellite-derived solar irradiance and meteorological data.
 * Authoritative Source: NASA Langley Research Center (LaRC) POWER Project.
 * Open Access & Global Coverage.
 * Parameters:
 *  - ALLSKY_SFC_SW_DWN: All Sky Surface Shortwave Downward Irradiance (kWh/m²/day)
 *  - CLRSKY_SFC_SW_DWN: Clear Sky Surface Shortwave Downward Irradiance (kWh/m²/day)
 *  - T2M: Temperature at 2 Meters (°C)
 */

export interface MonthlyClimatology {
  month: number; // 1-12
  monthName: string;
  allSkyIrradianceKWhM2Day: number;
  clearSkyIrradianceKWhM2Day: number;
  cloudinessClearnessIndex: number; // all-sky / clear-sky ratio
  ambientTempC: number | null; // Real observed temperature or null if unrecorded (no invented fallbacks)
}

export interface SolarResourceData {
  available: boolean;
  latitude: number;
  longitude: number;
  retrievalDate: string;
  source: string;
  license: string;
  annualAverageAllSkyKWhM2Day: number;
  annualAverageClearSkyKWhM2Day: number;
  averageCloudPenaltyPercent: number;
  monthly: MonthlyClimatology[];
  cached: boolean;
  error?: string;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const MONTH_KEYS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'] as const;

export function parseNasaPowerPayload(
  json: any,
  latitude: number,
  longitude: number
): SolarResourceData {
  const roundedLat = Math.round(latitude * 100) / 100;
  const roundedLon = Math.round(longitude * 100) / 100;
  const properties = json?.properties?.parameter;

  if (!properties || !properties.ALLSKY_SFC_SW_DWN) {
    throw new Error('Invalid NASA POWER payload format: missing parameters');
  }

  const allSky = properties.ALLSKY_SFC_SW_DWN;
  const clrSky = properties.CLRSKY_SFC_SW_DWN;
  const t2m = properties.T2M || {};

  if (!clrSky) {
    throw new Error('Incomplete NASA POWER data: CLRSKY_SFC_SW_DWN parameter is missing');
  }

  const monthly: MonthlyClimatology[] = [];
  let sumAllSky = 0;
  let sumClrSky = 0;

  for (let i = 0; i < 12; i++) {
    const key = MONTH_KEYS[i];
    const rawAll = allSky[key];
    const rawClr = clrSky[key];
    const rawTemp = t2m[key];

    // Strictly validate: never substitute missing clear-sky with all-sky irradiance
    if (typeof rawAll !== 'number' || isNaN(rawAll) || rawAll <= 0) {
      throw new Error(`Incomplete NASA POWER data: Missing or invalid ALLSKY_SFC_SW_DWN for month ${key}`);
    }

    if (typeof rawClr !== 'number' || isNaN(rawClr) || rawClr <= 0) {
      throw new Error(`Incomplete NASA POWER data: Missing or invalid CLRSKY_SFC_SW_DWN for month ${key}`);
    }

    if (rawClr < rawAll) {
      throw new Error(`Physically invalid NASA POWER data: Clear-sky (${rawClr}) is less than all-sky (${rawAll}) for month ${key}`);
    }

    const valAll = rawAll;
    const valClr = rawClr;
    // Real observed temperature or null if unrecorded (never default to 25.0)
    const temp = typeof rawTemp === 'number' && !isNaN(rawTemp) ? Math.round(rawTemp * 10) / 10 : null;

    sumAllSky += valAll;
    sumClrSky += valClr;

    monthly.push({
      month: i + 1,
      monthName: MONTH_NAMES[i],
      allSkyIrradianceKWhM2Day: Math.round(valAll * 100) / 100,
      clearSkyIrradianceKWhM2Day: Math.round(valClr * 100) / 100,
      cloudinessClearnessIndex: valClr > 0 ? Math.round((valAll / valClr) * 100) / 100 : 1,
      ambientTempC: temp,
    });
  }

  const avgAll = Math.round((sumAllSky / 12) * 100) / 100;
  const avgClr = Math.round((sumClrSky / 12) * 100) / 100;
  const avgCloudPenalty = Math.max(0, Math.round(((avgClr - avgAll) / avgClr) * 100));

  return {
    available: true,
    latitude: roundedLat,
    longitude: roundedLon,
    retrievalDate: new Date().toISOString().split('T')[0],
    source: 'NASA POWER (Prediction of Worldwide Energy Resources) Climatology API v2.0',
    license: 'NASA Open Data Policy (Public Domain)',
    annualAverageAllSkyKWhM2Day: avgAll,
    annualAverageClearSkyKWhM2Day: avgClr,
    averageCloudPenaltyPercent: avgCloudPenalty,
    monthly,
    cached: false,
  };
}

export async function fetchNasaSolarResource(
  latitude: number,
  longitude: number
): Promise<SolarResourceData> {
  const roundedLat = Math.round(latitude * 100) / 100;
  const roundedLon = Math.round(longitude * 100) / 100;
  const cacheKey = `nasa_power_${roundedLat}_${roundedLon}`;

  // Check LocalStorage Cache
  if (typeof window !== 'undefined') {
    try {
      const cachedStr = localStorage.getItem(cacheKey);
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
          return {
            ...cached.data,
            cached: true,
          };
        }
      }
    } catch {
      // ignore cache read error
    }
  }

  const url = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN,CLRSKY_SFC_SW_DWN,T2M&community=RE&longitude=${roundedLon}&latitude=${roundedLat}&format=JSON`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`NASA POWER API HTTP ${res.status}`);
    }

    const json = await res.json();
    const resultData = parseNasaPowerPayload(json, roundedLat, roundedLon);

    // Cache to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ timestamp: Date.now(), data: resultData })
        );
      } catch {
        // ignore cache write error
      }
    }

    return resultData;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const msg = err instanceof Error ? err.message : 'Network failure';

    return {
      available: false,
      latitude: roundedLat,
      longitude: roundedLon,
      retrievalDate: new Date().toISOString().split('T')[0],
      source: 'NASA POWER Climatology (Offline / Fallback to Clear-Sky Engine)',
      license: 'NASA Open Data Policy',
      annualAverageAllSkyKWhM2Day: 0,
      annualAverageClearSkyKWhM2Day: 0,
      averageCloudPenaltyPercent: 0,
      monthly: [],
      cached: false,
      error: msg,
    };
  }
}
