/**
 * @file Hoi4TacticalNavbar.tsx
 * @description Tactical Command Bar inspired by Hearts of Iron IV (HoI4) aesthetic:
 * - Military steel/dark slate chassis with metallic rivets and bevel borders.
 * - Monospace military typography and HUD displays.
 * - Telemetry monitors: World Tension % (Tensión Mundial), DEFCON status, Chokepoint blockades telemetry.
 * - Prominent "Comercio Marítimo" toggle button with naval icon and active neon/amber state.
 * - Simulation launcher and 2D/3D camera reset controls.
 */

'use client';

import React, { useMemo } from 'react';
import { 
  Anchor, 
  RotateCcw, 
  ShieldAlert, 
  Layers, 
  SlidersHorizontal,
  Flame,
  Globe2,
  Compass
} from 'lucide-react';

export interface Hoi4TacticalNavbarProps {
  is2DMode: boolean;
  onToggle2DMode: (is2D: boolean) => void;
  onResetView: () => void;
  showMaritimeRoutes: boolean;
  onToggleMaritimeRoutes: () => void;
  blockedCount: number;
  onOpenSimulationDrawer: () => void;
  worldTension?: { tensionIndex: number; source?: string } | null;
  /** Oculta tensión y DEFCON cuando la Top information bar ya los muestra. */
  hideTelemetry?: boolean;
  className?: string;
}

export const Hoi4TacticalNavbar: React.FC<Hoi4TacticalNavbarProps> = ({
  is2DMode,
  onToggle2DMode,
  onResetView,
  showMaritimeRoutes,
  onToggleMaritimeRoutes,
  blockedCount,
  onOpenSimulationDrawer,
  worldTension,
  hideTelemetry = false,
  className = '',
}) => {
  const tension = worldTension?.tensionIndex ?? 42;

  // Cálculo dinámico de DEFCON según nivel de World Tension y estrechos bloqueados
  const defconLevel = useMemo(() => {
    if (tension >= 80 || blockedCount >= 4) return 1;
    if (tension >= 65 || blockedCount >= 3) return 2;
    if (tension >= 45 || blockedCount >= 2) return 3;
    if (tension >= 25 || blockedCount >= 1) return 4;
    return 5;
  }, [tension, blockedCount]);

  const defconConfig = useMemo(() => {
    switch (defconLevel) {
      case 1:
        return { label: 'DEFCON 1', textClass: 'text-rose-400', badgeClass: 'bg-rose-500/20 border-rose-500 animate-pulse text-rose-300' };
      case 2:
        return { label: 'DEFCON 2', textClass: 'text-orange-400', badgeClass: 'bg-orange-500/20 border-orange-500 text-orange-300' };
      case 3:
        return { label: 'DEFCON 3', textClass: 'text-amber-400', badgeClass: 'bg-amber-500/20 border-amber-500 text-amber-300' };
      case 4:
        return { label: 'DEFCON 4', textClass: 'text-lime-400', badgeClass: 'bg-lime-500/20 border-lime-500 text-lime-300' };
      default:
        return { label: 'DEFCON 5', textClass: 'text-emerald-400', badgeClass: 'bg-emerald-500/20 border-emerald-500 text-emerald-300' };
    }
  }, [defconLevel]);

  // Color de World Tension
  const tensionColor = useMemo(() => {
    if (tension >= 80) return { text: 'text-rose-400', bar: 'bg-rose-500', glow: 'shadow-[0_0_8px_rgba(244,63,94,0.5)]' };
    if (tension >= 60) return { text: 'text-orange-400', bar: 'bg-orange-500', glow: 'shadow-[0_0_8px_rgba(249,115,22,0.4)]' };
    if (tension >= 30) return { text: 'text-amber-400', bar: 'bg-amber-400', glow: 'shadow-[0_0_8px_rgba(251,191,36,0.3)]' };
    return { text: 'text-emerald-400', bar: 'bg-emerald-400', glow: 'shadow-[0_0_8px_rgba(52,211,153,0.3)]' };
  }, [tension]);

  return (
    <header
      data-testid="hoi4-tactical-navbar"
      className={`w-full z-40 bg-gradient-to-b from-slate-900 via-slate-925 to-zinc-950 border-b-2 border-slate-700/80 shadow-[0_4px_24px_rgba(0,0,0,0.85)] select-none ${className}`}
    >
      {/* Barra superior de acero militar con remaches tácticos */}
      <div className="relative px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2.5">
        {/* Remaches de esquina decorativos HoI4 */}
        <div className="absolute top-1 left-1.5 w-1.5 h-1.5 rounded-full bg-slate-500 border border-slate-300/40 shadow-inner pointer-events-none" />
        <div className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-slate-500 border border-slate-300/40 shadow-inner pointer-events-none" />
        <div className="absolute bottom-1 left-1.5 w-1.5 h-1.5 rounded-full bg-slate-500 border border-slate-300/40 shadow-inner pointer-events-none" />
        <div className="absolute bottom-1 right-1.5 w-1.5 h-1.5 rounded-full bg-slate-500 border border-slate-300/40 shadow-inner pointer-events-none" />

        {/* ─── 1. Emblema & Título del Cuartel General Táctico ─── */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-500/70 flex items-center justify-center shadow-inner">
            <Compass className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold tracking-widest uppercase px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                HOI4 THEATER
              </span>
              <span className="text-xs font-black font-mono tracking-wider text-slate-100 uppercase">
                Mando Geopolítico
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 tracking-tight hidden sm:inline">
              Simulador de Logística Táctica & Redes de Valor
            </span>
          </div>
        </div>

        {/* ─── 2. Displays de Telemetría Táctica (Tensión Mundial & DEFCON) ─── */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap font-mono">
          {/* Telemetría: World Tension */}
          {!hideTelemetry && (
          <div
            data-testid="hoi4-world-tension-badge"
            className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700/80 shadow-inner text-[11px]"
            title={`Tensión Mundial: ${Math.round(tension)}% (${worldTension?.source || 'GDELT/Base'})`}
          >
            <Flame className={`w-3.5 h-3.5 ${tensionColor.text} ${tension >= 60 ? 'animate-bounce' : ''}`} />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold leading-none">
                Tensión Mundial
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className={`h-full ${tensionColor.bar} ${tensionColor.glow} transition-all duration-500`}
                    style={{ width: `${Math.min(100, Math.max(0, tension))}%` }}
                  />
                </div>
                <span className={`text-xs font-black ${tensionColor.text} leading-none`}>
                  {Math.round(tension)}%
                </span>
              </div>
            </div>
          </div>

          )}

          {/* Telemetría: Indicador DEFCON */}
          {!hideTelemetry && (
          <div
            data-testid="hoi4-defcon-badge"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-bold text-[11px] ${defconConfig.badgeClass}`}
            title="Nivel de Alerta Estratégica Global DEFCON"
          >
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span className="tracking-wider">{defconConfig.label}</span>
          </div>
          )}

          {/* Telemetría: Chokepoints Activos */}
          <button
            type="button"
            data-testid="hoi4-chokepoint-status-button"
            onClick={onOpenSimulationDrawer}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all cursor-pointer text-[11px] font-bold ${
              blockedCount > 0
                ? 'bg-rose-500/20 border-rose-500/80 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.4)] animate-pulse'
                : 'bg-slate-900/90 border-slate-700/80 text-teal-300 hover:border-teal-500/50'
            }`}
            title="Clic para abrir el simulador táctico de bloqueo de estrechos"
          >
            <span className={`w-2 h-2 rounded-full ${blockedCount > 0 ? 'bg-rose-500' : 'bg-teal-400'}`} />
            <span>
              {blockedCount > 0
                ? `🚨 ${blockedCount}/6 BLOQUEADOS`
                : '0/6 BLOQUEADOS'}
            </span>
          </button>
        </div>

        {/* ─── 3. Acciones Prominentes: Botón "Comercio Marítimo" & Simulador ─── */}
        <div className="flex items-center gap-2 shrink-0">
          {/* BOTÓN PROMINENTE: COMERCIO MARÍTIMO */}
          <button
            type="button"
            data-testid="toggle-maritime-trade-button"
            aria-pressed={showMaritimeRoutes}
            onClick={onToggleMaritimeRoutes}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs font-black tracking-wider uppercase transition-all duration-200 cursor-pointer border ${
              showMaritimeRoutes
                ? 'bg-gradient-to-r from-amber-500/30 to-amber-600/30 text-amber-300 border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.5)] ring-1 ring-amber-400/50'
                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-600/80'
            }`}
            title="Alternar visualización de líneas de comercio marítimo y círculos de estrechos"
          >
            <Anchor className={`w-4 h-4 ${showMaritimeRoutes ? 'text-amber-300 animate-pulse' : 'text-slate-400'}`} />
            <span className="flex items-center gap-1.5">
              <span>Comercio Marítimo</span>
              <span
                className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                  showMaritimeRoutes
                    ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40'
                    : 'bg-slate-900 text-slate-400'
                }`}
              >
                {showMaritimeRoutes ? 'ACTIVO' : 'OFF'}
              </span>
            </span>
          </button>

          {/* Botón: Cajón de Simulación de Chokepoints */}
          <button
            type="button"
            data-testid="open-chokepoint-drawer-button"
            onClick={onOpenSimulationDrawer}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-600/80 font-mono text-xs font-bold transition-all cursor-pointer"
            title="Abrir panel de simulación de bloqueo de chokepoints y cálculo de COGS"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden md:inline">Simular Bloqueos</span>
          </button>

          {/* ─── 4. Controles de Cámara (2D/3D & Reset) ─── */}
          <div className="flex items-center gap-1 pl-1 border-l border-slate-700/80">
            {/* Toggle 2D / 3D */}
            <div className="flex items-center bg-slate-900/90 p-0.5 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => onToggle2DMode(false)}
                className={`px-2 py-1 text-[10px] font-mono rounded font-bold transition-all cursor-pointer ${
                  !is2DMode
                    ? 'bg-teal-500 text-zinc-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Vista Globo Esférico 3D (WebGL)"
              >
                <span className="flex items-center gap-1">
                  <Globe2 className="w-3 h-3" />
                  <span>3D</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => onToggle2DMode(true)}
                className={`px-2 py-1 text-[10px] font-mono rounded font-bold transition-all cursor-pointer ${
                  is2DMode
                    ? 'bg-teal-500 text-zinc-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Vista Táctica Plana 2D (D3 Mercator)"
              >
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  <span>2D</span>
                </span>
              </button>
            </div>

            {/* Reset Cámara */}
            <button
              type="button"
              onClick={onResetView}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Restablecer posición de cámara y zoom"
            >
              <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

