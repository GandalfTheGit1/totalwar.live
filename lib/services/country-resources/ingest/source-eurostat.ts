/**
 * Eurostat nrg_bal_peh (producción bruta de electricidad por tipo de fuente), formato JSON-stat.
 * Complementa a Ember solo para los países que Ember no cubre (en la práctica, Albania).
 * Los datos van a los mismos recursos que Ember (ember:hydro, ember:solar…) marcados con su fuente.
 */

import { ResourceDataFlag } from '../types';
import { CountryResolver } from './country-codes';
import { SourceResult, setNested, widenYears } from './observations';

/** Productos (SIEC) pedidos a la API y recurso al que se asignan; TOTAL da la generación total. */
export const EUROSTAT_SIEC: Record<string, string> = {
  RA100: 'ember:hydro',
  RA300: 'ember:wind',
  RA410: 'ember:solar', // termosolar
  RA420: 'ember:solar', // fotovoltaica
  RA200: 'ember:other-renewables', // geotermia
  BIOE: 'ember:bioenergy',
  N900H: 'ember:nuclear',
  TOTAL: 'TOTAL',
};

export function eurostatUrl(minYear: number): string {
  const siec = Object.keys(EUROSTAT_SIEC).map((s) => `siec=${s}`).join('&');
  return `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_bal_peh?format=JSON&lang=en&nrg_bal=GEP&unit=GWH&${siec}&sinceTimePeriod=${minYear}`;
}

/** Eurostat usa EL para Grecia y UK para Reino Unido. */
const GEO_FIX: Record<string, string> = { EL: 'GR', UK: 'GB' };

const FLAGS: Record<string, ResourceDataFlag> = { e: 'estimated', p: 'provisional' };

interface JsonStatCategory { index: Record<string, number> | string[] }
interface JsonStat {
  id: string[];
  size: number[];
  dimension: Record<string, { category: JsonStatCategory }>;
  value: Record<string, number> | number[];
  status?: Record<string, string>;
}

function categoryCodes(cat: JsonStatCategory): string[] {
  if (Array.isArray(cat.index)) return cat.index;
  const codes: string[] = [];
  for (const [code, pos] of Object.entries(cat.index)) codes[pos] = code;
  return codes;
}

/**
 * @param skipCountries países que ya cubre Ember: sus datos de Eurostat se ignoran para no duplicar.
 */
export function parseEurostatElectricity(
  json: JsonStat,
  resolver: CountryResolver,
  skipCountries: Set<string>
): SourceResult {
  const result: SourceResult = {
    commodities: [], // reutiliza las definiciones de Ember
    observations: [],
    worldTotals: new Map(),
    generationTotals: new Map(),
    unmatchedCountries: new Set(),
    years: null,
  };

  const dims = json.id;
  const codes = dims.map((d) => categoryCodes(json.dimension[d].category));
  const strides = dims.map((_, i) => json.size.slice(i + 1).reduce((a, b) => a * b, 1));
  const at = (name: string) => dims.indexOf(name);
  const [iSiec, iGeo, iTime] = [at('siec'), at('geo'), at('time')];
  if ([iSiec, iGeo, iTime].some((i) => i < 0)) throw new Error('[Eurostat] JSON-stat sin dimensiones siec/geo/time');

  // Suma por (recurso, país, año): fotovoltaica y termosolar van al mismo recurso.
  const sums = new Map<string, { value: number; flag?: ResourceDataFlag }>();
  const entries = Array.isArray(json.value)
    ? json.value.map((v, i) => [String(i), v] as const)
    : Object.entries(json.value);

  for (const [key, value] of entries) {
    if (typeof value !== 'number') continue;
    const flat = Number(key);
    const coord = (i: number) => codes[i][Math.floor(flat / strides[i]) % json.size[i]];
    const siec = coord(iSiec);
    const target = EUROSTAT_SIEC[siec];
    if (!target) continue;
    const geo = coord(iGeo);
    const iso2 = GEO_FIX[geo] ?? geo;
    if (!resolver.known.has(iso2)) {
      if (!geo.startsWith('EU') && !geo.startsWith('EA')) result.unmatchedCountries.add(geo);
      continue;
    }
    if (skipCountries.has(iso2)) continue;
    const year = Number(coord(iTime));
    const twh = value / 1000;
    if (target === 'TOTAL') {
      setNested(result.generationTotals!, iso2, year, twh);
      continue;
    }
    const sumKey = `${target}|${iso2}|${year}`;
    const prev = sums.get(sumKey);
    const flag = FLAGS[json.status?.[key] ?? ''];
    sums.set(sumKey, { value: (prev?.value ?? 0) + twh, flag: prev?.flag ?? flag });
  }

  for (const [sumKey, { value, flag }] of sums) {
    const [commodityId, iso2, yearText] = sumKey.split('|');
    const year = Number(yearText);
    result.observations.push(flag ? { commodityId, iso2, year, value, flag, source: 'eurostat' } : { commodityId, iso2, year, value, source: 'eurostat' });
    result.years = widenYears(result.years, year);
  }
  return result;
}
