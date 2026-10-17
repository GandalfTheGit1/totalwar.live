'use client';

import React from 'react';
import { Info } from 'lucide-react';
import type { TradeDagAnalysisResult, TradeDagMetrics } from '@/lib/services/trade-dag-service';

function ExecutiveVerdictCard({ summary }: { summary: TradeDagAnalysisResult['summary'] }) {
  return (
    <div className="bg-zinc-900/80 p-3 rounded-lg border border-zinc-800/80">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold flex items-center gap-1">
          <Info className="w-3 h-3 text-teal-400" /> Diagnóstico Ejecutivo
        </span>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
          {summary.verdict}
        </span>
      </div>
      <p className="text-xs text-zinc-300 leading-relaxed font-sans mb-2">
        {summary.keyVulnerability}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-zinc-800">
        <div className="text-zinc-400">
          <span className="text-amber-400 font-semibold block">Steering:</span>
          {summary.tradeSteeringAssessment}
        </div>
        <div className="text-zinc-400">
          <span className="text-emerald-400 font-semibold block">Foso FCF:</span>
          {summary.fcfMoatAssessment}
        </div>
      </div>
    </div>
  );
}

function MarginPoolDistributionBar({ metrics }: { metrics: TradeDagMetrics }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[10px] font-mono">
        <span suppressHydrationWarning className="text-zinc-400 uppercase tracking-wider font-semibold">
          Reparto del Pool de Margen ($ {metrics.totalMarginPool.toLocaleString('en-US')}M)
        </span>
        <span className="text-zinc-500 font-bold">100% Total</span>
      </div>
      <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden flex ring-1 ring-zinc-700/50">
        <div
          style={{ width: `${Math.max(2, metrics.originMarginShare)}%` }}
          className="bg-indigo-500/80 transition-all duration-300 relative group"
          title={`Nodos Origen: ${metrics.originMarginShare}%`}
        />
        <div
          style={{ width: `${Math.max(2, metrics.passThroughMarginShare)}%` }}
          className="bg-amber-500/80 transition-all duration-300 relative group"
          title={`Intermedios Comoditizados (Drenaje): ${metrics.passThroughMarginShare}%`}
        />
        <div
          style={{ width: `${Math.max(2, metrics.endNodeMarginShare)}%` }}
          className="bg-emerald-500/80 transition-all duration-300 relative group"
          title={`End Nodes (Captura FCF): ${metrics.endNodeMarginShare}%`}
        />
      </div>
      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-0.5">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          Origen ({metrics.originMarginShare}%)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Intermedios ({metrics.passThroughMarginShare}%)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          End Nodes ({metrics.endNodeMarginShare}%)
        </span>
      </div>
    </div>
  );
}

export function TradeDagDiagnosis({ analysis }: { analysis: TradeDagAnalysisResult }) {
  return (
    <>
      <ExecutiveVerdictCard summary={analysis.summary} />
      <MarginPoolDistributionBar metrics={analysis.metrics} />
    </>
  );
}
