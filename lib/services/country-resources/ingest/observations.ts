/**
 * Formato intermedio común a todas las fuentes antes de calcular cuotas y puestos.
 */

import { CommodityDefinition, ResourceDataFlag, ResourceSourceId } from '../types';

export interface Observation {
  commodityId: string;
  iso2: string;
  year: number;
  /** 0 significa producción nula declarada ese año. */
  value: number;
  flag?: ResourceDataFlag;
  /** Solo si el dato viene de una fuente distinta de la del recurso. */
  source?: ResourceSourceId;
}

export interface SourceResult {
  commodities: CommodityDefinition[];
  observations: Observation[];
  /** commodityId → año → producción mundial publicada por la fuente. */
  worldTotals: Map<string, Map<number, number>>;
  /** Solo electricidad: iso2 → año → generación eléctrica total del país (TWh). */
  generationTotals?: Map<string, Map<number, number>>;
  /** Nombres o códigos de país de la fuente que no se pudieron resolver (para revisar alias). */
  unmatchedCountries: Set<string>;
  /** Primer y último año leídos. */
  years: [number, number] | null;
}

export function setNested(map: Map<string, Map<number, number>>, key: string, year: number, value: number): void {
  let inner = map.get(key);
  if (!inner) { inner = new Map(); map.set(key, inner); }
  inner.set(year, value);
}

export function widenYears(range: [number, number] | null, year: number): [number, number] {
  return range ? [Math.min(range[0], year), Math.max(range[1], year)] : [year, year];
}

/** Convierte texto numérico de las fuentes ("1234", "1234.000000", "") en número o null. */
export function parseNumber(text: string | null | undefined): number | null {
  if (text === null || text === undefined) return null;
  const clean = text.trim();
  if (!clean) return null;
  const n = Number(clean);
  return Number.isFinite(n) ? n : null;
}
