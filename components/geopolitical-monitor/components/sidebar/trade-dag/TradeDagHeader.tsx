'use client';

import React from 'react';
import {
  GitFork,
  Sliders,
  Globe,
  Cpu,
  Car,
  Pill,
  Sparkles
} from 'lucide-react';
import type { ArchetypeKey } from './useTradeDagState';

interface TradeDagHeaderProps {
  isSimulatorOpen: boolean;
  onToggleSimulator: () => void;
  activeArchetype: ArchetypeKey;
  onSelectArchetype: (archetype: ArchetypeKey) => void;
  effectiveCountryCode: string;
  effectiveCountryName: string;
}

function TradeDagTitleBar({
  isSimulatorOpen,
  onToggleSimulator
}: {
  isSimulatorOpen: boolean;
  onToggleSimulator: () => void;
}) {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-zinc-700/60">
      <div>
        <div className="flex items-center gap-2">
          <GitFork className="w-4 h-4 text-teal-400" />
          <h3 className="text-sm font-bold text-zinc-100 font-mono tracking-tight">
            DAG de Comercio &amp; Trade Steering
          </h3>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-950/60 text-teal-300 border border-teal-500/30 font-bold">
            T03.11
          </span>
        </div>
        <p className="text-xs text-zinc-400 mt-0.5">
          End Nodes protegidos vs Nodos de paso comoditizados
        </p>
      </div>
      <button
        type="button"
        onClick={onToggleSimulator}
        className={`flex items-center gap-1.5 px-2 py-1 text-xs font-mono font-medium rounded border transition-all cursor-pointer ${
          isSimulatorOpen
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
            : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-700 hover:border-zinc-600'
        }`}
        title="Alternar simulador de Trade Steering Shock"
      >
        <Sliders className="w-3.5 h-3.5" />
        <span>Simulador</span>
      </button>
    </div>
  );
}

function ArchetypeSelector({
  activeArchetype,
  onSelectArchetype,
  effectiveCountryCode,
  effectiveCountryName
}: {
  activeArchetype: ArchetypeKey;
  onSelectArchetype: (archetype: ArchetypeKey) => void;
  effectiveCountryCode: string;
  effectiveCountryName: string;
}) {
  const archetypes = [
    { key: 'country' as const, label: `${effectiveCountryCode} (${effectiveCountryName.slice(0, 10)})`, icon: Globe, color: 'text-teal-400' },
    { key: 'semiconductors' as const, label: 'Semiconductores IA', icon: Cpu, color: 'text-sky-400' },
    { key: 'ev' as const, label: 'Baterías EV', icon: Car, color: 'text-emerald-400' },
    { key: 'biopharma' as const, label: 'Biofarma', icon: Pill, color: 'text-rose-400' },
    { key: 'luxury' as const, label: 'Lujo', icon: Sparkles, color: 'text-amber-400' },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
      {archetypes.map((arch) => {
        const Icon = arch.icon;
        const isActive = activeArchetype === arch.key;
        return (
          <button
            key={arch.key}
            type="button"
            onClick={() => onSelectArchetype(arch.key)}
            className={`px-2 py-1 text-[11px] font-mono rounded flex items-center gap-1 shrink-0 cursor-pointer border transition-all ${
              isActive
                ? 'bg-teal-500/20 text-teal-300 border-teal-400 font-bold shadow-[0_0_8px_rgba(20,184,166,0.25)]'
                : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <Icon className={`w-3 h-3 ${arch.color}`} />
            <span>{arch.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function TradeDagHeader({
  isSimulatorOpen,
  onToggleSimulator,
  activeArchetype,
  onSelectArchetype,
  effectiveCountryCode,
  effectiveCountryName
}: TradeDagHeaderProps) {
  return (
    <>
      <TradeDagTitleBar
        isSimulatorOpen={isSimulatorOpen}
        onToggleSimulator={onToggleSimulator}
      />
      <ArchetypeSelector
        activeArchetype={activeArchetype}
        onSelectArchetype={onSelectArchetype}
        effectiveCountryCode={effectiveCountryCode}
        effectiveCountryName={effectiveCountryName}
      />
    </>
  );
}
