/**
 * @file macro-parsers.ts
 * @description Numerical parsers and EIR / yield curve signal resolution for the Dalio model.
 */

import { CountryEconomicData } from '../geographic-data';

/**
 * Parses raw macro string representations with currency/percentage suffixes to clean numbers.
 */
export function parseMacroNumber(str: string | undefined | null): number {
  if (!str || str === 'N/A' || str.includes('N/A')) return NaN;
  const cleaned = str.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned);
}

/**
 * Calculates Effective Interest Rate (EIR) following priority:
 * Direct FRED (FYOIGDA188S) > FYOINT / FYGFD ratio > Policy rate proxy.
 */
export function calculateEffectiveInterestRate(
  econ: CountryEconomicData & Record<string, any>,
  rateDelta: number,
  baseRate: number
): { eirValue: number; eirSource: string; effectiveInterestRate: string } {
  let eirValue = baseRate;
  let eirSource = 'policy-rate-proxy';

  if (econ.avgDebtInterestRate && typeof econ.avgDebtInterestRate === 'string') {
    const directEir = parseMacroNumber(econ.avgDebtInterestRate);
    if (!isNaN(directEir) && directEir > 0) {
      eirValue = directEir + rateDelta;
      eirSource = 'direct-fred';
    }
  }

  if (eirSource === 'policy-rate-proxy' && econ.fyoint && econ.fygfd) {
    const fyoint = parseMacroNumber(econ.fyoint as string);
    const fygfd = parseMacroNumber(econ.fygfd as string);
    if (!isNaN(fyoint) && !isNaN(fygfd) && fygfd > 0) {
      eirValue = (fyoint / fygfd) * 100 + rateDelta;
      eirSource = 'fyoint-fygfd';
    }
  }

  return {
    eirValue,
    eirSource,
    effectiveInterestRate: `${eirValue.toFixed(2)}%`,
  };
}

/**
 * Resolves 10Y-2Y yield curve signal into standardized categories.
 */
export function determineYieldCurveSignal(
  econ: CountryEconomicData & Record<string, any>
): 'normal' | 'flattening' | 'inverted' | 'unknown' {
  if (!econ.yieldSpread10Y2Y || typeof econ.yieldSpread10Y2Y !== 'string') {
    return 'unknown';
  }
  const spread = parseMacroNumber(econ.yieldSpread10Y2Y);
  if (isNaN(spread)) return 'unknown';
  if (spread < 0) return 'inverted';
  if (spread < 0.5) return 'flattening';
  return 'normal';
}

/**
 * Determines baseline data confidence based on indicator presence.
 */
export function determineBaselineConfidence(
  econ: CountryEconomicData & Record<string, any>
): 'high' | 'medium' | 'low' | 'none' {
  if (econ.gdpGrowth === 'N/A' || econ.inflation === 'N/A') {
    return 'none';
  }
  if (econ.dataConfidence === 'high') return 'high';
  if (econ.dataConfidence === 'medium') return 'medium';
  return 'low';
}

export interface ShockedMacroInputs {
  inflation: number;
  rate: number;
  gdpGrowth: number;
  debtVal: number;
  corpTax: number;
  fxShock: number;
  rateDelta: number;
  finalNominalGdp: number;
}

export function parseAndShockMacroInputs(
  econ: CountryEconomicData & Record<string, any>,
  overrides?: { fxShockPercent?: number; interestRateDelta?: number }
): ShockedMacroInputs {
  const debt = parseMacroNumber(econ.debtToGdp as string);
  const rawRate = parseMacroNumber(econ.interestRate as string);
  const rawInflation = parseMacroNumber(econ.inflation as string);
  const rawGdpGrowth = parseMacroNumber(econ.gdpGrowth as string);
  const corpTax = parseMacroNumber(econ.corporateTax as string);

  const fxShock = overrides?.fxShockPercent || 0;
  const rateDelta = overrides?.interestRateDelta || 0;

  const inflation = (isNaN(rawInflation) ? 2.5 : rawInflation) + fxShock * 0.2;
  const rate = (isNaN(rawRate) ? 3.0 : rawRate) + rateDelta + fxShock * 0.1;
  const gdpGrowth = (isNaN(rawGdpGrowth) ? 2.0 : rawGdpGrowth) - rateDelta * 0.15 - fxShock * 0.1;
  const debtVal = isNaN(debt) ? 60 : debt;

  const nominalGdpNum = econ.nominalGdpGrowth ? parseMacroNumber(econ.nominalGdpGrowth as string) : (gdpGrowth + inflation);
  const finalNominalGdp = isNaN(nominalGdpNum) ? gdpGrowth + inflation : nominalGdpNum;

  return { inflation, rate, gdpGrowth, debtVal, corpTax, fxShock, rateDelta, finalNominalGdp };
}

