import React from 'react';
import { Info, Loader2, RotateCw } from 'lucide-react';

interface CausalAnalysisSectionProps {
  llmLoading: boolean;
  llmError: string | null;
  llmAnalysis: string | null;
  activeMacro: any;
  activeData: any;
  onRetry?: () => void;
}

export function CausalAnalysisSection({
  llmLoading,
  llmError,
  llmAnalysis,
  activeMacro,
  activeData,
  onRetry,
}: CausalAnalysisSectionProps) {
  return (
    <div className="bg-zinc-850/60 p-4 rounded-xl border border-zinc-700/60">
      <h4 className="text-[11px] text-zinc-300 uppercase tracking-widest mb-2.5 font-bold font-mono flex items-center gap-2">
        <Info className="w-3.5 h-3.5 text-teal-400" /> Deducción Causal Multimodal &amp; Dalio
        {llmLoading && <Loader2 className="w-3 h-3 text-teal-400 animate-spin ml-1" />}
      </h4>

      {llmLoading && (
        <div className="space-y-2 animate-pulse">
          <div className="h-3 bg-zinc-800 rounded w-full" />
          <div className="h-3 bg-zinc-800 rounded w-5/6" />
          <div className="h-3 bg-zinc-800 rounded w-4/6" />
          <div className="h-3 bg-zinc-800 rounded w-full" />
          <div className="h-3 bg-zinc-800 rounded w-3/4" />
        </div>
      )}

      {!llmLoading && llmError && (
        <div className="space-y-2.5">
          <p className="text-xs text-rose-400 font-mono leading-relaxed">{llmError}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700/80 hover:text-white rounded border border-zinc-700/80 transition-colors cursor-pointer"
            >
              <RotateCw className="w-3 h-3 text-teal-400" /> Reintentar análisis
            </button>
          )}
        </div>
      )}

      {!llmLoading && !llmError && llmAnalysis && (
        <p className="text-xs text-zinc-300 leading-relaxed">{llmAnalysis}</p>
      )}

      {!llmLoading && !llmError && !llmAnalysis && !activeMacro && (
        <p className="text-xs text-zinc-500 leading-relaxed">
          {activeData
            ? 'Seleccione un nodo en el mapa para computar la evaluación de riesgo estructural y ciclo Dalio.'
            : 'Seleccione un nodo en el mapa para computar la evaluación de riesgo estructural y actividad PMI.'}
        </p>
      )}
    </div>
  );
}
