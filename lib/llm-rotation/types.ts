/**
 * lib/llm-rotation/types.ts
 *
 * Common types and interfaces for the LLM rotation, tiering, and quota system.
 */

export type TaskTier = 'HEAVY' | 'MEDIUM' | 'LIGHT';

export type LLMProvider = 'google' | 'mistral' | 'groq';

export interface GeminiModelConfig {
  id: string;           // API model identifier
  alias: string;        // Human-readable label for logs and UI
  provider: LLMProvider;
  rpd: number;          // Requests Per Day (free tier limit)
  rpm: number;          // Requests Per Minute (free tier limit)
}

export type ModelConfig = GeminiModelConfig;

export interface KeyModelQuota {
  dailyDate: string;        // YYYY-MM-DD
  dailyCount: number;
  timestamps: number[];     // Timestamps (ms) of successful requests in last 60s
  rateLimitedUntil: number; // Timestamp (ms) until which this key is in RPM cooldown
}

export interface RotatedCallOptions {
  tier: TaskTier;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  /**
   * Optional pre-computed input token estimate.
   * Passing it explicitly avoids double-computing when caller already estimated length.
   */
  estimatedInputTokens?: number;
  responseFormat?: 'json' | 'text';
}

export interface ModelStatus {
  modelId:    string;
  alias:      string;
  tier:       string;
  dailyUsed:  number;
  dailyLimit: number;
  dailyPct:   number;
  rpmUsed:    number;
  rpmLimit:   number;
  available:  boolean;
}
