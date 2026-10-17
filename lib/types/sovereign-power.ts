/**
 * lib/types/sovereign-power.ts
 *
 * Types for the Sovereign Power Spider Chart (Ray Dalio 6 Pillars),
 * Cabinet Intelligence, and Tactical Wargame Simulator.
 * Module M03 (Tasks T03.8 & T03.9).
 */

export type DefconLevel = 1 | 2 | 3 | 4 | 5;

export interface DefconStatus {
  level: DefconLevel;
  codeName: string; // e.g. "COCKED PISTOL", "FAST PACE", "ROUND HOUSE", "DOUBLE TAKE", "FADE OUT"
  color: string;
  badgeBg: string;
  description: string;
}

export type BenchmarkSuperpower = 'US' | 'CN' | 'RU';

export interface SovereignRadarScores {
  techInnovation: number;       // 0-100: Tech & Innovation (Econ, Ind, Mil, Chips, AI)
  politicalCabinet: number;     // 0-100: Political Governance & Cabinet Cohesion
  currencyHegemony: number;     // 0-100: Currency Hegemony, Reserves & Dalio Spread
  tradeCompetitiveness: number; // 0-100: Trade Share, Balance & Tariff Resilience
  militaryCapacity: number;     // 0-100: Defense Budget, Alliances, Nuclear & Navy
  institutionalStability: number;// 0-100: Rule of Law & Internal Social Cohesion
}

export type SovereignDimensionKey = keyof SovereignRadarScores;

export interface WargameShocks {
  defenseShock: number;   // -50 to +50 (% shock to defense budget/mobilization)
  tradeShock: number;     // -50 to +50 (% shock from trade sanctions / tariffs)
  currencyShock: number;  // -50 to +50 (% shock from currency devaluation/rate hikes)
  techShock: number;      // -50 to +50 (% shock from tech embargo / chip sanctions)
}

// ─── 1. Tecnología e Innovación ────────────────────────────────────────────────
export interface TechPillarSubsectors {
  economic: {
    score: number; // 0-100
    label: string;
    technologies: string[];
  };
  industrial: {
    score: number; // 0-100
    label: string;
    technologies: string[];
  };
  military: {
    score: number; // 0-100
    label: string;
    technologies: string[];
  };
  semiconductors: {
    score: number; // 0-100
    label: string;
    fabricationNode: string; // e.g. "<3nm", "5nm", "14nm", "No domestic fab"
    capabilities: string[]; // e.g. ["EUV Lithography", "Fabless Design", "Advanced Packaging"]
  };
  artificialIntelligence: {
    score: number; // 0-100
    label: string;
    computeTier: string; // e.g. "Tier 1: >100k H100 Equivalents"
    models: string[];
  };
}

export interface TechDimensionDossier {
  score: number;
  subsectors: TechPillarSubsectors;
  wipoPatentRank?: number;
  rAndDPercentGdp: number;
  summary: string;
}

// ─── 2. Política y Gabinete ────────────────────────────────────────────────────
export interface CabinetMember {
  id: string;
  role: 'HEAD_OF_STATE' | 'DEFENSE' | 'FINANCE' | 'FOREIGN_SECURITY';
  roleTitleEs: string;
  name: string;
  faction: string;
  doctrine: string;
  bioSnippet: string;
  ideologyAlignment: 'HAWK' | 'TECHNO_DIRIGISTE' | 'FISCAL_ORTHODOX' | 'MODERATE_DIPLOMAT' | 'NATIONALIST_POPULIST';
  stabilityImpact: number; // -10 to +10 impact on base stability
}

export interface CabinetReplacementCandidate {
  id: string;
  targetRole: 'DEFENSE' | 'FINANCE' | 'FOREIGN_SECURITY';
  name: string;
  faction: string;
  doctrine: string;
  bioSnippet: string;
  ideologyAlignment: 'HAWK' | 'TECHNO_DIRIGISTE' | 'FISCAL_ORTHODOX' | 'MODERATE_DIPLOMAT' | 'NATIONALIST_POPULIST';
  impacts: {
    stabilityDelta: number;
    militaryDelta: number;
    currencyDelta: number;
    tradeDelta: number;
    techDelta: number;
    narrativeChange: string;
  };
}

export interface PoliticalCabinetDossier {
  score: number;
  activeDoctrine: string;
  dominantFaction: string;
  factionCohesionLevel: 'COHESIVE' | 'FACTIONAL_FRICTION' | 'INTERNAL_CONTESTATION' | 'ACUTE_CRISIS';
  headOfState: CabinetMember;
  defenseMinister: CabinetMember;
  financeMinister: CabinetMember;
  foreignMinister: CabinetMember;
  availableReplacements: CabinetReplacementCandidate[];
}

// ─── 3. Hegemonía de la Moneda ─────────────────────────────────────────────────
export interface CurrencyHegemonyDossier {
  score: number;
  currencyCode: string;
  currencyName: string;
  isGlobalReserve: boolean;
  globalReserveSharePercent: number; // e.g. 58.4 for USD
  swiftStatus: 'HEGEMON_CONTROLLER' | 'CORE_PARTICIPANT' | 'PERIPHERAL' | 'SANCTIONED_EXCLUDED';
  alternativeRails: string[]; // e.g. ["CIPS", "SPFS", "mBridge", "FedNow"]
  fxReservesBillionUSD: number;
  goldReservesTonnes: number;
  debtToGdpPercent: number;
  dalioSpread: {
    nominalGdpGrowthPercent: number;
    effectiveInterestRatePercent: number;
    spreadPercent: number; // Nominal GDP - EIR
    isBeautifulDeleveraging: boolean;
    verdictEs: string;
  };
  sanctionsVulnerability: 'IMMUNE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

// ─── 4. Comercio y Competitividad ──────────────────────────────────────────────
export interface TradePartnerFlow {
  countryCode: string;
  countryName: string;
  sharePercent: number;
  primaryGoods: string;
}

export interface TradeDimensionDossier {
  score: number;
  tradeBalanceBillionUSD: number; // positive = surplus, negative = deficit
  worldTradeSharePercent: number;
  topExportPartners: TradePartnerFlow[];
  topImportPartners: TradePartnerFlow[];
  tariffVulnerabilityScore: number; // 0-100 (high = vulnerable to foreign protectionism)
  criticalDependencies: string[];
}

// ─── 5. Capacidad Militar ──────────────────────────────────────────────────────
export interface MilitaryCapacityDossier {
  score: number;
  defenseBudgetBillionUSD: number;
  defenseBudgetGdpPercent: number;
  alliances: string[]; // ["NATO", "AUKUS", "CSTO", "BRICS", "FiveEyes", etc.]
  nuclearDeterrence: {
    warheadCount: number;
    isTriadCapable: boolean;
    doctrineStatus: 'GLOBAL_OVERKILL_TRIAD' | 'REGIONAL_SECOND_STRIKE' | 'NON_NUCLEAR_UMBRELLA' | 'UNPROTECTED';
  };
  navalProjection: {
    aircraftCarriers: number;
    nuclearSubmarines: number;
    blueWaterNavy: boolean;
    majorCombatantsCount: number;
  };
  chokepointControl: {
    directlyControlled: string[]; // e.g. ["Estrecho de Ormuz", "Estrecho de Malaca"]
    vulnerableChokepoints: string[];
    logisticsDominanceScore: number; // 0-100
  };
}

// ─── 6. Estabilidad Institucional ──────────────────────────────────────────────
export interface InstitutionalStabilityDossier {
  score: number;
  ruleOfLawScore: number; // 0-100
  internalCohesionScore: number; // 0-100
  polarizationLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  coupOrFractureRiskPercent: number; // 0-100
  socialUnrestIndex: number; // 0-100
  verdict: 'FORTRESS' | 'STABLE_CONSTITUTIONAL' | 'POLARIZED_STRESSED' | 'HIGH_FRACTURE_RISK';
}

// ─── Complete Country Sovereign Profile ─────────────────────────────────────────
export interface CountrySovereignPowerProfile {
  countryCode: string; // ISO2
  iso3: string;
  nameEs: string;
  flag: string;
  baseScores: SovereignRadarScores;
  compositePowerIndex: number; // 0-100 weighted
  geopoliticalLeverageIndex: number; // 0-100 tactical leverage
  defconStatus: DefconStatus;
  dossiers: {
    tech: TechDimensionDossier;
    cabinet: PoliticalCabinetDossier;
    currency: CurrencyHegemonyDossier;
    trade: TradeDimensionDossier;
    military: MilitaryCapacityDossier;
    stability: InstitutionalStabilityDossier;
  };
}

export interface WargameSimulationResult {
  originalScores: SovereignRadarScores;
  warpedScores: SovereignRadarScores;
  originalLeverage: number;
  warpedLeverage: number;
  leverageDelta: number;
  activeShocks: WargameShocks;
  defconStatus: DefconStatus;
  tacticalLogs: string[];
  warpedDalioSpread?: {
    nominalGdpGrowthPercent: number;
    effectiveInterestRatePercent: number;
    spreadPercent: number;
    isBeautifulDeleveraging: boolean;
    verdictEs: string;
  };
}
