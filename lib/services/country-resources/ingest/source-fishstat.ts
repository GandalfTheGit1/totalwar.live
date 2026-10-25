/**
 * FAO FishStat, «Global production by production source»: capturas y acuicultura por país,
 * especie, zona de pesca y año (toneladas de peso vivo).
 *
 * Se agrega por país y año en:
 *   - totales: pesca de captura y acuicultura (animales acuáticos) y algas;
 *   - grupos ISSCAAP de especies (atunes, bacalaos y merluzas, mejillones…), sumando captura y cultivo.
 * Los nombres en español vienen de la propia tabla de especies de la FAO.
 * Se excluyen los mamíferos acuáticos: se registran en número de animales, no en toneladas.
 */

import { Readable } from 'stream';
import { CommodityDefinition, ResourceDataFlag } from '../types';
import { CountryResolver } from './country-codes';
import { forEachCsvRow, parseCsvLine } from './csv';
import { SourceResult, parseNumber, widenYears } from './observations';

/** Estados de dato sin valor utilizable (ausente, no recogido, suprimido). */
const MISSING_STATUS = new Set(['M', 'L', 'O', 'Q']);
const ESTIMATED_STATUS = new Set(['E', 'I', 'U', 'V']);

const TOTALS: Record<'capture' | 'aquaculture' | 'seaweed', Omit<CommodityDefinition, 'unit' | 'source' | 'category'>> = {
  capture: {
    id: 'fish:capture',
    nameEs: 'Pesca de captura',
    nameEn: 'Capture fisheries',
    aliases: ['pesca', 'pescado', 'capturas', 'fishing'],
    note: 'Peces, crustáceos y moluscos; suma de todos los grupos',
  },
  aquaculture: {
    id: 'fish:aquaculture',
    nameEs: 'Acuicultura',
    nameEn: 'Aquaculture',
    aliases: ['piscicultura', 'cultivo de peces', 'pescado', 'aquaculture'],
    note: 'Peces, crustáceos y moluscos de cultivo; suma de todos los grupos',
  },
  seaweed: {
    id: 'fish:seaweed',
    nameEs: 'Algas',
    nameEn: 'Seaweeds and aquatic plants',
    aliases: ['algas marinas', 'seaweed', 'kelp'],
    note: 'Captura y cultivo de plantas acuáticas',
  },
};

const GROUP_ALIASES: Record<string, string[]> = {
  PISCES: ['pescado', 'peces'],
  CRUSTACEA: ['marisco', 'crustáceos'],
  MOLLUSCA: ['marisco', 'moluscos'],
  'PLANTAE AQUATICAE': ['algas'],
};

interface SpeciesInfo { major: string; groupEn: string; groupEs: string }

/** Tabla CL_FI_SPECIES_GROUPS.csv: código de 3 letras → grupo mayor y grupo ISSCAAP. */
export function parseFishSpecies(csv: string): Map<string, SpeciesInfo> {
  const [headerLine, ...lines] = csv.replace(/^﻿/, '').split(/\r?\n/);
  const header = parseCsvLine(headerLine);
  const col = (name: string) => header.indexOf(name);
  const [iCode, iMajor, iEn, iEs] = ['3A_Code', 'Major_Group', 'ISSCAAP_Group_En', 'ISSCAAP_Group_Es'].map(col);
  if ([iCode, iMajor, iEn, iEs].some((i) => i < 0)) throw new Error('[FishStat] Tabla de especies con cabeceras inesperadas');
  const map = new Map<string, SpeciesInfo>();
  for (const line of lines) {
    if (!line) continue;
    const f = parseCsvLine(line);
    map.set(f[iCode], { major: f[iMajor], groupEn: f[iEn], groupEs: f[iEs] });
  }
  return map;
}

/** Tabla CL_FI_COUNTRY_GROUPS.csv: código numérico de la ONU → ISO alfa-2. */
export function parseFishCountries(csv: string): Map<string, string> {
  const [headerLine, ...lines] = csv.replace(/^﻿/, '').split(/\r?\n/);
  const header = parseCsvLine(headerLine);
  const iUn = header.indexOf('UN_Code');
  const iIso2 = header.indexOf('ISO2_Code');
  const map = new Map<string, string>();
  for (const line of lines) {
    if (!line) continue;
    const f = parseCsvLine(line);
    if (f[iIso2]) map.set(f[iUn].padStart(3, '0'), f[iIso2].toUpperCase());
  }
  return map;
}

function slug(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

interface Accumulator { total: number; estimated: number; provisional: boolean }

export async function parseFishstatCsv(
  stream: Readable,
  species: Map<string, SpeciesInfo>,
  countryCodes: Map<string, string>,
  resolver: CountryResolver,
  minYear: number
): Promise<SourceResult> {
  const result: SourceResult = {
    commodities: [],
    observations: [],
    worldTotals: new Map(),
    unmatchedCountries: new Set(),
    years: null,
  };
  const defs = new Map<string, CommodityDefinition>();
  // commodityId → iso2 → año → acumulado
  const sums = new Map<string, Map<string, Map<number, Accumulator>>>();

  const define = (base: Omit<CommodityDefinition, 'unit' | 'source' | 'category'>) => {
    if (!defs.has(base.id)) defs.set(base.id, { ...base, unit: 't', source: 'fishstat', category: 'fisheries' });
    return base.id;
  };
  const add = (id: string, iso2: string, year: number, value: number, status: string) => {
    let byCountry = sums.get(id);
    if (!byCountry) { byCountry = new Map(); sums.set(id, byCountry); }
    let byYear = byCountry.get(iso2);
    if (!byYear) { byYear = new Map(); byCountry.set(iso2, byYear); }
    const acc = byYear.get(year) ?? { total: 0, estimated: 0, provisional: false };
    acc.total += value;
    if (ESTIMATED_STATUS.has(status)) acc.estimated += value;
    if (status === 'P') acc.provisional = true;
    byYear.set(year, acc);
  };

  await forEachCsvRow(stream, (row) => {
    if (row['MEASURE'] !== 'Q_tlw') return;
    const year = Number(row['PERIOD']);
    if (!(year >= minYear)) return;
    const status = row['STATUS']?.trim() ?? '';
    if (MISSING_STATUS.has(status)) return;
    // «N»: no significativo (<0,5 t), cuenta como cero.
    const value = status === 'N' ? 0 : parseNumber(row['VALUE']);
    if (value === null || value < 0) return;

    const info = species.get(row['SPECIES.ALPHA_3_CODE']);
    if (!info || !info.groupEn || info.major === 'MAMMALIA') return;

    const un = row['COUNTRY.UN_CODE'].padStart(3, '0');
    const fromTable = countryCodes.get(un);
    const iso2 = fromTable && resolver.known.has(fromTable) ? fromTable : resolver.fromM49(un);
    if (!iso2) { result.unmatchedCountries.add(un); return; }

    const groupId = define({
      id: `fish:${slug(info.groupEn)}`,
      nameEs: info.groupEs || info.groupEn,
      nameEn: info.groupEn,
      aliases: GROUP_ALIASES[info.major],
      note: 'Captura y acuicultura',
    });
    add(groupId, iso2, year, value, status);

    const isPlant = info.major === 'PLANTAE AQUATICAE';
    const totalKey = isPlant ? 'seaweed' : row['PRODUCTION_SOURCE_DET.CODE'] === 'CAPTURE' ? 'capture' : 'aquaculture';
    add(define(TOTALS[totalKey]), iso2, year, value, status);
    result.years = widenYears(result.years, year);
  });

  for (const [commodityId, byCountry] of sums) {
    for (const [iso2, byYear] of byCountry) {
      for (const [year, acc] of byYear) {
        const flag: ResourceDataFlag | undefined = acc.provisional
          ? 'provisional'
          : acc.total > 0 && acc.estimated / acc.total > 0.5 ? 'estimated' : 'official';
        result.observations.push({ commodityId, iso2, year, value: acc.total, flag });
        // FishStat no publica un total mundial: assembleDataset suma los países.
      }
    }
  }
  result.commodities = [...defs.values()];
  return result;
}
