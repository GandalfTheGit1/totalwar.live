import { logError } from "@/lib/server-logger";

const USER_AGENT = 'v0-equity-analysis-buffett geographic-module@example.com';

export function stripCountryBadge(name: string): string {
  return name.replace(/\s*⚠️.*$/, '').trim();
}

export async function fetchJson(url: string) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.json();
  } catch (error) {
    logError('Geographic Route', error, { step: `Error fetching JSON from ${url}:` });
    throw error;
  }
}

export async function resolveCik(ticker: string): Promise<{ cik: string; name: string } | null> {
  const upper = ticker.toUpperCase();
  try {
    const tickers = await fetchJson('https://www.sec.gov/files/company_tickers.json');
    for (const entry of Object.values(tickers) as any[]) {
      if (entry.ticker?.toUpperCase() === upper) {
        return {
          cik: String(entry.cik_str).padStart(10, '0'),
          name: entry.title,
        };
      }
    }
  } catch (e) {
    logError('API Route', e, { step: `Error resolving CIK:` });
  }
  return null;
}
