import { getCountryRiskInfo } from '@/lib/geographic-data';
import {
  CorporateFacility,
  FacilityFunctionalType,
  FacilityStats,
} from './types';

/**
 * Enriches a facility with geopolitical node risk score (0 - 10) derived from country risk info.
 */
export function enrichFacilityWithGeopoliticalRisk(facility: CorporateFacility): CorporateFacility {
  if (facility.geopoliticalRiskScore !== undefined) {
    return facility;
  }

  const riskInfo = getCountryRiskInfo(facility.countryCode);
  let score = 4.0;
  if (riskInfo) {
    if (riskInfo.classification === 'Bajo') {
      score = riskInfo.embi <= 10 ? 1.0 : riskInfo.embi <= 40 ? 2.0 : 3.0;
    } else if (riskInfo.classification === 'Moderado') {
      score = riskInfo.embi <= 200 ? 4.0 : riskInfo.embi <= 350 ? 5.0 : 6.0;
    } else if (riskInfo.classification === 'Alto') {
      score = riskInfo.embi <= 800 ? 7.0 : 8.0;
    } else if (riskInfo.classification === 'Extremo') {
      score = riskInfo.embi <= 4000 ? 9.0 : 10.0;
    }
  }

  return {
    ...facility,
    geopoliticalRiskScore: score,
  };
}

/**
 * Computes aggregate statistical metrics across a list of facilities.
 */
export function computeFacilityStats(facilities: CorporateFacility[]): FacilityStats {
  if (!facilities || facilities.length === 0) {
    return {
      totalFacilities: 0,
      totalSqFt: 0,
      totalSqMeters: 0,
      ownedCount: 0,
      leasedCount: 0,
      ownedPercentage: 0,
      leasedPercentage: 0,
      byFunctionalType: {
        HQ: 0,
        MANUFACTURING: 0,
        RND: 0,
        LOGISTICS_DATACENTER: 0,
      },
      countryCodes: [],
      averageRiskScore: 0,
    };
  }

  let totalSqFt = 0;
  let totalSqMeters = 0;
  let ownedCount = 0;
  let leasedCount = 0;
  let totalRisk = 0;

  const byFunctionalType: Record<FacilityFunctionalType, number> = {
    HQ: 0,
    MANUFACTURING: 0,
    RND: 0,
    LOGISTICS_DATACENTER: 0,
  };

  const countries = new Set<string>();

  for (const f of facilities) {
    totalSqFt += f.sqFt || 0;
    totalSqMeters += f.sqMeters || 0;
    if (f.tenure === 'OWNED') ownedCount++;
    else leasedCount++;

    if (byFunctionalType[f.functionalType] !== undefined) {
      byFunctionalType[f.functionalType]++;
    }

    if (f.countryCode) {
      countries.add(f.countryCode);
    }

    totalRisk += f.geopoliticalRiskScore ?? 3.5;
  }

  const total = facilities.length;
  const ownedPercentage = Math.round((ownedCount / total) * 100);
  const leasedPercentage = 100 - ownedPercentage;
  const averageRiskScore = Number((totalRisk / total).toFixed(1));

  return {
    totalFacilities: total,
    totalSqFt,
    totalSqMeters,
    ownedCount,
    leasedCount,
    ownedPercentage,
    leasedPercentage,
    byFunctionalType,
    countryCodes: Array.from(countries),
    averageRiskScore,
  };
}
