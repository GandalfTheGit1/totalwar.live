'use client';

import React from 'react';
import { MilitaryCapacityDossier } from '@/lib/types/sovereign-power';
import { Shield, Anchor, Radiation, Navigation, Compass } from 'lucide-react';

interface MilitaryCapacityPanelProps {
  dossier: MilitaryCapacityDossier;
}

export const MilitaryCapacityPanel: React.FC<MilitaryCapacityPanelProps> = ({ dossier }) => {
  return (
    <div className="space-y-3 font-mono">
      {/* ── Budget & Main Military Telemetry ── */}
      <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-bold uppercase text-zinc-300">
              Poder Cinético & Proyección de Fuerza
            </span>
          </div>
          <span className="text-xs font-black text-rose-400">
            {dossier.score} / 100
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="bg-zinc-900/90 p-2.5 rounded border border-zinc-800">
            <span className="text-zinc-500 block text-[10px] uppercase">Gasto Militar Anual:</span>
            <span className="text-rose-400 font-bold text-sm">
              ${dossier.defenseBudgetBillionUSD}B USD
            </span>
            <span className="text-[10px] text-zinc-400 block mt-0.5">
              {dossier.defenseBudgetGdpPercent}% del PIB
            </span>
          </div>

          <div className="bg-zinc-900/90 p-2.5 rounded border border-zinc-800">
            <span className="text-zinc-500 block text-[10px] uppercase flex items-center gap-1">
              <Radiation className="w-3 h-3 text-amber-400" /> Disuasión Nuclear:
            </span>
            <span className="text-amber-400 font-bold text-sm">
              {dossier.nuclearDeterrence.warheadCount > 0 
                ? `${dossier.nuclearDeterrence.warheadCount} Ojivas` 
                : 'No Nuclear'}
            </span>
            <span className="text-[10px] text-zinc-400 block mt-0.5 truncate">
              {dossier.nuclearDeterrence.doctrineStatus}
            </span>
          </div>

          <div className="bg-zinc-900/90 p-2.5 rounded border border-zinc-800">
            <span className="text-zinc-500 block text-[10px] uppercase flex items-center gap-1">
              <Anchor className="w-3 h-3 text-cyan-400" /> Proyección Naval:
            </span>
            <span className="text-cyan-400 font-bold text-sm">
              {dossier.navalProjection.aircraftCarriers} CV // {dossier.navalProjection.nuclearSubmarines} SSN
            </span>
            <span className="text-[10px] text-zinc-400 block mt-0.5">
              {dossier.navalProjection.blueWaterNavy ? 'Armada Aguas Azules' : 'Flota Costera / Fluvial'}
            </span>
          </div>

          <div className="bg-zinc-900/90 p-2.5 rounded border border-zinc-800">
            <span className="text-zinc-500 block text-[10px] uppercase">Capacidad de Tríada:</span>
            <span className={`font-bold text-sm ${dossier.nuclearDeterrence.isTriadCapable ? 'text-emerald-400' : 'text-zinc-400'}`}>
              {dossier.nuclearDeterrence.isTriadCapable ? 'Tríada Operativa' : 'No Operativa'}
            </span>
            <span className="text-[10px] text-zinc-500 block mt-0.5">
              {dossier.navalProjection.majorCombatantsCount} Buques Mayores
            </span>
          </div>
        </div>
      </div>

      {/* ── Maritime Chokepoints Control & Bottlenecks ── */}
      <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-zinc-200 font-bold flex items-center gap-1.5 uppercase text-[11px]">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            Control de Chokepoints Marítimos
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-teal-300 border border-zinc-700">
            Dominio Logístico: {dossier.chokepointControl.logisticsDominanceScore}/100
          </span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="bg-zinc-950/60 p-2 rounded border border-zinc-800/80">
            <span className="text-emerald-400 font-bold block text-[10px] uppercase">Bajo Control Soberano Directo:</span>
            <p className="text-zinc-300 mt-0.5">
              {dossier.chokepointControl.directlyControlled.length > 0 
                ? dossier.chokepointControl.directlyControlled.join(', ')
                : 'Ningún chokepoint global bajo soberanía directa exclusiva.'}
            </p>
          </div>

          <div className="bg-zinc-950/60 p-2 rounded border border-zinc-800/80">
            <span className="text-rose-400 font-bold block text-[10px] uppercase">Rutas de Vulnerabilidad Estratégica:</span>
            <p className="text-zinc-400 mt-0.5">
              {dossier.chokepointControl.vulnerableChokepoints.join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* ── Treaties & Strategic Defense Alliances ── */}
      <div className="bg-zinc-900/70 p-3 rounded-xl border border-zinc-800 space-y-2 text-xs">
        <span className="text-zinc-400 font-bold flex items-center gap-1.5 uppercase text-[11px]">
          <Navigation className="w-3.5 h-3.5 text-sky-400" />
          Alianzas & Tratados Militares:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {dossier.alliances.map((alliance, idx) => (
            <span key={idx} className="px-2 py-0.5 rounded bg-zinc-800 text-sky-300 border border-zinc-700 text-[10px]">
              {alliance}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
