'use client';

import React, { useState } from 'react';
import { Anchor, Factory, Ship, Sliders, TrendingUp, TrendingDown, AlertTriangle, ExternalLink } from 'lucide-react';

export interface TacticalLogisticsSectionProps {
  countryMechanics?: any;
  iso?: string;
  onOpenSimulationDrawer?: () => void;
  blockedCount?: number;
  simulationResult?: any;
}

export function TacticalLogisticsSection({
  countryMechanics,
  iso = '',
  onOpenSimulationDrawer,
  blockedCount = 0,
  simulationResult,
}: TacticalLogisticsSectionProps) {
  const [showPortDetails, setShowPortDetails] = useState<boolean>(true);

  // === 1. Port Logistics Module Calculations ===
  const portSourceKey = countryMechanics?.dataSources?.portCongestion;
  let portSourceBadge = 'World Bank LPI';
  if (portSourceKey === 'imf_portwatch') {
    portSourceBadge = 'IMF PortWatch';
  } else if (portSourceKey === 'drewry') {
    portSourceBadge = 'Drewry WCI';
  } else if (portSourceKey === 'wb_lpi') {
    portSourceBadge = 'World Bank LPI';
  }

  // Calculate congestion percentage (0 - 100)
  let congestionPct = 25;
  let metricDetail = 'Fricción normal';

  if (countryMechanics?.portCongestion !== null && countryMechanics?.portCongestion !== undefined) {
    if (portSourceKey === 'drewry' || countryMechanics.portCongestion > 100) {
      // Drewry WCI ($1,200 - $5,000 baseline)
      congestionPct = Math.min(100, Math.max(5, Math.round(((countryMechanics.portCongestion - 1200) / 3800) * 100)));
      metricDetail = `$${Math.round(countryMechanics.portCongestion).toLocaleString('en-US')} / FEU`;
    } else {
      // PortWatch waiting hours (scaled to 48h operational benchmark)
      congestionPct = Math.min(100, Math.max(5, Math.round((countryMechanics.portCongestion / 48) * 100)));
      metricDetail = `${countryMechanics.portCongestion.toFixed(1)}h demora`;
    }
  } else if (countryMechanics?.infrastructureQuality !== null && countryMechanics?.infrastructureQuality !== undefined) {
    // World Bank LPI infrastructure score (1 to 5)
    congestionPct = Math.min(100, Math.max(5, Math.round(((5.0 - countryMechanics.infrastructureQuality) / 4.0) * 100)));
    metricDetail = `LPI Infra ${countryMechanics.infrastructureQuality.toFixed(2)}/5.0`;
  } else if (countryMechanics?.nodeAttritionRisk === 'CRITICAL') {
    congestionPct = 85;
    metricDetail = 'Riesgo crítico de nodo';
  } else if (countryMechanics?.nodeAttritionRisk === 'HIGH') {
    congestionPct = 65;
    metricDetail = 'Fricción elevada';
  }

  // Bottleneck semaphore
  let bottleneckStatus: 'FLUIDO' | 'FRICCIÓN MODERADA' | 'CUELLO DE BOTELLA CRÍTICO' = 'FLUIDO';
  let bottleneckBadgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let bottleneckDotClass = 'bg-emerald-400';

  if (congestionPct > 70 || countryMechanics?.nodeAttritionRisk === 'CRITICAL') {
    bottleneckStatus = 'CUELLO DE BOTELLA CRÍTICO';
    bottleneckBadgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    bottleneckDotClass = 'bg-rose-400 animate-pulse';
  } else if (congestionPct >= 40 || countryMechanics?.nodeAttritionRisk === 'HIGH' || countryMechanics?.nodeAttritionRisk === 'MEDIUM') {
    bottleneckStatus = 'FRICCIÓN MODERADA';
    bottleneckBadgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    bottleneckDotClass = 'bg-amber-400';
  } else {
    bottleneckStatus = 'FLUIDO';
    bottleneckBadgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    bottleneckDotClass = 'bg-emerald-400';
  }

  // === 2. Industrial Production Module Calculations ===
  const isImfSdmx = countryMechanics?.dataSources?.industrialProduction === 'imf_pi' || countryMechanics?.dataSources?.industrialProduction === 'imf_sdmx';
  const industrialSourceBadge = isImfSdmx ? 'IMF SDMX PI' : 'World Bank Annual';

  const rawYoy = countryMechanics?.industrialChangePct ?? countryMechanics?.industrialProduction ?? 0;
  const yoyFormatted = `${rawYoy >= 0 ? '+' : ''}${rawYoy.toFixed(1)}%`;

  let industrialStatus: 'EXPANSIÓN' | 'CONTRACCIÓN' | 'TRANSICIÓN TÉCNICA' = 'TRANSICIÓN TÉCNICA';
  let industrialStatusClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  let industrialDotClass = 'bg-amber-400';

  if (countryMechanics?.isInTransition) {
    industrialStatus = 'TRANSICIÓN TÉCNICA';
    industrialStatusClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    industrialDotClass = 'bg-amber-400';
  } else if (rawYoy > 0.5) {
    industrialStatus = 'EXPANSIÓN';
    industrialStatusClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    industrialDotClass = 'bg-emerald-400';
  } else if (rawYoy < -2.0) {
    industrialStatus = 'CONTRACCIÓN';
    industrialStatusClass = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    industrialDotClass = 'bg-rose-400';
  } else {
    industrialStatus = 'TRANSICIÓN TÉCNICA';
    industrialStatusClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    industrialDotClass = 'bg-amber-400';
  }

  return (
    <div className="bg-zinc-850/70 p-4 rounded-xl border border-teal-500/20 shadow-lg space-y-3.5">
      {/* Header with Title and Interactive Toggle */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-teal-400" />
          <h4 className="text-xs text-zinc-200 uppercase tracking-wider font-bold font-mono">
            Logística Portuaria e Industria {iso ? `[${iso}]` : ''}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">
            {showPortDetails ? 'Detalle Activo' : 'Detalle Oculto'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={showPortDetails}
            aria-label="Alternar detalle de Logística Portuaria"
            onClick={() => setShowPortDetails(!showPortDetails)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-teal-400 ${
              showPortDetails ? 'bg-teal-500' : 'bg-zinc-700'
            }`}
            title="Alternar detalle de Logística Portuaria"
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                showPortDetails ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Module 1: Port Logistics */}
      {showPortDetails ? (
        <div className="bg-zinc-900/80 p-3 rounded-lg border border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Ship className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-xs text-zinc-200 font-bold font-mono">Logística Portuaria</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">
                {portSourceBadge}
              </span>
              <span
                data-testid="bottleneck-status-badge"
                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${bottleneckBadgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${bottleneckDotClass}`} />
                {bottleneckStatus}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-zinc-400 font-mono">
            Monitoreo satelital PortWatch y fletes marítimos Drewry WCI.
          </p>

          {/* Congestion Level Gradient Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-zinc-400">Congestión / Demora:</span>
              <span className="text-zinc-200 font-bold">
                {congestionPct}% <span className="text-zinc-500 font-normal">({metricDetail})</span>
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-700/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-500"
                style={{ width: `${Math.max(5, Math.min(100, congestionPct))}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-zinc-500">
              <span className="text-emerald-500">0% ÓPTIMO</span>
              <span className="text-amber-500">50% MODERADO</span>
              <span className="text-rose-500">100% CRÍTICO</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <Anchor className="w-3.5 h-3.5 text-zinc-500" />
            <span className="font-mono text-[11px]">Logística Portuaria (Resumen)</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              data-testid="bottleneck-status-badge"
              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${bottleneckBadgeClass}`}
            >
              {bottleneckStatus}
            </span>
            <span className="text-[9px] font-mono text-zinc-500">
              ({congestionPct}%)
            </span>
          </div>
        </div>
      )}

      {/* Module 2: Industrial Production */}
      <div className="bg-zinc-900/80 p-3 rounded-lg border border-zinc-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Factory className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-xs text-zinc-200 font-bold font-mono">Producción Industrial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">
              {industrialSourceBadge}
            </span>
            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${industrialStatusClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${industrialDotClass}`} />
              {industrialStatus}
            </span>
          </div>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-black text-2xl text-zinc-100">{yoyFormatted}</span>
            <span className="text-[11px] text-zinc-500 font-mono flex items-center gap-0.5">
              {rawYoy >= 0 ? (
                <>
                  <TrendingUp className="w-3 h-3 text-emerald-400 inline" /> YoY
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3 text-rose-400 inline" /> YoY
                </>
              )}
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono text-right">
            Variación Interanual
          </span>
        </div>

        <p className="text-[10px] text-zinc-400 font-mono">
          {industrialStatus === 'TRANSICIÓN TÉCNICA'
            ? 'Sector secundario en consolidación o transición técnica de capacidad fabril.'
            : industrialStatus === 'EXPANSIÓN'
            ? 'Ritmo fabril sostenido por encima del umbral de amortiguamiento.'
            : 'Contracción en volumen de manufactura y bienes de equipo.'}
        </p>
      </div>

      {/* Module 3: Maritime Chokepoints & COGS Simulation (T03.5) */}
      <div className="bg-zinc-900/80 p-3 rounded-lg border border-zinc-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Anchor className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-zinc-200 font-bold font-mono">Simulación de Chokepoints</span>
          </div>
          <span
            data-testid="sidebar-chokepoint-status-badge"
            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${
              blockedCount > 0
                ? 'bg-rose-500/20 text-rose-300 border-rose-500 animate-pulse'
                : 'bg-teal-500/10 text-teal-300 border-teal-500/30'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${blockedCount > 0 ? 'bg-rose-500' : 'bg-teal-400'}`} />
            {blockedCount > 0 ? `🚨 ${blockedCount}/6 BLOQUEADOS` : '0/6 BLOQUEADOS'}
          </span>
        </div>

        {blockedCount > 0 && simulationResult ? (
          <div className="p-2 rounded bg-zinc-950/60 border border-rose-500/30 space-y-1.5 text-[10px] font-mono">
            <div className="flex justify-between items-center text-zinc-300">
              <span className="text-zinc-400">Impacto en COGS:</span>
              <span className="font-bold text-rose-400">+{simulationResult.cogsImpactPct}%</span>
            </div>
            <div className="flex justify-between items-center text-zinc-300">
              <span className="text-zinc-400">Retraso de Tránsito:</span>
              <span className="font-bold text-amber-300">+{simulationResult.transitDelayDays} días</span>
            </div>
            <div className="flex justify-between items-center text-zinc-300">
              <span className="text-zinc-400">Compresión Margen:</span>
              <span className="font-bold text-rose-300">-{simulationResult.grossMarginCompressionBps} bps</span>
            </div>
            <div className="flex justify-between items-center text-zinc-300">
              <span className="text-zinc-400">Riesgo JIT Starvation:</span>
              <span className={`font-bold ${simulationResult.jitStarvationRisk === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'}`}>
                {simulationResult.jitStarvationRisk}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-[10px] text-zinc-400 font-mono">
            Las 6 rutas marítimas y estrechos operan sin restricciones de flete ni retrasos forzados de circunnavegación.
          </p>
        )}

        {onOpenSimulationDrawer && (
          <button
            type="button"
            data-testid="sidebar-open-chokepoint-drawer"
            onClick={onOpenSimulationDrawer}
            className="w-full mt-1 py-1.5 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white border border-slate-700 font-mono text-[10px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sliders className="w-3 h-3 text-amber-400" />
            <span>Configurar Bloqueos de Estrechos (HoI4)</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </button>
        )}
      </div>
    </div>
  );
}
