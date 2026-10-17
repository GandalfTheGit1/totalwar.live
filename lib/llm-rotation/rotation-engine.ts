/**
 * lib/llm-rotation/rotation-engine.ts
 *
 * Core execution engine for model rotation, tier cascades, key failover,
 * quota management, and adaptive error handling.
 */

import { RotatedCallOptions } from './types';
import { MODELS, TIER_CASCADES } from './models-config';
import {
  getKeyLabel,
  getGeminiApiKeys,
  getMistralApiKeys,
  getGroqApiKeys,
  getAndAdvanceKeyIndex,
} from './key-manager';
import {
  getKeyModelQuota,
  resetDailyIfNeeded,
  cleanMinuteWindow,
  checkTierExhaustion,
  markTierExhausted,
  handleQuotaExceeded,
  recordSuccessfulCall,
} from './quota-tracker';
import { callGoogleModel } from './providers/google-caller';
import { callMistralModel } from './providers/mistral-caller';
import { callGroqModel } from './providers/groq-caller';
import { pushUiLog } from './inspector-logger';
import { logServer } from '../server-logger';

/**
 * Calls the best available model for the given task tier with intelligent fallback.
 */
export async function callWithRotation(options: RotatedCallOptions): Promise<string> {
  const {
    tier,
    systemPrompt,
    userPrompt,
    temperature = 0.3,
    maxTokens = 2000,
  } = options;

  // ─── 1. Tier Exhaustion Cooldown Guard ──────────────────────────────────────
  const { isExhausted, remainingSec } = checkTierExhaustion(tier);
  if (isExhausted) {
    throw new Error(
      `[GeminiRotation] All models/keys exhausted for tier=${tier}. Cooldown active (${remainingSec}s remaining).`
    );
  }

  const cascade = TIER_CASCADES[tier];
  let lastError: Error | null = null;

  // Fetch available key pools
  const freeGoogleKeys = getGeminiApiKeys();
  const freeMistralKeys = getMistralApiKeys();
  const freeGroqKeys = getGroqApiKeys();

  const getKeysForProvider = (provider: string) => {
    if (provider === 'mistral') return freeMistralKeys;
    if (provider === 'groq') return freeGroqKeys;
    return freeGoogleKeys;
  };

  // ─── 2. Model Cascade & Key Traversal ───────────────────────────────────────
  for (const modelId of cascade) {
    const cfg = MODELS[modelId];
    if (!cfg) continue;

    const phaseKeys = getKeysForProvider(cfg.provider);
    if (phaseKeys.length === 0) continue;

    let skippedDueToContext = false;
    let loopCondition = true;
    let totalModelAttempts = 0;
    const MAX_MODEL_ATTEMPTS = phaseKeys.length * 6; // Prevent infinite loops if things get stuck

    while (loopCondition && totalModelAttempts < MAX_MODEL_ATTEMPTS) {
      let anyKeyHasDailyQuota = false;
      let minCooldownMs = Infinity;
      let keyAttempts = 0;
      const maxAttempts = phaseKeys.length;

      while (keyAttempts < maxAttempts) {
        const keyIdx = getAndAdvanceKeyIndex(cfg.provider, phaseKeys.length);
        const apiKey = phaseKeys[keyIdx];
        keyAttempts++;
        totalModelAttempts++;

        // Quota Guard for Current Key
        const quota = getKeyModelQuota(apiKey, cfg.id);
        resetDailyIfNeeded(quota);
        cleanMinuteWindow(quota);

        // Check daily limit (RPD)
        if (quota.dailyCount >= cfg.rpd) {
          logServer(
            'GeminiRotation',
            `⏸ [RPD] ${getKeyLabel(apiKey)} — daily quota EXHAUSTED (${quota.dailyCount}/${cfg.rpd} req/day) for ${cfg.alias}. Key is done for today.`,
            'warn'
          );
          continue;
        }

        anyKeyHasDailyQuota = true;

        // Check RPM cooldown (from previous 429 that was not a daily exhaustion)
        const nowForCooldown = Date.now();
        if (quota.rateLimitedUntil > nowForCooldown) {
          const remainMs = quota.rateLimitedUntil - nowForCooldown;
          if (remainMs < minCooldownMs) minCooldownMs = remainMs;
          const remainCooldownSec = Math.ceil(remainMs / 1000);
          logServer(
            'GeminiRotation',
            `⏸ [RPM cooldown] ${getKeyLabel(apiKey)} — ${remainCooldownSec}s left for ${cfg.alias} (daily: ${quota.dailyCount}/${cfg.rpd} — key NOT exhausted).`,
            'info'
          );
          continue;
        }

        // Check minute limit (RPM) and apply dynamic backoff if needed
        let rpmWaitAttempts = 0;
        while (quota.timestamps.length >= cfg.rpm) {
          rpmWaitAttempts++;
          if (rpmWaitAttempts > 3) {
            logServer(
              'GeminiRotation',
              `🛑 [RPM] ${getKeyLabel(apiKey)} — max RPM wait attempts exceeded for ${cfg.alias}. Daily intact: ${quota.dailyCount}/${cfg.rpd}. Skipping to next key.`,
              'warn'
            );
            break;
          }
          const oldest = quota.timestamps[0];
          const now = Date.now();
          const waitTimeMs = Math.max(1000, 60_000 - (now - oldest) + 1500); // 1.5s safety margin

          logServer(
            'GeminiRotation',
            `⏳ [RPM] ${getKeyLabel(apiKey)} — RPM limit reached (${quota.timestamps.length}/${cfg.rpm} req/min) for ${cfg.alias}. Daily remaining: ${cfg.rpd - quota.dailyCount}/${cfg.rpd}. Waiting ${Math.ceil(waitTimeMs / 1000)}s...`,
            'info'
          );

          await new Promise(r => setTimeout(r, waitTimeMs));
          cleanMinuteWindow(quota);
        }

        if (quota.timestamps.length >= cfg.rpm) {
          continue; // Try next key
        }

        logServer(
          'GeminiRotation',
          `🚀 [Tier: ${tier}] → ${cfg.alias} | Key: ${getKeyLabel(apiKey)} [slot ${keyIdx + 1}/${phaseKeys.length}] | RPD: ${quota.dailyCount + 1}/${cfg.rpd} req/day | RPM: ${quota.timestamps.length + 1}/${cfg.rpm} req/min`,
          'info'
        );

        try {
          let result: string;
          if (cfg.provider === 'google') {
            result = await callGoogleModel(cfg.id, systemPrompt, userPrompt, temperature, maxTokens, apiKey, 0, options.responseFormat);
          } else if (cfg.provider === 'mistral') {
            result = await callMistralModel(cfg.id, systemPrompt, userPrompt, temperature, maxTokens, apiKey);
          } else {
            result = await callGroqModel(cfg.id, systemPrompt, userPrompt, temperature, maxTokens, apiKey);
          }

          recordSuccessfulCall(quota);
          logServer('GeminiRotation', `✅ [Tier: ${tier}] [Phase: FREE] Success via ${cfg.alias}`, 'success');
          return result;
        } catch (err: any) {
          lastError = err;
          let cleanErrorMsg = err.message || 'Error desconocido';
          if (cleanErrorMsg.includes('{')) {
            try {
              const startIdx = cleanErrorMsg.indexOf('{');
              const jsonStr = cleanErrorMsg.substring(startIdx);
              const parsedError = JSON.parse(jsonStr);
              cleanErrorMsg = parsedError.error?.message || cleanErrorMsg;
            } catch {
              // Ignore JSON parse error
            }
          }

          let emoji = '⚠️';
          if (err.status === 429) emoji = '⏳';
          else if (err.status === 402) emoji = '💳';
          else if (err.status === 403) emoji = '🚫';
          else if (err.status === 413) emoji = '📦';
          else if (err.status === 500 || err.status === 503) emoji = '🔥 [SERVER ERROR]';

          // 402 Payment Required: billing issue, cascade to next model immediately
          if (err.status === 402) {
            const msg = `💳 [PAYMENT_REQUIRED] ${getKeyLabel(apiKey)} — ${cfg.alias} requires billing. Cascading to next model immediately.`;
            console.error(`\x1b[1;31m${msg}\x1b[0m`);
            logServer('GeminiRotation', msg, 'error');
            pushUiLog(options.tier, cfg.alias, systemPrompt, userPrompt, msg);
            skippedDueToContext = true;
            loopCondition = false;
            break;
          }

          // 429 Rate Limit / 403 Forbidden
          const isQuotaOrAuth = err.status === 429 || err.status === 403;
          if (isQuotaOrAuth) {
            handleQuotaExceeded(quota, cfg, apiKey, err.status, cleanErrorMsg);
            continue; // Try next key
          }

          logServer(
            'GeminiRotation',
            `${emoji} [Phase: FREE] Key index ${keyIdx} failed for ${cfg.alias} (Status: ${err.status}): ${cleanErrorMsg}`,
            'warn'
          );

          // 400 Context Length / Invalid Request / 413 Payload Too Large
          if (err.status === 400 || err.status === 413) {
            const lower = cleanErrorMsg.toLowerCase();
            if (err.status === 413 || lower.includes('length') || lower.includes('context_length_exceeded') || lower.includes('too large') || lower.includes('payload')) {
              const msg = `⏭️ Límite de contexto/payload excedido para ${cfg.alias}, delegando al siguiente modelo...`;
              logServer('GeminiRotation', msg, 'warn');
              pushUiLog(options.tier, cfg.alias, systemPrompt, userPrompt, msg);
              skippedDueToContext = true;
              loopCondition = false;
              break; // Skip to next model
            }
            throw err;
          }

          // Server errors or connectivity failures: rotate key with a short delay
          logServer('GeminiRotation', `🔄 Key index ${keyIdx} failed. Rotating...`, 'info');
          await new Promise(r => setTimeout(r, 1000));
        }
      }

      if (!loopCondition) break; // Exited due to 400/402/413

      if (!anyKeyHasDailyQuota) {
        // All keys are RPD exhausted for this model. Proceed to cascade.
        break;
      }

      if (minCooldownMs !== Infinity) {
        // We have keys with daily quota, but they are all in RPM/TPM cooldown!
        // Instead of cascading to a dumber model, we wait for the quota to refresh.
        const waitSec = Math.ceil(minCooldownMs / 1000);
        logServer('GeminiRotation', `⏳ All keys for ${cfg.alias} are in RPM cooldown. Waiting ${waitSec}s to avoid unnecessary cascade...`, 'warn');
        await new Promise(r => setTimeout(r, minCooldownMs + 1000));
        continue; // Re-evaluate the while loop to retry the current model
      }

      // If we reach here, it means keys had daily quota, weren't in RPM cooldown, but failed for other reasons (e.g. 500 server error).
      // We break and cascade to avoid infinite loops on 500s.
      break;
    }

    if (!skippedDueToContext) {
      const keyPool = phaseKeys.map(k => getKeyLabel(k)).join(', ');
      console.error(`\x1b[1;31m[CASCADE] All ${phaseKeys.length} key(s) [${keyPool}] failed or exhausted for ${cfg.alias}. Cascading to next model...\x1b[0m`);
      logServer('GeminiRotation', `🔴 [CASCADE] All keys [${keyPool}] failed or exhausted for ${cfg.alias}. Delegating to next model...`, 'error');
    }
  }

  // ─── 3. Full Tier Exhaustion ────────────────────────────────────────────────
  markTierExhausted(tier);
  throw lastError ?? new Error(`[GeminiRotation] All models/keys exhausted for tier=${tier}`);
}
