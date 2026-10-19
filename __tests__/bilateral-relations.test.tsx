import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { getCountryRelations } from '@/lib/services/bilateral-relations/relations-store';
import { buildEngineRelations, BAND_TO_TYPE, loadRelations, cancelEngineRelations } from '@/components/geopolitical-monitor/hooks/monitor/engine-relations';
import { BilateralRelationsSection } from '@/components/geopolitical-monitor/components/sidebar/BilateralRelationsSection';
import type { GeoFeature } from '@/components/geopolitical-monitor/types';

const DATA: any = {
  meta: { generatedAt: '2026-10-19', layer: 'structural (tier 1)', states: 3, pairs: 3 },
  countries: { ES: ['España', 'ESP'], MA: ['Marruecos', 'MAR'], FR: ['Francia', 'FRA'] },
  pairs: {
    'ES-MA': [-41.1, 'TENSE', 3.8, 'high', true, [['TRADE_HIGH', 12], ['TERRITORIAL_DISPUTE_ACTIVE', -18]], { ES: ['PRESENT', '2024-01', 'wikidata', 'X'], MA: ['ABSENT', '2021-05', 'event', null] }],
    'ES-FR': [62.5, 'PARTNER', 62.5, 'high', false, [['DEEP_INTEGRATION', 40]], { ES: ['UNKNOWN', null, 'none', null], FR: ['PRESENT', '2023-01', 'wikidata', 'Y'] }],
    'FR-MA': [0, 'NEUTRAL', 0, 'none', false, [], {}],
  },
};

const feat = (iso3: string, polyId: string): GeoFeature => ({ type: 'Feature', polyId, properties: { ADMIN: iso3, ISO_A3: iso3 }, geometry: { type: 'Polygon', coordinates: [] } });

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('bilateral relations store', () => {
  it('lists every partner of a country, best first, with expanded embassies', () => {
    const r = getCountryRelations('es', DATA)!;
    expect(r.country).toBe('ES');
    expect(r.partners.map((p) => p.partner)).toEqual(['FR', 'MA']);
    const ma = r.partners[1];
    expect(ma.R).toBe(-41.1);
    expect(ma.band).toBe('TENSE');
    expect(ma.embassies.MA).toEqual({ status: 'ABSENT', since: '2021-05', source: 'event', holder: null });
  });

  it('returns null for an unknown country or a missing file', () => {
    expect(getCountryRelations('ZZ', DATA)).toBeNull();
    expect(getCountryRelations('ES', null)).toBeNull();
  });
});

describe('engine relations on the map', () => {
  const geo = [feat('ESP', 'p-es'), feat('MAR', 'p-ma'), feat('FRA', 'p-fr')];

  it('maps bands onto the existing relation types and leaves no-data pairs out', () => {
    const map = buildEngineRelations(getCountryRelations('FR', DATA)!, geo);
    expect(map['p-es'].type).toBe(BAND_TO_TYPE.PARTNER);
    expect(map['p-es'].score?.R).toBe(62.5);
    expect(map['p-ma']).toBeUndefined();          // coverage 'none': grey, not neutral
  });

  it('paints the curated relations first and applies only the latest engine answer', async () => {
    const payload = getCountryRelations('ES', DATA)!;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => payload }));
    const calls: any[] = [];
    const curated = vi.fn().mockReturnValue({ curated: true });
    const p1 = loadRelations(geo[0], geo, (r) => calls.push(r), curated);
    const p2 = loadRelations(geo[0], geo, (r) => calls.push(r), curated);
    await Promise.all([p1, p2]);
    expect(calls[0]).toEqual({ curated: true });
    expect(calls.filter((c) => c['p-ma']).length).toBe(1);        // the older request was discarded

    cancelEngineRelations();
    const after: any[] = [];
    const p3 = loadRelations(geo[0], geo, (r) => after.push(r), curated);
    cancelEngineRelations();                                      // e.g. the user left the relations mode
    await p3;
    expect(after).toEqual([{ curated: true }]);
  });
});

describe('BilateralRelationsSection', () => {
  it('shows best and worst partners and expands the embassy state', () => {
    const geo = [feat('ESP', 'p-es'), feat('MAR', 'p-ma'), feat('FRA', 'p-fr')];
    const rel = buildEngineRelations(getCountryRelations('ES', DATA)!, geo);
    render(<BilateralRelationsSection activeRelations={rel} />);
    expect(screen.getByTestId('bilateral-relations-section')).toBeTruthy();
    expect(screen.getByText('Francia')).toBeTruthy();
    fireEvent.click(screen.getByText('Marruecos'));
    expect(screen.getByText('Ausente')).toBeTruthy();
    expect(screen.getByText('Disputa territorial activa')).toBeTruthy();
  });

  it('renders nothing without engine scores', () => {
    const { container } = render(<BilateralRelationsSection activeRelations={{}} />);
    expect(container.innerHTML).toBe('');
  });
});
