/**
 * @file IndicatorSearchBar.tsx
 * @description Buscador de indicadores económicos (inflación, paro, deuda…) de Trading Economics.
 * Al elegir uno, el monitor colorea el mapa por el valor de cada país.
 */

'use client';

import React, { useMemo, useState } from 'react';
import { LineChart, X } from 'lucide-react';
import { searchIndicators } from '@/lib/trading-economics/search';
import { useIndicatorCatalog } from '../../hooks/useIndicators';

export interface IndicatorSearchBarProps {
  activeIndicator?: string | null;
  onSelectIndicator: (slug: string) => void;
  onClearIndicator?: () => void;
}

export const IndicatorSearchBar: React.FC<IndicatorSearchBarProps> = ({
  activeIndicator,
  onSelectIndicator,
  onClearIndicator,
}) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [touched, setTouched] = useState(false);
  const { data, loading, error } = useIndicatorCatalog(touched);

  const typing = query.trim().length > 0;
  // Sin texto: sugerencias con los indicadores que ya se pueden pintar, los de más países primero.
  const results = useMemo(() => {
    if (!data) return [];
    if (typing) return searchIndicators(data.indicators, query, 8);
    return data.indicators
      .filter((i) => i.countryCount)
      .sort((a, b) => (b.countryCount ?? 0) - (a.countryCount ?? 0))
      .map((indicator) => ({ indicator, matched: indicator.name, score: 0 }));
  }, [data, query, typing]);
  const active = useMemo(
    () => (activeIndicator && data ? data.indicators.find((i) => i.slug === activeIndicator) ?? null : null),
    [activeIndicator, data]
  );

  const choose = (slug: string) => {
    onSelectIndicator(slug);
    setQuery('');
    setOpen(false);
  };

  const selectable = results.filter((r) => r.indicator.countryCount);
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!selectable.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight((h) => (h + 1) % selectable.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => (h - 1 + selectable.length) % selectable.length); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(selectable[Math.min(highlight, selectable.length - 1)].indicator.slug); }
    else if (e.key === 'Escape') { setOpen(false); }
  };

  const showDropdown = open;
  const highlightedSlug = selectable[Math.min(highlight, selectable.length - 1)]?.indicator.slug;

  return (
    <div className="relative" data-testid="indicator-search">
      <div className="flex items-center bg-zinc-950/70 border border-sky-500/30 focus-within:border-sky-400/70 rounded-lg px-2.5 py-1.5">
        <LineChart className="w-3.5 h-3.5 text-sky-300 mr-2 shrink-0" aria-hidden />
        <input
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="indicator-search-results"
          aria-label="Buscar indicador económico"
          placeholder={active ? `Mostrando: ${active.name}` : 'Buscar indicador (inflación, paro, deuda…)'}
          value={query}
          onFocus={() => { setTouched(true); setOpen(true); }}
          onChange={(e) => { setTouched(true); setQuery(e.target.value); setOpen(true); setHighlight(0); }}
          onKeyDown={onKeyDown}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="bg-transparent text-xs text-zinc-200 focus:outline-none w-full placeholder-zinc-500"
        />
        {(query || activeIndicator) && (
          <button
            type="button"
            aria-label="Limpiar búsqueda de indicador"
            onClick={() => { setQuery(''); onClearIndicator?.(); }}
            className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          id="indicator-search-results"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 bg-zinc-900/95 border border-zinc-700 rounded-lg shadow-2xl p-1 z-30 max-h-64 overflow-y-auto custom-scrollbar"
        >
          {loading && <div className="px-2.5 py-1.5 text-[11px] text-zinc-400">Cargando catálogo…</div>}
          {error && <div className="px-2.5 py-1.5 text-[11px] text-rose-400">{error}</div>}
          {data && !typing && (
            <div className="px-2.5 pt-1 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Disponibles en el mapa · escribe para buscar entre {data.indicators.length}
            </div>
          )}
          {data && typing && results.length === 0 && (
            <div className="px-2.5 py-1.5 text-[11px] text-zinc-400">Ningún indicador coincide con «{query}».</div>
          )}
          {results.map(({ indicator, matched }) => {
            const hasData = !!indicator.countryCount;
            const viaAlias = matched !== indicator.name;
            return (
              <button
                key={indicator.slug}
                type="button"
                role="option"
                aria-selected={indicator.slug === highlightedSlug}
                aria-disabled={!hasData}
                disabled={!hasData}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(indicator.slug)}
                onMouseEnter={() => { const i = selectable.findIndex((r) => r.indicator.slug === indicator.slug); if (i >= 0) setHighlight(i); }}
                className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between gap-2 text-xs transition-colors ${
                  !hasData ? 'opacity-40 cursor-not-allowed' : indicator.slug === highlightedSlug ? 'bg-zinc-800/90 cursor-pointer' : 'hover:bg-zinc-800/60 cursor-pointer'
                }`}
              >
                <span className="flex items-center gap-1.5 min-w-0">
                  <span className="text-zinc-100 font-medium truncate">{indicator.name}</span>
                  {viaAlias && <span className="text-[10px] text-zinc-500 truncate">({matched})</span>}
                </span>
                <span className="font-mono text-[10px] text-zinc-400 shrink-0">
                  {hasData ? '' : `${indicator.category} · `}{hasData ? `${indicator.countryCount} países` : 'sin datos'}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
