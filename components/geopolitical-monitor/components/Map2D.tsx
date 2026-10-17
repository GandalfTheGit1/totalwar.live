/**
 * @file Map2D.tsx
 * @description 2D Interactive D3 Mercator Tactical Map with high-fidelity dark mode matching 3D Globe.GL.
 */

'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { GeoFeature, SubstitutionArc } from '../types';
import type { Map2DProps, TooltipPos, ChokepointMarkerData } from './map2d/types';
import { MapDefs } from './map2d/MapDefs';
import { CornerReticles } from './map2d/CornerReticles';
import { ArcTooltip } from './map2d/ArcTooltip';
import { ChokepointTooltip } from './map2d/ChokepointTooltip';
import { computeCountryTacticalStyle } from './map2d/country-styler';
import { renderSubstitutionArcs } from './map2d/render-arcs';
import { renderCorporateFacilities } from './map2d/render-facilities';
import { renderMaritimeLayer } from './map2d/render-maritime';
import { useMapCamera } from './map2d/useMapCamera';
import { useMapInit } from './map2d/useMapInit';

export type { Map2DProps } from './map2d/types';

interface MapTooltipSetters {
  setHoveredArc: React.Dispatch<React.SetStateAction<SubstitutionArc | null>>;
  setArcTooltipPos: React.Dispatch<React.SetStateAction<TooltipPos>>;
  setHoveredChokepoint: React.Dispatch<React.SetStateAction<ChokepointMarkerData | null>>;
  setChokepointTooltipPos: React.Dispatch<React.SetStateAction<TooltipPos>>;
}

function applyCountryPolygonStyles(gElement: SVGGElement, props: Map2DProps) {
  const g = d3.select(gElement);
  g.selectAll<SVGPathElement, GeoFeature>('.country-path').each(function (d) {
    const style = computeCountryTacticalStyle(
      d,
      props.activeMode,
      props.activeLayer,
      props.layerData || {},
      props.countryMockData,
      props.activeRelations,
      props.selectedCountry,
      props.hoveredCountry
    );
    d3.select(this)
      .attr('fill', style.fillColor)
      .attr('stroke', style.strokeColor)
      .attr('stroke-width', style.strokeWidth)
      .attr('filter', style.filter);
  });
  if (props.selectedCountry) g.select(`#${props.selectedCountry.polyId}`).raise();
  if (props.hoveredCountry) g.select(`#${props.hoveredCountry.polyId}`).raise();
}

function renderAllDynamicLayers(
  gElement: SVGGElement,
  projection: d3.GeoProjection,
  props: Map2DProps,
  svgElement: SVGSVGElement | null,
  handlersRef: React.MutableRefObject<Map2DProps>,
  setters: MapTooltipSetters
) {
  const g = d3.select(gElement);
  const arcs = g.select<SVGGElement>('.arcs-layer');
  const markers = g.select<SVGGElement>('.markers-layer');
  const routes = g.select<SVGGElement>('.maritime-routes-layer');
  const chokepoints = g.select<SVGGElement>('.chokepoints-layer');

  arcs.selectAll('*').remove();
  markers.selectAll('*').remove();
  routes.selectAll('*').remove();
  chokepoints.selectAll('*').remove();

  if (props.activeLayer === 'resources' || (props.substitutionArcs && props.substitutionArcs.length > 0)) {
    renderSubstitutionArcs(arcs, projection, props.substitutionArcs, svgElement, handlersRef, setters.setHoveredArc, setters.setArcTooltipPos);
  }
  if (props.activeLayer === 'footprint' && props.facilities && props.facilities.length > 0) {
    renderCorporateFacilities(markers, projection, props.facilities, props.selectedFacility || null, handlersRef);
  }
  if (props.showMaritimeRoutes || props.activeLayer === 'maritime') {
    renderMaritimeLayer(routes, chokepoints, projection, props.blockedChokepoints, svgElement, handlersRef, setters.setHoveredChokepoint, setters.setChokepointTooltipPos);
  }
}

function useMapTooltips() {
  const [hoveredArc, setHoveredArc] = useState<SubstitutionArc | null>(null);
  const [arcTooltipPos, setArcTooltipPos] = useState<TooltipPos>({ x: 0, y: 0 });
  const [hoveredChokepoint, setHoveredChokepoint] = useState<ChokepointMarkerData | null>(null);
  const [chokepointTooltipPos, setChokepointTooltipPos] = useState<TooltipPos>({ x: 0, y: 0 });

  const setters = useMemo<MapTooltipSetters>(
    () => ({ setHoveredArc, setArcTooltipPos, setHoveredChokepoint, setChokepointTooltipPos }),
    []
  );

  return {
    hoveredArc, arcTooltipPos, hoveredChokepoint, chokepointTooltipPos, setters,
  };
}

function useMapDynamicLayers(
  gRef: React.RefObject<SVGGElement | null>,
  projectionRef: React.MutableRefObject<d3.GeoProjection | null>,
  svgRef: React.RefObject<SVGSVGElement | null>,
  handlersRef: React.MutableRefObject<Map2DProps>,
  props: Map2DProps,
  setters: MapTooltipSetters
) {
  useEffect(() => {
    if (!gRef.current || !props.geoData.length) return;
    applyCountryPolygonStyles(gRef.current, props);
    if (projectionRef.current) {
      renderAllDynamicLayers(gRef.current, projectionRef.current, props, svgRef.current, handlersRef, setters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Stable refs omitted; individual reactive visual props tracked to avoid tearing down D3 canvas on tooltip hover
  }, [
    props.selectedCountry,
    props.hoveredCountry,
    props.activeMode,
    props.activeRelations,
    props.countryMockData,
    props.activeLayer,
    props.layerData,
    props.geoData.length,
    props.facilities,
    props.selectedFacility,
    props.substitutionArcs,
    props.showMaritimeRoutes,
    props.blockedChokepoints,
    projectionRef,
    setters,
  ]);
}

export const Map2D: React.FC<Map2DProps> = (props) => {
  const { geoData, containerDimensions, onBackgroundClick, isPanelOpen, selectedCountry } = props;
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const tooltips = useMapTooltips();

  const handlersRef = useRef<Map2DProps>(props);
  useEffect(() => {
    handlersRef.current = props;
  });

  const { zoomRef, projectionRef } = useMapCamera(svgRef, selectedCountry, isPanelOpen, containerDimensions);
  useMapInit(svgRef, gRef, geoData, containerDimensions, handlersRef, zoomRef, projectionRef);
  useMapDynamicLayers(gRef, projectionRef, svgRef, handlersRef, props, tooltips.setters);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#020617]">
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing select-none" onClick={onBackgroundClick}>
        <MapDefs />
        <rect width="100%" height="100%" fill="url(#oceanGradient)" />
        <g ref={gRef} style={{ vectorEffect: 'non-scaling-stroke' }} />
      </svg>
      {tooltips.hoveredArc && <ArcTooltip arc={tooltips.hoveredArc} pos={tooltips.arcTooltipPos} containerWidth={containerDimensions.width} />}
      {tooltips.hoveredChokepoint && (
        <ChokepointTooltip
          chokepoint={tooltips.hoveredChokepoint}
          isBlocked={(props.blockedChokepoints || []).includes(tooltips.hoveredChokepoint.id)}
          pos={tooltips.chokepointTooltipPos}
        />
      )}
      <CornerReticles />
    </div>
  );
};
