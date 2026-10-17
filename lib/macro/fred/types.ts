/**
 * lib/macro/fred/types.ts
 *
 * Type definitions for Federal Reserve Economic Data (FRED) series mapping.
 * Aligned with Ray Dalio's 4-pillar economic machine and beautiful deleveraging model.
 */

export interface CountryFredSeries {
  // === PILLAR A: Productivity Baseline ===
  gdpNominal: string | null;          // Nominal GDP
  gdpGrowth: string | null;           // Real GDP Growth YoY or QoQ annualized
  productivityPerHour: string | null; // Output Per Hour (Productivity trend)

  // === PILLAR B: Short-Term Debt Cycle ===
  cpi: string | null;                 // CPI — primary inflation measure
  pce: string | null;                 // PCE — Fed's preferred inflation measure
  policyRate: string | null;          // Central Bank Policy Interest Rate
  yieldSpread10Y2Y: string | null;    // T10Y2Y: 10Y - 2Y Yield Spread (Recession signal if <0)
  consumerCredit: string | null;      // Total consumer credit outstanding
  businessLoans: string | null;       // Commercial & Industrial Loans

  // === PILLAR C: Long-Term Debt Cycle ===
  debtToGdp: string | null;           // Public Debt as % of GDP
  householdDebtToGdp: string | null;  // Household Debt as % of GDP
  householdDsr: string | null;        // Household Debt Service Ratio — % of disposable income
  homePriceIndex: string | null;      // S&P/Case-Shiller Home Price Index — asset bubble proxy

  // === PILLAR D: Deleveraging Levers ===
  centralBankAssets: string | null;   // Central Bank total assets (QE / QT indicator)
  m2: string | null;                  // M2 Money Supply
  fiscalDeficit: string | null;       // Federal Surplus/Deficit
  avgDebtInterestRate: string | null; // Average Interest Rate on Federal Debt — direct EIR

  // === Sovereign Risk ===
  bondYield10Y: string | null;        // 10-Year government bond yield

  // === US-Specific (EIR Calculation) ===
  fyoint?: string | null;             // Federal Interest Payments in Millions USD (US only)
  fygfd?: string | null;              // Federal Debt Stock in Millions USD (US only)
}
