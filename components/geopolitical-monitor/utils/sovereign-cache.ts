/**
 * utils/sovereign-cache.ts
 *
 * Memoised access to sovereign-power profiles so the top bar and map layers
 * do not rebuild (and re-log) the same profile on every render.
 */

import { SovereignPowerService } from '@/lib/services/sovereign-power-service';
import { GeopoliticalKnowledgeService } from '@/lib/services/geopolitical-knowledge-service';
import { findCountryByCode } from '@/lib/data/all-198-countries';
import type { CountrySovereignPowerProfile } from '@/lib/types/sovereign-power';

const cache = new Map<string, CountrySovereignPowerProfile>();

/** Resolves any ISO-2/ISO-3/name identifier to the supported 45-country ISO-2, or null. */
export function resolveSupportedIso2(identifier?: string | null): string | null {
  if (!identifier) return null;
  return GeopoliticalKnowledgeService.resolveCountryCode(identifier);
}

export function getSovereignProfileCached(iso2: string): CountrySovereignPowerProfile {
  const hit = cache.get(iso2);
  if (hit) return hit;
  const profile = SovereignPowerService.getCountrySovereignProfile(iso2);
  cache.set(iso2, profile);
  return profile;
}

/** Unrest proximity 0-100: mean of coup/fracture risk and social unrest index. */
export function unrestRisk(profile: CountrySovereignPowerProfile): number {
  const s = profile.dossiers.stability;
  return Math.round((s.coupOrFractureRiskPercent + s.socialUnrestIndex) / 2);
}

export function militaryTechScore(iso2: string): number {
  return getSovereignProfileCached(iso2).dossiers.tech.subsectors.military.score;
}

/** Spanish display name for any ISO-2 code in the 198-country catalogue (falls back to the code). */
export function countryName(code: string): string {
  return findCountryByCode(code)?.nameEs ?? code;
}
