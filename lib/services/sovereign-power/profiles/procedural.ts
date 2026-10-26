/**
 * lib/services/sovereign-power/profiles/procedural.ts
 *
 * Procedural generation engine for sovereign profiles of uncalibrated nations.
 * Synthesizes 6-pillar dossiers and realistic cabinet ministers based on
 * country regional blocs, baseline sovereign risk (1-10), and strategic role.
 */

import { 
  CountrySovereignPowerProfile, 
  SovereignRadarScores,
  TechDimensionDossier,
  CurrencyHegemonyDossier,
  TradeDimensionDossier,
  MilitaryCapacityDossier,
  InstitutionalStabilityDossier
} from '../../../types/sovereign-power';
import { GeopoliticalCountry } from '../../../data/geopolitical-countries';
import { DEFCON_LEVELS } from '../benchmarks';
import { calculateCompositePowerIndex, calculateGeopoliticalLeverage } from '../calculations';
import { buildProceduralCabinetDossier } from './procedural-cabinet';

import { getCountryTechTreeAt, isPilotCountryCode } from '../../../data/tech-tree';

function buildProceduralTechDossier(country: GeopoliticalCountry): TechDimensionDossier {
  if (isPilotCountryCode(country.code)) {
    const tree = getCountryTechTreeAt(country.code, 2026);
    const semiNodes = tree.areas.semiconductors.nodos.filter((n) => n.estado !== 'no_alcanzado');
    const highestSemi = semiNodes[semiNodes.length - 1];
    return {
      score: tree.scoreTecnologico,
      hasVerifiedTechTree: true,
      blockedNodesCount: tree.nodosBloqueadosPorSancion.length,
      subsectors: {
        economic: { score: 0, label: 'Eliminado (Finanzas Públicas)', technologies: [] },
        industrial: {
          score: tree.areas.robotics_manufacturing.scoreArea,
          label: 'Robótica y Manufactura Avanzada',
          technologies: tree.areas.robotics_manufacturing.nodos
            .filter((n) => n.estado !== 'no_alcanzado')
            .map((n) => n.nombre),
        },
        military: {
          score: tree.areas.defense_missiles_drones.scoreArea,
          label: 'Defensa (Misiles y Drones)',
          technologies: tree.areas.defense_missiles_drones.nodos
            .filter((n) => n.estado !== 'no_alcanzado')
            .map((n) => n.nombre),
        },
        semiconductors: {
          score: tree.areas.semiconductors.scoreArea,
          label: 'Semiconductores',
          fabricationNode: highestSemi ? `${highestSemi.nombre} (${highestSemi.estado})` : 'Sin datos verificados',
          capabilities: semiNodes.map((n) => n.resumen || n.nombre),
        },
        artificialIntelligence: {
          score: tree.areas.ai_compute.scoreArea,
          label: 'IA y Cómputo',
          computeTier: `Nivel ${tree.areas.ai_compute.maxNivelAlcanzado}/5`,
          models: tree.areas.ai_compute.nodos
            .filter((n) => n.estado !== 'no_alcanzado')
            .map((n) => n.nombre),
        },
      },
      rAndDPercentGdp: 2.3,
      summary: `Perfil tecnológico verificado en el piloto histórico (${country.nameEs}).`,
    };
  }

  return {
    score: 0,
    hasVerifiedTechTree: false,
    blockedNodesCount: 0,
    subsectors: {
      economic: { score: 0, label: 'Sin datos verificados', technologies: [] },
      industrial: { score: 0, label: 'Sin datos verificados', technologies: [] },
      military: { score: 0, label: 'Sin datos verificados', technologies: [] },
      semiconductors: {
        score: 0,
        label: 'Sin datos verificados',
        fabricationNode: 'Sin datos verificados para este país',
        capabilities: [],
      },
      artificialIntelligence: {
        score: 0,
        label: 'Sin datos verificados',
        computeTier: 'Sin datos verificados para este país',
        models: [],
      },
    },
    rAndDPercentGdp: 0,
    summary: 'Sin datos verificados para este país',
  };
}

function buildProceduralCurrencyDossier(
  country: GeopoliticalCountry, 
  currencyScore: number, 
  riskFactor: number
): CurrencyHegemonyDossier {
  return {
    score: currencyScore,
    currencyCode: `${country.code}X`,
    currencyName: `Divisa Nacional de ${country.nameEs}`,
    isGlobalReserve: false,
    globalReserveSharePercent: 0.1,
    swiftStatus: 'CORE_PARTICIPANT',
    alternativeRails: [],
    fxReservesBillionUSD: Math.round(50 + (10 - riskFactor) * 20),
    goldReservesTonnes: Math.round(10 + (10 - riskFactor) * 15),
    debtToGdpPercent: Math.round(40 + riskFactor * 6),
    dalioSpread: {
      nominalGdpGrowthPercent: 3.5,
      effectiveInterestRatePercent: 4.0,
      spreadPercent: -0.5,
      isBeautifulDeleveraging: false,
      verdictEs: 'Spread Dalio neutro/levemente restrictivo.'
    },
    sanctionsVulnerability: riskFactor > 6 ? 'HIGH' : 'LOW'
  };
}

function buildProceduralTradeDossier(tradeScore: number, riskFactor: number): TradeDimensionDossier {
  return {
    score: tradeScore,
    tradeBalanceBillionUSD: 5.0,
    worldTradeSharePercent: 1.0,
    topExportPartners: [
      { countryCode: 'US', countryName: 'EE. UU.', sharePercent: 22.0, primaryGoods: 'Bienes y materias primas' },
      { countryCode: 'CN', countryName: 'China', sharePercent: 18.0, primaryGoods: 'Minerales y manufacturas' }
    ],
    topImportPartners: [
      { countryCode: 'CN', countryName: 'China', sharePercent: 24.0, primaryGoods: 'Maquinaria y electrónica' },
      { countryCode: 'US', countryName: 'EE. UU.', sharePercent: 15.0, primaryGoods: 'Bienes intermedios' }
    ],
    tariffVulnerabilityScore: Math.round(riskFactor * 8),
    criticalDependencies: ['Insumos tecnológicos avanzados', 'Bienes de capital']
  };
}

function buildProceduralMilitaryDossier(
  country: GeopoliticalCountry, 
  militaryScore: number, 
  riskFactor: number
): MilitaryCapacityDossier {
  return {
    score: militaryScore,
    defenseBudgetBillionUSD: Math.round(5 + (10 - riskFactor) * 3),
    defenseBudgetGdpPercent: 1.8,
    alliances: country.blocs,
    nuclearDeterrence: {
      warheadCount: 0,
      isTriadCapable: false,
      doctrineStatus: 'NON_NUCLEAR_UMBRELLA'
    },
    navalProjection: {
      aircraftCarriers: 0,
      nuclearSubmarines: 0,
      blueWaterNavy: false,
      majorCombatantsCount: 8
    },
    chokepointControl: {
      directlyControlled: [],
      vulnerableChokepoints: ['Rutas comerciales oceánicas'],
      logisticsDominanceScore: 30
    }
  };
}

function buildProceduralStabilityDossier(stabilityScore: number, riskFactor: number): InstitutionalStabilityDossier {
  return {
    score: stabilityScore,
    ruleOfLawScore: stabilityScore,
    internalCohesionScore: stabilityScore,
    polarizationLevel: riskFactor > 5 ? 'HIGH' : 'LOW',
    coupOrFractureRiskPercent: Math.round(riskFactor * 3),
    socialUnrestIndex: Math.round(riskFactor * 6),
    verdict: riskFactor <= 3 ? 'FORTRESS' : riskFactor <= 6 ? 'STABLE_CONSTITUTIONAL' : 'HIGH_FRACTURE_RISK'
  };
}

/**
 * Procedural generation for any sovereign nation without custom handcrafted profile.
 */
export function buildProceduralProfile(country: GeopoliticalCountry): CountrySovereignPowerProfile {
  console.log(`[SovereignPowerService] Building procedural profile for ${country.nameEs} (${country.code})`);

  const riskFactor = country.sovereignRiskBase;
  const isNato = country.blocs.includes('NATO');
  const isBrics = country.blocs.includes('BRICS');
  const isFiveEyes = country.blocs.includes('FiveEyes');
  const isEU = country.blocs.includes('EU');

  const stabilityScore = Math.round(Math.max(10, Math.min(95, 100 - (riskFactor * 8.5))));
  const militaryScore = Math.round(Math.max(15, Math.min(85, (isNato ? 65 : isBrics ? 60 : 35) + (10 - riskFactor) * 2)));
  const techDossier = buildProceduralTechDossier(country);
  const techScore = isPilotCountryCode(country.code)
    ? techDossier.score
    : Math.round(Math.max(15, Math.min(90, (isFiveEyes ? 80 : isEU ? 75 : 40) + (10 - riskFactor) * 3)));
  const currencyScore = Math.round(Math.max(15, Math.min(80, (isEU ? 75 : 35) + (10 - riskFactor) * 2.5)));
  const tradeScore = Math.round(Math.max(20, Math.min(88, 50 + (10 - riskFactor) * 3)));
  const cabinetScore = Math.round(Math.max(20, Math.min(85, stabilityScore * 0.9)));

  const baseScores: SovereignRadarScores = {
    techInnovation: techScore,
    politicalCabinet: cabinetScore,
    currencyHegemony: currencyScore,
    tradeCompetitiveness: tradeScore,
    militaryCapacity: militaryScore,
    institutionalStability: stabilityScore
  };

  return {
    countryCode: country.code,
    iso3: country.iso3,
    nameEs: country.nameEs,
    flag: country.flag,
    baseScores,
    compositePowerIndex: calculateCompositePowerIndex(baseScores),
    geopoliticalLeverageIndex: calculateGeopoliticalLeverage(baseScores),
    defconStatus: DEFCON_LEVELS[riskFactor > 6 ? 2 : riskFactor > 4 ? 3 : 4],
    dossiers: {
      tech: techDossier,
      cabinet: buildProceduralCabinetDossier(country, cabinetScore, riskFactor),
      currency: buildProceduralCurrencyDossier(country, currencyScore, riskFactor),
      trade: buildProceduralTradeDossier(tradeScore, riskFactor),
      military: buildProceduralMilitaryDossier(country, militaryScore, riskFactor),
      stability: buildProceduralStabilityDossier(stabilityScore, riskFactor)
    }
  };
}
