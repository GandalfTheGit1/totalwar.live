/**
 * components/dev/geopolitical-monitor/utils/thematic/country-registry.ts
 *
 * Registration, normalization, and module-level caching of thematic layer country data.
 */

import { ThematicLayerCountryData, ThematicLayerMap } from '../../types';
import { GeopoliticalKnowledgeService } from '@/lib/services/geopolitical-knowledge-service';
import { findCountryByCode, findCountryByIso3, findCountryByName } from '@/lib/data/all-198-countries';

let cachedTierNMap: ThematicLayerMap | null = null;
let cachedResourcesMap: ThematicLayerMap | null = null;
let cachedMaritimeMap: ThematicLayerMap | null = null;
let cachedDefaultFootprintMap: ThematicLayerMap | null = null;

export function getCachedTierNMap(): ThematicLayerMap | null { return cachedTierNMap; }
export function setCachedTierNMap(map: ThematicLayerMap | null): void { cachedTierNMap = map; }

export function getCachedResourcesMap(): ThematicLayerMap | null { return cachedResourcesMap; }
export function setCachedResourcesMap(map: ThematicLayerMap | null): void { cachedResourcesMap = map; }

export function getCachedMaritimeMap(): ThematicLayerMap | null { return cachedMaritimeMap; }
export function setCachedMaritimeMap(map: ThematicLayerMap | null): void { cachedMaritimeMap = map; }

export function getCachedDefaultFootprintMap(): ThematicLayerMap | null { return cachedDefaultFootprintMap; }
export function setCachedDefaultFootprintMap(map: ThematicLayerMap | null): void { cachedDefaultFootprintMap = map; }

/**
 * Resets all module-level thematic layer caches to force re-computation.
 */
export function resetThematicCaches(): void {
  cachedTierNMap = null;
  cachedResourcesMap = null;
  cachedMaritimeMap = null;
  cachedDefaultFootprintMap = null;
}

/**
 * Resolves ISO-2 and ISO-3 codes for any country identifier (ISO code or name).
 */
export function resolveCountryIsoPair(identifier: string): { iso2: string; iso3: string } {
  const clean = identifier.trim();
  const upper = clean.toUpperCase();

  const byCode = upper.length === 2 ? findCountryByCode(upper) : undefined;
  if (byCode) {
    return { iso2: byCode.code.toUpperCase(), iso3: byCode.iso3.toUpperCase() };
  }

  const byIso3 = upper.length === 3 ? findCountryByIso3(upper) : undefined;
  if (byIso3) {
    return { iso2: byIso3.code.toUpperCase(), iso3: byIso3.iso3.toUpperCase() };
  }

  const resolvedByName = findCountryByName(clean);
  if (resolvedByName) {
    return { iso2: resolvedByName.code.toUpperCase(), iso3: resolvedByName.iso3.toUpperCase() };
  }

  const resolvedCode = GeopoliticalKnowledgeService.resolveCountryCode(clean);
  if (resolvedCode) {
    const iso2 = resolvedCode.toUpperCase();
    const country = findCountryByCode(iso2);
    return { iso2, iso3: country?.iso3 ? country.iso3.toUpperCase() : iso2 };
  }

  return { iso2: upper, iso3: upper };
}

/**
 * Registers a country under both ISO-2 and ISO-3 keys in the ThematicLayerMap.
 * Also supports country names (English and Spanish) via normalized fallback resolution.
 */
export function registerCountry(
  map: ThematicLayerMap,
  countryIdentifier: string,
  entry: Omit<ThematicLayerCountryData, 'countryCode'> & { countryCode?: string }
): void {
  if (!countryIdentifier || typeof countryIdentifier !== 'string') return;

  const { iso2, iso3 } = resolveCountryIsoPair(countryIdentifier);
  const rawIntensity = entry.intensity;
  const intensity = Number.isFinite(rawIntensity)
    ? Math.max(0, Math.min(100, Math.round(rawIntensity)))
    : 0;

  const countryData: ThematicLayerCountryData = {
    countryCode: entry.countryCode || iso2,
    intensity,
    label: entry.label,
    sublabel: entry.sublabel,
    colorCategory: entry.colorCategory,
  };

  map[iso2] = countryData;
  if (iso3 !== iso2) {
    map[iso3] = countryData;
  }
}
