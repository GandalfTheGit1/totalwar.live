/**
 * Ember, «Yearly electricity data» en formato largo: generación eléctrica por país y fuente (TWh).
 * Solo se toman las fuentes que son un recurso del propio territorio (renovables y nuclear);
 * el gas y el carbón ya están en World Mining Data como producción de combustible.
 */

import { Readable } from 'stream';
import { CommodityDefinition } from '../types';
import { CountryResolver } from './country-codes';
import { forEachCsvRow } from './csv';
import { SourceResult, parseNumber, setNested, widenYears } from './observations';

const EMBER_FUELS: Record<string, Omit<CommodityDefinition, 'nameEn' | 'unit' | 'source' | 'category'>> = {
  Wind: { id: 'ember:wind', nameEs: 'Energía eólica', aliases: ['eólica', 'viento', 'wind power'] },
  Solar: { id: 'ember:solar', nameEs: 'Energía solar', aliases: ['solar', 'fotovoltaica', 'sol'] },
  Hydro: { id: 'ember:hydro', nameEs: 'Energía hidroeléctrica', aliases: ['hidráulica', 'agua', 'hydropower', 'represas'] },
  Bioenergy: { id: 'ember:bioenergy', nameEs: 'Bioenergía', aliases: ['biomasa', 'biogás', 'biomass'] },
  Nuclear: { id: 'ember:nuclear', nameEs: 'Energía nuclear', aliases: ['nuclear', 'atómica'], note: 'Generación; el uranio puede ser importado' },
  'Other Renewables': { id: 'ember:other-renewables', nameEs: 'Geotermia y otras renovables', aliases: ['geotermia', 'geotérmica', 'mareomotriz'] },
};

export function parseEmberCsv(stream: Readable, resolver: CountryResolver, minYear: number): Promise<SourceResult> {
  const result: SourceResult = {
    commodities: Object.entries(EMBER_FUELS).map(([variable, def]) => ({
      ...def,
      nameEn: variable === 'Other Renewables' ? 'Geothermal and other renewables' : `${variable} power`,
      category: 'electricity' as const,
      unit: 'TWh' as const,
      source: 'ember' as const,
    })),
    observations: [],
    worldTotals: new Map(),
    generationTotals: new Map(),
    unmatchedCountries: new Set(),
    years: null,
  };

  return forEachCsvRow(stream, (row) => {
    if (row['Category'] !== 'Electricity generation' || row['Unit'] !== 'TWh') return;
    const year = Number(row['Year']);
    if (!(year >= minYear)) return;
    const value = parseNumber(row['Value']);
    if (value === null) return;

    const isWorld = row['Area'] === 'World';
    if (!isWorld && row['Area type'] !== 'Country or economy') return;
    const isTotal = row['Subcategory'] === 'Total' && row['Variable'] === 'Total Generation';
    const fuel = row['Subcategory'] === 'Fuel' ? EMBER_FUELS[row['Variable']] : undefined;
    if (!isTotal && !fuel) return;

    if (isWorld) {
      if (fuel) setNested(result.worldTotals, fuel.id, year, value);
      return;
    }
    const iso2 = resolver.fromIso3(row['ISO 3 code']);
    if (!iso2) { result.unmatchedCountries.add(`${row['ISO 3 code']} ${row['Area']}`); return; }
    if (isTotal) {
      setNested(result.generationTotals!, iso2, year, value);
    } else if (fuel && value >= 0) {
      result.observations.push({ commodityId: fuel.id, iso2, year, value });
      result.years = widenYears(result.years, year);
    }
  }).then(() => result);
}
