/**
 * components/geographic-operations/facilities/FacilitiesD3Map.tsx
 *
 * Tactical 2D D3 Mercator map rendering countries, pulse rings, glow markers, and tactical legend.
 */

'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { RefreshCw, ShieldAlert } from 'lucide-react';
import {
  CorporateFacility,
  FACILITY_TYPE_CONFIG
} from '@/lib/services/geographic/sec-properties-service';
import { PopoverPosition } from './types';

interface FacilitiesD3MapProps {
  geoData: Array<{ properties?: { ISO_A2?: string; ISO_A3?: string } }>;
  filteredFacilities: CorporateFacility[];
  selectedFacility: CorporateFacility | null;
  selectedCountryCode?: string | null;
  isLoading: boolean;
  error: string | null;
  onSelectCountry?: (code: string) => void;
  onHoverFacility: (facility: CorporateFacility | null, pos?: PopoverPosition) => void;
  onSelectFacility: (facility: CorporateFacility, pos: PopoverPosition) => void;
}

function renderCountries(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  geoData: FacilitiesD3MapProps['geoData'],
  path: d3.GeoPath,
  selectedCountryCode?: string | null,
  onSelectCountry?: (code: string) => void
): void {
  g.append('g')
    .attr('class', 'countries-layer')
    .selectAll('path')
    .data(geoData)
    .enter()
    .append('path')
    .attr('d', path as unknown as string)
    .attr('fill', (d) => {
      const iso = d.properties?.ISO_A2 || d.properties?.ISO_A3;
      return (selectedCountryCode && iso === selectedCountryCode) ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.7)';
    })
    .attr('stroke', (d) => {
      const iso = d.properties?.ISO_A2 || d.properties?.ISO_A3;
      return (selectedCountryCode && iso === selectedCountryCode) ? '#38bdf8' : 'rgba(51, 65, 85, 0.4)';
    })
    .attr('stroke-width', '0.6px')
    .on('click', (_event, d) => {
      const code = d.properties?.ISO_A2 || d.properties?.ISO_A3;
      if (code && onSelectCountry) onSelectCountry(code);
    });
}

function renderMarkers(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  facilities: CorporateFacility[],
  projection: d3.GeoProjection,
  selectedFacility: CorporateFacility | null,
  onHover: FacilitiesD3MapProps['onHoverFacility'],
  onSelect: FacilitiesD3MapProps['onSelectFacility']
): void {
  const markersLayer = g.append('g').attr('class', 'markers-layer');
  const markerGroups = markersLayer
    .selectAll('g.facility-marker')
    .data(facilities, (d: unknown) => (d as CorporateFacility).id)
    .enter()
    .append('g')
    .attr('class', 'facility-marker cursor-pointer')
    .attr('transform', (d: CorporateFacility) => {
      const coords = projection([d.lng, d.lat]);
      return coords ? `translate(${coords[0]}, ${coords[1]})` : 'translate(-9999, -9999)';
    })
    .on('mouseenter', (event, d: CorporateFacility) => onHover(d, { x: event.clientX, y: event.clientY }))
    .on('mouseleave', () => onHover(null))
    .on('click', (event, d: CorporateFacility) => {
      event.stopPropagation();
      onSelect(d, { x: event.clientX, y: event.clientY });
    });

  // Pulse ring & Glow dot
  markerGroups.append('circle').attr('r', 10).attr('fill', 'none')
    .attr('stroke', d => FACILITY_TYPE_CONFIG[d.functionalType]?.hexColor || '#38bdf8')
    .attr('stroke-width', 1.2).attr('stroke-opacity', 0.5).attr('class', 'animate-pulse');

  markerGroups.append('circle').attr('r', 6)
    .attr('fill', d => FACILITY_TYPE_CONFIG[d.functionalType]?.hexColor || '#38bdf8')
    .attr('fill-opacity', 0.35)
    .attr('stroke', d => FACILITY_TYPE_CONFIG[d.functionalType]?.hexColor || '#38bdf8')
    .attr('stroke-width', 1.5).attr('filter', d => FACILITY_TYPE_CONFIG[d.functionalType]?.glowFilter || 'url(#glow-cyan)');

  markerGroups.append('circle').attr('r', 2.8).attr('fill', '#ffffff');
  markerGroups.append('text').attr('y', -8).attr('text-anchor', 'middle').attr('font-size', '10px')
    .attr('class', 'select-none pointer-events-none').text(d => FACILITY_TYPE_CONFIG[d.functionalType]?.iconGlyph || '🏢');

  markerGroups.filter((d: CorporateFacility) => !!(selectedFacility && selectedFacility.id === d.id))
    .append('circle').attr('r', 14).attr('fill', 'none').attr('stroke', '#38bdf8')
    .attr('stroke-width', 2).attr('stroke-dasharray', '3 2').attr('filter', 'url(#glow-cyan)');
}

function FacilitiesSvgDefs() {
  return (
    <defs>
      {['cyan', 'emerald', 'indigo', 'amber'].map(color => (
        <filter key={color} id={`glow-${color}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      ))}
    </defs>
  );
}

function FacilitiesTacticalLegend() {
  return (
    <div className="absolute bottom-2 left-2 z-10 pointer-events-none bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-zinc-800 text-[9px] font-mono text-zinc-400 flex items-center gap-3">
      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#38bdf8]" /> HQ</span>
      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10b981]" /> Manufactura</span>
      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#a855f7]" /> I+D</span>
      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> Datacenter</span>
    </div>
  );
}

function useD3MapRendering(
  svgRef: React.RefObject<SVGSVGElement | null>,
  gRef: React.RefObject<SVGGElement | null>,
  props: FacilitiesD3MapProps
) {
  const { geoData, filteredFacilities, selectedFacility, selectedCountryCode, onSelectCountry, onHoverFacility, onSelectFacility } = props;

  useEffect(() => {
    if (!svgRef.current || !gRef.current || geoData.length === 0) return;

    const width = svgRef.current.clientWidth || 600;
    const height = svgRef.current.clientHeight || 340;
    const g = d3.select(gRef.current);
    g.selectAll('*').remove();

    const projection = d3.geoMercator().fitSize([width, height * 0.95], {
      type: 'FeatureCollection',
      features: geoData as unknown as GeoJSON.Feature[],
    });
    projection.center([0, 20]);
    const path = d3.geoPath().projection(projection);

    renderCountries(g, geoData, path, selectedCountryCode, onSelectCountry);
    renderMarkers(g, filteredFacilities, projection, selectedFacility, onHoverFacility, onSelectFacility);
  }, [geoData, filteredFacilities, selectedFacility, selectedCountryCode, onSelectCountry, onHoverFacility, onSelectFacility, svgRef, gRef]);
}

export function FacilitiesD3Map(props: FacilitiesD3MapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);

  useD3MapRendering(svgRef, gRef, props);

  return (
    <div className="relative w-full h-[320px] bg-[#020617] rounded-xl overflow-hidden border border-zinc-800 shadow-inner">
      <svg ref={svgRef} className="w-full h-full select-none cursor-grab active:cursor-grabbing">
        <FacilitiesSvgDefs />
        <g ref={gRef} />
      </svg>

      {props.isLoading && (
        <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center text-xs text-zinc-400 font-mono">
          <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin mr-2" />
          Extrayendo Item 2 (Properties) de SEC EDGAR...
        </div>
      )}

      {props.error && (
        <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center p-4 text-center">
          <ShieldAlert className="w-8 h-8 text-rose-500 mb-2" />
          <p className="text-xs text-rose-300 font-medium mb-2">{props.error}</p>
        </div>
      )}

      <FacilitiesTacticalLegend />
    </div>
  );
}
