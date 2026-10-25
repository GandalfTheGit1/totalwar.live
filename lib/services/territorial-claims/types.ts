/**
 * lib/services/territorial-claims/types.ts
 *
 * Types for reviewed territorial claims registry and country stances.
 */

export type ClaimStatus = 'latent' | 'frozen' | 'active' | 'militarized' | 'occupied' | 'resolved';

export type ClaimSalience = 'core' | 'major' | 'minor';

export type ClaimKind = 'land' | 'island' | 'maritime' | 'breakaway';

export interface ThirdPartyStance {
  country: string;
  stance: 'supports_administrator' | 'supports_claimant' | 'opposes_claimant' | 'opposes_administrator';
  since?: string | null;
  note?: string;
}

export interface TerritorialClaim {
  id: string;
  nameEs: string;
  nameEn: string;
  kind: ClaimKind;
  administeredBy: string | { entity: string; note?: string };
  claimants: (string | { entity: string; note?: string })[];
  status: ClaimStatus;
  salience: ClaimSalience;
  since?: string | null;
  statusSince?: string | null;
  resolvedOn?: string | null;
  thirdParty?: ThirdPartyStance[];
  lat?: number;
  lng?: number;
}

export interface ExcludedEntity {
  id: string;
  name: string;
  reason: string;
  pairs: string[];
}

export interface TerritorialClaimsFile {
  claims: TerritorialClaim[];
  excluded: ExcludedEntity[];
}

export interface CountryClaimsPayload {
  country: string;
  asAdmin: TerritorialClaim[];
  asClaimant: TerritorialClaim[];
  asThirdParty: { claim: TerritorialClaim; stance: ThirdPartyStance }[];
  total: number;
}
