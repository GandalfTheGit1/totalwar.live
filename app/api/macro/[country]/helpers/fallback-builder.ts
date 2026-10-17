/**
 * app/api/macro/[country]/helpers/fallback-builder.ts
 *
 * Fallback response constructors for Trading Economics scraping and transparency gaps.
 */

import { fetchCountryEconomics } from '@/lib/trading-economics';
import { getCountryRiskInfo } from '@/lib/geographic-data';
import { calculateDalioDebtCycle } from '@/lib/dalio-model';

export async function fetchTradingEconomicsFallback(
  countryCode: string,
  teSlug: string
): Promise<any | null> {
  console.log(`[MacroAPI] Falling back to Trading Economics scraper for ${countryCode} (slug: ${teSlug})`);
  const teData = await fetchCountryEconomics(teSlug, countryCode);
  if (!teData) return null;

  const staticRisk = getCountryRiskInfo(countryCode);
  const payload = {
    ...teData,
    dataConfidence: 'medium',
    countryRisk: {
      ...staticRisk,
      rating: teData.creditRating && teData.creditRating !== 'N/A' ? teData.creditRating : staticRisk.rating,
      dataSource: 'static',
    },
  };

  return {
    ...payload,
    dalioDebtCycle: calculateDalioDebtCycle(countryCode, payload),
  };
}

export function buildFaltaDeTransparenciaPayload(countryCode: string): any {
  console.warn(`[MacroAPI] All ingestion methods failed for ${countryCode}. Returning Falta de Transparencia.`);
  return {
    gdpGrowth: 'N/A',
    inflation: 'N/A',
    interestRate: 'N/A',
    debtToGdp: 'N/A',
    corporateTax: 'N/A',
    unemployment: 'N/A',
    gdpPerCapita: 'N/A',
    tradeBalance: 'N/A',
    creditRating: 'N/A',
    rdSpending: 'N/A',
    tradingEconomicsSlug: countryCode.toLowerCase(),
    dataConfidence: 'none',
    countryRisk: getCountryRiskInfo(countryCode),
    dalioDebtCycle: {
      shortTermCyclePhase: 'Falta de Transparencia',
      longTermCyclePhase: 'Falta de Transparencia',
      productivityGrowthTrend: 'Sin Datos',
      levers: { austerity: 0, debtReduction: 0, wealthRedistribution: 0, moneyPrinting: 0 },
      deleveragingStatus: 'Falta de Transparencia',
      dalioCommentary: `Faltan datos macroeconómicos esenciales para evaluar el ciclo económico de ${countryCode}.`,
      dataConfidence: 'none',
      intensity: 0,
      effectiveInterestRate: 'N/A',
    },
  };
}
