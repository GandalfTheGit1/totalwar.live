/**
 * components/dev/geopolitical-monitor/utils/thematic/resources-maritime-generator.ts
 *
 * Thematic layer generators for critical raw materials and maritime chokepoints.
 */

import { ThematicLayerMap } from '../../types';
import criticalCommodities from '../../data/critical-commodities.json';
import maritimeChokepoints from '../../data/maritime-chokepoints.json';
import {
  getCachedResourcesMap,
  setCachedResourcesMap,
  getCachedMaritimeMap,
  setCachedMaritimeMap,
  registerCountry
} from './country-registry';

interface CommodityChokepointEntry {
  code: string;
  intensity: number;
  label: string;
  sublabel: string;
  colorCategory: 'critical' | 'high' | 'medium';
}

/**
 * Pure generator for the 'resources' layer:
 * Maps nations dominating critical commodities (Rare Earths, Lithium, Cobalt, Nickel, Copper, Oil/Gas, Semiconductors).
 */
export function getResourcesLayerData(): ThematicLayerMap {
  const cached = getCachedResourcesMap();
  if (cached) return cached;

  const map: ThematicLayerMap = {};
  for (const entry of criticalCommodities as CommodityChokepointEntry[]) {
    registerCountry(map, entry.code, entry);
  }

  setCachedResourcesMap(map);
  return map;
}

/**
 * Pure generator for the 'maritime' layer:
 * Maps nations controlling or severely exposed to the 6 primary maritime bottlenecks.
 */
export function getMaritimeLayerData(): ThematicLayerMap {
  const cached = getCachedMaritimeMap();
  if (cached) return cached;

  const map: ThematicLayerMap = {};
  for (const entry of maritimeChokepoints as CommodityChokepointEntry[]) {
    registerCountry(map, entry.code, entry);
  }

  setCachedMaritimeMap(map);
  return map;
}
