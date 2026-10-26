/**
 * lib/services/tech-tree/telemetry.ts
 *
 * Anonymous telemetry recording and aggregation for the Historical Technology Tree.
 * Tracks unique queries by country and area, comparator opens, and year slider usage
 * to measure the Market Research goal (400 unique queries in 45 days - Suposición).
 */

import { TechAreaId } from '@/lib/data/tech-tree/types';
import { TECH_TREE_CONFIG } from '@/lib/data/tech-tree/config';
import { TECH_TREE_VERSION } from '@/lib/data/tech-tree/definition';

export type TechTelemetryEventType =
  | 'consulta_pais_area'
  | 'apertura_comparador'
  | 'uso_deslizador';

export interface TechTelemetryRecord {
  id: string;
  fecha: string; // YYYY-MM-DD
  timestamp: string; // ISO8601
  version_arbol: string;
  tipo: TechTelemetryEventType;
  pais?: string;
  area?: TechAreaId;
  paisComparado?: string;
  anioConsultado?: number;
}

export interface CountryAreaPairRanking {
  pairKey: string;
  pais: string;
  area: TechAreaId;
  count: number;
}

export interface TechTelemetrySummary {
  versionArbol: string;
  totalEvents: number;
  uniqueCountryAreaQueries: number;
  comparatorOpens: number;
  sliderUses: number;
  targetUniqueQueries: number;
  evaluationWindowDays: number;
  topCountryAreaPairs: CountryAreaPairRanking[];
  events: TechTelemetryRecord[];
}

let telemetryStore: TechTelemetryRecord[] = [];

/**
 * Records an anonymous telemetry event with current date and tree version.
 */
export function recordTechTreeTelemetry(input: {
  tipo: TechTelemetryEventType;
  pais?: string;
  area?: TechAreaId;
  paisComparado?: string;
  anioConsultado?: number;
  fechaOverride?: string;
}): TechTelemetryRecord {
  const now = new Date();
  const fecha = input.fechaOverride || now.toISOString().split('T')[0];

  const record: TechTelemetryRecord = {
    id: `tel_${telemetryStore.length + 1}_${ now.getTime() }`,
    fecha,
    timestamp: now.toISOString(),
    version_arbol: TECH_TREE_VERSION,
    tipo: input.tipo,
    pais: input.pais ? input.pais.toUpperCase() : undefined,
    area: input.area,
    paisComparado: input.paisComparado ? input.paisComparado.toUpperCase() : undefined,
    anioConsultado: input.anioConsultado,
  };

  telemetryStore.push(record);
  return record;
}

/**
 * Computes summary metrics and top 5 country-area pairs from recorded telemetry.
 */
export function getTechTreeTelemetrySummary(): TechTelemetrySummary {
  const pairCounts = new Map<string, { pais: string; area: TechAreaId; count: number }>();
  let uniqueCountryAreaQueries = 0;
  let comparatorOpens = 0;
  let sliderUses = 0;

  for (const ev of telemetryStore) {
    if (ev.tipo === 'consulta_pais_area' && ev.pais && ev.area) {
      uniqueCountryAreaQueries++;
      const key = `${ev.pais}:${ev.area}`;
      const existing = pairCounts.get(key);
      if (existing) {
        existing.count++;
      } else {
        pairCounts.set(key, { pais: ev.pais, area: ev.area, count: 1 });
      }
    } else if (ev.tipo === 'apertura_comparador') {
      comparatorOpens++;
    } else if (ev.tipo === 'uso_deslizador') {
      sliderUses++;
    }
  }

  const topCountryAreaPairs: CountryAreaPairRanking[] = Array.from(pairCounts.entries())
    .map(([pairKey, val]) => ({
      pairKey,
      pais: val.pais,
      area: val.area,
      count: val.count,
    }))
    .sort((a, b) => b.count - a.count || a.pairKey.localeCompare(b.pairKey))
    .slice(0, TECH_TREE_CONFIG.telemetry.topPairsCount);

  return {
    versionArbol: TECH_TREE_VERSION,
    totalEvents: telemetryStore.length,
    uniqueCountryAreaQueries,
    comparatorOpens,
    sliderUses,
    targetUniqueQueries: TECH_TREE_CONFIG.telemetry.uniqueQueriesTarget,
    evaluationWindowDays: TECH_TREE_CONFIG.telemetry.evaluationWindowDays,
    topCountryAreaPairs,
    events: [...telemetryStore],
  };
}

/**
 * Resets the telemetry store (for deterministic testing).
 */
export function resetTechTreeTelemetry(): void {
  telemetryStore = [];
}
