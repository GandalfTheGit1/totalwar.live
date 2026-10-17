/**
 * lib/llm-rotation/index.ts
 *
 * Public entrypoint for the LLM Model Rotation, Quota Management,
 * and Cascade Dispatch System.
 */

// Types & Interfaces
export type {
  TaskTier,
  LLMProvider,
  GeminiModelConfig,
  ModelConfig,
  KeyModelQuota,
  RotatedCallOptions,
  ModelStatus,
} from './types';

// Models Registry & Tier Cascades
export { MODELS, TIER_CASCADES } from './models-config';

// Key Management & Hashing
export {
  hashApiKey,
  getKeyLabel,
  isValidApiKey,
  getGeminiApiKeys,
  getGeminiEmbeddingApiKeys,
  getMistralApiKeys,
  getGroqApiKeys,
  getKeysForProvider,
} from './key-manager';

// Quota Tracking & Cooldowns
export {
  TIER_COOLDOWN_MS,
  RATE_LIMIT_COOLDOWN_MS,
  resetQuotaRegistry,
  getKeyModelQuota,
  resetDailyIfNeeded,
  cleanMinuteWindow,
  checkTierExhaustion,
  markTierExhausted,
  classifyRateLimit,
} from './quota-tracker';

// Provider Callers
export { callGoogleModel } from './providers/google-caller';
export { callMistralModel } from './providers/mistral-caller';
export { callGroqModel } from './providers/groq-caller';

// UI Inspection & Status
export {
  pushUiLog,
  getRotationStatus,
  logRotationStatus,
} from './inspector-logger';

// Execution Engine
export { callWithRotation } from './rotation-engine';
