/**
 * lib/server-logger.ts
 *
 * Request-scoped server logging utility using Node's AsyncLocalStorage.
 * Accumulates logs during API execution and streams them back to the frontend.
 */

interface AsyncLocalStorageLike<T> {
  getStore(): T | undefined;
  run<R>(store: T, callback: () => R): R;
}

class NoopAsyncLocalStorage<T> implements AsyncLocalStorageLike<T> {
  getStore(): T | undefined {
    return undefined;
  }
  run<R>(_store: T, callback: () => R): R {
    return callback();
  }
}

let LogStorageClass: new <T>() => AsyncLocalStorageLike<T> = NoopAsyncLocalStorage;

if (typeof window === 'undefined') {
  try {
    // Dynamic require so bundlers targeting browser don't attempt to statically bundle async_hooks
    const nodeRequire = typeof __non_webpack_require__ !== 'undefined' ? __non_webpack_require__ : require;
    const asyncHooks = nodeRequire('async_hooks');
    if (asyncHooks?.AsyncLocalStorage) {
      LogStorageClass = asyncHooks.AsyncLocalStorage;
    }
  } catch {
    // Fallback to no-op in non-node or browser contexts
  }
}

import { systemEvents } from './system-events';
import { supabase } from './supabase';

export interface RequestLogContext {
  logs: string[];
  fallbackWarnings: string[];
  cacheId?: string;
}

export const logStorage: AsyncLocalStorageLike<RequestLogContext> = new LogStorageClass<RequestLogContext>();

// ANSI color escape codes for Node terminal logging
const TERMINAL_COLORS = {
  reset: '\x1b[0m',
  blue: '\x1b[34m',
  amber: '\x1b[33m',
  red: '\x1b[31m',
  emerald: '\x1b[32m',
  violet: '\x1b[35m',
  gray: '\x1b[90m',
};

const LOG_COLORS: Record<string, string> = {
  info: TERMINAL_COLORS.blue,
  warn: TERMINAL_COLORS.amber,
  error: TERMINAL_COLORS.red,
  success: TERMINAL_COLORS.emerald,
  api: TERMINAL_COLORS.violet,
  active: TERMINAL_COLORS.emerald,
};

// ─── Deduplication / Throttling Cache ───
// Prevent error loops from flooding the database.
const errorLogCache = new Map<string, number>();
const ERROR_COOLDOWN_MS = 60 * 1000; // 1 minute cooldown per error signature

/**
 * Log message to the server console and accumulate it in the active request storage.
 */
export function logServer(
  source: string,
  message: string,
  type: 'info' | 'warn' | 'error' | 'success' | 'api' | 'active' = 'info',
): void {
  const timestamp = new Date().toTimeString().slice(0, 8); // HH:MM:SS
  const color = LOG_COLORS[type] || TERMINAL_COLORS.reset;

  // Print formatted colored logs to server terminal
  const terminalLog = `${TERMINAL_COLORS.gray}[${timestamp}]${TERMINAL_COLORS.reset} ${color}[${source}]${TERMINAL_COLORS.reset} ${message}`;

  if (type === 'error') {
    console.error(terminalLog);
  } else if (type === 'warn') {
    console.warn(terminalLog);
  } else {
    console.log(terminalLog);
  }

  // Accumulate logs in request-scoped AsyncLocalStorage
  const store = logStorage.getStore();
  if (store) {
    store.logs.push(`[${timestamp}] [${source}] ${message} (${type})`);
    if (store.cacheId) {
      try {
        if (typeof window === 'undefined') {
          const nodeRequire = typeof __non_webpack_require__ !== 'undefined' ? __non_webpack_require__ : eval('require');
          const { PipelineLogger } = nodeRequire('./services/pipeline-logger');
          const pLogger = new PipelineLogger(store.cacheId);
          pLogger.log(`[${source}] ${message}`);
        }
      } catch (e) {
        // ignore require cycle or error
      }
    }
  }

  // Emit to global event bus for real-time monitoring
  try {
    systemEvents.emit('log', { timestamp, source, message, type });
  } catch {
    // Ignore error during certain build contexts
  }
}

/**
 * Map known source labels to a service id used by GlobalStatusPanel.
 */
function deriveServiceFromSource(source: string): string | null {
  const s = source.toLowerCase();
  if (s.includes('llm') || s.includes('gemini')) return 'llm';
  if (s.includes('google')) return 'google';
  if (s.includes('tavily')) return 'tavily';
  if (s.includes('news')) return 'news';
  if (s.includes('supabase') || s.includes('db')) return 'supabase';
  if (s.includes('sec') || s.includes('edgar')) return 'sec';
  if (s.includes('reddit') || s.includes('twitter') || s.includes('social')) return 'social';
  if (s.includes('fraud') || s.includes('radar')) return 'fraud-radar';
  if (s.includes('rag') || s.includes('embedding')) return 'rag-system';
  if (s.includes('value') || s.includes('supply')) return 'value-network';
  return null;
}

/**
 * Log a structured Error object with full stack trace and optional context metadata.
 * Emits a rich event to the SSE monitor that includes errorType, stack, context, and service.
 *
 * @param source   Module label, e.g. 'Pipeline', 'SEC-Intelligence'
 * @param error    The caught error (any type — normalized internally)
 * @param context  Optional extra metadata: { step, ticker, service, ... }
 */
export function logError(
  source: string,
  error: unknown,
  context?: Record<string, unknown>,
): void {
  const timestamp = new Date().toTimeString().slice(0, 8);

  const isError = error instanceof Error;
  const message = isError ? error.message : String(error);
  const stack = isError ? (error.stack ?? '') : '';
  const errorType = isError ? error.name : 'UnknownError';

  // Terminal output — show first 6 lines of stack
  const terminalLog = `${TERMINAL_COLORS.gray}[${timestamp}]${TERMINAL_COLORS.reset} ${TERMINAL_COLORS.red}[${source}]${TERMINAL_COLORS.reset} ${errorType}: ${message}`;
  console.error(terminalLog);
  if (stack) {
    const stackLines = stack.split('\n').slice(0, 6).join('\n');
    console.error(`${TERMINAL_COLORS.gray}${stackLines}${TERMINAL_COLORS.reset}`);
  }

  // Accumulate in request-scoped storage
  const store = logStorage.getStore();
  if (store) {
    const contextStr = context ? ` | ctx=${JSON.stringify(context)}` : '';
    store.logs.push(`[${timestamp}] [${source}] ${errorType}: ${message}${contextStr} (error)`);
  }

  // Derive service hint — prefer explicit context.service, then infer from source label
  const service = (context?.service as string | undefined) ?? deriveServiceFromSource(source);

  // Emit rich structured event to SSE monitor
  try {
    systemEvents.emit('log', {
      timestamp,
      source,
      message,
      type: 'error',
      stack,
      errorType,
      service,
      context: context ?? null,
    });
  } catch {
    // Ignore errors during build contexts
  }

  // Deduplication logic
  const errorSignature = `${source}:${message}`;
  const now = Date.now();
  const lastLogged = errorLogCache.get(errorSignature) || 0;

  if (now - lastLogged < ERROR_COOLDOWN_MS) {
    return; // Skip DB insertion to prevent flooding
  }
  errorLogCache.set(errorSignature, now);
  
  // Prune cache if it gets too large
  if (errorLogCache.size > 1000) {
    const oldestAllowed = now - ERROR_COOLDOWN_MS;
    for (const [key, timestamp] of errorLogCache.entries()) {
      if (timestamp < oldestAllowed) {
        errorLogCache.delete(key);
      }
    }
  }

  // Persist to database asynchronously (fire and forget)
  Promise.resolve(supabase.from('system_notifications').insert({
    type: 'error',
    source,
    message,
    stack,
    context: context ?? null,
    service: service ?? null,
  })).then(({ error: dbErr }) => {
    if (dbErr) {
      console.error(`[ServerLogger] Failed to persist system notification: ${dbErr.message}`);
    }
  }).catch((e: any) => {
    console.error(`[ServerLogger] Unhandled error persisting notification: ${e}`);
  });
}

/**
 * Log a fallback event and push it to the active request's fallback warnings array.
 * This is used to bubble up warnings to the frontend UI as toast notifications.
 */
export function logFallback(message: string): void {
  logServer('Fallback', message, 'warn');
  const store = logStorage.getStore();
  if (store && store.fallbackWarnings) {
    store.fallbackWarnings.push(message);
  }
}
