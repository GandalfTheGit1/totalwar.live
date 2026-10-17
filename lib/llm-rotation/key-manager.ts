/**
 * lib/llm-rotation/key-manager.ts
 *
 * Manages API keys across multiple providers (Google, Mistral, Groq).
 * Handles multi-key discovery from environment variables, hashing for tracking,
 * human-readable slot labeling for diagnostics, and round-robin index rotation.
 */

import { LLMProvider } from './types';

// ─── Key Hashing & Identification ───────────────────────────────────────────

/**
 * Generates a stable, unique hash for an API key.
 * Uses a djb2 hash of the full key string to prevent collisions.
 */
export function hashApiKey(apiKey: string): string {
  let hash = 5381;
  for (let i = 0; i < apiKey.length; i++) {
    hash = ((hash << 5) + hash + apiKey.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

let _keyLabelMap: Map<string, string> | null = null;

function buildKeyLabelMap(): Map<string, string> {
  const m = new Map<string, string>();
  const slots: Array<[string | undefined, string]> = [
    // Google Gemini Keys
    [process.env.GEMINI_API_KEY,                                        'GMNI_BASE'],
    [process.env.GEMINI_API_KEY_1 ?? process.env.GEMINI_API_KEY1,      'GMNI_1'],
    [process.env.GEMINI_API_KEY_2 ?? process.env.GEMINI_API_KEY2,      'GMNI_2'],
    [process.env.GEMINI_API_KEY_3 ?? process.env.GEMINI_API_KEY3,      'GMNI_3'],
    [process.env.GEMINI_API_KEY_4 ?? process.env.GEMINI_API_KEY4,      'GMNI_4'],
    
    // Mistral Keys
    [process.env.MISTRAL_API_KEY,                                       'MSTR_BASE'],
    [process.env.MISTRAL_API_KEY_1 ?? process.env.MISTRAL_API_KEY1,    'MSTR_1'],
    [process.env.MISTRAL_API_KEY_2 ?? process.env.MISTRAL_API_KEY2,    'MSTR_2'],
    [process.env.MISTRAL_API_KEY_3 ?? process.env.MISTRAL_API_KEY3,    'MSTR_3'],
    [process.env.MISTRAL_API_KEY_4 ?? process.env.MISTRAL_API_KEY4,    'MSTR_4'],

    // Groq Keys
    [process.env.GROQ_API_KEY,                                          'GROQ_BASE'],
    [process.env.GROQ_API_KEY_1 ?? process.env.GROQ_API_KEY1,          'GROQ_1'],
    [process.env.GROQ_API_KEY_2 ?? process.env.GROQ_API_KEY2,          'GROQ_2'],
    [process.env.GROQ_API_KEY_3 ?? process.env.GROQ_API_KEY3,          'GROQ_3'],
    [process.env.GROQ_API_KEY_4 ?? process.env.GROQ_API_KEY4,          'GROQ_4'],
  ];

  for (const [key, label] of slots) {
    if (key) m.set(hashApiKey(key), label);
  }
  return m;
}

/**
 * Returns a human-readable slot label for an API key (e.g. "GMNI_1", "GROQ_BASE").
 * Falls back to a short hash if key is outside known environment variable slots.
 */
export function getKeyLabel(apiKey: string): string {
  if (!_keyLabelMap) _keyLabelMap = buildKeyLabelMap();
  return _keyLabelMap.get(hashApiKey(apiKey)) ?? `KEY_${hashApiKey(apiKey).substring(0, 6)}`;
}

export function isValidApiKey(key?: string): boolean {
  if (!key || typeof key !== 'string') return false;
  return key.trim().length >= 20;
}

// ─── Provider Key Retrievers ────────────────────────────────────────────────

export function getGeminiApiKeys(): string[] {
  const rawKeys: string[] = [];
  if (process.env.GEMINI_API_KEY) {
    rawKeys.push(process.env.GEMINI_API_KEY);
  }
  for (let i = 1; i <= 4; i++) {
    const key = process.env[`GEMINI_API_KEY_${i}`] || process.env[`GEMINI_API_KEY${i}`];
    if (key) rawKeys.push(key);
  }
  if (process.env.GEMINI_API_KEY2) {
    rawKeys.push(process.env.GEMINI_API_KEY2);
  }

  const validKeys = rawKeys.filter(isValidApiKey);
  return Array.from(new Set(validKeys));
}

export function getGeminiEmbeddingApiKeys(): string[] {
  const rawKeys: string[] = [];
  if (process.env.GEMINI_EMBEDDING_API_KEY) {
    rawKeys.push(process.env.GEMINI_EMBEDDING_API_KEY);
  }
  for (let i = 1; i <= 4; i++) {
    const key = process.env[`GEMINI_EMBEDDING_API_KEY_${i}`] || process.env[`GEMINI_EMBEDDING_API_KEY${i}`];
    if (key) rawKeys.push(key);
  }
  
  const validKeys = rawKeys.filter(isValidApiKey);
  if (validKeys.length > 0) {
    return Array.from(new Set(validKeys));
  }
  
  // Fallback to standard valid LLM keys if no specific embedding keys exist
  return getGeminiApiKeys();
}

export function getMistralApiKeys(): string[] {
  const rawKeys: string[] = [];
  if (process.env.MISTRAL_API_KEY) {
    rawKeys.push(process.env.MISTRAL_API_KEY);
  }
  for (let i = 1; i <= 4; i++) {
    const key = process.env[`MISTRAL_API_KEY_${i}`] || process.env[`MISTRAL_API_KEY${i}`];
    if (key) rawKeys.push(key);
  }
  
  const validKeys = rawKeys.filter(isValidApiKey);
  return Array.from(new Set(validKeys));
}

export function getGroqApiKeys(): string[] {
  const rawKeys: string[] = [];
  if (process.env.GROQ_API_KEY) {
    rawKeys.push(process.env.GROQ_API_KEY);
  }
  for (let i = 1; i <= 4; i++) {
    const key = process.env[`GROQ_API_KEY_${i}`] || process.env[`GROQ_API_KEY${i}`];
    if (key) rawKeys.push(key);
  }
  
  const validKeys = rawKeys.filter(isValidApiKey);
  return Array.from(new Set(validKeys));
}

export function getKeysForProvider(provider: LLMProvider): string[] {
  switch (provider) {
    case 'google':
      return getGeminiApiKeys();
    case 'mistral':
      return getMistralApiKeys();
    case 'groq':
      return getGroqApiKeys();
    default:
      return [];
  }
}

// ─── Round-Robin Key State ──────────────────────────────────────────────────

let geminiKeyIndex = 0;
let mistralKeyIndex = 0;
let groqKeyIndex = 0;

export function getAndAdvanceKeyIndex(provider: LLMProvider, poolSize: number): number {
  if (poolSize <= 0) return 0;
  let idx = 0;
  if (provider === 'mistral') {
    idx = mistralKeyIndex % poolSize;
    mistralKeyIndex = (mistralKeyIndex + 1) % poolSize;
  } else if (provider === 'groq') {
    idx = groqKeyIndex % poolSize;
    groqKeyIndex = (groqKeyIndex + 1) % poolSize;
  } else {
    idx = geminiKeyIndex % poolSize;
    geminiKeyIndex = (geminiKeyIndex + 1) % poolSize;
  }
  return idx;
}
