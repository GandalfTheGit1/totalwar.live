/**
 * @file cycle-evaluator.ts
 * @description Evaluates Short-Term and Long-Term Debt Cycle phases and productivity trends.
 */

import { CyclePhase } from './types';
import { parseMacroNumber } from './macro-parsers';
import { CountryEconomicData } from '../geographic-data';

/**
 * Evaluates short-term debt cycle phase and intensity [0, 1].
 */
export function evaluateShortTermCycle(
  gdpGrowth: number,
  inflation: number,
  rate: number,
  yieldCurveSignal: string
): { phase: CyclePhase; intensity: number } {
  const scores: Record<string, number> = {
    'Early Expansion': (gdpGrowth > 0 ? 2 : 0) + (inflation < 2 ? 2 : 0) + (rate < 2.5 ? 2 : 0),
    'Late Expansion': (gdpGrowth > 1.5 ? 2 : 0) + (inflation >= 2 && inflation < 4 ? 2 : 0) + (rate >= 2.5 && rate < 4.5 ? 2 : 0),
    'Peak & Tightening': (gdpGrowth < 2 ? 1 : 0) + (inflation >= 3.5 ? 3 : 0) + (rate >= 4.5 ? 3 : 0),
    'Contraction': (gdpGrowth < 0 ? 5 : 0) + (inflation < 3 ? 1 : 0) + (yieldCurveSignal === 'inverted' ? 2 : 0),
    'Recovery': (gdpGrowth >= 0 && gdpGrowth < 1.5 ? 2 : 0) + (rate < 2 ? 3 : 0) + (inflation < 2 ? 1 : 0),
  };

  let phase: CyclePhase = 'Late Expansion';
  let maxScore = -1;
  for (const [candidate, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      phase = candidate as CyclePhase;
    }
  }

  let intensity = 0.5;
  switch (phase) {
    case 'Early Expansion':
      intensity = Math.min(1, Math.max(0, gdpGrowth / 4));
      break;
    case 'Late Expansion':
      intensity = Math.min(1, Math.max(0, (inflation - 2) / 3));
      break;
    case 'Peak & Tightening':
      intensity = Math.min(1, Math.max(0, (rate - 4) / 4));
      break;
    case 'Contraction':
      intensity = Math.min(1, Math.max(0, -gdpGrowth / 4));
      break;
    case 'Recovery':
      intensity = Math.min(1, Math.max(0, (2.5 - rate) / 2.5));
      break;
  }

  return { phase, intensity };
}

/**
 * Evaluates long-term debt cycle phase based on debt-to-GDP and interest rates.
 */
export function evaluateLongTermCycle(debtVal: number, rate: number): string {
  if (debtVal > 110 && rate <= 4.8) return 'Depression & Deleveraging';
  if (debtVal > 80) return 'Peak';
  if (debtVal > 50) return 'Debt Bubble';
  return 'Early Leverage';
}

/**
 * Evaluates productivity growth trend using OPHNFB or R&D proxy.
 */
export function evaluateProductivityGrowthTrend(
  econ: CountryEconomicData & Record<string, any>
): string {
  if (econ.productivityPerHour && econ.productivityPerHour !== 'N/A') {
    const prodNum = parseMacroNumber(econ.productivityPerHour as string);
    if (!isNaN(prodNum)) {
      if (prodNum >= 2.5) return `Alta Productividad (Output/h: ${econ.productivityPerHour})`;
      if (prodNum >= 1.0) return `Crecimiento Moderado (Output/h: ${econ.productivityPerHour})`;
      if (prodNum >= 0) return `Estancamiento Productivo (Output/h: ${econ.productivityPerHour})`;
      return `Contracción Productiva (Output/h: ${econ.productivityPerHour})`;
    }
  }

  if (econ.rdSpending) {
    const rd = parseMacroNumber(econ.rdSpending as string);
    if (!isNaN(rd)) {
      if (rd >= 3.0) return `Alta Innovación (I+D: ${econ.rdSpending})`;
      if (rd >= 1.5) return `Innovación Moderada (I+D: ${econ.rdSpending})`;
      return `Baja/Alcanzando (I+D: ${econ.rdSpending})`;
    }
  }

  return 'Stable Growth';
}
