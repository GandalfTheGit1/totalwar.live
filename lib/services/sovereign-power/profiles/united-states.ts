/**
 * lib/services/sovereign-power/profiles/united-states.ts
 *
 * Detailed sovereign power profile for the United States (US).
 * Calibrated data across all 6 Ray Dalio pillars and cabinet intelligence.
 */

import { 
  CountrySovereignPowerProfile, 
  SovereignRadarScores
} from '../../../types/sovereign-power';
import { GeopoliticalCountry } from '../../../data/geopolitical-countries';
import { SUPERPOWER_BENCHMARKS, DEFCON_LEVELS } from '../benchmarks';
import { calculateCompositePowerIndex, calculateGeopoliticalLeverage } from '../calculations';

const US_DOSSIERS: CountrySovereignPowerProfile['dossiers'] = {
  tech: {
    score: 96,
    subsectors: {
      economic: { score: 98, label: 'Fintech & Fedwire', technologies: ['FedNow', 'Swift US Node', 'Algorithmic High-Frequency Clearing'] },
      industrial: { score: 85, label: 'Robótica Aeroespacial', technologies: ['Automatización CNC de defensa', 'Fabricación aditiva de titanio', 'Satélites Starlink/LEO'] },
      military: { score: 99, label: 'Guerra Asimétrica & Drones', technologies: ['B-21 Raider Stealth', 'Hypersonic ARRW', 'Guerra Electrónica C5ISR', 'Dominio Ciberdefensa NSA'] },
      semiconductors: { score: 92, label: 'Diseño Fabless Dominante', fabricationNode: 'Fabless Global (Apple, Nvidia, AMD, Qualcomm) + CHIPS Act Fabs', capabilities: ['Ecosistema EDA (Synopsys/Cadence)', 'Arquitectura GPU Blackwell', 'Empaquetado CoWoS subcontratado'] },
      artificialIntelligence: { score: 99, label: 'Hegemonía Frontier AI', computeTier: 'Tier 1: >500k H100/B200 Clusters', models: ['GPT-5 / Claude 3.5 / Gemini', 'Supercómputo Stargate', 'Ecosistema Abierto CUDA'] }
    },
    wipoPatentRank: 2,
    rAndDPercentGdp: 3.46,
    summary: 'Liderazgo mundial indiscutido en software, IA generativa, diseño de semiconductores avanzados y patentes biomédicas.'
  },
  cabinet: {
    score: 72,
    activeDoctrine: 'Primacía Tecnológica & Disuasión Integral Indo-Pacífico',
    dominantFaction: 'Internacionalismo de Seguridad Nacional',
    factionCohesionLevel: 'FACTIONAL_FRICTION',
    headOfState: {
      id: 'us_potus',
      role: 'HEAD_OF_STATE',
      roleTitleEs: 'Comandante en Jefe / Presidente',
      name: 'Joe Biden',
      faction: 'Demócrata Institucional',
      doctrine: 'Alianzas Transatlánticas & Ley CHIPS',
      bioSnippet: 'Enfoque en coaliciones multilaterales, defensa de Ucrania y contención tecnológica de China.',
      ideologyAlignment: 'MODERATE_DIPLOMAT',
      stabilityImpact: 2
    },
    defenseMinister: {
      id: 'us_secdef',
      role: 'DEFENSE',
      roleTitleEs: 'Secretario de Defensa (Pentágono)',
      name: 'Lloyd Austin',
      faction: 'Mando Conjunto Tradicional',
      doctrine: 'Disuasión Integrada Multidominio',
      bioSnippet: 'Ex-general de cuatro estrellas, prioriza modernización de la triada nuclear y defensa aérea distribuida.',
      ideologyAlignment: 'HAWK',
      stabilityImpact: 3
    },
    financeMinister: {
      id: 'us_sectreas',
      role: 'FINANCE',
      roleTitleEs: 'Secretaria del Tesoro',
      name: 'Janet Yellen',
      faction: 'Ortodoxia Fiscal & Friendshoring',
      doctrine: 'Friendshoring & Sanciones Quirúrgicas',
      bioSnippet: 'Ex-presidenta de la Fed. Coordina control de liquidez, desincentivo de devaluaciones y límites de precios al crudo.',
      ideologyAlignment: 'FISCAL_ORTHODOX',
      stabilityImpact: 4
    },
    foreignMinister: {
      id: 'us_secstate',
      role: 'FOREIGN_SECURITY',
      roleTitleEs: 'Secretario de Estado',
      name: 'Antony Blinken',
      faction: 'Diplomacia Estratégica',
      doctrine: 'Cohesión OTAN & Quad',
      bioSnippet: 'Diplomático de carrera, enfocado en contener la escalada en Oriente Medio y proyectar poder en el Indo-Pacífico.',
      ideologyAlignment: 'MODERATE_DIPLOMAT',
      stabilityImpact: 1
    },
    availableReplacements: [
      {
        id: 'us_rep_hawk_secdef',
        targetRole: 'DEFENSE',
        name: 'Pete Hegseth',
        faction: 'America First Militarista',
        doctrine: 'Purga Burocrática & Enfoque Letal Sin Filtros',
        bioSnippet: 'Halcón ideológico enfocado en eliminar gasto superfluo y reorientar el ejército a letalidad cinética máxima.',
        ideologyAlignment: 'HAWK',
        impacts: {
          stabilityDelta: -6,
          militaryDelta: 5,
          currencyDelta: -2,
          tradeDelta: -1,
          techDelta: 2,
          narrativeChange: 'Aceleración bélica agresiva con fuerte fricción institucional en el Pentágono.'
        }
      },
      {
        id: 'us_rep_trade_finance',
        targetRole: 'FINANCE',
        name: 'Scott Bessent',
        faction: 'Proteccionismo Arancelario Pragmático',
        doctrine: 'Aranceles Estratégicos & Desregulación Financiera',
        bioSnippet: 'Inversor macroeconómico enfocado en reindustrialización vía aranceles recíprocos y disciplina monetaria.',
        ideologyAlignment: 'NATIONALIST_POPULIST',
        impacts: {
          stabilityDelta: 1,
          militaryDelta: 1,
          currencyDelta: 3,
          tradeDelta: -8,
          techDelta: 0,
          narrativeChange: 'Aranceles comerciales agresivos impulsan el dólar a corto plazo pero causan represalias comerciales globales.'
        }
      },
      {
        id: 'us_rep_hardline_state',
        targetRole: 'FOREIGN_SECURITY',
        name: 'Marco Rubio',
        faction: 'Halcones Anticomunistas Indo-Pacífico',
        doctrine: 'Tolerancia Cero con Irán, Cuba y Beijing',
        bioSnippet: 'Senador veterano de comités de inteligencia, aboga por desacople comercial total de adversarios estratégicos.',
        ideologyAlignment: 'HAWK',
        impacts: {
          stabilityDelta: 0,
          militaryDelta: 4,
          currencyDelta: -3,
          tradeDelta: -7,
          techDelta: -1,
          narrativeChange: 'Postura diplomática de choque que intensifica la guerra comercial y sanciones tecnológicas.'
        }
      }
    ]
  },
  currency: {
    score: 98,
    currencyCode: 'USD',
    currencyName: 'Dólar Estadounidense',
    isGlobalReserve: true,
    globalReserveSharePercent: 58.4,
    swiftStatus: 'HEGEMON_CONTROLLER',
    alternativeRails: ['FedNow', 'CHIPS', 'CLS Global'],
    fxReservesBillionUSD: 242,
    goldReservesTonnes: 8133.5,
    debtToGdpPercent: 122.3,
    dalioSpread: {
      nominalGdpGrowthPercent: 5.2,
      effectiveInterestRatePercent: 4.8,
      spreadPercent: 0.4,
      isBeautifulDeleveraging: true,
      verdictEs: 'Spread Dalio positivo leve (+0.40%). Capacidad de monetización infinita gracias al privilegio exorbitante del USD.'
    },
    sanctionsVulnerability: 'IMMUNE'
  },
  trade: {
    score: 82,
    tradeBalanceBillionUSD: -948.1,
    worldTradeSharePercent: 10.6,
    topExportPartners: [
      { countryCode: 'CA', countryName: 'Canadá', sharePercent: 17.5, primaryGoods: 'Maquinaria pesada, autos, energía' },
      { countryCode: 'MX', countryName: 'México', sharePercent: 15.8, primaryGoods: 'Componentes industriales, electrónica' },
      { countryCode: 'CN', countryName: 'China', sharePercent: 7.2, primaryGoods: 'Semiconductores, aviación, soja' }
    ],
    topImportPartners: [
      { countryCode: 'MX', countryName: 'México', sharePercent: 15.4, primaryGoods: 'Autopartes, computadoras' },
      { countryCode: 'CN', countryName: 'China', sharePercent: 13.9, primaryGoods: 'Electrónica de consumo, baterías' },
      { countryCode: 'CA', countryName: 'Canadá', sharePercent: 12.8, primaryGoods: 'Petróleo crudo, madera' }
    ],
    tariffVulnerabilityScore: 32,
    criticalDependencies: ['Tierras raras procesadas', 'Fundición avanzada de semiconductores (TSMC)', 'Ingredientes farmacéuticos activos (APIs)']
  },
  military: {
    score: 99,
    defenseBudgetBillionUSD: 886.0,
    defenseBudgetGdpPercent: 3.4,
    alliances: ['NATO', 'AUKUS', 'FiveEyes', 'Quad', 'US-Japan Treaty', 'US-ROK Treaty'],
    nuclearDeterrence: {
      warheadCount: 5244,
      isTriadCapable: true,
      doctrineStatus: 'GLOBAL_OVERKILL_TRIAD'
    },
    navalProjection: {
      aircraftCarriers: 11,
      nuclearSubmarines: 68,
      blueWaterNavy: true,
      majorCombatantsCount: 292
    },
    chokepointControl: {
      directlyControlled: ['Estrecho de Ormuz (Quinta Flota)', 'Estrecho de Malaca (Séptima Flota)', 'Canal de Panamá (Doctrina Monroe)'],
      vulnerableChokepoints: ['Mar Rojo / Bab el-Mandeb (Ataques drones Asimétricos)'],
      logisticsDominanceScore: 95
    }
  },
  stability: {
    score: 78,
    ruleOfLawScore: 84,
    internalCohesionScore: 58,
    polarizationLevel: 'HIGH',
    coupOrFractureRiskPercent: 8,
    socialUnrestIndex: 42,
    verdict: 'POLARIZED_STRESSED'
  }
};

/**
 * Builds sovereign profile for the United States.
 */
export function buildUnitedStatesProfile(_country?: GeopoliticalCountry): CountrySovereignPowerProfile {
  const baseScores: SovereignRadarScores = { ...SUPERPOWER_BENCHMARKS.US.scores };
  return {
    countryCode: 'US',
    iso3: 'USA',
    nameEs: 'Estados Unidos',
    flag: '🇺🇸',
    baseScores,
    compositePowerIndex: calculateCompositePowerIndex(baseScores),
    geopoliticalLeverageIndex: calculateGeopoliticalLeverage(baseScores),
    defconStatus: DEFCON_LEVELS[4],
    dossiers: structuredClone(US_DOSSIERS)
  };
}
