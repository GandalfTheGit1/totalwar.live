/**
 * __tests__/territorial-claims.test.tsx
 *
 * Comprehensive test suite for territorial claims registry, API endpoints,
 * relations-store backwards compatibility, sidebar HUD component, and 2D D3 rendering.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import React from 'react';
import * as d3 from 'd3';

// Services & Store
import {
  getAllClaims,
  getClaimById,
  getClaimsForCountry,
  getClaimsForPair,
} from '@/lib/services/territorial-claims/claims-store';
import { getCountryRelations } from '@/lib/services/bilateral-relations/relations-store';

// API Routes
import { GET as getClaimsList } from '@/app/api/claims/route';
import { GET as getClaimsByCode } from '@/app/api/claims/[code]/route';

// Components
import { TerritorialClaimsSection } from '@/components/geopolitical-monitor/components/sidebar/TerritorialClaimsSection';
import {
  renderClaimsLayer,
  ClaimGeoJSON,
} from '@/components/geopolitical-monitor/components/map2d/render-claims';
import type { TerritorialClaim } from '@/lib/services/territorial-claims/types';

describe('Territorial Claims Registry & Store', () => {
  it('loads all 60 reviewed claims and 21 excluded entities', () => {
    const claims = getAllClaims();
    expect(claims.length).toBe(60);
    const gibraltar = getClaimById('gibraltar');
    expect(gibraltar).toBeDefined();
    expect(gibraltar?.nameEs).toBe('Gibraltar');
    expect(gibraltar?.administeredBy).toBe('GB');
    expect(gibraltar?.claimants).toContain('ES');
    expect(gibraltar?.salience).toBe('core');
  });

  it('correctly filters claims by country role for Spain (ES)', () => {
    const res = getClaimsForCountry('ES');
    expect(res).not.toBeNull();
    expect(res?.country).toBe('ES');

    // Administered by Spain (Olivenza, Perejil, Ceuta/Melilla)
    const adminIds = res?.asAdmin.map((c) => c.id);
    expect(adminIds).toContain('olivenza');
    expect(adminIds).toContain('perejil');
    expect(adminIds).toContain('ceuta-melilla-plazas');

    // Claimed by Spain (Gibraltar)
    const claimantIds = res?.asClaimant.map((c) => c.id);
    expect(claimantIds).toContain('gibraltar');

    // Third-party stance by Spain (Western Sahara)
    const thirdPartyClaimIds = res?.asThirdParty.map((tp) => tp.claim.id);
    expect(thirdPartyClaimIds).toContain('western-sahara');
    const wsStance = res?.asThirdParty.find((tp) => tp.claim.id === 'western-sahara');
    expect(wsStance?.stance.stance).toBe('supports_administrator');

    expect(res?.total).toBe(
      (res?.asAdmin.length || 0) + (res?.asClaimant.length || 0) + (res?.asThirdParty.length || 0)
    );
    expect(res?.total).toBeGreaterThanOrEqual(5);
  });

  it('returns empty lists for a country with no territorial disputes', () => {
    const res = getClaimsForCountry('ZZ');
    expect(res).not.toBeNull();
    expect(res?.total).toBe(0);
    expect(res?.asAdmin).toEqual([]);
    expect(res?.asClaimant).toEqual([]);
    expect(res?.asThirdParty).toEqual([]);
  });

  it('resolves claims linking specific bilateral pairs', () => {
    // ES-GB -> Gibraltar
    const esGb = getClaimsForPair('ES', 'GB');
    expect(esGb.map((c) => c.id)).toContain('gibraltar');

    // IN-PK -> Kashmir
    const inPk = getClaimsForPair('IN', 'PK');
    expect(inPk.map((c) => c.id)).toContain('kashmir-jammu-ladakh');
    expect(inPk.map((c) => c.id)).toContain('kashmir-azad-gilgit');

    // CA-DK -> Empty (Hans Island was resolved in 2022 and is excluded)
    const caDk = getClaimsForPair('CA', 'DK');
    expect(caDk).toEqual([]);
  });
});

describe('Relations Store Backwards Compatibility (8th element claimIds)', () => {
  const MOCK_DATA_7_ELEMENTS: any = {
    meta: { generatedAt: '2026-10-21', layer: 'structural', states: 1, pairs: 1 },
    countries: { ES: ['España', 'ESP'], GB: ['Reino Unido', 'GBR'] },
    pairs: {
      'ES-GB': [
        45.0,
        'PARTNER',
        45.0,
        'high',
        false,
        [['TERRITORIAL_DISPUTE_LOW', -8]],
        { ES: ['PRESENT', '2020-01', 'wikidata', null], GB: ['PRESENT', '2020-01', 'wikidata', null] },
      ],
    },
  };

  const MOCK_DATA_8_ELEMENTS: any = {
    meta: { generatedAt: '2026-10-21', layer: 'structural', states: 1, pairs: 1 },
    countries: { ES: ['España', 'ESP'], GB: ['Reino Unido', 'GBR'] },
    pairs: {
      'ES-GB': [
        45.0,
        'PARTNER',
        45.0,
        'high',
        false,
        [['TERRITORIAL_DISPUTE_LOW', -8]],
        { ES: ['PRESENT', '2020-01', 'wikidata', null], GB: ['PRESENT', '2020-01', 'wikidata', null] },
        ['gibraltar'], // 8th element optional claimIds
      ],
    },
  };

  it('unpacks pairs gracefully without the 8th element', () => {
    const res = getCountryRelations('ES', MOCK_DATA_7_ELEMENTS);
    expect(res).not.toBeNull();
    const gb = res?.partners[0];
    expect(gb?.partner).toBe('GB');
    expect(gb?.claimIds).toBeUndefined();
  });

  it('unpacks the 8th element claimIds when present', () => {
    const res = getCountryRelations('ES', MOCK_DATA_8_ELEMENTS);
    expect(res).not.toBeNull();
    const gb = res?.partners[0];
    expect(gb?.partner).toBe('GB');
    expect(gb?.claimIds).toEqual(['gibraltar']);
  });
});

describe('Claims API Endpoints', () => {
  it('GET /api/claims returns list of all claims and excluded entities', async () => {
    const req = new Request('http://localhost:3000/api/claims');
    const res = await getClaimsList(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.count).toBe(60);
    expect(Array.isArray(data.claims)).toBe(true);
    expect(Array.isArray(data.excluded)).toBe(true);
  });

  it('GET /api/claims/[code] returns country claims payload', async () => {
    const req = new Request('http://localhost:3000/api/claims/ES');
    const res = await getClaimsByCode(req as any, { params: Promise.resolve({ code: 'ES' }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.country).toBe('ES');
    expect(data.asClaimant.some((c: any) => c.id === 'gibraltar')).toBe(true);
  });

  it('GET /api/claims/[code] returns 404 for invalid country code', async () => {
    const req = new Request('http://localhost:3000/api/claims/123');
    const res = await getClaimsByCode(req as any, { params: Promise.resolve({ code: '123' }) });
    expect(res.status).toBe(404);
  });
});

describe('TerritorialClaimsSection Sidebar Component', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders loading state then displays claims for Spain', async () => {
    const mockPayload = {
      country: 'ES',
      asAdmin: [
        {
          id: 'olivenza',
          nameEs: 'Olivenza',
          nameEn: 'Olivenza',
          kind: 'land',
          administeredBy: 'ES',
          claimants: ['PT'],
          status: 'latent',
          salience: 'minor',
          since: '1801-06-06',
        },
      ],
      asClaimant: [
        {
          id: 'gibraltar',
          nameEs: 'Gibraltar',
          nameEn: 'Gibraltar',
          kind: 'land',
          administeredBy: 'GB',
          claimants: ['ES'],
          status: 'latent',
          salience: 'core',
          since: '1713-07-13',
        },
      ],
      asThirdParty: [],
      total: 2,
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockPayload,
      })
    );

    render(<TerritorialClaimsSection countryCode="ES" />);

    // Fast-forward fetch
    await waitFor(() => {
      expect(screen.getByTestId('territorial-claims-section')).toBeInTheDocument();
    });

    expect(screen.getByText('Reclamaciones territoriales')).toBeInTheDocument();
    expect(screen.getAllByText('Gibraltar').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Olivenza').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('2 disputas o posturas registradas')).toBeInTheDocument();
  });

  it('renders empty fallback when country has 0 claims', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          country: 'ZZ',
          asAdmin: [],
          asClaimant: [],
          asThirdParty: [],
          total: 0,
        }),
      })
    );

    render(<TerritorialClaimsSection countryCode="ZZ" />);

    await waitFor(() => {
      expect(screen.getByTestId('territorial-claims-section-empty')).toBeInTheDocument();
    });
    expect(
      screen.getByText('Sin disputas ni reclamaciones activas registradas para este país.')
    ).toBeInTheDocument();
  });
});

describe('2D D3 renderClaimsLayer', () => {
  it('renders polygons with diagonal hatches and points without crashing', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const layer = d3.select(svg).append('g').attr('class', 'claims-layer');
    const projection = d3.geoMercator().scale(100).translate([200, 200]);

    const mockGeo: ClaimGeoJSON = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { id: 'kashmir-jammu-ladakh' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [75, 34],
                [76, 34],
                [76, 35],
                [75, 35],
                [75, 34],
              ],
            ],
          },
        },
        {
          type: 'Feature',
          properties: { id: 'perejil' },
          geometry: {
            type: 'Point',
            coordinates: [-5.416, 35.914],
          },
        },
      ],
    };

    const mockMeta: Record<string, TerritorialClaim> = {
      'kashmir-jammu-ladakh': {
        id: 'kashmir-jammu-ladakh',
        nameEs: 'Cachemira',
        nameEn: 'Kashmir',
        kind: 'land',
        administeredBy: 'IN',
        claimants: ['PK'],
        status: 'militarized',
        salience: 'core',
        since: '1947-10-22',
      },
      perejil: {
        id: 'perejil',
        nameEs: 'Isla de Perejil',
        nameEn: 'Perejil Island',
        kind: 'island',
        administeredBy: 'ES',
        claimants: ['MA'],
        status: 'latent',
        salience: 'minor',
        since: '2002-07-20',
      },
    };

    const onHover = vi.fn();
    const onClick = vi.fn();

    renderClaimsLayer(
      layer as any,
      projection,
      mockGeo,
      mockMeta,
      null,
      onHover,
      onClick
    );

    const polys = layer.selectAll('path.claim-poly');
    expect(polys.size()).toBe(1);
    expect(polys.attr('fill')).toBe('url(#hatch-militarized)');

    const points = layer.selectAll('g.claim-point');
    expect(points.size()).toBe(1);
  });
});
