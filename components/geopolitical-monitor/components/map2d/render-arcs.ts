/**
 * components/dev/geopolitical-monitor/components/map2d/render-arcs.ts
 *
 * D3 renderer for friendshoring strategic substitution arcs and nodes.
 */

import type * as d3 from 'd3';
import type { SubstitutionArc } from '../../types';
import type { Map2DProps, TooltipPos } from './types';

export interface ValidArcItem {
  arc: SubstitutionArc;
  p1: [number, number];
  p2: [number, number];
}

export function computeArcBezierPath(p1: [number, number], p2: [number, number]): string {
  const x1 = p1[0];
  const y1 = p1[1];
  const x2 = p2[0];
  const y2 = p2[1];
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const curvature = Math.min(80, Math.max(25, dist * 0.18));
  const nx = -dy / (dist || 1);
  const ny = dx / (dist || 1);
  const cx = mx + nx * curvature * 0.4;
  const cy = my + ny * curvature * 0.4 - curvature * 0.6;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

function getEventOffsetCoords(event: MouseEvent, svgElement: SVGSVGElement | null): TooltipPos {
  const rect = svgElement?.getBoundingClientRect();
  const offsetX = rect ? rect.left : 0;
  const offsetY = rect ? rect.top : 0;
  const rawX = typeof event.clientX === 'number' ? event.clientX : (event as unknown as { pageX: number }).pageX || 100;
  const rawY = typeof event.clientY === 'number' ? event.clientY : (event as unknown as { pageY: number }).pageY || 100;
  return { x: rawX - offsetX, y: rawY - offsetY };
}

function attachArcInteraction(
  arcGroups: d3.Selection<SVGGElement, ValidArcItem, SVGGElement, unknown>,
  svgElement: SVGSVGElement | null,
  handlersRef: React.MutableRefObject<Map2DProps>,
  setHoveredArc: (arc: SubstitutionArc | null) => void,
  setArcTooltipPos: (pos: TooltipPos) => void
) {
  arcGroups
    .on('mouseenter', (event: MouseEvent, d: ValidArcItem) => {
      const c = getEventOffsetCoords(event, svgElement);
      setHoveredArc(d.arc);
      setArcTooltipPos({ x: c.x + 15, y: c.y + 15 });
      handlersRef.current.onArcHover?.(d.arc, event);
    })
    .on('mousemove', (event: MouseEvent) => {
      const c = getEventOffsetCoords(event, svgElement);
      setArcTooltipPos({ x: c.x + 15, y: c.y + 15 });
    })
    .on('mouseleave', () => {
      setHoveredArc(null);
      handlersRef.current.onArcHover?.(null);
    })
    .on('click', (event: MouseEvent, d: ValidArcItem) => {
      event.stopPropagation();
      handlersRef.current.onArcClick?.(d.arc);
    });
}

function appendArcVisuals(arcGroups: d3.Selection<SVGGElement, ValidArcItem, SVGGElement, unknown>) {
  arcGroups
    .append('path')
    .attr('class', 'substitution-arc-2d transition-all duration-200')
    .style('vector-effect', 'non-scaling-stroke')
    .attr('d', (d) => computeArcBezierPath(d.p1, d.p2))
    .attr('fill', 'none')
    .attr('stroke', 'url(#arc-gradient-emerald-cyan)')
    .attr('stroke-width', '2.2px')
    .attr('stroke-dasharray', '6 3')
    .attr('marker-end', 'url(#arrow-friendshoring)')
    .attr('filter', 'url(#glow-emerald)');

  arcGroups
    .append('circle')
    .attr('cx', (d) => d.p1[0])
    .attr('cy', (d) => d.p1[1])
    .attr('r', 3.5)
    .style('vector-effect', 'non-scaling-stroke')
    .attr('fill', '#f43f5e')
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 0.8)
    .attr('filter', 'url(#glow-rose)');

  arcGroups
    .append('circle')
    .attr('cx', (d) => d.p2[0])
    .attr('cy', (d) => d.p2[1])
    .attr('r', 4.5)
    .style('vector-effect', 'non-scaling-stroke')
    .attr('fill', '#10b981')
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 1.0)
    .attr('filter', 'url(#glow-emerald)');
}

export function renderSubstitutionArcs(
  arcsLayer: d3.Selection<SVGGElement, unknown, null, undefined>,
  projection: d3.GeoProjection,
  substitutionArcs: SubstitutionArc[] | undefined,
  svgElement: SVGSVGElement | null,
  handlersRef: React.MutableRefObject<Map2DProps>,
  setHoveredArc: (arc: SubstitutionArc | null) => void,
  setArcTooltipPos: (pos: TooltipPos) => void
) {
  const arcsToRender = substitutionArcs || [];
  const validArcs: ValidArcItem[] = arcsToRender
    .map((arc) => {
      const p1 = projection([arc.sourceCoords.lng, arc.sourceCoords.lat]);
      const p2 = projection([arc.targetCoords.lng, arc.targetCoords.lat]);
      return { arc, p1: p1 as [number, number], p2: p2 as [number, number] };
    })
    .filter((d) => d.p1 && d.p2 && Number.isFinite(d.p1[0]) && Number.isFinite(d.p2[0]));

  const arcGroups = arcsLayer
    .selectAll<SVGGElement, ValidArcItem>('g.substitution-arc-group')
    .data(validArcs, (d: ValidArcItem) => d.arc.id)
    .enter()
    .append('g')
    .attr('class', 'substitution-arc-group cursor-pointer')
    .style('pointer-events', 'auto');

  attachArcInteraction(arcGroups, svgElement, handlersRef, setHoveredArc, setArcTooltipPos);
  appendArcVisuals(arcGroups);
}
