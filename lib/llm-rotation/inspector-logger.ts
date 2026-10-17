/**
 * lib/llm-rotation/inspector-logger.ts
 *
 * Provides inspection utilities, UI error/skip logging to global.llmCallLogs,
 * and runtime speed-boost toggles.
 */

import { TaskTier, ModelStatus } from './types';
import { MODELS, TIER_CASCADES } from './models-config';
import { logServer } from '../server-logger';

export function pushUiLog(
  tier: TaskTier,
  providerRequested: string,
  systemPrompt: string,
  userPrompt: string,
  msg: string
): void {
  const globalAny = global as any;
  if (!globalAny.llmCallLogs) globalAny.llmCallLogs = [];
  globalAny.llmCallLogs.unshift({
    id: `llm_skip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toLocaleTimeString(),
    tier,
    providerRequested,
    systemPrompt: systemPrompt.substring(0, 200) + '... [truncated]',
    userPrompt: userPrompt.substring(0, 200) + '... [truncated]',
    response: '',
    durationMs: 0,
    status: 'error',
    error: msg,
  });
  if (globalAny.llmCallLogs.length > 100) {
    globalAny.llmCallLogs.pop();
  }
}

// ─── Quota Status Inspector ───────────────────────────────────────────────────
export function getRotationStatus(): ModelStatus[] {
  return Object.values(MODELS).map(cfg => {
    const tierLabel =
      TIER_CASCADES.HEAVY[0] === cfg.id
        ? 'HEAVY primary'
        : TIER_CASCADES.MEDIUM[0] === cfg.id
        ? 'MEDIUM primary'
        : 'LIGHT primary';

    return {
      modelId:    cfg.id,
      alias:      cfg.alias,
      tier:       tierLabel,
      dailyUsed:  0,
      dailyLimit: cfg.rpd,
      dailyPct:   0,
      rpmUsed:    0,
      rpmLimit:   cfg.rpm,
      available:  true,
    };
  });
}

export function logRotationStatus(): void {
  const rows = getRotationStatus();
  console.log('\n[GeminiRotation] 📊 Current Quota Status:');
  console.log('──────────────────────────────────────────────────────────────────────');
  for (const r of rows) {
    console.log(`✅ ${r.alias.padEnd(35)} | RPM Limit: ${r.rpmLimit} | Available: Yes`);
  }
  console.log('──────────────────────────────────────────────────────────────────────\n');
}
