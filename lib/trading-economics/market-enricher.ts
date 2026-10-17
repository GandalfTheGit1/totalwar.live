/**
 * lib/trading-economics/market-enricher.ts
 *
 * Enriches base economic data with FRED macro series (US), Supabase stock market stats,
 * and Ray Dalio debt cycle classifications.
 */

import type { CountryEconomicData } from '../geographic-data';
import { getStockMarketDetails } from '../geographic-data';
import { fetchUsFredMacroData, fetchUsMarginDebtHistory } from '../fred';
import { calculateDalioDebtCycle } from '../dalio-model';
import { supabase } from '../supabase';

interface DbMarginDebtPoint {
  month?: string;
  marginDebt: number;
  marginDebtPercent?: number;
  averageLeverage?: number;
  date?: string;
}

interface DbMarketDetails {
  market_name: string;
  margin_debt_history: DbMarginDebtPoint[] | null;
  buffett_indicator?: string;
}

export async function enrichWithUsFred(data: CountryEconomicData): Promise<void> {
  try {
    console.log('[TradingEconomics] Overriding US data with FRED API...');
    const fredData = await fetchUsFredMacroData();
    if (fredData) {
      data.debtToGdp = fredData.publicDebtToGdp;
      data.interestRate = fredData.interestRate;
      data.rdSpending = '3.4%'; // Standard US R&D
    }

    const fredHistory = await fetchUsMarginDebtHistory();
    if (fredHistory && fredHistory.length > 0) {
      data.marginDebtHistory = fredHistory;
      const latest = fredHistory[fredHistory.length - 1];
      if (latest) {
        data.stockMarketDebt = `$${latest.marginDebt}B USD (~${latest.marginDebtPercent}% de Cap. Bursátil)`;
        data.stockMarketLeverage = `${latest.averageLeverage.toFixed(3)}x (Apal. Margen)`;
      }
    }
  } catch (err) {
    console.error('[TradingEconomics] Failed to fetch FRED data:', err);
  }
}

async function fetchDbMarketDetails(code: string): Promise<DbMarketDetails | null> {
  try {
    const { data: dbData } = await supabase
      .from('country_market_stats')
      .select('market_name, margin_debt_history, buffett_indicator')
      .eq('country_code', code)
      .maybeSingle();
    return dbData as DbMarketDetails | null;
  } catch (dbErr) {
    console.error('[TradingEconomics] Error querying country_market_stats from Supabase:', dbErr);
    return null;
  }
}

function applyDbMarginDebt(
  data: CountryEconomicData,
  rawHistory: DbMarginDebtPoint[],
  exchangeRate: number,
): void {
  data.marginDebtHistory = rawHistory.map((point) => ({
    month: point.month || point.date || '',
    marginDebt: Math.round(point.marginDebt * exchangeRate * 100) / 100,
    marginDebtPercent: point.marginDebtPercent ?? 0,
    averageLeverage: point.averageLeverage ?? 0,
  }));
  const history = data.marginDebtHistory;
  const latest = history && history.length > 0 ? history[history.length - 1] : null;
  if (latest && latest.marginDebt !== undefined && latest.averageLeverage !== undefined) {
    data.stockMarketDebt = `$${latest.marginDebt}B USD (~${latest.marginDebtPercent}% de Cap. Bursátil)`;
    data.stockMarketLeverage = `${latest.averageLeverage}x (D/E Promedio)`;
  }
}

export async function enrichWithSupabaseMarket(
  code: string,
  data: CountryEconomicData,
  exchangeRate: number,
): Promise<void> {
  const fallbackDetails = getStockMarketDetails(code);
  const dbDetails = await fetchDbMarketDetails(code);

  data.stockMarketName = dbDetails?.market_name || fallbackDetails.stockMarketName;
  if (dbDetails?.buffett_indicator) {
    data.buffettIndicator = dbDetails.buffett_indicator;
  }
  data.exchangeRate = exchangeRate;

  if (!data.marginDebtHistory && dbDetails?.margin_debt_history && Array.isArray(dbDetails.margin_debt_history)) {
    applyDbMarginDebt(data, dbDetails.margin_debt_history, exchangeRate);
  }

  try {
    data.dalioDebtCycle = calculateDalioDebtCycle(code, data);
  } catch (err) {
    console.error(`[TradingEconomics] Failed to calculate Dalio cycle for ${code}:`, err);
  }
}
