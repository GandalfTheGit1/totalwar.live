/**
 * lib/services/sovereign-power/profiles/taiwan.ts
 *
 * Detailed sovereign power profile for Taiwan (TW).
 * Calibrated data across all 6 Ray Dalio pillars and cabinet intelligence.
 */

import { 
  CountrySovereignPowerProfile, 
  SovereignRadarScores
} from '../../../types/sovereign-power';
import { GeopoliticalCountry } from '../../../data/geopolitical-countries';
import { DEFCON_LEVELS } from '../benchmarks';
import { calculateCompositePowerIndex, calculateGeopoliticalLeverage } from '../calculations';

const TW_BASE_SCORES: SovereignRadarScores = {
  techInnovation: 94,
  politicalCabinet: 76,
  currencyHegemony: 52,
  tradeCompetitiveness: 88,
  militaryCapacity: 62,
  institutionalStability: 84
};

const TW_DOSSIERS: CountrySovereignPowerProfile['dossiers'] = {
  tech: {
    score: 94,
    subsectors: {
      economic: { score: 85, label: 'Fintech Insular', technologies: ['Sistema Interbancario FISC', 'Integración FX de alta velocidad'] },
      industrial: { score: 98, label: 'Monopolio en Litografía Extrema', technologies: ['Fundición TSMC <3nm', 'Empaquetado CoWoS avanzado', 'Inspección óptica de obleas'] },
      military: { score: 72, label: 'Guerra Asimétrica de Puercoespín', technologies: ['Misiles antibuque Hsiung Feng III', 'Drones navales de defensa costera'] },
      semiconductors: { score: 99, label: 'Corazón Mundial del Silicio', fabricationNode: '<3nm / 2nm GAA (Hsinchu & Tainan Fabs)', capabilities: ['Monopolio de más del 90% en chips avanzados globales', 'TSMC Open Innovation Platform'] },
      artificialIntelligence: { score: 78, label: 'Hardware Enabler de IA', computeTier: 'Tier 1 Fab Tier', models: ['Fabricación física exclusiva de chips para Nvidia, AMD, Apple y Google'] }
    },
    wipoPatentRank: 6,
    rAndDPercentGdp: 3.8,
    summary: 'Epicentro físico indiscutible de la era digital y de la IA: el 90% de los chips de frontera del mundo dependen de sus fundiciones.'
  },
  cabinet: {
    score: 76,
    activeDoctrine: 'Estrategia de Puercoespín & Escudo de Silicio',
    dominantFaction: 'Partido Democrático Progresista (DPP)',
    factionCohesionLevel: 'FACTIONAL_FRICTION',
    headOfState: {
      id: 'tw_leader',
      role: 'HEAD_OF_STATE',
      roleTitleEs: 'Presidente',
      name: 'Lai Ching-te',
      faction: 'Soberanismo Pragmático',
      doctrine: 'Defensa de la Soberanía Democrática y Resiliencia Social',
      bioSnippet: 'Líder comprometido con la disuasión asimétrica y la diversificación comercial fuera de China continental.',
      ideologyAlignment: 'MODERATE_DIPLOMAT',
      stabilityImpact: 3
    },
    defenseMinister: {
      id: 'tw_defmin',
      role: 'DEFENSE',
      roleTitleEs: 'Ministro de Defensa Nacional',
      name: 'Wellington Koo',
      faction: 'Reforma Civil Asimétrica',
      doctrine: 'Doctrina del Puercoespín & Reservas Civiles Descentralizadas',
      bioSnippet: 'Abogado civil, nombrado para transformar la doctrina militar hacia misiles móviles y drones dispersos.',
      ideologyAlignment: 'TECHNO_DIRIGISTE',
      stabilityImpact: 4
    },
    financeMinister: {
      id: 'tw_finmin',
      role: 'FINANCE',
      roleTitleEs: 'Ministro de Finanzas',
      name: 'Chuang Tsui-yun',
      faction: 'Estabilidad Financiera Insular',
      doctrine: 'Preservación de Liquidez en Dólares y Defensa Monetaria',
      bioSnippet: 'Supervisa el fondo de estabilización y los amortiguadores de divisas ante bloqueos marítimos.',
      ideologyAlignment: 'FISCAL_ORTHODOX',
      stabilityImpact: 4
    },
    foreignMinister: {
      id: 'tw_diplo',
      role: 'FOREIGN_SECURITY',
      roleTitleEs: 'Ministro de Relaciones Exteriores',
      name: 'Lin Chia-lung',
      faction: 'Diplomacia Integrada Democrática',
      doctrine: 'Internacionalización del Estrecho como Vía Navegable Global',
      bioSnippet: 'Coordina los lazos no oficiales pero vitales con EE. UU., Japón y la Unión Europea.',
      ideologyAlignment: 'MODERATE_DIPLOMAT',
      stabilityImpact: 3
    },
    availableReplacements: []
  },
  currency: {
    score: 52,
    currencyCode: 'TWD',
    currencyName: 'Nuevo Dólar Taiwanés',
    isGlobalReserve: false,
    globalReserveSharePercent: 0.1,
    swiftStatus: 'CORE_PARTICIPANT',
    alternativeRails: [],
    fxReservesBillionUSD: 576,
    goldReservesTonnes: 423.6,
    debtToGdpPercent: 27.5,
    dalioSpread: {
      nominalGdpGrowthPercent: 5.5,
      effectiveInterestRatePercent: 2.0,
      spreadPercent: 3.5,
      isBeautifulDeleveraging: true,
      verdictEs: 'Spread Dalio altamente expansivo (+3.50%). Bajísima deuda soberana y 576 mil millones en reservas de divisas.'
    },
    sanctionsVulnerability: 'LOW'
  },
  trade: {
    score: 88,
    tradeBalanceBillionUSD: 80.5,
    worldTradeSharePercent: 2.5,
    topExportPartners: [
      { countryCode: 'CN', countryName: 'China / HK', sharePercent: 35.2, primaryGoods: 'Semiconductores y módulos electrónicos' },
      { countryCode: 'US', countryName: 'Estados Unidos', sharePercent: 23.4, primaryGoods: 'Servidores de IA, chips empaquetados' },
      { countryCode: 'JP', countryName: 'Japón', sharePercent: 7.2, primaryGoods: 'Obleas de silicio' }
    ],
    topImportPartners: [
      { countryCode: 'JP', countryName: 'Japón', sharePercent: 12.0, primaryGoods: 'Químicos de litografía, obleas sin procesar' },
      { countryCode: 'US', countryName: 'Estados Unidos', sharePercent: 11.2, primaryGoods: 'Equipos de prueba de semiconductores, crudo' }
    ],
    tariffVulnerabilityScore: 78,
    criticalDependencies: ['Energía importada (el 97% del gas/carbón/petróleo llega por mar)', 'Maquinaria ASML de los Países Bajos']
  },
  military: {
    score: 62,
    defenseBudgetBillionUSD: 19.1,
    defenseBudgetGdpPercent: 2.5,
    alliances: ['Taiwan Relations Act (Garantía defensiva implícita de EE. UU.)'],
    nuclearDeterrence: {
      warheadCount: 0,
      isTriadCapable: false,
      doctrineStatus: 'NON_NUCLEAR_UMBRELLA'
    },
    navalProjection: {
      aircraftCarriers: 0,
      nuclearSubmarines: 0,
      blueWaterNavy: false,
      majorCombatantsCount: 26
    },
    chokepointControl: {
      directlyControlled: ['Estrecho de Taiwán (Punto neurálgico de fricción absoluta)'],
      vulnerableChokepoints: ['Canal de Bashi', 'Estrecho de Miyako'],
      logisticsDominanceScore: 92
    }
  },
  stability: {
    score: 84,
    ruleOfLawScore: 88,
    internalCohesionScore: 80,
    polarizationLevel: 'MODERATE',
    coupOrFractureRiskPercent: 5,
    socialUnrestIndex: 22,
    verdict: 'STABLE_CONSTITUTIONAL'
  }
};

/**
 * Builds sovereign profile for Taiwan.
 */
export function buildTaiwanProfile(_country?: GeopoliticalCountry): CountrySovereignPowerProfile {
  const baseScores = { ...TW_BASE_SCORES };
  return {
    countryCode: 'TW',
    iso3: 'TWN',
    nameEs: 'Taiwán',
    flag: '🇹🇼',
    baseScores,
    compositePowerIndex: calculateCompositePowerIndex(baseScores),
    geopoliticalLeverageIndex: calculateGeopoliticalLeverage(baseScores),
    defconStatus: DEFCON_LEVELS[2],
    dossiers: structuredClone(TW_DOSSIERS)
  };
}
