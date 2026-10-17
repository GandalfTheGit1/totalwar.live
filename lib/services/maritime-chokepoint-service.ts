/**
 * lib/services/maritime-chokepoint-service.ts
 * 
 * Fachada principal del motor determinista de simulación de chokepoints marítimos,
 * rutas globales e impacto en márgenes y COGS.
 * 
 * Re-exporta contratos y delega en submódulos especializados en lib/services/maritime-chokepoints/:
 * - types.ts: Contratos, enums e interfaces de dominio.
 * - chokepoints-data.ts: Catálogo de los 6 estrechos y canales.
 * - sector-profiles-data.ts: Perfiles de sensibilidad por sector industrial.
 * - trade-routes-data.ts: Corredores marítimos y rutas de contingencia.
 * - presets-data.ts: Escenarios preconfigurados de wargaming.
 * - simulation-calculations.ts: Motor algebraico determinista de fletes, retrasos y COGS.
 */

import { STRATEGIC_CHOKEPOINTS, CHOKEPOINT_LIST } from './maritime-chokepoints/chokepoints-data';
import { SECTOR_PROFILES } from './maritime-chokepoints/sector-profiles-data';
import { GLOBAL_MARITIME_ROUTES } from './maritime-chokepoints/trade-routes-data';
import { CHOKEPOINT_PRESETS } from './maritime-chokepoints/presets-data';
import {
  calculateTransitDelay,
  calculateFreightSurge,
  getReroutingAlternatives,
  simulateChokepointBlockades,
} from './maritime-chokepoints/simulation-calculations';
import {
  MaritimeChokepointId,
  MaritimeIndustrySector,
  StrategicChokepointDefinition,
  IndustrySectorProfile,
  MaritimeTradeRoute,
  ChokepointSimulationPreset,
  ReroutingAlternative,
  ChokepointSimulationInput,
  MaritimeSimulationResult,
} from './maritime-chokepoints/types';

export * from './maritime-chokepoints/types';
export * from './maritime-chokepoints/chokepoints-data';
export * from './maritime-chokepoints/sector-profiles-data';
export * from './maritime-chokepoints/trade-routes-data';
export * from './maritime-chokepoints/presets-data';
export * from './maritime-chokepoints/simulation-calculations';

/**
 * Fachada con métodos estáticos para retrocompatibilidad total con consumidores existentes.
 */
export class MaritimeChokepointService {
  public static getChokepoint(id: MaritimeChokepointId): StrategicChokepointDefinition {
    const cp = STRATEGIC_CHOKEPOINTS[id];
    if (!cp) {
      throw new Error(`[MaritimeChokepointService] Chokepoint no reconocido: ${id}`);
    }
    return cp;
  }

  public static getAllChokepoints(): StrategicChokepointDefinition[] {
    return CHOKEPOINT_LIST;
  }

  public static getSectorProfile(sector: MaritimeIndustrySector): IndustrySectorProfile {
    const prof = SECTOR_PROFILES[sector];
    if (!prof) {
      throw new Error(`[MaritimeChokepointService] Sector no reconocido: ${sector}`);
    }
    return prof;
  }

  public static getAllRoutes(): MaritimeTradeRoute[] {
    return GLOBAL_MARITIME_ROUTES;
  }

  public static getPresets(): ChokepointSimulationPreset[] {
    return CHOKEPOINT_PRESETS;
  }

  public static calculateTransitDelay(blockedChokepoints: MaritimeChokepointId[]): number {
    return calculateTransitDelay(blockedChokepoints);
  }

  public static calculateFreightSurge(
    blockedChokepoints: MaritimeChokepointId[],
    sector: MaritimeIndustrySector = 'AUTOMOTIVE_PARTS',
    sensitivityMultiplier: number = 1.0
  ): number {
    return calculateFreightSurge(blockedChokepoints, sector, sensitivityMultiplier);
  }

  public static getReroutingAlternatives(
    blockedChokepoints: MaritimeChokepointId[]
  ): ReroutingAlternative[] {
    return getReroutingAlternatives(blockedChokepoints);
  }

  public static simulateChokepointBlockades(
    input: ChokepointSimulationInput
  ): MaritimeSimulationResult {
    return simulateChokepointBlockades(input);
  }
}
