/**
 * components/dev/geopolitical-monitor/components/map2d/render-maritime.ts
 *
 * D3 renderer for global maritime trade routes, chokepoint circles, and blockade indicators.
 */

import * as d3 from 'd3';
import {
  type MaritimeChokepointId,
  GLOBAL_MARITIME_ROUTES,
  CHOKEPOINT_LIST,
} from '../../types';
import type { ChokepointMarkerData, Map2DProps, TooltipPos } from './types';

function isContingencyRouteActive(routeId: string, blockedSet: Set<MaritimeChokepointId>): boolean {
  if (!routeId.includes('reroute')) return true;
  const isSuezOrBabBlocked = blockedSet.has('suez') || blockedSet.has('bab_el_mandeb');
  const isPanamaBlocked = blockedSet.has('panama');
  return (
    (routeId.includes('cape-good-hope') && isSuezOrBabBlocked) ||
    (routeId.includes('cape-horn') && isPanamaBlocked)
  );
}

function renderTradeRoutes(
  maritimeRoutesLayer: d3.Selection<SVGGElement, unknown, null, undefined>,
  blockedSet: Set<MaritimeChokepointId>,
  projection: d3.GeoProjection
) {
  const lineGen = d3.line<[number, number]>().x((d) => d[0]).y((d) => d[1]).curve(d3.curveCatmullRom.alpha(0.5));

  for (const route of GLOBAL_MARITIME_ROUTES) {
    if (!isContingencyRouteActive(route.id, blockedSet)) continue;
    const isDisrupted = route.primaryChokepoints.some((id) => blockedSet.has(id));
    const isContingency = route.id.includes('reroute');

    const projectedPoints: [number, number][] = [];
    for (const wp of route.waypoints) {
      const pt = projection(wp);
      if (pt && Number.isFinite(pt[0]) && Number.isFinite(pt[1])) projectedPoints.push(pt as [number, number]);
    }
    if (projectedPoints.length < 2) continue;

    const pathString = lineGen(projectedPoints);
    if (!pathString) continue;

    maritimeRoutesLayer
      .append('path')
      .attr('class', `maritime-trade-line ${isDisrupted ? 'disrupted' : ''}`)
      .attr('d', pathString)
      .attr('fill', 'none')
      .attr('stroke', isDisrupted ? '#ef4444' : isContingency ? '#f59e0b' : '#38bdf8')
      .attr('stroke-width', isDisrupted ? 2.2 : isContingency ? 2.0 : 1.6)
      .attr('stroke-dasharray', isDisrupted ? '6 3' : isContingency ? '8 4' : '6 3')
      .attr('stroke-opacity', isDisrupted ? 0.95 : isContingency ? 0.9 : 0.75)
      .attr('filter', isDisrupted ? 'url(#glow-rose)' : isContingency ? 'url(#glow-amber)' : 'url(#glow-cyan)')
      .style('vector-effect', 'non-scaling-stroke');
  }
}

function attachChokepointEvents(
  cpGroups: d3.Selection<SVGGElement, ChokepointMarkerData, SVGGElement, unknown>,
  svgElement: SVGSVGElement | null,
  handlersRef: React.MutableRefObject<Map2DProps>,
  setHoveredChokepoint: React.Dispatch<React.SetStateAction<ChokepointMarkerData | null>>,
  setChokepointTooltipPos: (pos: TooltipPos) => void
) {
  const getPos = (event: MouseEvent) => {
    const rect = svgElement?.getBoundingClientRect();
    const ox = rect ? rect.left : 0;
    const oy = rect ? rect.top : 0;
    const rx = typeof event.clientX === 'number' ? event.clientX : (event as unknown as { pageX: number }).pageX || 100;
    const ry = typeof event.clientY === 'number' ? event.clientY : (event as unknown as { pageY: number }).pageY || 100;
    return { x: rx - ox + 16, y: ry - oy + 16 };
  };

  const handleToggle = (d: ChokepointMarkerData) => {
    handlersRef.current.onToggleChokepoint?.(d.id);
    setHoveredChokepoint((prev) => (prev && prev.id === d.id ? { ...prev, isBlocked: !prev.isBlocked } : prev));
  };

  cpGroups
    .on('mouseenter', (event: MouseEvent, d: ChokepointMarkerData) => {
      setHoveredChokepoint(d);
      setChokepointTooltipPos(getPos(event));
    })
    .on('mousemove', (event: MouseEvent) => setChokepointTooltipPos(getPos(event)))
    .on('mouseleave', () => setHoveredChokepoint(null))
    .on('click', (event: MouseEvent, d: ChokepointMarkerData) => {
      event.stopPropagation();
      handleToggle(d);
    })
    .on('keydown', (event: KeyboardEvent, d: ChokepointMarkerData) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        handleToggle(d);
      }
    });
}

function appendChokepointVisuals(cpGroups: d3.Selection<SVGGElement, ChokepointMarkerData, SVGGElement, unknown>) {
  cpGroups
    .append('circle')
    .attr('r', 16)
    .attr('fill', (d) => (d.isBlocked ? 'rgba(239, 68, 68, 0.28)' : 'rgba(56, 189, 248, 0.12)'))
    .attr('stroke', (d) => (d.isBlocked ? '#ef4444' : '#38bdf8'))
    .attr('stroke-width', (d) => (d.isBlocked ? 2.5 : 1.8))
    .attr('stroke-dasharray', '4,4')
    .attr('class', (d) => (d.isBlocked ? 'animate-pulse' : 'animate-[spin_12s_linear_infinite]'))
    .attr('filter', (d) => (d.isBlocked ? 'url(#glow-rose)' : 'url(#glow-cyan)'))
    .style('transform-origin', 'center')
    .style('transform-box', 'fill-box')
    .style('vector-effect', 'non-scaling-stroke');

  cpGroups
    .filter((d) => !d.isBlocked)
    .append('circle')
    .attr('r', 4)
    .attr('fill', '#38bdf8')
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 0.8)
    .style('vector-effect', 'non-scaling-stroke');

  const blockedMarkers = cpGroups.filter((d) => d.isBlocked);
  blockedMarkers.append('line').attr('x1', -5).attr('y1', -5).attr('x2', 5).attr('y2', 5).attr('stroke', '#ffffff').attr('stroke-width', 2.2).style('vector-effect', 'non-scaling-stroke');
  blockedMarkers.append('line').attr('x1', -5).attr('y1', 5).attr('x2', 5).attr('y2', -5).attr('stroke', '#ffffff').attr('stroke-width', 2.2).style('vector-effect', 'non-scaling-stroke');

  cpGroups
    .append('text')
    .attr('y', 27)
    .attr('text-anchor', 'middle')
    .attr('font-size', '9px')
    .attr('font-family', 'ui-monospace, monospace')
    .attr('font-weight', 'bold')
    .attr('fill', (d) => (d.isBlocked ? '#fca5a5' : '#7dd3fc'))
    .attr('class', 'select-none pointer-events-none drop-shadow')
    .text((d) => `${d.nameEs} [${d.isBlocked ? 'BLOQUEADO' : 'ABIERTO'}]`);
}

export function renderMaritimeLayer(
  maritimeRoutesLayer: d3.Selection<SVGGElement, unknown, null, undefined>,
  chokepointsLayer: d3.Selection<SVGGElement, unknown, null, undefined>,
  projection: d3.GeoProjection,
  blockedChokepoints: MaritimeChokepointId[] | undefined,
  svgElement: SVGSVGElement | null,
  handlersRef: React.MutableRefObject<Map2DProps>,
  setHoveredChokepoint: React.Dispatch<React.SetStateAction<ChokepointMarkerData | null>>,
  setChokepointTooltipPos: (pos: TooltipPos) => void
) {
  const blockedSet = new Set(blockedChokepoints || []);
  renderTradeRoutes(maritimeRoutesLayer, blockedSet, projection);

  const chokepointData: ChokepointMarkerData[] = CHOKEPOINT_LIST.map((cp) => {
    const pt = projection([cp.coordinates.lng, cp.coordinates.lat]);
    return { ...cp, pt: pt as [number, number], isBlocked: blockedSet.has(cp.id) };
  }).filter((d) => d.pt && Number.isFinite(d.pt[0]) && Number.isFinite(d.pt[1]));

  const cpGroups = chokepointsLayer
    .selectAll<SVGGElement, ChokepointMarkerData>('g.chokepoint-marker')
    .data(chokepointData, (d: ChokepointMarkerData) => d.id)
    .enter()
    .append('g')
    .attr('class', 'chokepoint-marker cursor-pointer outline-none focus:outline-none')
    .attr('role', 'button')
    .attr('tabindex', '0')
    .attr('aria-label', (d) => `${d.nameEs} [${d.isBlocked ? 'BLOQUEADO' : 'ABIERTO'}]`)
    .attr('transform', (d) => `translate(${d.pt[0]}, ${d.pt[1]})`)
    .style('pointer-events', 'auto');

  attachChokepointEvents(cpGroups, svgElement, handlersRef, setHoveredChokepoint, setChokepointTooltipPos);
  appendChokepointVisuals(cpGroups);
  chokepointsLayer.raise();
}
