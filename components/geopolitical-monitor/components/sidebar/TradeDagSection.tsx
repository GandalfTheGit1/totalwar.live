'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { TradeDagSimulationDrawer } from './trade-dag/TradeDagSimulationDrawer';
import { TradeDagNodeList } from './trade-dag/TradeDagNodeList';
import { useTradeDagState } from './trade-dag/useTradeDagState';
import { TradeDagHeader } from './trade-dag/TradeDagHeader';
import { TradeDagMetricsGrid } from './trade-dag/TradeDagMetricsGrid';
import { TradeDagDiagnosis } from './trade-dag/TradeDagDiagnosis';

export interface TradeDagSectionProps {
  countryCode?: string;
  countryName?: string;
}

function TradeDagErrorNotice({ error }: { error: string }) {
  return (
    <div className="bg-rose-950/40 p-4 rounded-xl border border-rose-500/40 shadow-lg text-rose-200">
      <div className="flex items-center gap-2 mb-2 font-bold font-mono text-sm text-rose-400">
        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
        Fallo de Validación DAG de Comercio
      </div>
      <p className="text-xs font-mono text-rose-300/90 leading-relaxed bg-zinc-950/70 p-3 rounded border border-rose-900/50">
        {error}
      </p>
    </div>
  );
}

function TradeDagMainContent({
  state,
  analysis
}: {
  state: ReturnType<typeof useTradeDagState>;
  analysis: NonNullable<ReturnType<typeof useTradeDagState>['analysisResult']['data']>;
}) {
  return (
    <div className="bg-zinc-850/80 p-4 rounded-xl border border-teal-500/25 shadow-lg space-y-4">
      <TradeDagHeader
        isSimulatorOpen={state.isSimulatorOpen}
        onToggleSimulator={() => state.setIsSimulatorOpen((prev) => !prev)}
        activeArchetype={state.activeArchetype}
        onSelectArchetype={state.setActiveArchetype}
        effectiveCountryCode={state.effectiveCountryCode}
        effectiveCountryName={state.effectiveCountryName}
      />

      <TradeDagMetricsGrid metrics={analysis.metrics} />
      <TradeDagDiagnosis analysis={analysis} />

      {state.simulationError && state.isSimulatorOpen && (
        <div className="bg-rose-950/60 p-3 rounded-lg border border-rose-500/50 text-rose-200 text-xs font-mono flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Fallo en la simulación: {state.simulationError}</span>
        </div>
      )}

      <TradeDagSimulationDrawer
        isOpen={state.isSimulatorOpen}
        passThroughNodes={state.passThroughNodes}
        effectiveSimTargetId={state.effectiveSimTargetId}
        onSelectTargetNodeId={state.setSimTargetNodeId}
        simBypassPct={state.simBypassPct}
        onChangeBypassPct={state.setSimBypassPct}
        simulationResult={state.simulationResult}
      />

      <TradeDagNodeList
        nodes={state.currentGraph.nodes}
        metrics={analysis.metrics}
      />
    </div>
  );
}

export function TradeDagSection({
  countryCode = 'US',
  countryName = 'Estados Unidos',
}: TradeDagSectionProps) {
  const state = useTradeDagState({ countryCode, countryName });

  if (state.analysisResult.error) {
    return <TradeDagErrorNotice error={state.analysisResult.error} />;
  }

  const analysis = state.analysisResult.data;
  if (!analysis?.metrics) return null;

  return <TradeDagMainContent state={state} analysis={analysis} />;
}
