/**
 * @file CountryResourcesSection.tsx
 * @description Sección del sidebar con todos los recursos que produce el país seleccionado:
 * cantidad, año, cuota de la producción mundial y puesto, filtrables por categoría y texto.
 * Datos: World Mining Data, FAOSTAT y Ember vía /api/resources.
 */

'use client';

import React, { useMemo, useState } from 'react';
import { Layers, MapPin, Search, X } from 'lucide-react';
import { formatQuantity, formatShare, UNIT_LABELS } from '@/lib/services/country-resources/format';
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  CountryResourceEntry,
  normalizeSearchText,
  shareTier,
} from '@/lib/services/country-resources/query';
import { ResourceCategory } from '@/lib/services/country-resources/types';
import { useCountryResources } from '../../hooks/useCountryResources';
import { CATEGORY_ICONS, CATEGORY_SHORT, SOURCE_SHORT, TIER_STYLES, isStaleYear } from './resource-styles';

const INITIAL_VISIBLE = 12;

type SortMode = 'share' | 'name';

export interface CountryResourcesSectionProps {
  /** ISO alfa-2 o alfa-3 del país. */
  countryCode: string;
  countryName: string;
  /** Recurso resaltado en el mapa, si lo hay. */
  activeResourceId?: string | null;
  onShowOnMap?: (commodityId: string) => void;
}

function matchesFilter(entry: CountryResourceEntry, query: string): boolean {
  if (!query) return true;
  const c = entry.commodity;
  return [c.nameEs, c.nameEn, ...(c.aliases ?? [])].some((text) => normalizeSearchText(text).includes(query));
}

export const CountryResourcesSection: React.FC<CountryResourcesSectionProps> = ({
  countryCode,
  countryName,
  activeResourceId,
  onShowOnMap,
}) => {
  const { data, loading, error } = useCountryResources(countryCode);
  const [category, setCategory] = useState<ResourceCategory | 'all'>('all');
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState<SortMode>('share');
  const [expanded, setExpanded] = useState(false);

  const resources = useMemo(() => data?.resources ?? [], [data]);

  const counts = useMemo(() => {
    const byCategory = new Map<ResourceCategory, number>();
    for (const r of resources) byCategory.set(r.commodity.category, (byCategory.get(r.commodity.category) ?? 0) + 1);
    return byCategory;
  }, [resources]);

  const visible = useMemo(() => {
    const query = normalizeSearchText(filter);
    const list = resources.filter(
      (r) => (category === 'all' || r.commodity.category === category) && matchesFilter(r, query)
    );
    if (sort === 'name') list.sort((a, b) => a.commodity.nameEs.localeCompare(b.commodity.nameEs, 'es'));
    return list;
  }, [resources, category, filter, sort]);

  const criticalCount = useMemo(() => resources.filter((r) => shareTier(r.s) === 'critical').length, [resources]);
  const shown = expanded || filter ? visible : visible.slice(0, INITIAL_VISIBLE);

  return (
    <div
      data-testid="country-resources-section"
      className="bg-zinc-950/80 rounded-xl p-4 border border-zinc-800/90 shadow-xl space-y-3 font-mono text-zinc-100"
    >
      {/* ─── Cabecera ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white tracking-wide uppercase">Recursos y producción</h3>
            <p className="text-[10px] text-zinc-400">
              Qué produce {data?.country.nameEs || countryName || 'el país'} y cuánto pesa en el mundo
            </p>
          </div>
        </div>
        {resources.length > 0 && (
          <div className="text-right shrink-0">
            <div className="text-sm font-black text-purple-300" data-testid="resources-total">{resources.length}</div>
            <div className="text-[9px] text-zinc-500 uppercase">recursos</div>
          </div>
        )}
      </div>

      {loading && <p className="text-[11px] text-zinc-400 animate-pulse">Cargando producción del país…</p>}
      {error && <p className="text-[11px] text-rose-400">No se pudieron cargar los recursos: {error}</p>}
      {!loading && !error && data && resources.length === 0 && (
        <p className="text-[11px] text-zinc-400" data-testid="resources-empty">
          Las fuentes no registran producción de recursos para este país.
        </p>
      )}

      {resources.length > 0 && (
        <>
          {criticalCount > 0 && (
            <p className="text-[10px] text-zinc-400">
              <span className="text-rose-300 font-bold">{criticalCount}</span> recursos con ≥10 % de la producción mundial.
            </p>
          )}

          {/* ─── Filtros por categoría ─────────────────────────────── */}
          <div className="flex flex-wrap gap-1" role="group" aria-label="Filtrar por categoría">
            <CategoryChip label="Todos" count={resources.length} active={category === 'all'} onClick={() => setCategory('all')} />
            {CATEGORY_ORDER.filter((c) => counts.has(c)).map((c) => (
              <CategoryChip
                key={c}
                label={CATEGORY_SHORT[c]}
                title={CATEGORY_LABELS[c]}
                count={counts.get(c) ?? 0}
                active={category === c}
                onClick={() => setCategory(c)}
              />
            ))}
          </div>

          {/* ─── Filtro de texto y orden ───────────────────────────── */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-zinc-900/80 border border-zinc-800 rounded-lg px-2 py-1">
              <Search className="w-3 h-3 text-zinc-500 mr-1.5 shrink-0" />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filtrar recursos del país…"
                aria-label="Filtrar recursos del país"
                className="bg-transparent text-[11px] text-zinc-200 focus:outline-none w-full placeholder-zinc-500"
              />
              {filter && (
                <button type="button" onClick={() => setFilter('')} aria-label="Limpiar filtro" className="text-zinc-500 hover:text-zinc-300 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              aria-label="Ordenar recursos"
              className="bg-zinc-900/80 border border-zinc-800 rounded-lg px-1.5 py-1 text-[10px] text-zinc-300 cursor-pointer"
            >
              <option value="share">Peso mundial</option>
              <option value="name">A–Z</option>
            </select>
          </div>

          {/* ─── Lista ─────────────────────────────────────────────── */}
          {visible.length === 0 ? (
            <p className="text-[11px] text-zinc-500">Ningún recurso coincide con el filtro.</p>
          ) : (
            <ul className="space-y-1" data-testid="resources-list">
              {shown.map((entry) => (
                <ResourceRow
                  key={entry.c}
                  entry={entry}
                  active={entry.c === activeResourceId}
                  onShowOnMap={onShowOnMap}
                />
              ))}
            </ul>
          )}

          {!filter && visible.length > INITIAL_VISIBLE && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="w-full py-1.5 text-[10px] font-bold text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              {expanded ? 'Mostrar menos' : `Ver los ${visible.length - INITIAL_VISIBLE} restantes`}
            </button>
          )}

          {data && data.ceased.length > 0 && (
            <div className="border-t border-zinc-800/80 pt-2 space-y-1" data-testid="resources-ceased">
              <p className="text-[10px] font-bold text-amber-300 uppercase">Producción detenida</p>
              <ul className="space-y-0.5">
                {data.ceased.map((entry) => (
                  <li key={entry.c} className="text-[10px] text-zinc-400 flex justify-between gap-2">
                    <span className="text-zinc-300 truncate">{entry.commodity.nameEs}</span>
                    <span className="shrink-0">
                      {formatQuantity(entry.v, entry.commodity.unit)} en {entry.y} · 0 en {entry.z}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data && (
            <p className="text-[9px] text-zinc-500 leading-relaxed border-t border-zinc-800/80 pt-2">
              Fuentes: {data.meta.sources.map((s) => `${s.name} (${s.years})`).join(' · ')}. El puesto y la cuota son sobre el año de cada dato.
            </p>
          )}
        </>
      )}
    </div>
  );
};

const CategoryChip: React.FC<{ label: string; title?: string; count: number; active: boolean; onClick: () => void }> = ({
  label,
  title,
  count,
  active,
  onClick,
}) => (
  <button
    type="button"
    title={title}
    aria-pressed={active}
    onClick={onClick}
    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
      active
        ? 'bg-purple-500/20 text-purple-200 border-purple-500/60'
        : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
    }`}
  >
    {label} <span className="text-zinc-500 font-normal">{count}</span>
  </button>
);

const ResourceRow: React.FC<{
  entry: CountryResourceEntry;
  active: boolean;
  onShowOnMap?: (commodityId: string) => void;
}> = ({ entry, active, onShowOnMap }) => {
  const { commodity } = entry;
  const tier = TIER_STYLES[shareTier(entry.s)];
  const Icon = CATEGORY_ICONS[commodity.category];
  const stale = isStaleYear(entry.y, commodity);

  return (
    <li
      data-testid="resource-row"
      className={`rounded-lg border px-2.5 py-1.5 transition-colors ${
        active ? 'border-purple-500/60 bg-purple-500/10' : 'border-zinc-800/80 bg-zinc-900/50 hover:border-zinc-700'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Icon className="w-3 h-3 text-zinc-400 shrink-0" aria-hidden />
          <span className="text-[11px] font-bold text-zinc-100 truncate" title={commodity.note ? `${commodity.nameEs} — ${commodity.note}` : commodity.nameEs}>
            {commodity.nameEs}
          </span>
        </div>
        <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold shrink-0 ${tier.badge}`} title="Peso en la producción mundial">
          {formatShare(entry.s)} mundial
        </span>
      </div>

      <div className="mt-0.5 flex items-center justify-between gap-2 text-[10px]">
        <span className="text-zinc-300" title={`${entry.v.toLocaleString('es-ES')} ${UNIT_LABELS[commodity.unit]}`}>
          <span className="font-bold text-white">{formatQuantity(entry.v, commodity.unit)}</span>
          <span className={stale ? 'text-amber-400' : 'text-zinc-500'}>
            {' '}· {stale ? `dato de ${entry.y}` : entry.y}
          </span>
          {entry.f === 'estimated' && <span className="text-zinc-500"> · estimado</span>}
          {entry.m !== undefined && <span className="text-sky-300"> · {formatShare(entry.m)} de su electricidad</span>}
          {entry.src && <span className="text-zinc-500"> · fuente: {SOURCE_SHORT[entry.src]}</span>}
        </span>
        <span className="flex items-center gap-1.5 shrink-0">
          <span className="text-zinc-400">#{entry.r} de {commodity.producerCount}</span>
          {onShowOnMap && (
            <button
              type="button"
              onClick={() => onShowOnMap(commodity.id)}
              title={`Ver productores de ${commodity.nameEs} en el mapa`}
              aria-label={`Ver productores de ${commodity.nameEs} en el mapa`}
              className={`p-0.5 rounded cursor-pointer ${active ? 'text-purple-300' : 'text-zinc-500 hover:text-purple-300'}`}
            >
              <MapPin className="w-3 h-3" />
            </button>
          )}
        </span>
      </div>
    </li>
  );
};
