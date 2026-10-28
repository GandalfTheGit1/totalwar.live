/**
 * Paper-betting engine: pure functions over a PaperAccount. Fills use live Polymarket quotes
 * (ask to buy, bid to sell) so simulated P&L tracks what a real order book would have given.
 * No I/O here — persistence lives in paper-store.ts and prices come from polymarket-client.ts.
 */

import {
  MIN_STAKE,
  STARTING_BALANCE,
  type AccountSummary,
  type PaperAccount,
  type PaperPosition,
  type PmMarket,
  type PositionView,
} from './types';

export type PaperBetErrorCode =
  | 'invalid_stake'
  | 'insufficient_balance'
  | 'market_closed'
  | 'market_not_binary'
  | 'price_out_of_range'
  | 'position_not_found'
  | 'position_not_open'
  | 'no_quote';

export class PaperBetError extends Error {
  constructor(
    public readonly code: PaperBetErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'PaperBetError';
  }
}

const MIN_FILL = 0.01;
const MAX_FILL = 0.99;

const cents = (n: number) => Math.round(n * 100) / 100;
const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1);

export interface Quote {
  /** Price per share to open a position on this outcome. */
  buy: number | null;
  /** Price per share received when closing a position on this outcome. */
  sell: number | null;
}

/**
 * Gamma only exposes the order book of outcome 0; the other side of a binary market is its mirror
 * (buying "No" at x is selling "Yes" at 1 - x).
 */
export function quote(market: PmMarket, outcomeIndex: 0 | 1): Quote {
  const outcome = market.outcomes[outcomeIndex];
  if (!outcome) return { buy: null, sell: null };

  if (market.resolution) {
    const payout = market.resolution[outcomeIndex] ?? null;
    return { buy: null, sell: payout };
  }

  const mid = clamp01(outcome.price);
  if (outcomeIndex === 0) {
    return { buy: market.bestAsk ?? mid, sell: market.bestBid ?? mid };
  }
  return {
    buy: market.bestBid !== null ? 1 - market.bestBid : mid,
    sell: market.bestAsk !== null ? 1 - market.bestAsk : mid,
  };
}

export function createAccount(playerId: string, now: Date = new Date()): PaperAccount {
  const iso = now.toISOString();
  return {
    playerId,
    balance: STARTING_BALANCE,
    startingBalance: STARTING_BALANCE,
    positions: [],
    createdAt: iso,
    updatedAt: iso,
  };
}

export interface BetRequest {
  market: PmMarket;
  eventSlug: string;
  eventTitle: string;
  outcomeIndex: 0 | 1;
  stake: number;
  positionId: string;
  now?: Date;
}

export function placeBet(account: PaperAccount, req: BetRequest): PaperAccount {
  const { market, outcomeIndex } = req;
  const stake = cents(req.stake);

  if (!Number.isFinite(stake) || stake < MIN_STAKE) {
    throw new PaperBetError('invalid_stake', `La apuesta mínima es ${MIN_STAKE}.`);
  }
  if (stake > account.balance) {
    throw new PaperBetError('insufficient_balance', 'Saldo insuficiente.');
  }
  if (!market.binary) {
    throw new PaperBetError('market_not_binary', 'Solo se puede apostar en mercados de dos resultados.');
  }
  if (!market.active || market.closed || !market.acceptingOrders || market.resolution) {
    throw new PaperBetError('market_closed', 'El mercado ya no acepta órdenes.');
  }

  const price = quote(market, outcomeIndex).buy;
  if (price === null) throw new PaperBetError('no_quote', 'No hay precio disponible.');
  if (price < MIN_FILL || price > MAX_FILL) {
    throw new PaperBetError('price_out_of_range', 'El mercado está prácticamente decidido; elige otro.');
  }

  const now = (req.now ?? new Date()).toISOString();
  const position: PaperPosition = {
    id: req.positionId,
    marketId: market.id,
    eventSlug: req.eventSlug,
    eventTitle: req.eventTitle,
    question: market.question,
    outcomeIndex,
    outcomeName: market.outcomes[outcomeIndex].name,
    shares: stake / price,
    cost: stake,
    entryPrice: price,
    openedAt: now,
    status: 'open',
  };

  return {
    ...account,
    balance: cents(account.balance - stake),
    positions: [position, ...account.positions],
    updatedAt: now,
  };
}

function finish(
  position: PaperPosition,
  status: PaperPosition['status'],
  exitPrice: number,
  now: string
): PaperPosition {
  return {
    ...position,
    status,
    closedAt: now,
    exitPrice,
    proceeds: cents(position.shares * exitPrice),
  };
}

/** Sell an open position at the current bid. */
export function closePosition(
  account: PaperAccount,
  positionId: string,
  market: PmMarket,
  nowDate: Date = new Date()
): PaperAccount {
  const position = account.positions.find((p) => p.id === positionId);
  if (!position) throw new PaperBetError('position_not_found', 'Posición no encontrada.');
  if (position.status !== 'open') throw new PaperBetError('position_not_open', 'La posición ya está cerrada.');

  const exit = quote(market, position.outcomeIndex).sell;
  if (exit === null) throw new PaperBetError('no_quote', 'No hay precio disponible.');

  const now = nowDate.toISOString();
  const closed = finish(position, 'closed', exit, now);
  return {
    ...account,
    balance: cents(account.balance + (closed.proceeds ?? 0)),
    positions: account.positions.map((p) => (p.id === positionId ? closed : p)),
    updatedAt: now,
  };
}

/** Pay out open positions whose market has resolved. Returns the same object when nothing changed. */
export function settleAccount(
  account: PaperAccount,
  marketsById: Map<string, PmMarket>,
  nowDate: Date = new Date()
): PaperAccount {
  const now = nowDate.toISOString();
  let balance = account.balance;
  let changed = false;

  const positions = account.positions.map((p) => {
    if (p.status !== 'open') return p;
    const resolution = marketsById.get(p.marketId)?.resolution;
    if (!resolution) return p;

    const payout = resolution[p.outcomeIndex] ?? 0;
    const settled = finish(p, 'lost', payout, now);
    const status = (settled.proceeds ?? 0) > p.cost ? 'won' : 'lost';
    balance = cents(balance + (settled.proceeds ?? 0));
    changed = true;
    return { ...settled, status } as PaperPosition;
  });

  return changed ? { ...account, balance, positions, updatedAt: now } : account;
}

export function summarize(account: PaperAccount, marketsById: Map<string, PmMarket>): AccountSummary {
  let openValue = 0;
  let wins = 0;
  let losses = 0;

  const positions: PositionView[] = account.positions.map((p) => {
    if (p.status === 'open') {
      const market = marketsById.get(p.marketId);
      const markPrice = market ? quote(market, p.outcomeIndex).sell : null;
      const value = cents(p.shares * (markPrice ?? p.entryPrice));
      openValue += value;
      return { ...p, markPrice, value, pnl: cents(value - p.cost), pnlPct: pct(value - p.cost, p.cost) };
    }
    if (p.status === 'won') wins += 1;
    if (p.status === 'lost') losses += 1;
    const value = p.proceeds ?? 0;
    return { ...p, markPrice: null, value, pnl: cents(value - p.cost), pnlPct: pct(value - p.cost, p.cost) };
  });

  const equity = cents(account.balance + openValue);
  return {
    playerId: account.playerId,
    balance: account.balance,
    startingBalance: account.startingBalance,
    equity,
    openValue: cents(openValue),
    pnl: cents(equity - account.startingBalance),
    pnlPct: pct(equity - account.startingBalance, account.startingBalance),
    wins,
    losses,
    positions,
  };
}

function pct(delta: number, base: number): number {
  return base > 0 ? (delta / base) * 100 : 0;
}
