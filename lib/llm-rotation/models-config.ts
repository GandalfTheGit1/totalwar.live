/**
 * lib/llm-rotation/models-config.ts
 *
 * Model catalog definitions and per-tier cascade priorities.
 * Optimized by reasoning capability, generation speed, and free-tier quota cushions (RPD/RPM).
 */

import { GeminiModelConfig, TaskTier } from './types';

export const MODELS: Record<string, GeminiModelConfig> = {
  'gemini-3.5-flash': {
    id: 'gemini-3.5-flash',
    alias: 'Gemini 3.5 Flash',
    provider: 'google',
    rpd: 20,
    rpm: 5,
  },
  'gemini-3-flash': {
    id: 'gemini-3-flash-preview',
    alias: 'Gemini 3 Flash',
    provider: 'google',
    rpd: 20,
    rpm: 5,
  },
  'gemini-3.1-flash-lite': {
    id: 'gemini-3.1-flash-lite',
    alias: 'Gemini 3.1 Flash Lite',
    provider: 'google',
    rpd: 500,
    rpm: 15,
  },
  'gemini-3.5-flash-lite': {
    id: 'gemini-3.5-flash-lite',
    alias: 'Gemini 3.5 Flash Lite',
    provider: 'google',
    rpd: 500,
    rpm: 15,
  },
  'mistral-large-latest': {
    id: 'mistral-large-latest',
    alias: 'Mistral Large',
    provider: 'mistral',
    rpd: 1000,
    rpm: 60,
  },
  // Backward-compatible alias for workflows referencing qwen3.6-27b
  'qwen/qwen3.6-27b': {
    id: 'qwen/qwen3.8-27b',
    alias: 'Qwen 3.8 27B',
    provider: 'groq',
    rpd: 1000,
    rpm: 30,
  },

  'qwen/qwen3.8-27b': {
    id: 'qwen/qwen3.8-27b',
    alias: 'Qwen 3.8 27B',
    provider: 'groq',
    rpd: 1000,
    rpm: 30,
  },
  // FIX (21.2): 'groq/compound' is not a real Groq API model ID — Compound is a Groq UI product.
  // Replaced with 'llama-3.3-70b-versatile', a production-available Groq model with strong
  // multi-step reasoning suitable for HEAVY tier tasks (1000 RPD free tier).
  'llama-3.3-70b-versatile': {
    id: 'llama-3.3-70b-versatile',
    alias: 'Llama 3.3 70B Versatile (Groq)',
    provider: 'groq',
    rpd: 1000,
    rpm: 30,
  },
};

// ─── Per-Tier Model Cascade (Priority Order) ─────────────────────────────────
export const TIER_CASCADES: Record<TaskTier, string[]> = {
  HEAVY: [
    'gemini-3.5-flash',         // 1. Flagship Google: Near-Pro reasoning, highest intelligence
    'gemini-3-flash',           // 2. Doctorate-level reasoning preview (GPQA 90.4%)
    'qwen/qwen3.8-27b',         // 3. Dense 27B coding & reasoning powerhouse on Groq LPUs (1000 RPD)
    'llama-3.3-70b-versatile',  // 4. Groq 70B multi-step reasoning, production-available (1000 RPD)
    'mistral-large-latest',     // 5. Deep safety cushion (256k ctx, 1000 RPD)
  ],
  MEDIUM: [
    'qwen/qwen3.8-27b',       // 1. Primary: Ultra-sharp structured JSON & code reasoning on Groq LPU
    'gemini-3.5-flash-lite',  // 2. 350 tok/s high-speed document parsing (500 RPD)
    'gemini-3.1-flash-lite',  // 3. Stable GA volume workhorse (500 RPD)
    'mistral-large-latest',   // 4. Deep safety cushion (1000 RPD)
  ],
  LIGHT: [
    'gemini-3.5-flash-lite',  // 1. Fastest generation speed (350 tok/s) for high-throughput tagging
    'gemini-3.1-flash-lite',  // 2. Stable high-volume classifier (500 RPD)
    'mistral-large-latest',   // 3. High-throughput safety cushion (1000 RPD)
  ],
};
