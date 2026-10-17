/**
 * lib/services/trade-dag/steering-simulator.ts
 *
 * Simulación de shocks de Trade Steering (desvío / bypass comercial),
 * compresión de margen operativo y reasignación de flujos económicos.
 */

import { analyzeTradeDag } from './dag-analyzer';
import { calculateMetrics } from './metrics-calculator';
import { TradeDagGraph, TradeDagMetrics, TradeNode, TradeSteeringSimulationResult } from './types';

/**
 * Ajusta ingresos, margen operativo y flujo libre de caja del nodo bypassado.
 */
function applyBypassToNode(
  clonedTarget: TradeNode,
  divertedFlowValue: number,
  clampedBypass: number
): void {
  const marginCompressionFactor = 1.0 - (clampedBypass * 0.40);
  clonedTarget.revenue = Math.max(0, clonedTarget.revenue - divertedFlowValue);
  clonedTarget.operatingMargin = Math.max(0.005, clonedTarget.operatingMargin * marginCompressionFactor);

  if (clonedTarget.fcf >= 0) {
    clonedTarget.fcf = Math.max(0, clonedTarget.fcf * (1.0 - clampedBypass * 1.3));
  } else {
    clonedTarget.fcf = clonedTarget.fcf * (1.0 + clampedBypass * 0.5);
  }
}

/**
 * Reasigna el flujo comercial desviado hacia rutas upstream alternativas en paralelo.
 */
function rerouteAlternativeFlows(
  clonedGraph: TradeDagGraph,
  targetNodeId: string,
  divertedFlowValue: number,
  clampedBypass: number
): void {
  clonedGraph.edges.forEach(edge => {
    if (edge.source === targetNodeId || edge.target === targetNodeId) {
      edge.flowValue = Math.max(0, edge.flowValue * (1 - clampedBypass));
    }
  });

  const upstreamSources = clonedGraph.edges
    .filter(e => e.target === targetNodeId)
    .map(e => e.source);

  const alternativeEdges = clonedGraph.edges.filter(
    e => upstreamSources.includes(e.source) && e.target !== targetNodeId
  );

  if (alternativeEdges.length > 0 && divertedFlowValue > 0) {
    const addedPerEdge = Math.round((divertedFlowValue / alternativeEdges.length) * 10) / 10;
    alternativeEdges.forEach(e => {
      e.flowValue = Math.round((e.flowValue + addedPerEdge) * 10) / 10;
    });
  }
}

/**
 * Construye la narrativa de impacto económico y calcula las diferencias (deltas).
 */
function computeDeltasAndNarrative(
  targetNodeName: string,
  targetNodeId: string,
  clampedBypass: number,
  divertedFlowValue: number,
  preMetrics: TradeDagMetrics,
  postMetrics: TradeDagMetrics
) {
  const marginDrainDeltaPct = Math.round((postMetrics.marginDrainPercentage - preMetrics.marginDrainPercentage) * 10) / 10;
  const fcfCaptureRatioDelta = Math.round((postMetrics.fcfCaptureRatio - preMetrics.fcfCaptureRatio) * 1000) / 1000;
  const tradeSteeringRiskDelta = Math.round((postMetrics.tradeSteeringRisk - preMetrics.tradeSteeringRisk) * 10) / 10;
  const targetNodeMarginLoss = Math.round((
    (preMetrics.nodeMetrics[targetNodeId]?.netMarginValue || 0) -
    (postMetrics.nodeMetrics[targetNodeId]?.netMarginValue || 0)
  ) * 10) / 10;

  const sign = marginDrainDeltaPct >= 0 ? '+' : '';
  const narrative = `Al desviar el ${(clampedBypass * 100).toFixed(0)}% del flujo comercial ($${divertedFlowValue}M) alrededor de ${targetNodeName}, su margen neto sufre una merma de $${targetNodeMarginLoss}M. El drenaje global de margen en intermediarios varía un ${sign}${marginDrainDeltaPct}%, y la ratio de captura de FCF en Nodos Terminales protegidos se sitúa en ${(postMetrics.fcfCaptureRatio * 100).toFixed(1)}%.`;

  return {
    deltas: {
      marginDrainDeltaPct,
      fcfCaptureRatioDelta,
      tradeSteeringRiskDelta,
      targetNodeMarginLoss
    },
    narrative
  };
}

/**
 * Simula un shock de Trade Steering: desvía un porcentaje de flujo (bypass)
 * de un nodo intermedio objetivo hacia rutas alternativas o directo a End Nodes,
 * calculando la compresión de margen resultante y la reconfiguración de la red.
 */
export function simulateTradeSteeringShock(
  graph: TradeDagGraph,
  targetNodeId: string,
  bypassPercentage: number
): TradeSteeringSimulationResult {
  const rawBypass = Number.isFinite(bypassPercentage) ? bypassPercentage : 0;
  const clampedBypass = Math.max(0, Math.min(100, rawBypass)) / 100;
  const preAnalysis = analyzeTradeDag(graph);
  const preMetrics = preAnalysis.metrics;

  const targetNode = graph.nodes.find(n => n.id === targetNodeId);
  if (!targetNode) {
    throw new Error(`[TradeDagService] Nodo objetivo no encontrado para simulación: ${targetNodeId}`);
  }

  const clonedGraph: TradeDagGraph = JSON.parse(JSON.stringify(graph));
  const clonedTarget = clonedGraph.nodes.find(n => n.id === targetNodeId)!;

  const targetInflow = preMetrics.nodeMetrics[targetNodeId]?.inflow || clonedTarget.revenue;
  const divertedFlowValue = Math.round(targetInflow * clampedBypass * 10) / 10;

  applyBypassToNode(clonedTarget, divertedFlowValue, clampedBypass);
  rerouteAlternativeFlows(clonedGraph, targetNodeId, divertedFlowValue, clampedBypass);

  const postMetrics = calculateMetrics(clonedGraph);
  const { deltas, narrative } = computeDeltasAndNarrative(
    targetNode.name,
    targetNodeId,
    clampedBypass,
    divertedFlowValue,
    preMetrics,
    postMetrics
  );

  return {
    targetNodeId,
    targetNodeName: targetNode.name,
    bypassPercentage: Math.round(clampedBypass * 100),
    divertedFlowValue,
    preMetrics,
    postMetrics,
    deltas,
    impactNarrative: narrative
  };
}
