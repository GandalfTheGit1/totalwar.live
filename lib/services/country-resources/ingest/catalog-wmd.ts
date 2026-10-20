/**
 * Catálogo de World Mining Data (capítulo 6.4): una hoja del Excel por mineral.
 * La clave es el nombre de la hoja tal cual (sin espacios al final).
 */

import { CommodityDefinition, ResourceCategory } from '../types';

type WmdEntry = [sheet: string, slug: string, nameEs: string, category: ResourceCategory, aliases?: string[], note?: string];

const WMD_ENTRIES: WmdEntry[] = [
  // Hierro y metales de aleación
  ['Iron (Fe)', 'iron', 'Hierro', 'metals', ['mineral de hierro', 'iron ore', 'fe'], 'Contenido de Fe'],
  ['Chromium (Cr2O3)', 'chromium', 'Cromo', 'metals', ['cromita', 'chromite'], 'Contenido de Cr2O3'],
  ['Cobalt', 'cobalt', 'Cobalto', 'metals', ['co']],
  ['Manganese', 'manganese', 'Manganeso', 'metals', ['mn']],
  ['Molybdenum', 'molybdenum', 'Molibdeno', 'metals', ['mo']],
  ['Nickel', 'nickel', 'Níquel', 'metals', ['ni']],
  ['Niobium (Nb2O5)', 'niobium', 'Niobio', 'metals', ['columbio', 'nb'], 'Contenido de Nb2O5'],
  ['Tantalum (Ta2O5)', 'tantalum', 'Tantalio', 'metals', ['coltan', 'ta'], 'Contenido de Ta2O5'],
  ['Titanium (TiO2)', 'titanium', 'Titanio', 'metals', ['ilmenita', 'rutilo', 'ti'], 'Contenido de TiO2'],
  ['Tungsten (W)', 'tungsten', 'Wolframio', 'metals', ['tungsteno', 'volframio', 'w']],
  ['Vanadium (V)', 'vanadium', 'Vanadio', 'metals', ['v']],
  // Metales no férreos
  ['Aluminium', 'aluminium', 'Aluminio', 'metals', ['aluminum', 'al'], 'Aluminio primario (fundición)'],
  ['Antimony', 'antimony', 'Antimonio', 'metals', ['sb']],
  ['Arsenic', 'arsenic', 'Arsénico', 'metals', ['as']],
  ['Bauxite', 'bauxite', 'Bauxita', 'metals', ['mineral de aluminio']],
  ['Beryllium (conc.)', 'beryllium', 'Berilio', 'metals', ['berilo', 'be'], 'Concentrado'],
  ['Bismuth', 'bismuth', 'Bismuto', 'metals', ['bi']],
  ['Cadmium', 'cadmium', 'Cadmio', 'metals', ['cd']],
  ['Copper', 'copper', 'Cobre', 'metals', ['cu']],
  ['Gallium', 'gallium', 'Galio', 'metals', ['ga']],
  ['Germanium', 'germanium', 'Germanio', 'metals', ['ge']],
  ['Indium', 'indium', 'Indio', 'metals', ['in']],
  ['Lead', 'lead', 'Plomo', 'metals', ['pb']],
  ['Lithium (Li2O)', 'lithium', 'Litio', 'metals', ['li', 'espodumena'], 'Contenido de Li2O'],
  ['Mercury', 'mercury', 'Mercurio', 'metals', ['azogue', 'hg']],
  ['Rare Earths (REO)', 'rare-earths', 'Tierras raras', 'metals', ['ree', 'reo', 'lantánidos', 'neodimio'], 'Óxidos de tierras raras (REO)'],
  ['Rhenium', 'rhenium', 'Renio', 'metals', ['re']],
  ['Selenium', 'selenium', 'Selenio', 'metals', ['se']],
  ['Tellurium', 'tellurium', 'Telurio', 'metals', ['te']],
  ['Tin', 'tin', 'Estaño', 'metals', ['sn', 'casiterita']],
  ['Zinc', 'zinc', 'Zinc', 'metals', ['cinc', 'zn']],
  // Metales preciosos
  ['Gold', 'gold', 'Oro', 'metals', ['au']],
  ['Palladium', 'palladium', 'Paladio', 'metals', ['pd', 'platinoides']],
  ['Platinum', 'platinum', 'Platino', 'metals', ['pt', 'platinoides']],
  ['Rhodium', 'rhodium', 'Rodio', 'metals', ['rh', 'platinoides']],
  ['Silver', 'silver', 'Plata', 'metals', ['ag']],
  // Minerales industriales
  ['Asbestos', 'asbestos', 'Amianto', 'minerals', ['asbesto']],
  ['Baryte', 'baryte', 'Baritina', 'minerals', ['barita', 'barite']],
  ['Bentonite', 'bentonite', 'Bentonita', 'minerals', ['arcilla']],
  ['Boron Minerals', 'boron', 'Minerales de boro', 'minerals', ['boratos', 'bórax', 'borax']],
  ['Diamonds (Gem)', 'diamonds-gem', 'Diamantes de gema', 'minerals', ['diamante', 'diamonds']],
  ['Diamonds (Ind)', 'diamonds-industrial', 'Diamantes industriales', 'minerals', ['diamante', 'diamonds']],
  ['Diatomite', 'diatomite', 'Diatomita', 'minerals', ['tierra de diatomeas']],
  ['Feldspar', 'feldspar', 'Feldespato', 'minerals'],
  ['Fluorspar', 'fluorspar', 'Fluorita', 'minerals', ['espato flúor', 'fluorite']],
  ['Graphite', 'graphite', 'Grafito', 'minerals'],
  ['Gypsum and Anhydrite', 'gypsum', 'Yeso y anhidrita', 'minerals', ['yeso', 'anhidrita', 'gypsum']],
  ['Kaolin (China-Clay)', 'kaolin', 'Caolín', 'minerals', ['arcilla', 'china clay']],
  ['Magnesite', 'magnesite', 'Magnesita', 'minerals', ['magnesio']],
  ['Perlite', 'perlite', 'Perlita', 'minerals'],
  ['Phosphate Rock (P2O5)', 'phosphate', 'Roca fosfórica', 'minerals', ['fosfato', 'fosfatos', 'phosphate'], 'Contenido de P2O5'],
  ['Potash (K2O)', 'potash', 'Potasa', 'minerals', ['potasio', 'silvinita', 'potassium'], 'Contenido de K2O'],
  ['Salt (rock, brines, marine)', 'salt', 'Sal', 'minerals', ['sal gema', 'sal marina', 'salmuera']],
  ['Sulfur (elementar & industrial)', 'sulfur', 'Azufre', 'minerals', ['sulphur', 'azufre elemental']],
  ['Talc, Steatite & Pyrophyllite', 'talc', 'Talco', 'minerals', ['esteatita', 'pirofilita']],
  ['Vermiculite', 'vermiculite', 'Vermiculita', 'minerals'],
  ['Zircon', 'zircon', 'Circón', 'minerals', ['zirconio', 'circonio']],
  // Combustibles minerales y uranio
  ['Steam Coal', 'steam-coal', 'Carbón térmico', 'energy', ['carbón', 'hulla', 'coal']],
  ['Coking Coal', 'coking-coal', 'Carbón de coque', 'energy', ['carbón metalúrgico', 'carbón', 'coal']],
  ['Lignite', 'lignite', 'Lignito', 'energy', ['carbón', 'coal']],
  ['Natural Gas', 'natural-gas', 'Gas natural', 'energy', ['gas', 'gnl', 'lng']],
  ['Petroleum', 'petroleum', 'Petróleo', 'energy', ['crudo', 'oil', 'crude oil']],
  ['Oil Sands (part of Petroleum)', 'oil-sands', 'Arenas bituminosas', 'energy', ['petróleo', 'oil sands'], 'Ya incluidas en Petróleo'],
  ['Oil Shales', 'oil-shales', 'Esquisto bituminoso', 'energy', ['pizarra bituminosa', 'shale']],
  ['Uranium (U3O8)', 'uranium', 'Uranio', 'energy', ['u', 'u3o8'], 'Contenido de U3O8'],
];

/** Unidades del Excel → unidad canónica. */
export const WMD_UNITS: Record<string, CommodityDefinition['unit']> = {
  'metr. t': 't',
  kg: 'kg',
  ct: 'ct',
  'Mio m3': 'Mm3',
};

export const WMD_CATALOG: Map<string, Omit<CommodityDefinition, 'unit'>> = new Map(
  WMD_ENTRIES.map(([sheet, slug, nameEs, category, aliases, note]) => [
    sheet,
    {
      id: `wmd:${slug}`,
      nameEs,
      nameEn: sheet.replace(/\s*\(.*\)\s*$/, ''),
      category,
      source: 'wmd' as const,
      aliases,
      note,
    },
  ])
);
