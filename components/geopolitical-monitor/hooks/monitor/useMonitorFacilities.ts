/**
 * components/dev/geopolitical-monitor/hooks/monitor/useMonitorFacilities.ts
 *
 * State and interaction handlers for SEC Item 2 corporate facilities and footprint layers.
 */

import { useState, useCallback, useMemo, MutableRefObject } from 'react';
import { CorporateFacility } from '../../types';
import { secPropertiesService } from '@/lib/services/geographic/sec-properties-service';

export function useMonitorFacilities(
  initialTicker: string,
  is2DMode: boolean,
  globeInstanceRef: MutableRefObject<any>,
  toggleChokepoint: (id: any) => void
) {
  const [footprintTicker, setFootprintTicker] = useState<string>(initialTicker);
  const [hoveredFacility, setHoveredFacility] = useState<CorporateFacility | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<CorporateFacility | null>(null);
  const [facilityTooltipPos, setFacilityTooltipPos] = useState({ x: 20, y: 20 });

  const facilities = useMemo(() => {
    return secPropertiesService.getCuratedFacilities(footprintTicker);
  }, [footprintTicker]);

  const handleFacilityHover = useCallback((item: any, event?: any) => {
    if (item?.pointType === 'chokepoint') {
      setHoveredFacility(null);
      return;
    }
    setHoveredFacility(item);
    if (item && event) {
      const cx = typeof event.clientX === 'number' && Number.isFinite(event.clientX)
        ? event.clientX
        : (event.pageX || 20);
      const cy = typeof event.clientY === 'number' && Number.isFinite(event.clientY)
        ? event.clientY
        : (event.pageY || 20);
      setFacilityTooltipPos({ x: cx + 15, y: cy + 15 });
    }
  }, []);

  const handleFacilityClick = useCallback((item: any, event?: any) => {
    if (item?.pointType === 'chokepoint') {
      toggleChokepoint(item.id);
      return;
    }
    setSelectedFacility(item);
    if (event) {
      const cx = typeof event.clientX === 'number' && Number.isFinite(event.clientX)
        ? event.clientX
        : (event.pageX || 20);
      const cy = typeof event.clientY === 'number' && Number.isFinite(event.clientY)
        ? event.clientY
        : (event.pageY || 20);
      setFacilityTooltipPos({ x: cx + 15, y: cy + 15 });
    }
    if (!is2DMode && globeInstanceRef.current && item?.lat !== undefined && item?.lng !== undefined) {
      globeInstanceRef.current.pointOfView({ lat: item.lat, lng: item.lng, altitude: 1.2 }, 1000);
    }
  }, [is2DMode, globeInstanceRef, toggleChokepoint]);

  return {
    footprintTicker,
    setFootprintTicker,
    facilities,
    hoveredFacility,
    selectedFacility,
    setSelectedFacility,
    setHoveredFacility,
    facilityTooltipPos,
    handleFacilityHover,
    handleFacilityClick,
  };
}
