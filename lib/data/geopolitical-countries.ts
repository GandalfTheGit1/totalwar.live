/**
 * lib/data/geopolitical-countries.ts
 *
 * Curated list of 45 strategically critical geopolitical countries and O(1) indexed lookup maps.
 * Decomposed into modular regional subsets in lib/data/geopolitical-countries/.
 */

import {
  GeopoliticalCountry,
  GeopoliticalRegion
} from './geopolitical-countries/types';

import {
  NORTH_AMERICA_COUNTRIES,
  LATIN_AMERICA_COUNTRIES
} from './geopolitical-countries/americas';

import {
  EAST_ASIA_COUNTRIES,
  SOUTH_SOUTHEAST_ASIA_COUNTRIES,
  OCEANIA_COUNTRIES
} from './geopolitical-countries/asia-pacific';

import { EUROPE_COUNTRIES } from './geopolitical-countries/europe';

import {
  MIDDLE_EAST_COUNTRIES,
  EURASIA_AFRICA_COUNTRIES
} from './geopolitical-countries/middle-east-africa';

export type { GeopoliticalCountry, GeopoliticalRegion };

export const GEOPOLITICAL_45_COUNTRIES: GeopoliticalCountry[] = [
  ...NORTH_AMERICA_COUNTRIES,
  ...EAST_ASIA_COUNTRIES,
  ...EUROPE_COUNTRIES,
  ...SOUTH_SOUTHEAST_ASIA_COUNTRIES,
  ...OCEANIA_COUNTRIES,
  ...MIDDLE_EAST_COUNTRIES,
  ...LATIN_AMERICA_COUNTRIES,
  ...EURASIA_AFRICA_COUNTRIES,
];

export const COUNTRY_BY_CODE = new Map<string, GeopoliticalCountry>(
  GEOPOLITICAL_45_COUNTRIES.map(c => [c.code, c])
);

export const COUNTRY_BY_QID = new Map<string, GeopoliticalCountry>(
  GEOPOLITICAL_45_COUNTRIES.map(c => [c.qid, c])
);

export const COUNTRY_BY_ISO3 = new Map<string, GeopoliticalCountry>(
  GEOPOLITICAL_45_COUNTRIES.map(c => [c.iso3, c])
);
