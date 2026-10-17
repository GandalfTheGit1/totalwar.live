/**
 * components/dev/geopolitical-monitor/hooks/monitor/points-builder.ts
 *
 * Computes point entities (corporate facilities and maritime chokepoints) for 2D/3D maps.
 */

import { ThematicLayer, CorporateFacility, FACILITY_TYPE_CONFIG } from '../../types';
import { MaritimeChokepointId, CHOKEPOINT_LIST } from '@/lib/services/maritime-chokepoint-service';

export function computeMonitorPoints(
  activeLayer: ThematicLayer,
  facilities: CorporateFacility[],
  selectedFacility: CorporateFacility | null,
  showMaritimeRoutes: boolean,
  blockedChokepoints: MaritimeChokepointId[]
): any[] {
  const list: any[] = [];

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
