/**
 * lib/services/geopolitical/matrix-scene-engine.ts
 *
 * Provides access to the macro global scene (45 nations, 990 edges)
 * and bilateral relationship profiles.
 */

import { GEOPOLITICAL_45_COUNTRIES, GeopoliticalCountry } from '../../data/geopolitical-countries';
import rawMatrixData from '../../data/geopolitical-global-matrix.json';
import {
  GlobalGeopoliticalMatrixSeed,
  CountryDetailProfile
} from '../../../scripts/seed_geopolitical_matrix';
import { BilateralEdge } from './types';
import { resolveCountryCode } from './country-resolver';

export const matrixSeed = rawMatrixData as unknown as GlobalGeopoliticalMatrixSeed;

/**
 * Returns the entire global scene ("The Whole Scene") containing all 45 nation nodes,
 * 990 bilateral edges, global alliance distributions, and high-tension hotspots.
 */
export function getTheWholeScene() {
  return {
    version: matrixSeed.version,
    generatedAt: matrixSeed.generatedAt,
    totalCountries: matrixSeed.totalCountries,
    totalBilateralEdges: matrixSeed.totalBilateralEdges,
    globalAverageFriction: matrixSeed.theWholeScene.globalAverageFriction,
    highestFrictionPairs: matrixSeed.theWholeScene.highestFrictionPairs,
    strategicAlliances: matrixSeed.theWholeScene.strategicAlliances,
    nodes: matrixSeed.theWholeScene.nodes,
    edges: matrixSeed.theWholeScene.edges
  };
}

/**
 * Returns the list of all 45 indexed countries.
 */
export function getAllCountries(): GeopoliticalCountry[] {
  return GEOPOLITICAL_45_COUNTRIES;
}

/**
 * Returns a detailed granular profile for a single country ("One at a Time").
 */
export function getCountryProfile(countryIdentifier: string): CountryDetailProfile | null {
  const code = resolveCountryCode(countryIdentifier);
  if (!code || !matrixSeed.oneAtATime[code]) {
    return null;
  }

  // Calculate effective friction using the colonial legacy modifier
  const profile = JSON.parse(JSON.stringify(matrixSeed.oneAtATime[code]));
  if (profile.relations) {
    profile.relations = profile.relations.map((rel: { colonialLegacyModifier?: number; frictionScore: number }) => {
      const modifier = rel.colonialLegacyModifier || 0;
      return {
        ...rel,
        frictionScore: Math.min(10, rel.frictionScore + modifier)
      };
    });
  }

  return profile;
}

/**
 * Returns the bilateral relationship edge between two countries.
 */
export function getBilateralRelation(countryA: string, countryB: string): BilateralEdge | null {
  const codeA = resolveCountryCode(countryA);
  const codeB = resolveCountryCode(countryB);

  if (!codeA || !codeB || codeA === codeB) return null;

  const pairKey = [codeA, codeB].sort().join('-');
  const edge = matrixSeed.theWholeScene.edges.find(e => e.id === pairKey);
  return (edge as BilateralEdge) || null;
}
