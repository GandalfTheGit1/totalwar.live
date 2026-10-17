'use client';

import React from 'react';
import { CurrencyHegemonyDossier, WargameSimulationResult } from '@/lib/types/sovereign-power';
import { DollarSign, Scale, Landmark, ShieldCheck, AlertOctagon, Coins } from 'lucide-react';

interface CurrencyHegemonyPanelProps {
  dossier: CurrencyHegemonyDossier;
  warpedDalioSpread?: WargameSimulationResult['warpedDalioSpread'];
}

export const CurrencyHegemonyPanel: React.FC<CurrencyHegemonyPanelProps> = ({ 
  dossier, 
  warpedDalioSpread 
}) => {
  const activeDalio = warpedDalioSpread || dossier.dalioSpread;
  const isSimulationActive = Boolean(warpedDalioSpread);

  const swiftColorMap: Record<CurrencyHegemonyDossier['swiftStatus'], { text: string; bg: string }> = {
    HEGEMON_CONTROLLER: { text: 'text-emerald-300', bg: 'bg-emerald-500/20 border-emerald-500/40' },
    CORE_PARTICIPANT: { text: 'text-cyan-300', bg: 'bg-cyan-500/20 border-cyan-500/40' },
    PERIPHERAL: { text: 'text-amber-300', bg: 'bg-amber-500/20 border-amber-500/40' },
    SANCTIONED_EXCLUDED: { text: 'text-rose-300', bg: 'bg-rose-500/20 border-rose-500/40' }
  };

  const swiftStyle = swiftColorMap[dossier.swiftStatus] || swiftColorMap.CORE_PARTICIPANT;

  return (
    <div className="space-y-3 font-mono">
      {/* ── Reserve Status & Key Treasury Metrics ── */}
      <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase text-zinc-300">
              Estatus de Reserva & Autonomía Financiera
            </span>
          </div>
          <span className="text-xs font-black text-emerald-400">
            {dossier.score} / 100
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="bg-zinc-900/90 p-2.5 rounded border border-zinc-800">
            <span className="text-zinc-500 block text-[10px] uppercase">Divisa Soberana:</span>
            <span className="text-white font-bold text-sm">
              {dossier.currencyCode} - {dossier.currencyName}
            </span>
          </div>

          <div className="bg-zinc-900/90 p-2.5 rounded border border-zinc-800">
            <span className="text-zinc-500 block text-[10px] uppercase">Cuota Reservas FMI COFER:</span>
            <span className="text-emerald-400 font-bold text-sm">
              {dossier.globalReserveSharePercent}%
            </span>
          </div>

          <div className="bg-zinc-900/90 p-2.5 rounded border border-zinc-800">
            <span className="text-zinc-500 block text-[10px] uppercase flex items-center gap-1">
              <Coins className="w-3 h-3 text-amber-400" /> Reservas Oro Físico:
            </span>
            <span suppressHydrationWarning className="text-amber-400 font-bold text-sm">
              {dossier.goldReservesTonnes.toLocaleString('en-US')} Toneladas
            </span>
          </div>

          <div className="bg-zinc-900/90 p-2.5 rounded border border-zinc-800">
            <span className="text-zinc-500 block text-[10px] uppercase">Reservas FX Líquidas:</span>
            <span className="text-cyan-400 font-bold text-sm">
              ${dossier.fxReservesBillionUSD}B USD
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-zinc-400 text-[11px]">Ratio Deuda / PIB:</span>
          <span className={`font-bold ${dossier.debtToGdpPercent > 100 ? 'text-rose-400' : 'text-zinc-200'}`}>
            {dossier.debtToGdpPercent}% del PIB
          </span>
        </div>
      </div>

      {/* ── Ray Dalio Macroeconomic Spread (Nominal GDP vs EIR) ── */}
      <div className={`p-3.5 rounded-xl border space-y-2.5 transition-all ${
        isSimulationActive 
          ? 'bg-zinc-950 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
          : 'bg-zinc-900/90 border-zinc-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-zinc-200">
              Spread Dalio (PIB Nominal vs Tasa Efectiva EIR)
            </span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${
            activeDalio.isBeautifulDeleveraging
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
          }`}>
            {activeDalio.isBeautifulDeleveraging 
              ? 'DESAPALANCAMIENTO HERMOSO' 
              : 'RIESGO DE ASFIXIA POR DEUDA'}
          </span>
        </div>

        {isSimulationActive && (
          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-block font-bold">
            ⚡ IMPACTO DE SIMULACIÓN WARGAME EN TIEMPO REAL
          </span>
        )}

        <div className="grid grid-cols-3 gap-2 text-center text-xs my-2">
          <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block">PIB Nominal:</span>
            <span className="text-zinc-200 font-bold">
              {activeDalio.nominalGdpGrowthPercent >= 0 ? `+${activeDalio.nominalGdpGrowthPercent}` : activeDalio.nominalGdpGrowthPercent}%
            </span>
          </div>

          <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block">Tasa Efectiva (EIR):</span>
            <span className="text-zinc-200 font-bold">
              {activeDalio.effectiveInterestRatePercent}%
            </span>
          </div>

          <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block">Diferencial (Spread):</span>
            <span className={`font-black ${
              activeDalio.spreadPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {activeDalio.spreadPercent >= 0 ? `+${activeDalio.spreadPercent}` : activeDalio.spreadPercent}%
            </span>
          </div>
        </div>

        <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
          {activeDalio.verdictEs}
        </p>
      </div>

      {/* ── SWIFT Network & Alternative Payment Rails ── */}
      <div className="bg-zinc-900/70 p-3 rounded-lg border border-zinc-800 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-zinc-400 font-bold">Red SWIFT & Sanciones:</span>
          <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${swiftStyle.bg} ${swiftStyle.text}`}>
            {dossier.swiftStatus}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-zinc-500 block mb-1">Rieles de Pago Alternativos:</span>
          <div className="flex flex-wrap gap-1">
            {dossier.alternativeRails.length > 0 ? (
              dossier.alternativeRails.map((rail, idx) => (
                <span key={idx} className="text-[9px] px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded border border-zinc-700">
                  {rail}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-zinc-500">Sin rieles alternativos desplegados</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
