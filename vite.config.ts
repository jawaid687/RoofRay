import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

// Auto-load .env into process.env for dev server middleware (Node 18+ compatible)
if (fs.existsSync('.env')) {
  if (typeof process.loadEnvFile === 'function') {
    try {
      process.loadEnvFile('.env');
    } catch {
      // ignore
    }
  } else {
    try {
      const content = fs.readFileSync('.env', 'utf-8');
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
          if (!(key in process.env)) process.env[key] = val;
        }
      }
    } catch {
      // ignore
    }
  }
}

import { handleSolarAdvisorRequest, validateAdvisorPayload, checkRateLimit } from './src/server/advisorService';

function solarAdvisorApiPlugin(): Plugin {
  return {
    name: 'solar-advisor-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/ai')) {
          return next();
        }

        const url = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);

        if (req.method === 'GET' && (url.pathname === '/api/ai/health' || url.pathname === '/api/health')) {
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              status: 'ok',
              service: 'RoofRay AI Solar Advisor (Vite Dev Server)',
              version: '3.3.0',
              timestamp: new Date().toISOString(),
              aiProvider: 'Google Gemini',
              modelConfigured: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
              keyConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' && process.env.GEMINI_API_KEY.trim().length > 10),
              authMethod: 'x-goog-api-key header (secured)',
            })
          );
          return;
        }

        if (req.method === 'POST' && url.pathname === '/api/ai/solar-advisor') {
          const clientIp = req.socket.remoteAddress || '127.0.0.1';
          if (!checkRateLimit(clientIp)) {
            res.statusCode = 429;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many requests. Please wait a minute before requesting another advisory evaluation.',
              })
            );
            return;
          }

          let bodyText = '';
          req.on('data', (chunk) => {
            bodyText += chunk;
          });

          req.on('end', async () => {
            try {
              const payload = JSON.parse(bodyText);
              const validation = validateAdvisorPayload(payload);
              if (!validation.valid) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'INVALID_PAYLOAD', message: validation.error }));
                return;
              }

              const result = await handleSolarAdvisorRequest(payload);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : 'Server Error';
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'SERVER_ERROR', message: msg }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), solarAdvisorApiPlugin()],
  server: {
    port: 3000,
    open: false,
  },
});
