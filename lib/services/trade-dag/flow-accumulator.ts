/**
 * lib/services/trade-dag/flow-accumulator.ts
 *
 * Flow accumulation and margin/FCF pool aggregation for Trade DAGs.
 */

import { TradeDagMetrics, TradeEdge, TradeNode } from './types';

export interface FlowAccumulation {
  nodeInflow: Map<string, number>;
  nodeOutflow: Map<string, number>;
  totalEconomicFlow: number;
}

export interface MarginAndFcfSums {
  totalMarginPool: number;
  originMarginSum: number;
  passThroughMarginSum: number;
  endNodeMarginSum: number;
  totalPositiveFcf: number;
  endNodeFcfSum: number;
  dominantEndNodes: string[];
}

/**
 * Retorna la estructura de métricas para un grafo vacío.
 */
export function getEmptyMetrics(): TradeDagMetrics {
  return {
    marginDrainPercentage: 0,
    fcfCaptureRatio: 0,
    tradeSteeringRisk: 0,
    chokepointExposure: 0,
    totalEconomicFlow: 0,
    totalMarginPool: 0,
    originMarginShare: 0,
    passThroughMarginShare: 0,
    endNodeMarginShare: 0,
    nodeMetrics: {},
    identifiedChokepoints: [],
    vulnerablePassThroughNodes: [],
    dominantEndNodes: []
  };
}

/**
 * Acumula flujos entrantes, salientes y flujo económico agregado.
 */
export function computeFlowAccumulation(nodes: TradeNode[], edges: TradeEdge[]): FlowAccumulation {
  const nodeInflow = new Map<string, number>();
  const nodeOutflow = new Map<string, number>();
  let totalEconomicFlow = 0;

  nodes.forEach(n => {
    nodeInflow.set(n.id, 0);
    nodeOutflow.set(n.id, 0);
  });

  edges.forEach(edge => {
    totalEconomicFlow += edge.flowValue;
    if (nodeOutflow.has(edge.source)) {
      nodeOutflow.set(edge.source, (nodeOutflow.get(edge.source) || 0) + edge.flowValue);
    }
    if (nodeInflow.has(edge.target)) {
      nodeInflow.set(edge.target, (nodeInflow.get(edge.target) || 0) + edge.flowValue);
    }
  });

  return { nodeInflow, nodeOutflow, totalEconomicFlow };
}

/**
 * Calcula throughput económico de un nodo.
 */
export function resolveNodeThroughput(node: TradeNode, inflow: number, outflow: number): number {
  return node.revenue > 0 ? node.revenue : Math.max(inflow, outflow, 1.0);
}

/**
 * Agrega sumas de márgenes y flujo libre de caja por tipo de nodo.
 */
export function computeMarginAndFcfSums(
  nodes: TradeNode[],
  nodeInflow: Map<string, number>,
  nodeOutflow: Map<string, number>
): MarginAndFcfSums {
  let totalMarginPool = 0;
  let originMarginSum = 0;
  let passThroughMarginSum = 0;
  let endNodeMarginSum = 0;
  let totalPositiveFcf = 0;
  let endNodeFcfSum = 0;
  const dominantEndNodes: string[] = [];

  nodes.forEach(node => {
    const inflow = nodeInflow.get(node.id) || 0;
    const outflow = nodeOutflow.get(node.id) || 0;
    const throughput = resolveNodeThroughput(node, inflow, outflow);
    const netMarginValue = Math.max(0, throughput * node.operatingMargin);

    totalMarginPool += netMarginValue;
    if (node.type === 'ORIGIN') originMarginSum += netMarginValue;
    else if (node.type === 'PASS_THROUGH') passThroughMarginSum += netMarginValue;
    else if (node.type === 'END_NODE') endNodeMarginSum += netMarginValue;

    const positiveFcf = Math.max(0, node.fcf);
    totalPositiveFcf += positiveFcf;
    if (node.type === 'END_NODE') {
      endNodeFcfSum += positiveFcf;
      if (node.moatScore >= 70 && node.pricingPower >= 70) {
        dominantEndNodes.push(node.id);
      }
    }
  });

  return {
    totalMarginPool,
    originMarginSum,
    passThroughMarginSum,
    endNodeMarginSum,
    totalPositiveFcf,
    endNodeFcfSum,
    dominantEndNodes
  };
}
