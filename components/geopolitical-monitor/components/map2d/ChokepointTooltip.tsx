/**
 * components/dev/geopolitical-monitor/components/map2d/ChokepointTooltip.tsx
 *
 * Tactical HUD floating tooltip for maritime chokepoints and blockades.
 */

import React from 'react';
import type { StrategicChokepointDefinition } from '../../types';
import type { TooltipPos } from './types';

interface ChokepointTooltipProps {
  chokepoint: StrategicChokepointDefinition;
  isBlocked: boolean;
  pos: TooltipPos;
}

function ChokepointTooltipHeader({
  nameEs,
  isBlocked,
}: {
  nameEs: string;
  isBlocked: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-800">
      <span className="font-black text-slate-100 flex items-center gap-1.5">
        <span>⚓</span>
        <span>{nameEs}</span>
      </span>
      <span
        className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
          isBlocked
            ? 'bg-rose-500/20 text-rose-300 border-rose-500'
            : 'bg-teal-500/20 text-teal-300 border-teal-500'
        }`}
      >
        {isBlocked ? 'BLOQUEADO' : 'ABIERTO'}
      </span>
    </div>
  );
}

function ChokepointMetricsBody({
  globalTradeSharePct,
  baselineTransitDelayDays,
  alternativeRouteName,
}: {
  globalTradeSharePct: number;
  baselineTransitDelayDays: number;
  alternativeRouteName: string;
}) {
  return (
    <div className="space-y-1 text-[11px] text-slate-300">
      <div className="flex justify-between">
        <span className="text-slate-400">Tráfico Mundial:</span>
        <span className="font-bold text-slate-100">{globalTradeSharePct}%</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-400">Retraso Desvío:</span>
        <span className="font-bold text-amber-300">+{baselineTransitDelayDays} días</span>
      </div>
      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
        <span className="text-amber-400 font-bold">Ruta Alternativa: </span>
        {alternativeRouteName}
      </div>
    </div>
  );
}

export function ChokepointTooltip({ chokepoint, isBlocked, pos }: ChokepointTooltipProps) {
  return (
    <div
      data-testid="chokepoint-tooltip"
      className="absolute z-50 pointer-events-none bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs font-mono max-w-xs transition-opacity duration-150"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
      }}
    >
      <ChokepointTooltipHeader nameEs={chokepoint.nameEs} isBlocked={isBlocked} />
      <ChokepointMetricsBody
        globalTradeSharePct={chokepoint.globalTradeSharePct}
        baselineTransitDelayDays={chokepoint.baselineTransitDelayDays}
        alternativeRouteName={chokepoint.alternativeRouteName}
      />
      <div className="mt-2 pt-1 border-t border-slate-800 text-[10px] text-teal-400 font-semibold text-center">
        Clic para {isBlocked ? 'desbloquear' : 'bloquear'} estrecho
      </div>
    </div>
  );
}
