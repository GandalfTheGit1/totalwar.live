/**
 * lib/data/critical-commodities/types.ts
 *
 * Domain types for critical raw materials and commodities friendshoring registry.
 */

export type CriticalCommodityKey =
  | 'rare-earths'
  | 'lithium'
  | 'cobalt'
  | 'nickel'
  | 'copper'
  | 'gallium-germanium'
  | 'graphite'
  | 'semiconductors'
  | 'oil-gas';

export interface CriticalCommodityProfile {
  id: CriticalCommodityKey;
  name: string;
  label: string;
  category: 'Metals' | 'Minerals' | 'Energy' | 'Technology';
  description: string;
  searchKeywords: string[];
  vulnerableOrigins: {
    countryCode: string;
    marketSharePercentage: number;
    chokepointType: 'MONOPOLY_EXTRACTION' | 'REFINING_BOTTLENECK' | 'GEOPOLITICAL_SANCTION' | 'MILITARY_CHOKEPOINT';
    rationale: string;
  }[];
  viableSubstitutes: {
    countryCode: string;
    productionCapacityScore: number; // 0 - 100
    strategicAsset: string;
    provenReservesRank?: number;
    readinessMonths?: number;
  }[];
}
