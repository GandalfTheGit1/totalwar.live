import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { getCountryRelations } from '@/lib/services/bilateral-relations/relations-store';
import { buildEngineRelations, BAND_TO_TYPE, loadRelations, cancelEngineRelations } from '@/components/geopolitical-monitor/hooks/monitor/engine-relations';
import { BilateralRelationsSection } from '@/components/geopolitical-monitor/components/sidebar/BilateralRelationsSection';
import type { GeoFeature } from '@/components/geopolitical-monitor/types';
import { TIES, TONE_STOPS, splitRelation, toneAlpha, toneColor, toneOf, positionLabelEs, NODATA_FILL } from '@/lib/services/bilateral-relations/valence';

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
    expect(ma.ties).toBe(12);                       // TRADE_HIGH only; the dispute is position, not tie
    expect(ma.valence).toBeCloseTo(-53.1, 1);       // R - ties
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
    expect(map['p-es'].tone?.valence).toBeCloseTo(62.5, 1);
    expect(map['p-es'].tone?.fillColor).toBe('rgba(4, 120, 87, 0.3)');          // 62.5 is past the last stop (+60): dark emerald; no ties -> opacity 0.30
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
    expect(screen.getByTestId('bilateral-legend')).toBeTruthy();
    expect(screen.getByText('Posiciones favorables')).toBeTruthy();
    expect(screen.getByText('Posiciones adversas')).toBeTruthy();
    fireEvent.click(screen.getByText('Marruecos'));
    expect(screen.getByText('Ausente')).toBeTruthy();
    expect(screen.getByText('Disputa territorial activa')).toBeTruthy();
  });

  it('renders nothing without engine scores', () => {
    const { container } = render(<BilateralRelationsSection activeRelations={{}} />);
    expect(container.innerHTML).toBe('');
  });
});

describe('valence and ties (two-channel map)', () => {
  it('splits R into ties and position with the ties states only', () => {
    const { ties, valence } = splitRelation([['FULL_DIPLOMATIC', 10], ['TRADE_HIGH', 12], ['DEFENSE_ALLIANCE', 35], ['SANCTIONS_REGIME_BROAD', -30]], 27);
    expect(ties).toBe(22);
    expect(valence).toBe(5);
    expect(TIES.has('FTA_IN_FORCE')).toBe(false);       // a trade agreement is a position, not a tie
    expect(TIES.has('SHARED_FORUM')).toBe(true);
  });

  it('paints each of the nine stops with its exact colour', () => {
    const want: Record<number, [number, number, number]> = {
      [-60]: [159, 18, 57], [-25]: [225, 29, 72], [-10]: [244, 63, 94], [-5]: [245, 158, 11], 0: [148, 163, 184],
      5: [129, 140, 248], 10: [52, 211, 153], 30: [16, 185, 129], 60: [4, 120, 87],
    };
    expect(TONE_STOPS.map(([v]) => v)).toEqual([-60, -25, -10, -5, 0, 5, 10, 30, 60]);
    for (const [v, rgb] of Object.entries(want)) expect(toneColor(Number(v))).toEqual(rgb);
    expect(toneColor(-200)).toEqual(want[-60]);          // clamped
    expect(toneColor(200)).toEqual(want[60]);
  });

  it('maps ties to opacity from 0.30 to 0.65 and saturates at 20', () => {
    expect(toneAlpha(0)).toBeCloseTo(0.3, 6);
    expect(toneAlpha(10)).toBeCloseTo(0.475, 6);
    expect(toneAlpha(20)).toBeCloseTo(0.65, 6);
    expect(toneAlpha(33)).toBeCloseTo(0.65, 6);
  });

  it('keeps the grey for pairs with nothing recorded', () => {
    expect(toneOf(0, 0)).toBeNull();
    expect(toneOf(5, 10, 'none')).toBeNull();
    expect(NODATA_FILL).toBe('rgba(51, 65, 85, 0.35)');
  });

  it('never paints a pair of no position green or rose (acceptance 3)', () => {
    for (let v = -4.9; v <= 4.9; v += 0.1) {
      const [r, g, b] = toneColor(v);
      expect(r > 200 && g < 100).toBe(false);          // rose family
      expect(g > 170 && r < 100).toBe(false);          // emerald family
      expect(r).toBeGreaterThanOrEqual(129);
      expect(r).toBeLessThanOrEqual(245);
      expect(b).toBeGreaterThanOrEqual(11);
    }
  });

  it('gives strong positions a glow, a thicker border and a capped hover opacity', () => {
    const ally = toneOf(35, 20, 'high')!;
    expect(ally.glow).toBe('emerald');
    expect(ally.strokeWidth).toBe('1.8px');
    expect(ally.fillColor).toBe('rgba(14, 174, 122, 0.65)');       // 35 is 1/6 of the way from #10b981 (+30) to #047857 (+60); 20 ties -> opacity 0.65
    expect(ally.hoverFillColor.endsWith('0.9)')).toBe(true);
    const rival = toneOf(-44, 10, 'low')!;
    expect(rival.glow).toBe('rose');
    const [r] = toneColor(-44);
    expect(r).toBeGreaterThan(159);
    expect(r).toBeLessThan(225);                       // between the two reds
    expect(toneOf(-8, 5, 'low')!.glow).toBe('');
  });

  it('labels positions in Spanish at the stop boundaries', () => {
    expect(positionLabelEs(35)).toBe('Alianza');
    expect(positionLabelEs(12)).toBe('Cooperación estrecha');
    expect(positionLabelEs(6)).toBe('Acuerdo preferencial');
    expect(positionLabelEs(0)).toBe('Sin posición registrada');
    expect(positionLabelEs(-8)).toBe('Fricción latente');
    expect(positionLabelEs(-44)).toBe('Rivalidad o sanciones');
    expect(positionLabelEs(-100)).toBe('Conflicto o ruptura');
  });
});
