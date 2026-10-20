/**
 * World Mining Data, capítulo 6.4 «Production of Mineral Raw Materials of individual Countries,
 * by Minerals»: una hoja por mineral con columnas País | unidad | años… | fuente (r/e/p).
 */

import { CommodityDefinition, ResourceDataFlag } from '../types';
import { WMD_CATALOG, WMD_UNITS } from './catalog-wmd';
import { CountryResolver } from './country-codes';
import { Observation, SourceResult, parseNumber, setNested, widenYears } from './observations';
import { SheetRows } from './xlsx';

const FLAGS: Record<string, ResourceDataFlag> = { r: 'official', e: 'estimated', p: 'provisional' };

export function parseWmdWorkbook(sheets: Map<string, SheetRows>, resolver: CountryResolver): SourceResult {
  const result: SourceResult = {
    commodities: [],
    observations: [],
    worldTotals: new Map(),
    unmatchedCountries: new Set(),
    years: null,
  };

  for (const [sheetName, rows] of sheets) {
    const def = WMD_CATALOG.get(sheetName);
    if (!def) {
      console.warn(`[WMD] Hoja sin catálogo, se ignora: "${sheetName}"`);
      continue;
    }
    const headerIndex = rows.findIndex((r) => r[0]?.trim() === 'Country');
    if (headerIndex < 0) throw new Error(`[WMD] "${sheetName}": no se encontró la fila de cabecera`);
    const header = rows[headerIndex];
    const yearColumns = header
      .map((cell, i) => ({ i, year: cell && /^\d{4}$/.test(cell.trim()) ? Number(cell) : NaN }))
      .filter((c) => !Number.isNaN(c.year));
    const flagColumn = header.findIndex((cell) => cell?.trim() === 'data source');

    let unit: CommodityDefinition['unit'] | undefined;
    for (const row of rows.slice(headerIndex + 1)) {
      const name = row[0]?.trim();
      if (!name) continue;
      const rowUnit = row[1]?.trim();
      if (rowUnit && !unit) {
        unit = WMD_UNITS[rowUnit];
        if (!unit) throw new Error(`[WMD] "${sheetName}": unidad desconocida "${rowUnit}"`);
      }

      if (name === 'Total') {
        for (const { i, year } of yearColumns) {
          const v = parseNumber(row[i]);
          if (v !== null) setNested(result.worldTotals, def.id, year, v);
        }
        continue;
      }

      const iso2 = resolver.fromName(name);
      if (!iso2) { result.unmatchedCountries.add(name); continue; }
      const flag = flagColumn >= 0 ? FLAGS[row[flagColumn]?.trim() ?? ''] : undefined;
      for (const { i, year } of yearColumns) {
        const v = parseNumber(row[i]);
        // Los ceros se conservan: un cero tras años con producción indica cierre (mina, fundición…).
        if (v === null || v < 0) continue;
        const obs: Observation = { commodityId: def.id, iso2, year, value: v };
        if (flag) obs.flag = flag;
        result.observations.push(obs);
        result.years = widenYears(result.years, year);
      }
    }
    if (!unit) throw new Error(`[WMD] "${sheetName}": sin unidad`);
    result.commodities.push({ ...def, unit });
  }
  return result;
}
