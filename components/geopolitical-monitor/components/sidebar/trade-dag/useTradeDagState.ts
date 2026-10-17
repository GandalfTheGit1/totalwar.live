'use client';

import { useState, useMemo } from 'react';
import {
  TradeDagService,
  TradeDagGraph,
  TradeDagAnalysisResult
} from '@/lib/services/trade-dag-service';

export type ArchetypeKey = 'country' | 'semiconductors' | 'ev' | 'biopharma' | 'luxury';

export interface UseTradeDagStateParams {
  countryCode?: string;
  countryName?: string;
}

function resolveTradeDagGraph(activeArchetype: ArchetypeKey, effectiveCountryCode: string): TradeDagGraph {
  switch (activeArchetype) {
    case 'semiconductors':
      return TradeDagService.getSemiconductorAiDag();
    case 'ev':
      return TradeDagService.getEvBatteryDag();
    case 'biopharma':
      return TradeDagService.getBioPharmaDag();
    case 'luxury':
      return TradeDagService.getLuxuryGoodsDag();
    case 'country':
    default:
      return TradeDagService.getTradeDagForCountry(effectiveCountryCode);
  }
}

function runSteeringSimulation(
  graph: TradeDagGraph,
  targetId: string,
  bypassPct: number
) {
  try {
    const res = TradeDagService.simulateTradeSteeringShock(graph, targetId, bypassPct);
    return { simulationResult: res, simulationError: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error en la ejecución de la simulación de Trade Steering Shock';
    console.error('[TradeDagSection] Fallo en simulación de Trade Steering Shock:', err);
    return { simulationResult: null, simulationError: message };
  }
}

function useTradeDagSimulation(
  currentGraph: TradeDagGraph,
  analysisData: TradeDagAnalysisResult | null,
  simTargetNodeId: string,
  simBypassPct: number
) {
  const passThroughNodes = useMemo(
    () => currentGraph.nodes.filter((n) => n.type === 'PASS_THROUGH'),
    [currentGraph]
  );

  const effectiveSimTargetId = useMemo(() => {
    if (simTargetNodeId && passThroughNodes.some((n) => n.id === simTargetNodeId)) {
      return simTargetNodeId;
    }
    return passThroughNodes[0]?.id || currentGraph.nodes[0]?.id || '';
  }, [simTargetNodeId, passThroughNodes, currentGraph]);

  const { simulationResult, simulationError } = useMemo(() => {
    if (!analysisData || !effectiveSimTargetId || passThroughNodes.length === 0) {
      return { simulationResult: null, simulationError: null };
    }
    return runSteeringSimulation(currentGraph, effectiveSimTargetId, simBypassPct);
  }, [analysisData, currentGraph, effectiveSimTargetId, simBypassPct, passThroughNodes]);

  return { passThroughNodes, effectiveSimTargetId, simulationResult, simulationError };
}

export function useTradeDagState({
  countryCode = 'US',
  countryName = 'Estados Unidos'
}: UseTradeDagStateParams) {
  const effectiveCountryCode = (countryCode && countryCode.trim()) ? countryCode.trim().toUpperCase() : 'US';
  const effectiveCountryName = (countryName && countryName.trim()) ? countryName.trim() : 'Estados Unidos';

  const [activeArchetype, setActiveArchetype] = useState<ArchetypeKey>('country');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [simTargetNodeId, setSimTargetNodeId] = useState<string>('');
  const [simBypassPct, setSimBypassPct] = useState<number>(35);

  const currentGraph = useMemo(
    () => resolveTradeDagGraph(activeArchetype, effectiveCountryCode),
    [activeArchetype, effectiveCountryCode]
  );

  const analysisResult = useMemo<{ data: TradeDagAnalysisResult | null; error: string | null }>(() => {
    try {
      return { data: TradeDagService.analyzeTradeDag(currentGraph), error: null };
    } catch (err: unknown) {
      return { data: null, error: err instanceof Error ? err.message : 'Error desconocido al validar el grafo DAG.' };
    }
  }, [currentGraph]);

  const sim = useTradeDagSimulation(currentGraph, analysisResult.data, simTargetNodeId, simBypassPct);

  return {
    effectiveCountryCode,
    effectiveCountryName,
    activeArchetype,
    setActiveArchetype,
    isSimulatorOpen,
    setIsSimulatorOpen,
    simTargetNodeId,
    setSimTargetNodeId,
    simBypassPct,
    setSimBypassPct,
    currentGraph,
    analysisResult,
    ...sim
  };
}
