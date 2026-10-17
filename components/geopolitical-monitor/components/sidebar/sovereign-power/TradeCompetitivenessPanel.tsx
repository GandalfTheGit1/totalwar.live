'use client';

import React from 'react';
import { TradeDimensionDossier } from '@/lib/types/sovereign-power';
import { ShoppingCart, ArrowUpRight, ArrowDownLeft, AlertTriangle, Globe2 } from 'lucide-react';

interface TradeCompetitivenessPanelProps {
  dossier: TradeDimensionDossier;
}

export const TradeCompetitivenessPanel: React.FC<TradeCompetitivenessPanelProps> = ({ dossier }) => {
  return (
    <div className="space-y-3 font-mono">
      {/* ── Trade Balance & Global Trade Share ── */}
      <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase text-zinc-300">
              Balanza Comercial & Socios Estratégicos
            </span>
          </div>
          <span className="text-xs font-black text-cyan-400">
            {dossier.score} / 100
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="bg-zinc-900/90 p-2.5 rounded border border-zinc-800">
            <span className="text-zinc-500 block text-[10px] uppercase">Balanza de Mercancías:</span>
            <span className={`font-black text-sm ${
              dossier.tradeBalanceBillionUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {dossier.tradeBalanceBillionUSD >= 0 ? `+$${dossier.tradeBalanceBillionUSD}B` : `-$${Math.abs(dossier.tradeBalanceBillionUSD)}B`}
            </span>
          </div>

          <div className="bg-zinc-900/90 p-2.5 rounded border border-zinc-800">
            <span className="text-zinc-500 block text-[10px] uppercase">Cuota Comercio Mundial:</span>
            <span className="text-white font-bold text-sm">
              {dossier.worldTradeSharePercent}%
            </span>
          </div>
        </div>

        {/* Tariff Vulnerability Gauge */}
        <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800/80 space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-zinc-400">Vulnerabilidad a Aranceles Externos:</span>
            <span className={`font-bold ${
              dossier.tariffVulnerabilityScore > 60 ? 'text-rose-400' : dossier.tariffVulnerabilityScore > 35 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {dossier.tariffVulnerabilityScore} / 100
            </span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded overflow-hidden">
            <div 
              className={`h-full ${
                dossier.tariffVulnerabilityScore > 60 ? 'bg-rose-500' : dossier.tariffVulnerabilityScore > 35 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${dossier.tariffVulnerabilityScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Bilateral Trade Partner Flows (Export vs Import) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Top Export Partners */}
        <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 space-y-2">
          <h5 className="text-[11px] font-bold text-zinc-300 uppercase flex items-center gap-1.5">
            <ArrowUpRight className="w-3.5 h-3.5 text-teal-400" />
            Destinos Clave Exportación
          </h5>
          <div className="space-y-2 text-[10px]">
            {dossier.topExportPartners.map((partner, idx) => (
              <div key={idx} className="border-b border-zinc-800/60 pb-1.5 last:border-0 last:pb-0">
                <div className="flex justify-between items-center text-zinc-300 font-bold">
                  <span>{partner.countryName} ({partner.countryCode})</span>
                  <span className="text-teal-400">{partner.sharePercent}%</span>
                </div>
                <span className="text-zinc-500 text-[9px] block">
                  Bienes: {partner.primaryGoods}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Import Partners */}
        <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 space-y-2">
          <h5 className="text-[11px] font-bold text-zinc-300 uppercase flex items-center gap-1.5">
            <ArrowDownLeft className="w-3.5 h-3.5 text-cyan-400" />
            Orígenes Clave Importación
          </h5>
          <div className="space-y-2 text-[10px]">
            {dossier.topImportPartners.map((partner, idx) => (
              <div key={idx} className="border-b border-zinc-800/60 pb-1.5 last:border-0 last:pb-0">
                <div className="flex justify-between items-center text-zinc-300 font-bold">
                  <span>{partner.countryName} ({partner.countryCode})</span>
                  <span className="text-cyan-400">{partner.sharePercent}%</span>
                </div>
                <span className="text-zinc-500 text-[9px] block">
                  Bienes: {partner.primaryGoods}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Critical Dependencies ── */}
      <div className="bg-zinc-900/70 p-3 rounded-xl border border-zinc-800 text-xs space-y-1.5">
        <span className="text-zinc-400 font-bold flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          Dependencias Estratégicas Críticas:
        </span>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {dossier.criticalDependencies.map((dep, idx) => (
            <span key={idx} className="text-[10px] px-2 py-0.5 bg-rose-950/30 text-rose-300 border border-rose-800/40 rounded flex items-center gap-1">
              <span>⚠️</span>
              {dep}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
