import rawCountries from './countries.json';

export interface GeopoliticalCountry {
  code: string;           // ISO 3166-1 alpha-2 (e.g. 'US')
  iso3: string;           // ISO 3166-1 alpha-3 (e.g. 'USA')
  qid: string;            // Wikidata QID (e.g. 'Q30')
  nameEs: string;         // Nombre en español
  nameEn: string;         // Name in English
  flag: string;           // Emoji flag
  region: 'North America' | 'Europe' | 'East Asia' | 'Southeast Asia' | 'Middle East' | 'Latin America' | 'South Asia' | 'Oceania' | 'Africa' | 'Eurasia';
  blocs: string[];        // Alianzas y tratados
  strategicRole: string;  // Rol estratégico
  sovereignRiskBase: number; // 1-10
}

export const GLOBAL_198_COUNTRIES: GeopoliticalCountry[] = rawCountries as GeopoliticalCountry[];

// ─── Pre-indexed O(1) Maps ─────────────────────────────────────────────────────

const countriesByCode = new Map<string, GeopoliticalCountry>();
const countriesByIso3 = new Map<string, GeopoliticalCountry>();
const countriesByName = new Map<string, GeopoliticalCountry>();

for (const country of GLOBAL_198_COUNTRIES) {
  if (country.code) countriesByCode.set(country.code.toUpperCase(), country);
  if (country.iso3) countriesByIso3.set(country.iso3.toUpperCase(), country);
  if (country.nameEn) countriesByName.set(country.nameEn.toLowerCase(), country);
  if (country.nameEs) countriesByName.set(country.nameEs.toLowerCase(), country);
}

export function findCountryByCode(code: string): GeopoliticalCountry | undefined {
  if (!code) return undefined;
  return countriesByCode.get(code.trim().toUpperCase());
}

export function findCountryByIso3(iso3: string): GeopoliticalCountry | undefined {
  if (!iso3) return undefined;
  return countriesByIso3.get(iso3.trim().toUpperCase());
}

export function findCountryByName(name: string): GeopoliticalCountry | undefined {
  if (!name) return undefined;
  return countriesByName.get(name.trim().toLowerCase());
}
