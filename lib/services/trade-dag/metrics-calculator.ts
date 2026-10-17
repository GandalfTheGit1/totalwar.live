/**
 * lib/services/trade-dag/metrics-calculator.ts
 *
 * Quantitative economic flow, margin drain, and FCF capture metrics
 * for the Trade DAG engine.
 */

import {
  computeFlowAccumulation,
  computeMarginAndFcfSums,
  FlowAccumulation,
  getEmptyMetrics,
  MarginAndFcfSums,
  resolveNodeThroughput
} from './flow-accumulator';
import { NodeMetrics, TradeDagGraph, TradeDagMetrics, TradeNode } from './types';

export { resolveNodeThroughput };

/**
 * Calcula vulnerabilidad a Trade Steering (0 a 100).
 */
export function computeTradeSteeringVulnerability(node: TradeNode): number {
  const raw = (
    0.40 * (node.substitutability ?? 0.5) +
    0.30 * (1 - Math.min(100, Math.max(0, node.moatScore ?? 0)) / 100) +
    0.20 * (1 - Math.min(100, Math.max(0, node.switchingCost ?? 0)) / 100) +
    0.10 * (1 - Math.min(100, Math.max(0, node.pricingPower ?? 0)) / 100)
  ) * 100;
  return Math.min(100, Math.max(0, Math.round(raw * 10) / 10));
}

/**
 * Calcula criticidad de cuello de botella / chokepoint (0 a 100).
 */
export function computeChokepointCriticality(
  node: TradeNode,
  throughput: number,
  totalEconomicFlow: number
): number {
  const isIntermediate = node.type === 'PASS_THROUGH';
  const flowShare = (totalEconomicFlow > 0 && Number.isFinite(throughput)) ? throughput / (totalEconomicFlow * 0.5) : 0.5;
  const chokepointBoost = node.isChokepoint ? 1.25 : 1.0;
  const rawChokepoint = isIntermediate
    ? (1 - (node.substitutability ?? 0.5)) * Math.min(1.0, flowShare) * ((node.moatScore ?? 0) / 100) * chokepointBoost * 100
    : (node.isChokepoint ? 75 : 0);

  return Math.min(100, Math.max(0, Math.round(rawChokepoint * 10) / 10));
}

/**
 * Determina la factibilidad de bypass de un nodo.
 */
function resolveBypassFeasibility(
  nodeType: string,
  vulnerability: number
): 'HIGH' | 'MEDIUM' | 'LOW' | 'PROTECTED' {
  if (nodeType === 'END_NODE') return 'PROTECTED';
  if (vulnerability >= 65) return 'HIGH';
  if (vulnerability >= 40) return 'MEDIUM';
  return 'LOW';
}

/**
 * Construye el objeto NodeMetrics para un nodo individual.
 */
function buildSingleNodeMetric(
  node: TradeNode,
  inflow: number,
  outflow: number,
  throughput: number,
  sums: MarginAndFcfSums,
  flows: FlowAccumulation
): {
  metric: NodeMetrics;
  vulnerability: number;
  criticality: number;
  bypass: 'HIGH' | 'MEDIUM' | 'LOW' | 'PROTECTED';
} {
  const netMarginValue = Math.max(0, throughput * node.operatingMargin);
  const marginSharePct = sums.totalMarginPool > 0 ? (netMarginValue / sums.totalMarginPool) * 100 : 0;
  const fcfSharePct = sums.totalPositiveFcf > 0 ? (Math.max(0, node.fcf) / sums.totalPositiveFcf) * 100 : 0;
  const vulnerability = computeTradeSteeringVulnerability(node);
  const criticality = computeChokepointCriticality(node, throughput, flows.totalEconomicFlow);
  const bypass = resolveBypassFeasibility(node.type, vulnerability);

  return {
    metric: {
      nodeId: node.id,
      name: node.name,
      type: node.type,
      inflow,
      outflow,
      throughput,
      netMarginValue,
      marginSharePct: Math.round(marginSharePct * 10) / 10,
      fcfSharePct: Math.round(fcfSharePct * 10) / 10,
      tradeSteeringVulnerability: vulnerability,
      chokepointCriticality: criticality,
      bypassFeasibility: bypass
    },
    vulnerability,
    criticality,
    bypass
  };
}

/**
 * Ensambla las métricas detalladas por nodo.
 */
function assembleNodeMetrics(
  nodes: TradeNode[],
  flows: FlowAccumulation,
  sums: MarginAndFcfSums
) {
  const nodeMetrics: Record<string, NodeMetrics> = {};
  const identifiedChokepoints: string[] = [];
  const vulnerablePassThroughNodes: string[] = [];
  let weightedSteeringSum = 0;
  let totalPassThroughThroughput = 0;
  let maxChokepointCriticality = 0;

  nodes.forEach(node => {
    const inflow = flows.nodeInflow.get(node.id) || 0;
    const outflow = flows.nodeOutflow.get(node.id) || 0;
    const throughput = resolveNodeThroughput(node, inflow, outflow);
    const { metric, vulnerability, criticality, bypass } = buildSingleNodeMetric(node, inflow, outflow, throughput, sums, flows);

    if (criticality > maxChokepointCriticality && node.type === 'PASS_THROUGH') {
      maxChokepointCriticality = criticality;
    }
    if ((node.isChokepoint || (node.type === 'PASS_THROUGH' && criticality >= 60)) && !identifiedChokepoints.includes(node.id)) {
      identifiedChokepoints.push(node.id);
    }
    if (bypass === 'HIGH') vulnerablePassThroughNodes.push(node.id);
    if (node.type === 'PASS_THROUGH') {
      weightedSteeringSum += throughput * vulnerability;
      totalPassThroughThroughput += throughput;
    }
    nodeMetrics[node.id] = metric;
  });

  return {
    nodeMetrics,
    identifiedChokepoints,
    vulnerablePassThroughNodes,
    weightedSteeringSum,
    totalPassThroughThroughput,
    maxChokepointCriticality
  };
}

/**
 * Calcula las métricas analíticas cuantitativas del Trade DAG.
 */
export function calculateMetrics(graph: TradeDagGraph): TradeDagMetrics {
  if (!graph.nodes || graph.nodes.length === 0) {
    return getEmptyMetrics();
  }

  const flows = computeFlowAccumulation(graph.nodes, graph.edges);
  const sums = computeMarginAndFcfSums(graph.nodes, flows.nodeInflow, flows.nodeOutflow);
  const nodeAssembly = assembleNodeMetrics(graph.nodes, flows, sums);

  const marginDrainPercentage = sums.totalMarginPool > 0
    ? Math.round((sums.passThroughMarginSum / sums.totalMarginPool) * 1000) / 10
    : 0;

  const fcfCaptureRatio = sums.totalPositiveFcf > 0
    ? Math.round((sums.endNodeFcfSum / sums.totalPositiveFcf) * 1000) / 1000
    : (sums.totalMarginPool > 0 ? Math.round((sums.endNodeMarginSum / sums.totalMarginPool) * 1000) / 1000 : 0);

  const tradeSteeringRisk = nodeAssembly.totalPassThroughThroughput > 0
    ? Math.round((nodeAssembly.weightedSteeringSum / nodeAssembly.totalPassThroughThroughput) * 10) / 10
    : 0;

  const chokepointExposure = Math.min(100, Math.max(0, Math.round(nodeAssembly.maxChokepointCriticality * 10) / 10));

  return {
    marginDrainPercentage,
    fcfCaptureRatio,
    tradeSteeringRisk,
    chokepointExposure,
    totalEconomicFlow: flows.totalEconomicFlow,
    totalMarginPool: Math.round(sums.totalMarginPool * 10) / 10,
    originMarginShare: sums.totalMarginPool > 0 ? Math.round((sums.originMarginSum / sums.totalMarginPool) * 1000) / 10 : 0,
    passThroughMarginShare: marginDrainPercentage,
    endNodeMarginShare: sums.totalMarginPool > 0 ? Math.round((sums.endNodeMarginSum / sums.totalMarginPool) * 1000) / 10 : 0,
    nodeMetrics: nodeAssembly.nodeMetrics,
    identifiedChokepoints: nodeAssembly.identifiedChokepoints,
    vulnerablePassThroughNodes: nodeAssembly.vulnerablePassThroughNodes,
    dominantEndNodes: sums.dominantEndNodes
  };
}
