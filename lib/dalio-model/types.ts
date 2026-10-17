/**
 * @file types.ts
 * @description Type definitions for the Ray Dalio Macroeconomic Debt Cycle Model.
 */

export interface DalioRule {
  status: 'ok' | 'warning' | 'breach' | 'unknown';
  label: string;
  detail: string;
}

export interface DalioDebtCycleData {
  shortTermCyclePhase: string;
  longTermCyclePhase: string;
  productivityGrowthTrend: string;
  levers: {
    austerity: number;            // 0-100
    debtReduction: number;        // 0-100
    wealthRedistribution: number; // 0-100
    moneyPrinting: number;        // 0-100
  };
  deleveragingStatus: string;
  dalioCommentary: string;
  dataConfidence?: 'high' | 'medium' | 'low' | 'none';
  intensity?: number;             // [0,1] — position within cycle phase range
  effectiveInterestRate?: string;
  dalioRules?: {
    rule1: DalioRule;            // ΔDebt ≤ ΔNominal GDP
    rule2: DalioRule;            // Income ≥ Productivity trend
    rule3: DalioRule;            // Nominal GDP > Effective Interest Rate
  };
  yieldCurveSignal?: 'normal' | 'flattening' | 'inverted' | 'unknown';
  dalioFormula?: {
    nominalGdpGrowth: number | null;
    effectiveInterestRateNum: number | null;
    spread: number | null;       // nominalGdpGrowth - EIR (positive = beautiful)
    isBeautiful: boolean;
  };
}

export type CyclePhase =
  | 'Early Expansion'
  | 'Late Expansion'
  | 'Peak & Tightening'
  | 'Contraction'
  | 'Recovery'
  | 'Falta de Transparencia';

export interface DalioOverrides {
  interestRateDelta?: number;
  fxShockPercent?: number;
}
