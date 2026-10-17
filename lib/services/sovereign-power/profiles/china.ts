/**
 * lib/services/sovereign-power/profiles/china.ts
 *
 * Detailed sovereign power profile for China (CN).
 * Calibrated data across all 6 Ray Dalio pillars and cabinet intelligence.
 */

import { 
  CountrySovereignPowerProfile, 
  SovereignRadarScores
} from '../../../types/sovereign-power';
import { GeopoliticalCountry } from '../../../data/geopolitical-countries';
import { SUPERPOWER_BENCHMARKS, DEFCON_LEVELS } from '../benchmarks';
import { calculateCompositePowerIndex, calculateGeopoliticalLeverage } from '../calculations';

const CN_DOSSIERS: CountrySovereignPowerProfile['dossiers'] = {
  tech: {
    score: 90,
    subsectors: {
      economic: { score: 92, label: 'Pagos Digitales & e-CNY', technologies: ['WeChat Pay / Alipay', 'e-CNY Digital Currency', 'Cross-Border Interbank mBridge'] },
      industrial: { score: 99, label: 'Mega-Fábrica & Robótica', technologies: ['5G Industrial Automation', 'Cadenas completas de Baterías LFP/NMC', 'Giga-prensas de VE'] },
      military: { score: 88, label: 'Misiles Hipersónicos & A2/AD', technologies: ['DF-17 Hypersonic Glide Vehicle', 'Drones stealth WZ-8', 'Caza J-20 5ª Gen', 'Sistemas de denegación de área A2/AD'] },
      semiconductors: { score: 72, label: 'Sustitución Nacional de Chips', fabricationNode: '7nm SMIC DUV + 28nm Madurez Monopólica', capabilities: ['Litografía DUV Multi-patterning', 'Monopolio en Galio/Germanio/Tierras Raras', 'Empaquetado avanzado SiP'] },
      artificialIntelligence: { score: 86, label: 'Ecosistema de IA Aplicada', computeTier: 'Tier 2: Clusters Huawei Ascend 910B', models: ['Qwen 2.5 / DeepSeek / Ernie', 'Reconocimiento facial y visión artificial a escala masiva'] }
    },
    wipoPatentRank: 1,
    rAndDPercentGdp: 2.58,
    summary: 'Potencia industrial incontestable, líder mundial en patentes, vehículos eléctricos, energía renovable y misiles hipersónicos.'
  },
  cabinet: {
    score: 88,
    activeDoctrine: 'Circulación Dual & Autonomía Estratégica Integral',
    dominantFaction: 'Comité Permanente del Politburó',
    factionCohesionLevel: 'COHESIVE',
    headOfState: {
      id: 'cn_leader',
      role: 'HEAD_OF_STATE',
      roleTitleEs: 'Secretario General & Presidente',
      name: 'Xi Jinping',
      faction: 'Facción de Nueva Era / Centralismo Democrático',
      doctrine: 'Rejuvenecimiento Nacional & Autosuficiencia Tecnológica',
      bioSnippet: 'Consolidación de poder absoluta, control estricto de corporaciones tecnológicas y rearme acelerado.',
      ideologyAlignment: 'TECHNO_DIRIGISTE',
      stabilityImpact: 8
    },
    defenseMinister: {
      id: 'cn_defmin',
      role: 'DEFENSE',
      roleTitleEs: 'Ministro de Defensa Nacional',
      name: 'Dong Jun',
      faction: 'Armada del Ejército Popular de Liberación (PLAN)',
      doctrine: 'Expansión Naval de Aguas Azules & Control del Mar del Sur',
      bioSnippet: 'Ex-comandante de la Armada, simboliza la transición de China hacia una superpotencia naval enfocada en Taiwán.',
      ideologyAlignment: 'HAWK',
      stabilityImpact: 4
    },
    financeMinister: {
      id: 'cn_finmin',
      role: 'FINANCE',
      roleTitleEs: 'Ministro de Finanzas',
      name: 'Lan Fo\'an',
      faction: 'Tecnocracia Fiscal Estatal',
      doctrine: 'Estímulo Fiscal Dirigido & Resolución de Deuda Local LGFV',
      bioSnippet: 'Especialista en saneamiento presupuestario y emisión de bonos soberanos ultralargos para I+D.',
      ideologyAlignment: 'FISCAL_ORTHODOX',
      stabilityImpact: 3
    },
    foreignMinister: {
      id: 'cn_diplo',
      role: 'FOREIGN_SECURITY',
      roleTitleEs: 'Director de Asuntos Exteriores & Canciller',
      name: 'Wang Yi',
      faction: 'Diplomacia del Lobo Guerrero Institucional',
      doctrine: 'Asociación Sin Límites con Rusia & Expansión BRICS+',
      bioSnippet: 'Diplomático de máxima jerarquía, artífice del acercamiento Irán-Arabia Saudí y la internacionalización del Sur Global.',
      ideologyAlignment: 'TECHNO_DIRIGISTE',
      stabilityImpact: 5
    },
    availableReplacements: [
      {
        id: 'cn_rep_military_expansionist',
        targetRole: 'DEFENSE',
        name: 'Zhang Youxia',
        faction: 'Veteranos de Combate del EPL',
        doctrine: 'Preparación Operativa Inmediata para Taiwán',
        bioSnippet: 'General veterano con lazos históricos, favorece movilización militar directa sin contemplaciones económicas.',
        ideologyAlignment: 'HAWK',
        impacts: {
          stabilityDelta: -3,
          militaryDelta: 8,
          currencyDelta: -4,
          tradeDelta: -10,
          techDelta: -2,
          narrativeChange: 'Alineamiento belicista que eleva la tensión en el Estrecho de Taiwán a niveles críticos.'
        }
      },
      {
        id: 'cn_rep_economic_reformer',
        targetRole: 'FINANCE',
        name: 'He Lifeng',
        faction: 'Planificación Centralizada de la Comisión NDRC',
        doctrine: 'Inyección Masiva de Liquidez en Infraestructura y Chips',
        bioSnippet: 'Director de política económica, partidario de subvenciones agresivas a la manufactura avanzada.',
        ideologyAlignment: 'TECHNO_DIRIGISTE',
        impacts: {
          stabilityDelta: 2,
          militaryDelta: 1,
          currencyDelta: -2,
          tradeDelta: 4,
          techDelta: 5,
          narrativeChange: 'Inundación de subsidios impulsa las exportaciones manufactureras y la absorción de semiconductores.'
        }
      }
    ]
  },
  currency: {
    score: 68,
    currencyCode: 'CNY',
    currencyName: 'Yuan Chino (Renminbi)',
    isGlobalReserve: true,
    globalReserveSharePercent: 2.3,
    swiftStatus: 'CORE_PARTICIPANT',
    alternativeRails: ['CIPS (Cross-Border Interbank Payment)', 'mBridge CBDC Rail', 'UnionPay Global'],
    fxReservesBillionUSD: 3261,
    goldReservesTonnes: 2264.3,
    debtToGdpPercent: 83.6,
    dalioSpread: {
      nominalGdpGrowthPercent: 4.8,
      effectiveInterestRatePercent: 2.9,
      spreadPercent: 1.9,
      isBeautifulDeleveraging: true,
      verdictEs: 'Spread Dalio positivo (+1.90%). Capacidad de absorción de deuda respaldada por 3.2 billones de reservas líquidas.'
    },
    sanctionsVulnerability: 'LOW'
  },
  trade: {
    score: 98,
    tradeBalanceBillionUSD: 823.2,
    worldTradeSharePercent: 14.4,
    topExportPartners: [
      { countryCode: 'US', countryName: 'Estados Unidos', sharePercent: 14.8, primaryGoods: 'Electrónica, maquinaria, bienes de consumo' },
      { countryCode: 'VN', countryName: 'Vietnam', sharePercent: 4.8, primaryGoods: 'Componentes intermedios, insumos textiles' },
      { countryCode: 'JP', countryName: 'Japón', sharePercent: 4.5, primaryGoods: 'Equipos electrónicos, baterías' }
    ],
    topImportPartners: [
      { countryCode: 'TW', countryName: 'Taiwán', sharePercent: 8.9, primaryGoods: 'Semiconductores y obleas' },
      { countryCode: 'KR', countryName: 'Corea del Sur', sharePercent: 7.2, primaryGoods: 'Memorias NAND/DRAM, pantallas' },
      { countryCode: 'JP', countryName: 'Japón', sharePercent: 6.8, primaryGoods: 'Químicos fotoresistentes, maquinaria' }
    ],
    tariffVulnerabilityScore: 68,
    criticalDependencies: ['Maquinaria litográfica EUV avanzada (ASML)', 'Petróleo de Oriente Medio por el Estrecho de Malaca', 'Chips de IA de gama alta']
  },
  military: {
    score: 88,
    defenseBudgetBillionUSD: 296.0,
    defenseBudgetGdpPercent: 1.7,
    alliances: ['SCO (Shanghai Cooperation Org)', 'BRICS Security Dialogues', 'Pacto Estratégico Integral CN-RU'],
    nuclearDeterrence: {
      warheadCount: 500,
      isTriadCapable: true,
      doctrineStatus: 'GLOBAL_OVERKILL_TRIAD'
    },
    navalProjection: {
      aircraftCarriers: 3,
      nuclearSubmarines: 12,
      blueWaterNavy: true,
      majorCombatantsCount: 370
    },
    chokepointControl: {
      directlyControlled: ['Estrecho de Taiwán (Dominio Costero)', 'Islas Paracel y Spratly (Mar del Sur de China)'],
      vulnerableChokepoints: ['Estrecho de Malaca (Dilema de Malaca energético)'],
      logisticsDominanceScore: 88
    }
  },
  stability: {
    score: 82,
    ruleOfLawScore: 56,
    internalCohesionScore: 86,
    polarizationLevel: 'LOW',
    coupOrFractureRiskPercent: 4,
    socialUnrestIndex: 28,
    verdict: 'STABLE_CONSTITUTIONAL'
  }
};

/**
 * Builds sovereign profile for China.
 */
export function buildChinaProfile(_country?: GeopoliticalCountry): CountrySovereignPowerProfile {
  const baseScores: SovereignRadarScores = { ...SUPERPOWER_BENCHMARKS.CN.scores };
  return {
    countryCode: 'CN',
    iso3: 'CHN',
    nameEs: 'China',
    flag: '🇨🇳',
    baseScores,
    compositePowerIndex: calculateCompositePowerIndex(baseScores),
    geopoliticalLeverageIndex: calculateGeopoliticalLeverage(baseScores),
    defconStatus: DEFCON_LEVELS[3],
    dossiers: structuredClone(CN_DOSSIERS)
  };
}
