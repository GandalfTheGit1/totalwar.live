/**
 * lib/services/sovereign-power/profiles/japan.ts
 *
 * Detailed sovereign power profile for Japan (JP).
 * Calibrated data across all 6 Ray Dalio pillars and cabinet intelligence.
 */

import { 
  CountrySovereignPowerProfile, 
  SovereignRadarScores
} from '../../../types/sovereign-power';
import { GeopoliticalCountry } from '../../../data/geopolitical-countries';
import { DEFCON_LEVELS } from '../benchmarks';
import { calculateCompositePowerIndex, calculateGeopoliticalLeverage } from '../calculations';

const JP_BASE_SCORES: SovereignRadarScores = {
  techInnovation: 88,
  politicalCabinet: 74,
  currencyHegemony: 64,
  tradeCompetitiveness: 80,
  militaryCapacity: 72,
  institutionalStability: 92
};

const JP_DOSSIERS: CountrySovereignPowerProfile['dossiers'] = {
  tech: {
    score: 88,
    subsectors: {
      economic: { score: 82, label: 'Fintech & Zengin System', technologies: ['Zengin Net', 'Yen Clearing High Resilience'] },
      industrial: { score: 96, label: 'Robótica de Precisión', technologies: ['Fanuc, Yaskawa Robótica', 'Materiales cerámicos Kyocera', 'Químicos de ultra-pureza Tokyo Ohka'] },
      military: { score: 76, label: 'Destructores Aegis & Cazas F-35', technologies: ['Destructores clase Maya', 'Submarinos clase Taigei con baterías Li-ion', 'Proyecto GCAP 6ª Gen'] },
      semiconductors: { score: 84, label: 'Monopolio en Químicos y Equipos', fabricationNode: 'Rapidous 2nm R&D + Maquinaria Tokyo Electron', capabilities: ['Resinas fotosensibles (90% mundial)', 'Obleas de silicio Shin-Etsu/SUMCO'] },
      artificialIntelligence: { score: 70, label: 'Supercómputo Fugaku', computeTier: 'Tier 2 RIKEN Supercomputer', models: ['Modelos de lenguaje japoneses especializados'] }
    },
    wipoPatentRank: 3,
    rAndDPercentGdp: 3.3,
    summary: 'Poder absoluto en químicos para chips, obleas y robótica de precisión, en pleno rearme histórico.'
  },
  cabinet: {
    score: 74,
    activeDoctrine: 'Indo-Pacífico Libre y Abierto & Rearme Constitucional',
    dominantFaction: 'Partido Liberal Democrático (LDP)',
    factionCohesionLevel: 'FACTIONAL_FRICTION',
    headOfState: {
      id: 'jp_pm',
      role: 'HEAD_OF_STATE',
      roleTitleEs: 'Primer Ministro',
      name: 'Shigeru Ishiba',
      faction: 'LDP Moderado de Defensa',
      doctrine: 'OTAN Asiática & Fortalecimiento de la Alianza con EE. UU.',
      bioSnippet: 'Experto en defensa, impulsa mayor autonomía estratégica y disuasión ante China y Corea del Norte.',
      ideologyAlignment: 'HAWK',
      stabilityImpact: 4
    },
    defenseMinister: {
      id: 'jp_defmin',
      role: 'DEFENSE',
      roleTitleEs: 'Ministro de Defensa',
      name: 'Gen Nakatani',
      faction: 'Fuerzas de Autodefensa (JSDF)',
      doctrine: 'Capacidad de Contraataque & Misiles Tomahawk',
      bioSnippet: 'Ex-oficial de las Fuerzas de Autodefensa, lidera el incremento del presupuesto de defensa al 2% del PIB.',
      ideologyAlignment: 'HAWK',
      stabilityImpact: 4
    },
    financeMinister: {
      id: 'jp_finmin',
      role: 'FINANCE',
      roleTitleEs: 'Ministro de Finanzas',
      name: 'Katsunobu Kato',
      faction: 'Abenomics de Transición',
      doctrine: 'Normalización de Tipos del Banco de Japón y Control de Inflación',
      bioSnippet: 'Supervisa la salida de los tipos negativos y el manejo de la deuda masiva de Japón.',
      ideologyAlignment: 'FISCAL_ORTHODOX',
      stabilityImpact: 3
    },
    foreignMinister: {
      id: 'jp_diplo',
      role: 'FOREIGN_SECURITY',
      roleTitleEs: 'Ministro de Asuntos Exteriores',
      name: 'Takeshi Iwaya',
      faction: 'Diplomacia de Seguridad Integral',
      doctrine: 'Consolidación del Quad y Trilateral EE. UU.-Japón-Corea del Sur',
      bioSnippet: 'Coordina la disuasión regional con Seúl y Washington en el Mar de China Oriental.',
      ideologyAlignment: 'MODERATE_DIPLOMAT',
      stabilityImpact: 3
    },
    availableReplacements: []
  },
  currency: {
    score: 64,
    currencyCode: 'JPY',
    currencyName: 'Yen Japonés',
    isGlobalReserve: true,
    globalReserveSharePercent: 4.8,
    swiftStatus: 'CORE_PARTICIPANT',
    alternativeRails: [],
    fxReservesBillionUSD: 1250,
    goldReservesTonnes: 846.0,
    debtToGdpPercent: 260.0,
    dalioSpread: {
      nominalGdpGrowthPercent: 2.4,
      effectiveInterestRatePercent: 0.25,
      spreadPercent: 2.15,
      isBeautifulDeleveraging: true,
      verdictEs: 'Spread Dalio positivo (+2.15%). Tipo de interés ultra-bajo del Banco de Japón evita la quiebra pese al 260% de deuda.'
    },
    sanctionsVulnerability: 'IMMUNE'
  },
  trade: {
    score: 80,
    tradeBalanceBillionUSD: -40.0,
    worldTradeSharePercent: 3.5,
    topExportPartners: [
      { countryCode: 'US', countryName: 'Estados Unidos', sharePercent: 20.2, primaryGoods: 'Automóviles, maquinaria de semiconductores' },
      { countryCode: 'CN', countryName: 'China', sharePercent: 17.6, primaryGoods: 'Químicos, componentes electrónicos' }
    ],
    topImportPartners: [
      { countryCode: 'CN', countryName: 'China', sharePercent: 22.0, primaryGoods: 'Electrónica, ropa, metales' },
      { countryCode: 'US', countryName: 'Estados Unidos', sharePercent: 10.4, primaryGoods: 'Energía, alimentos' }
    ],
    tariffVulnerabilityScore: 54,
    criticalDependencies: ['Petróleo crudo (99% importado por el Estrecho de Ormuz)', 'Alimentos y cereales']
  },
  military: {
    score: 72,
    defenseBudgetBillionUSD: 56.0,
    defenseBudgetGdpPercent: 1.6,
    alliances: ['Tratado de Seguridad Mutua EE. UU.-Japón', 'Quad (EE. UU., Japón, India, Australia)'],
    nuclearDeterrence: {
      warheadCount: 0,
      isTriadCapable: false,
      doctrineStatus: 'NON_NUCLEAR_UMBRELLA'
    },
    navalProjection: {
      aircraftCarriers: 2,
      nuclearSubmarines: 0,
      blueWaterNavy: true,
      majorCombatantsCount: 52
    },
    chokepointControl: {
      directlyControlled: ['Estrecho de Tsushima', 'Estrecho de Tsugaru'],
      vulnerableChokepoints: ['Mar de China Oriental'],
      logisticsDominanceScore: 78
    }
  },
  stability: {
    score: 92,
    ruleOfLawScore: 94,
    internalCohesionScore: 92,
    polarizationLevel: 'LOW',
    coupOrFractureRiskPercent: 1,
    socialUnrestIndex: 10,
    verdict: 'FORTRESS'
  }
};

/**
 * Builds sovereign profile for Japan.
 */
export function buildJapanProfile(_country?: GeopoliticalCountry): CountrySovereignPowerProfile {
  const baseScores = { ...JP_BASE_SCORES };
  return {
    countryCode: 'JP',
    iso3: 'JPN',
    nameEs: 'Japón',
    flag: '🇯🇵',
    baseScores,
    compositePowerIndex: calculateCompositePowerIndex(baseScores),
    geopoliticalLeverageIndex: calculateGeopoliticalLeverage(baseScores),
    defconStatus: DEFCON_LEVELS[4],
    dossiers: structuredClone(JP_DOSSIERS)
  };
}
