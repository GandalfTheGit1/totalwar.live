/**
 * lib/services/trade-dag/acyclicity-validator.ts
 *
 * Algoritmos de validación topológica y aciclicidad (Kahn / DFS)
 * y clasificación automática de nodos para grafos de comercio.
 */

import { TradeDagGraph, TradeEdge, TradeNode, TradeNodeType } from './types';

/**
 * Valida la integridad estructural del grafo (identificadores duplicados y aristas huérfanas).
 */
export function validateGraphIntegrity(graph: TradeDagGraph): Set<string> {
  const seenNodeIds = new Set<string>();
  const duplicateIds = new Set<string>();

  for (const node of graph.nodes) {
    if (seenNodeIds.has(node.id)) {
      duplicateIds.add(node.id);
    }
    seenNodeIds.add(node.id);
  }

  if (duplicateIds.size > 0) {
    throw new Error(`[TradeDagService] Nodos duplicados detectados en el grafo: ${Array.from(duplicateIds).join(', ')}`);
  }

  const invalidEdges = graph.edges.filter(
    e => !seenNodeIds.has(e.source) || !seenNodeIds.has(e.target)
  );

  if (invalidEdges.length > 0) {
    const errorDetails = invalidEdges.map(e => `${e.source} ➔ ${e.target}`).join(', ');
    throw new Error(`[TradeDagService] Aristas inválidas detectadas con nodos inexistentes: ${errorDetails}`);
  }

  return seenNodeIds;
}

/**
 * Inicializa listas de adyacencia y mapa de grados de entrada.
 */
function buildGraphAdjacency(nodeIds: Set<string>, edges: TradeEdge[]) {
  const inDegree = new Map<string, number>();
  const adjList = new Map<string, string[]>();

  for (const nodeId of nodeIds) {
    inDegree.set(nodeId, 0);
    adjList.set(nodeId, []);
  }

  for (const edge of edges) {
    adjList.get(edge.source)!.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  }

  return { inDegree, adjList };
}

/**
 * Ejecuta el algoritmo de Kahn para calcular el orden topológico.
 */
function runKahnAlgorithm(
  nodeIds: Set<string>,
  inDegree: Map<string, number>,
  adjList: Map<string, string[]>
): string[] {
  const queue: string[] = [];
  for (const [nodeId, deg] of inDegree.entries()) {
    if (deg === 0) queue.push(nodeId);
  }

  const topologicalOrder: string[] = [];
  while (queue.length > 0) {
    const u = queue.shift()!;
    topologicalOrder.push(u);

    const neighbors = adjList.get(u) || [];
    for (const v of neighbors) {
      const newDeg = (inDegree.get(v) || 0) - 1;
      inDegree.set(v, newDeg);
      if (newDeg === 0) queue.push(v);
    }
  }

  return topologicalOrder;
}

/**
 * Rastrea ciclos dirigidos detallados mediante DFS tri-color (White=0, Gray=1, Black=2).
 */
function findCyclesWithDfs(
  nodeIds: Set<string>,
  adjList: Map<string, string[]>
): string[][] {
  const state = new Map<string, number>();
  const cycles: string[][] = [];

  for (const nodeId of nodeIds) {
    state.set(nodeId, 0);
  }

  const dfsCycleFinder = (current: string, path: string[]) => {
    state.set(current, 1);
    path.push(current);

    const neighbors = adjList.get(current) || [];
    for (const next of neighbors) {
      if (state.get(next) === 1) {
        const cycleStartIndex = path.indexOf(next);
        if (cycleStartIndex !== -1) {
          cycles.push([...path.slice(cycleStartIndex), next]);
        }
      } else if (state.get(next) === 0) {
        dfsCycleFinder(next, path);
      }
    }

    path.pop();
    state.set(current, 2);
  };

  for (const nodeId of nodeIds) {
    if (state.get(nodeId) === 0) {
      dfsCycleFinder(nodeId, []);
    }
  }

  return cycles;
}

/**
 * Valida si un grafo dirigido es estrictamente acíclico (DAG) usando el algoritmo de Kahn
 * y detecta las rutas cíclicas en caso de existir mediante búsqueda en profundidad (DFS).
 */
export function validateAcyclicity(graph: TradeDagGraph): {
  isAcyclic: boolean;
  cycles: string[][];
  topologicalOrder: string[];
} {
  const nodeIds = validateGraphIntegrity(graph);
  const { inDegree, adjList } = buildGraphAdjacency(nodeIds, graph.edges);
  const topologicalOrder = runKahnAlgorithm(nodeIds, inDegree, adjList);
  const isAcyclic = topologicalOrder.length === nodeIds.size;
  const cycles = !isAcyclic ? findCyclesWithDfs(nodeIds, adjList) : [];

  return {
    isAcyclic,
    cycles,
    topologicalOrder: isAcyclic ? topologicalOrder : []
  };
}

/**
 * Clasifica automáticamente los nodos en ORIGIN, PASS_THROUGH o END_NODE
 * en función de la topología y de sus características económicas.
 */
export function classifyNodes(nodes: Partial<TradeNode>[], edges: TradeEdge[]): TradeNodeType[] {
  const inDegree = new Map<string, number>();
  const outDegree = new Map<string, number>();

  nodes.forEach(n => {
    if (n.id) {
      inDegree.set(n.id, 0);
      outDegree.set(n.id, 0);
    }
  });

  edges.forEach(e => {
    if (outDegree.has(e.source)) {
      outDegree.set(e.source, (outDegree.get(e.source) || 0) + 1);
    }
    if (inDegree.has(e.target)) {
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
    }
  });

  return nodes.map(n => {
    if (n.type) return n.type;
    const inDeg = inDegree.get(n.id || '') || 0;
    const outDeg = outDegree.get(n.id || '') || 0;

    if (inDeg === 0 && outDeg > 0) return 'ORIGIN';
    if (outDeg === 0 && inDeg > 0) return 'END_NODE';
    if ((n.moatScore ?? 0) >= 75 && (n.pricingPower ?? 0) >= 75) return 'END_NODE';
    return 'PASS_THROUGH';
  });
}
