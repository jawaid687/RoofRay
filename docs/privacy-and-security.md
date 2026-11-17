# RoofRay V3 — Privacy, Security & Threat Modeling

**Track:** International AI Builders Congress 2026 — Idea to Unicorn  
**Standard:** Enterprise Security, Server Secret Isolation & Data Minimization  

---

## 1. Security Architecture & Threat Vectors

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY BOUNDARY                        │
│                                                             │
│   [Client Browser]                                          │
│   • Runs in sandboxed WebGL/DOM context                     │
│   • ZERO access to GEMINI_API_KEY                           │
│   • No VITE_ prefixed secrets                              │
│   • Ephemeral local calculation state                       │
│                                                             │
│              ↕ HTTPS / Safe JSON Transport                  │
│                                                             │
│   [Node.js AI Service Gateway]                              │
│   • Reads GEMINI_API_KEY from process.env                   │
│   • 30 req/min Sliding Window IP Rate Limiter               │
│   • Strict 256KB Payload Size Limit                         │
│   • Input Structure & Type Validation                       │
│   • 25-Second Outbound Request Timeout                      │
│                                                             │
│              ↕ TLS 1.3 Outbound Encrypted                   │
│                                                             │
│   [Google Gemini API Endpoint]                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. API Key Protection & Secret Isolation

- **Zero Client-Side Exposure (Rule 7 & 8):** API keys are never prefixed with `VITE_` and never compiled into frontend JavaScript bundles.
- **Server-Side Environment:** Secrets reside strictly in the Node.js server environment via `process.env.GEMINI_API_KEY`.
- **Git Protection:** The `.gitignore` file strictly excludes `.env`, `.env.local`, `.env.*.local`, and any credential files. The repository only provides `.env.example` with sanitized placeholders.

---

## 3. API Abuse Protection & Rate Limiting

To prevent denial-of-service (DoS) or quota exhaustion attacks against the Gemini API:
1. **Sliding Window IP Rate Limiter:** The backend service tracks client IP addresses and enforces a strict ceiling of **30 requests per minute**. Excess requests receive `HTTP 429 Too Many Requests`.
2. **Payload Size Guard:** Incoming request bodies are limited to a maximum of **256 KB**. Oversized requests are immediately terminated with `HTTP 413 Payload Too Large`.
3. **Execution Timeouts:** All outbound calls to Google Gemini have an active `AbortController` timeout of **25 seconds** to prevent hung worker threads.
4. **Input Sanitization:** User question strings are sanitized and bounded to 1,000 characters to prevent prompt injection attempts.

---

## 4. Data Privacy & Minimization

- **No Personal Data Collection:** RoofRay does not require user registration, passwords, credit card numbers, or personal identifying information (PII) to perform solar planning.
- **No Building Address Tracking:** Coordinates and city names represent user-selected calculation inputs; RoofRay does not store or link coordinates to user identities.
- **Ephemeral Processing:** Calculations are executed client-side in RAM. The backend AI gateway acts as a stateless pass-through and retains no permanent logs of rooftop configurations.
- **LocalStorage Data:** The browser only stores:
  - `roofray_language`: User language preference (`'en'` or `'bn'`).
  - `nasa_power_{lat}_{lon}`: Cached public NASA satellite insolation data (TTL: 7 days).

---

## 5. Third-Party API Governance

- **NASA POWER API:** Public domain open data endpoint. Dispatches anonymous latitude and longitude coordinates over HTTPS. No API key or authentication token is transmitted.
- **Google Gemini API:** Dispatches structured solar configuration data over encrypted HTTPS directly to Google's official endpoints (`generativelanguage.googleapis.com`). No personal user data is sent.
