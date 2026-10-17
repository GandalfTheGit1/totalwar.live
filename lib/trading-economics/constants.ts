/**
 * lib/trading-economics/constants.ts
 *
 * Fallback values, currency mapping dictionaries, and indicator scraping targets
 * for international macro data extraction.
 */

export const EXCHANGE_RATE_TTL = 12 * 60 * 60 * 1000; // 12 hours

export const DEFAULT_EXCHANGE_FALLBACKS: Record<string, number> = {
  US: 1.0,
  CN: 0.138,
  TW: 0.031,
  IE: 1.08,
  IN: 0.012,
  GB: 1.27,
  JP: 0.0064,
  MX: 0.054,
  BR: 0.18,
  DE: 1.08,
  FR: 1.08,
  KR: 0.00072,
  IT: 1.08,
  CA: 0.73,
  AU: 0.66,
  ES: 1.08,
};

export const CURRENCY_MAP: Record<string, string> = {
  US: 'USD',
  CN: 'CNY',
  TW: 'TWD',
  IE: 'EUR',
  IN: 'INR',
  GB: 'GBP',
  JP: 'JPY',
  MX: 'MXN',
  BR: 'BRL',
  DE: 'EUR',
  FR: 'EUR',
  KR: 'KRW',
  IT: 'EUR',
  CA: 'CAD',
  AU: 'AUD',
  ES: 'EUR',
};

export const RD_SPENDING_FALLBACKS: Record<string, string> = {
  US: '3.4%',
  CN: '2.6%',
  TW: '3.8%',
  IE: '1.1%',
  IN: '0.7%',
  GB: '2.9%',
  JP: '3.3%',
  MX: '0.3%',
  BR: '1.2%',
  DE: '3.1%',
  FR: '2.2%',
  KR: '4.8%',
  IL: '5.4%',
  SE: '3.5%',
  FI: '2.9%',
  CH: '3.2%',
  CA: '1.6%',
  AU: '1.8%',
  ES: '1.4%',
  IT: '1.5%',
  RU: '1.1%',
  SA: '0.8%',
  ZA: '0.8%',
  SG: '2.2%',
  NL: '2.3%',
  VN: '0.5%',
  ID: '0.3%',
  TH: '1.1%',
  MY: '1.4%',
  PH: '0.2%',
  TR: '1.1%',
  PL: '1.4%',
  BE: '3.2%',
};

export const INDICATOR_TARGETS: Record<string, string[]> = {
  gdpGrowth: ['gdp-growth'],
  inflation: ['inflation-cpi', 'inflation-rate'],
  interestRate: ['interest-rate'],
  debtToGdp: ['government-debt-to-gdp'],
  unemployment: ['unemployment-rate'],
  gdpPerCapita: ['gdp-per-capita'],
  tradeBalance: ['balance-of-trade'],
  corporateTax: ['corporate-tax-rate'],
  creditRating: ['rating'],
  manufacturingPmi: ['manufacturing-pmi'],
  servicesPmi: ['services-pmi'],
  compositePmi: ['composite-pmi'],
};
