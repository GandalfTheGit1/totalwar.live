import React from 'react';
import { Activity, Factory, Briefcase, TrendingUp, TrendingDown } from 'lucide-react';

export function PmiActivitySection({ activeData }: { activeData: any }) {
  const pmiComp = activeData?.pmiComposite ?? 50.0;
  const pmiMfg = activeData?.pmiManufacturing ?? 50.0;
  const pmiSrv = activeData?.pmiServices ?? 50.0;
  const isMfgExpansion = pmiMfg >= 50.0;
  const isSrvExpansion = pmiSrv >= 50.0;
  const isCompExpansion = pmiComp >= 50.0;

  const calcPmiPercent = (val: number) => {
    const clamped = Math.max(30, Math.min(70, val));
    return ((clamped - 30) / 40) * 100;
  };

  return (
    <div className="bg-zinc-850/70 p-4 rounded-xl border border-teal-500/20 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs text-zinc-300 uppercase tracking-wider flex items-center gap-2 font-bold font-mono">
          <Activity className="w-4 h-4 text-teal-400" /> PMI &amp; Dinámica de Actividad
        </h4>
        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">
          {activeData?.pmiReportDate || 'Reporte Reciente'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-zinc-900/80 p-3 rounded-lg border border-zinc-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-zinc-400 font-semibold flex items-center gap-1.5">
              <Factory className="w-3.5 h-3.5 text-zinc-400" /> Manufactura
            </span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
              isMfgExpansion
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              {isMfgExpansion ? 'Expansión' : 'Contracción'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-black text-2xl text-zinc-100">
              {activeData?.pmiManufacturing ? activeData.pmiManufacturing.toFixed(1) : '--'}
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">
              {isMfgExpansion
                ? <TrendingUp className="w-3 h-3 text-emerald-400 inline" />
                : <TrendingDown className="w-3 h-3 text-rose-400 inline" />}
              {' '}&gt;50
            </span>
          </div>
        </div>

        <div className="bg-zinc-900/80 p-3 rounded-lg border border-zinc-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-zinc-400 font-semibold flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-zinc-400" /> Servicios
            </span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
              isSrvExpansion
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              {isSrvExpansion ? 'Expansión' : 'Contracción'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-black text-2xl text-zinc-100">
              {activeData?.pmiServices ? activeData.pmiServices.toFixed(1) : '--'}
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">
              {isSrvExpansion
                ? <TrendingUp className="w-3 h-3 text-emerald-400 inline" />
                : <TrendingDown className="w-3 h-3 text-rose-400 inline" />}
              {' '}&gt;50
            </span>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/80">
        <div className="flex justify-between items-center text-[10px] font-mono mb-1.5">
          <span className="text-zinc-400">PMI Compuesto Ponderado</span>
          <span className="font-bold text-zinc-200">
            {activeData?.pmiComposite ? activeData.pmiComposite.toFixed(1) : '--'}{' '}
            <span className={isCompExpansion ? 'text-emerald-400' : 'text-rose-400'}>
              ({isCompExpansion ? 'Crecimiento' : 'Ralentización'})
            </span>
          </span>
        </div>
        <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-zinc-400 z-10"
            style={{ left: `${calcPmiPercent(50.0)}%` }}
            title="Umbral Neutro 50.0"
          />
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isCompExpansion
                ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
                : 'bg-gradient-to-r from-rose-500 to-amber-500'
            }`}
            style={{ width: `${calcPmiPercent(pmiComp)}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] font-mono text-zinc-500 mt-1">
          <span>30.0</span>
          <span className="text-zinc-400 font-bold">50.0 (Neutro)</span>
          <span>70.0</span>
        </div>
      </div>
    </div>
  );
}
