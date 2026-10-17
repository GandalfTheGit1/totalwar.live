'use client';

import React from 'react';
import {
  TrendingDown,
  Clock,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { MaritimeSimulationResult } from '@/lib/services/maritime-chokepoint-service';
import { getJitBadgeConfig } from './types';

interface QuantitativeKpiSectionProps {
  simulationResult: MaritimeSimulationResult;
}

export function QuantitativeKpiSection({ simulationResult }: QuantitativeKpiSectionProps) {
  const {
    transitDelayDays,
    freightRateSurgePct,
    simulatedFreightRatePerFeu,
    cogsImpactPct,
    grossMarginBefore,
    grossMarginAfter,
    grossMarginCompressionBps,
    jitStarvationRisk,
    tacticalRecommendation,
  } = simulationResult;

  const jitBadgeConfig = getJitBadgeConfig(jitStarvationRisk);

  return (
    <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase font-black text-slate-200 tracking-wider flex items-center gap-1.5">
          <TrendingDown className="w-4 h-4 text-rose-400" /> Resultados del Modelo Cuantitativo (Opción A)
        </span>
        {/* Badge JIT Starvation */}
        <div
          data-testid="jit-starvation-badge"
          className={`px-2.5 py-0.5 rounded border font-bold text-[10px] flex items-center gap-1.5 ${jitBadgeConfig.badgeClass}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${jitBadgeConfig.dotClass}`} />
          <span>{jitBadgeConfig.label}</span>
        </div>
      </div>

      {/* Grid de 4 KPIs Clave */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* KPI 1: Días de Retraso */}
        <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Días de Retraso</span>
          </div>
          <div className="text-xl font-black text-amber-300">
            +{transitDelayDays} <span className="text-xs font-normal text-slate-500">días</span>
          </div>
          <span className="text-[9px] text-slate-500 block mt-0.5">
            Buffer DIO: {simulationResult.sectorProfile.typicalDioDays} días
          </span>
        </div>

        {/* KPI 2: Subida de Flete Spot */}
        <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-1">
            <DollarSign className="w-3.5 h-3.5 text-sky-400" />
            <span>Flete Marítimo</span>
          </div>
          <div className="text-xl font-black text-sky-300">
            +{freightRateSurgePct}%
          </div>
          <span suppressHydrationWarning className="text-[9px] text-slate-500 block mt-0.5">
            ${simulatedFreightRatePerFeu.toLocaleString('en-US')} / FEU
          </span>
        </div>

        {/* KPI 3: Sobrecoste en COGS */}
        <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Impacto en COGS</span>
          </div>
          <div className="text-xl font-black text-rose-400">
            +{cogsImpactPct}%
          </div>
          <span className="text-[9px] text-slate-500 block mt-0.5">
            Δ Coste de Ventas
          </span>
        </div>

        {/* KPI 4: Compresión de Margen Bruto */}
        <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mb-1">
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            <span>Compresión Margen</span>
          </div>
          <div className="text-xl font-black text-rose-300">
            -{grossMarginCompressionBps} <span className="text-xs font-normal text-slate-500">bps</span>
          </div>
          <span className="text-[9px] text-slate-500 block mt-0.5">
            De {grossMarginBefore.toFixed(1)}% a {grossMarginAfter.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Recomendación Táctica */}
      <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] leading-relaxed">
        <span className="text-amber-400 font-bold">Directiva HoI4: </span>
        <span className="text-slate-300">{tacticalRecommendation}</span>
      </div>
    </div>
  );
}
