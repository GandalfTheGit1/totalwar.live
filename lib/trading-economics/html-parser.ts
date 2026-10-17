/**
 * lib/trading-economics/html-parser.ts
 *
 * Scrapes and extracts macroeconomic indicator data from TradingEconomics HTML pages.
 */

import type { CountryEconomicData } from '../geographic-data';
import { INDICATOR_TARGETS, RD_SPENDING_FALLBACKS } from './constants';
import {
  formatGdpPerCapita,
  formatPercent,
  formatTradeBalance,
  mapCreditRating,
} from './formatters';

export function parseTradingEconomicsHtml(
  html: string,
  cleanSlug: string,
): Record<string, { actual: string; previous: string }> {
  const parsed: Record<string, { actual: string; previous: string }> = {};

  for (const [key, slugs] of Object.entries(INDICATOR_TARGETS)) {
    let foundActual = '';
    let foundPrevious = '';
    for (const targetSlug of slugs) {
      const regex = new RegExp(
        `<a\\s+href='/${cleanSlug}/${targetSlug}'>\\s*([^<]+)\\s*</a>\\s*</td>\\s*<td[^>]*>\\s*(?:<span[^>]*>)?([^<]*?)(?:</span>)?\\s*</td>\\s*<td[^>]*>\\s*(?:<span[^>]*>)?([^<]*?)(?:</span>)?\\s*</td>`,
        'i',
      );
      const match = html.match(regex);
      if (match) {
        foundActual = match[2].trim();
        foundPrevious = match[3].trim();
        break;
      }
    }
    parsed[key] = {
      actual: foundActual || 'N/A',
      previous: foundPrevious || 'N/A',
    };
  }

  return parsed;
}

export function buildBaseEconomicData(
  cleanSlug: string,
  countryCode: string | undefined,
  parsed: Record<string, { actual: string; previous: string }>,
): CountryEconomicData {
  const code = countryCode?.toUpperCase() || '';
  const rdSpending = RD_SPENDING_FALLBACKS[code] || '1.5%';

  return {
    gdpGrowth: parsed.gdpGrowth.actual !== 'N/A' ? formatPercent(parsed.gdpGrowth.actual, true) : 'N/A',
    gdpGrowthPrevious: parsed.gdpGrowth.previous !== 'N/A' ? formatPercent(parsed.gdpGrowth.previous, true) : 'N/A',
    inflation: parsed.inflation.actual !== 'N/A' ? formatPercent(parsed.inflation.actual, true) : 'N/A',
    inflationPrevious: parsed.inflation.previous !== 'N/A' ? formatPercent(parsed.inflation.previous, true) : 'N/A',
    interestRate: parsed.interestRate.actual !== 'N/A' ? formatPercent(parsed.interestRate.actual) : 'N/A',
    interestRatePrevious: parsed.interestRate.previous !== 'N/A' ? formatPercent(parsed.interestRate.previous) : 'N/A',
    debtToGdp: parsed.debtToGdp.actual !== 'N/A' ? formatPercent(parsed.debtToGdp.actual) : 'N/A',
    debtToGdpPrevious: parsed.debtToGdp.previous !== 'N/A' ? formatPercent(parsed.debtToGdp.previous) : 'N/A',
    unemployment: parsed.unemployment.actual !== 'N/A' ? formatPercent(parsed.unemployment.actual) : 'N/A',
    unemploymentPrevious: parsed.unemployment.previous !== 'N/A' ? formatPercent(parsed.unemployment.previous) : 'N/A',
    gdpPerCapita: parsed.gdpPerCapita.actual !== 'N/A' ? formatGdpPerCapita(parsed.gdpPerCapita.actual) : 'N/A',
    gdpPerCapitaPrevious: parsed.gdpPerCapita.previous !== 'N/A' ? formatGdpPerCapita(parsed.gdpPerCapita.previous) : 'N/A',
    tradeBalance: parsed.tradeBalance.actual !== 'N/A' ? formatTradeBalance(parsed.tradeBalance.actual) : 'N/A',
    tradeBalancePrevious: parsed.tradeBalance.previous !== 'N/A' ? formatTradeBalance(parsed.tradeBalance.previous) : 'N/A',
    corporateTax: parsed.corporateTax.actual !== 'N/A' ? formatPercent(parsed.corporateTax.actual) : 'N/A',
    corporateTaxPrevious: parsed.corporateTax.previous !== 'N/A' ? formatPercent(parsed.corporateTax.previous) : 'N/A',
    creditRating: parsed.creditRating.actual !== 'N/A' ? mapCreditRating(parsed.creditRating.actual) : 'N/A',
    creditRatingPrevious: parsed.creditRating.previous !== 'N/A' ? mapCreditRating(parsed.creditRating.previous) : 'N/A',
    rdSpending,
    rdSpendingPrevious: 'N/A',
    manufacturingPmi: parsed.manufacturingPmi.actual !== 'N/A' ? parsed.manufacturingPmi.actual : undefined,
    manufacturingPmiPrevious: parsed.manufacturingPmi.previous !== 'N/A' ? parsed.manufacturingPmi.previous : undefined,
    servicesPmi: parsed.servicesPmi.actual !== 'N/A' ? parsed.servicesPmi.actual : undefined,
    servicesPmiPrevious: parsed.servicesPmi.previous !== 'N/A' ? parsed.servicesPmi.previous : undefined,
    compositePmi: parsed.compositePmi.actual !== 'N/A' ? parsed.compositePmi.actual : undefined,
    compositePmiPrevious: parsed.compositePmi.previous !== 'N/A' ? parsed.compositePmi.previous : undefined,
    tradingEconomicsSlug: cleanSlug,
  };
}
