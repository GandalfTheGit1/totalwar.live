'use client';

import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import {
  MaritimeChokepointId,
  STRATEGIC_CHOKEPOINTS,
} from '@/lib/services/maritime-chokepoint-service';

interface ChokepointCardProps {
  cp: {
    id: MaritimeChokepointId;
    isBlocked: boolean;
  };
  onToggle: (id: MaritimeChokepointId) => void;
}

export function ChokepointCard({ cp, onToggle }: ChokepointCardProps) {
  const def = STRATEGIC_CHOKEPOINTS[cp.id];

  return (
    <div
      data-testid={`chokepoint-card-${cp.id}`}
      onClick={() => onToggle(cp.id)}
      className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
        cp.isBlocked
          ? 'bg-rose-950/30 border-rose-500/80 shadow-[0_0_16px_rgba(244,63,94,0.25)]'
          : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Header del Chokepoint */}
      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              cp.isBlocked ? 'bg-rose-500 animate-pulse' : 'bg-teal-400'
            }`}
          />
          <span className="font-bold text-xs text-slate-100 truncate">
            {def.nameEs}
          </span>
        </div>

        {/* Switch Visual Táctico */}
        <button
          type="button"
          role="switch"
          aria-checked={cp.isBlocked}
          aria-label={`Alternar bloqueo de ${def.nameEs}`}
          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors flex items-center gap-1 ${
            cp.isBlocked
              ? 'bg-rose-500/20 text-rose-300 border-rose-500'
              : 'bg-slate-800 text-teal-300 border-teal-500/40'
          }`}
        >
          {cp.isBlocked ? (
            <>
              <Lock className="w-2.5 h-2.5" />
              <span>CERRADO</span>
            </>
          ) : (
            <>
              <Unlock className="w-2.5 h-2.5" />
              <span>ABIERTO</span>
            </>
          )}
        </button>
      </div>

      {/* Telemetría del estrecho */}
      <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
        <div>
          <span className="text-slate-500 block">Flujo Global:</span>
          <span className="text-slate-200 font-bold">{def.globalTradeSharePct}%</span>
        </div>
        <div>
          <span className="text-slate-500 block">Desvío Base:</span>
          <span className="text-amber-300 font-bold">+{def.baselineTransitDelayDays} días</span>
        </div>
      </div>

      {/* Commodities principales */}
      <div className="mt-1.5 text-[9px] text-slate-400 truncate">
        <span className="text-slate-500">Carga: </span>
        {def.primaryCommodities.slice(0, 2).join(', ')}
      </div>
    </div>
  );
}
