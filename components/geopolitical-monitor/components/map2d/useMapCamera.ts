/**
 * components/dev/geopolitical-monitor/components/map2d/useMapCamera.ts
 *
 * Custom hook to manage D3 Mercator projection, pan/zoom behaviors,
 * and smooth camera transitions towards selected sovereign territories.
 */

import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { GeoFeature } from '../../types';

function focusCameraOnBounds(
  svgElement: SVGSVGElement,
  zoomInstance: d3.ZoomBehavior<SVGSVGElement, unknown>,
  selectedCountry: GeoFeature,
  isPanelOpen: boolean,
  containerDimensions: { width: number; height: number }
) {
  const svg = d3.select(svgElement);
  const path = (svg.node() as (SVGSVGElement & { d3Path?: d3.GeoPath }) | null)?.d3Path;
  if (!path) return;

  try {
    const bounds = path.bounds(selectedCountry as unknown as d3.GeoPermissibleObjects);
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;

    const width = containerDimensions.width || window.innerWidth;
    const height = containerDimensions.height || window.innerHeight;

    const scale = Math.max(1, Math.min(4, 0.4 / Math.max(dx / width, dy / height)));
    const panelOffset = isPanelOpen ? 225 : 0;
    const translate = [width / 2 - scale * x - panelOffset, height / 2 - scale * y];

    svg
      .transition()
      .duration(1000)
      .call(zoomInstance.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
  } catch (e) {
    console.error('[GeopoliticalMonitor] Error focusing D3 camera:', e);
  }
}

export function useMapCamera(
  svgRef: React.RefObject<SVGSVGElement | null>,
  selectedCountry: GeoFeature | null,
  isPanelOpen: boolean,
  containerDimensions: { width: number; height: number }
) {
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const projectionRef = useRef<d3.GeoProjection | null>(null);

  useEffect(() => {
    if (!svgRef.current || !selectedCountry || !zoomRef.current) return;
    focusCameraOnBounds(svgRef.current, zoomRef.current, selectedCountry, isPanelOpen, containerDimensions);
  }, [selectedCountry, isPanelOpen, containerDimensions, svgRef]);

  useEffect(() => {
    if (!isPanelOpen && !selectedCountry && svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(1000)
        .call(zoomRef.current.transform, d3.zoomIdentity);
    }
  }, [isPanelOpen, selectedCountry, svgRef]);

  return { zoomRef, projectionRef };
}
