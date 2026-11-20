import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ProjectMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedProject extends ProjectMetadata {
  buildingId: string;
  location: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
    northOffsetDeg?: number;
  };
  panelConfig: {
    panelId: string;
    panelName: string;
    wattage: number;
    tiltDegrees: number;
    orientation: string;
  };
  placedPanels: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    orientation: string;
    tiltDeg: number;
    azimuthDeg: number;
    efficiency: number;
    wattage: number;
  }>;
  financialParams: {
    currency: string;
    tariffPerKWh: number;
    exportCreditRatio?: number;
  };
  simulationSummary?: {
    installedCapacityKW: number;
    panelCount: number;
    annualGenerationKWh: number;
    annualConsumptionKWh: number;
    solarCoveragePercent: number;
    surplusKWh: number;
    totalSystemCost: number;
    annualSavings: number;
    paybackYears: number | null;
    twentyYearNetSavings: number;
    roiPercent: number;
    annualCO2ReductionTonnes: number;
    equivalentTreesPlanted: number;
  };
}

export interface ProjectSummary {
  id: string;
  name: string;
  buildingId: string;
  city: string;
  country: string;
  panelCount: number;
  capacityKW: number;
  createdAt: string;
  updatedAt: string;
}

// Ensure storage directory exists with canonical absolute path
const STORAGE_DIR = process.env.PROJECTS_STORAGE_DIR
  ? path.resolve(process.env.PROJECTS_STORAGE_DIR)
  : path.resolve(__dirname, '../data/projects');

function ensureStorageDir(): void {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

// Sanitize project ID strictly against directory traversal or injection
export function isValidProjectId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  // Allow alphanumeric, dashes and underscores only, length 8-64
  return /^[a-zA-Z0-9_-]{8,64}$/.test(id);
}

function getProjectPath(id: string): string {
  if (!isValidProjectId(id)) {
    throw new Error('Invalid project ID format');
  }
  const targetPath = path.resolve(STORAGE_DIR, `${id}.json`);
  // Canonical boundary containment check
  const rel = path.relative(STORAGE_DIR, targetPath);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error('Path traversal detected');
  }
  return targetPath;
}

export function validateProjectPayload(body: any): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Project payload must be a JSON object' };
  }
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0 || body.name.length > 100) {
    return { valid: false, error: 'Project name must be a string between 1 and 100 characters' };
  }
  if (!body.buildingId || typeof body.buildingId !== 'string') {
    return { valid: false, error: 'Missing or invalid buildingId' };
  }
  if (!body.location || typeof body.location !== 'object') {
    return { valid: false, error: 'Missing location object' };
  }
  const loc = body.location;
  if (typeof loc.city !== 'string' || typeof loc.country !== 'string' || typeof loc.latitude !== 'number' || typeof loc.longitude !== 'number') {
    return { valid: false, error: 'Invalid location properties (city, country, latitude, longitude required)' };
  }
  if (!body.panelConfig || typeof body.panelConfig !== 'object') {
    return { valid: false, error: 'Missing panelConfig object' };
  }
  if (!Array.isArray(body.placedPanels)) {
    return { valid: false, error: 'placedPanels must be an array' };
  }
  if (body.placedPanels.length > 5000) {
    return { valid: false, error: 'Exceeded maximum allowable panels per project (5,000)' };
  }
  if (!body.financialParams || typeof body.financialParams !== 'object') {
    return { valid: false, error: 'Missing financialParams object' };
  }
  return { valid: true };
}

/**
 * Saves or updates a project with atomic file write (write to temp file then rename)
 * to guarantee durability and crash-consistency.
 */
export async function saveProject(input: any, existingId?: string): Promise<SavedProject> {
  ensureStorageDir();
  const now = new Date().toISOString();
  const id = existingId && isValidProjectId(existingId)
    ? existingId
    : `proj_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

  let createdAt = now;
  if (existingId) {
    try {
      const existing = await getProject(existingId);
      if (existing) {
        createdAt = existing.createdAt;
      }
    } catch {
      // Ignore if not found
    }
  }

  const project: SavedProject = {
    id,
    name: input.name.trim(),
    description: input.description ? String(input.description).slice(0, 500) : undefined,
    createdAt,
    updatedAt: now,
    buildingId: String(input.buildingId),
    location: {
      city: String(input.location.city),
      country: String(input.location.country),
      latitude: Number(input.location.latitude),
      longitude: Number(input.location.longitude),
      timezone: String(input.location.timezone || 'UTC'),
      northOffsetDeg: input.location.northOffsetDeg !== undefined ? Number(input.location.northOffsetDeg) : undefined,
    },
    panelConfig: {
      panelId: String(input.panelConfig.panelId || 'panel-1'),
      panelName: String(input.panelConfig.panelName || 'Standard PV'),
      wattage: Number(input.panelConfig.wattage || 400),
      tiltDegrees: Number(input.panelConfig.tiltDegrees || 15),
      orientation: String(input.panelConfig.orientation || 'portrait'),
    },
    placedPanels: input.placedPanels.map((p: any) => ({
      id: String(p.id),
      x: Number(p.x),
      y: Number(p.y),
      width: Number(p.width),
      height: Number(p.height),
      orientation: String(p.orientation || 'portrait'),
      tiltDeg: Number(p.tiltDeg || 15),
      azimuthDeg: Number(p.azimuthDeg || 180),
      efficiency: Number(p.efficiency || 0.20),
      wattage: Number(p.wattage || 400),
    })),
    financialParams: {
      currency: String(input.financialParams.currency || 'USD'),
      tariffPerKWh: Number(input.financialParams.tariffPerKWh || 0.15),
      exportCreditRatio: input.financialParams.exportCreditRatio !== undefined ? Number(input.financialParams.exportCreditRatio) : undefined,
    },
    simulationSummary: input.simulationSummary ? {
      installedCapacityKW: Number(input.simulationSummary.installedCapacityKW || 0),
      panelCount: Number(input.simulationSummary.panelCount || 0),
      annualGenerationKWh: Number(input.simulationSummary.annualGenerationKWh || 0),
      annualConsumptionKWh: Number(input.simulationSummary.annualConsumptionKWh || 0),
      solarCoveragePercent: Number(input.simulationSummary.solarCoveragePercent || 0),
      surplusKWh: Number(input.simulationSummary.surplusKWh || 0),
      totalSystemCost: Number(input.simulationSummary.totalSystemCost || 0),
      annualSavings: Number(input.simulationSummary.annualSavings || 0),
      paybackYears: input.simulationSummary.paybackYears !== null ? Number(input.simulationSummary.paybackYears) : null,
      twentyYearNetSavings: Number(input.simulationSummary.twentyYearNetSavings || 0),
      roiPercent: Number(input.simulationSummary.roiPercent || 0),
      annualCO2ReductionTonnes: Number(input.simulationSummary.annualCO2ReductionTonnes || 0),
      equivalentTreesPlanted: Number(input.simulationSummary.equivalentTreesPlanted || 0),
    } : undefined,
  };

  const finalPath = getProjectPath(id);
  const tempPath = `${finalPath}.tmp_${Date.now()}`;

  // Atomic write: write to temp file then atomic rename
  await fs.promises.writeFile(tempPath, JSON.stringify(project, null, 2), 'utf-8');
  await fs.promises.rename(tempPath, finalPath);

  return project;
}

export async function getProject(id: string): Promise<SavedProject | null> {
  ensureStorageDir();
  if (!isValidProjectId(id)) return null;
  const filePath = getProjectPath(id);
  try {
    const raw = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as SavedProject;
  } catch (err: any) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

export async function listProjects(): Promise<ProjectSummary[]> {
  ensureStorageDir();
  const files = await fs.promises.readdir(STORAGE_DIR);
  const summaries: ProjectSummary[] = [];

  for (const file of files) {
    if (!file.endsWith('.json') || file.includes('.tmp_')) continue;
    try {
      const filePath = path.resolve(STORAGE_DIR, file);
      const raw = await fs.promises.readFile(filePath, 'utf-8');
      const data = JSON.parse(raw) as SavedProject;
      summaries.push({
        id: data.id,
        name: data.name,
        buildingId: data.buildingId,
        city: data.location.city,
        country: data.location.country,
        panelCount: data.placedPanels?.length || 0,
        capacityKW: data.simulationSummary?.installedCapacityKW || 0,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    } catch {
      // Ignore corrupt or unreadable files in list
    }
  }

  // Sort by updatedAt descending
  summaries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return summaries;
}

export async function deleteProject(id: string): Promise<boolean> {
  ensureStorageDir();
  if (!isValidProjectId(id)) return false;
  const filePath = getProjectPath(id);
  try {
    await fs.promises.unlink(filePath);
    return true;
  } catch (err: any) {
    if (err.code === 'ENOENT') return false;
    throw err;
  }
}
