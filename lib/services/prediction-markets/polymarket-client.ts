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

async function getJson<T>(url: string, revalidateSeconds: number): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    next: { revalidate: revalidateSeconds },
  } as RequestInit);
  if (!res.ok) throw new Error(`Polymarket ${res.status} for ${url}`);
  return (await res.json()) as T;
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
  const raw = await getJson<Json[]>(`${GAMMA}/events?${params}`, 30);
  return raw.map(normalizeEvent);
}

export async function searchEvents(query: string, limit = 20): Promise<PmEvent[]> {
  const params = new URLSearchParams({
    q: query,
    events_status: 'active',
    limit_per_type: String(Math.min(Math.max(limit, 1), 50)),
  });
  const raw = await getJson<{ events?: Json[] }>(`${GAMMA}/public-search?${params}`, 60);
  return (raw.events ?? []).map(normalizeEvent);
}

/** Fresh snapshot of one market — never cached, it is the price a paper bet fills at. */
export async function getMarket(marketId: string): Promise<PmMarket> {
  if (!/^\d+$/.test(marketId)) throw new Error('Invalid market id');
  const raw = await getJson<Json>(`${GAMMA}/markets/${marketId}`, 0);
  return normalizeMarket(raw);
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
  const raw = await getJson<{ history?: PricePoint[] }>(`${CLOB}/prices-history?${params}`, 120);
  return raw.history ?? [];
}
