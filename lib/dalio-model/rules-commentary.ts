/**
 * @file rules-commentary.ts
 * @description Evaluates Dalio's 3 Rules and generates sovereign macro commentary.
 */

import { DalioRule } from './types';
import { parseMacroNumber } from './macro-parsers';
import { CountryEconomicData } from '../geographic-data';

function evaluateRule1(econ: CountryEconomicData & Record<string, any>, nominalGdpNum: number): DalioRule {
  if (!econ.consumerCreditGrowth || econ.consumerCreditGrowth === 'N/A') {
    return { status: 'unknown', label: 'Regla 1: ΔDeuda ≤ ΔPIBn', detail: 'Datos de crédito no disponibles' };
  }
  const creditGrowth = parseMacroNumber(econ.consumerCreditGrowth as string);
  if (isNaN(creditGrowth) || isNaN(nominalGdpNum)) {
    return { status: 'unknown', label: 'Regla 1: ΔDeuda ≤ ΔPIBn', detail: 'Datos insuficientes' };
  }
  const excess = creditGrowth - nominalGdpNum;
  return {
    status: excess > 5 ? 'breach' : excess > 0 ? 'warning' : 'ok',
    label: 'Regla 1: ΔDeuda ≤ ΔPIBn',
    detail: `Crédito consumo: ${econ.consumerCreditGrowth} | PIBn: ${nominalGdpNum.toFixed(1)}% | Exceso: ${excess > 0 ? '+' : ''}${excess.toFixed(1)}pp`,
  };
}

function evaluateRule2(econ: CountryEconomicData & Record<string, any>, gdpGrowth: number): DalioRule {
  if (!econ.productivityPerHour || econ.productivityPerHour === 'N/A') {
    return { status: 'unknown', label: 'Regla 2: Ingresos ≥ Productividad', detail: 'OPHNFB no disponible' };
  }
  const prodGrowth = parseMacroNumber(econ.productivityPerHour as string);
  if (isNaN(prodGrowth) || isNaN(gdpGrowth)) {
    return { status: 'unknown', label: 'Regla 2: Ingresos ≥ Productividad', detail: 'Datos insuficientes' };
  }
  const gap = gdpGrowth - prodGrowth;
  return {
    status: gap < -2 ? 'breach' : gap < 0 ? 'warning' : 'ok',
    label: 'Regla 2: Ingresos ≥ Productividad',
    detail: `PIB Real: ${gdpGrowth.toFixed(1)}% | Output/h: ${econ.productivityPerHour} | Brecha: ${gap > 0 ? '+' : ''}${gap.toFixed(1)}pp`,
  };
}

function evaluateRule3(nominalGdpNum: number, eirValue: number, formulaSpread: number): DalioRule {
  return {
    status: formulaSpread > 1 ? 'ok' : formulaSpread > 0 ? 'warning' : 'breach',
    label: 'Regla 3: PIBn > EIR (Desapalancamiento Hermoso)',
    detail: `PIBn: ${nominalGdpNum.toFixed(1)}% | EIR: ${eirValue.toFixed(2)}% | Spread: ${formulaSpread > 0 ? '+' : ''}${formulaSpread.toFixed(2)}pp`,
  };
}

/**
 * Evaluates Ray Dalio's 3 Golden Rules:
 * 1. Debt growth <= Income growth (ΔDebt ≤ ΔNominal GDP)
 * 2. Income growth >= Productivity trend (Real GDP >= Productivity/h)
 * 3. Nominal GDP growth > Effective Interest Rate (Beautiful Deleveraging condition)
 */
export function evaluateDalioRules(
  econ: CountryEconomicData & Record<string, any>,
  nominalGdpNum: number,
  gdpGrowth: number,
  eirValue: number,
  formulaSpread: number
): { rule1: DalioRule; rule2: DalioRule; rule3: DalioRule } {
  return {
    rule1: evaluateRule1(econ, nominalGdpNum),
    rule2: evaluateRule2(econ, gdpGrowth),
    rule3: evaluateRule3(nominalGdpNum, eirValue, formulaSpread),
  };
}


/**
 * Generates automated sovereign commentary aligned with the Dalio framework.
 */
export function generateDalioCommentary(
  countryCode: string,
  econ: CountryEconomicData & Record<string, any>,
  effectiveInterestRate: string,
  formulaSpread: number,
  isBeautiful: boolean,
  moneyPrinting: number,
  debtVal: number,
  austerity: number
): string {
  const code = countryCode.toUpperCase();
  const spreadPrefix = formulaSpread > 0 ? '+' : '';

  switch (code) {
    case 'US':
      return `EE. UU. presenta una deuda pública del ${econ.debtToGdp} con una tasa de interés efectiva (EIR) del ${effectiveInterestRate}. La fórmula de Dalio muestra un spread PIBn-EIR de ${spreadPrefix}${formulaSpread.toFixed(2)}pp, lo que indica un desapalancamiento ${isBeautiful ? '✅ hermoso' : '⚠️ bajo presión'}. La curva de tipos está ${econ.yieldCurveStatus || 'N/A'}.`;
    case 'JP':
      return `Japón representa el caso extremo del ciclo largo: deuda pública del ${econ.debtToGdp}, con el BoJ manteniendo tipos en ${econ.interestRate} mediante compras masivas de bonos (impresión monetaria: ${moneyPrinting}%). El EIR efectivo (${effectiveInterestRate}) es artificialmente comprimido por la política YCC.`;
    case 'CN':
      return `China está gestionando el pico de su burbuja de deuda corporativa y municipal. Su crédito privado/PIB según el BIS es elevado (${econ.privateCreditGdp || 'N/A'}). A diferencia de Occidente, cuenta con capacidad reguladora directa para forzar reestructuraciones bancarias.`;
    case 'DE':
      return `Alemania mantiene austeridad fiscal (${austerity}%) por su freno constitucional a la deuda. Con una deuda del ${econ.debtToGdp} y dependencia del BCE para política monetaria, el spread Bund actual refleja confianza soberana elevada.`;
    default:
      return `Perfil de deuda ${debtVal > 80 ? 'alto' : 'moderado'} (${econ.debtToGdp}). El spread PIBn-EIR es ${spreadPrefix}${formulaSpread.toFixed(2)}pp (${isBeautiful ? 'zona hermosa' : 'bajo presión'}). DSR de hogares: ${econ.householdDsr || econ.dsr || 'N/A'}.`;
  }
}
