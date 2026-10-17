/**
 * lib/services/geopolitical/tier-n-helpers.ts
 *
 * Helper utilities for Tier-N BOM analysis: share normalization,
 * fallback profile creation, origin aggregation, and mitigation formatting.
 */

import {
  TierNInputPayload,
  HardCountryProfile,
  HighestRiskOrigin,
  MitigationStrategy,
  HardCountryBottleneck
} from './types';

export interface ScoredComponent {
  componentName: string;
  tier: number;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  substitutability: number;
  sharePercentage: number;
  profile: HardCountryProfile;
  componentRiskScore: number;
  isBottleneck: boolean;
  isLeakage: boolean;
}

/**
 * Normalizes input shares: handles missing, explicit, and mixed percentages.
 */
export function normalizeBomShares(validInputs: TierNInputPayload[]): number[] {
  const rawShares = validInputs.map(i => {
    const sp = i.sharePercentage;
    return typeof sp === 'number' && Number.isFinite(sp) && sp >= 0 ? sp : null;
  });

  const explicitIndices: number[] = [];
  const missingIndices: number[] = [];
  let explicitSum = 0;

  rawShares.forEach((s, idx) => {
    if (s !== null) {
      explicitIndices.push(idx);
      explicitSum += s;
    } else {
      missingIndices.push(idx);
    }
  });

  const calculated = new Array<number>(validInputs.length).fill(0);
  if (explicitIndices.length === 0) {
    const equalShare = Number((100 / validInputs.length).toFixed(2));
    for (let i = 0; i < validInputs.length; i++) calculated[i] = equalShare;
  } else if (missingIndices.length === 0) {
    const totalRaw = explicitSum > 0 ? explicitSum : 1;
    for (let i = 0; i < validInputs.length; i++) {
      calculated[i] = Number(((rawShares[i]! / totalRaw) * 100).toFixed(2));
    }
  } else if (explicitSum < 100) {
    const perMissing = Number(((100 - explicitSum) / missingIndices.length).toFixed(2));
    for (const idx of explicitIndices) calculated[idx] = Number(rawShares[idx]!.toFixed(2));
    for (const idx of missingIndices) calculated[idx] = perMissing;
  } else {
    for (const idx of explicitIndices) calculated[idx] = Number(((rawShares[idx]! / explicitSum) * 100).toFixed(2));
    for (const idx of missingIndices) calculated[idx] = 0;
  }
  return calculated;
}

/**
 * Builds fallback profile for uncataloged jurisdictions.
 */
export function createFallbackProfile(resolvedCode: string, originCountry: string): HardCountryProfile {
  return {
    countryCode: resolvedCode || 'UNKNOWN',
    iso3: resolvedCode || 'UNK',
    countryName: originCountry || 'Jurisdicción No Catalogada',
    flag: '🌐',
    region: 'Global',
    hardCountryIndex: 60,
    tier: 'STRATEGIC_ADVERSARIAL',
    sanctionsScore: 40,
    sanctionsDetail: {
      level: 'TARGETED',
      score: 40,
      regimes: ['UNRESOLVED_JURISDICTION'],
      description: 'Jurisdicción no catalogada; evaluada con precaución prudencial.'
    },
    sovereignRiskScore: 65,
    autocraticNature: true,
    bilateralFrictionScore: 60,
    primaryRiskDrivers: ['Jurisdicción no resuelta en el índice canónico'],
    isHardCountry: true
  };
}

/**
 * Aggregates exposure shares grouped by origin country.
 */
export function aggregateOrigins(scored: ScoredComponent[]): HighestRiskOrigin[] {
  const map = new Map<string, HighestRiskOrigin>();
  for (const s of scored) {
    const code = s.profile.countryCode;
    const existing = map.get(code);
    if (existing) {
      existing.inputCount += 1;
      existing.totalShare = Number((existing.totalShare + s.sharePercentage).toFixed(2));
    } else {
      map.set(code, {
        countryCode: code,
        countryName: s.profile.countryName,
        flag: s.profile.flag,
        hci: s.profile.hardCountryIndex,
        tier: s.profile.tier,
        inputCount: 1,
        totalShare: s.sharePercentage
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.hci - a.hci || b.totalShare - a.totalShare);
}

/**
 * Formulates tactical Friendshoring, HoI4 buffer, and diversification strategies.
 */
export function buildMitigations(bottlenecks: HardCountryBottleneck[]): MitigationStrategy[] {
  const mitigations: MitigationStrategy[] = [];
  const extreme = bottlenecks.filter(b => b.tierClassification === 'EXTREME_HOSTILE');
  const strategic = bottlenecks.filter(b => b.tierClassification === 'STRATEGIC_ADVERSARIAL');
  const lowSub = bottlenecks.filter(b => b.substitutability <= 0.3);

  if (extreme.length > 0 || strategic.length > 0) {
    const list = [...extreme, ...strategic].map(b => b.componentName);
    mitigations.push({
      category: 'FRIENDSHORING_T03_4',
      title: 'Relocalización de Insumos Críticos a Jurisdicciones Aliadas (Friendshoring T03.4)',
      description: `Se detectaron ${list.length} insumos con procedencia en países duros (HCI ≥ 60). Se recomienda iniciar la homologación acelerada de alternativas en el bloque USMCA (México, Canadá), Unión Europea o aliados indo-pacíficos (Japón, Corea del Sur, Taiwán).`,
      affectedComponents: list,
      priority: extreme.length > 0 ? 'URGENT' : 'HIGH'
    });
  }

  if (bottlenecks.length > 0) {
    mitigations.push({
      category: 'INVENTORY_BUFFER_HOI4_T03_19',
      title: 'Constitución de Buffers de Inventario Estratégico HoI4 (T03.19)',
      description: `Para amortiguar riesgos de interrupción o embargo, implementar reservas tácticas: 180 días de inventario de seguridad para componentes en régimen EXTREME_HOSTILE y 90-120 días para STRATEGIC_ADVERSARIAL.`,
      affectedComponents: bottlenecks.map(b => b.componentName),
      priority: 'HIGH'
    });
  }

  if (lowSub.length > 0) {
    mitigations.push({
      category: 'SUPPLIER_DIVERSIFICATION',
      title: 'Doble Homologación y Reducción de Dependencia de Suministrador Único',
      description: `Los insumos con sustituibilidad ≤ 0.30 representan puntos únicos de fallo (SPOF). Se exige certificar un proveedor secundario fuera de las jurisdicciones de alta fricción.`,
      affectedComponents: lowSub.map(b => b.componentName),
      priority: 'HIGH'
    });
  }

  return mitigations;
}
