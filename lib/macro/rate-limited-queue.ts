// Module: lib/macro/rate-limited-queue.ts
// Handles rate-limiting (100 req/min), 429 retries, and 403 circuit breakers.

import { logError } from '../server-logger';

let circuitBreakerActive = false;
const requestTimestamps: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 100;
const SLIDING_WINDOW_MS = 60000;
const RETRY_PAUSE_MS = 60000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function enforceRateLimit() {
  const now = Date.now();
  
  // Remove timestamps outside of the sliding window
  const cutoff = now - SLIDING_WINDOW_MS;
  while (requestTimestamps.length > 0 && requestTimestamps[0] < cutoff) {
    requestTimestamps.shift();
  }

  // If limit reached, calculate wait time
  if (requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    const oldestTimestamp = requestTimestamps[0];
    const waitTime = SLIDING_WINDOW_MS - (now - oldestTimestamp);
    if (waitTime > 0) {
      console.log(`[RateLimit] Limit of ${MAX_REQUESTS_PER_MINUTE} req/min reached. Sleeping for ${(waitTime / 1000).toFixed(1)}s...`);
      await sleep(waitTime);
      // Re-enforce after sleeping to ensure window has cleared
      await enforceRateLimit();
      return;
    }
  }

  requestTimestamps.push(Date.now());
}

export interface RateLimitedFetchOptions extends RequestInit {
  revalidateSeconds?: number;
}

/**
 * Perform a fetch request subject to sequential rate limiting, 429 auto-retry, and 403 circuit breaking.
 */
export async function rateLimitedFetch(
  url: string,
  options: RateLimitedFetchOptions = {}
): Promise<Response> {
  if (circuitBreakerActive) {
    const errMsg = '[RateLimit] 🛑 Circuit breaker active due to a previous 403 Forbidden. Aborting request.';
    console.error(errMsg);
    throw new Error(errMsg);
  }

  await enforceRateLimit();

  const { revalidateSeconds, ...fetchOptions } = options;
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    ...(fetchOptions.headers || {}),
  };

  try {
    const nextConfig = revalidateSeconds !== undefined ? { next: { revalidate: revalidateSeconds } } : {};
    const res = await fetch(url, {
      ...fetchOptions,
      headers,
      ...nextConfig,
    } as any);

    if (res.status === 429) {
      console.warn(`[RateLimit] ⚠️ Received 429 Rate Limit Exceeded for ${url}. Pausing queue for 60s and retrying...`);
      await sleep(RETRY_PAUSE_MS);
      // Retry request (re-evaluating rate limit sliding window)
      return rateLimitedFetch(url, options);
    }

    if (res.status === 403) {
      circuitBreakerActive = true;
      const errMsg = `[RateLimit] 🚨 Received 403 Forbidden for ${url}. Permanent Circuit Breaker triggered.`;
      logError('RateLimitedQueue', new Error(errMsg), { url });
      throw new Error(errMsg);
    }

    return res;
  } catch (err: any) {
    if (err.message && err.message.includes('Circuit Breaker')) {
      throw err;
    }
    // Network or other fetch error, propagate
    console.error(`[RateLimit] Fetch exception for ${url}:`, err);
    throw err;
  }
}

/**
 * Helper to check if the circuit breaker has been tripped.
 */
export function isCircuitBreakerActive(): boolean {
  return circuitBreakerActive;
}

/**
 * Resets the circuit breaker (primarily for testing/admin purposes).
 */
export function resetCircuitBreaker(): void {
  circuitBreakerActive = false;
  requestTimestamps.length = 0;
}
