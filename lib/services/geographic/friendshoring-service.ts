/**
 * @file friendshoring-service.ts
 * @description Diplomatic Friendshoring & Nearshoring Engine for Critical Raw Materials (T03.4).
 * Cross-references natural-resources.json, GeopoliticalKnowledgeService, and bilateral friction matrices.
 * Computes substitution feasibility scores, Haversine geographic distances, shared alliance bonuses,
 * and generates structured substitution arcs to safe allied nations (bilateral friction < 4.0).
 */

import { GeopoliticalKnowledgeService } from '@/lib/services/geopolitical-knowledge-service';
import { findCountryByCode, findCountryByIso3, findCountryByName } from '@/lib/data/all-198-countries';
import { COUNTRY_BY_CODE } from '@/lib/data/geopolitical-countries';
import naturalResourcesRaw from '@/lib/data/natural-resources.json';

// Type helper for natural-resources.json records
export interface NaturalResourceItem {
  name: string;
  category: string;
  importance: 'Critical' | 'High' | 'Medium' | 'Low';
  confidence: 'High' | 'Medium' | 'Low';
  description: string;
  keyOperators?: string[];
}

export interface CountryNaturalResources {
  countryCode: string;
  countryNameEs: string;
  countryNameEn: string;
  lastScraped?: string;
  profileOverview?: string;
  resources: NaturalResourceItem[];
}

const naturalResourcesDb = naturalResourcesRaw as unknown as Record<string, CountryNaturalResources>;

import { COUNTRY_CENTROIDS } from '@/lib/data/country-centroids';
import {
  CRITICAL_COMMODITIES_REGISTRY,
  CriticalCommodityKey,
  CriticalCommodityProfile,
} from '@/lib/data/critical-commodities-registry';

export { COUNTRY_CENTROIDS };
export { CRITICAL_COMMODITIES_REGISTRY };
export type { CriticalCommodityKey, CriticalCommodityProfile };

// ─── Substitution Arc Interface ────────────────────────────────────────────────

export interface SubstitutionArc {
  id: string;
  originCountry: string; // ISO-2 code (e.g. 'CN')
  substituteCountry: string; // ISO-2 code (e.g. 'AU')
  originCountryName: string;
  substituteCountryName: string;
  originCountryFlag: string;
  substituteCountryFlag: string;
  commodity: CriticalCommodityKey;
  commodityLabel: string;
  feasibilityScore: number; // 0 - 100
  frictionScore: number; // Bilateral friction (< 4.0 strictly required for safe allies)
  frictionReduction: number; // Friction points saved vs vulnerable origin
  distanceKm: number; // Haversine distance in km
  nearshoreDistanceKm?: number; // Haversine distance from importing market to substitute
  sourceCoords: { lat: number; lng: number };
  targetCoords: { lat: number; lng: number };
  allianceMatch: string[]; // Shared security/trade pacts (e.g. ['NATO', 'USMCA', 'FiveEyes', 'QUAD'])
  strategicRationale: string;
  productionCapacityScore: number;
}

// Pre-indexed map for O(1) lookups
const COMMODITY_BY_ID = new Map<CriticalCommodityKey, CriticalCommodityProfile>();
for (const c of CRITICAL_COMMODITIES_REGISTRY) {
  COMMODITY_BY_ID.set(c.id, c);
}

// ─── Mathematical & Geopolitical Utility Functions ─────────────────────────────

/**
 * Computes geographic Haversine distance in kilometers between two lat/lng coordinates.
 */
export function calculateHaversineDistance(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const lat1 = (coord1.lat * Math.PI) / 180;
  const lat2 = (coord2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Resolves centroid coordinates for a given country code or name.
 */
export function getCountryCentroid(countryIdentifier: string): { lat: number; lng: number } {
  if (!countryIdentifier) return { lat: 20, lng: 0 };
  const clean = countryIdentifier.trim().toUpperCase();

  if (COUNTRY_CENTROIDS[clean]) {
    return COUNTRY_CENTROIDS[clean];
  }

  // Resolve ISO-2 if given ISO-3, QID or name via knowledge service or all-198-countries
  const resolvedCode = GeopoliticalKnowledgeService.resolveCountryCode(countryIdentifier);
  if (resolvedCode && COUNTRY_CENTROIDS[resolvedCode]) {
    return COUNTRY_CENTROIDS[resolvedCode];
  }

  const country = findCountryByCode(clean) || findCountryByIso3(clean) || findCountryByName(countryIdentifier);
  if (country && COUNTRY_CENTROIDS[country.code]) {
    return COUNTRY_CENTROIDS[country.code];
  }

  // Fallback approximate regional centroid
  return { lat: 20, lng: 0 };
}

// ─── Friendshoring Core Service Class ──────────────────────────────────────────

export class FriendshoringService {
  /**
   * Returns all 9 supported critical raw materials and technology profiles.
   */
  public static getAllCommodities(): CriticalCommodityProfile[] {
    return CRITICAL_COMMODITIES_REGISTRY;
  }

  /**
   * Returns a specific critical commodity profile by ID.
   */
  public static getCommodityById(id: CriticalCommodityKey): CriticalCommodityProfile | undefined {
    return COMMODITY_BY_ID.get(id);
  }

  /**
   * Computes the mathematical Feasibility Score (0 - 100) for a Friendshoring / Nearshoring substitute:
   * 
   * Strict Rule: Bilateral friction must be < 4.0 for safe allies.
   * If friction >= 4.0, feasibility is 0 (disqualified as safe friendshoring partner).
   * 
   * Weighted Factors:
   * - 35% Bilateral Friction Safety: (4.0 - frictionScore) / 3.0 * 100
   * - 35% Production / Reserves Capacity: substitute productionCapacityScore (0-100)
   * - 15% Shared Strategic Alliances: Defence & trade treaties (NATO, USMCA, QUAD, FiveEyes, EU, G7)
   * - 15% Geographic Proximity: Nearshoring distance penalty reduction
   */
  public static computeFeasibilityScore(params: {
    frictionScore: number;
    productionCapacityScore: number;
    distanceKm: number;
    allianceCount: number;
  }): number {
    const { frictionScore, productionCapacityScore, distanceKm, allianceCount } = params;

    // Strict filter: Allies must have bilateral friction < 4.0
    if (frictionScore >= 4.0) {
      return 0;
    }

    // 1. Friction Safety Score (0 - 100): 1.0 friction = 100%, 2.5 friction = 50%, 4.0 friction = 0%
    const frictionFactor = Math.max(0, Math.min(100, ((4.0 - Math.max(0, frictionScore)) / 3.0) * 100));

    // 2. Production / Reserves Capacity (0 - 100)
    const capacityScore = Math.max(0, Math.min(100, productionCapacityScore));

    // 3. Shared Alliance Score (0 - 100): 25 pts per shared pact, 0 if no alliances
    const allianceScore = allianceCount > 0 ? Math.min(100, Math.max(25, allianceCount * 25)) : 0;

    // 4. Geographic Distance (Nearshoring) Score (0 - 100):
    // <1,500 km -> 100 pts. Decays gently with distance.
    const validDistance = Math.max(0, distanceKm);
    const distanceScore = Math.max(20, Math.min(100, 100 - validDistance / 200));

    // Weighted composite
    const score = 0.35 * frictionFactor + 0.35 * capacityScore + 0.15 * allianceScore + 0.15 * distanceScore;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Generates structured Substitution Arcs for a given commodity or all commodities.
   * Filters out any substitute with bilateral friction >= 4.0.
   * 
   * @param commodityId Optional specific commodity filter
   * @param destinationCountry Focal importing country (defaults to 'US' for Western alliance value network)
   */
  public static getSubstitutionArcs(
    commodityId?: CriticalCommodityKey,
    destinationCountry = 'US'
  ): SubstitutionArc[] {
    const commodities = commodityId
      ? [this.getCommodityById(commodityId)].filter(Boolean) as CriticalCommodityProfile[]
      : CRITICAL_COMMODITIES_REGISTRY;

    const arcs: SubstitutionArc[] = [];
    const destCode = destinationCountry.toUpperCase();
    const destCountry = COUNTRY_BY_CODE.get(destCode) || findCountryByCode(destCode);
    const destBlocs: string[] = destCountry?.blocs ? [...destCountry.blocs] : [];
    if (destCode === 'US') {
      const usCoreAlliances = ['NATO', 'G7', 'USMCA', 'FiveEyes', 'OECD', 'QUAD', 'AUKUS'];
      for (const pact of usCoreAlliances) {
        if (!destBlocs.some(b => b.toUpperCase() === pact)) {
          destBlocs.push(pact);
        }
      }
    }
    const destCoords = getCountryCentroid(destCode);

    for (const comm of commodities) {
      for (const origin of comm.vulnerableOrigins) {
        const originCode = origin.countryCode;
        const originCountry = COUNTRY_BY_CODE.get(originCode) || findCountryByCode(originCode);
        const originCoords = getCountryCentroid(originCode);

        // Origin bilateral friction with destination (used for calculating frictionReduction)
        const originRelation = GeopoliticalKnowledgeService.getBilateralRelation(destCode, originCode);
        const originFriction = originRelation?.frictionScore ?? 8.0;

        for (const sub of comm.viableSubstitutes) {
          const subCode = sub.countryCode;
          if (subCode === originCode) continue;

          const subCountry = COUNTRY_BY_CODE.get(subCode) || findCountryByCode(subCode);
          const subBlocs: string[] = subCountry?.blocs || [];

          // Query bilateral friction between substitute and destination
          let frictionScore: number;
          if (subCode === destCode) {
            frictionScore = 1.0; // Domestic onshoring baseline
          } else {
            const rel = GeopoliticalKnowledgeService.getBilateralRelation(destCode, subCode);
            frictionScore = rel?.frictionScore ?? 0;

            // If no direct edge exists in seed, compute from sovereign risk base and bloc alliances
            if (rel === null || rel === undefined) {
              const sovRisk = subCountry?.sovereignRiskBase ?? 3.5;
              const sharedAnyBloc = subBlocs.some(b => destBlocs.includes(b));
              frictionScore = sharedAnyBloc ? Math.min(2.5, sovRisk * 0.5) : Math.min(3.5, sovRisk * 0.7);
            }
          }

          // Strict filter: bilateral friction < 4.0 required for safe friendshoring
          if (frictionScore >= 4.0) {
            continue;
          }

          const subCoords = getCountryCentroid(subCode);
          const distanceKm = calculateHaversineDistance(originCoords, subCoords);
          const nearshoreDistanceKm = calculateHaversineDistance(destCoords, subCoords);

          // Find shared security and trade alliances between destination and substitute (case-insensitive)
          const destBlocsNormalized = new Set(destBlocs.map(b => b.toUpperCase()));
          const allianceMatch = subBlocs
            .filter(b => destBlocsNormalized.has(b.toUpperCase()))
            .map(b => (b.toUpperCase() === 'QUAD' ? 'QUAD' : b));
          if (subCode === destCode) {
            allianceMatch.push('DOMESTIC_ONSHORING');
          }

          // Cross-reference natural-resources.json for additional intelligence
          let capacityScore = sub.productionCapacityScore;
          const countryRes = naturalResourcesDb[subCode] || naturalResourcesDb[subCode.toUpperCase()];
          if (countryRes && countryRes.resources) {
            const hasResource = countryRes.resources.some(r =>
              comm.searchKeywords.some(kw => r.name.toLowerCase().includes(kw))
            );
            if (hasResource) {
              capacityScore = Math.min(100, capacityScore + 5);
            }
          }

          const feasibilityScore = this.computeFeasibilityScore({
            frictionScore,
            productionCapacityScore: capacityScore,
            distanceKm: nearshoreDistanceKm,
            allianceCount: allianceMatch.length,
          });

          const frictionReduction = Number(Math.max(0, originFriction - frictionScore).toFixed(1));

          arcs.push({
            id: `arc-${originCode.toLowerCase()}-${subCode.toLowerCase()}-${comm.id}`,
            originCountry: originCode,
            substituteCountry: subCode,
            originCountryName: originCountry?.nameEs || originCode,
            substituteCountryName: subCountry?.nameEs || subCode,
            originCountryFlag: originCountry?.flag || '🌐',
            substituteCountryFlag: subCountry?.flag || '🌐',
            commodity: comm.id,
            commodityLabel: comm.label,
            feasibilityScore,
            frictionScore,
            frictionReduction,
            distanceKm,
            nearshoreDistanceKm,
            sourceCoords: originCoords,
            targetCoords: subCoords,
            allianceMatch,
            strategicRationale: sub.strategicAsset,
            productionCapacityScore: capacityScore,
          });
        }
      }
    }

    // Sort by feasibility score descending
    return arcs.sort((a, b) => b.feasibilityScore - a.feasibilityScore);
  }

  /**
   * Retrieves friendshoring alternatives specifically substituting an identified vulnerable country.
   */
  public static getFriendshoringAlternativesForOrigin(
    originCountryCode: string,
    commodityId?: CriticalCommodityKey,
    destinationCountry = 'US'
  ): SubstitutionArc[] {
    const allArcs = this.getSubstitutionArcs(commodityId, destinationCountry);
    const upper = originCountryCode.trim().toUpperCase();
    const resolvedCode =
      (upper.length === 2 ? upper : null) ||
      GeopoliticalKnowledgeService.resolveCountryCode(originCountryCode) ||
      findCountryByIso3(upper)?.code ||
      findCountryByName(originCountryCode)?.code ||
      upper;
    return allArcs.filter(a => a.originCountry === resolvedCode);
  }

  /**
   * Returns a high-level tactical executive summary for a commodity's friendshoring status.
   */
  public static getFriendshoringSummary(
    commodityId: CriticalCommodityKey,
    destinationCountry = 'US'
  ): {
    commodity: CriticalCommodityProfile | undefined;
    totalArcs: number;
    averageFeasibility: number;
    topAlternative: SubstitutionArc | null;
    arcs: SubstitutionArc[];
  } {
    const comm = this.getCommodityById(commodityId);
    const arcs = this.getSubstitutionArcs(commodityId, destinationCountry);

    const totalArcs = arcs.length;
    const averageFeasibility =
      totalArcs > 0
        ? Math.round(arcs.reduce((acc, a) => acc + a.feasibilityScore, 0) / totalArcs)
        : 0;
    const topAlternative = arcs.length > 0 ? arcs[0] : null;

    return {
      commodity: comm,
      totalArcs,
      averageFeasibility,
      topAlternative,
      arcs,
    };
  }
}
