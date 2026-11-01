'use client';

import React from 'react';
import type { AccountSummary, PositionView } from '@/lib/services/prediction-markets/types';
import { cents, percent, shortDate, signedUsd, usd } from './format';

const STATUS_LABEL: Record<PositionView['status'], string> = {
  open: 'Abierta',
  closed: 'Vendida',
  won: 'Ganada',
  lost: 'Perdida',
};

const tone = (n: number) => (n > 0 ? 'text-[var(--gain)]' : n < 0 ? 'text-[var(--loss)]' : 'text-[var(--ink-muted)]');

function Stat({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className="rounded bg-[var(--surface-2)] px-3 py-2">
      <dt className="text-[11px] uppercase tracking-wider text-[var(--ink-faint)]">{label}</dt>
      <dd className={`font-mono text-sm font-medium text-[var(--ink)] ${className}`}>{value}</dd>
    </div>
  );
}

export function AccountStats({ account, compact = false }: { account: AccountSummary; compact?: boolean }) {
  return (
    <dl data-testid="account-stats" className={`grid grid-cols-2 gap-1.5 ${compact ? '' : 'sm:grid-cols-4'}`}>
      <Stat label="Saldo" value={usd(account.balance)} />
      <Stat label="En juego" value={usd(account.openValue)} />
      <Stat label="Patrimonio" value={usd(account.equity)} />
      <Stat label="Resultado" value={`${signedUsd(account.pnl)} (${percent(account.pnlPct)})`} className={tone(account.pnl)} />
    </dl>
  );
}

export function Portfolio({
  account,
  busy,
  onClose,
  onReset,
}: {
  account: AccountSummary;
  busy: boolean;
  onClose: (positionId: string) => void;
  onReset: () => void;
}) {
  const open = account.positions.filter((p) => p.status === 'open');
  const finished = account.positions.filter((p) => p.status !== 'open');

  const reset = () => {
    if (window.confirm('¿Reiniciar la cuenta simulada? Se borran todas las apuestas y vuelves al saldo inicial.')) onReset();
  };

  return (
    <section aria-label="Mi cartera" data-testid="portfolio" className="space-y-4">
      <AccountStats account={account} />
      <p className="text-xs text-[var(--ink-faint)]">
        {account.wins} ganadas · {account.losses} perdidas · saldo inicial {usd(account.startingBalance, 0)}. Las apuestas se liquidan solas cuando Polymarket resuelve el mercado.
      </p>

      <PositionTable title="Posiciones abiertas" positions={open} busy={busy} onClose={onClose} empty="Aún no tienes apuestas abiertas." />
      {finished.length > 0 && <PositionTable title="Historial" positions={finished} busy={busy} empty="" />}

      <button type="button" onClick={reset} disabled={busy} className="text-xs text-[var(--ink-faint)] underline hover:text-[var(--loss)] disabled:opacity-40">
        Reiniciar cuenta simulada
      </button>
    </section>
  );
}

function PositionTable({
  title,
  positions,
  busy,
  onClose,
  empty,
}: {
  title: string;
  positions: PositionView[];
  busy: boolean;
  onClose?: (id: string) => void;
  empty: string;
}) {
  return (
    <div>
      <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">{title}</h3>
      {positions.length === 0 ? (
        <p className="text-xs text-[var(--ink-faint)]">{empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--hairline)]">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="bg-[var(--surface-2)] text-[11px] uppercase tracking-wider text-[var(--ink-faint)]">
              <tr>
                <th className="px-3 py-2 font-medium">Mercado</th>
                <th className="px-3 py-2 font-medium">Apuesta</th>
                <th className="px-3 py-2 text-right font-medium">Entrada → ahora</th>
                <th className="px-3 py-2 text-right font-medium">Valor</th>
                <th className="px-3 py-2 text-right font-medium">Resultado</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => (
                <tr key={p.id} data-testid="position-row" className="border-t border-[var(--hairline)] align-top">
                  <td className="px-3 py-2">
                    <a href={`https://polymarket.com/event/${p.eventSlug}`} target="_blank" rel="noopener noreferrer" className="text-[var(--ink)] hover:text-[var(--accent)] line-clamp-2">
                      {p.question}
                    </a>
                    <span className="text-[11px] text-[var(--ink-faint)]">{shortDate(p.openedAt)} · {STATUS_LABEL[p.status]}</span>
                  </td>
                  <td className="px-3 py-2 font-mono">
                    <span className={p.outcomeIndex === 0 ? 'text-[var(--gain)]' : 'text-[var(--loss)]'}>{p.outcomeName}</span>
                    <span className="block text-[var(--ink-faint)]">{usd(p.cost)}</span>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-[var(--ink-muted)]">
                    {cents(p.entryPrice)} → {cents(p.status === 'open' ? p.markPrice : p.exitPrice ?? null)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-[var(--ink)]">{usd(p.value)}</td>
                  <td className={`px-3 py-2 text-right font-mono ${tone(p.pnl)}`}>
                    {signedUsd(p.pnl)}
                    <span className="block">{percent(p.pnlPct)}</span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    {p.status === 'open' && onClose && (
                      <button
                        type="button"
                        disabled={busy || p.markPrice === null}
                        onClick={() => onClose(p.id)}
                        className="rounded bg-[var(--surface-3)] px-2 py-1 text-[var(--ink)] hover:bg-[var(--hairline)] disabled:opacity-40"
                      >
                        Vender
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
