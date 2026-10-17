/**
 * lib/services/geopolitical/hard-country-scoring.ts
 *
 * Scoring routines for Hard Country Index (HCI): bilateral friction resolution,
 * weighted composite calculation, and primary risk driver compilation.
 */

import { GeopoliticalStance } from '../../../scripts/seed_geopolitical_matrix';
import { HardCountryTier, HardCountryCuratedData } from './types';
import { getBilateralRelation, matrixSeed } from './matrix-scene-engine';

/**
 * Resolves bilateral friction against a specific target country or global baseline.
 */
/**
 * Resolves bilateral friction with a specific target country.
 */
function resolveTargetBilateralFriction(
  code: string,
  targetCode: string,
  sanctionsScore: number,
  baseRisk: number
): { bilateralFrictionScore: number; bilateralStance?: GeopoliticalStance } {
  const rel = getBilateralRelation(code, targetCode);
  if (rel) {
    let rawFriction = rel.frictionScore * 10;
    if (rel.stance === 'SANCTIONED_ADVERSARIAL') rawFriction = Math.max(95, rawFriction);
    else if (rel.stance === 'FRICTION_STRATEGIC_COMPETITION') rawFriction = Math.max(70, rawFriction);
    else if (rel.stance === 'STRATEGIC_ALLY') rawFriction = Math.min(15, rawFriction);
    else if (rel.stance === 'ECONOMIC_PARTNER') rawFriction = Math.min(35, rawFriction);

    return {
      bilateralFrictionScore: Math.min(100, Math.round(rawFriction)),
      bilateralStance: rel.stance
    };
  }

  if (sanctionsScore >= 80) return { bilateralFrictionScore: 95, bilateralStance: 'SANCTIONED_ADVERSARIAL' };
  if (sanctionsScore >= 50) return { bilateralFrictionScore: 75, bilateralStance: 'FRICTION_STRATEGIC_COMPETITION' };
  if (baseRisk <= 2.5) return { bilateralFrictionScore: 15, bilateralStance: 'ECONOMIC_PARTNER' };
  return { bilateralFrictionScore: Math.min(100, Math.round(baseRisk * 6)), bilateralStance: 'NEUTRAL_COMMERCIAL' };
}

/**
 * Resolves bilateral friction against a specific target country or global baseline.
 */
export function resolveBilateralFriction(
  code: string,
  isSelf: boolean,
  targetCode: string | undefined,
  curated: HardCountryCuratedData | undefined,
  sanctionsScore: number,
  baseRisk: number,
  autocraticNature: boolean
): { bilateralFrictionScore: number; bilateralStance?: GeopoliticalStance } {
  if (isSelf) {
    return { bilateralFrictionScore: 0, bilateralStance: 'STRATEGIC_ALLY' };
  }

  if (targetCode) {
    return resolveTargetBilateralFriction(code, targetCode, sanctionsScore, baseRisk);
  }

  if (curated) {
    return {
      bilateralFrictionScore: Math.min(100, Math.round(curated.globalFrictionScore * 10)),
      bilateralStance: curated.stance
    };
  }

  if (sanctionsScore === 0 && !autocraticNature && (baseRisk <= 3.5 || code === 'TW')) {
    return { bilateralFrictionScore: Math.min(25, Math.round(baseRisk * 4)), bilateralStance: 'STRATEGIC_ALLY' };
  }

  const profile45 = matrixSeed.oneAtATime[code];
  if (profile45 && profile45.strategicRivals?.length > 0) {
    const maxRival = Math.max(...profile45.strategicRivals.map(r => r.frictionScore));
    const score = Math.min(100, Math.round(maxRival * 10));
    const stance: GeopoliticalStance = score >= 80
      ? 'SANCTIONED_ADVERSARIAL'
      : (score >= 60 ? 'FRICTION_STRATEGIC_COMPETITION' : 'NEUTRAL_COMMERCIAL');
    return { bilateralFrictionScore: score, bilateralStance: stance };
  }

  return { bilateralFrictionScore: Math.min(100, Math.round(baseRisk * 6)), bilateralStance: 'NEUTRAL_COMMERCIAL' };
}

/**
 * Calculates the composite Hard Country Index and assigns severity tier.
 */
export function calculateHardCountryIndex(
  isSelf: boolean,
  sanctionsScore: number,
  sovereignRiskScore: number,
  bilateralFrictionScore: number,
  baseRisk: number,
  autocraticNature: boolean,
  code: string
): { hardCountryIndex: number; tier: HardCountryTier } {
  let hci = Math.round(
    0.35 * sanctionsScore + 0.35 * sovereignRiskScore + 0.30 * bilateralFrictionScore
  );

  if (isSelf) {
    hci = Math.min(10, Math.round(baseRisk * 3));
  } else if (sanctionsScore >= 85 && sovereignRiskScore >= 75) {
    hci = Math.max(80, hci);
  } else if (sanctionsScore >= 55 && sovereignRiskScore >= 65 && bilateralFrictionScore >= 70) {
    hci = Math.max(60, hci);
  } else if (sanctionsScore === 0 && !autocraticNature && (baseRisk <= 3.5 || code === 'TW')) {
    hci = Math.min(25, hci);
  }

  hci = Math.max(0, Math.min(100, hci));

  let tier: HardCountryTier;
  if (hci >= 80) tier = 'EXTREME_HOSTILE';
  else if (hci >= 60) tier = 'STRATEGIC_ADVERSARIAL';
  else if (hci >= 35) tier = 'HIGH_FRICTION_NEUTRAL';
  else tier = 'STABLE_COOPERATIVE';

  return { hardCountryIndex: hci, tier };
}

/**
 * Compiles human-readable primary risk drivers for the dossier.
 */
export function compileRiskDrivers(
  sanctionsScore: number,
  regimes: string[],
  isAutocratic: boolean,
  isHighSovereignRisk: boolean,
  baseRisk: number,
  bilateralFrictionScore: number
): string[] {
  const drivers: string[] = [];
  if (sanctionsScore >= 70) {
    drivers.push(`Sanciones internacionales integrales (${regimes.join(', ')})`);
  } else if (sanctionsScore >= 40) {
    drivers.push(`Sanciones sectoriales y controles de exportación (${regimes.join(', ')})`);
  }

  if (isAutocratic && isHighSovereignRisk) {
    drivers.push(`Régimen autocrático con alto riesgo soberano (${baseRisk}/10)`);
  } else if (isAutocratic) {
    drivers.push(`Régimen autocrático / control estatista (${baseRisk}/10)`);
  } else if (isHighSovereignRisk) {
    drivers.push(`Alto riesgo soberano y vulnerabilidad institucional (${baseRisk}/10)`);
  }

  if (bilateralFrictionScore >= 70) {
    drivers.push(`Fricción estratégica bilateral crítica (${(bilateralFrictionScore / 10).toFixed(1)}/10)`);
  }

  if (drivers.length === 0) {
    drivers.push('Jurisdicción de mercado estable con estado de derecho y baja fricción');
  }

  return drivers;
}
