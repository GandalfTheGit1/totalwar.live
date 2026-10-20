/**
 * @file ResourceProducersPanel.tsx
 * @description Panel del recurso buscado: producción mundial y ranking de países productores
 * con cantidad y cuota. Sustituye a la leyenda genérica mientras el recurso está en el mapa.
 */

'use client';

import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { formatQuantity, formatShare } from '@/lib/services/country-resources/format';
import { CATEGORY_LABELS, ProducerEntry, ShareTier, shareTier } from '@/lib/services/country-resources/query';
import { useResourceProducers } from '../../hooks/useCountryResources';
import { CATEGORY_ICONS, TIER_STYLES, isStaleYear } from './resource-styles';

const INITIAL_VISIBLE = 10;

export interface ResourceProducersPanelProps {
  commodityId: string;
  onSelectCountry?: (isoCode: string) => void;
  onClose?: () => void;
}

export const ResourceProducersPanel: React.FC<ResourceProducersPanelProps> = ({ commodityId, onSelectCountry, onClose }) => {
  const { data, loading, error } = useResourceProducers(commodityId);
  const [expanded, setExpanded] = useState(false);

  const commodity = data?.commodity;
  const producers = data?.producers ?? [];
  const shown = expanded ? producers : producers.slice(0, INITIAL_VISIBLE);
  const maxShare = producers[0]?.s ?? 0;
  const tierCounts = producers.reduce<Record<ShareTier, number>>(
    (acc, p) => { acc[shareTier(p.s)]++; return acc; },
    { critical: 0, high: 0, medium: 0, low: 0 }
  );
  const Icon = commodity ? CATEGORY_ICONS[commodity.category] : null;

  return (
    <div
      data-testid="resource-producers-panel"
      className="bg-zinc-900/85 backdrop-blur-xl border border-purple-500/30 p-3.5 rounded-xl shadow-2xl pointer-events-auto flex flex-col gap-2.5 max-h-[calc(100vh-22rem)] min-h-[12rem] overflow-y-auto custom-scrollbar"
    >
      {loading && !data && <p className="text-[11px] text-zinc-400 animate-pulse">Cargando productores…</p>}
      {error && <p className="text-[11px] text-rose-400">No se pudo cargar el recurso: {error}</p>}

      {commodity && (
        <>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold border bg-purple-500/15 text-purple-300 border-purple-500/30 shrink-0">
                  RECURSO
                </span>
                {Icon && <Icon className="w-3.5 h-3.5 text-purple-300 shrink-0" aria-hidden />}
                <span className="text-xs font-bold text-zinc-100 truncate" data-testid="resource-producers-title">{commodity.nameEs}</span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-1">
                {CATEGORY_LABELS[commodity.category]}
                {commodity.note ? ` · ${commodity.note}` : ''}
              </p>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 shrink-0">{producers.length} países</span>
          </div>

          {commodity.worldTotal !== null && commodity.latestYear !== null && (
            <p className="text-[11px] text-zinc-300 font-mono">
              Producción mundial {commodity.latestYear}:{' '}
              <span className="font-bold text-white">{formatQuantity(commodity.worldTotal, commodity.unit)}</span>
            </p>
          )}

          <div className="grid grid-cols-4 gap-1 text-center font-mono text-[9px]">
            {(Object.keys(TIER_STYLES) as ShareTier[]).map((tier) => (
              <div key={tier} className={`rounded border px-1 py-1 ${TIER_STYLES[tier].badge}`} title={tierTitle(tier)}>
                <div className="uppercase tracking-wider">{TIER_STYLES[tier].label}</div>
                <div className="text-white font-bold text-xs">{tierCounts[tier]}</div>
              </div>
            ))}
          </div>

          <ol className="space-y-1" data-testid="resource-producers-list">
            {shown.map((p) => (
              <ProducerRow
                key={p.iso2}
                producer={p}
                unit={commodity.unit}
                stale={isStaleYear(p.y, commodity)}
                barWidth={maxShare && p.s !== null ? Math.max(2, (p.s / maxShare) * 100) : 0}
                onSelect={onSelectCountry}
              />
            ))}
          </ol>

          {producers.length > INITIAL_VISIBLE && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="w-full py-1 text-[10px] font-mono font-bold text-zinc-300 hover:text-white bg-zinc-800/70 hover:bg-zinc-700/80 border border-zinc-700 rounded-lg cursor-pointer"
            >
              {expanded ? 'Mostrar menos' : `Ver los ${producers.length} productores`}
            </button>
          )}
        </>
      )}

      <button
        type="button"
        data-testid="resource-clear-button"
        onClick={() => onClose?.()}
        className="flex items-center justify-center gap-1.5 w-full py-1.5 px-2.5 text-[11px] font-mono font-semibold text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700/90 border border-zinc-700 hover:border-zinc-600 rounded-lg transition-colors cursor-pointer"
      >
        <RotateCcw className="w-3 h-3 text-purple-300" />
        <span>Quitar del mapa</span>
      </button>
    </div>
  );
};

function tierTitle(tier: ShareTier): string {
  return {
    critical: '≥10 % de la producción mundial',
    high: '3–10 % de la producción mundial',
    medium: '0,5–3 % de la producción mundial',
    low: '<0,5 % de la producción mundial',
  }[tier];
}

const ProducerRow: React.FC<{
  producer: ProducerEntry;
  unit: Parameters<typeof formatQuantity>[1];
  stale: boolean;
  barWidth: number;
  onSelect?: (isoCode: string) => void;
}> = ({ producer: p, unit, stale, barWidth, onSelect }) => {
  const tier = TIER_STYLES[shareTier(p.s)];
  return (
    <li>
      <button
        type="button"
        data-testid="resource-producer-row"
        onClick={() => onSelect?.(p.iso3)}
        title={`Abrir ${p.nameEs}`}
        className="w-full text-left rounded-md px-2 py-1 hover:bg-zinc-800/70 transition-colors cursor-pointer"
      >
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="flex items-center gap-1.5 min-w-0">
            <span className="font-mono text-zinc-500 w-6 text-right shrink-0">{p.r}</span>
            <span aria-hidden>{p.flagEmoji}</span>
            <span className="text-zinc-100 truncate">{p.nameEs}</span>
          </span>
          <span className="font-mono shrink-0 text-zinc-300">
            {formatQuantity(p.v, unit)}{' '}
            <span className={stale ? 'text-amber-400' : 'text-zinc-500'}>({p.y})</span>
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-2 pl-8">
          <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className={`h-full ${tier.dot}`} style={{ width: `${barWidth}%` }} />
          </div>
          <span className="font-mono text-[10px] text-zinc-400 w-14 text-right shrink-0">{formatShare(p.s)}</span>
        </div>
      </button>
    </li>
  );
};
