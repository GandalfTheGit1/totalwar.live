'use client';

import React, { useState, useMemo } from 'react';
import { Layers } from 'lucide-react';
import type { 
  TradeNode, 
  TradeNodeType, 
  TradeDagMetrics 
} from '@/lib/services/trade-dag-service';

export interface TradeDagNodeListProps {
  nodes: TradeNode[];
  metrics: TradeDagMetrics;
}

export function TradeDagNodeList({ nodes, metrics }: TradeDagNodeListProps) {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | TradeNodeType | 'CHOKEPOINTS'>('ALL');

  // Filtrado de nodos en la lista
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      if (selectedFilter === 'ALL') return true;
      if (selectedFilter === 'CHOKEPOINTS') return node.isChokepoint || metrics.identifiedChokepoints.includes(node.id);
      return node.type === selectedFilter;
    });
  }, [nodes, selectedFilter, metrics.identifiedChokepoints]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-teal-400" /> Nodos de la Cadena ({filteredNodes.length})
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSelectedFilter('ALL')}
            className={`px-1.5 py-0.5 text-[10px] font-mono rounded cursor-pointer border ${
              selectedFilter === 'ALL'
                ? 'bg-zinc-700 text-zinc-100 border-zinc-600'
                : 'bg-zinc-900/60 text-zinc-400 border-zinc-800'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('END_NODE')}
            className={`px-1.5 py-0.5 text-[10px] font-mono rounded cursor-pointer border ${
              selectedFilter === 'END_NODE'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-zinc-900/60 text-zinc-400 border-zinc-800'
            }`}
          >
            End
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('PASS_THROUGH')}
            className={`px-1.5 py-0.5 text-[10px] font-mono rounded cursor-pointer border ${
              selectedFilter === 'PASS_THROUGH'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-zinc-900/60 text-zinc-400 border-zinc-800'
            }`}
          >
            Pass
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('CHOKEPOINTS')}
            className={`px-1.5 py-0.5 text-[10px] font-mono rounded cursor-pointer border ${
              selectedFilter === 'CHOKEPOINTS'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-zinc-900/60 text-zinc-400 border-zinc-800'
            }`}
          >
            Chokepoint
          </button>
        </div>
      </div>

      {filteredNodes.length === 0 ? (
        <div className="p-3 text-center text-xs font-mono text-zinc-500 bg-zinc-900/40 rounded border border-zinc-800">
          No se encontraron nodos para el filtro seleccionado.
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
          {filteredNodes.map(node => {
            const nodeMeta = metrics.nodeMetrics[node.id];
            const isChokepoint = node.isChokepoint || metrics.identifiedChokepoints.includes(node.id);
            const isVulnerable = metrics.vulnerablePassThroughNodes.includes(node.id);

            return (
              <div
                key={node.id}
                className="bg-zinc-900/70 p-2.5 rounded-lg border border-zinc-800/80 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      node.type === 'END_NODE'
                        ? 'bg-emerald-400'
                        : node.type === 'ORIGIN'
                        ? 'bg-indigo-400'
                        : isChokepoint
                        ? 'bg-purple-400 animate-pulse'
                        : 'bg-amber-400'
                    }`} />
                    <span className="text-xs font-bold text-zinc-200 font-mono">
                      {node.name}
                    </span>
                    <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">
                      {node.countryCode}
                    </span>
                  </div>

                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                    node.type === 'END_NODE'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : isChokepoint
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                      : isVulnerable
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {node.type === 'END_NODE' ? 'END NODE' : isChokepoint ? 'CHOKEPOINT' : node.type === 'ORIGIN' ? 'ORIGIN' : 'PASS-THROUGH'}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-zinc-400 mt-2 pt-1.5 border-t border-zinc-800/60">
                  <div>
                    <span className="text-zinc-500 block">Margen Op.</span>
                    <span className="text-zinc-200 font-bold">{(node.operatingMargin * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Pricing Pw.</span>
                    <span className="text-zinc-200 font-bold">{node.pricingPower}/100</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Moat Score</span>
                    <span className="text-zinc-200 font-bold">{node.moatScore}/100</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">FCF Anual</span>
                    <span suppressHydrationWarning className="text-emerald-400 font-bold">${node.fcf.toLocaleString('en-US')}M</span>
                  </div>
                </div>

                {nodeMeta && (
                  <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 mt-1.5">
                    <span suppressHydrationWarning>Throughput: ${nodeMeta.throughput.toLocaleString('en-US')}M</span>
                    <span>Cuota Margen: {nodeMeta.marginSharePct}%</span>
                    <span className={nodeMeta.tradeSteeringVulnerability >= 65 ? 'text-rose-400' : 'text-zinc-400'}>
                      Steering Vuln: {nodeMeta.tradeSteeringVulnerability}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
