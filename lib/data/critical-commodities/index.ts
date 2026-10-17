/**
 * lib/data/critical-commodities/index.ts
 *
 * Master aggregation of the 9 critical commodities for Friendshoring analysis.
 */

import { CriticalCommodityProfile } from './types';
import { MINERAL_COMMODITIES } from './minerals';
import { METAL_COMMODITIES } from './metals';
import { ENERGY_TECH_COMMODITIES } from './energy-tech';

export * from './types';
export * from './minerals';
export * from './metals';
export * from './energy-tech';

export const CRITICAL_COMMODITIES_REGISTRY: CriticalCommodityProfile[] = [
  MINERAL_COMMODITIES[0], // rare-earths
  METAL_COMMODITIES[0],   // lithium
  METAL_COMMODITIES[1],   // cobalt
  METAL_COMMODITIES[2],   // nickel
  METAL_COMMODITIES[3],   // copper
  METAL_COMMODITIES[4],   // gallium-germanium
  MINERAL_COMMODITIES[1], // graphite
  ENERGY_TECH_COMMODITIES[0], // semiconductors
  ENERGY_TECH_COMMODITIES[1], // oil-gas
];
