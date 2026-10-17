/**
 * lib/macro/fred/americas.ts
 *
 * FRED series mappings for the Americas (US, CA, MX, BR).
 */

import type { CountryFredSeries } from './types';

export const US_FRED_SERIES: CountryFredSeries = {
  // Pillar A: Productivity
  gdpNominal: 'GDP',
  gdpGrowth: 'A191RL1Q225SBEA',
  productivityPerHour: 'OPHNFB',

  // Pillar B: Short-Term Cycle
  cpi: 'CPIAUCSL',
  pce: 'PCEPI',
  policyRate: 'FEDFUNDS',
  yieldSpread10Y2Y: 'T10Y2Y',
  consumerCredit: 'TOTALSL',
  businessLoans: 'BUSLOANS',

  // Pillar C: Long-Term Debt Cycle
  debtToGdp: 'GFDEGDQ188S',
  householdDebtToGdp: 'HDTGPDUSQ163N',
  householdDsr: 'TDSP',
  homePriceIndex: 'CSUSHPISA',

  // Pillar D: Deleveraging
  centralBankAssets: 'WALCL',
  m2: 'M2SL',
  fiscalDeficit: 'FYFSD',
  avgDebtInterestRate: 'FYOIGDA188S',

  // Sovereign Risk
  bondYield10Y: 'DGS10',

  // US-Specific EIR fallback
  fyoint: 'FYOINT',
  fygfd: 'FYGFD',
};

export const CA_FRED_SERIES: CountryFredSeries = {
  gdpNominal: null,
  gdpGrowth: 'CANGDPRQPSMEI',
  productivityPerHour: null,
  cpi: 'CANCPIALLMINMEI',
  pce: null,
  policyRate: 'IRSTCI01CAM156N',
  yieldSpread10Y2Y: null,
  consumerCredit: null,
  businessLoans: null,
  debtToGdp: 'DEBTTLG02CAQ163N',
  householdDebtToGdp: null,
  householdDsr: null,
  homePriceIndex: null,
  centralBankAssets: null,
  m2: 'MABMM301CAM189S',
  fiscalDeficit: null,
  avgDebtInterestRate: null,
  bondYield10Y: 'IRLTLT01CAM156N',
};

export const MX_FRED_SERIES: CountryFredSeries = {
  gdpNominal: null,
  gdpGrowth: 'MEXRGDPEXP',
  productivityPerHour: null,
  cpi: 'MEXCPIALLMINMEI',
  pce: null,
  policyRate: 'IRSTCI01MXM156N',
  yieldSpread10Y2Y: null,
  consumerCredit: null,
  businessLoans: null,
  debtToGdp: 'DEBTTLG02MXQ163N',
  householdDebtToGdp: null,
  householdDsr: null,
  homePriceIndex: null,
  centralBankAssets: null,
  m2: 'MABMM301MXM189S',
  fiscalDeficit: null,
  avgDebtInterestRate: null,
  bondYield10Y: 'IRLTLT01MXM156N',
};

export const BR_FRED_SERIES: CountryFredSeries = {
  gdpNominal: null,
  gdpGrowth: 'BRAGDPNQDSMEI',
  productivityPerHour: null,
  cpi: 'BRACPIALLMINMEI',
  pce: null,
  policyRate: 'IRSTCI01BRM156N',
  yieldSpread10Y2Y: null,
  consumerCredit: null,
  businessLoans: null,
  debtToGdp: 'DEBTTLG02BRQ163N',
  householdDebtToGdp: null,
  householdDsr: null,
  homePriceIndex: null,
  centralBankAssets: null,
  m2: 'MYAGM2BRM189S',
  fiscalDeficit: null,
  avgDebtInterestRate: null,
  bondYield10Y: 'IRLTLT01BRM156N',
};
