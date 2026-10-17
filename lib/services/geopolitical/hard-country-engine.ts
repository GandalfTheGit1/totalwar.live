/**
 * lib/services/geopolitical/hard-country-engine.ts
 *
 * Deterministic engine for classifying Hard Countries (HCI: 0-100)
 * by evaluating sanctions regimes, sovereign risk / autocracy, and bilateral friction.
 */

import { COUNTRY_BY_CODE, GEOPOLITICAL_45_COUNTRIES } from '../../data/geopolitical-countries';
import { findCountryByCode, GLOBAL_198_COUNTRIES } from '../../data/all-198-countries';
import {
  HardCountryProfile,
  SanctionsProfile,
  HardCountryCuratedData
} from './types';
import { CANONICAL_HARD_COUNTRIES_DATA } from './hard-country-data';
import { KNOWN_AUTOCRACIES_OR_STATIST } from './country-aliases';
import { resolveCountryCode } from './country-resolver';
import {
  resolveBilateralFriction,
  calculateHardCountryIndex,
  compileRiskDrivers
} from './hard-country-scoring';

/**
 * Resolves the sanctions regime and severity score for a jurisdiction.
 */
function resolveSanctionsDetail(
  isSelf: boolean,
  curated?: HardCountryCuratedData
): { sanctionsDetail: SanctionsProfile; sanctionsScore: number } {
  if (isSelf) {
    return {
      sanctionsDetail: {
        level: 'NONE',
        score: 0,
        regimes: [],
        description: 'Jurisdicción objetivo evaluada; sin régimen de sanciones contra sí misma.'
      },
      sanctionsScore: 0
    };
  }

  if (curated) {
    return {
      sanctionsDetail: curated.sanctions,
      sanctionsScore: curated.sanctions.score
    };
  }

  return {
    sanctionsDetail: {
      level: 'NONE',
      score: 0,
      regimes: [],
      description: 'Sin régimen activo de sanciones internacionales registradas.'
    },
    sanctionsScore: 0
  };
}

/**
 * Resolves sovereign risk and autocracy status.
 */
function resolveSovereignRisk(
  isSelf: boolean,
  code: string,
  curated?: HardCountryCuratedData,
  baseCountryRisk?: number
): {
  sovereignRiskScore: number;
  autocraticNature: boolean;
  baseRisk: number;
  isHighSovereignRisk: boolean;
} {
  const baseRisk = curated ? curated.sovereignRiskBase : (baseCountryRisk ?? 5.0);
  const autocraticNature = curated
    ? curated.autocracy
    : KNOWN_AUTOCRACIES_OR_STATIST.has(code);
  const isHighSovereignRisk = baseRisk >= 6.5;

  const sovereignRiskScore = isSelf
    ? Math.min(25, Math.round(baseRisk * 5))
    : Math.min(100, Math.round(baseRisk * 10));

  return { sovereignRiskScore, autocraticNature, baseRisk, isHighSovereignRisk };
}

/**
 * Resolves country metadata (iso3, name, flag, region) from catalogs.
 */
function resolveCountryMetadata(code: string) {
  const meta = COUNTRY_BY_CODE.get(code) || findCountryByCode(code);
  return {
    iso3: meta?.iso3 || (code.length === 3 ? code : code),
    countryName: meta?.nameEs || meta?.nameEn || code,
    flag: meta?.flag || '🌐',
    region: meta?.region || 'Global',
    baseCountryRisk: meta?.sovereignRiskBase
  };
}

/**
 * Compiles all risk sub-scores, HCI composite index, and risk drivers.
 */
function compileHardCountryScores(
  code: string,
  isSelf: boolean,
  curated: HardCountryCuratedData | undefined,
  baseCountryRisk: number | undefined,
  targetCode: string | undefined
) {
  const { sanctionsDetail, sanctionsScore } = resolveSanctionsDetail(isSelf, curated);
  const { sovereignRiskScore, autocraticNature, baseRisk, isHighSovereignRisk } = resolveSovereignRisk(
    isSelf, code, curated, baseCountryRisk
  );
  const { bilateralFrictionScore, bilateralStance } = resolveBilateralFriction(
    code, isSelf, targetCode, curated, sanctionsScore, baseRisk, autocraticNature
  );
  const { hardCountryIndex, tier } = calculateHardCountryIndex(
    isSelf, sanctionsScore, sovereignRiskScore, bilateralFrictionScore, baseRisk, autocraticNature, code
  );
  const primaryRiskDrivers = compileRiskDrivers(
    sanctionsScore, sanctionsDetail.regimes, autocraticNature, isHighSovereignRisk, baseRisk, bilateralFrictionScore
  );

  return {
    sanctionsScore, sanctionsDetail, sovereignRiskScore, autocraticNature,
    bilateralFrictionScore, bilateralStance, hardCountryIndex, tier, primaryRiskDrivers
  };
}

/**
 * Returns the Hard Country Profile (HCI 0-100) for a given country.
 */
export function getHardCountryProfile(
  countryIdentifier: string,
  targetCountry?: string
): HardCountryProfile | null {
  const code = resolveCountryCode(countryIdentifier);
  if (!code) return null;

  const targetCode = targetCountry ? resolveCountryCode(targetCountry) : undefined;
  const isSelf = Boolean(targetCode && targetCode === code);
  const curated = CANONICAL_HARD_COUNTRIES_DATA[code];
  const meta = resolveCountryMetadata(code);

  const scores = compileHardCountryScores(code, isSelf, curated, meta.baseCountryRisk, targetCode || undefined);

  return {
    countryCode: code,
    iso3: meta.iso3,
    countryName: meta.countryName,
    flag: meta.flag,
    region: meta.region,
    targetCountry: targetCode || undefined,
    ...scores,
    isHardCountry: scores.tier === 'EXTREME_HOSTILE' || scores.tier === 'STRATEGIC_ADVERSARIAL'
  };
}

/**
 * Classifies all sovereign nations across the 45 curated matrix and 198 countries catalog.
 */
export function classifyHardCountries(targetCountry?: string): HardCountryProfile[] {
  const uniqueCodes = new Set<string>();

  for (const country of GEOPOLITICAL_45_COUNTRIES) {
    if (country.code) uniqueCodes.add(country.code.toUpperCase());
  }
  for (const country of GLOBAL_198_COUNTRIES) {
    if (country.code) uniqueCodes.add(country.code.toUpperCase());
  }
  for (const code of Object.keys(CANONICAL_HARD_COUNTRIES_DATA)) {
    uniqueCodes.add(code.toUpperCase());
  }

  const profiles: HardCountryProfile[] = [];
  for (const code of uniqueCodes) {
    const profile = getHardCountryProfile(code, targetCountry);
    if (profile) profiles.push(profile);
  }

  return profiles.sort((a, b) => b.hardCountryIndex - a.hardCountryIndex);
}
