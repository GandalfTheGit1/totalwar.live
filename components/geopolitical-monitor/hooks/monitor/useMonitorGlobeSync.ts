/**
 * components/dev/geopolitical-monitor/hooks/monitor/useMonitorGlobeSync.ts
 *
 * Synchronizes 3D globe visualization parameters, auto-rotation, and camera centering.
 */

import { useEffect, MutableRefObject } from 'react';
import { GeoFeature } from '../../types';
import { getPolygonCentroid } from '../../utils/geo-helpers';

export function useMonitorGlobeSync(
  globeInstanceRef: MutableRefObject<any>,
  is2DMode: boolean,
  selectedCountry: GeoFeature | null,
  getPolygonColor: any,
  getPolygonStroke: any,
  arcsData: any[],
  pointsData: any[],
  isLoading: boolean,
  isPanelOpen: boolean
) {
  useEffect(() => {
    if (!globeInstanceRef.current) return;
    if (is2DMode) {
      globeInstanceRef.current.pauseAnimation();
    } else {
      globeInstanceRef.current.resumeAnimation();
      globeInstanceRef.current.polygonsTransitionDuration(0);
      globeInstanceRef.current.polygonCapColor(getPolygonColor);
      globeInstanceRef.current.polygonStrokeColor(getPolygonStroke);
      globeInstanceRef.current.arcsData(arcsData);
      globeInstanceRef.current.pointsData(pointsData);
    }
    if (selectedCountry && !is2DMode) {
      const c = getPolygonCentroid(selectedCountry.geometry);
      globeInstanceRef.current.pointOfView({ lat: c.lat, lng: c.lng, altitude: 1.3 }, 1000);
    }
  }, [is2DMode, selectedCountry, getPolygonColor, getPolygonStroke, arcsData, pointsData, globeInstanceRef, isLoading]);

  useEffect(() => {
    if (!globeInstanceRef.current) return;
    const controls = globeInstanceRef.current.controls();
    if (controls) {
      controls.autoRotate = !selectedCountry && !isPanelOpen;
    }
  }, [selectedCountry, isPanelOpen, globeInstanceRef]);
}
