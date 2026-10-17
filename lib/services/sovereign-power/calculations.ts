/**
 * lib/services/sovereign-power/calculations.ts
 *
 * Deterministic mathematical calculation engines for sovereign power:
 * - Ray Dalio 6-Pillar Composite Power Index
 * - Geopolitical Leverage Index (offensive/defensive weightings)
 * - DEFCON operational crisis severity and alert status resolution
 */

import { 
  SovereignRadarScores, 
  WargameShocks, 
  DefconStatus 
} from '../../types/sovereign-power';
import { DEFCON_LEVELS } from './benchmarks';

/**
 * Calculates the weighted composite power index (0-100) based on Ray Dalio's weights:
 * Technology (22%), Currency (20%), Military (22%), Trade (16%), Politics (10%), Stability (10%).
 */
export function calculateCompositePowerIndex(scores: SovereignRadarScores): number {
  const composite = (
    (scores?.techInnovation ?? 0) * 0.22 +
    (scores?.currencyHegemony ?? 0) * 0.20 +
    (scores?.militaryCapacity ?? 0) * 0.22 +
    (scores?.tradeCompetitiveness ?? 0) * 0.16 +
    (scores?.politicalCabinet ?? 0) * 0.10 +
    (scores?.institutionalStability ?? 0) * 0.10
  );
  if (Number.isNaN(composite)) return 50;
  return Math.round(Math.max(0, Math.min(100, composite)));
}

/**
 * Calculates geopolitical leverage index (0-100).
 * Measures asymmetric offensive and defensive leverage across global systems:
 * Military (30%), Tech (25%), Currency (25%), Trade (20%).
 */
export function calculateGeopoliticalLeverage(scores: SovereignRadarScores): number {
  const leverage = (
    (scores?.militaryCapacity ?? 0) * 0.30 +
    (scores?.techInnovation ?? 0) * 0.25 +
    (scores?.currencyHegemony ?? 0) * 0.25 +
    (scores?.tradeCompetitiveness ?? 0) * 0.20
  );
  if (Number.isNaN(leverage)) return 50;
  return Math.round(Math.max(0, Math.min(100, leverage)));
}


/**
 * Calculates severity impact from active wargame shocks.
 * Note: Only positive defense surges raise military emergency war readiness;
 * defense cuts degrade deterrence without placing troops on nuclear alert.
 */
function calculateShocksSeverity(shocks: WargameShocks): number {
  let severity = 0;

  if (shocks.defenseShock >= 40) severity += 2;
  else if (shocks.defenseShock >= 20) severity += 1;

  if (shocks.tradeShock <= -40) severity += 2;
  else if (shocks.tradeShock <= -20) severity += 1;

  if (shocks.currencyShock <= -40) severity += 2;
  else if (shocks.currencyShock <= -25) severity += 1;

  if (shocks.techShock <= -30) severity += 2;
  else if (shocks.techShock <= -15) severity += 1;

  // Compound crisis: wartime mobilization + severe currency collapse
  if (shocks.defenseShock >= 30 && shocks.currencyShock <= -30) {
    severity += 2;
  }

  return severity;
}

/**
 * Determines baseline severity from global tension and sovereign risk factor.
 */
function calculateBaselineSeverity(worldTension: number, baselineRisk: number): number {
  let severity = 0;
  if (worldTension > 75) severity += 2;
  else if (worldTension > 50) severity += 1;

  if (baselineRisk >= 7.0) severity += 2;
  else if (baselineRisk >= 5.5) severity += 1;
  return severity;
}

/**
 * Determines the DEFCON alert level based on leverage, active shocks, and composite stability.
 */
export function calculateDefconStatus(
  compositeScore: number, 
  shocks?: WargameShocks, 
  worldTension: number = 45,
  baselineRisk: number = 3.0
): DefconStatus {
  let severityScore = calculateBaselineSeverity(worldTension, baselineRisk);

  if (shocks) {
    severityScore += calculateShocksSeverity(shocks);
  }

  const safeComposite = Number.isNaN(compositeScore) ? 50 : compositeScore;
  if (safeComposite < 30) {
    severityScore += 2;
  }


  if (severityScore >= 5) return DEFCON_LEVELS[1];
  if (severityScore === 4) return DEFCON_LEVELS[2];
  if (severityScore === 3 || severityScore === 2) return DEFCON_LEVELS[3];
  if (severityScore === 1) return DEFCON_LEVELS[4];
  return DEFCON_LEVELS[5];
}
