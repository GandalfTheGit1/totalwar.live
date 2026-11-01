import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { normalizeEvent, normalizeMarket } from '@/lib/services/prediction-markets/polymarket-client';
import {
  PaperBetError,
  closePosition,
  createAccount,
  placeBet,
  quote,
  settleAccount,
  summarize,
} from '@/lib/services/prediction-markets/paper-engine';
import { MemoryPaperStore } from '@/lib/services/prediction-markets/paper-store';
import type { PmMarket } from '@/lib/services/prediction-markets/types';
import { BetSlip } from '@/components/markets/BetSlip';
import { EventCard } from '@/components/markets/EventCard';

const PLAYER = '11111111-2222-4333-8444-555555555555';

// Gamma encodes arrays as JSON strings.
const rawMarket = {
  id: '501',
  question: 'Will Iran close the Strait of Hormuz in 2026?',
  slug: 'iran-hormuz-2026',
  outcomes: '["Yes","No"]',
  outcomePrices: '["0.25","0.75"]',
  clobTokenIds: '["111","222"]',
  active: true,
  closed: false,
  acceptingOrders: true,
  bestBid: 0.24,
  bestAsk: 0.26,
  volumeNum: 120000,
  volume24hr: '5000',
  liquidityNum: 9000,
  endDate: '2026-12-31T00:00:00Z',
};

const market = (overrides: Partial<PmMarket> = {}): PmMarket => ({ ...normalizeMarket(rawMarket), ...overrides });

describe('polymarket normalizers', () => {
  it('parses JSON-string arrays and numbers', () => {
    const m = normalizeMarket(rawMarket);
    expect(m.binary).toBe(true);
    expect(m.outcomes).toEqual([
      { name: 'Yes', price: 0.25, tokenId: '111' },
      { name: 'No', price: 0.75, tokenId: '222' },
    ]);
    expect(m.volume24hr).toBe(5000);
    expect(m.resolution).toBeNull();
  });

  it('detects a resolved market', () => {
    const m = normalizeMarket({ ...rawMarket, closed: true, outcomePrices: '["1","0"]', umaResolutionStatus: 'resolved' });
    expect(m.resolution).toEqual([1, 0]);
    expect(m.acceptingOrders).toBe(false);
  });

  it('builds the event url and tags', () => {
    const e = normalizeEvent({ id: 9, slug: 'hormuz', title: 'Hormuz', tags: [{ label: 'Geopolitics' }], markets: [rawMarket] });
    expect(e.url).toBe('https://polymarket.com/event/hormuz');
    expect(e.tags).toEqual(['Geopolitics']);
    expect(e.markets).toHaveLength(1);
  });
});

describe('paper engine', () => {
  it('quotes Yes at the ask and No at the mirrored bid', () => {
    expect(quote(market(), 0)).toEqual({ buy: 0.26, sell: 0.24 });
    const no = quote(market(), 1);
    expect(no.buy).toBeCloseTo(0.76);
    expect(no.sell).toBeCloseTo(0.74);
  });

  it('places a bet, marks it and sells it at the bid', () => {
    const acc = placeBet(createAccount(PLAYER), {
      market: market(),
      eventSlug: 'hormuz',
      eventTitle: 'Hormuz',
      outcomeIndex: 0,
      stake: 26,
      positionId: 'p1',
    });
    expect(acc.balance).toBe(9974);
    expect(acc.positions[0].shares).toBeCloseTo(100);

    const summary = summarize(acc, new Map([['501', market()]]));
    expect(summary.openValue).toBe(24);
    expect(summary.pnl).toBe(-2);

    const sold = closePosition(acc, 'p1', market({ bestBid: 0.4 }));
    expect(sold.balance).toBe(10014);
    expect(sold.positions[0].status).toBe('closed');
  });

  it('rejects bad bets', () => {
    const acc = createAccount(PLAYER);
    const base = { market: market(), eventSlug: 's', eventTitle: 't', outcomeIndex: 0 as const, positionId: 'x' };
    expect(() => placeBet(acc, { ...base, stake: 0.5 })).toThrow(PaperBetError);
    expect(() => placeBet(acc, { ...base, stake: 20_000 })).toThrow(/Saldo insuficiente/);
    expect(() => placeBet(acc, { ...base, market: market({ closed: true }), stake: 10 })).toThrow(/no acepta/);
    expect(() => placeBet(acc, { ...base, market: market({ bestAsk: 0.995 }), stake: 10 })).toThrow(/decidido/);
  });

  it('settles winners and losers when the market resolves', () => {
    let acc = createAccount(PLAYER);
    const base = { market: market(), eventSlug: 's', eventTitle: 't', stake: 26 };
    acc = placeBet(acc, { ...base, outcomeIndex: 0, positionId: 'yes' });
    acc = placeBet(acc, { ...base, outcomeIndex: 1, positionId: 'no' });
    const resolved = market({ closed: true, resolution: [1, 0] });
    const settled = settleAccount(acc, new Map([['501', resolved]]));
    const byId = Object.fromEntries(settled.positions.map((p) => [p.id, p]));
    expect(byId.yes.status).toBe('won');
    expect(byId.yes.proceeds).toBe(100);
    expect(byId.no.status).toBe('lost');
    expect(settled.balance).toBe(10_000 - 52 + 100);
    expect(settleAccount(settled, new Map([['501', resolved]]))).toBe(settled);
  });

  it('memory store round-trips an account', async () => {
    const store = new MemoryPaperStore();
    await store.save(createAccount(PLAYER));
    expect((await store.load(PLAYER))?.balance).toBe(10_000);
  });
});

describe('markets UI', () => {
  // PriceChart loads history; keep the tests offline.
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ history: [] }) }));
  });
  afterEach(() => vi.unstubAllGlobals());

  const event = normalizeEvent({ id: 9, slug: 'hormuz', title: 'Hormuz crisis', volume: 1e6, markets: [rawMarket] });

  it('EventCard selects an outcome', () => {
    const onSelect = vi.fn();
    render(<EventCard event={event} selection={null} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: /Apostar No/ }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ outcomeIndex: 1 }));
  });

  it('BetSlip shows the payout and submits the stake', async () => {
    const onPlace = vi.fn().mockResolvedValue(true);
    render(
      <BetSlip
        selection={{ event, market: event.markets[0], outcomeIndex: 0 }}
        balance={10_000}
        busy={false}
        error={null}
        onPlace={onPlace}
        onClear={() => {}}
      />
    );
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '26' } });
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Apostar \(simulado\)/ }));
    expect(onPlace).toHaveBeenCalledWith(26);
  });

  it('BetSlip blocks stakes above the balance', () => {
    render(
      <BetSlip
        selection={{ event, market: event.markets[0], outcomeIndex: 0 }}
        balance={10}
        busy={false}
        error={null}
        onPlace={vi.fn()}
        onClear={() => {}}
      />
    );
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '50' } });
    expect(screen.getByRole('alert')).toHaveTextContent('Saldo insuficiente');
    expect(screen.getByRole('button', { name: /Apostar \(simulado\)/ })).toBeDisabled();
  });
});
