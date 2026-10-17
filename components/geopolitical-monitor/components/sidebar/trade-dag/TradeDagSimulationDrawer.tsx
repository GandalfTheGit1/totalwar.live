'use client';

import React from 'react';
import { Sliders } from 'lucide-react';
import type { 
  TradeNode, 
  TradeSteeringSimulationResult 
} from '@/lib/services/trade-dag-service';

export interface TradeDagSimulationDrawerProps {
  isOpen: boolean;
  passThroughNodes: TradeNode[];
  effectiveSimTargetId: string;
  onSelectTargetNodeId: (nodeId: string) => void;
  simBypassPct: number;
  onChangeBypassPct: (pct: number) => void;
  simulationResult: TradeSteeringSimulationResult | null;
}

export function TradeDagSimulationDrawer({
  isOpen,
  passThroughNodes,
  effectiveSimTargetId,
  onSelectTargetNodeId,
  simBypassPct,
  onChangeBypassPct,
  simulationResult
}: TradeDagSimulationDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="bg-zinc-950/80 p-3 rounded-lg border border-amber-500/30 animate-in fade-in slide-in-from-top-2 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300">
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span>Simulación de Desvío Comercial (Bypass Shock)</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
          {simBypassPct}% Desvío
        </span>
      </div>

      <p className="text-[11px] text-zinc-400 leading-snug">
        Simula qué ocurre con los márgenes y el FCF si los compradores finales re-enrutan el flujo alrededor de un nodo intermediario.
      </p>

      {passThroughNodes.length === 0 ? (
        <div className="p-3 bg-zinc-900/60 rounded border border-zinc-800 text-xs text-zinc-400 font-mono text-center">
          Esta cadena no contiene nodos intermedios de paso: el flujo comercial se transfiere directamente de los nodos de origen a los nodos terminales.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          <div>
            <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">
              Nodo Intermediario Objetivo
            </label>
            <select
              aria-label="Nodo Intermediario Objetivo"
              value={effectiveSimTargetId}
              onChange={(e) => onSelectTargetNodeId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded p-1.5 font-mono cursor-pointer focus:outline-none focus:border-amber-500"
            >
              {passThroughNodes.map(node => (
                <option key={node.id} value={node.id}>
                  {node.name} ({node.countryCode}) - Margen {(node.operatingMargin * 100).toFixed(1)}%
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-zinc-400 uppercase font-bold">
                % Flujo Comercial Desviado
              </label>
              <span className="text-amber-400 font-bold">{simBypassPct}%</span>
            </div>
            <input
              type="range"
              aria-label="% Flujo Comercial Desviado"
              min="0"
              max="100"
              step="5"
              value={simBypassPct}
              onChange={(e) => onChangeBypassPct(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>
        </div>
      )}

      {simulationResult && (
        <div className="p-2.5 bg-zinc-900/90 rounded border border-zinc-800 space-y-2">
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="bg-zinc-800/60 p-1.5 rounded">
              <span className="text-[9px] text-zinc-500 uppercase block">Flujo Desviado</span>
              <span className="text-zinc-200 font-bold">${simulationResult.divertedFlowValue}M</span>
            </div>
            <div className="bg-zinc-800/60 p-1.5 rounded">
              <span className="text-[9px] text-zinc-500 uppercase block">Pérdida Margen</span>
              <span className="text-rose-400 font-bold">-${simulationResult.deltas.targetNodeMarginLoss}M</span>
            </div>
            <div className="bg-zinc-800/60 p-1.5 rounded">
              <span className="text-[9px] text-zinc-500 uppercase block">Nuevo FCF Capture</span>
              <span className="text-emerald-400 font-bold">
                {(simulationResult.postMetrics.fcfCaptureRatio * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-300 font-sans leading-relaxed pt-1 border-t border-zinc-800">
            {simulationResult.impactNarrative}
          </p>
        </div>
      )}
    </div>
  );
}
