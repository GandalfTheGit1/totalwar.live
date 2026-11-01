'use client';

import React from 'react';
import { quote } from '@/lib/services/prediction-markets/paper-engine';
import type { PmEvent, PmMarket } from '@/lib/services/prediction-markets/types';
import { cents, compactUsd, shortDate } from './format';

export interface Selection {
  event: PmEvent;
  market: PmMarket;
  outcomeIndex: 0 | 1;
}

const MAX_ROWS = 4;

const bettable = (p: number | null) => p !== null && p >= 0.01 && p <= 0.99;

/** Binary markets still taking orders and not already decided, most likely outcome first. */
export function tradableMarkets(event: PmEvent): PmMarket[] {
  return event.markets
    .filter((m) => m.binary && m.acceptingOrders && !m.resolution)
    .filter((m) => bettable(quote(m, 0).buy) || bettable(quote(m, 1).buy))
    .sort((a, b) => (b.outcomes[0]?.price ?? 0) - (a.outcomes[0]?.price ?? 0));
}

function OutcomeButton({
  market,
  outcomeIndex,
  selected,
  onSelect,
}: {
  market: PmMarket;
  outcomeIndex: 0 | 1;
  selected: boolean;
  onSelect: () => void;
}) {
  const price = quote(market, outcomeIndex).buy;
  const disabled = !bettable(price);
  const yes = outcomeIndex === 0;
  const name = market.outcomes[outcomeIndex]?.name ?? (yes ? 'Sí' : 'No');
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`Apostar ${name} en "${market.question}" a ${cents(price)}`}
      className={`min-w-[4.5rem] rounded px-2 py-1 font-mono text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] ${
        selected
          ? yes
            ? 'bg-[var(--gain)] text-[var(--void)]'
            : 'bg-[var(--loss)] text-[var(--void)]'
          : yes
            ? 'bg-[var(--gain-soft)] text-[var(--gain)] hover:bg-[var(--gain)]/25'
            : 'bg-[var(--loss-soft)] text-[var(--loss)] hover:bg-[var(--loss)]/25'
      }`}
    >
      <span className="block truncate max-w-[6rem]">{name}</span>
      <span>{cents(price)}</span>
    </button>
  );
}

export function EventCard({
  event,
  selection,
  onSelect,
}: {
  event: PmEvent;
  selection: Selection | null;
  onSelect: (s: Selection) => void;
}) {
  const markets = tradableMarkets(event);
  const single = event.markets.length === 1;

  return (
    <article
      data-testid="market-event-card"
      className="flex flex-col rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface-1)]"
    >
      <header className="flex items-start gap-3 p-3">
        {event.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.image} alt="" className="h-10 w-10 shrink-0 rounded object-cover bg-[var(--surface-3)]" />
        ) : (
          <div className="h-10 w-10 shrink-0 rounded bg-[var(--surface-3)]" />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-snug text-[var(--ink)] line-clamp-2">{event.title}</h3>
          <p className="mt-1 font-mono text-[11px] text-[var(--ink-faint)]">
            Vol. {compactUsd(event.volume)} · 24h {compactUsd(event.volume24hr)} · Cierra {shortDate(event.endDate)}
          </p>
        </div>
      </header>

      {markets.length === 0 ? (
        <p className="px-3 pb-3 text-xs text-[var(--ink-faint)]">Sin mercados abiertos para apostar.</p>
      ) : (
        <ul className="border-t border-[var(--hairline)]">
          {markets.slice(0, MAX_ROWS).map((m) => {
            const isSelected = (i: 0 | 1) =>
              selection?.market.id === m.id && selection.outcomeIndex === i;
            return (
              <li key={m.id} className="flex items-center gap-2 border-b border-[var(--hairline)] px-3 py-2 last:border-b-0">
                <span title={m.question} className="min-w-0 flex-1 text-xs text-[var(--ink-muted)] line-clamp-2">
                  {single ? 'Probabilidad implícita' : m.label}
                </span>
                <span className="w-10 text-right font-mono text-xs font-medium text-[var(--ink)]">
                  {Math.round((m.outcomes[0]?.price ?? 0) * 100)}%
                </span>
                <OutcomeButton market={m} outcomeIndex={0} selected={isSelected(0)} onSelect={() => onSelect({ event, market: m, outcomeIndex: 0 })} />
                <OutcomeButton market={m} outcomeIndex={1} selected={isSelected(1)} onSelect={() => onSelect({ event, market: m, outcomeIndex: 1 })} />
              </li>
            );
          })}
        </ul>
      )}

      {markets.length > MAX_ROWS && (
        <p className="px-3 py-2 text-[11px] text-[var(--ink-faint)]">+{markets.length - MAX_ROWS} mercados más en este evento</p>
      )}
    </article>
  );
}
