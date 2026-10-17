/**
 * lib/llm-client.ts
 * Unified client for executing structured JSON LLM calls.
 * Supports:
 *  - Gemini Flash Lite/Flash
 *
 * Uses the intelligent callWithRotation() cascade from gemini-rotation.ts
 * which handles all providers with quota tracking, dynamic token budgets,
 * truncation detection/retry, and automatic failover.
 */

export { logRotationStatus, getRotationStatus } from './gemini-rotation';
export type { TaskTier } from './gemini-rotation';
import { callWithRotation } from './gemini-rotation';
import { TaskTier } from './gemini-rotation';
import crypto from 'crypto';

export type LlmProvider = 'gemini' | 'mistral' | 'groq' | 'openrouter' | 'cohere';

export interface LlmCompletionOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  provider?: LlmProvider;
  estimatedInputTokens?: number;
  disableThinking?: boolean;
  tier?: TaskTier;
  responseFormat?: 'json' | 'text';
}

export interface LlmCallLog {
  id: string;
  timestamp: string;
  tier: TaskTier;
  providerRequested?: string;
  systemPrompt: string;
  userPrompt: string;
  response: string;
  durationMs: number;
  status: 'success' | 'error';
  error?: string;
}

const MAX_LOGS = 100;

// Preserve logs across Next.js HMR (Hot Module Replacement) reloads in dev mode
const globalAny = global as any;
if (!globalAny.llmCallLogs) {
  globalAny.llmCallLogs = [];
}
const llmCallLogs: LlmCallLog[] = globalAny.llmCallLogs;

export function getLlmCallLogs(): LlmCallLog[] {
  return [...llmCallLogs];
}

export function clearLlmCallLogs(): void {
  llmCallLogs.length = 0;
}

const VALID_PROVIDERS: Set<string> = new Set(['gemini', 'mistral', 'groq', 'openrouter', 'cohere']);

export function getEffectiveProvider(provider?: string): LlmProvider {
  if (provider && VALID_PROVIDERS.has(provider.toLowerCase())) {
    return provider.toLowerCase() as LlmProvider;
  }
  return 'gemini';
}

// ─── Loop Detection Circuit Breaker ──────────────────────────────────────────
interface LoopTracker {
  timestamps: number[];
  blockedUntil: number;
}

const loopTrackerMap = new Map<string, LoopTracker>();
const LOOP_WINDOW_MS = 60_000;
const MAX_ALLOWED_REPEATS_PER_MIN = 3;
const BLOCK_DURATION_MS = 5 * 60_000;

function getPromptSignature(systemPrompt: string, userPrompt: string): string {
  const content = `${systemPrompt}::${userPrompt}`;
  return crypto.createHash('md5').update(content).digest('hex');
}

function checkLoopCircuitBreaker(systemPrompt: string, userPrompt: string): void {
  const signature = getPromptSignature(systemPrompt, userPrompt);
  const now = Date.now();
  let tracker = loopTrackerMap.get(signature);

  if (!tracker) {
    tracker = { timestamps: [], blockedUntil: 0 };
    loopTrackerMap.set(signature, tracker);
  }

  if (tracker.blockedUntil > now) {
    const remainingSec = Math.ceil((tracker.blockedUntil - now) / 1000);
    const errorMsg = `[LLM CircuitBreaker] 🛑 DETECTED INFINITE LOOP STORM! Prompt signature [${signature.substring(0, 8)}] has been BLOCKED (${remainingSec}s remaining). Aborting call.`;
    console.error(`\x1b[1;31m${errorMsg}\x1b[0m`);
    throw new Error(errorMsg);
  }

  tracker.timestamps = tracker.timestamps.filter(t => now - t < LOOP_WINDOW_MS);

  if (tracker.timestamps.length >= MAX_ALLOWED_REPEATS_PER_MIN) {
    tracker.blockedUntil = now + BLOCK_DURATION_MS;
    const errorMsg = `[LLM CircuitBreaker] 🛑 LOOP DETECTED: The exact same LLM prompt signature [${signature.substring(0, 8)}] was called ${tracker.timestamps.length + 1} times in < 60s! Circuit broken. Blocking this request for 5 minutes.`;
    console.error(`\x1b[1;31m${errorMsg}\x1b[0m`);
    throw new Error(errorMsg);
  }

  tracker.timestamps.push(now);
}

export async function callLlm(options: LlmCompletionOptions): Promise<string> {
  const temperature = options.temperature ?? 0.3;
  const maxTokens = options.maxTokens ?? 1200;
  const tier: TaskTier = options.tier ?? inferTier(maxTokens);

  checkLoopCircuitBreaker(options.systemPrompt, options.userPrompt);

  console.log(`[LLMClient] Routing request via unified rotation | Tier: ${tier}`);

  const startTime = Date.now();
  const logId = `llm_${startTime}_${Math.random().toString(36).substring(2, 7)}`;
  const timeStr = new Date().toLocaleTimeString();

  try {
    const response = await callWithRotation({
      tier,
      systemPrompt: options.systemPrompt,
      userPrompt: options.userPrompt,
      temperature,
      maxTokens,
      estimatedInputTokens: options.estimatedInputTokens,
      responseFormat: options.responseFormat,
    });

    const durationMs = Date.now() - startTime;
    llmCallLogs.unshift({
      id: logId,
      timestamp: timeStr,
      tier,
      providerRequested: options.provider || 'gemini',
      systemPrompt: options.systemPrompt,
      userPrompt: options.userPrompt,
      response,
      durationMs,
      status: 'success',
    });

    if (llmCallLogs.length > MAX_LOGS) {
      llmCallLogs.pop();
    }

    return response;
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    llmCallLogs.unshift({
      id: logId,
      timestamp: timeStr,
      tier,
      providerRequested: options.provider || 'gemini',
      systemPrompt: options.systemPrompt,
      userPrompt: options.userPrompt,
      response: '',
      durationMs,
      status: 'error',
      error: err?.message || String(err),
    });

    if (llmCallLogs.length > MAX_LOGS) {
      llmCallLogs.pop();
    }

    throw err;
  }
}

function inferTier(maxTokens: number): TaskTier {
  if (maxTokens >= 5000) return 'HEAVY';
  if (maxTokens >= 1500) return 'MEDIUM';
  return 'LIGHT';
}
