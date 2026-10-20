/**
 * Une los resultados de todas las fuentes en el dataset final:
 * para cada país y recurso se queda el año más reciente, calcula la cuota mundial de ese año
 * y el puesto entre productores.
 */

import {
  CeasedResourceRecord,
  CommodityStats,
  CountryResourceRecord,
  CountryResourcesDataset,
  ResourceSourceInfo,
} from '../types';
import { Observation, SourceResult } from './observations';

function round(value: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

interface LatestPair {
  /** Último año con dato, sea cero o no. */
  any: Observation;
  /** Último año con producción positiva. */
  positive?: Observation;
  /** Años con producción cero declarada. */
  zeroYears: number[];
}

/**
 * Años seguidos en cero que hacen falta para dar una producción por detenida.
 * Ember publica el último año como provisional y a veces trae ceros que luego se corrigen.
 */
const ZERO_YEARS_TO_CEASE: Partial<Record<string, number>> = { ember: 2 };

/** Último dato por (recurso, país), distinguiendo el último positivo. */
function latestObservations(observations: Observation[]): Map<string, Map<string, LatestPair>> {
  const byCommodity = new Map<string, Map<string, LatestPair>>();
  for (const obs of observations) {
    let byCountry = byCommodity.get(obs.commodityId);
    if (!byCountry) { byCountry = new Map(); byCommodity.set(obs.commodityId, byCountry); }
    const pair = byCountry.get(obs.iso2);
    if (!pair) {
      byCountry.set(obs.iso2, { any: obs, positive: obs.value > 0 ? obs : undefined, zeroYears: obs.value === 0 ? [obs.year] : [] });
      continue;
    }
    if (obs.value === 0) pair.zeroYears.push(obs.year);
    if (obs.year > pair.any.year) pair.any = obs;
    if (obs.value > 0 && (!pair.positive || obs.year > pair.positive.year)) pair.positive = obs;
  }
  return byCommodity;
}

/** Total mundial del año: el publicado por la fuente o, si falta, la suma de los países. */
function worldTotalFor(
  commodityId: string,
  year: number,
  published: Map<string, Map<number, number>>,
  observations: Observation[]
): number | null {
  const fromSource = published.get(commodityId)?.get(year);
  if (fromSource && fromSource > 0) return fromSource;
  let sum = 0;
  for (const o of observations) if (o.commodityId === commodityId && o.year === year) sum += o.value;
  return sum > 0 ? sum : null;
}

export function assembleDataset(
  results: SourceResult[],
  sources: ResourceSourceInfo[],
  minYear: number,
  generatedAt: string = new Date().toISOString()
): CountryResourcesDataset {
  const commodities = results.flatMap((r) => r.commodities);
  const observations = results.flatMap((r) => r.observations);
  const worldTotals = new Map<string, Map<number, number>>();
  const generationTotals = new Map<string, Map<number, number>>();
  for (const r of results) {
    for (const [k, v] of r.worldTotals) worldTotals.set(k, v);
    for (const [k, v] of r.generationTotals ?? []) generationTotals.set(k, v);
  }

  // Índice por recurso para no recorrer todas las observaciones en cada suma.
  const obsByCommodity = new Map<string, Observation[]>();
  for (const o of observations) {
    const list = obsByCommodity.get(o.commodityId);
    if (list) list.push(o); else obsByCommodity.set(o.commodityId, [o]);
  }

  const latest = latestObservations(observations);
  const countries: Record<string, CountryResourceRecord[]> = {};
  const ceased: Record<string, CeasedResourceRecord[]> = {};
  const stats: CommodityStats[] = [];

  for (const def of commodities) {
    const byCountry = latest.get(def.id);
    if (!byCountry || byCountry.size === 0) continue;
    const commodityObs = obsByCommodity.get(def.id) ?? [];

    // Producción vigente: el último dato positivo. Si después la fuente declara ceros, se detuvo.
    const zerosNeeded = ZERO_YEARS_TO_CEASE[def.source] ?? 1;
    const current: Observation[] = [];
    for (const [iso2, { any, positive, zeroYears }] of byCountry) {
      if (!positive) continue;
      const zerosAfter = zeroYears.filter((y) => y > positive.year).length;
      if (any.value === 0 && zerosAfter >= zerosNeeded) {
        (ceased[iso2] ??= []).push({ c: def.id, v: round(positive.value, 3), y: positive.year, z: any.year });
      } else {
        current.push(positive);
      }
    }
    if (current.length === 0) continue;

    const records = current.map((obs) => {
      const total = worldTotalFor(def.id, obs.year, worldTotals, commodityObs);
      const share = total ? Math.min(1, obs.value / total) : null;
      const record: CountryResourceRecord = { c: def.id, v: round(obs.value, 3), y: obs.year, s: share === null ? null : round(share, 6), r: 0 };
      if (obs.flag) record.f = obs.flag;
      if (obs.source && obs.source !== def.source) record.src = obs.source;
      const national = generationTotals.get(obs.iso2)?.get(obs.year);
      if (def.category === 'electricity' && national && national > 0) record.m = round(Math.min(1, obs.value / national), 4);
      return { iso2: obs.iso2, record };
    });

    // Puesto mundial: por cuota cuando la hay (compara años distintos con justicia), si no por valor.
    records.sort((a, b) => (b.record.s ?? -1) - (a.record.s ?? -1) || b.record.v - a.record.v);
    records.forEach((entry, i) => {
      entry.record.r = i + 1;
      (countries[entry.iso2] ??= []).push(entry.record);
    });

    const years = [...(worldTotals.get(def.id)?.keys() ?? commodityObs.map((o) => o.year))];
    const latestYear = years.length ? Math.max(...years) : null;
    stats.push({
      ...def,
      producerCount: records.length,
      latestYear,
      worldTotal: latestYear === null ? null : worldTotalFor(def.id, latestYear, worldTotals, commodityObs),
    });
  }

  for (const list of Object.values(countries)) {
    list.sort((a, b) => (b.s ?? -1) - (a.s ?? -1) || a.r - b.r);
  }

  const sortedCountries: Record<string, CountryResourceRecord[]> = {};
  for (const iso2 of Object.keys(countries).sort()) sortedCountries[iso2] = countries[iso2];
  const sortedCeased: Record<string, CeasedResourceRecord[]> = {};
  for (const iso2 of Object.keys(ceased).sort()) sortedCeased[iso2] = ceased[iso2].sort((a, b) => b.z - a.z || a.c.localeCompare(b.c));

  return {
    meta: { generatedAt, sources, minYear },
    commodities: stats.sort((a, b) => a.category.localeCompare(b.category) || a.nameEs.localeCompare(b.nameEs, 'es')),
    countries: sortedCountries,
    ceased: sortedCeased,
  };
}
