/**
 * lib/services/trade-dag/types.ts
 *
 * Domain contracts, graph representations, and metric definitions
 * for the Trade DAG and Economic Steering Engine.
 */

export type TradeNodeType = 'ORIGIN' | 'PASS_THROUGH' | 'END_NODE';

export type MoatClassification =
  | 'IP_PATENTS'
  | 'BRAND_MONOPOLY'
  | 'DISTRIBUTION_LOCK'
  | 'REGULATORY_EXCLUSIVE'
  | 'SCALE_CHOKEPOINT'
  | 'NONE_COMMODITIZED';

export interface TradeNode {
  id: string;
  name: string;
  type: TradeNodeType;
  countryCode: string; // ISO-2 (e.g. 'US', 'TW', 'CN', 'NL', 'DE', 'MX')
  industry: string;
  description?: string;
  operatingMargin: number; // e.g. 0.03 = 3%, 0.45 = 45%
  fcf: number; // Free Cash Flow anual en millones USD
  revenue: number; // Ingresos / Throughput económico en millones USD
  pricingPower: number; // 0 - 100: Capacidad de subir precios sin perder volumen
  moatScore: number; // 0 - 100: Fortaleza de barreras defensivas
  moatType: MoatClassification;
  substitutability: number; // 0.0 - 1.0: 1.0 = fácilmente reemplazable, 0.0 = insustituible
  switchingCost: number; // 0 - 100: Coste de cambiar a otro proveedor para clientes
  isChokepoint?: boolean; // Flag explícito de cuello de botella estratégico
}

export interface TradeEdge {
  id?: string;
  source: string; // Node ID
  target: string; // Node ID
  flowValue: number; // Flujo económico anual en millones USD
  goodsDescription?: string;
  tariffRisk?: number; // 0 - 100
  frictionScore?: number; // 0.0 - 10.0
  chokepointRisk?: boolean;
  alternativeRoutesCount?: number; // Cantidad de rutas alternativas existentes
}

export interface TradeDagGraph {
  id: string;
  name: string;
  description: string;
  sector: string;
  nodes: TradeNode[];
  edges: TradeEdge[];
}

export interface NodeMetrics {
  nodeId: string;
  name: string;
  type: TradeNodeType;
  inflow: number;
  outflow: number;
  throughput: number;
  netMarginValue: number; // throughput * operatingMargin
  marginSharePct: number; // % del pool de margen total
  fcfSharePct: number; // % del FCF positivo total del sistema
  tradeSteeringVulnerability: number; // 0 - 100
  chokepointCriticality: number; // 0 - 100
  bypassFeasibility: 'HIGH' | 'MEDIUM' | 'LOW' | 'PROTECTED';
}

export interface TradeDagMetrics {
  marginDrainPercentage: number; // % del margen total disipado en nodos intermedios comoditizados
  fcfCaptureRatio: number; // 0.0 - 1.0 (o %): proporción de FCF capturado por End Nodes
  tradeSteeringRisk: number; // 0 - 100: riesgo sistémico de desvío comercial
  chokepointExposure: number; // 0 - 100: concentración en cuellos de botella no sustituibles
  totalEconomicFlow: number; // Suma de valor de todos los enlaces
  totalMarginPool: number; // Suma de márgenes netos absolutos
  originMarginShare: number; // %
  passThroughMarginShare: number; // %
  endNodeMarginShare: number; // %
  nodeMetrics: Record<string, NodeMetrics>;
  identifiedChokepoints: string[];
  vulnerablePassThroughNodes: string[];
  dominantEndNodes: string[];
}

export interface TradeDagAnalysisResult {
  isAcyclic: boolean;
  cycles: string[][];
  topologicalOrder: string[];
  metrics: TradeDagMetrics;
  summary: {
    verdict: 'DOMINATED_BY_END_NODES' | 'BALANCED_CAPTURE' | 'COMMODITIZED_DRAIN_CRITICAL' | 'CHOKEPOINT_BOTTLENECK';
    keyVulnerability: string;
    tradeSteeringAssessment: string;
    fcfMoatAssessment: string;
  };
}

export interface TradeSteeringSimulationResult {
  targetNodeId: string;
  targetNodeName: string;
  bypassPercentage: number;
  divertedFlowValue: number;
  preMetrics: TradeDagMetrics;
  postMetrics: TradeDagMetrics;
  deltas: {
    marginDrainDeltaPct: number;
    fcfCaptureRatioDelta: number;
    tradeSteeringRiskDelta: number;
    targetNodeMarginLoss: number;
  };
  impactNarrative: string;
}
