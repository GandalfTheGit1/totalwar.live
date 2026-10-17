'use client';

import React, { useState } from 'react';
import { PoliticalCabinetDossier, CabinetMember } from '@/lib/types/sovereign-power';
import { Users, Award, Shield, DollarSign, Globe, RefreshCw, CheckCircle2 } from 'lucide-react';

interface CabinetDossierPanelProps {
  dossier: PoliticalCabinetDossier;
  onAppointReplacement?: (role: 'DEFENSE' | 'FINANCE' | 'FOREIGN_SECURITY', candidateId: string) => void;
  appointedReplacements?: Partial<Record<'DEFENSE' | 'FINANCE' | 'FOREIGN_SECURITY', string>>;
  onResetCabinet?: () => void;
}

export const CabinetDossierPanel: React.FC<CabinetDossierPanelProps> = ({
  dossier,
  onAppointReplacement,
  appointedReplacements = {},
  onResetCabinet
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  const roles: { roleKey: 'HEAD_OF_STATE' | 'DEFENSE' | 'FINANCE' | 'FOREIGN_SECURITY'; icon: any; member: CabinetMember }[] = [
    { roleKey: 'HEAD_OF_STATE', icon: Award, member: dossier.headOfState },
    { roleKey: 'DEFENSE', icon: Shield, member: dossier.defenseMinister },
    { roleKey: 'FINANCE', icon: DollarSign, member: dossier.financeMinister },
    { roleKey: 'FOREIGN_SECURITY', icon: Globe, member: dossier.foreignMinister },
  ];

  const hasReplacementsAppointed = Object.keys(appointedReplacements).length > 0;

  return (
    <div className="space-y-4">
      {/* ── Governance & Doctrine Overview ── */}
      <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-mono font-bold uppercase text-zinc-300">
              Doctrina & Consejo de Estado
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-purple-500/30 bg-purple-500/10 text-purple-300 font-bold">
            {dossier.dominantFaction}
          </span>
        </div>

        <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800/80">
          <span className="text-[10px] text-zinc-500 font-mono uppercase block">Doctrina Activa:</span>
          <p className="text-xs text-zinc-200 font-semibold font-mono mt-0.5">
            "{dossier.activeDoctrine}"
          </p>
        </div>
      </div>

      {/* ── Active Cabinet Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {roles.map(({ roleKey, icon: Icon, member }) => {
          const isAppointed = roleKey !== 'HEAD_OF_STATE' && appointedReplacements[roleKey as keyof typeof appointedReplacements];

          return (
            <div
              key={roleKey}
              className={`p-3 rounded-xl border transition-all ${
                isAppointed
                  ? 'bg-amber-950/20 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                  : 'bg-zinc-900/80 border-zinc-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">
                    {member.roleTitleEs}
                  </span>
                </div>
                {isAppointed && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
                    REEMPLAZO
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-white tracking-tight">
                {member.name}
              </h4>
              <p className="text-[10px] text-teal-400 font-mono">
                {member.faction}
              </p>

              <div className="mt-2 text-[10px] text-zinc-400 leading-relaxed border-t border-zinc-800/80 pt-1.5">
                <span className="text-zinc-500 block font-mono">Doctrina:</span>
                {member.doctrine}
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-500">Alineación:</span>
                <span className="text-zinc-300 font-bold">{member.ideologyAlignment}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Cabinet Reshuffle Simulator ── */}
      {dossier.availableReplacements.length > 0 && onAppointReplacement && (
        <div className="bg-zinc-950/90 p-4 rounded-xl border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              Opciones de Reemplazo en Gabinete
            </h4>
            {hasReplacementsAppointed && onResetCabinet && (
              <button
                type="button"
                onClick={onResetCabinet}
                className="text-[10px] font-mono text-zinc-400 hover:text-white underline cursor-pointer"
              >
                Restaurar Original
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {dossier.availableReplacements.map((candidate) => {
              const isSelected = selectedCandidateId === candidate.id;
              const isCurrentlyAppointed = appointedReplacements[candidate.targetRole] === candidate.id;

              return (
                <div
                  key={candidate.id}
                  className={`p-3 rounded-lg border transition-all ${
                    isCurrentlyAppointed
                      ? 'bg-emerald-950/20 border-emerald-500/50'
                      : isSelected
                        ? 'bg-zinc-900 border-teal-500/50'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-200">{candidate.name}</span>
                        <span className="text-[10px] font-mono text-amber-400 px-1.5 py-0.2 rounded bg-amber-400/10 border border-amber-400/20">
                          {candidate.targetRole}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        {candidate.faction} // {candidate.ideologyAlignment}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onAppointReplacement(candidate.targetRole, candidate.id);
                        setSelectedCandidateId(candidate.id);
                      }}
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded border transition-all cursor-pointer ${
                        isCurrentlyAppointed
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border-teal-500/40'
                      }`}
                    >
                      {isCurrentlyAppointed ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> ASIGNADO
                        </span>
                      ) : (
                        'NOMBRAR'
                      )}
                    </button>
                  </div>

                  <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed">
                    {candidate.bioSnippet}
                  </p>

                  {/* Impact Deltas Pill Grid */}
                  <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex flex-wrap items-center gap-2 text-[10px] font-mono">
                    <span className="text-zinc-500">Impacto simulado:</span>
                    {candidate.impacts.militaryDelta !== 0 && (
                      <span className={candidate.impacts.militaryDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        MIL {candidate.impacts.militaryDelta > 0 ? `+${candidate.impacts.militaryDelta}` : candidate.impacts.militaryDelta}
                      </span>
                    )}
                    {candidate.impacts.stabilityDelta !== 0 && (
                      <span className={candidate.impacts.stabilityDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        EST {candidate.impacts.stabilityDelta > 0 ? `+${candidate.impacts.stabilityDelta}` : candidate.impacts.stabilityDelta}
                      </span>
                    )}
                    {candidate.impacts.currencyDelta !== 0 && (
                      <span className={candidate.impacts.currencyDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        DIV {candidate.impacts.currencyDelta > 0 ? `+${candidate.impacts.currencyDelta}` : candidate.impacts.currencyDelta}
                      </span>
                    )}
                    {candidate.impacts.tradeDelta !== 0 && (
                      <span className={candidate.impacts.tradeDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        COM {candidate.impacts.tradeDelta > 0 ? `+${candidate.impacts.tradeDelta}` : candidate.impacts.tradeDelta}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
