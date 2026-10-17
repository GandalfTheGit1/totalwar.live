/**
 * Route: app/api/macro/[country]/route.ts
 *
 * Unified macroeconomic ingestion pipeline — Full Ray Dalio model variables.
 * Decomposed into modular helpers under ./helpers/:
 * - country-codes.ts: ISO-2/3 conversion and Trading Economics slug resolver
 * - cache-manager.ts: Supabase macro_country_cache reader and writer
 * - fred-ingestion.ts: Live FRED, BIS, and ECB pipeline for Dalio pillars
 * - fallback-builder.ts: Trading Economics scraper and transparency gap fallbacks
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCountryFredSeriesMap } from '@/lib/macro/fred-series-map';
import { getCurrentQuarter } from '@/lib/macro/bis-client';
import { withMonitor } from '@/lib/api-monitor';
import { logError } from '@/lib/server-logger';
import { resolveCountryCode, resolveTradingEconomicsSlug } from './helpers/country-codes';
import { getCachedMacroPayload, saveMacroPayloadToCache } from './helpers/cache-manager';
import { fetchFredMacroPayload } from './helpers/fred-ingestion';
import { fetchTradingEconomicsFallback, buildFaltaDeTransparenciaPayload } from './helpers/fallback-builder';

async function ingestMacroPayload(
  countryCode: string,
  curYear: number,
  curQuarter: number,
  teSlug: string
): Promise<{ payload: any; isFred: boolean }> {
  const seriesMap = getCountryFredSeriesMap(countryCode);
  if (seriesMap) {
    try {
      const payload = await fetchFredMacroPayload(countryCode, curYear, curQuarter, seriesMap, teSlug);
      console.log(`[MacroAPI] ✅ FRED/BIS/ECB pipeline completed for ${countryCode}. Confidence: high`);
      return { payload, isFred: true };
    } catch (ingestErr) {
      console.error(`[MacroAPI] Failed to fetch live FRED/BIS data for ${countryCode}:`, ingestErr);
    }
  }

  const tePayload = await fetchTradingEconomicsFallback(countryCode, teSlug);
  if (tePayload) {
    return { payload: tePayload, isFred: false };
  }

  return { payload: buildFaltaDeTransparenciaPayload(countryCode), isFred: false };
}

async function GET_HANDLER(
  request: NextRequest,
  { params }: { params: Promise<{ country: string }> }
) {
  try {
    const { country } = await params;
    const countryCode = resolveCountryCode(country);

    if (!countryCode) {
      return NextResponse.json({ error: 'Country code is required' }, { status: 400 });
    }

    const { year: curYear, quarter: curQuarter } = getCurrentQuarter();
    const currentPeriod = `${curYear}-Q${curQuarter}`;

    const cached = await getCachedMacroPayload(countryCode, currentPeriod);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' },
      });
    }

    console.log(`[MacroAPI] Cache MISS/Stale for ${countryCode}. Executing ingestion pipeline...`);
    const teSlug = resolveTradingEconomicsSlug(countryCode);
    const { payload, isFred } = await ingestMacroPayload(countryCode, curYear, curQuarter, teSlug);

    await saveMacroPayloadToCache(countryCode, currentPeriod, payload, isFred);

    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' },
    });
  } catch (error) {
    logError('API Macro Route', error, { step: 'Execution error:' });
    return NextResponse.json(
      {
        error: 'Internal server error while fetching macro data',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export const GET = withMonitor(GET_HANDLER as any, 'External APIs');
