/**
 * Cálculo de días de retraso logístico por bloqueos y sinergias geográficas.
 */

import { STRATEGIC_CHOKEPOINTS } from './chokepoints-data';
import { MaritimeChokepointId } from './types';

/**
 * Filtra IDs válidos y normalizados de cuellos de botella marítimos.
 */
export function filterValidBlockedChokepoints(
  blockedChokepoints: MaritimeChokepointId[] = []
): MaritimeChokepointId[] {
  return Array.from(new Set(blockedChokepoints || [])).filter(
    (id): id is MaritimeChokepointId => Boolean(id && STRATEGIC_CHOKEPOINTS[id])
  );
}

/**
 * Calcula los días de retraso adicionales considerando sinergias geográficas:
 * Si Suez y Bab el-Mandeb están ambos cerrados, comparten la circunnavegación por el Cabo de Buena
 * Esperanza y no se duplican ingenuamente; en cambio se aplica max + congestión de repostaje (+3d).
 */
export function calculateTransitDelay(blockedChokepoints: MaritimeChokepointId[]): number {
  const validBlocked = filterValidBlockedChokepoints(blockedChokepoints);
  if (validBlocked.length === 0) return 0;

  const isSuezBlocked = validBlocked.includes('suez');
  const isBabBlocked = validBlocked.includes('bab_el_mandeb');
  const individualDelays: number[] = [];

  if (isSuezBlocked && isBabBlocked) {
    const redSeaDetour = Math.max(
      STRATEGIC_CHOKEPOINTS.suez.baselineTransitDelayDays,
      STRATEGIC_CHOKEPOINTS.bab_el_mandeb.baselineTransitDelayDays
    ) + 3;
    individualDelays.push(redSeaDetour);
  } else if (isSuezBlocked) {
    individualDelays.push(STRATEGIC_CHOKEPOINTS.suez.baselineTransitDelayDays);
  } else if (isBabBlocked) {
    individualDelays.push(STRATEGIC_CHOKEPOINTS.bab_el_mandeb.baselineTransitDelayDays);
  }

  for (const id of validBlocked) {
    if (id === 'suez' || id === 'bab_el_mandeb') continue;
    individualDelays.push(STRATEGIC_CHOKEPOINTS[id].baselineTransitDelayDays);
  }

  if (individualDelays.length === 0) return 0;
  individualDelays.sort((a, b) => b - a);

  let baseDelay = individualDelays[0];
  for (let i = 1; i < individualDelays.length; i++) {
    baseDelay += individualDelays[i] * 0.35;
  }
  return Math.round(baseDelay);
}
