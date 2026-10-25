/**
 * components/dev/geopolitical-monitor/components/map2d/useMapInit.ts
 *
 * Custom hook to initialize D3 SVG map projection, graticule grid, and country paths.
 */

import { useEffect } from 'react';
import * as d3 from 'd3';
import type { GeoFeature } from '../../types';
import type { Map2DProps } from './types';

function initProjection(geoData: GeoFeature[], width: number, height: number) {
  const inhabited = geoData.filter((f) => f.properties?.ISO_A3 !== 'ATA');
  const fitFeatures = inhabited.length > 0 ? inhabited : geoData;
  const projection = d3.geoMercator().fitSize([width, height * 0.95], {
    type: 'FeatureCollection',
    features: fitFeatures as unknown as GeoJSON.Feature[],
  });
  projection.center([0, 15]);
  const path = d3.geoPath().projection(projection);
  return { projection, path };
}

function initGraticules(g: d3.Selection<SVGGElement, unknown, null, undefined>, path: d3.GeoPath) {
  const graticuleLayer = g.append('g').attr('class', 'graticule-layer pointer-events-none');
  graticuleLayer
    .append('path')
    .datum(d3.geoGraticule10())
    .attr('d', (d) => path(d) || '')
    .attr('fill', 'none')
    .attr('stroke', 'rgba(56, 189, 248, 0.07)')
    .attr('stroke-width', 0.5)
    .attr('stroke-dasharray', '2 4');

  const equatorAndMeridian = d3.geoGraticule().lines().filter((line) => {
    const c = line.coordinates;
    return (c[0] && c[0][1] === 0) || (c[0] && c[0][0] === 0);
  });

  graticuleLayer
    .selectAll('path.major-line')
    .data(equatorAndMeridian)
    .enter()
    .append('path')
    .attr('class', 'major-line')
    .attr('d', (d) => path(d) || '')
    .attr('fill', 'none')
    .attr('stroke', 'rgba(56, 189, 248, 0.16)')
    .attr('stroke-width', 0.75);
}

function initCountries(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  geoData: GeoFeature[],
  path: d3.GeoPath,
  handlersRef: React.MutableRefObject<Map2DProps>
) {
  g.append('g')
    .attr('class', 'countries-layer')
    .selectAll('path')
    .data(geoData)
    .enter()
    .append('path')
    .attr('id', (d: GeoFeature) => d.polyId)
    .attr('d', (d) => path(d as unknown as d3.GeoPermissibleObjects) || '')
    .attr('class', 'country-path outline-none transition-all duration-200 cursor-pointer')
    .attr('fill', 'rgba(15, 23, 42, 0.7)')
    .attr('stroke', 'rgba(71, 85, 105, 0.4)')
    .attr('stroke-width', '0.6px')
    .on('mouseover', (event, d: GeoFeature) => handlersRef.current.onCountryHover(d, event))
    .on('mouseout', () => handlersRef.current.onCountryHover(null))
    .on('click', (event, d: GeoFeature) => {
      event.stopPropagation();
      handlersRef.current.onCountryClick(d);
    });
}

export function useMapInit(
  svgRef: React.RefObject<SVGSVGElement | null>,
  gRef: React.RefObject<SVGGElement | null>,
  geoData: GeoFeature[],
  containerDimensions: { width: number; height: number },
  handlersRef: React.MutableRefObject<Map2DProps>,
  zoomRef: React.MutableRefObject<d3.ZoomBehavior<SVGSVGElement, unknown> | null>,
  projectionRef: React.MutableRefObject<d3.GeoProjection | null>
) {
  useEffect(() => {
    if (!svgRef.current || !gRef.current || !geoData || geoData.length === 0) return;
    const width = containerDimensions.width || window.innerWidth;
    const height = containerDimensions.height || window.innerHeight;
    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);
    g.selectAll('*').remove();

    const { projection, path } = initProjection(geoData, width, height);
    projectionRef.current = projection;
    const svgNode = svg.node() as (SVGSVGElement & { d3Path?: d3.GeoPath }) | null;
    if (svgNode) svgNode.d3Path = path;

    initGraticules(g, path);
    initCountries(g, geoData, path, handlersRef);
    g.append('g').attr('class', 'claims-layer');
    g.append('g').attr('class', 'maritime-routes-layer pointer-events-none');
    g.append('g').attr('class', 'chokepoints-layer');
    g.append('g').attr('class', 'arcs-layer pointer-events-none');
    g.append('g').attr('class', 'markers-layer');

    zoomRef.current = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.5, 20])
      .on('start', () => svg.classed('is-zooming', true))
      .on('zoom', (event) => g.attr('transform', event.transform))
      .on('end', () => svg.classed('is-zooming', false));

    svg.call(zoomRef.current);
    svg.call(zoomRef.current.transform, d3.zoomIdentity);
  }, [geoData, containerDimensions, svgRef, gRef, handlersRef, zoomRef, projectionRef]);
}
