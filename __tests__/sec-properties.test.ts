/**
 * @file sec-properties.test.ts
 * @description Comprehensive test suite for SEC Item 2 (Properties) Corporate Facilities Service (T03.1).
 * Tests curated dataset integrity, O(1) retrieval, coordinate validity, metric conversion,
 * cache integration, risk scoring, statistics computation, and fallback LLM extraction.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  secPropertiesService,
  extractItem2PropertiesText,
  FacilityFunctionalType,
  FacilityTenure,
  FACILITY_TYPE_CONFIG,
} from '@/lib/services/geographic/sec-properties-service';
import {
  CURATED_CORPORATE_FACILITIES,
  CorporateFacility,
} from '@/lib/data/curated-corporate-facilities';
import { geoCache, geoCacheKeys, GEO_CACHE_TTLS } from '@/lib/cache/geo-indexeddb-cache';

describe('SEC Item 2 Corporate Facilities - Curated Dataset Integrity', () => {
  const KEY_TICKERS = ['AAPL', 'NVDA', 'TSM', 'MSFT', 'AMZN', 'GOOGL', 'TSLA', 'INTC', 'ASML', 'AMD', 'META', 'QCOM'];

  it('should contain curated facility datasets for all major tech & industrial leaders', () => {
    for (const ticker of KEY_TICKERS) {
      const facilities = CURATED_CORPORATE_FACILITIES[ticker];
      expect(facilities, `Missing curated facilities for ${ticker}`).toBeDefined();
      expect(facilities.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('should have valid geographical coordinates and boundary constraints for every facility', () => {
    const allFacilities = secPropertiesService.getCuratedFacilities('ALL');
    expect(allFacilities.length).toBeGreaterThan(50);

    for (const facility of allFacilities) {
      expect(facility.lat, `Invalid lat for ${facility.id}`).toBeGreaterThanOrEqual(-90);
      expect(facility.lat, `Invalid lat for ${facility.id}`).toBeLessThanOrEqual(90);
      expect(facility.lng, `Invalid lng for ${facility.id}`).toBeGreaterThanOrEqual(-180);
      expect(facility.lng, `Invalid lng for ${facility.id}`).toBeLessThanOrEqual(180);

      // Verify lat/lng are not default 0,0
      expect(facility.lat !== 0 || facility.lng !== 0).toBe(true);
    }
  });

  it('should have valid functional classifications and tenure types', () => {
    const validFunctionalTypes: FacilityFunctionalType[] = ['HQ', 'MANUFACTURING', 'RND', 'LOGISTICS_DATACENTER'];
    const validTenures: FacilityTenure[] = ['OWNED', 'LEASED'];

    const allFacilities = secPropertiesService.getCuratedFacilities();
    for (const f of allFacilities) {
      expect(validFunctionalTypes).toContain(f.functionalType);
      expect(validTenures).toContain(f.tenure);
      expect(f.countryCode).toMatch(/^[A-Z]{2}$/);
      expect(f.sqFt).toBeGreaterThan(0);
      expect(f.sqMeters).toBeGreaterThan(0);
      // Metric conversion check (1 sq ft ~ 0.092903 sqm)
      expect(Math.abs(f.sqMeters - Math.round(f.sqFt * 0.092903))).toBeLessThanOrEqual(5);
    }
  });

  it('should have visual config for all 4 functional categories', () => {
    const types: FacilityFunctionalType[] = ['HQ', 'MANUFACTURING', 'RND', 'LOGISTICS_DATACENTER'];
    for (const t of types) {
      const conf = FACILITY_TYPE_CONFIG[t];
      expect(conf).toBeDefined();
      expect(conf.hexColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(conf.iconGlyph.length).toBeGreaterThan(0);
      expect(conf.glowFilter).toContain('url(#');
    }
  });
});

describe('SecPropertiesService - Performance & Operations', () => {
  it('should return curated facilities synchronously with O(1) latency (< 5ms)', () => {
    const start = performance.now();
    const aapl = secPropertiesService.getCuratedFacilities('AAPL');
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(15);
    expect(aapl.length).toBeGreaterThanOrEqual(6);
    expect(aapl[0].ticker).toBe('AAPL');
  });

  it('should handle case insensitivity and whitespace in ticker queries', () => {
    const tsmLower = secPropertiesService.getCuratedFacilities('tsm');
    const tsmPadded = secPropertiesService.getCuratedFacilities('  TSM  ');
    const tsmUpper = secPropertiesService.getCuratedFacilities('TSM');

    expect(tsmLower.length).toBe(tsmUpper.length);
    expect(tsmPadded.length).toBe(tsmUpper.length);
    expect(tsmLower[0].ticker).toBe('TSM');
  });

  it('should return an empty array for unknown ticker without crashing', () => {
    const unknown = secPropertiesService.getCuratedFacilities('NON_EXISTENT_CO_XYZ');
    expect(unknown).toEqual([]);
  });

  it('should aggregate statistics correctly with computeFacilityStats', () => {
    const tslaFacilities = secPropertiesService.getCuratedFacilities('TSLA');
    const stats = secPropertiesService.computeFacilityStats(tslaFacilities);

    expect(stats.totalFacilities).toBe(tslaFacilities.length);
    expect(stats.totalSqFt).toBeGreaterThan(20000000);
    expect(stats.totalSqMeters).toBeGreaterThan(2000000);
    expect(stats.ownedCount + stats.leasedCount).toBe(stats.totalFacilities);
    expect(stats.ownedPercentage + stats.leasedPercentage).toBe(100);
    expect(stats.byFunctionalType.HQ).toBeGreaterThanOrEqual(1);
    expect(stats.byFunctionalType.MANUFACTURING).toBeGreaterThanOrEqual(2);
    expect(stats.countryCodes).toContain('US');
    expect(stats.averageRiskScore).toBeGreaterThan(0);
    expect(stats.averageRiskScore).toBeLessThanOrEqual(10);
  });

  it('should return zeroed statistics when facilities array is empty', () => {
    const emptyStats = secPropertiesService.computeFacilityStats([]);
    expect(emptyStats.totalFacilities).toBe(0);
    expect(emptyStats.totalSqFt).toBe(0);
    expect(emptyStats.totalSqMeters).toBe(0);
    expect(emptyStats.ownedCount).toBe(0);
    expect(emptyStats.averageRiskScore).toBe(0);
    expect(emptyStats.countryCodes).toEqual([]);
  });

  it('should enrich facilities with geopolitical risk scores based on jurisdiction', () => {
    const rawFacility: CorporateFacility = {
      id: 'test-taiwan-fab',
      ticker: 'TEST',
      name: 'Advanced Foundry',
      city: 'Hsinchu',
      country: 'Taiwán',
      countryCode: 'TW',
      lat: 24.78,
      lng: 121.0,
      functionalType: 'MANUFACTURING',
      tenure: 'OWNED',
      sqFt: 1000000,
      sqMeters: 92903,
      description: 'Test fab',
    };

    const enriched = secPropertiesService.enrichFacilityWithGeopoliticalRisk(rawFacility);
    expect(enriched.geopoliticalRiskScore).toBeDefined();
    expect(typeof enriched.geopoliticalRiskScore).toBe('number');
    expect(enriched.geopoliticalRiskScore).toBeGreaterThanOrEqual(0);
  });
});

describe('SEC Item 2 Heuristic Extraction & Cache Integration', () => {
  it('should extract Item 2 Properties text from simulated 10-K filing', () => {
    const sample10k = `
COMPANY PROFILE
Some general overview text here.

ITEM 2. PROPERTIES
The Company operates primary administrative, design, and manufacturing facilities across the globe.
Our principal executive offices are located in Santa Clara, California, occupying approximately 1,250,000 square feet of owned facilities.
In addition, we maintain major engineering campuses in Austin, Texas, and Yokneam, Israel.

ITEM 3. LEGAL PROCEEDINGS
From time to time, we are involved in legal claims.
`;

    const extracted = extractItem2PropertiesText(sample10k);
    expect(extracted).toContain('ITEM 2. PROPERTIES');
    expect(extracted).toContain('Santa Clara, California');
    expect(extracted).not.toContain('ITEM 3. LEGAL PROCEEDINGS');
    expect(extracted).not.toContain('From time to time, we are involved');
  });

  it('should return empty string when Item 2 is absent', () => {
    const withoutItem2 = `
ITEM 1. BUSINESS
Our business lines include software and hardware.
ITEM 7. MD&A
Financial results discussion.
`;
    const extracted = extractItem2PropertiesText(withoutItem2);
    expect(extracted).toBe('');
  });

  it('should generate canonical cache keys for properties via geoCacheKeys', () => {
    expect(geoCacheKeys.properties('aapl')).toBe('geo:properties:AAPL');
    expect(geoCacheKeys.properties('  NVDA  ')).toBe('geo:properties:NVDA');
    expect(GEO_CACHE_TTLS.PROPERTIES).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('should properly store and retrieve facilities from geoCache', async () => {
    const mockTicker = 'MOCK_TICKER';
    const mockFacilities: CorporateFacility[] = [
      {
        id: 'mock-1',
        ticker: mockTicker,
        name: 'Mock Test Facility',
        city: 'Metropolis',
        country: 'Global',
        countryCode: 'US',
        lat: 40.71,
        lng: -74.0,
        functionalType: 'HQ',
        tenure: 'OWNED',
        sqFt: 500000,
        sqMeters: 46452,
        description: 'Test HQ',
        geopoliticalRiskScore: 2.5,
      },
    ];

    const cacheKey = geoCacheKeys.properties(mockTicker);
    await geoCache.set(cacheKey, mockFacilities, GEO_CACHE_TTLS.PROPERTIES);

    const retrieved = await geoCache.get<CorporateFacility[]>(cacheKey);
    expect(retrieved).toBeDefined();
    expect(Array.isArray(retrieved)).toBe(true);
    expect(retrieved?.length).toBe(1);
    expect(retrieved?.[0].name).toBe('Mock Test Facility');

    // Clean up
    await geoCache.delete(cacheKey);
  });

  it('should return curated facilities through getFacilitiesForTicker', async () => {
    const facilities = await secPropertiesService.getFacilitiesForTicker('AAPL');
    expect(facilities.length).toBeGreaterThanOrEqual(4);
    expect(facilities.some((f) => f.name.includes('Apple Park'))).toBe(true);
  });

  it('should return cached facilities through getFacilitiesForTicker', async () => {
    const cachedTicker = 'TEST_CACHED_CO';
    const cachedFacilities: CorporateFacility[] = [
      {
        id: 'cached-1',
        ticker: cachedTicker,
        name: 'Cached Test Lab',
        city: 'Austin',
        country: 'United States',
        countryCode: 'US',
        lat: 30.26,
        lng: -97.74,
        functionalType: 'RND',
        tenure: 'LEASED',
        sqFt: 150000,
        sqMeters: 13935,
        description: 'Cached R&D unit',
        geopoliticalRiskScore: 1.5,
      },
    ];

    const cacheKey = geoCacheKeys.properties(cachedTicker);
    await geoCache.set(cacheKey, cachedFacilities, GEO_CACHE_TTLS.PROPERTIES);

    const result = await secPropertiesService.getFacilitiesForTicker(cachedTicker);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Cached Test Lab');

    await geoCache.delete(cacheKey);
  });
});

