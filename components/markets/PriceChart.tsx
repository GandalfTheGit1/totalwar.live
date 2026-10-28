'use client';

import React, { useEffect, useState } from 'react';

interface PricePoint {
  t: number;
  p: number;
}

const INTERVALS = [
  { id: '1d', label: '1D' },
  { id: '1w', label: '1S' },
  { id: '1m', label: '1M' },
  { id: 'max', label: 'Todo' },
] as const;

type Interval = (typeof INTERVALS)[number]['id'];

const W = 300;
const H = 90;

export function PriceChart({ tokenId, outcomeName }: { tokenId: string | null; outcomeName: string }) {
  const [interval, setInterval] = useState<Interval>('1w');
  const [history, setHistory] = useState<PricePoint[] | null>(null);

  useEffect(() => {
    if (!tokenId) {
      setHistory([]);
      return;
    }
    const controller = new AbortController();
    setHistory(null);
    fetch(`/api/markets/history?token=${tokenId}&interval=${interval}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : { history: [] }))
      .then((data) => setHistory(data.history as PricePoint[]))
      .catch(() => {
        if (!controller.signal.aborted) setHistory([]);
      });
    return () => controller.abort();
  }, [tokenId, interval]);

  const points = history ?? [];
  const hasData = points.length > 1;
  let path = '';
  let last = 0;
  let first = 0;
  if (hasData) {
    const ts = points.map((p) => p.t);
    const ps = points.map((p) => p.p);
    const minT = Math.min(...ts);
    const maxT = Math.max(...ts);
    const minP = Math.max(0, Math.min(...ps) - 0.02);
    const maxP = Math.min(1, Math.max(...ps) + 0.02);
    const x = (t: number) => ((t - minT) / Math.max(maxT - minT, 1)) * W;
    const y = (p: number) => H - ((p - minP) / Math.max(maxP - minP, 0.001)) * H;
    path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.t).toFixed(1)},${y(p.p).toFixed(1)}`).join(' ');
    first = ps[0];
    last = ps[ps.length - 1];
  }
  const up = last >= first;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Precio · {outcomeName}</span>
        <div className="flex gap-1">
          {INTERVALS.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => setInterval(i.id)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                interval === i.id ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {i.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[90px] rounded-lg bg-zinc-950/60 border border-zinc-800/60 overflow-hidden flex items-center justify-center">
        {history === null ? (
          <span className="text-[10px] text-zinc-600">Cargando…</span>
        ) : hasData ? (
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none" role="img" aria-label={`Historial de precio de ${outcomeName}`}>
            <path d={path} fill="none" stroke={up ? '#2dd4bf' : '#fb7185'} strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
          </svg>
        ) : (
          <span className="text-[10px] text-zinc-600">Sin historial</span>
        )}
      </div>
    </div>
  );
}
