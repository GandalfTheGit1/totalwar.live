/**
 * lib/services/sovereign-power/profiles/germany.ts
 *
 * Detailed sovereign power profile for Germany (DE).
 * Calibrated data across all 6 Ray Dalio pillars and cabinet intelligence.
 */

import { 
  CountrySovereignPowerProfile, 
  SovereignRadarScores
} from '../../../types/sovereign-power';
import { GeopoliticalCountry } from '../../../data/geopolitical-countries';
import { DEFCON_LEVELS } from '../benchmarks';
import { calculateCompositePowerIndex, calculateGeopoliticalLeverage } from '../calculations';

const DE_BASE_SCORES: SovereignRadarScores = {
  techInnovation: 85,
  politicalCabinet: 70,
  currencyHegemony: 75,
  tradeCompetitiveness: 86,
  militaryCapacity: 58,
  institutionalStability: 82
};

const DE_DOSSIERS: CountrySovereignPowerProfile['dossiers'] = {
  tech: {
    score: 85,
    subsectors: {
      economic: { score: 82, label: 'Fintech & Euroclear', technologies: ['BCE TARGET2', 'Infraestructura de clearing europea'] },
      industrial: { score: 94, label: 'Ingeniería Mecánica & Automotriz', technologies: ['Maquinaria de precisión Trumpf', 'Óptica Zeiss para litografía EUV', 'Robótica KUKA'] },
      military: { score: 68, label: 'Blindados Leopard & Submarinos Tipo 212', technologies: ['Leopard 2A8', 'Defensa aérea Iris-T', 'Sistemas de propulsión AIP'] },
      semiconductors: { score: 75, label: 'Componentes Críticos para Litografía', fabricationNode: '28nm Dresden + Zeiss Mirrors (Monopolio EUV)', capabilities: ['Lentes y espejos láser de EUV', 'Químicos de grabado BASF'] },
      artificialIntelligence: { score: 74, label: 'Investigación Industrial IA', computeTier: 'Tier 2 EuroHPC', models: ['Aleph Alpha', 'Modelos industriales Siemens'] }
    },
    wipoPatentRank: 4,
    rAndDPercentGdp: 3.13,
    summary: 'Columna vertebral de la ingeniería europea, monopolio óptico en espejos EUV (Zeiss) con vulnerabilidad en costes energéticos.'
  },
  cabinet: {
    score: 70,
    activeDoctrine: 'Zeitenwende & Derisking Sin Desacople',
    dominantFaction: 'Coalición Parlamentaria / Freno a la Deuda',
    factionCohesionLevel: 'FACTIONAL_FRICTION',
    headOfState: {
      id: 'de_canciller',
      role: 'HEAD_OF_STATE',
      roleTitleEs: 'Canciller Federal',
      name: 'Olaf Scholz',
      faction: 'Socialdemocracia Pragmática (SPD)',
      doctrine: 'Apoyo Prudente a Ucrania & Preservación del Empleo Industrial',
      bioSnippet: 'Canciller de la Zeitenwende, busca equilibrar el rearme con la moderación diplomática.',
      ideologyAlignment: 'MODERATE_DIPLOMAT',
      stabilityImpact: 2
    },
    defenseMinister: {
      id: 'de_defmin',
      role: 'DEFENSE',
      roleTitleEs: 'Ministro Federal de Defensa',
      name: 'Boris Pistorius',
      faction: 'Modernización del Bundeswehr',
      doctrine: 'Bundeswehr Kriegstauglich (Apto para la Guerra)',
      bioSnippet: 'El político más popular de Alemania, enfocado en rearmar el ejército y desplegar una brigada permanente en Lituania.',
      ideologyAlignment: 'HAWK',
      stabilityImpact: 5
    },
    financeMinister: {
      id: 'de_finmin',
      role: 'FINANCE',
      roleTitleEs: 'Ministro de Finanzas',
      name: 'Christian Lindner',
      faction: 'Ortodoxia Fiscal Liberal (FDP)',
      doctrine: 'Defensa Estricta del Schuldenbremse (Freno a la Deuda)',
      bioSnippet: 'Partidario inamovible de la disciplina presupuestaria sin subidas fiscales.',
      ideologyAlignment: 'FISCAL_ORTHODOX',
      stabilityImpact: 1
    },
    foreignMinister: {
      id: 'de_diplo',
      role: 'FOREIGN_SECURITY',
      roleTitleEs: 'Ministra de Asuntos Exteriores',
      name: 'Annalena Baerbock',
      faction: 'Política Exterior Basada en Valores (Verdes)',
      doctrine: 'Derisking Radical de China & Apoyo Total a Ucrania',
      bioSnippet: 'Postura firme pro-derechos humanos y reducción rápida de dependencias de regímenes autoritarios.',
      ideologyAlignment: 'MODERATE_DIPLOMAT',
      stabilityImpact: 2
    },
    availableReplacements: []
  },
  currency: {
    score: 75,
    currencyCode: 'EUR',
    currencyName: 'Euro',
    isGlobalReserve: true,
    globalReserveSharePercent: 20.1,
    swiftStatus: 'CORE_PARTICIPANT',
    alternativeRails: ['INSTEX (Legacy)', 'BCE Digital Euro Pilot'],
    fxReservesBillionUSD: 310,
    goldReservesTonnes: 3352.6,
    debtToGdpPercent: 63.6,
    dalioSpread: {
      nominalGdpGrowthPercent: 2.1,
      effectiveInterestRatePercent: 3.25,
      spreadPercent: -1.15,
      isBeautifulDeleveraging: false,
      verdictEs: 'Spread Dalio negativo (-1.15%). Crecimiento estancado con tipos restrictivos del BCE genera desindustrialización.'
    },
    sanctionsVulnerability: 'LOW'
  },
  trade: {
    score: 86,
    tradeBalanceBillionUSD: 245.0,
    worldTradeSharePercent: 7.3,
    topExportPartners: [
      { countryCode: 'US', countryName: 'Estados Unidos', sharePercent: 9.9, primaryGoods: 'Autos, maquinaria, medicamentos' },
      { countryCode: 'FR', countryName: 'Francia', sharePercent: 7.5, primaryGoods: 'Aeronáutica, químicos' },
      { countryCode: 'CN', countryName: 'China', sharePercent: 6.2, primaryGoods: 'Vehículos premium, maquinaria pesada' }
    ],
    topImportPartners: [
      { countryCode: 'CN', countryName: 'China', sharePercent: 11.8, primaryGoods: 'Baterías, electrónica, componentes solares' },
      { countryCode: 'NL', countryName: 'Países Bajos', sharePercent: 8.5, primaryGoods: 'Combustibles, químicos' }
    ],
    tariffVulnerabilityScore: 62,
    criticalDependencies: ['Gas natural licuado (GNL) de reemplazo', 'Tierras raras y baterías de China']
  },
  military: {
    score: 58,
    defenseBudgetBillionUSD: 72.0,
    defenseBudgetGdpPercent: 2.0,
    alliances: ['NATO', 'Unión Europea (PESCO)'],
    nuclearDeterrence: {
      warheadCount: 0,
      isTriadCapable: false,
      doctrineStatus: 'NON_NUCLEAR_UMBRELLA'
    },
    navalProjection: {
      aircraftCarriers: 0,
      nuclearSubmarines: 0,
      blueWaterNavy: false,
      majorCombatantsCount: 15
    },
    chokepointControl: {
      directlyControlled: [],
      vulnerableChokepoints: ['Mar del Norte / Báltico'],
      logisticsDominanceScore: 40
    }
  },
  stability: {
    score: 82,
    ruleOfLawScore: 90,
    internalCohesionScore: 74,
    polarizationLevel: 'MODERATE',
    coupOrFractureRiskPercent: 3,
    socialUnrestIndex: 25,
    verdict: 'STABLE_CONSTITUTIONAL'
  }
};

/**
 * Builds sovereign profile for Germany.
 */
export function buildGermanyProfile(_country?: GeopoliticalCountry): CountrySovereignPowerProfile {
  const baseScores = { ...DE_BASE_SCORES };
  return {
    countryCode: 'DE',
    iso3: 'DEU',
    nameEs: 'Alemania',
    flag: '🇩🇪',
    baseScores,
    compositePowerIndex: calculateCompositePowerIndex(baseScores),
    geopoliticalLeverageIndex: calculateGeopoliticalLeverage(baseScores),
    defconStatus: DEFCON_LEVELS[4],
    dossiers: structuredClone(DE_DOSSIERS)
  };
}
