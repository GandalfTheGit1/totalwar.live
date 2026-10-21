import { NextResponse } from 'next/server';
import { fetchWorldBankIndicatorsBatch } from '@/lib/macro/world-bank-client';
import {
  loadStaticMatrices,
  fetchCountryTacticalMetrics,
  evaluateCountryMechanics,
} from './mechanics-engine';

export const revalidate = 86400;

const WB_INDICATORS = [
  'GC.XPN.INTP.RV.ZS',
  'FI.RES.TOTL.MO',
  'NE.GDI.FTOT.ZS',
  'NV.IND.MANF.ZS',
  'NY.GDP.PCAP.CD',
  'EN.URB.MCTY.TL.ZS',
  'NY.GDP.TOTL.RT.ZS',
  'LP.LPI.INFR.XQ',
  'LP.LPI.TRAC.XQ',
  'LP.LPI.ITRN.XQ',
  'LP.LPI.CUST.XQ',
];

// Refactor reason: Extracted BDI fetching to decouple HTTP transport and error boundaries.
async function fetchBalticDryIndex(baseUrl: string): Promise<{ data: any; source: string }> {
  try {
    const res = await fetch(`${baseUrl}/api/dev/baltic-dry-index`);
    if (res.ok) {
      const data = await res.json();
      return { data, source: data?.source === 'scraped' ? 'scraped' : 'unavailable' };
    }
  } catch {
    console.log('[Source:BDI] Failed to fetch BDI route');
  }
  return { data: null, source: 'unavailable' };
}

// Refactor reason: Pure mapping of batch indicator observations into a per-country ISO3 lookup.
function buildWorldBankLookup(batchResults: Record<string, any[]>): Record<string, Record<string, number | null>> {
  const wbLookup: Record<string, Record<string, number | null>> = {};
  const wbYearLookup: Record<string, Record<string, number>> = {};
  for (const [indicatorId, records] of Object.entries(batchResults)) {
    for (const entry of records) {
      if (entry.value === null || entry.value === undefined) continue;
      const iso3 = (entry.countryIso3 || entry.countryCode || '').toUpperCase();
      if (!iso3) continue;
      if (!wbLookup[iso3]) {
        wbLookup[iso3] = {};
        wbYearLookup[iso3] = {};
      }
      const entryYear = typeof entry.year === 'number' ? entry.year : parseInt(entry.date, 10) || 0;
      const prevYear = wbYearLookup[iso3][indicatorId] ?? -1;
      if (entryYear >= prevYear) {
        wbLookup[iso3][indicatorId] = entry.value;
        wbYearLookup[iso3][indicatorId] = entryYear;
      }
    }
  }
  return wbLookup;
}

export async function GET(request: Request) {
  const { matrixData, resourcesData, tensionCache, geoLookup } = await loadStaticMatrices();

  let batchResults: Record<string, any>;
  try {
    console.log('[API:CountryMechanics] Fetching 11 World Bank indicators via canonical batch client...');
    batchResults = await fetchWorldBankIndicatorsBatch('all', WB_INDICATORS, {
      mrv: 1,
      perPage: 1000,
      delayBetweenRequestsMs: 30,
    });
  } catch (err: any) {
    console.error('[API:CountryMechanics] World Bank API batch fetch failed:', err?.message || err);
    // Fail Fast & Loud per Rules 7.5 and 11 (No Silent Mocks on Failure)
    return NextResponse.json(
      {
        error: `Failed to fetch World Bank indicators in Country Mechanics: ${err?.message || err}`,
        source: 'world-bank',
        failedAt: new Date().toISOString(),
      },
      { status: 500 }
    );
  }

  const wbLookup = buildWorldBankLookup(batchResults);
  const baseUrl = new URL(request.url).origin;
  const { source: bdiSource } = await fetchBalticDryIndex(baseUrl);

  const results: Record<string, any> = {};
  const allIsos = new Set<string>([...Object.keys(wbLookup), ...Object.keys(geoLookup)]);

  for (const iso3 of allIsos) {
    if (!iso3) continue;
    const wb = wbLookup[iso3] || {};
    const geo = geoLookup[iso3] || {};
    const tactical = await fetchCountryTacticalMetrics(baseUrl, geo.code, iso3, geo.name, bdiSource);

    results[iso3] = evaluateCountryMechanics({
      iso3,
      wb,
      geo,
      resourcesData,
      tensionCache,
      tactical,
    });
  }

  return NextResponse.json({
    data: results,
    generatedAt: new Date().toISOString(),
  });
}
