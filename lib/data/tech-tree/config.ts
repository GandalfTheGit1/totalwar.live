/**
 * lib/data/tech-tree/config.ts
 *
 * Configuration and thresholds for the Historical Technology Tree.
 * All uncalibrated thresholds are explicitly marked as Suposición per project rules.
 */

import { TechNodeStatus } from './types';

export const TECH_TREE_CONFIG = {
  version: '1.0.0',
  /**
   * 7 pilot countries with verified historical seed data.
   * Note (Hecho + Suposición): Sovereign profiles directory has 6 country files (US, CN, RU, JP, DE, TW)
   * plus procedural-cabinet.ts. Netherlands (NL - ASML) is included as the 7th pilot country to cover
   * the 7-country pilot requirement and the explicit EUV lithography 2015 vs 2026 benchmark.
   */
  pilotCountries: ['US', 'CN', 'RU', 'JP', 'DE', 'TW', 'NL'] as const,

  /**
   * Automatic GDELT news unlock rules (Suposición)
   */
  autoNews: {
    enabledInPublic: true, // Activated only after registering precision on the 50-news benchmark in Paso 7
    minIndependentSources: 2, // Decision by William: requires at least 2 independent sources
    textSimilarityThreshold: 0.55, // Suposición: Jaccard token/trigram similarity >= 0.55 groups wire reprints as 1 source
    maxAllowedAutoStatus: 'prototipo' as TechNodeStatus, // Suposición: auto news can only unlock up to 'anunciado' or 'prototipo'
  },

  /**
   * Success metric thresholds (Suposición)
   */
  telemetry: {
    uniqueQueriesTarget: 400, // Suposición: 400 unique queries in 45 days
    evaluationWindowDays: 45,
    topPairsCount: 5,
  },

  /**
   * Node status weights for deterministic 0-100 score calculation (Suposición)
   */
  statusWeights: {
    no_alcanzado: 0.0,
    anunciado: 0.2,
    prototipo: 0.5,
    produccion: 0.85,
    exportacion: 1.0,
  } as Record<TechNodeStatus, number>,

  /**
   * Penalty factors for sanctions and regressions in node score calculation (Suposición)
   */
  penalties: {
    sanctionNodeMultiplier: 0.65,
    regressionNodeMultiplier: 0.6,
  },
} as const;

export type PilotCountryCode = (typeof TECH_TREE_CONFIG.pilotCountries)[number];

export function isPilotCountryCode(code: string): boolean {
  const clean = (code || '').trim().toUpperCase();
  return (TECH_TREE_CONFIG.pilotCountries as readonly string[]).includes(clean);
}
