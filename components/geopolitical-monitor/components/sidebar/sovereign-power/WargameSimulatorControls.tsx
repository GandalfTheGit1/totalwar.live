'use client';

import React from 'react';
import { WargameShocks, DefconStatus, WargameSimulationResult } from '@/lib/types/sovereign-power';
import { ShieldAlert, RotateCcw, AlertTriangle, Zap, DollarSign, Cpu, Anchor, Scale } from 'lucide-react';

interface WargameSimulatorControlsProps {
  shocks: WargameShocks;
  onShockChange: (key: keyof WargameShocks, val: number) => void;
  onReset: () => void;
  defconStatus: DefconStatus;
  originalLeverage: number;
  warpedLeverage: number;
  leverageDelta: number;
  tacticalLogs?: string[];
  compact?: boolean;
  warpedDalioSpread?: WargameSimulationResult['warpedDalioSpread'];
}

export const WargameSimulatorControls: React.FC<WargameSimulatorControlsProps> = ({
  shocks,
  onShockChange,
  onReset,
  defconStatus,
  originalLeverage,
  warpedLeverage,
  leverageDelta,
  tacticalLogs = [],
  compact = false,
  warpedDalioSpread
}) => {
  const isShocked = Object.values(shocks).some(v => v !== 0);

  return (
    <div className="bg-zinc-950/80 rounded-xl border border-zinc-800/90 p-4 space-y-4">
      {/* ── Top Header / DEFCON & Leverage Telemetry ── */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase text-zinc-400 font-bold tracking-wider">
                Simulador de Shocks
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-black uppercase ${defconStatus.badgeBg}`}>
                DEFCON {defconStatus.level} // {defconStatus.codeName}
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
              {defconStatus.description}
            </p>
          </div>
        </div>

        {/* Reset Button */}
        {isShocked && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 rounded transition-all cursor-pointer"
            title="Restablecer simulación a parámetros basales"
          >
            <RotateCcw className="w-3 h-3" />
            RESET
          </button>
        )}
      </div>

      {/* ── Geopolitical Leverage Gauge ── */}
      <div className="bg-zinc-900/70 p-3 rounded-lg border border-zinc-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
            Índice de Palanca Geopolítica
          </span>
          <span className="text-xl font-mono font-black text-cyan-400">
            {warpedLeverage} <span className="text-xs text-zinc-500 font-normal">/ 100</span>
          </span>
        </div>

        <div className="text-right font-mono">
          <span className="text-[10px] text-zinc-500 uppercase block">Desviación Táctica</span>
          <span className={`text-sm font-bold ${
            leverageDelta > 0 
              ? 'text-emerald-400' 
              : leverageDelta < 0 
                ? 'text-rose-400' 
                : 'text-zinc-400'
          }`}>
            {leverageDelta > 0 ? `+${leverageDelta}` : leverageDelta} pts
          </span>
        </div>
      </div>

      {/* ── Real-Time Dalio Macro Spread Indicator ── */}
      {warpedDalioSpread && isShocked && (
        <div className="bg-zinc-900/90 p-2.5 rounded-lg border border-zinc-800 text-[10px] font-mono flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-zinc-300 font-bold">Spread Dalio (Warped):</span>
          </div>
          <div className="text-right">
            <span className={`font-black ${warpedDalioSpread.spreadPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {warpedDalioSpread.spreadPercent >= 0 ? `+${warpedDalioSpread.spreadPercent}%` : `${warpedDalioSpread.spreadPercent}%`}
            </span>
            <span className={`text-[9px] ml-1.5 font-bold px-1.5 py-0.2 rounded border ${
              warpedDalioSpread.isBeautifulDeleveraging 
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
            }`}>
              {warpedDalioSpread.isBeautifulDeleveraging ? 'HERMOSO' : 'ESPIRAL DEUDA'}
            </span>
          </div>
        </div>
      )}

      {/* ── 4 Interactive Shock Sliders ── */}
      <div className={`space-y-3 ${compact ? 'text-xs' : 'text-sm'}`}>
        {/* Slider 1: Defense Shock */}
        <div>
          <div className="flex justify-between items-center text-[11px] font-mono mb-1">
            <span className="flex items-center gap-1.5 text-zinc-300 font-semibold">
              <Anchor className="w-3.5 h-3.5 text-sky-400" />
              Gasto de Defensa & Rearme
            </span>
            <span className={`font-bold ${shocks.defenseShock > 0 ? 'text-emerald-400' : shocks.defenseShock < 0 ? 'text-rose-400' : 'text-zinc-400'}`}>
              {shocks.defenseShock > 0 ? `+${shocks.defenseShock}%` : `${shocks.defenseShock}%`}
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            step="5"
            value={shocks.defenseShock}
            onChange={(e) => onShockChange('defenseShock', parseInt(e.target.value, 10))}
            className="w-full accent-sky-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            aria-label="Gasto de Defensa y Rearme"
          />
        </div>

        {/* Slider 2: Trade Shock */}
        <div>
          <div className="flex justify-between items-center text-[11px] font-mono mb-1">
            <span className="flex items-center gap-1.5 text-zinc-300 font-semibold">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Aranceles & Sanciones Comerciales
            </span>
            <span className={`font-bold ${shocks.tradeShock > 0 ? 'text-emerald-400' : shocks.tradeShock < 0 ? 'text-rose-400' : 'text-zinc-400'}`}>
              {shocks.tradeShock > 0 ? `+${shocks.tradeShock}%` : `${shocks.tradeShock}%`}
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            step="5"
            value={shocks.tradeShock}
            onChange={(e) => onShockChange('tradeShock', parseInt(e.target.value, 10))}
            className="w-full accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            aria-label="Aranceles y Sanciones Comerciales"
          />
        </div>

        {/* Slider 3: Currency Shock */}
        <div>
          <div className="flex justify-between items-center text-[11px] font-mono mb-1">
            <span className="flex items-center gap-1.5 text-zinc-300 font-semibold">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Shock Cambiario & Tipo de Interés
            </span>
            <span className={`font-bold ${shocks.currencyShock > 0 ? 'text-emerald-400' : shocks.currencyShock < 0 ? 'text-rose-400' : 'text-zinc-400'}`}>
              {shocks.currencyShock > 0 ? `+${shocks.currencyShock}%` : `${shocks.currencyShock}%`}
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            step="5"
            value={shocks.currencyShock}
            onChange={(e) => onShockChange('currencyShock', parseInt(e.target.value, 10))}
            className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            aria-label="Shock Cambiario y Tipo de Interés"
          />
        </div>

        {/* Slider 4: Tech Shock */}
        <div>
          <div className="flex justify-between items-center text-[11px] font-mono mb-1">
            <span className="flex items-center gap-1.5 text-zinc-300 font-semibold">
              <Cpu className="w-3.5 h-3.5 text-teal-400" />
              Embargo Tecnológico / Chips e IA
            </span>
            <span className={`font-bold ${shocks.techShock > 0 ? 'text-emerald-400' : shocks.techShock < 0 ? 'text-rose-400' : 'text-zinc-400'}`}>
              {shocks.techShock > 0 ? `+${shocks.techShock}%` : `${shocks.techShock}%`}
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            step="5"
            value={shocks.techShock}
            onChange={(e) => onShockChange('techShock', parseInt(e.target.value, 10))}
            className="w-full accent-teal-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            aria-label="Embargo Tecnológico y Sanciones de Semiconductores"
          />
        </div>
      </div>

      {/* ── Real-Time Tactical Logs Ticker ── */}
      {tacticalLogs.length > 0 && (
        <div className="bg-zinc-900/90 rounded border border-zinc-800 p-2.5 text-[10px] font-mono text-zinc-300 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
            <AlertTriangle className="w-3 h-3" />
            <span>TELEMETRÍA DE IMPACTO EN TIEMPO REAL:</span>
          </div>
          {tacticalLogs.slice(-3).map((log, idx) => (
            <div key={idx} className="leading-snug text-zinc-400">
              ▸ {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
