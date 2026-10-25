/**
 * lib/services/territorial-claims/claims-store.ts
 *
 * Server-side loader for compact territorial claims registry (lib/data/territorial-claims/claims.json).
 */

import fs from 'fs';
import path from 'path';
import type {
  TerritorialClaim,
  TerritorialClaimsFile,
  CountryClaimsPayload,
  ThirdPartyStance
} from './types';

const DATA_FILE = path.join(process.cwd(), 'lib', 'data', 'territorial-claims', 'claims.json');
let cache: TerritorialClaimsFile | null = null;

export function loadClaimsFile(file: string = DATA_FILE): TerritorialClaimsFile | null {
  if (cache) return cache;
  try {
    cache = JSON.parse(fs.readFileSync(file, 'utf8')) as TerritorialClaimsFile;
    return cache;
  } catch {
    return null;
  }
}

export function resetClaimsCache(): void {
  cache = null;
}

export function getAllClaims(data: TerritorialClaimsFile | null = loadClaimsFile()): TerritorialClaim[] {
  return data?.claims ?? [];
}

export function getClaimById(id: string, data: TerritorialClaimsFile | null = loadClaimsFile()): TerritorialClaim | undefined {
  return data?.claims.find(c => c.id === id);
}

function getEntityCode(val: string | { entity: string } | undefined | null): string {
  if (!val) return '';
  return typeof val === 'string' ? val.toUpperCase() : val.entity.toUpperCase();
}

/**
 * Returns claims relevant to a specific country, split by role:
 * - asAdmin: country is the administering entity
 * - asClaimant: country is one of the claimants
 * - asThirdParty: country has an official stance on this claim
 */
export function getClaimsForCountry(
  code: string,
  data: TerritorialClaimsFile | null = loadClaimsFile()
): CountryClaimsPayload | null {
  if (!data) return null;
  const c = code.trim().toUpperCase();

  const asAdmin: TerritorialClaim[] = [];
  const asClaimant: TerritorialClaim[] = [];
  const asThirdParty: { claim: TerritorialClaim; stance: ThirdPartyStance }[] = [];

  for (const claim of data.claims) {
    const adminCode = getEntityCode(claim.administeredBy);
    const claimantCodes = claim.claimants.map(cl => getEntityCode(cl));

    if (adminCode === c) {
      asAdmin.push(claim);
    }
    if (claimantCodes.includes(c)) {
      asClaimant.push(claim);
    }

    if (claim.thirdParty) {
      const tp = claim.thirdParty.find(s => s.country.toUpperCase() === c);
      if (tp) {
        asThirdParty.push({ claim, stance: tp });
      }
    }
  }

  const total = asAdmin.length + asClaimant.length + asThirdParty.length;
  return {
    country: c,
    asAdmin,
    asClaimant,
    asThirdParty,
    total
  };
}

/**
 * Returns claims linking two countries (either admin vs claimant, co-claimants, or third-party dispute).
 */
export function getClaimsForPair(
  a: string,
  b: string,
  data: TerritorialClaimsFile | null = loadClaimsFile()
): TerritorialClaim[] {
  if (!data) return [];
  const codeA = a.trim().toUpperCase();
  const codeB = b.trim().toUpperCase();

  return data.claims.filter(claim => {
    const adminCode = getEntityCode(claim.administeredBy);
    const claimantCodes = claim.claimants.map(cl => getEntityCode(cl));

    const aInvolved = adminCode === codeA || claimantCodes.includes(codeA);
    const bInvolved = adminCode === codeB || claimantCodes.includes(codeB);

    return aInvolved && bInvolved;
  });
}
