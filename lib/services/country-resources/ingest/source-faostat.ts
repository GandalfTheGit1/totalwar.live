/**
 * FAOSTAT, descarga masiva en formato «Normalized» (una fila por país, producto, elemento y año).
 * Se usa para cultivos y ganadería (QCL) y para productos forestales (FO).
 */

import { Readable } from 'stream';
import { CommodityDefinition, ResourceDataFlag, ResourceSourceId, ResourceUnit } from '../types';
import { FaoCatalogEntry } from './catalog-fao';
import { CountryResolver } from './country-codes';
import { forEachCsvRow } from './csv';
import { SourceResult, parseNumber, setNested, widenYears } from './observations';

/** Elemento «Production»: 5510 en toneladas, 5516 en metros cúbicos (forestal). */
const PRODUCTION_ELEMENTS = new Set(['5510', '5516']);
/** Elemento «Stocks»: 5111 cabezas, 5112 miles de cabezas, 5114 colmenas. */
const STOCK_ELEMENTS = new Set(['5111', '5112', '5114']);
const WORLD_M49 = '001';

const FLAGS: Record<string, ResourceDataFlag> = {
  A: 'official',
  X: 'official',
  E: 'estimated',
  I: 'estimated',
  P: 'provisional',
};

const UNITS: Record<string, { unit: ResourceUnit; factor: number }> = {
  t: { unit: 't', factor: 1 },
  m3: { unit: 'm3', factor: 1 },
  An: { unit: 'head', factor: 1 },
  '1000 An': { unit: 'head', factor: 1000 },
  No: { unit: 'hive', factor: 1 },
};

export interface FaostatOptions {
  source: Extract<ResourceSourceId, 'faostat-qcl' | 'faostat-fo'>;
  catalog: Map<number, FaoCatalogEntry>;
  /** Existencias de animales (opcional, solo dominio QCL). */
  stockCatalog?: Map<number, FaoCatalogEntry>;
  minYear: number;
}

export async function parseFaostatCsv(
  stream: Readable,
  resolver: CountryResolver,
  { source, catalog, stockCatalog, minYear }: FaostatOptions
): Promise<SourceResult> {
  const result: SourceResult = {
    commodities: [],
    observations: [],
    worldTotals: new Map(),
    unmatchedCountries: new Set(),
    years: null,
  };
  const defs = new Map<string, CommodityDefinition>();
  const idPrefix = source === 'faostat-qcl' ? 'fao' : 'fo';

  await forEachCsvRow(stream, (row) => {
    const element = row['Element Code'];
    const isStock = STOCK_ELEMENTS.has(element);
    if (!isStock && !PRODUCTION_ELEMENTS.has(element)) return;
    const code = Number(row['Item Code']);
    const entry = isStock ? stockCatalog?.get(code) : catalog.get(code);
    if (!entry) return;
    const year = Number(row['Year']);
    if (!(year >= minYear)) return;
    if (row['Flag'] === 'M') return; // «Missing value; data cannot exist»
    const rawValue = parseNumber(row['Value']);
    // Los ceros se conservan: un cero tras años con producción indica que se detuvo.
    if (rawValue === null || rawValue < 0) return;

    const unitInfo = UNITS[row['Unit']];
    if (!unitInfo) return;
    const { unit } = unitInfo;
    const value = rawValue * unitInfo.factor;
    const id = isStock ? `${idPrefix}-stock:${code}` : `${idPrefix}:${code}`;
    let def = defs.get(id);
    if (!def) {
      def = {
        id,
        nameEs: entry.nameEs,
        nameEn: row['Item'],
        category: entry.category,
        unit,
        source,
        aliases: entry.aliases,
        note: isStock ? 'Existencias (animales vivos), no producción anual' : undefined,
      };
      if (!def.note) delete def.note;
      defs.set(id, def);
    } else if (def.unit !== unit) {
      return; // mismo producto en otra unidad (p. ej. forestal en t y m3): nos quedamos con la primera
    }

    const m49 = row['Area Code (M49)'].replace(/^'/, '');
    if (m49 === WORLD_M49) {
      setNested(result.worldTotals, id, year, value);
      return;
    }
    const iso2 = resolver.fromM49(m49);
    if (!iso2) {
      // Agregados regionales (M49 ≥ 900 o grupos) y entidades históricas no son países.
      result.unmatchedCountries.add(`${m49} ${row['Area']}`);
      return;
    }
    const flag = FLAGS[row['Flag']];
    result.observations.push(flag ? { commodityId: id, iso2, year, value, flag } : { commodityId: id, iso2, year, value });
    result.years = widenYears(result.years, year);
  });

  result.commodities = [...defs.values()];
  return result;
}
