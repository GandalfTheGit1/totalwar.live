/**
 * components/geopolitical-monitor/components/map2d/render-claims.ts
 *
 * D3 rendering of territorial claims layer with diagonal hatch fills and tactical styling.
 */

import * as d3 from 'd3';
import type { GeoFeature } from '../../types';
import type { TerritorialClaim } from '@/lib/services/territorial-claims/types';

export interface ClaimFeature {
  type: 'Feature';
  properties: { id: string };
  geometry: GeoJSON.Geometry;
}

export interface ClaimGeoJSON {
  type: 'FeatureCollection';
  features: ClaimFeature[];
}

const STATUS_COLOR: Record<string, string> = {
  occupied: '#f43f5e',
  militarized: '#f97316',
  active: '#eab308',
  latent: '#06b6d4',
  frozen: '#64748b',
  resolved: '#10b981',
};

const STATUS_HATCH: Record<string, string> = {
  occupied: 'url(#hatch-occupied)',
  militarized: 'url(#hatch-militarized)',
  active: 'url(#hatch-active)',
  latent: 'url(#hatch-latent)',
  frozen: 'url(#hatch-frozen)',
  resolved: 'url(#hatch-resolved)',
};

export function renderClaimsLayer(
  layer: d3.Selection<SVGGElement, unknown, null, undefined>,
  projection: d3.GeoProjection,
  claimsGeo: ClaimGeoJSON | null,
  claimsMeta: Record<string, TerritorialClaim>,
  selectedCountry: GeoFeature | null,
  onClaimHover?: (claim: TerritorialClaim | null, event?: MouseEvent) => void,
  onClaimClick?: (claim: TerritorialClaim) => void
) {
  layer.selectAll('*').remove();
  if (!claimsGeo || !claimsGeo.features.length) return;

  const pathGenerator = d3.geoPath().projection(projection);
  const selectedIso = selectedCountry?.polyId?.toUpperCase();

  const g = layer.append('g').attr('class', 'claims-features');

  // Render Polygons and MultiPolygons with diagonal hatches
  const polyFeatures = claimsGeo.features.filter(
    (f) => f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'
  );

  g.selectAll<SVGPathElement, ClaimFeature>('path.claim-poly')
    .data(polyFeatures)
    .enter()
    .append('path')
    .attr('class', 'claim-poly transition-opacity duration-300 cursor-pointer')
    .attr('d', (d) => pathGenerator(d.geometry) || '')
    .attr('fill', (d) => {
      const claim = claimsMeta[d.properties.id];
      const status = claim?.status || 'latent';
      return STATUS_HATCH[status] || 'url(#hatch-latent)';
    })
    .attr('stroke', (d) => {
      const claim = claimsMeta[d.properties.id];
      const status = claim?.status || 'latent';
      return STATUS_COLOR[status] || '#06b6d4';
    })
    .attr('stroke-width', (d) => {
      const claim = claimsMeta[d.properties.id];
      if (!selectedIso || !claim) return '1.2px';
      const isRelated = isClaimRelated(claim, selectedIso);
      return isRelated ? '2px' : '0.8px';
    })
    .attr('opacity', (d) => {
      const claim = claimsMeta[d.properties.id];
      if (!selectedIso) return 0.85;
      if (!claim) return 0.25;
      return isClaimRelated(claim, selectedIso) ? 1.0 : 0.25;
    })
    .on('mouseover', function (event, d) {
      const claim = claimsMeta[d.properties.id];
      d3.select(this).attr('stroke-width', '2.5px').attr('opacity', 1.0);
      onClaimHover?.(claim || null, event);
    })
    .on('mouseout', function (event, d) {
      const claim = claimsMeta[d.properties.id];
      const isRelated = selectedIso && claim && isClaimRelated(claim, selectedIso);
      d3.select(this)
        .attr('stroke-width', isRelated ? '2px' : '1.2px')
        .attr('opacity', !selectedIso ? 0.85 : isRelated ? 1.0 : 0.25);
      onClaimHover?.(null);
    })
    .on('click', function (event, d) {
      event.stopPropagation();
      const claim = claimsMeta[d.properties.id];
      if (claim) onClaimClick?.(claim);
    });

  // Render Points for tiny/insular entities
  const pointFeatures = claimsGeo.features.filter((f) => f.geometry.type === 'Point');

  const pointGroups = g
    .selectAll<SVGGElement, ClaimFeature>('g.claim-point')
    .data(pointFeatures)
    .enter()
    .append('g')
    .attr('class', 'claim-point cursor-pointer')
    .attr('transform', (d) => {
      const coords = (d.geometry as GeoJSON.Point).coordinates;
      const pt = projection([coords[0], coords[1]]);
      return pt ? `translate(${pt[0]}, ${pt[1]})` : 'translate(-9999, -9999)';
    })
    .attr('opacity', (d) => {
      const claim = claimsMeta[d.properties.id];
      if (!selectedIso) return 0.9;
      if (!claim) return 0.3;
      return isClaimRelated(claim, selectedIso) ? 1.0 : 0.3;
    });

  // Glowing circle and outer ring for points
  pointGroups
    .append('circle')
    .attr('r', (d) => {
      const claim = claimsMeta[d.properties.id];
      return selectedIso && claim && isClaimRelated(claim, selectedIso) ? 5.5 : 4;
    })
    .attr('fill', (d) => {
      const claim = claimsMeta[d.properties.id];
      const status = claim?.status || 'latent';
      return STATUS_COLOR[status] || '#06b6d4';
    })
    .attr('stroke', '#020617')
    .attr('stroke-width', 1.2);

  pointGroups
    .append('circle')
    .attr('r', 8)
    .attr('fill', 'none')
    .attr('stroke', (d) => {
      const claim = claimsMeta[d.properties.id];
      const status = claim?.status || 'latent';
      return STATUS_COLOR[status] || '#06b6d4';
    })
    .attr('stroke-width', 0.8)
    .attr('stroke-dasharray', '2 2')
    .attr('opacity', 0.6);

  pointGroups
    .on('mouseover', function (event, d) {
      const claim = claimsMeta[d.properties.id];
      d3.select(this).attr('opacity', 1.0);
      onClaimHover?.(claim || null, event);
    })
    .on('mouseout', function (event, d) {
      const claim = claimsMeta[d.properties.id];
      const isRelated = selectedIso && claim && isClaimRelated(claim, selectedIso);
      d3.select(this).attr('opacity', !selectedIso ? 0.9 : isRelated ? 1.0 : 0.3);
      onClaimHover?.(null);
    })
    .on('click', function (event, d) {
      event.stopPropagation();
      const claim = claimsMeta[d.properties.id];
      if (claim) onClaimClick?.(claim);
    });
}

function isClaimRelated(claim: TerritorialClaim, iso: string): boolean {
  const adminCode = typeof claim.administeredBy === 'string'
    ? claim.administeredBy
    : claim.administeredBy?.entity;
  if (adminCode?.toUpperCase() === iso) return true;

  for (const cl of claim.claimants) {
    const clCode = typeof cl === 'string' ? cl : cl?.entity;
    if (clCode?.toUpperCase() === iso) return true;
  }

  if (claim.thirdParty) {
    if (claim.thirdParty.some((tp) => tp.country.toUpperCase() === iso)) return true;
  }

  return false;
}
