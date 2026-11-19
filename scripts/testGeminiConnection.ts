import fs from 'fs';
import { resolveGeminiModel } from '../src/server/advisorService';

// Zero-dependency .env loader supporting local environment
function loadEnv() {
  if (fs.existsSync('.env')) {
    const lines = fs.readFileSync('.env', 'utf-8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const k = trimmed.slice(0, idx).trim();
        let v = trimmed.slice(idx + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }
        if (!(k in process.env)) {
          process.env[k] = v;
        }
      }
    }
  }
}

loadEnv();

async function runGeminiConnectionTest() {
  console.log('🤖 RoofRay V3.3 — Live Gemini API Connection Verification\n');
  console.log('================================================================');

  // 1. Read GEMINI_API_KEY from private environment
  const rawKey = process.env.GEMINI_API_KEY || '';
  const apiKey = rawKey.trim().replace(/^["']|["']$/g, '').trim();

  // 2. Read GEMINI_MODEL from private environment
  const configuredModel = resolveGeminiModel();

  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.length < 10) {
    console.error('❌ FAIL: GEMINI_API_KEY is not configured or invalid in private environment (.env).');
    process.exit(1);
  }

  const isAqFormat = apiKey.startsWith('AQ.');
  console.log('1. Environment Configuration:');
  console.log(`   • Key Format: ${isAqFormat ? 'Google AQ Authorization Key (AQ...)' : 'Standard Google AI Key'}`);
  console.log(`   • Key Length: ${apiKey.length} characters (preview: ${apiKey.slice(0, 4)}...${apiKey.slice(-4)})`);
  console.log(`   • Model Tested: ${configuredModel}`);

  // 3. Verify the configured model resource metadata
  console.log('\n2. Model Resource Verification:');
  try {
    const modelUrl = `https://generativelanguage.googleapis.com/v1beta/models/${configuredModel}`;
    const modelRes = await fetch(modelUrl, {
      method: 'GET',
      headers: {
        'x-goog-api-key': apiKey,
      },
    });

    if (!modelRes.ok) {
      const errJson = (await modelRes.json().catch(() => null)) as { error?: { message?: string } } | null;
      let errMsg = errJson?.error?.message || modelRes.statusText || 'Unknown error';
      errMsg = errMsg.split(apiKey).join('[REDACTED_API_KEY]');
      console.error(`  ❌ FAIL: Model resource check failed (HTTP ${modelRes.status}): ${errMsg}`);
      process.exit(1);
    }

    const modelMeta = (await modelRes.json()) as { displayName?: string; supportedGenerationMethods?: string[] };
    const supportsGen = (modelMeta.supportedGenerationMethods || []).includes('generateContent');
    console.log(`  ✅ PASS: Model resource verified in Google API catalog`);
    console.log(`   • Display Name: ${modelMeta.displayName || configuredModel}`);
    console.log(`   • Supports generateContent: ${supportsGen}`);
    if (!supportsGen) {
      console.error(`  ❌ FAIL: Model "${configuredModel}" does not declare support for generateContent.`);
      process.exit(1);
    }
  } catch (err: unknown) {
    let msg = err instanceof Error ? err.message : String(err);
    msg = msg.split(apiKey).join('[REDACTED_API_KEY]');
    console.error(`  ❌ FAIL: Network failure while verifying model metadata: ${msg}`);
    process.exit(1);
  }

  // 4. Send ONE minimal generation request
  console.log('\n3. Minimal Live Generation Request:');
  const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/${configuredModel}:generateContent`;

  try {
    const startTime = Date.now();
    const genRes = await fetch(genUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Respond with exactly: {"status":"ROOFRAY_ONLINE"}' }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      }),
    });

    const elapsed = Date.now() - startTime;
    // 6. Report actual HTTP status
    // 7. Report model tested
    console.log(`   • HTTP Status: ${genRes.status} ${genRes.statusText} (${elapsed}ms)`);
    console.log(`   • Model Tested: ${configuredModel}`);

    const resJson = (await genRes.json().catch(() => null)) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      error?: { message?: string };
      modelVersion?: string;
      usageMetadata?: {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
        totalTokenCount?: number;
      };
    } | null;

    if (!genRes.ok) {
      // 8. Report sanitized provider error details
      let rawMsg = resJson?.error?.message || genRes.statusText || 'Unknown provider error';
      rawMsg = rawMsg.split(apiKey).join('[REDACTED_API_KEY]');
      console.error(`  ❌ FAIL: Generation request returned HTTP ${genRes.status}: ${rawMsg}`);
      process.exit(1);
    }

    // 5. Verify generated text is returned
    const candidateText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText || typeof candidateText !== 'string' || candidateText.trim().length === 0) {
      console.error('  ❌ FAIL: Empty or missing candidate generated text in response.');
      process.exit(1);
    }

    console.log(`  ✅ PASS: Generated text returned: ${candidateText.trim()}`);

    // 9. Report modelVersion and token usage when available
    if (resJson?.modelVersion) {
      console.log(`   • Model Version: ${resJson.modelVersion}`);
    }
    if (resJson?.usageMetadata) {
      const { promptTokenCount, candidatesTokenCount, totalTokenCount } = resJson.usageMetadata;
      console.log(
        `   • Token Usage: prompt=${promptTokenCount}, candidates=${candidatesTokenCount}, total=${totalTokenCount}`
      );
    }

    console.log('\n================================================================');
    console.log('RoofRay Gemini connection successful.');
    console.log('================================================================\n');
  } catch (err: unknown) {
    let msg = err instanceof Error ? err.message : String(err);
    msg = msg.split(apiKey).join('[REDACTED_API_KEY]');
    console.error(`  ❌ FAIL: Request exception during generation: ${msg}`);
    process.exit(1);
  }
}

runGeminiConnectionTest();
