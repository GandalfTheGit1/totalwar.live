/**
 * lib/data/geopolitical-countries/types.ts
 *
 * Types for GeopoliticalCountry entity and supported regions.
 */

export type GeopoliticalRegion =
  | 'North America'
  | 'Europe'
  | 'East Asia'
  | 'Southeast Asia'
  | 'Middle East'
  | 'Latin America'
  | 'South Asia'
  | 'Oceania'
  | 'Africa'
  | 'Eurasia';

export interface GeopoliticalCountry {
  code: string;           // ISO 3166-1 alpha-2 (e.g. 'US')
  iso3: string;           // ISO 3166-1 alpha-3 (e.g. 'USA')
  qid: string;            // Wikidata QID (e.g. 'Q30')
  nameEs: string;         // Nombre en español
  nameEn: string;         // Name in English
  flag: string;           // Emoji flag
  region: GeopoliticalRegion;
  blocs: string[];        // Alianzas y tratados (NATO, G7, BRICS, EU, ASEAN, FiveEyes, etc.)
  strategicRole: string;  // Rol estratégico en la cadena de valor global
  sovereignRiskBase: number; // 1-10 (1 = mínimo riesgo / máxima estabilidad, 10 = riesgo extremo)
}
