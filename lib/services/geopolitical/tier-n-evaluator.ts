/**
 * lib/services/geopolitical/tier-n-evaluator.ts
 *
 * Evaluates the multi-tier geopolitical exposure of a Bill of Materials (BOM),
 * detecting hard country bottlenecks and hidden Tier-2..Tier-N leakages.
 */

import {
  TierNInputPayload,
  TierNEvaluationResult,
  HardCountryBottleneck
} from './types';
import { resolveCountryCode } from './country-resolver';
import { getHardCountryProfile } from './hard-country-engine';
import {
  ScoredComponent,
  normalizeBomShares,
  createFallbackProfile,
  aggregateOrigins,
  buildMitigations
} from './tier-n-helpers';

/**
 * Scores an individual BOM component and resolves bottleneck status.
 */
function scoreSingleComponent(
  input: TierNInputPayload,
  share: number,
  targetCountry?: string
): ScoredComponent {
  const tierNum = Number(input.tier);
  const tier = Number.isFinite(tierNum) ? Math.max(1, Math.round(tierNum)) : 1;
  const criticality = input.criticality === 'CRITICAL' || input.criticality === 'HIGH' || input.criticality === 'MEDIUM'
    ? input.criticality
    : 'HIGH';
  const sub = Number(input.substitutability);
  const substitutability = Number.isFinite(sub) ? Math.max(0, Math.min(1, sub)) : 0.5;

  const componentName = String(input.componentName || '').trim() || `Insumo Tier-${tier}`;
  const originStr = String(input.originCountry || '').trim();
  const resolvedCode = resolveCountryCode(originStr) || originStr.toUpperCase();

  const profile = getHardCountryProfile(resolvedCode, targetCountry) || createFallbackProfile(resolvedCode, originStr);
  const hci = profile.hardCountryIndex;
  const critMultiplier = criticality === 'CRITICAL' ? 1.3 : (criticality === 'HIGH' ? 1.0 : 0.7);
  const subFactor = 1.5 - (substitutability * 0.8);
  const tierFactor = tier >= 2 ? 1.05 : 1.0;

  const rawScore = profile.tier === 'STABLE_COOPERATIVE'
    ? Math.min(25, Math.round(hci * critMultiplier * subFactor * 0.4))
    : Math.max(0, Math.min(100, Math.round(hci * critMultiplier * subFactor * tierFactor)));

  const isHardCountry = profile.isHardCountry || hci >= 60;
  return {
    componentName,
    tier,
    criticality,
    substitutability,
    sharePercentage: share,
    profile,
    componentRiskScore: rawScore,
    isBottleneck: isHardCountry || rawScore >= 50,
    isLeakage: isHardCountry && tier >= 2
  };
}

/**
 * Builds reasons and mitigation descriptions for bottlenecks.
 */
function createBottleneckRecord(s: ScoredComponent): HardCountryBottleneck {
  let reason = `Exposición a fricción comercial bilateral (${s.profile.countryName}).`;
  if (s.profile.countryCode === 'UNKNOWN' || s.profile.primaryRiskDrivers.some(d => d.includes('no resuelta') || d.includes('no catalogada'))) {
    reason = `Jurisdicción de origen no identificada (${s.profile.countryName}); evaluada con riesgo prudencial.`;
  } else if (s.profile.tier === 'EXTREME_HOSTILE') {
    reason = `Insumo crítico en régimen con sanciones totales y hostilidad bélica (${s.profile.countryName}).`;
  } else if (s.profile.tier === 'STRATEGIC_ADVERSARIAL') {
    reason = `Insumo con alta exposición en rival estratégico sujeto a fricción y controles (${s.profile.countryName}).`;
  } else if (s.substitutability <= 0.2) {
    reason = `Insumo cuasi-insustituible (sustituibilidad: ${s.substitutability.toFixed(2)}) con vulnerabilidad concentrada.`;
  }

  let mitigation = `Monitoreo periódico de cuotas y acuerdos arancelarios con ${s.profile.countryName}.`;
  if (s.profile.tier === 'EXTREME_HOSTILE') {
    mitigation = `Riesgo de corte inmediato por sanciones OFAC/UE. Mitigación: Friendshoring T03.4 urgente hacia proveedores aliados (ej. EE.UU., UE, Japón) e incremento de inventario HoI4 T03.19 a 180+ días.`;
  } else if (s.profile.tier === 'STRATEGIC_ADVERSARIAL') {
    mitigation = `Dependencia estratégica de ${s.profile.countryName} sujeta a controles de exportación y aranceles. Mitigación: Diversificación Friendshoring T03.4 (Vietnam, India, México) y buffer de seguridad HoI4 T03.19 de 90-120 días.`;
  } else if (s.substitutability <= 0.3) {
    mitigation = `Baja sustituibilidad. Mitigación: Doble homologación de especificaciones técnicas con proveedores secundarios alternativos.`;
  }

  return {
    componentName: s.componentName,
    originCountry: s.profile.countryCode,
    originCountryName: s.profile.countryName,
    originFlag: s.profile.flag,
    tier: s.tier,
    criticality: s.criticality,
    substitutability: s.substitutability,
    sharePercentage: s.sharePercentage,
    hardCountryIndex: s.profile.hardCountryIndex,
    tierClassification: s.profile.tier,
    componentRiskScore: s.componentRiskScore,
    isLeakage: s.isLeakage,
    reason,
    mitigation
  };
}

/**
 * Computes composite exposure score and tier exposure level.
 */
function computeCompositeExposure(scored: ScoredComponent[]) {
  const weightedSum = scored.reduce((acc, s) => acc + s.componentRiskScore * (s.sharePercentage / 100), 0);
  const maxRisk = scored.reduce((max, s) => Math.max(max, s.componentRiskScore), 0);
  const score = Math.max(0, Math.min(100, Math.round(
    maxRisk >= 70 ? (0.6 * weightedSum + 0.4 * maxRisk) : weightedSum
  )));
  const level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' = score >= 75 ? 'CRITICAL' : score >= 50 ? 'HIGH' : score >= 25 ? 'MODERATE' : 'LOW';
  return { score, level };
}

/**
 * Builds the human-readable summary audit statement.
 */
function generateAuditSummary(count: number, score: number, level: string, bottlenecks: number, leakages: number): string {
  let summary = `Auditoría Tier-N: ${count} insumos evaluados. Índice compuesto de exposición: ${score}/100 (${level}).`;
  if (bottlenecks > 0) {
    summary += ` Detectados ${bottlenecks} cuellos de botella en países duros, incluyendo ${leakages} fugas en capas profundas (Tier-2..Tier-N).`;
  } else {
    summary += ` Cadena de valor resiliente sin dependencias directas de jurisdicciones de alto riesgo.`;
  }
  return summary;
}

/**
 * Evaluates the geopolitical exposure of a multi-tier Bill of Materials (BOM).
 */
export function evaluateTierNInputExposure(
  inputs: TierNInputPayload[],
  targetCountry?: string
): TierNEvaluationResult {
  const validInputs = Array.isArray(inputs)
    ? inputs.filter((item): item is TierNInputPayload => Boolean(item && typeof item === 'object'))
    : [];

  if (validInputs.length === 0) {
    return {
      compositeExposureScore: 0,
      exposureLevel: 'LOW',
      totalInputsEvaluated: 0,
      hardCountryBottlenecks: [],
      tierNLeakages: [],
      highestRiskOrigins: [],
      mitigationStrategies: [],
      summaryAudit: 'No se suministraron insumos válidos para la evaluación de exposición Tier-N.'
    };
  }

  const shares = normalizeBomShares(validInputs);
  const scored = validInputs.map((input, idx) => scoreSingleComponent(input, shares[idx], targetCountry));
  const bottlenecks = scored.filter(s => s.isBottleneck).map(createBottleneckRecord);
  const tierNLeakages = bottlenecks.filter(b => b.isLeakage);

  const { score, level } = computeCompositeExposure(scored);
  const summaryAudit = generateAuditSummary(validInputs.length, score, level, bottlenecks.length, tierNLeakages.length);

  return {
    compositeExposureScore: score,
    exposureLevel: level,
    totalInputsEvaluated: validInputs.length,
    hardCountryBottlenecks: bottlenecks,
    tierNLeakages,
    highestRiskOrigins: aggregateOrigins(scored),
    mitigationStrategies: buildMitigations(bottlenecks),
    summaryAudit
  };
}
