/**
 * @file levers-evaluator.ts
 * @description Evaluates Dalio's 4 Deleveraging Levers and the Beautiful Deleveraging formula.
 */

import { parseMacroNumber } from './macro-parsers';
import { CountryEconomicData } from '../geographic-data';

export interface DalioLevers {
  austerity: number;
  debtReduction: number;
  wealthRedistribution: number;
  moneyPrinting: number;
}

export interface BeautifulDeleveragingResult {
  dalioFormula: {
    nominalGdpGrowth: number | null;
    effectiveInterestRateNum: number | null;
    spread: number | null;
    isBeautiful: boolean;
  };
  deleveragingStatus: string;
}

/**
 * Computes Dalio's 4 Levers (0-100 scale):
 * Austerity, Debt Reduction, Wealth Redistribution, and Money Printing.
 */
function computeAusterityLever(econ: CountryEconomicData & Record<string, any>, debtVal: number): number {
  if (econ.fiscalDeficitMillions && econ.fiscalDeficitMillions !== 'N/A') {
    const defNum = parseMacroNumber(econ.fiscalDeficitMillions as string);
    if (!isNaN(defNum)) {
      const defPct = defNum / 1_000_000;
      return Math.max(10, Math.min(90, 50 + defPct * 5));
    }
  }
  if (!isNaN(debtVal)) {
    return Math.max(20, Math.min(80, 100 - debtVal));
  }
  return 50;
}

function computeDebtReductionLever(creditRating: string | undefined, fxShock: number): number {
  const rating = creditRating || 'AAA';
  let val = 10;
  if (rating.startsWith('AAA') || rating.startsWith('AA')) {
    val = 10;
  } else if (rating.startsWith('A') || rating.startsWith('BBB')) {
    val = 20 + fxShock * 0.5;
  } else {
    val = 35 + fxShock * 0.8;
  }
  return Math.min(100, Math.max(0, val));
}

function computeWealthRedistributionLever(corpTax: number): number {
  const tax = !isNaN(corpTax) ? corpTax : 25;
  const raw = Math.round((tax / 40) * 100);
  return Math.min(100, Math.max(10, isNaN(raw) ? 50 : raw));
}

function computeMoneyPrintingLever(
  econ: CountryEconomicData & Record<string, any>,
  debtVal: number,
  rateDelta: number
): number {
  let mpDataPoints = 0;
  let mpSum = 0;

  if (econ.m2Growth && econ.m2Growth !== 'N/A') {
    const m2Num = parseMacroNumber(econ.m2Growth as string);
    if (!isNaN(m2Num)) {
      mpSum += Math.max(10, Math.min(95, 30 + m2Num * 4));
      mpDataPoints++;
    }
  }

  if (econ.cbAssetsYoY && econ.cbAssetsYoY !== 'N/A') {
    const cbNum = parseMacroNumber(econ.cbAssetsYoY as string);
    if (!isNaN(cbNum)) {
      mpSum += Math.max(10, Math.min(95, 30 + cbNum * 3));
      mpDataPoints++;
    }
  }

  const base = mpDataPoints > 0 ? Math.round(mpSum / mpDataPoints) : Math.max(10, Math.min(95, 30 + debtVal * 0.4));
  return Math.min(100, Math.max(0, base + rateDelta * -2));
}

/**
 * Computes Dalio's 4 Levers (0-100 scale):
 * Austerity, Debt Reduction, Wealth Redistribution, and Money Printing.
 */
export function calculateDalioLevers(
  econ: CountryEconomicData & Record<string, any>,
  debtVal: number,
  fxShock: number,
  rateDelta: number,
  corpTax: number
): DalioLevers {
  return {
    austerity: computeAusterityLever(econ, debtVal),
    debtReduction: computeDebtReductionLever(econ.creditRating, fxShock),
    wealthRedistribution: computeWealthRedistributionLever(corpTax),
    moneyPrinting: computeMoneyPrintingLever(econ, debtVal, rateDelta),
  };
}


/**
 * Evaluates Dalio's Beautiful Deleveraging condition:
 * Nominal GDP Growth > EIR with manageable CB asset growth and contained inflation.
 */
export function evaluateBeautifulDeleveraging(
  nominalGdpNum: number,
  eirValue: number,
  moneyPrinting: number,
  inflation: number,
  longTermCyclePhase: string,
  debtVal: number
): BeautifulDeleveragingResult {
  const formulaSpread = nominalGdpNum - eirValue;
  const cbGrowing = moneyPrinting >= 60;
  const inflationModerate = inflation <= 3.0;
  const isBeautiful = formulaSpread > 0 && cbGrowing && inflationModerate;

  let deleveragingStatus = 'Leverage Building';
  if (longTermCyclePhase === 'Depression & Deleveraging' || debtVal > 90) {
    if (isBeautiful) {
      deleveragingStatus = 'Beautiful Deleveraging';
    } else if (formulaSpread < 0 && !cbGrowing) {
      deleveragingStatus = 'Ugly Deflationary Depression';
    } else if (moneyPrinting >= 75 && inflation > 3.0) {
      deleveragingStatus = 'Ugly Inflationary Spiral';
    } else {
      deleveragingStatus = 'Beautiful Deleveraging';
    }
  } else if (longTermCyclePhase === 'Peak' || longTermCyclePhase === 'Debt Bubble') {
    deleveragingStatus = 'Restructuring Phase';
  }

  return {
    dalioFormula: {
      nominalGdpGrowth: nominalGdpNum,
      effectiveInterestRateNum: eirValue,
      spread: Math.round(formulaSpread * 100) / 100,
      isBeautiful,
    },
    deleveragingStatus,
  };
}
