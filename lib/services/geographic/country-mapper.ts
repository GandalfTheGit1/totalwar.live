import { ALL_COUNTRIES_META } from '@/lib/constants/geographic';

/**
 * Helper function to map SEC English region names to our country codes
 * Returns 'REGION' for broad regions, 'MULTI:XX,YY' for multi-country segments,
 * a country code for single countries, or null if unrecognized.
 */
export function getCountryCodeFromName(name: string): string | null {
  const lower = name.toLowerCase().trim();

  // ── Broad region heuristics (order matters: check specific combos first) ──
  const regionPatterns = [
    // Compound regions
    'europe middle east', 'emea', 'cemea', 'europe & mea',
    'asia pacific', 'apac', 'apj', 'apmea',
    'greater china', 'prc',
    'latin america', 'latam', 'cala',
    'middle east and africa', 'middle east & africa',
    // Standalone regions
    'americas', 'america',
    'europe',
    'middle east', 'mena',
    'africa',
    'north america',
    'south america',
    'central america',
    'caribbean',
    'southeast asia', 'south east asia',
    'south asia',
    'east asia',
    'central asia',
    'nordic',
    'oceania',
    // Generic catch-alls
    'international', 'overseas', 'foreign',
    'rest of', 'all other', 'other countries', 'other segments',
  ];

  for (const pattern of regionPatterns) {
    if (lower.includes(pattern)) return 'REGION';
  }

  // Also catch "Other" as a standalone word (not substring of a country name)
  if (/^other$/i.test(lower) || /^other\b/i.test(lower)) return 'REGION';

  // ── Comprehensive English country name map ──
  const englishMap: Record<string, string> = {
    // Americas
    'united states': 'US', 'usa': 'US', 'u.s.': 'US',
    'canada': 'CA',
    'mexico': 'MX', 'méxico': 'MX',
    'brazil': 'BR', 'brasil': 'BR',
    'argentina': 'AR',
    'colombia': 'CO',
    'chile': 'CL',
    'peru': 'PE', 'perú': 'PE',
    'venezuela': 'VE',
    'ecuador': 'EC',
    'uruguay': 'UY',
    'paraguay': 'PY',
    'costa rica': 'CR',
    'panama': 'PA', 'panamá': 'PA',
    'guatemala': 'GT',
    'dominican republic': 'DO',
    'honduras': 'HN',
    'el salvador': 'SV',
    'jamaica': 'JM',
    'trinidad': 'TT',
    'bolivia': 'BO',
    'nicaragua': 'NI',
    'guyana': 'GY',
    'suriname': 'SR',
    'cuba': 'CU',
    'haiti': 'HT',

    // Europe
    'united kingdom': 'GB', 'uk': 'GB', 'great britain': 'GB',
    'germany': 'DE', 'alemania': 'DE',
    'france': 'FR', 'francia': 'FR',
    'italy': 'IT', 'italia': 'IT',
    'spain': 'ES', 'españa': 'ES',
    'netherlands': 'NL', 'holland': 'NL',
    'belgium': 'BE', 'bélgica': 'BE',
    'switzerland': 'CH', 'suiza': 'CH',
    'austria': 'AT',
    'sweden': 'SE', 'suecia': 'SE',
    'norway': 'NO', 'noruega': 'NO',
    'denmark': 'DK', 'dinamarca': 'DK',
    'finland': 'FI', 'finlandia': 'FI',
    'ireland': 'IE', 'irlanda': 'IE',
    'portugal': 'PT',
    'poland': 'PL', 'polonia': 'PL',
    'czech': 'CZ', 'czechia': 'CZ',
    'romania': 'RO', 'rumania': 'RO',
    'greece': 'GR', 'grecia': 'GR',
    'hungary': 'HU', 'hungría': 'HU',
    'bulgaria': 'BG',
    'croatia': 'HR', 'croacia': 'HR',
    'slovakia': 'SK', 'eslovaquia': 'SK',
    'slovenia': 'SI', 'eslovenia': 'SI',
    'serbia': 'RS',
    'luxembourg': 'LU', 'luxemburgo': 'LU',
    'iceland': 'IS', 'islandia': 'IS',
    'cyprus': 'CY', 'chipre': 'CY',
    'malta': 'MT',
    'lithuania': 'LT', 'lituania': 'LT',
    'latvia': 'LV', 'letonia': 'LV',
    'estonia': 'EE',
    'ukraine': 'UA', 'ucrania': 'UA',
    'russia': 'RU', 'rusia': 'RU',
    'belarus': 'BY', 'bielorrusia': 'BY',
    'georgia': 'GE',
    'moldova': 'MD',

    // Asia
    'china': 'CN',
    'japan': 'JP', 'japón': 'JP',
    'south korea': 'KR', 'korea': 'KR', 'corea': 'KR',
    'india': 'IN',
    'taiwan': 'TW', 'taiwán': 'TW',
    'hong kong': 'HK',
    'singapore': 'SG', 'singapur': 'SG',
    'indonesia': 'ID',
    'malaysia': 'MY', 'malasia': 'MY',
    'thailand': 'TH', 'tailandia': 'TH',
    'vietnam': 'VN',
    'philippines': 'PH', 'filipinas': 'PH',
    'pakistan': 'PK', 'pakistán': 'PK',
    'bangladesh': 'BD',
    'sri lanka': 'LK',
    'myanmar': 'MM',
    'cambodia': 'KH', 'camboya': 'KH',
    'mongolia': 'MN',
    'kazakhstan': 'KZ', 'kazajistán': 'KZ',
    'uzbekistan': 'UZ',

    // Middle East
    'israel': 'IL',
    'saudi arabia': 'SA', 'arabia saudita': 'SA',
    'united arab emirates': 'AE', 'uae': 'AE', 'emiratos': 'AE',
    'qatar': 'QA',
    'kuwait': 'KW',
    'bahrain': 'BH', 'baréin': 'BH',
    'oman': 'OM', 'omán': 'OM',
    'jordan': 'JO', 'jordania': 'JO',
    'lebanon': 'LB', 'líbano': 'LB',
    'iraq': 'IQ', 'irak': 'IQ',
    'iran': 'IR', 'irán': 'IR',
    'turkey': 'TR', 'turquía': 'TR',

    // Africa
    'south africa': 'ZA', 'sudáfrica': 'ZA',
    'egypt': 'EG', 'egipto': 'EG',
    'nigeria': 'NG',
    'kenya': 'KE', 'kenia': 'KE',
    'morocco': 'MA', 'marruecos': 'MA',
    'algeria': 'DZ', 'argelia': 'DZ',
    'ethiopia': 'ET', 'etiopía': 'ET',
    'ghana': 'GH',
    'tanzania': 'TZ',

    // Oceania
    'australia': 'AU',
    'new zealand': 'NZ', 'nueva zelanda': 'NZ',
  };

  // ── Multi-country detection ──
  // Check if the name contains "and" / "&" / "," separators that split into known countries
  const separatorRegex = /\s+and\s+|\s*&\s*|\s*,\s*/i;
  if (separatorRegex.test(lower)) {
    const parts = lower.split(separatorRegex).map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const resolvedCodes: string[] = [];
      for (const part of parts) {
        let found = false;
        for (const [eng, code] of Object.entries(englishMap)) {
          if (part.includes(eng) || eng.includes(part)) {
            resolvedCodes.push(code);
            found = true;
            break;
          }
        }
        if (!found) {
          // Check ALL_COUNTRIES_META
          for (const [code, meta] of Object.entries(ALL_COUNTRIES_META)) {
            if (part.includes(meta.name.toLowerCase()) || meta.name.toLowerCase().includes(part)) {
              resolvedCodes.push(code);
              found = true;
              break;
            }
          }
        }
        if (!found) {
          // One of the parts isn't a known country — treat the whole thing as a REGION
          resolvedCodes.length = 0;
          break;
        }
      }
      if (resolvedCodes.length >= 2) {
        return `MULTI:${resolvedCodes.join(',')}`;
      }
      // If we couldn't resolve all parts but it had separators, treat as REGION
      return 'REGION';
    }
  }

  // ── Single country match ──
  for (const [eng, code] of Object.entries(englishMap)) {
    if (lower.includes(eng)) return code;
  }

  // Fallback to names in ALL_COUNTRIES_META
  for (const [code, meta] of Object.entries(ALL_COUNTRIES_META)) {
    if (lower.includes(meta.name.toLowerCase())) return code;
  }

  return null;
}
