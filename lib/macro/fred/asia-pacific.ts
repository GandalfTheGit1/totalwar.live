/**
 * lib/macro/fred/asia-pacific.ts
 *
 * FRED series mappings for Asia-Pacific economies (JP, CN, IN, KR, AU).
 */

import type { CountryFredSeries } from './types';

export const JP_FRED_SERIES: CountryFredSeries = {
  gdpNominal: null,
  gdpGrowth: 'JPNRGDPEXP',
  productivityPerHour: null,
  cpi: 'JPNCPIALLMINMEI',
  pce: null,
  policyRate: 'IRSTCI01JPM156N',
  yieldSpread10Y2Y: null,
  consumerCredit: null,
  businessLoans: null,
  debtToGdp: 'DEBTTLG02JPQ163N',
  householdDebtToGdp: null,
  householdDsr: null,
  homePriceIndex: null,
  centralBankAssets: 'JPNFASSTOTQ',
  m2: 'MYAGM2JPM189S',
  fiscalDeficit: null,
  avgDebtInterestRate: null,
  bondYield10Y: 'IRLTLT01JPM156N',
};

export const CN_FRED_SERIES: CountryFredSeries = {
  gdpNominal: null,
  gdpGrowth: 'CHNGDPNQDSMEI',
  productivityPerHour: null,
  cpi: 'CHNCPIALLMINMEI',
  pce: null,
  policyRate: 'IRSTCI01CNM156N',
  yieldSpread10Y2Y: null,
  consumerCredit: null,
  businessLoans: null,
  debtToGdp: null,
  householdDebtToGdp: null,
  householdDsr: null,
  homePriceIndex: null,
  centralBankAssets: null,
  m2: 'MYAGM2CNM052S',
  fiscalDeficit: null,
  avgDebtInterestRate: null,
  bondYield10Y: 'IRLTLT01CNM156N',
};

export const IN_FRED_SERIES: CountryFredSeries = {
  gdpNominal: null,
  gdpGrowth: 'INDGDPRQPSMEI',
  productivityPerHour: null,
  cpi: 'INDCPIALLMINMEI',
  pce: null,
  policyRate: 'IRSTCI01INM156N',
  yieldSpread10Y2Y: null,
  consumerCredit: null,
  businessLoans: null,
  debtToGdp: 'DDEI01INA156NWDB',
  householdDebtToGdp: null,
  householdDsr: null,
  homePriceIndex: null,
  centralBankAssets: null,
  m2: 'MYAGM2INM189S',
  fiscalDeficit: null,
  avgDebtInterestRate: null,
  bondYield10Y: 'IRLTLT01INM156N',
};

export const KR_FRED_SERIES: CountryFredSeries = {
  gdpNominal: null,
  gdpGrowth: 'KORRGDPEXP',
  productivityPerHour: null,
  cpi: 'KORCPIALLMINMEI',
  pce: null,
  policyRate: 'IRSTCI01KRM156N',
  yieldSpread10Y2Y: null,
  consumerCredit: null,
  businessLoans: null,
  debtToGdp: 'DEBTTLG02KRQ163N',
  householdDebtToGdp: null,
  householdDsr: null,
  homePriceIndex: null,
  centralBankAssets: null,
  m2: 'MYAGM2KRM189S',
  fiscalDeficit: null,
  avgDebtInterestRate: null,
  bondYield10Y: 'IRLTLT01KRM156N',
};

export const AU_FRED_SERIES: CountryFredSeries = {
  gdpNominal: null,
  gdpGrowth: 'AUSGDPRQPSMEI',
  productivityPerHour: null,
  cpi: 'AUSCPIALLQINMEI',
  pce: null,
  policyRate: 'IRSTCI01AUM156N',
  yieldSpread10Y2Y: null,
  consumerCredit: null,
  businessLoans: null,
  debtToGdp: 'DEBTTLG02AUQ163N',
  householdDebtToGdp: null,
  householdDsr: null,
  homePriceIndex: null,
  centralBankAssets: null,
  m2: 'MABMM301AUM189S',
  fiscalDeficit: null,
  avgDebtInterestRate: null,
  bondYield10Y: 'IRLTLT01AUM156N',
};
