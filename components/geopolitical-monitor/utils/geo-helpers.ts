/**
 * @file geo-helpers.ts
 * @description Helper functions and datasets for rendering 3D Globe.GL and 2D D3 Mercator maps.
 */

import { CentroidCoordinates, RiskAppearance } from '../types';

export const GEOJSON_URL = 'https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson';
export const EARTH_TEX = 'https://unpkg.com/three-globe/example/img/earth-dark.jpg';
export const BUMP_TEX = 'https://unpkg.com/three-globe/example/img/earth-topology.png';

/**
 * Loads Globe.gl UMD script dynamically on client side to prevent SSR bundling issues.
 */
export const loadGlobeScript = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return;
    if ((window as any).Globe) {
      resolve((window as any).Globe);
      return;
    }
    const existingScript = document.querySelector('script[src*="globe.gl"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve((window as any).Globe));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/globe.gl@2.32.1/dist/globe.gl.min.js';
    script.async = true;
    script.onload = () => {
      console.log('[GeopoliticalMonitor] Globe.GL script loaded successfully.');
      resolve((window as any).Globe);
    };
    script.onerror = (err) => {
      console.error('[GeopoliticalMonitor] Failed to load Globe.GL script:', err);
      reject(err);
    };
    document.head.appendChild(script);
  });
};

/**
 * Determines color appearance, border stroke and text classification based on risk score (0 - 100).
 */
export const getRiskAppearance = (riskScore: number): RiskAppearance => {
  if (riskScore < 30) {
    return {
      color: 'rgba(0, 230, 118, 0.38)',
      stroke: 'rgba(0, 230, 118, 0.95)',
      indicator: '#00e676',
      textClass: 'text-[#00e676]',
    };
  }
  if (riskScore < 70) {
    return {
      color: 'rgba(255, 234, 0, 0.18)',
      stroke: 'rgba(255, 234, 0, 0.85)',
      indicator: '#ffea00',
      textClass: 'text-[#ffea00]',
    };
  }
  return {
    color: 'rgba(255, 23, 68, 0.28)',
    stroke: 'rgba(255, 23, 68, 0.95)',
    indicator: '#ff1744',
    textClass: 'text-[#ff1744]',
  };
};

/**
 * Calculates geographic centroid (lat, lng) from polygon geometry coordinates.
 */
export const getPolygonCentroid = (geometry: any): CentroidCoordinates => {
  let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
  const processCoord = (c: number[]) => {
    if (c[0] < minLng) minLng = c[0];
    if (c[0] > maxLng) maxLng = c[0];
    if (c[1] < minLat) minLat = c[1];
    if (c[1] > maxLat) maxLat = c[1];
  };

  if (geometry && geometry.type === 'Polygon' && geometry.coordinates && geometry.coordinates[0]) {
    geometry.coordinates[0].forEach(processCoord);
  } else if (geometry && geometry.type === 'MultiPolygon' && geometry.coordinates) {
    geometry.coordinates.forEach((poly: any) => {
      if (poly && poly[0]) poly[0].forEach(processCoord);
    });
  }
  return { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 };
};
