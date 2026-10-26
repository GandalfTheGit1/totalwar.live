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

import { getCountryTechTreeAt, isPilotCountryCode } from '../../../data/tech-tree';
import { calculateCompositePowerIndex, calculateGeopoliticalLeverage } from '../calculations';

/**
 * Builds detailed profiles with calibrated data for key nations or procedural fallback.
 * For the 7 pilot countries, the technological score (0-100) is calculated from the verified tech tree nodes.
 */
export function buildProfileForCountry(country: GeopoliticalCountry): CountrySovereignPowerProfile {
  const code = country.code;

  let profile: CountrySovereignPowerProfile;
  if (code === 'US') {
    profile = buildUnitedStatesProfile(country);
  } else if (code === 'CN') {
    profile = buildChinaProfile(country);
  } else if (code === 'RU') {
    profile = buildRussiaProfile(country);
  } else if (code === 'TW') {
    profile = buildTaiwanProfile(country);
  } else if (code === 'DE') {
    profile = buildGermanyProfile(country);
  } else if (code === 'JP') {
    profile = buildJapanProfile(country);
  } else {
    profile = buildProceduralProfile(country);
  }

  if (isPilotCountryCode(code)) {
    const tree = getCountryTechTreeAt(code, 2026);
    profile.baseScores.techInnovation = tree.scoreTecnologico;
    profile.dossiers.tech.score = tree.scoreTecnologico;
    profile.dossiers.tech.hasVerifiedTechTree = true;
    profile.dossiers.tech.blockedNodesCount = tree.nodosBloqueadosPorSancion.length;
    profile.compositePowerIndex = calculateCompositePowerIndex(profile.baseScores);
    profile.geopoliticalLeverageIndex = calculateGeopoliticalLeverage(profile.baseScores);
  } else {
    profile.dossiers.tech.hasVerifiedTechTree = false;
    profile.dossiers.tech.blockedNodesCount = 0;
  }

  return profile;
}
