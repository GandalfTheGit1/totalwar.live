/**
 * Polymarket public read APIs (no auth, no wallet).
 *  - Gamma  https://gamma-api.polymarket.com  -> events, markets, search
 *  - CLOB   https://clob.polymarket.com       -> price history
 * Normalizers are pure so they can be tested against recorded payloads.
 */

import type { PmEvent, PmMarket, PmOutcome } from './types';

const GAMMA = 'https://gamma-api.polymarket.com';
const CLOB = 'https://clob.polymarket.com';
const TIMEOUT_MS = 12_000;

type Json = Record<string, any>;

const ATTEMPTS = 3;

export class PolymarketUnavailableError extends Error {
  constructor(url: string, cause: unknown) {
    super(`Polymarket unreachable: ${url}`);
    this.name = 'PolymarketUnavailableError';
    this.cause = cause;
  }
}

async function getJson<T>(url: string): Promise<T> {
  let lastError: unknown;
  // Connection resets are frequent on some networks; retry those, never HTTP errors.
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    let res: Response;
    try {
      // Gamma pages can exceed Next's 2 MB fetch-cache limit, so caching happens on the normalized result instead.
      res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
        cache: 'no-store',
      });
    } catch (err) {
      lastError = err;
      if (attempt < ATTEMPTS) await new Promise((r) => setTimeout(r, 300 * attempt));
      continue;
    }
    if (!res.ok) throw new Error(`Polymarket ${res.status} for ${url}`);
    return (await res.json()) as T;
  }
  throw new PolymarketUnavailableError(url, lastError);
}

const memo = new Map<string, { expires: number; value: Promise<unknown> }>();

/** Shares one in-flight/recent request per key for `ttlSeconds`; failures are not kept. */
function cached<T>(key: string, ttlSeconds: number, load: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = memo.get(key);
  if (hit && hit.expires > now) return hit.value as Promise<T>;
  const value = load();
  memo.set(key, { expires: now + ttlSeconds * 1000, value });
  value.catch(() => memo.delete(key));
  if (memo.size > 200) {
    for (const [k, v] of memo) if (v.expires <= now) memo.delete(k);
  }
  return value;
}

/** Gamma returns arrays either as real arrays or as JSON-encoded strings. */
function parseList(raw: unknown): any[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function num(raw: unknown, fallback = 0): number {
  const n = typeof raw === 'number' ? raw : parseFloat(String(raw ?? ''));
  return Number.isFinite(n) ? n : fallback;
}

function nullableNum(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = typeof raw === 'number' ? raw : parseFloat(String(raw));
  return Number.isFinite(n) ? n : null;
}

/** Final payouts when the market is settled: every price is exactly 0, 0.5 or 1 and the market is closed. */
function deriveResolution(closed: boolean, umaStatus: unknown, prices: number[]): number[] | null {
  if (!closed || prices.length === 0) return null;
  const settledValues = prices.every((p) => p === 0 || p === 0.5 || p === 1);
  const sum = prices.reduce((a, b) => a + b, 0);
  if (!settledValues || Math.abs(sum - 1) > 1e-9) return null;
  if (umaStatus && umaStatus !== 'resolved') return null;
  return prices;
}

export function normalizeMarket(m: Json): PmMarket {
  const names = parseList(m.outcomes).map(String);
  const prices = parseList(m.outcomePrices).map((p) => num(p));
  const tokens = parseList(m.clobTokenIds).map(String);
  const outcomes: PmOutcome[] = names.map((name, i) => ({
    name,
    price: prices[i] ?? 0,
    tokenId: tokens[i] ?? null,
  }));
  const closed = Boolean(m.closed);

  return {
    id: String(m.id),
    question: String(m.question ?? ''),
    label: String(m.groupItemTitle || m.question || ''),
    slug: String(m.slug ?? ''),
    endDate: m.endDate ?? null,
    active: m.active !== false,
    closed,
    acceptingOrders: m.acceptingOrders !== false && !closed,
    binary: outcomes.length === 2,
    outcomes,
    bestBid: nullableNum(m.bestBid),
    bestAsk: nullableNum(m.bestAsk),
    volume: num(m.volumeNum ?? m.volume),
    volume24hr: num(m.volume24hr),
    liquidity: num(m.liquidityNum ?? m.liquidity),
    resolution: deriveResolution(closed, m.umaResolutionStatus, prices),
  };
}

export function normalizeEvent(e: Json): PmEvent {
  const markets = parseList(e.markets).map((m) => normalizeMarket(m as Json));
  return {
    id: String(e.id),
    slug: String(e.slug ?? ''),
    title: String(e.title ?? ''),
    description: String(e.description ?? ''),
    image: String(e.image ?? e.icon ?? ''),
    url: `https://polymarket.com/event/${e.slug}`,
    tags: parseList(e.tags)
      .map((t: Json) => String(t?.label ?? t?.slug ?? ''))
      .filter(Boolean),
    volume: num(e.volume),
    volume24hr: num(e.volume24hr),
    liquidity: num(e.liquidity),
    endDate: e.endDate ?? null,
    markets,
  };
}

export interface ListEventsOptions {
  tag?: string;
  limit?: number;
  offset?: number;
}

/** Active events ordered by 24h volume, optionally restricted to a Polymarket tag slug. */
export async function listEvents({ tag, limit = 30, offset = 0 }: ListEventsOptions = {}): Promise<PmEvent[]> {
  const params = new URLSearchParams({
    closed: 'false',
    active: 'true',
    order: 'volume24hr',
    ascending: 'false',
    limit: String(Math.min(Math.max(limit, 1), 100)),
    offset: String(Math.max(offset, 0)),
  });
  if (tag) params.set('tag_slug', tag);
  const url = `${GAMMA}/events?${params}`;
  return cached(url, 30, async () => (await getJson<Json[]>(url)).map(normalizeEvent));
}

export async function searchEvents(query: string, limit = 20): Promise<PmEvent[]> {
  const params = new URLSearchParams({
    q: query,
    events_status: 'active',
    limit_per_type: String(Math.min(Math.max(limit, 1), 50)),
  });
  const url = `${GAMMA}/public-search?${params}`;
  return cached(url, 60, async () => ((await getJson<{ events?: Json[] }>(url)).events ?? []).map(normalizeEvent));
}

/** Fresh snapshot of one market — never cached, it is the price a paper bet fills at. */
export async function getMarket(marketId: string): Promise<PmMarket> {
  if (!/^\d+$/.test(marketId)) throw new Error('Invalid market id');
  return normalizeMarket(await getJson<Json>(`${GAMMA}/markets/${marketId}`));
}

export type HistoryInterval = '1d' | '1w' | '1m' | 'max';

export interface PricePoint {
  t: number;
  p: number;
}

export async function getPriceHistory(tokenId: string, interval: HistoryInterval = '1w'): Promise<PricePoint[]> {
  if (!/^\d+$/.test(tokenId)) throw new Error('Invalid token id');
  const fidelity = interval === '1d' ? 15 : interval === '1w' ? 60 : 360;
  const params = new URLSearchParams({ market: tokenId, interval, fidelity: String(fidelity) });
  const url = `${CLOB}/prices-history?${params}`;
  return cached(url, 120, async () => (await getJson<{ history?: PricePoint[] }>(url)).history ?? []);
}
