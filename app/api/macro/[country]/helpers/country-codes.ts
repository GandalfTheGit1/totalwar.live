/**
 * app/api/macro/[country]/helpers/country-codes.ts
 *
 * ISO country code converters and Trading Economics slug resolvers.
 */

import { ALL_COUNTRIES_META } from '@/lib/constants/geographic';

export const COUNTRY_SLUGS: Record<string, string> = {
  // Existing
  US: 'united-states', CN: 'china', TW: 'taiwan', IE: 'ireland', IN: 'india',
  GB: 'united-kingdom', JP: 'japan', MX: 'mexico', BR: 'brazil', DE: 'germany',
  FR: 'france', KR: 'south-korea', IT: 'italy', CA: 'canada', AU: 'australia', ES: 'spain',

  // Expanded Latin America & Caribbean
  CO: 'colombia', AR: 'argentina', CL: 'chile', PE: 'peru', VE: 'venezuela',
  UY: 'uruguay', PY: 'paraguay', EC: 'ecuador', BO: 'bolivia', CR: 'costa-rica',
  PA: 'panama', GT: 'guatemala', HN: 'honduras', SV: 'el-salvador', CU: 'cuba',
  DO: 'dominican-republic', PR: 'puerto-rico', JM: 'jamaica', BS: 'bahamas',

  // Expanded Europe & Russia
  CH: 'switzerland', SE: 'sweden', NO: 'norway', DK: 'denmark', FI: 'finland',
  NL: 'netherlands', BE: 'belgium', AT: 'austria', PT: 'portugal', GR: 'greece',
  PL: 'poland', RU: 'russia', UA: 'ukraine', TR: 'turkey', CZ: 'czech-republic',
  HU: 'hungary', RO: 'romania', BG: 'bulgaria', HR: 'croatia', SK: 'slovakia',
  SI: 'slovenia',

  // Expanded Middle East, Africa & Asia-Pacific
  DZ: 'algeria', EG: 'egypt', ZA: 'south-africa', IL: 'israel', SA: 'saudi-arabia',
  AE: 'united-arab-emirates', NG: 'nigeria', KE: 'kenya', MA: 'morocco', QA: 'qatar',
  KW: 'kuwait', OM: 'oman', BH: 'bahrain', JO: 'jordan', PK: 'pakistan',
  BD: 'bangladesh', LK: 'sri-lanka', SG: 'singapore', MY: 'malaysia', TH: 'thailand',
  ID: 'indonesia', PH: 'philippines', VN: 'vietnam', NZ: 'new-zealand', KH: 'cambodia',
};

export const ISO3_TO_ISO2: Record<string, string> = {
  AFG: 'AF', ALA: 'AX', ALB: 'AL', DZA: 'DZ', ASM: 'AS', AND: 'AD', AGO: 'AO', AIA: 'AI', ATA: 'AQ', ATG: 'AG',
  ARG: 'AR', ARM: 'AM', ABW: 'AW', AUS: 'AU', AUT: 'AT', AZE: 'AZ', BHS: 'BS', BHR: 'BH', BGD: 'BD', BRB: 'BB',
  BLR: 'BY', BEL: 'BE', BLZ: 'BZ', BEN: 'BJ', BMU: 'BM', BTN: 'BT', BOL: 'BO', BES: 'BQ', BIH: 'BA', BWA: 'BW',
  BVT: 'BV', BRA: 'BR', IOT: 'IO', BRN: 'BN', BGR: 'BG', BFA: 'BF', BDI: 'BI', CPV: 'CV', KHM: 'KH', CMR: 'CM',
  CAN: 'CA', CYM: 'KY', CAF: 'CF', TCD: 'TD', CHL: 'CL', CHN: 'CN', CXR: 'CX', CCK: 'CC', COL: 'CO', COM: 'KM',
  COD: 'CD', COG: 'CG', COK: 'CK', CRI: 'CR', CIV: 'CI', HRV: 'HR', CUB: 'CU', CUW: 'CW', CYP: 'CY', CZE: 'CZ',
  DNK: 'DK', DJI: 'DJ', DMA: 'DM', DOM: 'DO', ECU: 'EC', EGY: 'EG', SLV: 'SV', GNQ: 'GQ', ERI: 'ER', EST: 'EE',
  SWZ: 'SZ', ETH: 'ET', FLK: 'FK', FRO: 'FO', FJI: 'FJ', FIN: 'FI', FRA: 'FR', GUF: 'GF', PYF: 'PF', ATF: 'TF',
  GAB: 'GA', GMB: 'GM', GEO: 'GE', DEU: 'DE', GHA: 'GH', GIB: 'GI', GRC: 'GR', GRL: 'GL', GRD: 'GD', GLP: 'GP',
  GUM: 'GU', GTM: 'GT', GGY: 'GG', GIN: 'GN', GNB: 'GW', GUY: 'GY', HTI: 'HT', HMD: 'HM', VAT: 'VA', HND: 'HN',
  HKG: 'HK', HUN: 'HU', ISL: 'IS', IND: 'IN', IDN: 'ID', IRN: 'IR', IRQ: 'IQ', IRL: 'IE', IMN: 'IM', ISR: 'IL',
  ITA: 'IT', JAM: 'JM', JPN: 'JP', JEY: 'JE', JOR: 'JO', KAZ: 'KZ', KEN: 'KE', KIR: 'KI', PRK: 'KP', KOR: 'KR',
  KWT: 'KW', KGZ: 'KG', LAO: 'LA', LVA: 'LV', LBN: 'LB', LSO: 'LS', LBR: 'LR', LBY: 'LY', LIE: 'LI', LTU: 'LT',
  LUX: 'LU', MAC: 'MO', MKD: 'MK', MDG: 'MG', MWI: 'MW', MYS: 'MY', MDV: 'MV', MLI: 'ML', MLT: 'MT', MHL: 'MH',
  MTQ: 'MQ', MRT: 'MR', MUS: 'MU', MYT: 'YT', MEX: 'MX', FSM: 'FM', MDA: 'MD', MCO: 'MC', MNG: 'MN', MNE: 'ME',
  MSR: 'MS', MAR: 'MA', MOZ: 'MZ', MMR: 'MM', NAM: 'NA', NRU: 'NR', NPL: 'NP', NLD: 'NL', NCL: 'NC', NZL: 'NZ',
  NIC: 'NI', NER: 'NE', NGA: 'NG', NIU: 'NU', NFK: 'NF', MNP: 'MP', NOR: 'NO', OMN: 'OM', PAK: 'PK', PLW: 'PW',
  PSE: 'PS', PAN: 'PA', PNG: 'PG', PRY: 'PY', PER: 'PE', PHL: 'PH', PCN: 'PN', POL: 'PL', PRT: 'PT', PRI: 'PR',
  QAT: 'QA', REU: 'RE', ROU: 'RO', RUS: 'RU', RWA: 'RW', BLM: 'BL', SHN: 'SH', KNA: 'KN', LCA: 'LC', MAF: 'MF',
  SPM: 'PM', VCT: 'VC', WSM: 'WS', SMR: 'SM', STP: 'ST', SAU: 'SA', SEN: 'SN', SRB: 'RS', SYC: 'SC', SLE: 'SL',
  SGP: 'SG', SXM: 'SX', SVK: 'SK', SVN: 'SI', SLB: 'SB', SOM: 'SO', ZAF: 'ZA', SGS: 'GS', SSD: 'SS', ESP: 'ES',
  LKA: 'LK', SDN: 'SD', SUR: 'SR', SJM: 'SJ', SWE: 'SE', CHE: 'CH', SYR: 'SY', TWN: 'TW', TJK: 'TJ', TZA: 'TZ',
  THA: 'TH', TLS: 'TL', TGO: 'TG', TKL: 'TK', TON: 'TO', TTO: 'TT', TUN: 'TN', TUR: 'TR', TKM: 'TM', TCA: 'TC',
  TUV: 'TV', UGA: 'UG', UKR: 'UA', ARE: 'AE', GBR: 'GB', UMI: 'UM', USA: 'US', URY: 'UY', UZB: 'UZ', VUT: 'VU',
  VEN: 'VE', VNM: 'VN', VGB: 'VG', VIR: 'VI', WLF: 'WF', ESH: 'EH', YEM: 'YE', ZMB: 'ZM', ZWE: 'ZW',
};

export function resolveCountryCode(rawCountry: string): string {
  const clean = rawCountry.toUpperCase().trim();
  if (clean.length === 3) {
    return ISO3_TO_ISO2[clean] || clean;
  }
  return clean;
}

export function resolveTradingEconomicsSlug(countryCode: string): string {
  if (COUNTRY_SLUGS[countryCode]) {
    return COUNTRY_SLUGS[countryCode];
  }
  const metaName = ALL_COUNTRIES_META[countryCode]?.name;
  if (metaName) {
    return metaName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  return countryCode.toLowerCase();
}
