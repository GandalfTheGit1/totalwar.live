/**
 * @file thematic-generators.ts
 * @description Pure generator functions and caches for T03.2 Thematic Layers:
 * - 'tier-n': High strategic bilateral friction (>= 7.0) and autocracies/sanctioned jurisdictions.
 * - 'resources': Critical raw materials (Rare Earths, Lithium, Cobalt, Nickel, Copper, Oil/Gas, Semiconductors).
 * - 'maritime': Strategic maritime chokepoints (Hormuz, Malacca, Suez, Bab el-Mandeb, Panama, Turkish Straits).
 * - 'footprint': Consolidated corporate operations vs. strategic expansion markets.
 * - 'none': Empty map.
 */

import { ThematicLayer, ThematicLayerMap } from '../types';
import {
  CorporateFootprintCountryConfig,
  CorporateFootprintConfig
} from './thematic/types';
import {
  resetThematicCaches,
  registerCountry
} from './thematic/country-registry';
import { getTierNLayerData } from './thematic/tier-n-generator';
import {
  getResourcesLayerData,
  getMaritimeLayerData
} from './thematic/resources-maritime-generator';
import { getFootprintLayerData } from './thematic/footprint-generator';
import { resolveThematicCountryData } from './thematic/feature-resolver';

export type {
  CorporateFootprintCountryConfig,
  CorporateFootprintConfig
};

export {
  resetThematicCaches,
  registerCountry,
  getTierNLayerData,
  getResourcesLayerData,
  getMaritimeLayerData,
  getFootprintLayerData,
  resolveThematicCountryData
};

/**
 * Returns the ThematicLayerMap for the given active layer.
 * Returns an empty map ({}) if layer is 'none'.
 */
export function getThematicLayerData(
  layer: ThematicLayer,
  footprintConfig?: CorporateFootprintConfig
): ThematicLayerMap {
  switch (layer) {
    case 'tier-n':
      return getTierNLayerData();
    case 'resources':
      return getResourcesLayerData();
    case 'maritime':
      return getMaritimeLayerData();
    case 'footprint':
      return getFootprintLayerData(footprintConfig);
    case 'none':
    default:
      return {};
  }
}
