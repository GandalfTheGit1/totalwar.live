/**
 * lib/data/tech-tree/index.ts
 *
 * Central barrel export and high-level query helpers for the Historical Country Technology Tree.
 */

export * from './types';
export * from './config';
export * from './definition';
export * from './event-log';
export * from './wikidata-parser';
export * from './historical-seed';

import {
  ReconstructedCountryTechTree,
  TechAreaId,
  TechNodeStatus,
  TechTreeEvent,
} from './types';
import { TECH_TREE_CONFIG } from './config';
import { stateAt, StateAtOptions } from './event-log';
import { getTechTreeEvents } from './historical-seed';

export interface ChoroplethCountryCell {
  pais: string;
  isPilotCountry: boolean;
  hasVerifiedData: boolean;
  maxNivelAlcanzado: number;
  scoreArea: number;
  estadoNivelSeleccionado: TechNodeStatus;
  bloqueadoPorSancion: boolean;
  retroceso: boolean;
  via: string | null;
}

/**
 * Convenience helper to reconstruct a country's tech tree at a given date from the active event log.
 */
export function getCountryTechTreeAt(
  pais: string,
  fecha: number | string = 2026,
  options?: StateAtOptions
): ReconstructedCountryTechTree {
  return stateAt(pais, fecha, getTechTreeEvents(), options);
}

/**
 * Computes choropleth map data across countries for a given area, optional target level, and year.
 */
export function getChoroplethByArea(
  areaId: TechAreaId,
  fecha: number | string = 2026,
  targetNivel?: number,
  events?: TechTreeEvent[],
  countries: readonly string[] = TECH_TREE_CONFIG.pilotCountries
): ChoroplethCountryCell[] {
  const log = events ?? getTechTreeEvents();
  return countries.map((code) => {
    const tree = stateAt(code, fecha, log);
    const area = tree.areas[areaId];
    const targetNode = targetNivel
      ? area?.nodos.find((n) => n.nivel === targetNivel)
      : area?.nodos
          .slice()
          .reverse()
          .find((n) => n.estado !== 'no_alcanzado') ?? area?.nodos[0];

    return {
      pais: tree.pais,
      isPilotCountry: tree.isPilotCountry,
      hasVerifiedData: tree.hasVerifiedData,
      maxNivelAlcanzado: area ? area.maxNivelAlcanzado : 0,
      scoreArea: area ? area.scoreArea : 0,
      estadoNivelSeleccionado: targetNode ? targetNode.estado : 'no_alcanzado',
      bloqueadoPorSancion: targetNode ? targetNode.bloqueado_por_sancion : false,
      retroceso: targetNode ? targetNode.retroceso : false,
      via: targetNode ? targetNode.via : null,
    };
  });
}
