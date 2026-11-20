import http from 'http';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

// Robust, zero-dependency .env loader supporting Node 18+ (process.loadEnvFile is Node 20.6+)
export function loadEnvFileCompat(filePath: string = '.env'): void {
  if (typeof process.loadEnvFile === 'function') {
    try {
      process.loadEnvFile(filePath);
      return;
    } catch {
      // Fall through to manual parsing if loadEnvFile fails
    }
  }
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!(key in process.env)) {
            process.env[key] = val;
          }
        }
      }
    } catch {
      // Ignore read errors
    }
  }
}

loadEnvFileCompat();

import {
  handleSolarAdvisorRequest,
  validateAdvisorPayload,
  checkRateLimit,
  resolveGeminiModel,
  advisorCircuitBreaker,
  getRateLimitStats,
} from '../src/server/advisorService.js';

import {
  saveProject,
  getProject,
  listProjects,
  deleteProject,
  validateProjectPayload,
  isValidProjectId,
} from './projectStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Port configuration: Defaults to 3001 in production (avoids collision with Vite 3000 in dev)
const PORT = parseInt(process.env.PORT || '3001', 10);
const DIST_DIR = path.resolve(__dirname, '../dist');

// MIME types for static assets
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
  '.webmanifest': 'application/manifest+json',
};

// Configurable CORS origins
const configuredAllowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'https://roofray.onrender.com',
];

function isOriginAllowed(origin?: string): boolean {
  if (!origin) return true; // Same-origin or non-browser client
  return defaultAllowedOrigins.includes(origin) || configuredAllowedOrigins.includes(origin);
}

// In-memory single-instance daily AI request counter (limitation: resets on process restart)
const MAX_DAILY_AI_REQUESTS = 500;
let dailyAiRequestsCount = 0;
let dailyAiResetTime = Date.now() + 24 * 60 * 60 * 1000;

function checkDailyAiQuota(): boolean {
  const now = Date.now();
  if (now > dailyAiResetTime) {
    dailyAiRequestsCount = 0;
    dailyAiResetTime = now + 24 * 60 * 60 * 1000;
  }
  if (dailyAiRequestsCount >= MAX_DAILY_AI_REQUESTS) {
    return false;
  }
  dailyAiRequestsCount++;
  return true;
}

// Track active sockets for graceful shutdown
const activeSockets = new Set<import('net').Socket>();
let isShuttingDown = false;

// HTTP Compression Streamer Helper (Node built-in zlib)
function sendCompressedStream(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  filePath: string,
  contentType: string,
  cacheControl: string
): void {
  const acceptEncoding = (req.headers['accept-encoding'] || '') as string;
  const isCompressible = /^(text\/|application\/(javascript|json)|image\/svg\+xml)/.test(contentType);

  res.setHeader('Cache-Control', cacheControl);

  if (isCompressible && acceptEncoding.includes('gzip')) {
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Vary', 'Accept-Encoding');
    res.writeHead(200, { 'Content-Type': contentType });
    const rawStream = fs.createReadStream(filePath);
    const gzip = zlib.createGzip({ level: 6 });
    rawStream.pipe(gzip).pipe(res);
  } else if (isCompressible && acceptEncoding.includes('deflate')) {
    res.setHeader('Content-Encoding', 'deflate');
    res.setHeader('Vary', 'Accept-Encoding');
    res.writeHead(200, { 'Content-Type': contentType });
    const rawStream = fs.createReadStream(filePath);
    const deflate = zlib.createDeflate();
    rawStream.pipe(deflate).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  }
}

export const server = http.createServer(async (req, res) => {
  if (isShuttingDown) {
    res.writeHead(503, { 'Content-Type': 'application/json; charset=UTF-8', 'Connection': 'close' });
    res.end(JSON.stringify({ error: 'SERVER_SHUTTING_DOWN', message: 'Server is shutting down' }));
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  
  // Extract client IP safely behind reverse proxy
  const forwarded = req.headers['x-forwarded-for'];
  const clientIp = typeof forwarded === 'string'
    ? forwarded.split(',')[0].trim()
    : req.socket.remoteAddress || '127.0.0.1';

  // Security Headers (Defense-in-depth)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Configured CORS headers (no wildcards)
  const origin = req.headers.origin;
  if (origin) {
    if (isOriginAllowed(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    } else if (req.method === 'OPTIONS') {
      res.writeHead(403, { 'Content-Type': 'application/json; charset=UTF-8' });
      res.end(JSON.stringify({ error: 'CORS_FORBIDDEN', message: 'Disallowed CORS origin' }));
      return;
    }
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ==========================================
  // 1. Health Endpoints (/api/ai/health, /api/health/liveness, /api/health/readiness)
  // ==========================================
  if (url.pathname === '/api/health/liveness') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
    res.end(JSON.stringify({ status: 'ok', liveness: true }));
    return;
  }

  if (url.pathname === '/api/health/readiness') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
    res.end(JSON.stringify({
      status: 'ok',
      readiness: true,
      uptime: process.uptime(),
      circuitBreaker: advisorCircuitBreaker.getState(),
    }));
    return;
  }

  if (url.pathname === '/api/ai/health' || url.pathname === '/api/health') {
    if (req.method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json; charset=UTF-8', 'Allow': 'GET, OPTIONS' });
      res.end(JSON.stringify({ error: 'METHOD_NOT_ALLOWED', message: 'Only GET is allowed on health endpoint' }));
      return;
    }

    const isConfigured = Boolean(
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' &&
      process.env.GEMINI_API_KEY.trim().length > 10
    );

    res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
    res.end(
      JSON.stringify({
        status: 'ok',
        service: 'RoofRay AI Solar Advisor Production Server',
        version: '3.4.0',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        memoryUsage: process.memoryUsage(),
        aiProvider: 'Google Gemini',
        modelConfigured: resolveGeminiModel(),
        keyConfigured: isConfigured,
        authMethod: 'x-goog-api-key header (secured)',
        circuitBreaker: advisorCircuitBreaker.getStats(),
        rateLimiterStats: getRateLimitStats(),
        dailyQuota: {
          limitPerInstance: MAX_DAILY_AI_REQUESTS,
          consumed: dailyAiRequestsCount,
          storage: 'in-memory (single process instance)',
        },
        liveness: true,
        readiness: true,
      })
    );
    return;
  }

  // ==========================================
  // 2. Solar Advisor AI Endpoint (/api/ai/solar-advisor)
  // ==========================================
  if (url.pathname === '/api/ai/solar-advisor') {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json; charset=UTF-8', 'Allow': 'POST, OPTIONS' });
      res.end(JSON.stringify({ error: 'METHOD_NOT_ALLOWED', message: 'Only POST requests are supported on this endpoint' }));
      return;
    }

    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('application/json')) {
      res.writeHead(415, { 'Content-Type': 'application/json; charset=UTF-8' });
      res.end(JSON.stringify({ error: 'UNSUPPORTED_MEDIA_TYPE', message: 'Content-Type must be application/json' }));
      return;
    }

    if (!checkRateLimit(clientIp)) {
      res.writeHead(429, { 'Content-Type': 'application/json; charset=UTF-8' });
      res.end(
        JSON.stringify({
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please wait a minute before requesting another solar advisory evaluation.',
        })
      );
      return;
    }

    if (!checkDailyAiQuota()) {
      res.writeHead(429, { 'Content-Type': 'application/json; charset=UTF-8' });
      res.end(
        JSON.stringify({
          error: 'DAILY_QUOTA_EXCEEDED',
          message: 'Instance daily AI advisory quota reached. Please retry tomorrow or review server limits.',
        })
      );
      return;
    }

    let bodyText = '';
    let isOversized = false;

    req.on('data', (chunk) => {
      bodyText += chunk;
      // Protect against large payloads (> 100KB)
      if (bodyText.length > 100 * 1024 && !isOversized) {
        isOversized = true;
        res.writeHead(413, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({ error: 'PAYLOAD_TOO_LARGE', message: 'Request payload exceeds 100KB limit' }));
        req.destroy();
      }
    });

    req.on('end', async () => {
      if (isOversized) return;
      try {
        let payload: unknown;
        try {
          payload = JSON.parse(bodyText);
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=UTF-8' });
          res.end(JSON.stringify({ error: 'INVALID_JSON', message: 'Request body is not valid JSON' }));
          return;
        }

        const validation = validateAdvisorPayload(payload);
        if (!validation.valid) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=UTF-8' });
          res.end(JSON.stringify({ error: 'INVALID_PAYLOAD', message: validation.error }));
          return;
        }

        const advisorResult = await handleSolarAdvisorRequest(payload as any);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify(advisorResult));
      } catch {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({ error: 'SERVER_ERROR', message: 'An internal error occurred while processing the AI advisory.' }));
      }
    });
    return;
  }

  // ==========================================
  // 3. Project Persistence API (/api/projects & /api/projects/:id)
  // ==========================================
  if (url.pathname === '/api/projects' || url.pathname.startsWith('/api/projects/')) {
    const segments = url.pathname.slice('/api/projects'.length).split('/').filter(Boolean);
    const projectId = segments[0];

    // List projects: GET /api/projects
    if (!projectId && req.method === 'GET') {
      try {
        const projects = await listProjects();
        res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({ success: true, projects }));
      } catch {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({ error: 'STORAGE_ERROR', message: 'Failed to list saved projects' }));
      }
      return;
    }

    // Save project: POST /api/projects
    if (!projectId && req.method === 'POST') {
      const contentType = req.headers['content-type'] || '';
      if (!contentType.includes('application/json')) {
        res.writeHead(415, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({ error: 'UNSUPPORTED_MEDIA_TYPE', message: 'Content-Type must be application/json' }));
        return;
      }

      let bodyText = '';
      let isOversized = false;

      req.on('data', (chunk) => {
        bodyText += chunk;
        if (bodyText.length > 100 * 1024 && !isOversized) {
          isOversized = true;
          res.writeHead(413, { 'Content-Type': 'application/json; charset=UTF-8' });
          res.end(JSON.stringify({ error: 'PAYLOAD_TOO_LARGE', message: 'Project payload exceeds 100KB limit' }));
          req.destroy();
        }
      });

      req.on('end', async () => {
        if (isOversized) return;
        try {
          let projectData: any;
          try {
            projectData = JSON.parse(bodyText);
          } catch {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=UTF-8' });
            res.end(JSON.stringify({ error: 'INVALID_JSON', message: 'Request body is not valid JSON' }));
            return;
          }

          const validation = validateProjectPayload(projectData);
          if (!validation.valid) {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=UTF-8' });
            res.end(JSON.stringify({ error: 'INVALID_PAYLOAD', message: validation.error }));
            return;
          }

          const saved = await saveProject(projectData, projectData.id);
          res.writeHead(201, { 'Content-Type': 'application/json; charset=UTF-8' });
          res.end(JSON.stringify({ success: true, project: saved }));
        } catch (err: any) {
          res.writeHead(500, { 'Content-Type': 'application/json; charset=UTF-8' });
          res.end(JSON.stringify({ error: 'SAVE_FAILED', message: err.message || 'Failed to save project' }));
        }
      });
      return;
    }

    // Get project: GET /api/projects/:id
    if (projectId && req.method === 'GET') {
      if (!isValidProjectId(projectId)) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({ error: 'INVALID_PROJECT_ID', message: 'Invalid project ID format' }));
        return;
      }

      try {
        const project = await getProject(projectId);
        if (!project) {
          res.writeHead(404, { 'Content-Type': 'application/json; charset=UTF-8' });
          res.end(JSON.stringify({ error: 'NOT_FOUND', message: `Project not found: ${projectId}` }));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({ success: true, project }));
      } catch {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({ error: 'READ_FAILED', message: 'Failed to read project' }));
      }
      return;
    }

    // Delete project: DELETE /api/projects/:id
    if (projectId && req.method === 'DELETE') {
      if (!isValidProjectId(projectId)) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({ error: 'INVALID_PROJECT_ID', message: 'Invalid project ID format' }));
        return;
      }

      try {
        const deleted = await deleteProject(projectId);
        if (!deleted) {
          res.writeHead(404, { 'Content-Type': 'application/json; charset=UTF-8' });
          res.end(JSON.stringify({ error: 'NOT_FOUND', message: `Project not found: ${projectId}` }));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({ success: true, message: `Project ${projectId} deleted` }));
      } catch {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({ error: 'DELETE_FAILED', message: 'Failed to delete project' }));
      }
      return;
    }

    res.writeHead(405, { 'Content-Type': 'application/json; charset=UTF-8', 'Allow': 'GET, POST, DELETE, OPTIONS' });
    res.end(JSON.stringify({ error: 'METHOD_NOT_ALLOWED', message: 'Method not supported on /api/projects' }));
    return;
  }

  // ==========================================
  // 4. Block unmatched /api/* routes from SPA fallback
  // ==========================================
  if (url.pathname.startsWith('/api/')) {
    res.writeHead(404, { 'Content-Type': 'application/json; charset=UTF-8' });
    res.end(JSON.stringify({ error: 'NOT_FOUND', message: `API endpoint not found: ${url.pathname}` }));
    return;
  }

  // ==========================================
  // 5. Static Asset & SPA Serving from dist/ with GZIP / Deflate Compression
  // ==========================================
  if (fs.existsSync(DIST_DIR)) {
    let rawPath: string;
    try {
      rawPath = decodeURIComponent(url.pathname);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=UTF-8' });
      res.end(JSON.stringify({ error: 'BAD_REQUEST', message: 'Malformed URL encoding' }));
      return;
    }

    // Null byte sanitization
    if (rawPath.includes('\0')) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=UTF-8' });
      res.end(JSON.stringify({ error: 'BAD_REQUEST', message: 'Null bytes are disallowed' }));
      return;
    }

    // Explicit Directory Traversal Detection (both decoded segments and percent-encoded indicators)
    const segments = rawPath.split(/[/\\]/);
    if (segments.some(seg => seg === '..') || /%2e%2e/i.test(req.url || '') || rawPath.includes('..')) {
      res.writeHead(403, { 'Content-Type': 'application/json; charset=UTF-8' });
      res.end(JSON.stringify({ error: 'FORBIDDEN', message: 'Directory traversal is strictly forbidden' }));
      return;
    }

    // Canonical path containment: resolve against DIST_DIR and ensure target strictly stays inside
    const cleanRelative = path.normalize(rawPath).replace(/^([a-zA-Z]:)?[\/\\]+/, '');
    const resolvedPath = path.resolve(DIST_DIR, cleanRelative);
    const relFromDist = path.relative(DIST_DIR, resolvedPath);
    const isInsideDist = !relFromDist.startsWith('..') && !path.isAbsolute(relFromDist);

    // If canonical path attempts to escape DIST_DIR, strictly reject regardless of extension
    if (!isInsideDist) {
      res.writeHead(403, { 'Content-Type': 'application/json; charset=UTF-8' });
      res.end(JSON.stringify({ error: 'FORBIDDEN', message: 'Directory traversal is strictly forbidden' }));
      return;
    }

    const hasExtension = path.extname(rawPath) !== '';

    if (hasExtension) {
      if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
        const ext = path.extname(resolvedPath).toLowerCase();
        const mime = MIME_TYPES[ext] || 'application/octet-stream';
        const isHashedAsset = rawPath.startsWith('/assets/');
        const cacheControl = isHashedAsset ? 'public, max-age=31536000, immutable' : 'no-cache';
        
        sendCompressedStream(req, res, resolvedPath, mime, cacheControl);
        return;
      }

      // Static asset with extension not found
      res.writeHead(404, { 'Content-Type': 'application/json; charset=UTF-8' });
      res.end(JSON.stringify({ error: 'NOT_FOUND', message: `Static asset not found: ${rawPath}` }));
      return;
    }

    // SPA Route Fallback (e.g. / or /app or direct page refresh) -> serve index.html
    const indexPath = path.resolve(DIST_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
      sendCompressedStream(req, res, indexPath, 'text/html; charset=UTF-8', 'no-cache, no-store, must-revalidate');
      return;
    }
  }

  // Default fallback if dist/ has not been built yet
  res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
  res.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head><title>RoofRay Production Server</title></head>
    <body style="font-family:sans-serif;background:#090d16;color:#e2e8f0;padding:40px;line-height:1.6">
      <h1 style="color:#fbbf24">RoofRay Production Server</h1>
      <p>Frontend assets are not yet compiled in <code>dist/</code>.</p>
      <p>Run <code>npm run build</code> to compile the client application before starting in production.</p>
      <p>API status: <a style="color:#38bdf8" href="/api/ai/health">/api/ai/health</a></p>
    </body>
    </html>
  `);
});

// Socket tracking for graceful connection draining
server.on('connection', (socket) => {
  activeSockets.add(socket);
  socket.on('close', () => activeSockets.delete(socket));
});

export function shutdownServer(timeoutMs: number = 10000): Promise<void> {
  if (isShuttingDown) return Promise.resolve();
  isShuttingDown = true;
  console.log('🔄 Initiating graceful server shutdown...');

  return new Promise((resolve) => {
    server.close((err) => {
      isShuttingDown = false;
      if (err) {
        console.error('Error during server close:', err);
      } else {
        console.log('✅ Server connection listener closed.');
      }
      resolve();
    });

    // Close idle keep-alive sockets gracefully
    for (const socket of activeSockets) {
      socket.end();
    }

    // Force close any remaining sockets if timeout exceeded
    setTimeout(() => {
      for (const socket of activeSockets) {
        socket.destroy();
      }
      resolve();
    }, timeoutMs).unref();
  });
}

// Register process signal handlers for production container lifecycles
process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal.');
  shutdownServer().then(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('Received SIGINT signal.');
  shutdownServer().then(() => process.exit(0));
});

export function startServer(port: number = PORT): Promise<http.Server> {
  if (server.listening) {
    return Promise.resolve(server);
  }
  return new Promise((resolve, reject) => {
    const onError = (err: any) => {
      server.removeListener('listening', onListening);
      reject(err);
    };
    const onListening = () => {
      server.removeListener('error', onError);
      const addr = server.address();
      const actualPort = typeof addr === 'object' && addr ? addr.port : port;
      console.log(`🚀 RoofRay AI Solar Server running on port ${actualPort}`);
      console.log(`   Local URL:    http://localhost:${actualPort}/`);
      console.log(`   App URL:      http://localhost:${actualPort}/app`);
      console.log(`   Health check: http://localhost:${actualPort}/api/ai/health`);
      console.log(`   API Endpoint: http://localhost:${actualPort}/api/ai/solar-advisor`);
      console.log(`   Projects API: http://localhost:${actualPort}/api/projects`);
      resolve(server);
    };

    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port);
  });
}

// Auto-start if executed directly via node or tsx
const isDirectExecution = process.argv[1] && (
  path.resolve(process.argv[1]) === path.resolve(__filename) ||
  process.argv[1].endsWith('server.ts') ||
  process.argv[1].endsWith('server.js')
);

if (isDirectExecution) {
  startServer(PORT);
}

export default server;
