/**
 * lib/services/sovereign-power/profiles/russia.ts
 *
 * Detailed sovereign power profile for Russia (RU).
 * Calibrated data across all 6 Ray Dalio pillars and cabinet intelligence.
 */

import { 
  CountrySovereignPowerProfile, 
  SovereignRadarScores
} from '../../../types/sovereign-power';
import { GeopoliticalCountry } from '../../../data/geopolitical-countries';
import { SUPERPOWER_BENCHMARKS, DEFCON_LEVELS } from '../benchmarks';
import { calculateCompositePowerIndex, calculateGeopoliticalLeverage } from '../calculations';

const RU_DOSSIERS: CountrySovereignPowerProfile['dossiers'] = {
  tech: {
    score: 65,
    subsectors: {
      economic: { score: 55, label: 'Economía de Guerra & Cripto', technologies: ['Mir Payment Card', 'SPFS Messaging', 'Mecanismos de compensación en Yuan y Oro'] },
      industrial: { score: 70, label: 'Industria Pesada & Metalúrgica', technologies: ['Producción masiva de proyectiles de artillería', 'Titanio y turbinas nucleares'] },
      military: { score: 94, label: 'Capacidad Bélica & Misiles', technologies: ['Misiles Hipersónicos Kinzhal y Zircon', 'S-400 / S-500 Defensa Aérea', 'Guerra Electrónica Krasukha-4'] },
      semiconductors: { score: 28, label: 'Dependencia Severa de Chips', fabricationNode: '65nm-90nm Doméstico (Mikron) / Contrabando de Chips de Consumo', capabilities: ['Ingeniería inversa', 'Importaciones grises vía Asia Central'] },
      artificialIntelligence: { score: 62, label: 'IA Militar Asimétrica', computeTier: 'Tier 3: Supercomputadores Yandex / Sberbank restringidos', models: ['YandexGPT / GigaChat', 'Drones suicidas Lancet con visión terminal'] }
    },
    wipoPatentRank: 8,
    rAndDPercentGdp: 0.94,
    summary: 'Superpotencia en física nuclear, guerra electrónica y artillería con extrema debilidad en microelectrónica civil y bienes de consumo.'
  },
  cabinet: {
    score: 78,
    activeDoctrine: 'Eurasianismo Militar & Confrontación Antagónica con Occidente',
    dominantFaction: 'Siloviki (Aparato de Seguridad y Defensa)',
    factionCohesionLevel: 'COHESIVE',
    headOfState: {
      id: 'ru_leader',
      role: 'HEAD_OF_STATE',
      roleTitleEs: 'Presidente de la Federación Rusa',
      name: 'Vladimir Putin',
      faction: 'Vertical de Poder Kremlin',
      doctrine: 'Soberanía Absoluta & Rechazo del Orden Unipolar',
      bioSnippet: 'Control unificado del estado, movilización de recursos bélicos y disuasión nuclear continua.',
      ideologyAlignment: 'HAWK',
      stabilityImpact: 6
    },
    defenseMinister: {
      id: 'ru_defmin',
      role: 'DEFENSE',
      roleTitleEs: 'Ministro de Defensa',
      name: 'Andrey Belousov',
      faction: 'Tecnócratas del Gosplán Militar',
      doctrine: 'Keynesianismo Militar & Auditoría Severa de Costes del Frente',
      bioSnippet: 'Economista civil nombrado para maximizar la eficiencia industrial bélica y erradicar la corrupción en contratos.',
      ideologyAlignment: 'TECHNO_DIRIGISTE',
      stabilityImpact: 5
    },
    financeMinister: {
      id: 'ru_finmin',
      role: 'FINANCE',
      roleTitleEs: 'Ministro de Finanzas',
      name: 'Anton Siluanov',
      faction: 'Conservadurismo Presupuestario Resistente',
      doctrine: 'Presupuesto Equilibrado & Financiación del Esfuerzo Bélico sin Hiperinflación',
      bioSnippet: 'Supervisa el Fondo Nacional de Bienestar y la absorción de sanciones financieras occidentales.',
      ideologyAlignment: 'FISCAL_ORTHODOX',
      stabilityImpact: 4
    },
    foreignMinister: {
      id: 'ru_diplo',
      role: 'FOREIGN_SECURITY',
      roleTitleEs: 'Ministro de Asuntos Exteriores',
      name: 'Sergey Lavrov',
      faction: 'Diplomacia Clásica de Guerra Fría',
      doctrine: 'Forja del Eje Anti-Hegemónico en África, Asia y BRICS',
      bioSnippet: 'Decano de la diplomacia mundial, promotor de acuerdos de trueque comercial y venta de armas en el Sur Global.',
      ideologyAlignment: 'HAWK',
      stabilityImpact: 4
    },
    availableReplacements: [
      {
        id: 'ru_rep_hardliner_security',
        targetRole: 'FOREIGN_SECURITY',
        name: 'Nikolai Patrushev',
        faction: 'Halcones de Inteligencia KGB/FSB',
        doctrine: 'Guerra Asimétrica Total & Sabotaje de Infraestructura Submarina',
        bioSnippet: 'Estratega de seguridad nacional que aboga por guerra híbrida ilimitada en el hemisferio occidental.',
        ideologyAlignment: 'HAWK',
        impacts: {
          stabilityDelta: -2,
          militaryDelta: 6,
          currencyDelta: -5,
          tradeDelta: -8,
          techDelta: 0,
          narrativeChange: 'Escalada extrema en operaciones encubiertas y amenazas de primer uso nuclear.'
        }
      }
    ]
  },
  currency: {
    score: 42,
    currencyCode: 'RUB',
    currencyName: 'Rublo Ruso',
    isGlobalReserve: false,
    globalReserveSharePercent: 0.1,
    swiftStatus: 'SANCTIONED_EXCLUDED',
    alternativeRails: ['SPFS (Sistema de Transferencia de Mensajes Financieros)', 'Acuerdos de Liquidación Rublo-Yuan / Rublo-Rupia'],
    fxReservesBillionUSD: 300,
    goldReservesTonnes: 2332.7,
    debtToGdpPercent: 18.2,
    dalioSpread: {
      nominalGdpGrowthPercent: 7.5,
      effectiveInterestRatePercent: 19.0,
      spreadPercent: -11.5,
      isBeautifulDeleveraging: false,
      verdictEs: 'Spread Dalio profundamente negativo (-11.50%). Tasa de interés oficial del 19-21% estrangula el crédito civil no militar.'
    },
    sanctionsVulnerability: 'CRITICAL'
  },
  trade: {
    score: 60,
    tradeBalanceBillionUSD: 140.0,
    worldTradeSharePercent: 2.2,
    topExportPartners: [
      { countryCode: 'CN', countryName: 'China', sharePercent: 32.0, primaryGoods: 'Petróleo crudo ESPO, gas, carbón, madera' },
      { countryCode: 'IN', countryName: 'India', sharePercent: 18.5, primaryGoods: 'Crudo Urals a descuento, fertilizantes' },
      { countryCode: 'TR', countryName: 'Turquía', sharePercent: 8.0, primaryGoods: 'Gas natural, metales, cereales' }
    ],
    topImportPartners: [
      { countryCode: 'CN', countryName: 'China', sharePercent: 42.0, primaryGoods: 'Vehículos, electrónica, maquinaria industrial' },
      { countryCode: 'BY', countryName: 'Bielorrusia', sharePercent: 9.0, primaryGoods: 'Maquinaria pesada, lácteos' }
    ],
    tariffVulnerabilityScore: 84,
    criticalDependencies: ['Microchips occidentales para guiado de precisión', 'Maquinaria y rodamientos industriales de alta precisión', 'Químicos farmacéuticos']
  },
  military: {
    score: 92,
    defenseBudgetBillionUSD: 142.0,
    defenseBudgetGdpPercent: 6.2,
    alliances: ['CSTO (Collective Security Treaty Org)', 'Unión Estatal Rusia-Bielorrusia'],
    nuclearDeterrence: {
      warheadCount: 5580,
      isTriadCapable: true,
      doctrineStatus: 'GLOBAL_OVERKILL_TRIAD'
    },
    navalProjection: {
      aircraftCarriers: 0,
      nuclearSubmarines: 32,
      blueWaterNavy: true,
      majorCombatantsCount: 220
    },
    chokepointControl: {
      directlyControlled: ['Ruta Marítima del Norte (Ártico)', 'Estrecho de Kerch (Mar de Azov)'],
      vulnerableChokepoints: ['Paso del Bósforo (Controlado por Turquía/OTAN)', 'Estrechos Daneses (Mar Báltico)'],
      logisticsDominanceScore: 72
    }
  },
  stability: {
    score: 64,
    ruleOfLawScore: 32,
    internalCohesionScore: 72,
    polarizationLevel: 'MODERATE',
    coupOrFractureRiskPercent: 14,
    socialUnrestIndex: 38,
    verdict: 'POLARIZED_STRESSED'
  }
};

/**
 * Builds sovereign profile for Russia.
 */
export function buildRussiaProfile(_country?: GeopoliticalCountry): CountrySovereignPowerProfile {
  const baseScores: SovereignRadarScores = { ...SUPERPOWER_BENCHMARKS.RU.scores };
  return {
    countryCode: 'RU',
    iso3: 'RUS',
    nameEs: 'Rusia',
    flag: '🇷🇺',
    baseScores,
    compositePowerIndex: calculateCompositePowerIndex(baseScores),
    geopoliticalLeverageIndex: calculateGeopoliticalLeverage(baseScores),
    defconStatus: DEFCON_LEVELS[2],
    dossiers: structuredClone(RU_DOSSIERS)
  };
}
