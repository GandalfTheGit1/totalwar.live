/**
 * Motor integral de simulación financiera, compresión de margen bruto y evaluación HoI4 JIT Starvation.
 */

import { CHOKEPOINT_LIST } from './chokepoints-data';
import { SECTOR_PROFILES } from './sector-profiles-data';
import { filterValidBlockedChokepoints, calculateTransitDelay } from './transit-delays';
import { calculateFreightSurge, getReroutingAlternatives } from './freight-calculations';
import {
  MaritimeChokepointId,
  MaritimeIndustrySector,
  IndustrySectorProfile,
  JitStarvationRiskLevel,
  ChokepointStatusDetail,
  ChokepointSimulationInput,
  MaritimeSimulationResult,
} from './types';

interface FinancialImpactMetrics {
  simulatedFreightRatePerFeu: number;
  cogsImpactPct: number;
  grossMarginBefore: number;
  grossMarginAfter: number;
  grossMarginCompressionBps: number;
}

function calculateFinancialImpact(
  profile: IndustrySectorProfile,
  transitDelayDays: number,
  freightRateSurgePct: number,
  customGrossMarginPct?: number,
  customFreightSharePct?: number
): FinancialImpactMetrics {
  const baseGrossMargin = customGrossMarginPct !== undefined ? customGrossMarginPct : profile.grossMarginPct;
  const freightShareInCogs = customFreightSharePct !== undefined ? customFreightSharePct : profile.freightShareInCogsPct;
  const dio = profile.typicalDioDays > 0 ? profile.typicalDioDays : 1;

  const simulatedFreightRatePerFeu = Math.round(
    profile.baselineFreightPerFeu * (1 + freightRateSurgePct / 100)
  );

  const delayPenaltyFactor = transitDelayDays > 0 ? 1 + (transitDelayDays / dio) * 0.25 : 1.0;
  const cogsImpactPct = Math.round(
    ((freightShareInCogs / 100) * freightRateSurgePct * delayPenaltyFactor) * 100
  ) / 100;

  const baseCogs = 100 - baseGrossMargin;
  const newCogs = baseCogs * (1 + cogsImpactPct / 100);
  const grossMarginAfter = Math.round((100 - newCogs) * 100) / 100;
  const grossMarginBefore = baseGrossMargin;
  const grossMarginCompressionBps = Math.round((grossMarginBefore - grossMarginAfter) * 100);

  return {
    simulatedFreightRatePerFeu,
    cogsImpactPct,
    grossMarginBefore,
    grossMarginAfter,
    grossMarginCompressionBps,
  };
}

interface JitRiskEvaluation {
  jitStarvationRisk: JitStarvationRiskLevel;
  jitOutputMultiplier: number;
  isJitStarved: boolean;
}

function evaluateJitStarvation(transitDelayDays: number, typicalDioDays: number): JitRiskEvaluation {
  const dio = typicalDioDays > 0 ? typicalDioDays : 1;
  let jitStarvationRisk: JitStarvationRiskLevel = 'LOW';
  let isJitStarved = false;

  if (transitDelayDays >= dio * 0.8) {
    jitStarvationRisk = 'CRITICAL';
    isJitStarved = true;
  } else if (transitDelayDays >= dio * 0.5) {
    jitStarvationRisk = 'HIGH';
    isJitStarved = true;
  } else if (transitDelayDays >= dio * 0.25) {
    jitStarvationRisk = 'MODERATE';
    isJitStarved = false;
  }

  const jitOutputMultiplier = isJitStarved
    ? Math.max(0, Math.round((1.0 - transitDelayDays / dio) * 100) / 100)
    : 1.0;

  return { jitStarvationRisk, jitOutputMultiplier, isJitStarved };
}

function buildTacticalRecommendation(
  risk: JitStarvationRiskLevel,
  labelEs: string,
  transitDelayDays: number,
  compressionBps: number,
  dio: number
): string {
  if (risk === 'CRITICAL') {
    return `ALERTA DEFCON 1: Riesgo crítico de parada fabril inmediata en ${labelEs}. Se requiere conmutar a flete aéreo de emergencia para componentes críticos y habilitar amortiguador de inventario HoI4 de 60 días.`;
  }
  if (risk === 'HIGH') {
    return `ALERTA ELEVADA: Retraso logístico severo (+${transitDelayDays} días). Fletes marítimos comprimen el margen bruto en ${compressionBps} bps. Activar friendshoring diplomático y aprovisionamiento dual.`;
  }
  if (risk === 'MODERATE') {
    return `AVISO LOGÍSTICO: Fricción marítima moderada (+${transitDelayDays} días). Absorción viable por inventario existente (${dio} días DIO), pero se recomienda asegurar contratos de flete a plazo fijo.`;
  }
  return 'Rutas logísticas marítimas fluidas. No se requieren buffers de inventario de emergencia.';
}

function buildChokepointDetails(
  blockedList: string[],
  profile: IndustrySectorProfile
): ChokepointStatusDetail[] {
  return CHOKEPOINT_LIST.map((cp) => ({
    id: cp.id,
    name: cp.nameEs,
    isBlocked: blockedList.includes(cp.id),
    coordinates: cp.coordinates,
    transitDelayDays: cp.baselineTransitDelayDays,
    surgeContributionPct: blockedList.includes(cp.id)
      ? cp.baseSurgePct * (profile.chokepointExposureWeights[cp.id] ?? 0.5)
      : 0,
    alternativeRouteName: cp.alternativeRouteName,
    riparianCountries: cp.riparianCountries,
  }));
}

function resolveSensitivityMultiplier(rawMultiplier?: number): number {
  const safe = typeof rawMultiplier === 'number' && !Number.isNaN(rawMultiplier) ? rawMultiplier : 1.0;
  return Math.max(0.5, Math.min(3.0, safe));
}

function assembleSimulationResult(
  meta: {
    blockedList: MaritimeChokepointId[];
    sector: MaritimeIndustrySector;
    profile: IndustrySectorProfile;
    sensitivity: number;
    transitDelayDays: number;
    freightRateSurgePct: number;
  },
  finance: FinancialImpactMetrics,
  jit: JitRiskEvaluation
): MaritimeSimulationResult {
  const chokepointDetails = buildChokepointDetails(meta.blockedList, meta.profile);
  const tacticalRecommendation = buildTacticalRecommendation(
    jit.jitStarvationRisk,
    meta.profile.labelEs,
    meta.transitDelayDays,
    finance.grossMarginCompressionBps,
    meta.profile.typicalDioDays
  );

  return {
    blockedChokepoints: meta.blockedList,
    blockedCount: meta.blockedList.length,
    sector: meta.sector,
    sectorProfile: meta.profile,
    sensitivityMultiplier: meta.sensitivity,
    transitDelayDays: meta.transitDelayDays,
    freightRateSurgePct: meta.freightRateSurgePct,
    simulatedFreightRatePerFeu: finance.simulatedFreightRatePerFeu,
    cogsImpactPct: finance.cogsImpactPct,
    grossMarginBefore: finance.grossMarginBefore,
    grossMarginAfter: finance.grossMarginAfter,
    grossMarginCompressionBps: finance.grossMarginCompressionBps,
    jitStarvationRisk: jit.jitStarvationRisk,
    jitOutputMultiplier: jit.jitOutputMultiplier,
    isJitStarved: jit.isJitStarved,
    reroutingAlternatives: getReroutingAlternatives(meta.blockedList),
    chokepointDetails,
    tacticalRecommendation,
  };
}

/**
 * Simulación completa e integral de impacto logístico, financiero y JIT Starvation.
 */
export function simulateChokepointBlockades(
  input: ChokepointSimulationInput
): MaritimeSimulationResult {
  const blockedList = filterValidBlockedChokepoints(input?.blockedChokepoints);
  const sector = input?.sector || 'AUTOMOTIVE_PARTS';
  const profile = (sector && SECTOR_PROFILES[sector]) || SECTOR_PROFILES.AUTOMOTIVE_PARTS;
  const sensitivity = resolveSensitivityMultiplier(input?.sensitivityMultiplier);

  const transitDelayDays = calculateTransitDelay(blockedList);
  const freightRateSurgePct = calculateFreightSurge(blockedList, profile.sector, sensitivity);
  const finance = calculateFinancialImpact(
    profile,
    transitDelayDays,
    freightRateSurgePct,
    input?.customGrossMarginPct,
    input?.customFreightSharePct
  );
  const jit = evaluateJitStarvation(transitDelayDays, profile.typicalDioDays);

  return assembleSimulationResult(
    { blockedList, sector, profile, sensitivity, transitDelayDays, freightRateSurgePct },
    finance,
    jit
  );
}
