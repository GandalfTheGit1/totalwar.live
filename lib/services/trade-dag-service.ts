/**
 * lib/services/trade-dag-service.ts
 *
 * Facade del Motor de Modelado de Grafos Acíclicos Dirigidos (DAG) de Comercio,
 * Nodos Terminales (End Nodes), Nodos Intermedios Comoditizados (Pass-Through)
 * y Simulación de Riesgo de Desvío Comercial (Trade Steering).
 *
 * Preserva 100% retrocompatibilidad con las suites de prueba y componentes UI.
 */

import {
  getSemiconductorAiDag,
  getEvBatteryDag,
  getBioPharmaDag,
  getLuxuryGoodsDag,
  getTradeDagForCountry
} from '@/lib/data/trade-dag-archetypes';

import { validateAcyclicity, classifyNodes } from './trade-dag/acyclicity-validator';
import { calculateMetrics } from './trade-dag/metrics-calculator';
import { analyzeTradeDag } from './trade-dag/dag-analyzer';
import { simulateTradeSteeringShock } from './trade-dag/steering-simulator';
import {
  TradeNodeType,
  MoatClassification,
  TradeNode,
  TradeEdge,
  TradeDagGraph,
  NodeMetrics,
  TradeDagMetrics,
  TradeDagAnalysisResult,
  TradeSteeringSimulationResult
} from './trade-dag/types';

// Re-exportar tipos para los consumidores directos
export type {
  TradeNodeType,
  MoatClassification,
  TradeNode,
  TradeEdge,
  TradeDagGraph,
  NodeMetrics,
  TradeDagMetrics,
  TradeDagAnalysisResult,
  TradeSteeringSimulationResult
};

// Re-exportar funciones puras para modularidad avanzada
export {
  validateAcyclicity,
  classifyNodes,
  calculateMetrics,
  analyzeTradeDag,
  simulateTradeSteeringShock
};

export class TradeDagService {
  /**
   * Valida si un grafo dirigido es estrictamente acíclico (DAG) usando el algoritmo de Kahn
   * y detecta las rutas cíclicas en caso de existir mediante búsqueda en profundidad (DFS).
   */
  static validateAcyclicity(graph: TradeDagGraph): {
    isAcyclic: boolean;
    cycles: string[][];
    topologicalOrder: string[];
  } {
    return validateAcyclicity(graph);
  }

  /**
   * Clasifica automáticamente los nodos en ORIGIN, PASS_THROUGH o END_NODE
   * en función de la topología y de sus características económicas.
   */
  static classifyNodes(nodes: Partial<TradeNode>[], edges: TradeEdge[]): TradeNodeType[] {
    return classifyNodes(nodes, edges);
  }

  /**
   * Calcula las métricas analíticas cuantitativas del Trade DAG.
   */
  static calculateMetrics(graph: TradeDagGraph): TradeDagMetrics {
    return calculateMetrics(graph);
  }

  /**
   * Ejecuta el análisis completo del DAG y produce veredictos ejecutivos.
   */
  static analyzeTradeDag(graph: TradeDagGraph): TradeDagAnalysisResult {
    return analyzeTradeDag(graph);
  }

  /**
   * Simula un shock de Trade Steering: desvía un porcentaje de flujo (bypass)
   * de un nodo intermedio objetivo hacia rutas alternativas o directo a End Nodes.
   */
  static simulateTradeSteeringShock(
    graph: TradeDagGraph,
    targetNodeId: string,
    bypassPercentage: number
  ): TradeSteeringSimulationResult {
    return simulateTradeSteeringShock(graph, targetNodeId, bypassPercentage);
  }

  // ─── ARQUETIPOS DE DAG INDUSTRIALES CALIBRADOS ──────────────────────────────

  static getSemiconductorAiDag(): TradeDagGraph {
    return getSemiconductorAiDag();
  }

  static getEvBatteryDag(): TradeDagGraph {
    return getEvBatteryDag();
  }

  static getBioPharmaDag(): TradeDagGraph {
    return getBioPharmaDag();
  }

  static getLuxuryGoodsDag(): TradeDagGraph {
    return getLuxuryGoodsDag();
  }

  static getTradeDagForCountry(countryIso: string): TradeDagGraph {
    return getTradeDagForCountry(countryIso);
  }
}
