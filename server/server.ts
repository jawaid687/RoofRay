import http from 'http';
import fs from 'fs';
import path from 'path';
import { handleSolarAdvisorRequest, validateAdvisorPayload, checkRateLimit } from '../src/server/advisorService';

const PORT = parseInt(process.env.PORT || '3001', 10);
const DIST_DIR = path.resolve(__dirname, '../dist');

// Basic MIME types for static assets
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const clientIp = req.socket.remoteAddress || '127.0.0.1';

  // Enable CORS for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health endpoint
  if (req.method === 'GET' && (url.pathname === '/api/ai/health' || url.pathname === '/api/health')) {
    const isConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'ok',
        service: 'RoofRay AI Solar Advisor Service',
        version: '3.0.0',
        timestamp: new Date().toISOString(),
        aiProvider: 'Google Gemini',
        modelConfigured: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        keyConfigured: isConfigured,
      })
    );
    return;
  }

  // Solar Advisor AI Endpoint
  if (req.method === 'POST' && url.pathname === '/api/ai/solar-advisor') {
    // Check rate limit
    if (!checkRateLimit(clientIp)) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please wait a minute before requesting another solar advisory evaluation.',
        })
      );
      return;
    }

    // Read request body with size protection (max 256KB)
    let bodyText = '';
    req.on('data', (chunk) => {
      bodyText += chunk;
      if (bodyText.length > 256 * 1024) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload too large' }));
        req.destroy();
      }
    });

    req.on('end', async () => {
      try {
        const payload = JSON.parse(bodyText);
        const validation = validateAdvisorPayload(payload);
        if (!validation.valid) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'INVALID_PAYLOAD', message: validation.error }));
          return;
        }

        const advisorResult = await handleSolarAdvisorRequest(payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(advisorResult));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Internal Server Error';
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'SERVER_ERROR', message: msg }));
      }
    });
    return;
  }

  // Serve static files from dist/ in production
  if (fs.existsSync(DIST_DIR)) {
    let filePath = path.join(DIST_DIR, url.pathname === '/' ? 'index.html' : url.pathname);
    if (!fs.existsSync(filePath)) {
      // SPA Fallback for client routes like /app
      filePath = path.join(DIST_DIR, 'index.html');
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const mime = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  // 404 for unknown endpoints
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'NOT_FOUND', message: 'Resource not found' }));
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`🚀 RoofRay AI Solar Server running on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/ai/health`);
    console.log(`   API Endpoint: http://localhost:${PORT}/api/ai/solar-advisor`);
  });
}

export default server;
