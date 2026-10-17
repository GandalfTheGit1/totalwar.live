/**
 * lib/services/trade-dag/dag-analyzer.ts
 *
 * High-level acyclicity validation, metrics aggregation,
 * and executive summary verdict generation for Trade DAGs.
 */

import { validateAcyclicity } from './acyclicity-validator';
import { calculateMetrics } from './metrics-calculator';
import { TradeDagAnalysisResult, TradeDagGraph, TradeDagMetrics } from './types';

interface DagSummary {
  verdict: TradeDagAnalysisResult['summary']['verdict'];
  keyVulnerability: string;
  tradeSteeringAssessment: string;
  fcfMoatAssessment: string;
}

/**
 * Diagnóstico para grafos dominados por Nodos Terminales.
 */
function getEndNodeDominatedSummary(metrics: TradeDagMetrics): DagSummary {
  return {
    verdict: 'DOMINATED_BY_END_NODES',
    keyVulnerability: 'Poder asimétrico concentrado en Nodos Terminales con fuerte Moat (marcas/IP). Los intermediarios asumen el riesgo de capital con márgenes mínimos.',
    tradeSteeringAssessment: `Riesgo de steering en intermediarios del ${metrics.tradeSteeringRisk}%. Los compradores finales pueden forzar relocalización sin ceder margen.`,
    fcfMoatAssessment: `Captura superior de FCF (${(metrics.fcfCaptureRatio * 100).toFixed(1)}%). El flujo económico se drena mínimamente en la maquila intermediaria.`
  };
}

/**
 * Diagnóstico para grafos con cuellos de botella críticos (chokepoints).
 */
function getChokepointSummary(metrics: TradeDagMetrics): DagSummary {
  return {
    verdict: 'CHOKEPOINT_BOTTLENECK',
    keyVulnerability: `Concentración crítica en cuello de botella (${metrics.identifiedChokepoints.join(', ')}). Exposición insustituible a disrupciones geopolíticas o aranceles dirigidos.`,
    tradeSteeringAssessment: 'Bypass inviable a corto plazo debido a costes prohibitivos de sustitución tecnológica.',
    fcfMoatAssessment: 'El cuello de botella retiene un poder de fijación sustancial a expensas de la fluidez del DAG.'
  };
}

/**
 * Diagnóstico para grafos con drenaje crítico en intermediarios comoditizados.
 */
function getCommoditizedDrainSummary(metrics: TradeDagMetrics): DagSummary {
  const keyVulnerability = metrics.dominantEndNodes.length === 0
    ? `Trampa de comoditización: la cadena carece de Nodos Terminales dominantes con foso defensivo o pricing power (${metrics.marginDrainPercentage}% del margen atrapado en intermediarios).`
    : `Drenaje excesivo de margen (${metrics.marginDrainPercentage}%). Demasiados intermediarios capturan peajes sin aportar moat sostenible.`;

  return {
    verdict: 'COMMODITIZED_DRAIN_CRITICAL',
    keyVulnerability,
    tradeSteeringAssessment: `Elevada vulnerabilidad de desvío (${metrics.tradeSteeringRisk}%). Candidato prioritario para desintermediación directa o nearshoring bypass.`,
    fcfMoatAssessment: `Erosión de FCF: los nodos terminales solo capturan el ${(metrics.fcfCaptureRatio * 100).toFixed(1)}% del FCF total.`
  };
}

/**
 * Genera el diagnóstico y veredicto ejecutivo sobre el equilibrio de valor en el DAG.
 */
export function determineDagVerdict(graph: TradeDagGraph, metrics: TradeDagMetrics): DagSummary {
  if (graph.nodes.length === 0) {
    return {
      verdict: 'BALANCED_CAPTURE',
      keyVulnerability: 'Grafo sin nodos comerciales registrados.',
      tradeSteeringAssessment: 'Sin flujos de comercio para evaluar.',
      fcfMoatAssessment: 'Sin flujo libre de caja registrado.'
    };
  }

  if (metrics.fcfCaptureRatio >= 0.70 && metrics.endNodeMarginShare >= 60) {
    return getEndNodeDominatedSummary(metrics);
  }

  if (metrics.chokepointExposure >= 65) {
    return getChokepointSummary(metrics);
  }

  if (metrics.marginDrainPercentage >= 40 || metrics.fcfCaptureRatio < 0.30 || metrics.dominantEndNodes.length === 0) {
    return getCommoditizedDrainSummary(metrics);
  }

  return {
    verdict: 'BALANCED_CAPTURE',
    keyVulnerability: 'Cadena con distribución equilibrada de valor.',
    tradeSteeringAssessment: 'Riesgo moderado de desvío comercial.',
    fcfMoatAssessment: 'Captura adecuada de flujo libre de caja.'
  };
}

/**
 * Ejecuta el análisis completo del DAG y produce veredictos ejecutivos.
 */
export function analyzeTradeDag(graph: TradeDagGraph): TradeDagAnalysisResult {
  const { isAcyclic, cycles, topologicalOrder } = validateAcyclicity(graph);

  if (!isAcyclic) {
    const cycleDescription = cycles.map(c => c.join(' ➔ ')).join(' | ');
    throw new Error(`[TradeDagService] Error de aciclicidad detectado: el grafo contiene dependencias circulares prohibidas: ${cycleDescription}`);
  }

  const metrics = calculateMetrics(graph);
  const summary = determineDagVerdict(graph, metrics);

  return {
    isAcyclic,
    cycles,
    topologicalOrder,
    metrics,
    summary
  };
}
