/**
 * lib/services/sovereign-power/country-resolver.ts
 *
 * Resolves ISO2, ISO3, Wikidata QID, or common localized country names
 * to canonical geopolitical country definitions.
 */

import { 
  GEOPOLITICAL_45_COUNTRIES, 
  GeopoliticalCountry,
  COUNTRY_BY_CODE,
  COUNTRY_BY_ISO3,
  COUNTRY_BY_QID
} from '../../data/geopolitical-countries';

/**
 * Resolves country code from ISO2, ISO3, QID or common English/Spanish names.
 */
export function resolveCountryCode(identifier?: string | null): string | null {
  if (!identifier || typeof identifier !== 'string') return null;
  const trimmed = identifier.trim();
  if (!trimmed) return null;
  const clean = trimmed.toUpperCase();
  if (COUNTRY_BY_CODE.has(clean)) return clean;
  if (COUNTRY_BY_ISO3.has(clean)) return COUNTRY_BY_ISO3.get(clean)!.code;
  if (COUNTRY_BY_QID.has(trimmed)) return COUNTRY_BY_QID.get(trimmed)!.code;
  const lower = trimmed.toLowerCase();
  const found = GEOPOLITICAL_45_COUNTRIES.find(
    c => c.nameEs.toLowerCase() === lower || c.nameEn.toLowerCase() === lower
  );
  return found ? found.code : null;
}

/**
 * Resolves full GeopoliticalCountry metadata or synthesizes safe fallback.
 */
export function resolveCountryBaseData(identifier?: string | null): GeopoliticalCountry {
  const safeIdentifier = (identifier && typeof identifier === 'string') ? identifier.trim() : '';
  const resolved = resolveCountryCode(safeIdentifier);
  const code = (resolved || safeIdentifier.toUpperCase()) || 'US';
  const found = GEOPOLITICAL_45_COUNTRIES.find(c => c.code === code);
  if (found) return found;

  return {
    code,
    iso3: code.length === 3 ? code : (code === 'US' ? 'USA' : `${code}X`),
    qid: 'Q00',
    nameEs: code === 'US' ? 'Estados Unidos' : code === 'CN' ? 'China' : code === 'RU' ? 'Rusia' : `Nación ${code}`,
    nameEn: code === 'US' ? 'United States' : code,
    flag: code === 'US' ? '🇺🇸' : code === 'CN' ? '🇨🇳' : code === 'RU' ? '🇷🇺' : '🌐',
    region: 'North America',
    blocs: ['UN'],
    strategicRole: 'Potencia regional',
    sovereignRiskBase: 3.0
  } as GeopoliticalCountry;
}

