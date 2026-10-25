/**
 * components/dev/geopolitical-monitor/hooks/monitor/useMonitorCountrySelection.ts
 *
 * Country selection, hover tooltips, and camera centering logic.
 */

import { useState, useCallback, MutableRefObject } from 'react';
import { GeoFeature, ActiveRelationsMap } from '../../types';
import { GeopoliticalKnowledgeService } from '@/lib/services/geopolitical-knowledge-service';
import { getCountryCentroid } from '@/lib/services/geographic/friendshoring-service';
import { MapMode } from '../../components/MapModeSelector';
import { resolveIsoFromFeature, buildRealRelations } from './relations-builder';
import { loadRelations } from './engine-relations';

export function useMonitorCountrySelection(
  geoJsonData: GeoFeature[],
  activeMode: MapMode,
  setActiveRelations: (rel: ActiveRelationsMap) => void,
  fetchMacroForCountry: (iso: string) => void,
  is2DMode: boolean,
  globeInstanceRef: MutableRefObject<any>,
  isPanelOpen: boolean,
  setIsPanelOpen: (open: boolean) => void
) {
  const [selectedCountry, setSelectedCountry] = useState<GeoFeature | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<GeoFeature | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 20, y: 20 });

  const handleCountryHover = useCallback(
    (polygon: GeoFeature | null, event?: any) => {
      if (isPanelOpen) return;
      setHoveredCountry(polygon);
      if (polygon) {
        let cx: number | null = null;
        let cy: number | null = null;

        if (event) {
          if (typeof event.clientX === 'number' && Number.isFinite(event.clientX)) {
            cx = event.clientX;
          } else if (event.srcEvent && typeof event.srcEvent.clientX === 'number' && Number.isFinite(event.srcEvent.clientX)) {
            cx = event.srcEvent.clientX;
          } else if (typeof event.pageX === 'number' && Number.isFinite(event.pageX)) {
            cx = event.pageX;
          }

          if (typeof event.clientY === 'number' && Number.isFinite(event.clientY)) {
            cy = event.clientY;
          } else if (event.srcEvent && typeof event.srcEvent.clientY === 'number' && Number.isFinite(event.srcEvent.clientY)) {
            cy = event.srcEvent.clientY;
          } else if (typeof event.pageY === 'number' && Number.isFinite(event.pageY)) {
            cy = event.pageY;
          }
        }

        if (cx !== null && cy !== null && Number.isFinite(cx) && Number.isFinite(cy)) {
          setTooltipPos({ x: cx + 15, y: cy + 15 });
        }
      }
    },
    [isPanelOpen]
  );

  const handleCountryClick = useCallback(
    (polygon: GeoFeature) => {
      if (!polygon) return;
      const iso = resolveIsoFromFeature(polygon);
      console.log('[GeopoliticalMonitor] Country selected:', polygon.properties?.ADMIN, polygon.polyId, '| ISO:', iso);
      setSelectedCountry(polygon);
      setIsPanelOpen(true);
      setHoveredCountry(null);

      if (activeMode === 'relations') {
        loadRelations(polygon, geoJsonData, setActiveRelations, buildRealRelations);
      }

      if (iso && iso !== '-99') {
        fetchMacroForCountry(iso);
      }
    },
    [activeMode, geoJsonData, setActiveRelations, fetchMacroForCountry, setIsPanelOpen]
  );

  const handleSelectCountryByIso = useCallback(
    (isoCode: string) => {
      if (!isoCode) return;
      const clean = isoCode.trim().toUpperCase();
      const targetFeature = geoJsonData.find((feat) => {
        const iso2 = feat.properties?.ISO_A2 || feat.properties?.ISO2;
        const iso3 = feat.properties?.ISO_A3 || feat.properties?.ADM0_A3 || feat.properties?.SU_A3;
        if (iso2 && iso2.toUpperCase() === clean) return true;
        if (iso3 && iso3.toUpperCase() === clean) return true;
        const resolved = GeopoliticalKnowledgeService.resolveCountryCode(iso3 || '');
        return resolved === clean;
      });
      if (targetFeature) {
        handleCountryClick(targetFeature);
      }
      if (!is2DMode && globeInstanceRef.current) {
        const centroid = getCountryCentroid(clean);
        globeInstanceRef.current.pointOfView({ lat: centroid.lat, lng: centroid.lng, altitude: 1.5 }, 1000);
      }
    },
    [geoJsonData, handleCountryClick, is2DMode, globeInstanceRef]
  );

  return {
    selectedCountry,
    setSelectedCountry,
    hoveredCountry,
    setHoveredCountry,
    tooltipPos,
    handleCountryHover,
    handleCountryClick,
    handleSelectCountryByIso,
  };
}
