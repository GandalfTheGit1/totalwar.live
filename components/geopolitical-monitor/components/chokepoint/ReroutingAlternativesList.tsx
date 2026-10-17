'use client';

import React from 'react';
import { Navigation } from 'lucide-react';
import { MaritimeSimulationResult } from '@/lib/services/maritime-chokepoint-service';

interface ReroutingAlternativesListProps {
  reroutingAlternatives: MaritimeSimulationResult['reroutingAlternatives'];
}

export function ReroutingAlternativesList({
  reroutingAlternatives,
}: ReroutingAlternativesListProps) {
  if (reroutingAlternatives.length === 0) return null;

  return (
    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
      <span className="text-xs uppercase font-bold text-slate-300 flex items-center gap-1.5">
        <Navigation className="w-3.5 h-3.5 text-amber-400" /> Rutas de Desvío & Bypass Activadas ({reroutingAlternatives.length})
      </span>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {reroutingAlternatives.map((alt) => (
          <div
            key={alt.chokepointId}
            className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[10px] space-y-1"
          >
            <div className="flex items-center justify-between text-slate-200 font-bold">
              <span className="text-amber-300">{alt.alternativeName}</span>
              <span className="text-slate-400">+{alt.extraTransitDays}d tránsito</span>
            </div>
            <p className="text-slate-400 leading-tight">{alt.description}</p>
            <div className="text-slate-500 pt-1 flex items-center justify-between">
              <span>Cuello: {alt.capacityBottleneck}</span>
              <span className="text-amber-400/90 font-mono">
                +${alt.estimatedExtraFuelCostPerFeu}/FEU fuel
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
