'use client';

import React from 'react';
import { InstitutionalStabilityDossier } from '@/lib/types/sovereign-power';
import { Building2, ShieldAlert, Users, Scale, AlertOctagon } from 'lucide-react';

interface InstitutionalStabilityPanelProps {
  dossier: InstitutionalStabilityDossier;
}

export const InstitutionalStabilityPanel: React.FC<InstitutionalStabilityPanelProps> = ({ dossier }) => {
  const verdictStyleMap: Record<InstitutionalStabilityDossier['verdict'], { text: string; bg: string }> = {
    FORTRESS: { text: 'text-emerald-300', bg: 'bg-emerald-500/20 border-emerald-500/40' },
    STABLE_CONSTITUTIONAL: { text: 'text-teal-300', bg: 'bg-teal-500/20 border-teal-500/40' },
    POLARIZED_STRESSED: { text: 'text-amber-300', bg: 'bg-amber-500/20 border-amber-500/40' },
    HIGH_FRACTURE_RISK: { text: 'text-rose-300', bg: 'bg-rose-500/20 border-rose-500/40' }
  };

  const verdictStyle = verdictStyleMap[dossier.verdict] || verdictStyleMap.STABLE_CONSTITUTIONAL;

  return (
    <div className="space-y-3 font-mono">
      {/* ── Main Rule of Law & Stability Overview ── */}
      <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase text-zinc-300">
              Estado de Derecho & Cohesión Institucional
            </span>
          </div>
          <span className="text-xs font-black text-amber-400">
            {dossier.score} / 100
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="bg-zinc-900/90 p-2.5 rounded border border-zinc-800">
            <span className="text-zinc-500 block text-[10px] uppercase flex items-center gap-1">
              <Scale className="w-3 h-3 text-emerald-400" /> Índice Rule of Law:
            </span>
            <span className="text-emerald-400 font-bold text-sm">
              {dossier.ruleOfLawScore} / 100
            </span>
          </div>

          <div className="bg-zinc-900/90 p-2.5 rounded border border-zinc-800">
            <span className="text-zinc-500 block text-[10px] uppercase flex items-center gap-1">
              <Users className="w-3 h-3 text-cyan-400" /> Cohesión Interna:
            </span>
            <span className="text-cyan-400 font-bold text-sm">
              {dossier.internalCohesionScore} / 100
            </span>
          </div>

          <div className="bg-zinc-900/90 p-2.5 rounded border border-zinc-800">
            <span className="text-zinc-500 block text-[10px] uppercase">Riesgo Golpe / Fractura:</span>
            <span className={`font-bold text-sm ${
              dossier.coupOrFractureRiskPercent <= 5 ? 'text-emerald-400' : dossier.coupOrFractureRiskPercent <= 20 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {dossier.coupOrFractureRiskPercent}% Probabilidad
            </span>
          </div>

          <div className="bg-zinc-900/90 p-2.5 rounded border border-zinc-800">
            <span className="text-zinc-500 block text-[10px] uppercase">Polarización Sociopolítica:</span>
            <span className={`font-bold text-sm ${
              dossier.polarizationLevel === 'LOW' ? 'text-emerald-400' : dossier.polarizationLevel === 'MODERATE' ? 'text-cyan-400' : 'text-amber-400'
            }`}>
              {dossier.polarizationLevel}
            </span>
          </div>
        </div>

        {/* Unrest Gauge */}
        <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800/80 space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-zinc-400">Índice de Tensión / Malestar Social:</span>
            <span className={`font-bold ${
              dossier.socialUnrestIndex > 50 ? 'text-rose-400' : dossier.socialUnrestIndex > 25 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {dossier.socialUnrestIndex} / 100
            </span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded overflow-hidden">
            <div 
              className={`h-full ${
                dossier.socialUnrestIndex > 50 ? 'bg-rose-500' : dossier.socialUnrestIndex > 25 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${dossier.socialUnrestIndex}%` }}
            />
          </div>
        </div>

        {/* Verdict Badge */}
        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-zinc-400 text-[11px]">Veredicto Institucional:</span>
          <span className={`px-2 py-0.5 rounded border font-bold text-[10px] uppercase ${verdictStyle.bg} ${verdictStyle.text}`}>
            {dossier.verdict}
          </span>
        </div>
      </div>
    </div>
  );
};
