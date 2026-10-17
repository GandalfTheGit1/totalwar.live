/**
 * lib/services/geopolitical/types.ts
 *
 * Core domain contracts and interfaces for geopolitical risk intelligence,
 * including Hard Country Index (HCI) tiers, sanctions profiles, and Tier-N BOM evaluations.
 */

import { BilateralEdge as RawBilateralEdge, GeopoliticalStance } from '../../../scripts/seed_geopolitical_matrix';

export interface BilateralEdge extends RawBilateralEdge {
  colonialLegacyModifier?: number;
}

export type HardCountryTier =
  | 'EXTREME_HOSTILE'
  | 'STRATEGIC_ADVERSARIAL'
  | 'HIGH_FRICTION_NEUTRAL'
  | 'STABLE_COOPERATIVE';

export interface SanctionsProfile {
  level: 'COMPREHENSIVE' | 'SECTORAL' | 'TARGETED' | 'NONE';
  score: number; // 0 - 100
  regimes: string[];
  description: string;
}

export interface HardCountryProfile {
  countryCode: string;
  iso3: string;
  countryName: string;
  flag: string;
  region: string;
  hardCountryIndex: number; // HCI: 0 - 100
  tier: HardCountryTier;
  targetCountry?: string;
  sanctionsScore: number;
  sanctionsDetail: SanctionsProfile;
  sovereignRiskScore: number; // 0 - 100
  autocraticNature: boolean;
  bilateralFrictionScore: number; // 0 - 100
  bilateralStance?: GeopoliticalStance;
  primaryRiskDrivers: string[];
  isHardCountry: boolean;
}

export interface TierNInputPayload {
  componentName: string;
  originCountry: string; // ISO-2, ISO-3 or country name
  tier: number;          // 1, 2, 3..N
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  substitutability?: number; // 0.0 (irreplaceable) to 1.0 (commodity)
  sharePercentage?: number;  // 0 - 100
}

export interface HardCountryBottleneck {
  componentName: string;
  originCountry: string;
  originCountryName: string;
  originFlag: string;
  tier: number;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  substitutability: number;
  sharePercentage: number;
  hardCountryIndex: number;
  tierClassification: HardCountryTier;
  componentRiskScore: number;
  isLeakage: boolean; // tier >= 2 in Hard Country
  reason: string;
  mitigation: string;
}

export interface MitigationStrategy {
  category: 'FRIENDSHORING_T03_4' | 'INVENTORY_BUFFER_HOI4_T03_19' | 'SUPPLIER_DIVERSIFICATION';
  title: string;
  description: string;
  affectedComponents: string[];
  priority: 'URGENT' | 'HIGH' | 'MEDIUM';
}

export interface HighestRiskOrigin {
  countryCode: string;
  countryName: string;
  flag: string;
  hci: number;
  tier: HardCountryTier;
  inputCount: number;
  totalShare: number;
}

export interface TierNEvaluationResult {
  compositeExposureScore: number; // 0 - 100
  exposureLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  totalInputsEvaluated: number;
  hardCountryBottlenecks: HardCountryBottleneck[];
  tierNLeakages: HardCountryBottleneck[];
  highestRiskOrigins: HighestRiskOrigin[];
  mitigationStrategies: MitigationStrategy[];
  summaryAudit: string;
}

export interface HardCountryCuratedData {
  sanctions: SanctionsProfile;
  sovereignRiskBase: number;
  autocracy: boolean;
  globalFrictionScore: number; // 0 - 10
  stance: GeopoliticalStance;
}
