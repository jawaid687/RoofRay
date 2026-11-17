import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleSolarAdvisorRequest, validateAdvisorPayload, checkRateLimit } from '../src/server/advisorService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
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

export const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const clientIp = req.socket.remoteAddress || '127.0.0.1';

  // Global CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ==========================================
  // 1. Health Endpoint (/api/ai/health)
  // ==========================================
  if (req.method === 'GET' && (url.pathname === '/api/ai/health' || url.pathname === '/api/health')) {
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
        version: '3.0.0',
        timestamp: new Date().toISOString(),
        aiProvider: 'Google Gemini',
        modelConfigured: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        keyConfigured: isConfigured,
      })
    );
    return;
  }

  // ==========================================
  // 2. Solar Advisor AI Endpoint (/api/ai/solar-advisor)
  // ==========================================
  if (req.method === 'POST' && url.pathname === '/api/ai/solar-advisor') {
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

    let bodyText = '';
    req.on('data', (chunk) => {
      bodyText += chunk;
      // Protect against large payloads (> 256KB)
      if (bodyText.length > 256 * 1024) {
        res.writeHead(413, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({ error: 'Payload too large' }));
        req.destroy();
      }
    });

    req.on('end', async () => {
      try {
        const payload = JSON.parse(bodyText);
        const validation = validateAdvisorPayload(payload);
        if (!validation.valid) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=UTF-8' });
          res.end(JSON.stringify({ error: 'INVALID_PAYLOAD', message: validation.error }));
          return;
        }

        const advisorResult = await handleSolarAdvisorRequest(payload);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify(advisorResult));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Internal Server Error';
        res.writeHead(500, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({ error: 'SERVER_ERROR', message: msg }));
      }
    });
    return;
  }

  // ==========================================
  // 3. Static Asset & SPA Serving from dist/
  // ==========================================
  if (fs.existsSync(DIST_DIR)) {
    const rawPath = decodeURIComponent(url.pathname);
    const hasExtension = path.extname(rawPath) !== '';

    if (hasExtension) {
      // Direct static file request (e.g. /assets/index-xxx.js)
      const filePath = path.join(DIST_DIR, rawPath);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const mime = MIME_TYPES[ext] || 'application/octet-stream';
        
        // Cache assets with hashed names for 1 year, others no-cache
        const isHashedAsset = rawPath.startsWith('/assets/');
        res.setHeader('Cache-Control', isHashedAsset ? 'public, max-age=31536000, immutable' : 'no-cache');
        res.writeHead(200, { 'Content-Type': mime });
        fs.createReadStream(filePath).pipe(res);
        return;
      }

      // Static asset with extension not found
      res.writeHead(404, { 'Content-Type': 'application/json; charset=UTF-8' });
      res.end(JSON.stringify({ error: 'NOT_FOUND', message: `Static asset not found: ${rawPath}` }));
      return;
    }

    // SPA Route Fallback (e.g. / or /app or /any-route)
    const indexPath = path.join(DIST_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
      fs.createReadStream(indexPath).pipe(res);
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
      <h1 style="color:#fbbf24">RoofRay V3 Production Server</h1>
      <p>Frontend assets are not yet compiled in <code>dist/</code>.</p>
      <p>Run <code>npm run build</code> to compile the client application before starting in production.</p>
      <p>API status: <a style="color:#38bdf8" href="/api/ai/health">/api/ai/health</a></p>
    </body>
    </html>
  `);
});

export function startServer(port: number = PORT): Promise<http.Server> {
  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`🚀 RoofRay AI Solar Server running on port ${port}`);
      console.log(`   Local URL:    http://localhost:${port}/`);
      console.log(`   App URL:      http://localhost:${port}/app`);
      console.log(`   Health check: http://localhost:${port}/api/ai/health`);
      console.log(`   API Endpoint: http://localhost:${port}/api/ai/solar-advisor`);
      resolve(server);
    });
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
