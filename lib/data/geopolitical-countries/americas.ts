/**
 * lib/data/geopolitical-countries/americas.ts
 *
 * Geopolitical country records for North and Latin America.
 */

import { GeopoliticalCountry } from './types';

export const NORTH_AMERICA_COUNTRIES: GeopoliticalCountry[] = [
  {
    code: 'US',
    iso3: 'USA',
    qid: 'Q30',
    nameEs: 'Estados Unidos',
    nameEn: 'United States',
    flag: '🇺🇸',
    region: 'North America',
    blocs: ['NATO', 'G7', 'FiveEyes', 'USMCA', 'OECD'],
    strategicRole: 'Capital global, diseño de semiconductores (Fabless), software, consumo y defensa',
    sovereignRiskBase: 1.5,
  },
  {
    code: 'CA',
    iso3: 'CAN',
    qid: 'Q16',
    nameEs: 'Canadá',
    nameEn: 'Canada',
    flag: '🇨🇦',
    region: 'North America',
    blocs: ['NATO', 'G7', 'FiveEyes', 'USMCA', 'OECD'],
    strategicRole: 'Energía, minerales críticos, recursos naturales y tecnología',
    sovereignRiskBase: 1.8,
  },
  {
    code: 'MX',
    iso3: 'MEX',
    qid: 'Q96',
    nameEs: 'México',
    nameEn: 'Mexico',
    flag: '🇲🇽',
    region: 'North America',
    blocs: ['USMCA', 'OECD', 'CPTPP'],
    strategicRole: 'Hub clave de Nearshoring, manufactura automotriz y ensamblaje electrónico',
    sovereignRiskBase: 4.2,
  },
];

export const LATIN_AMERICA_COUNTRIES: GeopoliticalCountry[] = [
  {
    code: 'BR',
    iso3: 'BRA',
    qid: 'Q155',
    nameEs: 'Brasil',
    nameEn: 'Brazil',
    flag: '🇧🇷',
    region: 'Latin America',
    blocs: ['BRICS', 'Mercosur', 'G20'],
    strategicRole: 'Potencia agroexportadora (soja, carne), mineral de hierro (Vale), petróleo offshore y aviones (Embraer)',
    sovereignRiskBase: 4.3,
  },
  {
    code: 'CL',
    iso3: 'CHL',
    qid: 'Q298',
    nameEs: 'Chile',
    nameEn: 'Chile',
    flag: '🇨🇱',
    region: 'Latin America',
    blocs: ['OECD', 'CPTPP'],
    strategicRole: 'Mayor productor mundial de cobre y reservas de litio del Triángulo del Litio',
    sovereignRiskBase: 3.1,
  },
  {
    code: 'AR',
    iso3: 'ARG',
    qid: 'Q414',
    nameEs: 'Argentina',
    nameEn: 'Argentina',
    flag: '🇦🇷',
    region: 'Latin America',
    blocs: ['Mercosur', 'G20'],
    strategicRole: 'Reservas de litio, gas y petróleo no convencional (Vaca Muerta) y granos',
    sovereignRiskBase: 6.0,
  },
];

export const AMERICAS_COUNTRIES: GeopoliticalCountry[] = [
  ...NORTH_AMERICA_COUNTRIES,
  ...LATIN_AMERICA_COUNTRIES,
];
