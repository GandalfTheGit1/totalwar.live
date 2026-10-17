/**
 * components/geographic-operations/facilities/FacilitiesKpiStrip.tsx
 *
 * KPI summary strip rendering total count, sq footage, owned percentage, and risk score.
 */

'use client';

import React from 'react';
import {
  Building2,
  Maximize2,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { FacilitiesKpiStripProps } from './types';

export function FacilitiesKpiStrip({ stats }: FacilitiesKpiStripProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          <Building2 className="w-3.5 h-3.5 text-sky-400" />
          <span>Instalaciones</span>
        </div>
        <div className="text-lg font-bold text-white mt-1 font-mono">
          {stats.totalFacilities} <span className="text-xs text-zinc-400 font-normal">sedes/plantas</span>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Superficie Total</span>
        </div>
        <div className="text-lg font-bold text-white mt-1 font-mono">
          {(stats.totalSqFt / 1_000_000).toFixed(1)}M <span className="text-xs text-zinc-400 font-normal">sq ft</span>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
          <span>Tenencia</span>
        </div>
        <div className="text-lg font-bold text-white mt-1 font-mono">
          {stats.ownedPercentage}% <span className="text-xs text-zinc-400 font-normal">propiedad</span>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
          <span>Riesgo Medio</span>
        </div>
        <div className="text-lg font-bold text-white mt-1 font-mono">
          {stats.averageRiskScore} <span className="text-xs text-zinc-400 font-normal">/ 10</span>
        </div>
      </div>
    </div>
  );
}
