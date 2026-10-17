'use client';

import React from 'react';
import { TechDimensionDossier } from '@/lib/types/sovereign-power';
import { Cpu, Award, Zap, Layers, Server, Microchip } from 'lucide-react';

interface TechInnovationPanelProps {
  dossier: TechDimensionDossier;
}

export const TechInnovationPanel: React.FC<TechInnovationPanelProps> = ({ dossier }) => {
  const { subsectors } = dossier;

  return (
    <div className="space-y-3 font-mono">
      {/* ── Summary & Macro R&D Metrics ── */}
      <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold uppercase text-zinc-300">
              Pilar Tecnológico & Capacidades Críticas
            </span>
          </div>
          <span className="text-xs font-black text-teal-400">
            {dossier.score} / 100
          </span>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed font-sans">
          {dossier.summary}
        </p>

        {/* Global Patent & R&D Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-800/80 text-[10px]">
          {dossier.wipoPatentRank && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 text-teal-300 border border-zinc-800">
              <Award className="w-3 h-3 text-amber-400" />
              Rank Patentes OMPI/WIPO: #{dossier.wipoPatentRank}
            </span>
          )}
          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 text-cyan-300 border border-zinc-800">
            <Zap className="w-3 h-3 text-cyan-400" />
            Gasto I+D: {dossier.rAndDPercentGdp}% PIB
          </span>
        </div>
      </div>

      {/* ── 5 Core Subsectors Breakdown ── */}
      <div className="space-y-2.5">
        {/* 1. Económico */}
        <div className="bg-zinc-900/70 p-3 rounded-lg border border-zinc-800 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-200 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              {subsectors.economic.label}
            </span>
            <span className="text-teal-400 font-black">{subsectors.economic.score}%</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded overflow-hidden">
            <div className="h-full bg-teal-400 transition-all" style={{ width: `${subsectors.economic.score}%` }} />
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {subsectors.economic.technologies.map((t, i) => (
              <span key={i} className="text-[9px] px-1.5 py-0.5 bg-zinc-800/80 text-zinc-300 rounded border border-zinc-700/60">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* 2. Industrial */}
        <div className="bg-zinc-900/70 p-3 rounded-lg border border-zinc-800 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-200 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              {subsectors.industrial.label}
            </span>
            <span className="text-teal-400 font-black">{subsectors.industrial.score}%</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded overflow-hidden">
            <div className="h-full bg-teal-400 transition-all" style={{ width: `${subsectors.industrial.score}%` }} />
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {subsectors.industrial.technologies.map((t, i) => (
              <span key={i} className="text-[9px] px-1.5 py-0.5 bg-zinc-800/80 text-zinc-300 rounded border border-zinc-700/60">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* 3. Militar */}
        <div className="bg-zinc-900/70 p-3 rounded-lg border border-zinc-800 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-200 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              {subsectors.military.label}
            </span>
            <span className="text-sky-400 font-black">{subsectors.military.score}%</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded overflow-hidden">
            <div className="h-full bg-sky-400 transition-all" style={{ width: `${subsectors.military.score}%` }} />
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {subsectors.military.technologies.map((t, i) => (
              <span key={i} className="text-[9px] px-1.5 py-0.5 bg-sky-950/40 text-sky-300 rounded border border-sky-800/50">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* 4. Semiconductores */}
        <div className="bg-zinc-900/70 p-3 rounded-lg border border-zinc-800 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-200 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              {subsectors.semiconductors.label}
            </span>
            <span className="text-cyan-400 font-black">{subsectors.semiconductors.score}%</span>
          </div>
          <p className="text-[10px] text-cyan-300">
            Nodo doméstico: <strong className="text-white font-mono">{subsectors.semiconductors.fabricationNode}</strong>
          </p>
          <div className="h-1.5 bg-zinc-800 rounded overflow-hidden">
            <div className="h-full bg-cyan-400 transition-all" style={{ width: `${subsectors.semiconductors.score}%` }} />
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {subsectors.semiconductors.capabilities.map((c, i) => (
              <span key={i} className="text-[9px] px-1.5 py-0.5 bg-cyan-950/40 text-cyan-300 border border-cyan-800/40 rounded">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* 5. Inteligencia Artificial */}
        <div className="bg-zinc-900/70 p-3 rounded-lg border border-zinc-800 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-200 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              {subsectors.artificialIntelligence.label}
            </span>
            <span className="text-purple-400 font-black">{subsectors.artificialIntelligence.score}%</span>
          </div>
          <p className="text-[10px] text-purple-300">
            Capacidad: <strong className="text-white font-mono">{subsectors.artificialIntelligence.computeTier}</strong>
          </p>
          <div className="h-1.5 bg-zinc-800 rounded overflow-hidden">
            <div className="h-full bg-purple-400 transition-all" style={{ width: `${subsectors.artificialIntelligence.score}%` }} />
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {subsectors.artificialIntelligence.models.map((m, i) => (
              <span key={i} className="text-[9px] px-1.5 py-0.5 bg-purple-950/40 text-purple-300 border border-purple-800/40 rounded">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
