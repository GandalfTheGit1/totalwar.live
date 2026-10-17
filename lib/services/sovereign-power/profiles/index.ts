/**
 * lib/services/sovereign-power/profiles/index.ts
 *
 * Registry and dispatcher for country sovereign power profiles.
 * Routes calibrated nations to dedicated profile engines and others to procedural synthesis.
 */

import { CountrySovereignPowerProfile } from '../../../types/sovereign-power';
import { GeopoliticalCountry } from '../../../data/geopolitical-countries';
import { buildUnitedStatesProfile } from './united-states';
import { buildChinaProfile } from './china';
import { buildRussiaProfile } from './russia';
import { buildTaiwanProfile } from './taiwan';
import { buildGermanyProfile } from './germany';
import { buildJapanProfile } from './japan';
import { buildProceduralProfile } from './procedural';

/**
 * Builds detailed profiles with calibrated data for key nations or procedural fallback.
 */
export function buildProfileForCountry(country: GeopoliticalCountry): CountrySovereignPowerProfile {
  const code = country.code;

  if (code === 'US') {
    return buildUnitedStatesProfile(country);
  } else if (code === 'CN') {
    return buildChinaProfile(country);
  } else if (code === 'RU') {
    return buildRussiaProfile(country);
  } else if (code === 'TW') {
    return buildTaiwanProfile(country);
  } else if (code === 'DE') {
    return buildGermanyProfile(country);
  } else if (code === 'JP') {
    return buildJapanProfile(country);
  }

  return buildProceduralProfile(country);
}
