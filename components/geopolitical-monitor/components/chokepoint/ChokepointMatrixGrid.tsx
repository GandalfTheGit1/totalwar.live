'use client';

import React from 'react';
import { Navigation } from 'lucide-react';
import { MaritimeChokepointId } from '@/lib/services/maritime-chokepoint-service';
import { ChokepointCard } from './ChokepointCard';

interface ChokepointMatrixGridProps {
  chokepointDetails: Array<{
    id: MaritimeChokepointId;
    isBlocked: boolean;
  }>;
  onToggleChokepoint: (id: MaritimeChokepointId) => void;
  onSetBlockedChokepoints: (list: MaritimeChokepointId[]) => void;
}

export function ChokepointMatrixGrid({
  chokepointDetails,
  onToggleChokepoint,
  onSetBlockedChokepoints,
}: ChokepointMatrixGridProps) {
  const allChokepointIds: MaritimeChokepointId[] = [
    'hormuz',
    'malacca',
    'suez',
    'bab_el_mandeb',
    'panama',
    'bosporus',
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase font-black tracking-wider text-slate-300 flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-sky-400" /> Estado de los 6 Chokepoints Estratégicos
        </span>
        <div className="flex items-center gap-2 text-[10px]">
          <button
            type="button"
            onClick={() => onSetBlockedChokepoints([])}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition-colors cursor-pointer"
          >
            Abrir Todos
          </button>
          <button
            type="button"
            onClick={() => onSetBlockedChokepoints(allChokepointIds)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 transition-colors cursor-pointer"
          >
            Bloquear Todos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {chokepointDetails.map((cp) => (
          <ChokepointCard
            key={cp.id}
            cp={cp}
            onToggle={onToggleChokepoint}
          />
        ))}
      </div>
    </div>
  );
}
