'use client';

import React, { useEffect, useState } from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';
import type { BloombergStance, CountryBloombergPayload } from '@/lib/services/bloomberg-originals/store';

interface BloombergOriginalsSectionProps {
  countryCode: string;
  countryName: string;
}

const STANCE_BADGE: Record<BloombergStance, { label: string; cls: string }> = {
  favorable: { label: 'A favor', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' },
  riesgo: { label: 'Riesgo', cls: 'bg-rose-500/15 text-rose-300 border-rose-500/40' },
  mixto: { label: 'Mixto', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/40' },
  neutral: { label: 'Neutral', cls: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/40' },
};

const FILTERS: (BloombergStance | 'todos')[] = ['todos', 'favorable', 'riesgo', 'mixto'];

export function BloombergOriginalsSection({ countryCode, countryName }: BloombergOriginalsSectionProps) {
  const [data, setData] = useState<CountryBloombergPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<BloombergStance | 'todos'>('todos');

  useEffect(() => {
    if (!countryCode) return;
    let cancelled = false; // ignore late answers after switching country
    setLoading(true);
    setFilter('todos');
    fetch(`/api/bloomberg-originals/${countryCode}`)
      .then(res => (res.ok ? res.json() : null))
      .catch(() => null)
      .then((payload: CountryBloombergPayload | null) => {
        if (cancelled) return;
        setData(payload);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [countryCode]);

  if (loading) {
    return (
      <div className="p-4 bg-zinc-850/80 rounded-xl border border-zinc-700/60 font-mono text-xs text-zinc-400 animate-pulse">
        Cargando cobertura de Bloomberg Originals...
      </div>
    );
  }

  if (!data || data.totals.videos === 0) {
    return (
      <div className="p-4 bg-zinc-850/80 rounded-xl border border-zinc-700/40 text-xs font-mono text-zinc-500" data-testid="bloomberg-originals-section-empty">
        <span className="flex items-center gap-2 text-zinc-400 font-bold mb-1">
          <Newspaper className="w-4 h-4 text-zinc-500" /> Bloomberg Originals
        </span>
        Bloomberg Originals no ha cubierto {countryName || 'este país'} en los últimos 2 años.
      </div>
    );
  }

  const videos = filter === 'todos' ? data.videos : data.videos.filter(v => v.stance === filter);

  return (
    <div className="p-4 bg-zinc-850/80 rounded-xl border border-sky-500/20" data-testid="bloomberg-originals-section">
      <span className="text-sm font-bold text-zinc-100 flex items-center gap-2">
        <Newspaper className="w-4 h-4 text-sky-400" /> Bloomberg Originals
      </span>
      <span className="text-xs text-zinc-400 mt-0.5 block">
        {data.totals.videos} video{data.totals.videos > 1 ? 's' : ''} sobre {countryName || data.country} o sus empresas
      </span>

      <div className="mt-3 grid grid-cols-3 gap-1.5 text-[10px] font-mono">
        {(['favorable', 'riesgo', 'mixto'] as const).map(s => (
          <div key={s} className="bg-zinc-800/60 p-2 rounded border border-zinc-700/40 text-center">
            <span className="block text-zinc-500 text-[9px] uppercase">{STANCE_BADGE[s].label}</span>
            <span className={`text-sm font-bold ${STANCE_BADGE[s].cls.split(' ')[1]}`}>{data.totals[s]}</span>
          </div>
        ))}
      </div>

      {data.companies.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold font-mono mb-1.5">Empresas citadas</p>
          <div className="flex flex-wrap gap-1">
            {data.companies.slice(0, 10).map(c => (
              <span key={c.ticker ?? c.name} className="px-1.5 py-0.5 rounded text-[10px] font-mono border border-zinc-700 bg-zinc-800/60 text-zinc-300">
                {c.name}{c.ticker ? ` · ${c.ticker}` : ''}{c.mentions > 1 ? ` ×${c.mentions}` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.sectors.length > 0 && (
        <p className="mt-2 text-[10px] font-mono text-zinc-500">
          Sectores: {data.sectors.slice(0, 5).map(s => s.name).join(', ')}
        </p>
      )}

      {data.signals.length > 0 && (
        <div className="mt-3" data-testid="bloomberg-signals">
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold font-mono mb-1.5">Señales para invertir</p>
          <ul className="space-y-1.5">
            {data.signals.map(sg => (
              <li key={sg.category + sg.videoId} className="p-2 bg-zinc-800/50 rounded border border-zinc-700/50 text-[11px]">
                <span className="font-mono text-[9px] uppercase text-sky-300">{sg.category}</span>
                <p className="text-zinc-300">{sg.claim}</p>
                <a href={`https://www.youtube.com/watch?v=${sg.videoId}`} target="_blank" rel="noopener noreferrer" className="block italic text-zinc-500 hover:text-sky-300">
                  “{sg.quote}”
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 flex gap-1" role="group" aria-label="Filtrar por ángulo">
        {FILTERS.map(f => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={`px-2 py-0.5 text-[10px] font-mono rounded border cursor-pointer ${
              filter === f ? 'border-sky-400 bg-sky-500/15 text-sky-300' : 'border-zinc-700 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {f === 'todos' ? 'Todos' : STANCE_BADGE[f].label}
          </button>
        ))}
      </div>

      <ul className="mt-2 space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
        {videos.map(v => (
          <li key={v.id} className="p-2.5 bg-zinc-800/50 rounded-lg border border-zinc-700/50 text-xs">
            <div className="flex items-start justify-between gap-2">
              <a href={v.url} target="_blank" rel="noopener noreferrer" className="font-bold text-zinc-200 hover:text-sky-300 flex gap-1">
                {v.title} <ExternalLink className="w-3 h-3 shrink-0 mt-0.5" aria-hidden />
              </a>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono border whitespace-nowrap ${STANCE_BADGE[v.stance].cls}`}>
                {STANCE_BADGE[v.stance].label}
              </span>
            </div>
            {v.thesis && <p className="text-[11px] text-zinc-400 mt-1">{v.thesis}</p>}
            {v.published && <span className="block text-[10px] text-zinc-500 font-mono mt-1">≈ {v.published.slice(0, 7)}</span>}
          </li>
        ))}
        {videos.length === 0 && <li className="text-[11px] font-mono text-zinc-500">Sin videos con este ángulo.</li>}
      </ul>

      <p className="mt-3 text-[10px] text-zinc-500 italic">{data.note}</p>
    </div>
  );
}
