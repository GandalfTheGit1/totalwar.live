/**
 * lib/services/geopolitical/country-aliases.ts
 *
 * Canonical sets and lookup dictionaries for resolving country codes,
 * identifying autocracies or statist regimes, and mapping trade aliases.
 */

/**
 * Known autocracies or statist sovereign regimes for rule-of-law / expropriation risk.
 */
export const KNOWN_AUTOCRACIES_OR_STATIST = new Set<string>([
  'RU', 'IR', 'KP', 'SY', 'BY', 'CU', 'VE', 'MM', 'CN', 'AF', 'NI', 'YE', 'SD',
  'SA', 'AE', 'QA', 'EG', 'VN', 'DZ', 'AZ', 'UZ', 'KZ', 'TM', 'TJ', 'KG', 'LA', 'KH', 'ER',
  'ZW', 'ML', 'BF', 'NE', 'TD', 'SO', 'SS', 'LY', 'GQ', 'CG', 'RW', 'BI', 'TG', 'GA', 'CD', 'CF'
]);

/**
 * Common commercial aliases and multilingual country names mapped to ISO-2 codes.
 */
export const COMMON_COUNTRY_ALIASES: Record<string, string> = {
  'UK': 'GB',
  'UNITED KINGDOM': 'GB',
  'REINO UNIDO': 'GB',
  'UAE': 'AE',
  'UNITED ARAB EMIRATES': 'AE',
  'EMIRATOS ARABES UNIDOS': 'AE',
  'EMIRATOS ÁRABES UNIDOS': 'AE',
  'USA': 'US',
  'UNITED STATES': 'US',
  'EEUU': 'US',
  'EE.UU.': 'US',
  'ESTADOS UNIDOS': 'US',
  'DPRK': 'KP',
  'NORTH KOREA': 'KP',
  'COREA DEL NORTE': 'KP',
  'SOUTH KOREA': 'KR',
  'COREA DEL SUR': 'KR',
  'ROK': 'KR',
  'KOREA': 'KR',
  'PRC': 'CN',
  'CHINA': 'CN',
  'ROC': 'TW',
  'TAIWAN': 'TW',
  'TAIWÁN': 'TW',
  'RUSSIA': 'RU',
  'RUSIA': 'RU',
  'VIETNAM': 'VN',
  'IRAN': 'IR',
  'IRÁN': 'IR',
  'SYRIA': 'SY',
  'SIRIA': 'SY',
  'BELARUS': 'BY',
  'BIELORRUSIA': 'BY',
  'CUBA': 'CU',
  'VENEZUELA': 'VE',
  'MYANMAR': 'MM',
  'BURMA': 'MM',
  'BIRMANIA': 'MM'
};
