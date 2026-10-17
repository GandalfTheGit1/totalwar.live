/**
 * Modelado de incremento de tarifas de flete ($/FEU) y alternativas de desvío marítimo.
 */

import { STRATEGIC_CHOKEPOINTS } from './chokepoints-data';
import { SECTOR_PROFILES } from './sector-profiles-data';
import { filterValidBlockedChokepoints } from './transit-delays';
import {
  MaritimeChokepointId,
  MaritimeIndustrySector,
  ReroutingAlternative,
} from './types';

/**
 * Calcula el incremento porcentual de fletes marítimos spot ($/FEU).
 */
export function calculateFreightSurge(
  blockedChokepoints: MaritimeChokepointId[],
  sector: MaritimeIndustrySector = 'AUTOMOTIVE_PARTS',
  sensitivityMultiplier: number = 1.0
): number {
  const validBlocked = filterValidBlockedChokepoints(blockedChokepoints);
  if (validBlocked.length === 0) return 0;

  const profile = (sector && SECTOR_PROFILES[sector]) || SECTOR_PROFILES.AUTOMOTIVE_PARTS;
  let rawSurge = 0;
  for (const id of validBlocked) {
    const def = STRATEGIC_CHOKEPOINTS[id];
    if (!def) continue;
    const exposure = profile.chokepointExposureWeights[id] ?? 0.5;
    rawSurge += def.baseSurgePct * exposure;
  }

  const n = validBlocked.length;
  const compoundFactor = n > 1 ? 1 + 0.18 * (n - 1) : 1.0;
  const safeMultiplier = typeof sensitivityMultiplier === 'number' && !Number.isNaN(sensitivityMultiplier)
    ? sensitivityMultiplier
    : 1.0;
  const finalSurge = rawSurge * compoundFactor * Math.max(0.5, Math.min(3.0, safeMultiplier));
  return Math.round(finalSurge * 10) / 10;
}

interface FuelAndBottleneck {
  extraFuelCost: number;
  bottleneck: string;
}

function resolveFuelCostAndBottleneck(id: MaritimeChokepointId): FuelAndBottleneck {
  if (id === 'hormuz') {
    return {
      extraFuelCost: 450,
      bottleneck: 'Capacidad máxima de oleoductos (6.5M bpd frente a 21M bpd habituales)',
    };
  }
  if (id === 'malacca') {
    return {
      extraFuelCost: 650,
      bottleneck: 'Calado menor en Sunda y fondeaderos saturados en Indonesia',
    };
  }
  if (id === 'panama') {
    return {
      extraFuelCost: 1600,
      bottleneck: 'Líneas férreas transcontinentales y estiba portuaria en Los Ángeles / Long Beach',
    };
  }
  if (id === 'bosporus') {
    return {
      extraFuelCost: 800,
      bottleneck: 'Diferencia de ancho de vía férrea en fronteras europeas y calado en Danubio',
    };
  }
  return {
    extraFuelCost: 900,
    bottleneck: 'Puertos de bunkering y repostaje de combustible en Sudáfrica',
  };
}

/**
 * Genera la lista de alternativas de desvío y bypass activadas por los bloqueos.
 */
export function getReroutingAlternatives(
  blockedChokepoints: MaritimeChokepointId[]
): ReroutingAlternative[] {
  const uniqueBlocked = filterValidBlockedChokepoints(blockedChokepoints);
  if (uniqueBlocked.length === 0) return [];

  const alternatives: ReroutingAlternative[] = [];
  const seenAlternatives = new Set<string>();

  for (const id of uniqueBlocked) {
    const def = STRATEGIC_CHOKEPOINTS[id];
    if (!def) continue;

    if ((id === 'suez' || id === 'bab_el_mandeb') && seenAlternatives.has('cape_good_hope')) {
      continue;
    }
    if (id === 'suez' || id === 'bab_el_mandeb') {
      seenAlternatives.add('cape_good_hope');
    }

    const { extraFuelCost, bottleneck } = resolveFuelCostAndBottleneck(id);

    alternatives.push({
      chokepointId: id,
      chokepointName: def.nameEs,
      alternativeName: def.alternativeRouteName,
      description: def.alternativeRouteDescription,
      extraTransitDays: def.baselineTransitDelayDays,
      extraDistanceNm: def.reroutingDistanceNm,
      capacityBottleneck: bottleneck,
      estimatedExtraFuelCostPerFeu: extraFuelCost,
    });
  }

  return alternatives;
}
