/**
 * @file dalio-model.ts
 * @description Facade orchestrating Ray Dalio debt cycle phases, deleveraging levers,
 * and the 3 Dalio Rules based on the "How the Economic Machine Works" model.
 */

import { CountryEconomicData } from './geographic-data';
import { DalioDebtCycleData, DalioOverrides } from './dalio-model/types';
import {
  calculateEffectiveInterestRate,
  determineYieldCurveSignal,
  determineBaselineConfidence,
  parseAndShockMacroInputs,
} from './dalio-model/macro-parsers';
import {
  evaluateShortTermCycle,
  evaluateLongTermCycle,
  evaluateProductivityGrowthTrend,
} from './dalio-model/cycle-evaluator';
import {
  calculateDalioLevers,
  evaluateBeautifulDeleveraging,
} from './dalio-model/levers-evaluator';
import {
  evaluateDalioRules,
  generateDalioCommentary,
} from './dalio-model/rules-commentary';

export * from './dalio-model/types';

function buildEmptyDalioDebtCycle(countryCode: string): DalioDebtCycleData {
  return {
    shortTermCyclePhase: 'Falta de Transparencia',
    longTermCyclePhase: 'Falta de Transparencia',
    productivityGrowthTrend: 'Sin Datos',
    levers: { austerity: 0, debtReduction: 0, wealthRedistribution: 0, moneyPrinting: 0 },
    deleveragingStatus: 'Falta de Transparencia',
    dalioCommentary: `Faltan datos macroeconómicos esenciales para evaluar el ciclo económico de ${countryCode.toUpperCase()}.`,
    dataConfidence: 'none',
    intensity: 0,
    effectiveInterestRate: 'N/A',
    yieldCurveSignal: 'unknown',
    dalioRules: {
      rule1: { status: 'unknown', label: 'Regla 1: ΔDeuda ≤ ΔPIBn', detail: 'Sin datos' },
      rule2: { status: 'unknown', label: 'Regla 2: Ingresos ≥ Productividad', detail: 'Sin datos' },
      rule3: { status: 'unknown', label: 'Regla 3: PIBn > EIR', detail: 'Sin datos' },
    },
    dalioFormula: { nominalGdpGrowth: null, effectiveInterestRateNum: null, spread: null, isBeautiful: false },
  };
}

/**
 * Calculates Ray Dalio debt cycle phases, deleveraging levers, and the 3 Dalio Rules.
 * Fully supports overrides for reactive sliders.
 */
export function calculateDalioDebtCycle(
  countryCode: string,
  econ: CountryEconomicData & Record<string, any>,
  overrides?: DalioOverrides
): DalioDebtCycleData {
  const confidence = determineBaselineConfidence(econ);
  if (confidence === 'none') return buildEmptyDalioDebtCycle(countryCode);

  const { inflation, rate, gdpGrowth, debtVal, corpTax, fxShock, rateDelta, finalNominalGdp } =
    parseAndShockMacroInputs(econ, overrides);

  const { eirValue, effectiveInterestRate } = calculateEffectiveInterestRate(econ, rateDelta, rate);
  const yieldCurveSignal = determineYieldCurveSignal(econ);

  const { phase: shortTermCyclePhase, intensity } = evaluateShortTermCycle(gdpGrowth, inflation, rate, yieldCurveSignal);
  const longTermCyclePhase = evaluateLongTermCycle(debtVal, rate);
  const productivityGrowthTrend = evaluateProductivityGrowthTrend(econ);

  const levers = calculateDalioLevers(econ, debtVal, fxShock, rateDelta, corpTax);
  const { dalioFormula, deleveragingStatus } = evaluateBeautifulDeleveraging(
    finalNominalGdp, eirValue, levers.moneyPrinting, inflation, longTermCyclePhase, debtVal
  );

  const formulaSpread = dalioFormula.spread ?? (finalNominalGdp - eirValue);
  const dalioRules = evaluateDalioRules(econ, finalNominalGdp, gdpGrowth, eirValue, formulaSpread);
  const dalioCommentary = generateDalioCommentary(
    countryCode, econ, effectiveInterestRate, formulaSpread, dalioFormula.isBeautiful,
    levers.moneyPrinting, debtVal, levers.austerity
  );

  return {
    shortTermCyclePhase, longTermCyclePhase, productivityGrowthTrend, levers,
    deleveragingStatus, dalioCommentary, dataConfidence: confidence, intensity,
    effectiveInterestRate, yieldCurveSignal, dalioRules, dalioFormula,
  };
}
