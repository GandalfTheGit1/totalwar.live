/**
 * components/dev/geopolitical-monitor/hooks/monitor/points-builder.ts
 *
 * Computes point entities (corporate facilities and maritime chokepoints) for 2D/3D maps.
 */

import { ThematicLayer, CorporateFacility, FACILITY_TYPE_CONFIG, GeoFeature } from '../../types';
import { MaritimeChokepointId, CHOKEPOINT_LIST } from '@/lib/services/maritime-chokepoint-service';
import claimsData from '@/lib/data/territorial-claims/claims.json';

const STATUS_CLAIM_COLOR: Record<string, string> = {
  occupied: '#f43f5e',
  militarized: '#f97316',
  active: '#eab308',
  latent: '#06b6d4',
  frozen: '#64748b',
  resolved: '#10b981',
};

function isClaimInvolved(claim: any, iso: string): boolean {
  const admin = typeof claim.administeredBy === 'string' ? claim.administeredBy : claim.administeredBy?.entity;
  if (admin?.toUpperCase() === iso) return true;
  for (const cl of claim.claimants || []) {
    const clCode = typeof cl === 'string' ? cl : cl?.entity;
    if (clCode?.toUpperCase() === iso) return true;
  }
  if (claim.thirdParty?.some((tp: any) => tp.country?.toUpperCase() === iso)) return true;
  return false;
}

export function computeMonitorPoints(
  activeLayer: ThematicLayer,
  facilities: CorporateFacility[],
  selectedFacility: CorporateFacility | null,
  showMaritimeRoutes: boolean,
  blockedChokepoints: MaritimeChokepointId[],
  activeMode?: string,
  selectedCountry?: GeoFeature | null
): any[] {
  const list: any[] = [];

  if (activeMode === 'claims') {
    const selectedIso = selectedCountry?.polyId?.toUpperCase();
    claimsData.claims.forEach((c: any) => {
      if (c.lat != null && c.lng != null) {
        const involved = selectedIso ? isClaimInvolved(c, selectedIso) : true;
        list.push({
          ...c,
          pointType: 'claim',
          lat: c.lat,
          lng: c.lng,
          color: STATUS_CLAIM_COLOR[c.status] || '#06b6d4',
          altitude: selectedIso && involved ? 0.05 : 0.03,
          radius: selectedIso && involved ? 0.85 : selectedIso ? 0.4 : 0.65,
        });
      }
    });
  }

  if (activeLayer === 'footprint' && facilities && facilities.length > 0) {
    facilities.forEach((f) => {
      list.push({
        ...f,
        pointType: 'facility',
        color: FACILITY_TYPE_CONFIG[f.functionalType]?.hexColor || '#38bdf8',
        altitude: selectedFacility?.id === f.id ? 0.06 : 0.03,
        radius: selectedFacility?.id === f.id ? 0.8 : 0.55,
      });
    });
  }

  if (showMaritimeRoutes || activeLayer === 'maritime') {
    const blockedSet = new Set(blockedChokepoints || []);
    CHOKEPOINT_LIST.forEach((cp) => {
      const isBlocked = blockedSet.has(cp.id);
      list.push({
        ...cp,
        pointType: 'chokepoint',
        lat: cp.coordinates.lat,
        lng: cp.coordinates.lng,
        color: isBlocked ? '#ef4444' : '#38bdf8',
        altitude: isBlocked ? 0.05 : 0.035,
        radius: isBlocked ? 0.85 : 0.65,
      });
    });
  }

  return list;
}
