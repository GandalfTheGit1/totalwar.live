/**
 * Orchestrates paper betting: loads the player's account, prices it against live Polymarket quotes,
 * settles resolved markets and persists the result. Mutations for one player run one at a time.
 */

import { randomUUID } from 'crypto';
import { getMarket } from './polymarket-client';
import { PaperBetError, closePosition, createAccount, placeBet, settleAccount, summarize } from './paper-engine';
import { getPaperStore, type PaperStore } from './paper-store';
import type { AccountSummary, PaperAccount, PmMarket } from './types';

const locks = new Map<string, Promise<unknown>>();

function withPlayerLock<T>(playerId: string, task: () => Promise<T>): Promise<T> {
  const previous = locks.get(playerId) ?? Promise.resolve();
  const next = previous.then(task, task);
  const tail = next.catch(() => undefined);
  locks.set(playerId, tail);
  void tail.then(() => {
    if (locks.get(playerId) === tail) locks.delete(playerId);
  });
  return next;
}

async function fetchMarkets(ids: string[]): Promise<Map<string, PmMarket>> {
  const unique = Array.from(new Set(ids));
  const results = await Promise.allSettled(unique.map((id) => getMarket(id)));
  const map = new Map<string, PmMarket>();
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') map.set(unique[i], r.value);
  });
  return map;
}

async function loadOrCreate(store: PaperStore, playerId: string): Promise<PaperAccount> {
  return (await store.load(playerId)) ?? createAccount(playerId);
}

async function settleAndSummarize(
  store: PaperStore,
  account: PaperAccount
): Promise<{ account: PaperAccount; summary: AccountSummary }> {
  const openIds = account.positions.filter((p) => p.status === 'open').map((p) => p.marketId);
  const markets = await fetchMarkets(openIds);
  const settled = settleAccount(account, markets);
  if (settled !== account) await store.save(settled);
  return { account: settled, summary: summarize(settled, markets) };
}

export function getAccountSummary(playerId: string, store: PaperStore = getPaperStore()): Promise<AccountSummary> {
  return withPlayerLock(playerId, async () => {
    const account = await loadOrCreate(store, playerId);
    return (await settleAndSummarize(store, account)).summary;
  });
}

export interface PlaceBetInput {
  marketId: string;
  eventSlug?: string;
  eventTitle?: string;
  outcomeIndex: 0 | 1;
  stake: number;
}

export function placePaperBet(
  playerId: string,
  input: PlaceBetInput,
  store: PaperStore = getPaperStore()
): Promise<AccountSummary> {
  return withPlayerLock(playerId, async () => {
    const account = await loadOrCreate(store, playerId);
    const market = await getMarket(input.marketId);
    const updated = placeBet(account, {
      market,
      eventSlug: (input.eventSlug ?? market.slug).slice(0, 200),
      eventTitle: (input.eventTitle ?? market.question).slice(0, 300),
      outcomeIndex: input.outcomeIndex,
      stake: input.stake,
      positionId: randomUUID(),
    });
    await store.save(updated);
    return (await settleAndSummarize(store, updated)).summary;
  });
}

export function closePaperPosition(
  playerId: string,
  positionId: string,
  store: PaperStore = getPaperStore()
): Promise<AccountSummary> {
  return withPlayerLock(playerId, async () => {
    const account = await loadOrCreate(store, playerId);
    const position = account.positions.find((p) => p.id === positionId);
    if (!position) throw new PaperBetError('position_not_found', 'Posición no encontrada.');
    const market = await getMarket(position.marketId);
    const updated = closePosition(account, positionId, market);
    await store.save(updated);
    return (await settleAndSummarize(store, updated)).summary;
  });
}

/** Wipes the player's account back to the starting balance. */
export function resetPaperAccount(playerId: string, store: PaperStore = getPaperStore()): Promise<AccountSummary> {
  return withPlayerLock(playerId, async () => {
    const fresh = createAccount(playerId);
    await store.save(fresh);
    return summarize(fresh, new Map());
  });
}
