import React from 'react';
import { Cpu, Truck } from 'lucide-react';

export function SovereignMetricsSection({ activeData }: { activeData: any }) {
  return (
    <div className="bg-zinc-850/60 p-4 rounded-xl border border-zinc-700/60">
      <h4 className="text-xs text-zinc-400 uppercase tracking-wider mb-3.5 flex items-center gap-2 font-bold font-mono">
        <Cpu className="w-4 h-4 text-zinc-400" /> Métricas Soberanas Cuantitativas
      </h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800">
          <span className="text-zinc-400 block mb-1 text-[11px] uppercase tracking-wider font-semibold">
            Índice de Riesgo
          </span>
          <span className={`font-mono font-black text-2xl ${activeData?.textClass || 'text-zinc-200'}`}>
            {activeData?.risk ?? '--'} <span className="text-xs text-zinc-500 font-normal">/ 100</span>
          </span>
          {activeData && (
            <span className={`mt-1 block text-[10px] font-mono font-bold ${activeData.risk <= 30 ? 'text-emerald-400' : activeData.risk <= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
              Estabilidad: {Math.max(1, Math.ceil((100 - activeData.risk) / 10))}/10
            </span>
          )}
        </div>

        <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800">
          <span className="text-zinc-400 block mb-1 text-[11px] uppercase tracking-wider font-semibold">
            Fricción (COGS)
          </span>
          <span className="font-mono text-xl text-zinc-200 font-bold flex items-center gap-1.5 mt-0.5">
            <Truck className="w-4 h-4 text-zinc-400" /> {activeData?.friction || '--'}
          </span>
        </div>

        <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800">
          <span className="text-zinc-400 block mb-1 text-[11px] uppercase tracking-wider font-semibold">
            Exposición IA / Tech
          </span>
          <span className="font-mono text-lg text-zinc-200 font-bold mt-0.5 block">
            {activeData?.aiExposure || '--'}
          </span>
        </div>

        <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800">
          <span className="text-zinc-400 block mb-1 text-[11px] uppercase tracking-wider font-semibold">
            Veredicto Cuantitativo
          </span>
          <span
            className="inline-block font-mono text-xs uppercase tracking-wider px-2 py-1 rounded border font-extrabold mt-1"
            style={{
              color: activeData?.indicator || '#64748b',
              borderColor: activeData?.indicator ? `${activeData.indicator}40` : '#475569',
              backgroundColor: activeData?.indicator ? `${activeData.indicator}15` : 'transparent',
            }}
          >
            {activeData
              ? activeData.risk >= 70
                ? 'K.O. Crítico'
                : activeData.risk >= 30
                ? 'Monitor Activo'
                : 'Nodo Resiliente'
              : '---'}
          </span>
        </div>
      </div>
    </div>
  );
}
