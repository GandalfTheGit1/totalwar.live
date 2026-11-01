'use client';

/**
 * components/markets/MarketsTerminal.tsx
 *
 * Paper-betting terminal: live Polymarket events on the left, bet slip on the right,
 * and a portfolio tab with positions marked to market. All money is virtual.
 */

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import { BetSlip } from './BetSlip';
import { EventCard, type Selection } from './EventCard';
import { AccountStats, Portfolio } from './Portfolio';
import { useMarkets, usePaperAccount } from './hooks';
import { usd } from './format';

const TAGS = [
  { slug: 'geopolitics', label: 'Geopolítica' },
  { slug: 'politics', label: 'Política' },
  { slug: 'economy', label: 'Economía' },
  { slug: 'tech', label: 'Tecnología' },
  { slug: '', label: 'Todo' },
] as const;

type View = 'markets' | 'portfolio';

export function MarketsTerminal() {
  const [tag, setTag] = useState<string>('geopolitics');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<View>('markets');
  const [selection, setSelection] = useState<Selection | null>(null);
  const slipRef = useRef<HTMLElement>(null);

  // Below lg the slip sits under the list, so bring it into view on selection.
  const select = (s: Selection) => {
    setSelection(s);
    if (window.matchMedia('(max-width: 1023px)').matches) {
      requestAnimationFrame(() => slipRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  };

  const { events, loading, error } = useMarkets(tag, query.trim());
  const paper = usePaperAccount();
  const openCount = paper.account?.positions.filter((p) => p.status === 'open').length ?? 0;

  const place = (stake: number) =>
    selection
      ? paper.placeBet({
          marketId: selection.market.id,
          outcomeIndex: selection.outcomeIndex,
          stake,
          eventSlug: selection.event.slug,
          eventTitle: selection.event.title,
        })
      : Promise.resolve(false);

  return (
    <div className="min-h-screen bg-[var(--void)] text-[var(--ink)]">
      <header className="sticky top-0 z-10 border-b border-[var(--hairline)] bg-[var(--surface-1)]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <Link href="/" aria-label="Volver al mapa" className="rounded p-1 text-[var(--ink-faint)] hover:text-[var(--ink)]">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="mr-auto">
            <h1 className="text-base font-semibold">Mercados de predicción</h1>
            <p className="text-[11px] text-[var(--ink-faint)]">Precios en vivo de Polymarket · apuestas simuladas</p>
          </div>
          <div className="font-mono text-sm" aria-live="polite">
            <span className="text-[var(--ink-faint)]">Saldo </span>
            {paper.account ? usd(paper.account.balance) : '—'}
          </div>
          <nav className="flex rounded-md border border-[var(--hairline)] bg-[var(--void)] p-0.5" aria-label="Vista">
            {(['markets', 'portfolio'] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={`rounded px-3 py-1 text-xs font-medium ${view === v ? 'bg-[var(--surface-3)] text-[var(--ink)]' : 'text-[var(--ink-faint)] hover:text-[var(--ink)]'}`}
              >
                {v === 'markets' ? 'Mercados' : `Mi cartera${openCount ? ` (${openCount})` : ''}`}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-4">
        {view === 'portfolio' ? (
          paper.account ? (
            <Portfolio account={paper.account} busy={paper.busy} onClose={(id) => void paper.closePosition(id)} onReset={() => void paper.reset()} />
          ) : (
            <p className="text-sm text-[var(--ink-faint)]">{paper.error ?? 'Cargando cartera…'}</p>
          )
        ) : (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap gap-1" role="group" aria-label="Categoría">
                  {TAGS.map((t) => (
                    <button
                      key={t.slug || 'all'}
                      type="button"
                      aria-pressed={!query && tag === t.slug}
                      onClick={() => {
                        setTag(t.slug);
                        setQuery('');
                      }}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        !query && tag === t.slug ? 'bg-[var(--accent)] text-[var(--on-accent)]' : 'bg-[var(--surface-2)] text-[var(--ink-muted)] hover:text-[var(--ink)]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <label className="relative ml-auto w-full sm:w-64">
                  <span className="sr-only">Buscar mercados</span>
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--ink-faint)]" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar: Irán, aranceles, Fed…"
                    className="w-full rounded border border-[var(--border-control)] bg-[var(--surface-1)] py-1.5 pl-8 pr-3 text-xs text-[var(--ink)] focus:outline-2 focus:outline-[var(--focus-ring)]"
                  />
                </label>
              </div>

              {error ? (
                <p role="alert" className="rounded border border-[var(--loss)]/40 bg-[var(--loss-soft)] p-3 text-xs text-[var(--loss)]">{error}</p>
              ) : loading && events.length === 0 ? (
                <p className="text-xs text-[var(--ink-faint)]">Cargando mercados…</p>
              ) : events.length === 0 ? (
                <p className="text-xs text-[var(--ink-faint)]">No hay mercados abiertos para esta búsqueda.</p>
              ) : (
                <div className={`grid gap-3 transition-opacity sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 ${loading ? 'opacity-60' : ''}`}>
                  {events.map((ev) => (
                    <EventCard key={ev.id} event={ev} selection={selection} onSelect={select} />
                  ))}
                </div>
              )}
            </div>

            <aside ref={slipRef} className="scroll-mt-20 space-y-3 lg:sticky lg:top-20 lg:self-start">
              <BetSlip
                selection={selection}
                balance={paper.account?.balance ?? null}
                busy={paper.busy}
                error={paper.error}
                onPlace={place}
                onClear={() => setSelection(null)}
              />
              {paper.account && <AccountStats account={paper.account} compact />}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
