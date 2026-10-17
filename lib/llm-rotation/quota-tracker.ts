/**
 * lib/llm-rotation/quota-tracker.ts
 *
 * Tracks per-key and per-model quotas (Requests Per Day, Requests Per Minute).
 * Provides robust classification between permanent daily exhaustion (RPD) and
 * temporary per-minute burst cooldowns (RPM), plus tier exhaustion guards.
 */

import { KeyModelQuota, TaskTier, GeminiModelConfig } from './types';
import { hashApiKey, getKeyLabel } from './key-manager';
import { logServer } from '../server-logger';

export const TIER_COOLDOWN_MS = 60_000;        // 60s cooldown when entire tier is exhausted
export const RATE_LIMIT_COOLDOWN_MS = 90_000;  // 90s temporary cooldown on RPM 429

// In-memory quota and exhaustion registries
const quotaRegistry: Record<string, KeyModelQuota> = {};
const tierExhaustedUntil: Record<string, number> = {};

export function resetQuotaRegistry(): void {
  for (const k in quotaRegistry) delete quotaRegistry[k];
  for (const k in tierExhaustedUntil) delete tierExhaustedUntil[k];
}

export function getKeyModelQuota(apiKey: string, modelId: string): KeyModelQuota {
  const registryKey = `${hashApiKey(apiKey)}:${modelId}`;
  if (!quotaRegistry[registryKey]) {
    quotaRegistry[registryKey] = {
      dailyDate: '',
      dailyCount: 0,
      timestamps: [],
      rateLimitedUntil: 0,
    };
  }
  return quotaRegistry[registryKey];
}

export function resetDailyIfNeeded(quota: KeyModelQuota): void {
  const today = new Date().toISOString().slice(0, 10);
  if (quota.dailyDate !== today) {
    quota.dailyDate = today;
    quota.dailyCount = 0;
    quota.timestamps = [];
    quota.rateLimitedUntil = 0;
  }
}

export function cleanMinuteWindow(quota: KeyModelQuota): void {
  const now = Date.now();
  quota.timestamps = quota.timestamps.filter(t => now - t < 60_000);
}

export function checkTierExhaustion(tier: TaskTier): { isExhausted: boolean; remainingSec: number } {
  const now = Date.now();
  if (tierExhaustedUntil[tier] && now < tierExhaustedUntil[tier]) {
    const remainingSec = Math.ceil((tierExhaustedUntil[tier] - now) / 1000);
    return { isExhausted: true, remainingSec };
  }
  return { isExhausted: false, remainingSec: 0 };
}

export function markTierExhausted(tier: TaskTier): void {
  tierExhaustedUntil[tier] = Date.now() + TIER_COOLDOWN_MS;
  logServer('GeminiRotation', `🛑 All models/keys exhausted for tier=${tier}. Cooldown set for ${TIER_COOLDOWN_MS / 1000}s.`, 'error');
}

export function classifyRateLimit(
  status: number,
  cleanErrorMsg: string
): { isDailyQuotaError: boolean; limitType: 'SUSPENDED' | 'RPD' | 'RPM' } {
  const msgLower = cleanErrorMsg.toLowerCase();
  
  const isRpdSignal =
    status === 403 ||
    msgLower.includes('daily') ||
    msgLower.includes('per day') ||
    msgLower.includes('per_day') ||
    msgLower.includes('day limit') ||
    (msgLower.includes('quota') && !msgLower.includes('rate'));

  const isRpmSignal =
    msgLower.includes('per minute') ||
    msgLower.includes('per_minute') ||
    msgLower.includes('minute') ||
    msgLower.includes('rate limit') ||
    msgLower.includes('rate_limit') ||
    msgLower.includes('too many requests') ||
    msgLower.includes('rpm');

  const isDailyQuotaError = isRpdSignal && !isRpmSignal;
  const limitType: 'SUSPENDED' | 'RPD' | 'RPM' =
    status === 403 ? 'SUSPENDED' : isDailyQuotaError ? 'RPD' : 'RPM';

  return { isDailyQuotaError, limitType };
}

export function handleQuotaExceeded(
  quota: KeyModelQuota,
  cfg: GeminiModelConfig,
  apiKey: string,
  status: number,
  cleanErrorMsg: string
): void {
  const { isDailyQuotaError, limitType } = classifyRateLimit(status, cleanErrorMsg);
  const keyLabel = getKeyLabel(apiKey);

  if (isDailyQuotaError) {
    quota.dailyCount = cfg.rpd; // Mark key as exhausted for today
    console.error(
      `\x1b[1;31m[${limitType}] ${keyLabel} exhausted for ${cfg.alias} [HTTP ${status}]: ${cleanErrorMsg}. ` +
      `Daily: ${quota.dailyCount}/${cfg.rpd}. Key is done for today.\x1b[0m`
    );
    logServer(
      'GeminiRotation',
      `🔴 [${limitType}] ${keyLabel} — daily quota EXHAUSTED (${quota.dailyCount}/${cfg.rpd} req/day) for ${cfg.alias}. Skipping for rest of day.`,
      'error'
    );
  } else {
    // RPM temporary cooldown
    quota.rateLimitedUntil = Date.now() + RATE_LIMIT_COOLDOWN_MS;
    console.warn(
      `\x1b[1;33m[RPM] ${keyLabel} hit per-minute limit on ${cfg.alias} [HTTP ${status}]: ${cleanErrorMsg}. ` +
      `Daily budget intact: ${quota.dailyCount}/${cfg.rpd}. Cooldown: ${RATE_LIMIT_COOLDOWN_MS / 1000}s.\x1b[0m`
    );
    logServer(
      'GeminiRotation',
      `⏳ [RPM] ${keyLabel} — per-minute limit hit for ${cfg.alias} (cooldown ${RATE_LIMIT_COOLDOWN_MS / 1000}s). Daily: ${quota.dailyCount}/${cfg.rpd} (key NOT exhausted).`,
      'warn'
    );
  }
}

export function recordSuccessfulCall(quota: KeyModelQuota): void {
  quota.dailyCount++;
  quota.timestamps.push(Date.now());
}
