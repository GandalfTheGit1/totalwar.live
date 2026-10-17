import { rateLimitedFetch } from './macro/rate-limited-queue';
import { getCachedApiResponse, setCachedApiResponse } from './api-cache';
import { MarginDebtHistoryPoint } from './geographic-data';

const FRED_API_KEY = '64c33e2e69454db947fa5b4a7ef3b0ba';
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred';

export interface FredObservation {
  date: string;
  value: string;
}

/**
 * Fetch observations for a given FRED series ID.
 * Returns the observations sorted descending by date (latest first).
 */
export async function fetchFredSeries(
  seriesId: string,
  limit = 5
): Promise<FredObservation[]> {
  const cacheKey = `fred:series:${seriesId}:limit:${limit}`;
  const cached = await getCachedApiResponse(cacheKey);
  if (cached) {
    console.log(`[FRED] ✅ Cache hit for series ${seriesId}`);
    return cached as FredObservation[];
  }

  const url = `${FRED_BASE_URL}/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=${limit}`;

  try {
    const res = await rateLimitedFetch(url, { revalidateSeconds: 3600 });

    if (!res.ok) {
      console.error(`[FRED] Fetch failed for series ${seriesId}: ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (data && Array.isArray(data.observations)) {
      const observations = data.observations.map((obs: any) => ({
        date: obs.date,
        value: obs.value,
      }));
      await setCachedApiResponse(cacheKey, 'fred', 'observations', observations, 24);
      return observations;
    }

    return [];
  } catch (err) {
    console.error(`[FRED] Exception during fetch for series ${seriesId}:`, err);
    return [];
  }
}

export interface FredMacroData {
  publicDebtToGdp: string;
  interestRate: string;
  moneyPrintingYoY: string;
  m2YoY: string;
  productivityGrowth: string;
  fiscalDeficitToGdp: string;
}

/**
 * Fetch US macroeconomic indicators from FRED to calculate Ray Dalio cycle parameters.
 */
export async function fetchUsFredMacroData(): Promise<FredMacroData | null> {
  try {
    // Sequential fetches to respect LLM Concurrency & Quota Protection Rules
    const debtObs = await fetchFredSeries('GFDEGDQ188S', 1);
    const rateObs = await fetchFredSeries('FEDFUNDS', 1);
    const assetsObs = await fetchFredSeries('WALCL', 53); // Fetch 53 points to calculate 1-year YoY change
    const m2Obs = await fetchFredSeries('M2SL', 13);  // Fetch 13 points to calculate 1-year YoY change
    const gdpPerCapObs = await fetchFredSeries('A939RX0Q048SBEA', 5); // Fetch 5 points to calculate YoY change
    const deficitObs = await fetchFredSeries('FYFSD', 1);

    // Parse values with 'N/A' fallbacks instead of mock strings
    const publicDebtToGdp = debtObs[0]?.value ? `${parseFloat(debtObs[0].value).toFixed(1)}%` : 'N/A';
    const interestRate = rateObs[0]?.value ? `${parseFloat(rateObs[0].value).toFixed(2)}%` : 'N/A';

    // Money Printing YoY growth (Fed Assets)
    let moneyPrintingYoY = '0.0%';
    if (assetsObs.length >= 52) {
      const current = parseFloat(assetsObs[0].value);
      const yearAgo = parseFloat(assetsObs[51].value); // Approx 1 year ago (weekly data)
      if (!isNaN(current) && !isNaN(yearAgo) && yearAgo > 0) {
        const pct = ((current - yearAgo) / yearAgo) * 100;
        moneyPrintingYoY = `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
      }
    }

    // M2 Money Supply YoY growth
    let m2YoY = '0.0%';
    if (m2Obs.length >= 12) {
      const current = parseFloat(m2Obs[0].value);
      const yearAgo = parseFloat(m2Obs[11].value); // 12 months ago
      if (!isNaN(current) && !isNaN(yearAgo) && yearAgo > 0) {
        const pct = ((current - yearAgo) / yearAgo) * 100;
        m2YoY = `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
      }
    }

    // Productivity Growth YoY (Real GDP per Capita YoY)
    let productivityGrowth = 'N/A';
    if (gdpPerCapObs.length >= 5) {
      const current = parseFloat(gdpPerCapObs[0].value);
      const yearAgo = parseFloat(gdpPerCapObs[4].value); // 4 quarters ago
      if (!isNaN(current) && !isNaN(yearAgo) && yearAgo > 0) {
        const pct = ((current - yearAgo) / yearAgo) * 100;
        productivityGrowth = `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
      }
    }

    // Fiscal Deficit
    let fiscalDeficitToGdp = 'N/A';
    if (deficitObs[0]?.value) {
      const surplusDeficitMillions = parseFloat(deficitObs[0].value); // Federal surplus/deficit in millions
      // Approximate US Nominal GDP in trillions (e.g. 28.5T) to scale the deficit
      // nominal GDP is around $28,500,000 million
      const approxNominalGdpMillions = 28500000;
      if (!isNaN(surplusDeficitMillions)) {
        const pct = (surplusDeficitMillions / approxNominalGdpMillions) * 100;
        fiscalDeficitToGdp = `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
      }
    }

    return {
      publicDebtToGdp,
      interestRate,
      moneyPrintingYoY,
      m2YoY,
      productivityGrowth,
      fiscalDeficitToGdp
    };
  } catch (err) {
    console.error('[FRED] Error in aggregating macro indicators:', err);
    return null;
  }
}

export async function fetchUsMarginDebtHistory(): Promise<MarginDebtHistoryPoint[]> {
  try {
    console.log('[FRED] Fetching U.S. Margin Debt (BOGZ1FL663067003Q) and Corporate Equities Liability (BOGZ1LM883164105Q)...');
    
    // Sequential fetches to respect LLM Concurrency & Quota Protection Rules
    const debtObs = await fetchFredSeries('BOGZ1FL663067003Q', 40); // Receivables/Margin Debt (USD Millions)
    const capObs = await fetchFredSeries('BOGZ1LM883164105Q', 40);  // Total Equities Market Cap (USD Millions)
    
    if (debtObs.length === 0 || capObs.length === 0) {
      console.warn('[FRED] Missing observations for U.S. Margin Debt or Market Cap.');
      return [];
    }
    
    // Create a map of market cap values indexed by date
    const capMap = new Map<string, number>();
    for (const obs of capObs) {
      const val = parseFloat(obs.value);
      if (!isNaN(val) && val > 0) {
        capMap.set(obs.date, val);
      }
    }
    
    const points: MarginDebtHistoryPoint[] = [];
    for (const obs of debtObs) {
      const debtVal = parseFloat(obs.value);
      const capVal = capMap.get(obs.date);
      
      if (!isNaN(debtVal) && capVal) {
        // Parse date (YYYY-MM-DD) into quarter string: T1 26, T4 25, etc.
        const parts = obs.date.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]);
          
          let quarter = 1;
          if (month >= 4 && month <= 6) quarter = 2;
          else if (month >= 7 && month <= 9) quarter = 3;
          else if (month >= 10 && month <= 12) quarter = 4;
          
          const shortYear = year % 100;
          const periodStr = `T${quarter} ${shortYear < 10 ? '0' + shortYear : shortYear}`;
          
          // Calculate values:
          // marginDebt: in Billions USD (debtVal is in Millions, so divide by 1000)
          const marginDebt = Math.round((debtVal / 1000) * 100) / 100;
          // marginDebtPercent: (debt / marketCap) * 100
          const marginDebtPercent = Math.round((debtVal / capVal) * 10000) / 100;
          // averageLeverage: 1 + (debt / marketCap)
          const averageLeverage = Math.round((1 + (debtVal / capVal)) * 10000) / 10000;
          
          points.push({
            month: periodStr,
            marginDebt,
            marginDebtPercent,
            averageLeverage
          });
        }
      }
    }
    
    // Return chronologically sorted (ascending by date)
    return points.reverse();
  } catch (err) {
    console.error('[FRED] Error fetching U.S. Margin Debt history:', err);
    return [];
  }
}
