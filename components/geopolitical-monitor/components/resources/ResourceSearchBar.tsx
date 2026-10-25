/**
 * @file ResourceSearchBar.tsx
 * @description Buscador de recursos (litio, aceite de oliva, cobalto…) sin distinguir acentos.
 * Al elegir uno, el monitor colorea en el mapa a los países productores.
 */

'use client';

import React, { useMemo, useState } from 'react';
import { Pickaxe, X } from 'lucide-react';
import { searchCommodities } from '@/lib/services/country-resources/query';
import { useResourceCatalog } from '../../hooks/useCountryResources';
import { CATEGORY_ICONS, CATEGORY_SHORT } from './resource-styles';

export interface ResourceSearchBarProps {
  activeResourceId?: string | null;
  onSelectResource: (commodityId: string) => void;
  onClearResource?: () => void;
}

export const ResourceSearchBar: React.FC<ResourceSearchBarProps> = ({
  activeResourceId,
  onSelectResource,
  onClearResource,
}) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  // El catálogo (~280 recursos) se pide la primera vez que se usa el buscador.
  const [touched, setTouched] = useState(false);
  const { data, loading, error } = useResourceCatalog(touched);

  const results = useMemo(
    () => (data ? searchCommodities(data.commodities, query, 8) : []),
    [data, query]
  );
  const active = useMemo(
    () => (activeResourceId && data ? data.commodities.find((c) => c.id === activeResourceId) ?? null : null),
    [activeResourceId, data]
  );

  const choose = (commodityId: string) => {
    onSelectResource(commodityId);
    setQuery('');
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight((h) => (h + 1) % results.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => (h - 1 + results.length) % results.length); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(results[Math.min(highlight, results.length - 1)].commodity.id); }
    else if (e.key === 'Escape') { setOpen(false); }
  };

  const showDropdown = open && query.trim().length > 0;

  return (
    <div className="relative" data-testid="resource-search">
      <div className="flex items-center bg-zinc-950/70 border border-purple-500/30 focus-within:border-purple-400/70 rounded-lg px-2.5 py-1.5">
        <Pickaxe className="w-3.5 h-3.5 text-purple-300 mr-2 shrink-0" aria-hidden />
        <input
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="resource-search-results"
          aria-label="Buscar recurso"
          placeholder={active ? `Mostrando: ${active.nameEs}` : 'Buscar recurso (litio, aceite de oliva…)'}
          value={query}
          onFocus={() => { setTouched(true); setOpen(true); }}
          onChange={(e) => { setTouched(true); setQuery(e.target.value); setOpen(true); setHighlight(0); }}
          onKeyDown={onKeyDown}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="bg-transparent text-xs text-zinc-200 focus:outline-none w-full placeholder-zinc-500"
        />
        {(query || activeResourceId) && (
          <button
            type="button"
            aria-label="Limpiar búsqueda de recurso"
            onClick={() => { setQuery(''); onClearResource?.(); }}
            className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          id="resource-search-results"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 bg-zinc-900/95 border border-zinc-700 rounded-lg shadow-2xl p-1 z-30 max-h-64 overflow-y-auto custom-scrollbar"
        >
          {loading && <div className="px-2.5 py-1.5 text-[11px] text-zinc-400">Cargando catálogo…</div>}
          {error && <div className="px-2.5 py-1.5 text-[11px] text-rose-400">{error}</div>}
          {data && results.length === 0 && (
            <div className="px-2.5 py-1.5 text-[11px] text-zinc-400">Ningún recurso coincide con «{query}».</div>
          )}
          {results.map(({ commodity, matched }, i) => {
            const Icon = CATEGORY_ICONS[commodity.category];
            const viaAlias = matched !== commodity.nameEs;
            return (
              <button
                key={commodity.id}
                type="button"
                role="option"
                aria-selected={i === highlight}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(commodity.id)}
                onMouseEnter={() => setHighlight(i)}
                className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                  i === highlight ? 'bg-zinc-800/90' : 'hover:bg-zinc-800/60'
                }`}
              >
                <span className="flex items-center gap-1.5 min-w-0">
                  <Icon className="w-3 h-3 text-purple-300 shrink-0" aria-hidden />
                  <span className="text-zinc-100 font-medium truncate">{commodity.nameEs}</span>
                  {viaAlias && <span className="text-[10px] text-zinc-500 truncate">({matched})</span>}
                </span>
                <span className="font-mono text-[10px] text-zinc-400 shrink-0">
                  {CATEGORY_SHORT[commodity.category]} · {commodity.producerCount} países
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
