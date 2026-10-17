/**
 * lib/services/geopolitical-knowledge-service.ts
 *
 * Central Facade for the Geopolitical Knowledge Engine:
 * 1. "The Whole Scene": Macro global graph of 45 sovereign nations & 990 bilateral relationships.
 * 2. "One at a Time": Granular drill-down per country or bilateral pair with friction scores and bloc alliances.
 * 3. Supply Chain Risk Auditor: Evaluates multi-country supplier exposures (for SEC 10-K & Value Network).
 * 4. Hard Country & Tier-N Engine: Pure deterministic classification (HCI 0-100) and BOM exposure.
 */

import { GeopoliticalCountry } from '../data/geopolitical-countries';
import { CountryDetailProfile } from '../../scripts/seed_geopolitical_matrix';
import { SovereignPowerService } from './sovereign-power-service';

import {
  BilateralEdge,
  HardCountryTier,
  SanctionsProfile,
  HardCountryProfile,
  TierNInputPayload,
  HardCountryBottleneck,
  TierNEvaluationResult
} from './geopolitical/types';

import { resolveCountryCode } from './geopolitical/country-resolver';
import {
  getTheWholeScene,
  getAllCountries,
  getCountryProfile,
  getBilateralRelation
} from './geopolitical/matrix-scene-engine';
import {
  getAdjustedFrictionScore,
  evaluateSupplyChainExposure
} from './geopolitical/supply-chain-evaluator';
import {
  getHardCountryProfile,
  classifyHardCountries
} from './geopolitical/hard-country-engine';
import { evaluateTierNInputExposure } from './geopolitical/tier-n-evaluator';

export type {
  BilateralEdge,
  HardCountryTier,
  SanctionsProfile,
  HardCountryProfile,
  TierNInputPayload,
  HardCountryBottleneck,
  TierNEvaluationResult
};

export class GeopoliticalKnowledgeService {
  /**
   * Returns the entire global scene ("The Whole Scene") containing all 45 nation nodes,
   * 990 bilateral edges, global alliance distributions, and high-tension hotspots.
   */
  static getTheWholeScene() {
    return getTheWholeScene();
  }

  /**
   * Returns the list of all 45 indexed countries.
   */
  static getAllCountries(): GeopoliticalCountry[] {
    return getAllCountries();
  }

  /**
   * Resolves a country code from ISO2, ISO3, Wikidata QID, or country name.
   */
  static resolveCountryCode(identifier: string): string | null {
    return resolveCountryCode(identifier);
  }

  /**
   * Returns a detailed granular profile for a single country ("One at a Time").
   */
  static getCountryProfile(countryIdentifier: string): CountryDetailProfile | null {
    return getCountryProfile(countryIdentifier);
  }

  /**
   * Returns the bilateral relationship edge between two countries.
   */
  static getBilateralRelation(countryA: string, countryB: string): BilateralEdge | null {
    return getBilateralRelation(countryA, countryB);
  }

  /**
   * Adjusts the base friction score based on the World Tension Index.
   */
  static getAdjustedFrictionScore(baseScore: number, worldTensionIndex: number): number {
    return getAdjustedFrictionScore(baseScore, worldTensionIndex);
  }

  /**
   * Evaluates the collective geopolitical risk of an equity's manufacturing & supply chain footprint.
   */
  static evaluateSupplyChainExposure(countryIdentifiers: string[]) {
    return evaluateSupplyChainExposure(countryIdentifiers);
  }

  /**
   * T03.8: Returns the complete Sovereign Power Profile (Ray Dalio 6 Pillars)
   */
  static getSovereignPowerProfile(
    countryIdentifier: string,
    appointedCabinet?: Partial<Record<'DEFENSE' | 'FINANCE' | 'FOREIGN_SECURITY', string>>
  ) {
    return SovereignPowerService.getCountrySovereignProfile(countryIdentifier, appointedCabinet);
  }

  /**
   * T03.8: Simulates tactical wargame stress-testing shocks on sovereign power scores.
   */
  static simulateSovereignWargame(
    countryIdentifier: string,
    shocks: { defenseShock: number; tradeShock: number; currencyShock: number; techShock: number },
    appointedCabinet?: Partial<Record<'DEFENSE' | 'FINANCE' | 'FOREIGN_SECURITY', string>>
  ) {
    const profile = SovereignPowerService.getCountrySovereignProfile(countryIdentifier, appointedCabinet);
    return SovereignPowerService.simulateWargame(profile.baseScores, shocks, profile.countryCode);
  }

  /**
   * T03.3: Returns the Hard Country Profile (HCI 0-100) for a given country.
   */
  static getHardCountryProfile(
    countryIdentifier: string,
    targetCountry?: string
  ): HardCountryProfile | null {
    return getHardCountryProfile(countryIdentifier, targetCountry);
  }

  /**
   * T03.3: Classifies all sovereign nations across the 45 curated matrix and 198 countries catalog.
   */
  static classifyHardCountries(targetCountry?: string): HardCountryProfile[] {
    return classifyHardCountries(targetCountry);
  }

  /**
   * T03.3: Evaluates the geopolitical exposure of a multi-tier Bill of Materials (BOM).
   */
  static evaluateTierNInputExposure(
    inputs: TierNInputPayload[],
    targetCountry?: string
  ): TierNEvaluationResult {
    return evaluateTierNInputExposure(inputs, targetCountry);
  }
}
