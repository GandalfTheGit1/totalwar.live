/**
 * @file sec-properties-service.ts
 * @description Hybrid SEC Item 2 (Properties) corporate facilities extraction and mapping service.
 * - O(1) retrieval for curated tech and industrial leaders.
 * - Semantic fallback against SEC EDGAR Item 2 using Gemini Flash Lite (LIGHT tier, Rule 5 LLM quota protection).
 * - Full integration with client/server cache (geoCache & geoCacheKeys.properties).
 * - Geopolitical risk score enrichment per geographical node.
 */

import {
  CorporateFacility,
  CURATED_CORPORATE_FACILITIES,
  FACILITY_TYPE_CONFIG,
  FacilityFunctionalType,
  FacilityTenure,
} from '@/lib/data/curated-corporate-facilities';
import { geoCache, geoCacheKeys, GEO_CACHE_TTLS } from '@/lib/cache/geo-indexeddb-cache';
import {
  FacilityStats,
  CITY_COORDINATES_MAP,
} from './sec-properties/types';
import { extractItem2PropertiesText } from './sec-properties/text-extractor';
import {
  enrichFacilityWithGeopoliticalRisk,
  computeFacilityStats,
} from './sec-properties/risk-and-stats';
import { extractFacilitiesViaLlm } from './sec-properties/llm-extractor';

export type { CorporateFacility, FacilityFunctionalType, FacilityTenure, FacilityStats };
export {
  FACILITY_TYPE_CONFIG,
  CITY_COORDINATES_MAP,
  extractItem2PropertiesText,
  enrichFacilityWithGeopoliticalRisk,
  computeFacilityStats,
  extractFacilitiesViaLlm,
};

async function fetchBrowserFacilities(cleanTicker: string): Promise<CorporateFacility[] | null> {
  try {
    const apiRes = await fetch(`/api/stocks/${cleanTicker}/facilities`);
    if (apiRes.ok) {
      const apiData = await apiRes.json();
      if (apiData.facilities && Array.isArray(apiData.facilities)) {
        return apiData.facilities;
      }
    }
  } catch {
    // Fall back to curated facilities
  }
  return null;
}

async function fetchEdgarPropertiesText(cleanTicker: string): Promise<string> {
  const nodeRequire = typeof __non_webpack_require__ !== 'undefined' ? __non_webpack_require__ : eval('require');
  const { findLatestFiling, getPrimaryDocument, downloadFilingHtml } = nodeRequire('../sec/sec-client');

  let filingResult = await findLatestFiling(cleanTicker, '10-K');
  let formType = '10-K';
  if (!filingResult) {
    console.log(`[SecPropertiesService] No 10-K found for ${cleanTicker}. Trying 20-F...`);
    filingResult = await findLatestFiling(cleanTicker, '20-F');
    formType = '20-F';
  }

  if (!filingResult) {
    console.warn(`[SecPropertiesService] No 10-K or 20-F filing found in SEC EDGAR for ${cleanTicker}`);
    return '';
  }

  console.log(`[SecPropertiesService] Found ${formType} filing for ${cleanTicker} (${filingResult.accessionNumber}). Fetching primary document...`);
  const docUrl = await getPrimaryDocument(filingResult.cik, filingResult.accessionNumber, formType);
  if (!docUrl) {
    console.warn(`[SecPropertiesService] Could not resolve primary document URL for ${cleanTicker}`);
    return '';
  }

  console.log(`[SecPropertiesService] Downloading filing HTML from ${docUrl}...`);
  const filingHtml = await downloadFilingHtml(docUrl);
  if (!filingHtml) {
    console.warn(`[SecPropertiesService] Failed to download filing HTML for ${cleanTicker}`);
    return '';
  }

  const item2Text = extractItem2PropertiesText(filingHtml);
  console.log(`[SecPropertiesService] Extracted ${item2Text.length} characters of Item 2 Properties text for ${cleanTicker}`);
  return item2Text;
}

export class SecPropertiesService {
  /**
   * Returns curated facilities for a given ticker, or all facilities if no ticker is provided.
   * Instant O(1) synchronous operation for 60fps UI renders.
   */
  public getCuratedFacilities(ticker?: string): CorporateFacility[] {
    if (!ticker || ticker.toUpperCase() === 'ALL') {
      const all: CorporateFacility[] = [];
      for (const list of Object.values(CURATED_CORPORATE_FACILITIES)) {
        all.push(...list.map(f => this.enrichFacilityWithGeopoliticalRisk(f)));
      }
      return all;
    }

    const cleanTicker = ticker.toUpperCase().trim();
    const curated = CURATED_CORPORATE_FACILITIES[cleanTicker];
    if (curated) {
      return curated.map(f => this.enrichFacilityWithGeopoliticalRisk(f));
    }

    return [];
  }

  /**
   * Retrieves facilities for a ticker with full hybrid fallback pipeline:
   * 1. O(1) curated dataset check
   * 2. L1/L2 cache check (geoCache)
   * 3. SEC EDGAR Item 2 extraction + Gemini Flash Lite (LIGHT tier)
   */
  public async getFacilitiesForTicker(ticker: string, providedItem2Text?: string): Promise<CorporateFacility[]> {
    if (!ticker || typeof ticker !== 'string') return [];
    const cleanTicker = ticker.toUpperCase().trim();

    // 1. O(1) Curated check
    const curated = CURATED_CORPORATE_FACILITIES[cleanTicker];
    if (curated && curated.length > 0) {
      return curated.map(f => this.enrichFacilityWithGeopoliticalRisk(f));
    }

    // 2. Cache check
    const cacheKey = geoCacheKeys.properties(cleanTicker);
    const cached = await geoCache.get<CorporateFacility[]>(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached.map(f => this.enrichFacilityWithGeopoliticalRisk(f));
    }

    // 3. Fallback extraction: Parse Item 2 Properties text
    let item2Text = providedItem2Text;
    if (!item2Text) {
      if (typeof window !== 'undefined') {
        const browserRes = await fetchBrowserFacilities(cleanTicker);
        if (browserRes) return browserRes;
        return this.getCuratedFacilities(cleanTicker);
      }
      item2Text = await fetchEdgarPropertiesText(cleanTicker);
    }

    if (!item2Text) return [];

    const cleanedSection = extractItem2PropertiesText(item2Text) || item2Text;
    if (!cleanedSection || cleanedSection.length < 50) {
      console.log(`[SecPropertiesService] Item 2 Properties section too short or empty for ${cleanTicker}`);
      return [];
    }

    // 4. LLM Extraction using Gemini Flash Lite (LIGHT tier, Rule 5 quota protection)
    console.log(`[SecPropertiesService] Invoking Gemini Flash Lite to extract Item 2 facilities for ${cleanTicker}...`);
    const extractedFacilities = await this.extractFacilitiesViaLlm(cleanTicker, cleanedSection);
    const enriched = extractedFacilities.map(f => this.enrichFacilityWithGeopoliticalRisk(f));

    if (enriched.length > 0) {
      await geoCache.set(cacheKey, enriched, GEO_CACHE_TTLS.PROPERTIES);
    }

    return enriched;
  }

  public async extractFacilitiesViaLlm(ticker: string, item2Text: string): Promise<CorporateFacility[]> {
    return extractFacilitiesViaLlm(ticker, item2Text);
  }

  public enrichFacilityWithGeopoliticalRisk(facility: CorporateFacility): CorporateFacility {
    return enrichFacilityWithGeopoliticalRisk(facility);
  }

  public computeFacilityStats(facilities: CorporateFacility[]): FacilityStats {
    return computeFacilityStats(facilities);
  }
}

export const secPropertiesService = new SecPropertiesService();
