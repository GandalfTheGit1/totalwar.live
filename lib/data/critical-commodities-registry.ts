/**
 * @file critical-commodities-registry.ts
 * @description Master catalog of 9 critical raw materials and commodities for Friendshoring analysis (T03.4).
 * Detailed breakdown of vulnerable monopolistic origins, chokepoint types, and viable allied substitutes.
 *
 * Decomposed into modular domain catalogs under lib/data/critical-commodities/.
 */

export type {
  CriticalCommodityKey,
  CriticalCommodityProfile,
} from './critical-commodities';

export {
  CRITICAL_COMMODITIES_REGISTRY,
  MINERAL_COMMODITIES,
  METAL_COMMODITIES,
  ENERGY_TECH_COMMODITIES,
} from './critical-commodities';
