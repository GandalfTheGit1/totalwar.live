/**
 * components/dev/geopolitical-monitor/components/map2d/render-facilities.ts
 *
 * D3 renderer for SEC Item 2 corporate facility pins and tactical indicators.
 */

import type * as d3 from 'd3';
import { type CorporateFacility, FACILITY_TYPE_CONFIG } from '../../types';

import type { Map2DProps } from './types';

function appendFacilityRings(
  markerGroups: d3.Selection<SVGGElement, CorporateFacility, SVGGElement, unknown>,
  selectedFacility: CorporateFacility | null
) {
  markerGroups
    .append('circle')
    .attr('r', 10)
    .attr('fill', 'none')
    .attr('stroke', (d) => FACILITY_TYPE_CONFIG[d.functionalType]?.hexColor || '#38bdf8')
    .attr('stroke-width', 1.2)
    .attr('stroke-opacity', 0.45)
    .attr('class', 'animate-pulse');

  markerGroups
    .append('circle')
    .attr('r', 6)
    .attr('fill', (d) => FACILITY_TYPE_CONFIG[d.functionalType]?.hexColor || '#38bdf8')
    .attr('fill-opacity', 0.35)
    .attr('stroke', (d) => FACILITY_TYPE_CONFIG[d.functionalType]?.hexColor || '#38bdf8')
    .attr('stroke-width', 1.5)
    .attr('filter', (d) => FACILITY_TYPE_CONFIG[d.functionalType]?.glowFilter || 'url(#glow-cyan)');

  markerGroups.append('circle').attr('r', 2.8).attr('fill', '#ffffff');

  markerGroups
    .append('text')
    .attr('y', -8)
    .attr('text-anchor', 'middle')
    .attr('font-size', '10px')
    .attr('class', 'select-none pointer-events-none')
    .text((d) => FACILITY_TYPE_CONFIG[d.functionalType]?.iconGlyph || '🏢');

  markerGroups
    .filter((d) => !!(selectedFacility && selectedFacility.id === d.id))
    .append('circle')
    .attr('r', 14)
    .attr('fill', 'none')
    .attr('stroke', '#38bdf8')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '3 2')
    .attr('filter', 'url(#glow-cyan)');
}

export function renderCorporateFacilities(
  markersLayer: d3.Selection<SVGGElement, unknown, null, undefined>,
  projection: d3.GeoProjection,
  facilities: CorporateFacility[],
  selectedFacility: CorporateFacility | null,
  handlersRef: React.MutableRefObject<Map2DProps>
) {
  const markerGroups = markersLayer
    .selectAll<SVGGElement, CorporateFacility>('g.facility-marker')
    .data(facilities, (d: CorporateFacility) => d.id)
    .enter()
    .append('g')
    .attr('class', 'facility-marker cursor-pointer')
    .attr('transform', (d) => {
      const coords = projection([d.lng, d.lat]);
      return coords ? `translate(${coords[0]}, ${coords[1]})` : 'translate(-9999, -9999)';
    })
    .on('mouseenter', (event, d) => handlersRef.current.onFacilityHover?.(d, event))
    .on('mouseleave', () => handlersRef.current.onFacilityHover?.(null))
    .on('click', (event, d) => {
      event.stopPropagation();
      handlersRef.current.onFacilityClick?.(d, event);
    });

  appendFacilityRings(markerGroups, selectedFacility);
  markersLayer.raise();
}
