/**
 * @file types.ts
 * @description Type definitions for the Geopolitical Risk and Value Network Monitor.
 */

export type RiskLevel = 'safe' | 'warning' | 'critical';

export type AIExposureLevel = 'Alta' | 'Media' | 'Baja';

export type RelationType = 
  | 'ALLIED' 
  | 'STRATEGIC_ALLY' 
  | 'ECONOMIC_PARTNER' 
  | 'NEUTRAL_COMMERCIAL' 
  | 'FRICTION_STRATEGIC_COMPETITION' 
  | 'SANCTIONED_ADVERSARIAL'
  | 'ally' | 'conflict' | 'neutral'; // Legacy fallback

// ─── Thematic Layers (T03.2) ──────────────────────────────────────────────────
export type ThematicLayer = 'none' | 'tier-n' | 'resources' | 'maritime' | 'footprint';

export interface ThematicLayerCountryData {
  countryCode: string; // ISO-2 o ISO-3 compatible
  intensity: number; // 0 a 100
  label: string;
  sublabel?: string;
  colorCategory: 'critical' | 'high' | 'medium' | 'low' | 'none';
}

export type ThematicLayerMap = Record<string, ThematicLayerCountryData>;

// ─── Macro / Dalio Layer ───────────────────────────────────────────────────────
// Mirrors the payload returned by GET /api/macro/[country] + calculateDalioDebtCycle()

export interface DalioRule {
  status: 'ok' | 'warning' | 'breach' | 'unknown';
  label: string;
  detail: string;
}

export interface DalioDebtCycleSnapshot {
  shortTermCyclePhase: string;
  longTermCyclePhase: string;
  productivityGrowthTrend: string;
  levers: {
    austerity: number;
    debtReduction: number;
    wealthRedistribution: number;
    moneyPrinting: number;
  };
  deleveragingStatus: string;
  dalioCommentary: string;
  dataConfidence?: 'high' | 'medium' | 'low' | 'none';
  intensity?: number;
  effectiveInterestRate?: string;
  dalioRules?: {
    rule1: DalioRule; // ΔDebt ≤ ΔNominal GDP
    rule2: DalioRule; // Income ≥ Productivity trend
    rule3: DalioRule; // Nominal GDP > Effective Interest Rate (r vs g)
  };
  yieldCurveSignal?: 'normal' | 'flattening' | 'inverted' | 'unknown';
  dalioFormula?: {
    nominalGdpGrowth: number | null;
    effectiveInterestRateNum: number | null;
    spread: number | null;
    isBeautiful: boolean;
  };
}

/**
 * Real macroeconomic data fetched from /api/macro/[iso] and stored per
 * country click in the hook's macroCache map.
 */
export interface CountryMacroData {
  // === Short-cycle diagnostics (Sections 7-8 of the Dalio framework doc) ===
  gdpGrowth: string;                // e.g. "+2.10%"
  gdpGrowthPrevious: string;
  inflation: string;                // CPI / Inflation Rate
  inflationPrevious: string;
  interestRate: string;             // Central Bank policy rate
  interestRatePrevious: string;
  m2Growth: string;                 // M2 Money Supply YoY
  yieldSpread10Y2Y: string;         // Raw spread value
  yieldCurveStatus: string;         // Human-readable with ⚠️ emoji if inverted
  consumerCreditGrowth: string;     // Crédito al consumo YoY
  businessLoansGrowth: string;      // Préstamos comerciales e industriales YoY
  debtToGdp: string;                // Government Debt / GDP
  unemployment: string;
  gdpPerCapita: string;
  // === Dalio model output ===
  dalioDebtCycle: DalioDebtCycleSnapshot;
  dataConfidence: 'high' | 'medium' | 'low' | 'none';
  tradingEconomicsSlug?: string;
  fetchedAt?: string;
}

export interface CountryRiskInfo {
  name: string;
  iso: string;
  risk: number;
  friction: string;
  aiExposure: AIExposureLevel;
  baseColor: string;
  baseStroke: string;
  indicator: string;
  textClass: string;
  pmiManufacturing?: number;
  pmiServices?: number;
  pmiComposite?: number;
  pmiTrend?: 'expansion' | 'contraction' | 'neutral';
  pmiReportDate?: string;
}

export interface GeoFeature {
  type: string;
  polyId: string;
  properties: {
    ADMIN: string;
    ISO_A3: string;
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: any[];
  };
}

export interface RelationItem {
  type: RelationType;
  polygon: GeoFeature;
  frictionScore?: number;
  tariffRisk?: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  chokepointRisk?: boolean;
  summaryNote?: string;
}

export type ActiveRelationsMap = Record<string, RelationItem>;

export type CountryMockDataMap = Record<string, CountryRiskInfo>;

export interface RiskAppearance {
  color: string;
  stroke: string;
  indicator: string;
  textClass: string;
}

export interface CentroidCoordinates {
  lat: number;
  lng: number;
}

// ─── SEC Item 2 Corporate Facilities (T03.1) ──────────────────────────────────
export type {
  CorporateFacility,
  FacilityFunctionalType,
  FacilityTenure,
} from '@/lib/services/geographic/sec-properties-service';
export { FACILITY_TYPE_CONFIG } from '@/lib/services/geographic/sec-properties-service';

// ─── Friendshoring & Substitution Arcs (T03.4) ────────────────────────────────
export type {
  SubstitutionArc,
  CriticalCommodityKey,
  CriticalCommodityProfile,
} from '@/lib/services/geographic/friendshoring-service';

// ─── Maritime Chokepoints & Trade Routes (T03.5) ──────────────────────────────
export type {
  MaritimeChokepointId,
  MaritimeIndustrySector,
  StrategicChokepointDefinition,
  IndustrySectorProfile,
  ReroutingAlternative,
  ChokepointSimulationInput,
  ChokepointStatusDetail,
  MaritimeSimulationResult,
  MaritimeTradeRoute,
  JitStarvationRiskLevel,
} from '@/lib/services/maritime-chokepoint-service';
export {
  STRATEGIC_CHOKEPOINTS,
  CHOKEPOINT_LIST,
  SECTOR_PROFILES,
  GLOBAL_MARITIME_ROUTES,
  CHOKEPOINT_PRESETS,
  MaritimeChokepointService,
} from '@/lib/services/maritime-chokepoint-service';

