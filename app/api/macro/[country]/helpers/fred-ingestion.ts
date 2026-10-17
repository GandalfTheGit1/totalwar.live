/**
 * app/api/macro/[country]/helpers/fred-ingestion.ts
 *
 * Ingestion pipeline for FRED, BIS, and ECB macroeconomic data.
 * Computes 4 Dalio pillars and calculates the Dalio Debt Cycle.
 */

import { fetchFredSeries } from '@/lib/fred';
import {
  fetchBisPrivateCredit,
  fetchBisDsr,
  periodToQuarterCode,
} from '@/lib/macro/bis-client';
import { fetchBundSpread } from '@/lib/macro/ecb-client';
import {
  resampleToQuarterly,
  QuarterlyObservation,
  RawObservation,
} from '@/lib/macro/temporal-align';
import { calculateDalioDebtCycle } from '@/lib/dalio-model';
import { fetchCountryEconomics } from '@/lib/trading-economics';

export function calculateYoYChange(observations: QuarterlyObservation[]): QuarterlyObservation[] {
  const results: QuarterlyObservation[] = [];
  for (let i = 0; i < observations.length; i++) {
    const current = observations[i];
    const currentCode = periodToQuarterCode(current.period);
    const targetCode = currentCode - 4;
    const prev = observations.find((o) => periodToQuarterCode(o.period) === targetCode);
    if (prev && prev.value > 0) {
      const yoy = ((current.value - prev.value) / prev.value) * 100;
      results.push({ period: current.period, value: Math.round(yoy * 100) / 100 });
    }
  }
  return results;
}

export async function fetchAndResample(
  seriesId: string | null,
  limit = 40,
  isIndex = false
): Promise<QuarterlyObservation[]> {
  if (!seriesId) return [];
  const obs = await fetchFredSeries(seriesId, limit);
  const raw: RawObservation[] = obs
    .map((o: any) => ({ date: o.date, value: parseFloat(o.value) }))
    .filter((o: any) => !isNaN(o.value));
  const quarterly = resampleToQuarterly(raw);
  return isIndex ? calculateYoYChange(quarterly) : quarterly;
}

export function getLatestAndPrev(quarterly: QuarterlyObservation[], percentSuffix = true) {
  if (quarterly.length === 0) return { actual: 'N/A', prev: 'N/A', latestNum: null as number | null };
  const actualVal = quarterly[quarterly.length - 1].value;
  const prevVal = quarterly.length > 1 ? quarterly[quarterly.length - 2].value : actualVal;
  const suffix = percentSuffix ? '%' : '';
  const sign = percentSuffix && actualVal > 0 ? '+' : '';
  const prevSign = percentSuffix && prevVal > 0 ? '+' : '';
  return {
    actual: `${sign}${actualVal.toFixed(2)}${suffix}`,
    prev: `${prevSign}${prevVal.toFixed(2)}${suffix}`,
    latestNum: actualVal,
  };
}

async function calculateSovereignSpread(countryCode: string, seriesMap: any) {
  let embi = 0;
  let classification = 'Bajo';
  let riskMetricType = 'zero-risk';

  const eurozone = ['DE', 'FR', 'IT', 'ES', 'IE'];
  if (eurozone.includes(countryCode)) {
    const ecbSpread = await fetchBundSpread(countryCode);
    if (ecbSpread) {
      embi = ecbSpread.spread;
      riskMetricType = 'bund-spread';
      classification = embi < 30 ? 'Bajo' : embi <= 100 ? 'Moderado' : embi <= 250 ? 'Alto' : 'Extremo';
    }
  } else if (['GB', 'JP'].includes(countryCode) && seriesMap.bondYield10Y) {
    const us10Y = await fetchAndResample('DGS10', 5);
    const country10Y = await fetchAndResample(seriesMap.bondYield10Y, 5);
    if (us10Y.length > 0 && country10Y.length > 0) {
      embi = Math.round((country10Y[country10Y.length - 1].value - us10Y[us10Y.length - 1].value) * 100);
      riskMetricType = 'bond-spread';
      classification = embi < 30 ? 'Bajo' : embi <= 100 ? 'Moderado' : embi <= 250 ? 'Alto' : 'Extremo';
    }
  }

  return { embi, classification, riskMetricType };
}

function normalizeDebtToGdp(debtToGdpRaw: QuarterlyObservation[]): QuarterlyObservation[] {
  if (debtToGdpRaw.length === 0) return [];
  const latestDebt = debtToGdpRaw[debtToGdpRaw.length - 1].value;
  if (latestDebt > 0 && latestDebt <= 3.0) {
    return debtToGdpRaw.map((o) => ({ ...o, value: Math.round(o.value * 10000) / 100 }));
  }
  if (latestDebt > 500) return [];
  return debtToGdpRaw;
}

export async function fetchFredMacroPayload(
  countryCode: string,
  curYear: number,
  curQuarter: number,
  seriesMap: any,
  teSlug: string
): Promise<any> {
  const gdpRawQuarterly = await fetchAndResample(seriesMap.gdpGrowth, 24);
  let gdpQuarterly = gdpRawQuarterly;
  if (gdpRawQuarterly.length > 0 && Math.abs(gdpRawQuarterly[gdpRawQuarterly.length - 1].value) > 100) {
    const yoyGdp = calculateYoYChange(gdpRawQuarterly);
    if (yoyGdp.length > 0) gdpQuarterly = yoyGdp;
  }

  const gdpNominalQuarterly = await fetchAndResample(seriesMap.gdpNominal, 20, false);
  const productivityQuarterly = await fetchAndResample(seriesMap.productivityPerHour, 20, true);
  const cpiQuarterly = await fetchAndResample(seriesMap.cpi, 60, true);
  const pceQuarterly = await fetchAndResample(seriesMap.pce, 60, true);
  const policyRateQuarterly = await fetchAndResample(seriesMap.policyRate, 20);
  const yieldSpreadQuarterly = await fetchAndResample(seriesMap.yieldSpread10Y2Y, 20);
  const consumerCreditQuarterly = await fetchAndResample(seriesMap.consumerCredit, 20, true);
  const businessLoansQuarterly = await fetchAndResample(seriesMap.businessLoans, 40, true);
  const debtToGdpQuarterly = normalizeDebtToGdp(await fetchAndResample(seriesMap.debtToGdp, 10));
  const householdDebtQuarterly = await fetchAndResample(seriesMap.householdDebtToGdp, 10);
  const householdDsrQuarterly = await fetchAndResample(seriesMap.householdDsr, 20);
  const homePriceQuarterly = await fetchAndResample(seriesMap.homePriceIndex, 60, true);
  const privateCreditQuarterly = await fetchBisPrivateCredit(countryCode, curYear, curQuarter);
  const dsrQuarterly = await fetchBisDsr(countryCode, curYear, curQuarter);
  const cbAssetsQuarterly = await fetchAndResample(seriesMap.centralBankAssets, 160, false);
  const m2Quarterly = await fetchAndResample(seriesMap.m2, 60, true);
  const fiscalDeficitQuarterly = await fetchAndResample(seriesMap.fiscalDeficit, 10, false);
  const avgDebtRateQuarterly = await fetchAndResample(seriesMap.avgDebtInterestRate, 10);
  const fyointQuarterly = await fetchAndResample(seriesMap.fyoint || null, 10);
  const fygfdQuarterly = await fetchAndResample(seriesMap.fygfd || null, 10);

  const sovereignSpread = await calculateSovereignSpread(countryCode, seriesMap);
  const teDataFallback = await fetchCountryEconomics(teSlug, countryCode);

  const yieldSpread = getLatestAndPrev(yieldSpreadQuarterly);
  const yieldSpreadNum = yieldSpread.latestNum;
  const yieldCurveStatus =
    yieldSpreadNum === null
      ? 'N/A'
      : yieldSpreadNum < 0
        ? `⚠️ Invertida (${yieldSpreadNum.toFixed(2)}%)`
        : `Normal (+${yieldSpreadNum.toFixed(2)}%)`;

  const payload: any = {
    gdpGrowth: getLatestAndPrev(gdpQuarterly).actual !== 'N/A' ? getLatestAndPrev(gdpQuarterly).actual : teDataFallback?.gdpGrowth || 'N/A',
    gdpGrowthPrevious: getLatestAndPrev(gdpQuarterly).prev !== 'N/A' ? getLatestAndPrev(gdpQuarterly).prev : teDataFallback?.gdpGrowthPrevious || 'N/A',
    inflation: getLatestAndPrev(cpiQuarterly).actual !== 'N/A' ? getLatestAndPrev(cpiQuarterly).actual : teDataFallback?.inflation || 'N/A',
    inflationPrevious: getLatestAndPrev(cpiQuarterly).prev !== 'N/A' ? getLatestAndPrev(cpiQuarterly).prev : teDataFallback?.inflationPrevious || 'N/A',
    interestRate: getLatestAndPrev(policyRateQuarterly).actual !== 'N/A' ? getLatestAndPrev(policyRateQuarterly).actual : teDataFallback?.interestRate || 'N/A',
    interestRatePrevious: getLatestAndPrev(policyRateQuarterly).prev !== 'N/A' ? getLatestAndPrev(policyRateQuarterly).prev : teDataFallback?.interestRatePrevious || 'N/A',
    debtToGdp: getLatestAndPrev(debtToGdpQuarterly).actual !== 'N/A' ? getLatestAndPrev(debtToGdpQuarterly).actual : teDataFallback?.debtToGdp || 'N/A',
    debtToGdpPrevious: getLatestAndPrev(debtToGdpQuarterly).prev !== 'N/A' ? getLatestAndPrev(debtToGdpQuarterly).prev : teDataFallback?.debtToGdpPrevious || 'N/A',
    unemployment: teDataFallback?.unemployment || 'N/A',
    unemploymentPrevious: teDataFallback?.unemploymentPrevious || 'N/A',
    gdpPerCapita: teDataFallback?.gdpPerCapita || 'N/A',
    gdpPerCapitaPrevious: teDataFallback?.gdpPerCapitaPrevious || 'N/A',
    tradeBalance: teDataFallback?.tradeBalance || 'N/A',
    tradeBalancePrevious: teDataFallback?.tradeBalancePrevious || 'N/A',
    corporateTax: teDataFallback?.corporateTax || 'N/A',
    corporateTaxPrevious: teDataFallback?.corporateTaxPrevious || 'N/A',
    creditRating: teDataFallback?.creditRating || 'N/A',
    creditRatingPrevious: teDataFallback?.creditRatingPrevious || 'N/A',
    rdSpending: teDataFallback?.rdSpending || '1.5%',
    rdSpendingPrevious: teDataFallback?.rdSpendingPrevious || 'N/A',
    exchangeRate: teDataFallback?.exchangeRate || 1.0,
    tradingEconomicsSlug: teSlug,
    dataConfidence: 'high',
    nominalGdpGrowth: getLatestAndPrev(calculateYoYChange(gdpNominalQuarterly)).actual,
    productivityPerHour: getLatestAndPrev(productivityQuarterly).actual,
    pce: getLatestAndPrev(pceQuarterly).actual,
    pcePrevious: getLatestAndPrev(pceQuarterly).prev,
    yieldSpread10Y2Y: yieldSpread.actual,
    yieldCurveStatus,
    consumerCreditGrowth: getLatestAndPrev(consumerCreditQuarterly).actual,
    businessLoansGrowth: getLatestAndPrev(businessLoansQuarterly).actual,
    householdDebtToGdp: getLatestAndPrev(householdDebtQuarterly).actual,
    householdDebtToGdpPrevious: getLatestAndPrev(householdDebtQuarterly).prev,
    householdDsr: getLatestAndPrev(householdDsrQuarterly).actual,
    householdDsrPrevious: getLatestAndPrev(householdDsrQuarterly).prev,
    homePriceGrowth: getLatestAndPrev(homePriceQuarterly).actual,
    homePriceGrowthPrevious: getLatestAndPrev(homePriceQuarterly).prev,
    privateCreditGdp: getLatestAndPrev(privateCreditQuarterly).actual,
    dsr: getLatestAndPrev(dsrQuarterly).actual,
    cbAssetsYoY: getLatestAndPrev(calculateYoYChange(cbAssetsQuarterly)).actual,
    m2Growth: getLatestAndPrev(m2Quarterly).actual,
    fiscalDeficitMillions: getLatestAndPrev(fiscalDeficitQuarterly, false).actual,
    avgDebtInterestRate: getLatestAndPrev(avgDebtRateQuarterly).actual,
    fyoint: fyointQuarterly.length > 0 ? fyointQuarterly[fyointQuarterly.length - 1].value.toString() : undefined,
    fygfd: fygfdQuarterly.length > 0 ? fygfdQuarterly[fygfdQuarterly.length - 1].value.toString() : undefined,
    countryRisk: {
      embi: sovereignSpread.embi,
      rating: teDataFallback?.creditRating || 'N/A',
      classification: sovereignSpread.classification,
      riskMetricType: sovereignSpread.riskMetricType,
      dataSource: 'live',
    },
  };

  payload.dalioDebtCycle = calculateDalioDebtCycle(countryCode, payload);
  return payload;
}
