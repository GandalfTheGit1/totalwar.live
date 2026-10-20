/**
 * lib/services/country-resources/query.ts
 *
 * Consultas puras sobre el dataset de recursos (sirven en servidor y en cliente):
 * recursos de un país, productores de un recurso y búsqueda por nombre.
 */

import { findCountryByCode, findCountryByIso3 } from '@/lib/data/all-198-countries';
import {
  CeasedResourceRecord,
  CommodityStats,
  CountryResourceRecord,
  CountryResourcesDataset,
  ResourceCategory,
} from './types';

export const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  energy: 'Energía fósil y uranio',
  metals: 'Metales',
  minerals: 'Minerales industriales',
  electricity: 'Electricidad renovable y nuclear',
  agriculture: 'Agricultura',
  livestock: 'Ganadería',
  fisheries: 'Pesca y acuicultura',
  forestry: 'Forestal',
};

export const CATEGORY_ORDER: ResourceCategory[] = [
  'energy', 'metals', 'minerals', 'electricity', 'agriculture', 'livestock', 'fisheries', 'forestry',
];

export type ShareTier = 'critical' | 'high' | 'medium' | 'low';

/** Peso mundial: ≥10 % crítico, ≥3 % alto, ≥0,5 % medio, resto bajo. */
export function shareTier(share: number | null): ShareTier {
  if (share === null) return 'low';
  if (share >= 0.1) return 'critical';
  if (share >= 0.03) return 'high';
  if (share >= 0.005) return 'medium';
  return 'low';
}

export interface CountryResourceEntry extends CountryResourceRecord {
  commodity: CommodityStats;
}

export interface ProducerEntry extends CountryResourceRecord {
  iso2: string;
  iso3: string;
  nameEs: string;
  flagEmoji: string;
}

/** Acepta ISO alfa-2 o alfa-3 y devuelve alfa-2. */
export function toIso2(code: string | null | undefined): string | null {
  if (!code) return null;
  const clean = code.trim().toUpperCase();
  if (clean.length === 2) return findCountryByCode(clean)?.code.toUpperCase() ?? clean;
  if (clean.length === 3) return findCountryByIso3(clean)?.code.toUpperCase() ?? null;
  return null;
}

export function commodityIndex(dataset: Pick<CountryResourcesDataset, 'commodities'>): Map<string, CommodityStats> {
  return new Map(dataset.commodities.map((c) => [c.id, c]));
}

export function getCountryResources(dataset: CountryResourcesDataset, countryCode: string): CountryResourceEntry[] {
  const iso2 = toIso2(countryCode);
  if (!iso2) return [];
  const index = commodityIndex(dataset);
  return (dataset.countries[iso2] ?? []).flatMap((record) => {
    const commodity = index.get(record.c);
    return commodity ? [{ ...record, commodity }] : [];
  });
}

export interface CeasedResourceEntry extends CeasedResourceRecord {
  commodity: CommodityStats;
}

/** Recursos cuya producción la fuente declara detenida (cero tras años produciendo). */
export function getCountryCeased(dataset: CountryResourcesDataset, countryCode: string): CeasedResourceEntry[] {
  const iso2 = toIso2(countryCode);
  if (!iso2) return [];
  const index = commodityIndex(dataset);
  return (dataset.ceased?.[iso2] ?? []).flatMap((record) => {
    const commodity = index.get(record.c);
    return commodity ? [{ ...record, commodity }] : [];
  });
}

export function getProducers(dataset: CountryResourcesDataset, commodityId: string): ProducerEntry[] {
  const producers: ProducerEntry[] = [];
  for (const [iso2, records] of Object.entries(dataset.countries)) {
    const record = records.find((r) => r.c === commodityId);
    if (!record) continue;
    const country = findCountryByCode(iso2);
    producers.push({
      ...record,
      iso2,
      iso3: country?.iso3 ?? iso2,
      nameEs: country?.nameEs ?? iso2,
      flagEmoji: country?.flag ?? '',
    });
  }
  return producers.sort((a, b) => a.r - b.r);
}

export function normalizeSearchText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9ñ]+/g, ' ')
    .trim();
}

export interface CommoditySearchResult {
  commodity: CommodityStats;
  /** Texto que coincidió (nombre o sinónimo), para mostrar «vía …» si no es el nombre. */
  matched: string;
  score: number;
}

function matchScore(candidate: string, query: string): number {
  const c = normalizeSearchText(candidate);
  if (!c) return 0;
  if (c === query) return 100;
  if (c.startsWith(query)) return 80;
  if (c.split(' ').some((word) => word.startsWith(query))) return 60;
  if (query.length >= 3 && c.includes(query)) return 40;
  // Todas las palabras de la consulta presentes («aceite oliva» → «Aceite de oliva»)
  const words = query.split(' ').filter((w) => w.length >= 2);
  if (words.length > 1 && words.every((w) => c.split(' ').some((cw) => cw.startsWith(w)))) return 50;
  return 0;
}

/**
 * Busca recursos por nombre español, inglés o sinónimo, sin distinguir acentos ni mayúsculas.
 * Ordena por relevancia y, a igualdad, por número de países productores.
 */
export function searchCommodities(
  commodities: CommodityStats[],
  rawQuery: string,
  limit = 10
): CommoditySearchResult[] {
  const query = normalizeSearchText(rawQuery);
  if (!query) return [];
  const results: CommoditySearchResult[] = [];
  for (const commodity of commodities) {
    const candidates: [string, number][] = [
      [commodity.nameEs, 1],
      [commodity.nameEn, 0.9],
      ...(commodity.aliases ?? []).map((a): [string, number] => [a, 0.85]),
    ];
    let best: { score: number; matched: string } = { score: 0, matched: '' };
    for (const [text, weight] of candidates) {
      const score = matchScore(text, query) * weight;
      if (score > best.score) best = { score, matched: text };
    }
    if (best.score > 0) results.push({ commodity, matched: best.matched, score: best.score });
  }
  return results
    .sort((a, b) => b.score - a.score || b.commodity.producerCount - a.commodity.producerCount)
    .slice(0, limit);
}
