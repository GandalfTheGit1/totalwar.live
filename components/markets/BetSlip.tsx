'use client';

import React, { useEffect, useState } from 'react';
import { quote } from '@/lib/services/prediction-markets/paper-engine';
import { MIN_STAKE } from '@/lib/services/prediction-markets/types';
import type { Selection } from './EventCard';
import { PriceChart } from './PriceChart';
import { cents, usd } from './format';

const QUICK_STAKES = [10, 50, 100, 500];

export function BetSlip({
  selection,
  balance,
  busy,
  error,
  onPlace,
  onClear,
}: {
  selection: Selection | null;
  balance: number | null;
  busy: boolean;
  error: string | null;
  onPlace: (stake: number) => Promise<boolean>;
  onClear: () => void;
}) {
  const [stake, setStake] = useState('');
  const [placed, setPlaced] = useState<string | null>(null);

  // A new selection starts a fresh slip.
  useEffect(() => {
    setStake('');
    setPlaced(null);
  }, [selection?.market.id, selection?.outcomeIndex]);

  if (!selection) {
    return (
      <section aria-label="Boleto de apuesta" className="rounded-[var(--radius-md)] border border-dashed border-[var(--hairline)] p-4 text-center text-xs text-[var(--ink-faint)]">
        Elige Sí o No en cualquier mercado para preparar una apuesta simulada.
      </section>
    );
  }

  const { event, market, outcomeIndex } = selection;
  const outcome = market.outcomes[outcomeIndex];
  const price = quote(market, outcomeIndex).buy;
  const amount = Number(stake);
  const shares = price && amount > 0 ? amount / price : 0;
  const profit = shares - amount;

  let problem: string | null = null;
  if (price === null || price < 0.01 || price > 0.99) problem = 'Este resultado está prácticamente decidido.';
  else if (stake && (!Number.isFinite(amount) || amount < MIN_STAKE)) problem = `La apuesta mínima es ${usd(MIN_STAKE, 0)}.`;
  else if (balance !== null && amount > balance) problem = 'Saldo insuficiente.';

  const canPlace = !busy && !problem && amount >= MIN_STAKE;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPlace) return;
    const ok = await onPlace(Math.round(amount * 100) / 100);
    if (ok) {
      setPlaced(`Apuesta de ${usd(amount)} a ${outcome.name} registrada.`);
      setStake('');
    }
  };

  const yes = outcomeIndex === 0;

  return (
    <section aria-label="Boleto de apuesta" data-testid="bet-slip" className="rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface-1)]">
      <header className="flex items-start justify-between gap-2 border-b border-[var(--hairline)] p-3">
        <div className="min-w-0">
          <p className="text-[11px] text-[var(--ink-faint)] line-clamp-1">{event.title}</p>
          <h3 className="text-sm font-semibold leading-snug text-[var(--ink)]">{market.question}</h3>
        </div>
        <button type="button" onClick={onClear} aria-label="Quitar selección" className="text-xs text-[var(--ink-faint)] hover:text-[var(--ink)]">
          ✕
        </button>
      </header>

      <form onSubmit={submit} className="space-y-3 p-3">
        <div className="flex items-center justify-between text-xs">
          <span className={`rounded px-2 py-0.5 font-semibold ${yes ? 'bg-[var(--gain-soft)] text-[var(--gain)]' : 'bg-[var(--loss-soft)] text-[var(--loss)]'}`}>
            {outcome.name}
          </span>
          <span className="font-mono text-[var(--ink-muted)]">Precio {cents(price)}</span>
        </div>

        <label className="block">
          <span className="text-[11px] uppercase tracking-wider text-[var(--ink-faint)]">Importe (dólares virtuales)</span>
          <input
            type="number"
            inputMode="decimal"
            min={MIN_STAKE}
            step="1"
            value={stake}
            onChange={(e) => {
              setStake(e.target.value);
              setPlaced(null);
            }}
            placeholder="0"
            className="mt-1 w-full rounded border border-[var(--border-control)] bg-[var(--void)] px-3 py-2 font-mono text-base text-[var(--ink)] focus:outline-2 focus:outline-[var(--focus-ring)]"
          />
        </label>

        <div className="flex gap-1.5">
          {QUICK_STAKES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setStake(String(q))}
              className="flex-1 rounded bg-[var(--surface-3)] py-1 font-mono text-xs text-[var(--ink-muted)] hover:text-[var(--ink)]"
            >
              {q}
            </button>
          ))}
        </div>

        <dl className="space-y-1 font-mono text-xs">
          <div className="flex justify-between"><dt className="text-[var(--ink-faint)]">Acciones</dt><dd className="text-[var(--ink)]">{shares.toFixed(2)}</dd></div>
          <div className="flex justify-between"><dt className="text-[var(--ink-faint)]">Cobro si acierta</dt><dd className="text-[var(--ink)]">{usd(shares)}</dd></div>
          <div className="flex justify-between"><dt className="text-[var(--ink-faint)]">Ganancia posible</dt><dd className="text-[var(--gain)]">{usd(Math.max(profit, 0))}</dd></div>
        </dl>

        {(problem || error) && <p role="alert" className="text-xs text-[var(--loss)]">{problem ?? error}</p>}
        {placed && <p role="status" className="text-xs text-[var(--gain)]">{placed}</p>}

        <button
          type="submit"
          disabled={!canPlace}
          className="w-full rounded bg-[var(--accent)] py-2 text-sm font-semibold text-[var(--on-accent)] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? 'Enviando…' : 'Apostar (simulado)'}
        </button>
        <p className="text-[11px] leading-snug text-[var(--ink-faint)]">
          Se ejecuta al precio en vivo de Polymarket en el momento de enviar. Dinero ficticio: no hay pagos reales.
        </p>

        <PriceChart tokenId={outcome.tokenId} outcomeName={outcome.name} />
      </form>
    </section>
  );
}
