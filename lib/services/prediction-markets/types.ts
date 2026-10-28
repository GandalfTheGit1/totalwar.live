/**
 * Prediction markets (Polymarket) — shared types for live market data and the paper-betting ledger.
 * Prices are probabilities in [0, 1]; one share pays 1 virtual dollar if its outcome wins.
 */

export interface PmOutcome {
  name: string;
  /** Last mid/indicative price of the outcome (0..1). */
  price: number;
  /** CLOB token id, used for price history. */
  tokenId: string | null;
}

export interface PmMarket {
  id: string;
  question: string;
  slug: string;
  endDate: string | null;
  active: boolean;
  closed: boolean;
  acceptingOrders: boolean;
  /** True when the market has two outcomes (only binary markets can be bet on). */
  binary: boolean;
  outcomes: PmOutcome[];
  /** Best bid / ask of outcome 0 (the first outcome, usually "Yes"). */
  bestBid: number | null;
  bestAsk: number | null;
  volume: number;
  volume24hr: number;
  liquidity: number;
  /** Final payout per outcome (1 = won, 0 = lost, 0.5 = 50-50) once settled, otherwise null. */
  resolution: number[] | null;
}

export interface PmEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  url: string;
  tags: string[];
  volume: number;
  volume24hr: number;
  liquidity: number;
  endDate: string | null;
  markets: PmMarket[];
}

export interface PaperPosition {
  id: string;
  marketId: string;
  eventSlug: string;
  eventTitle: string;
  question: string;
  outcomeIndex: 0 | 1;
  outcomeName: string;
  /** Number of shares held. */
  shares: number;
  /** Virtual dollars spent. */
  cost: number;
  /** Average entry price (cost / shares). */
  entryPrice: number;
  openedAt: string;
  status: 'open' | 'closed' | 'won' | 'lost';
  closedAt?: string;
  /** Virtual dollars received on close/settlement. */
  proceeds?: number;
  exitPrice?: number;
}

export interface PaperAccount {
  playerId: string;
  balance: number;
  startingBalance: number;
  positions: PaperPosition[];
  createdAt: string;
  updatedAt: string;
}

export interface PositionView extends PaperPosition {
  /** Current sell price for open positions (what closing now would pay per share). */
  markPrice: number | null;
  /** Current value of an open position, or proceeds for a finished one. */
  value: number;
  pnl: number;
  pnlPct: number;
}

export interface AccountSummary {
  playerId: string;
  balance: number;
  startingBalance: number;
  equity: number;
  openValue: number;
  pnl: number;
  pnlPct: number;
  wins: number;
  losses: number;
  positions: PositionView[];
}

export const STARTING_BALANCE = 10_000;
export const MIN_STAKE = 1;
