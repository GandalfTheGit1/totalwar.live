/**
 * __tests__/bloomberg-originals.test.tsx
 *
 * Country aggregation of the Bloomberg Originals index, its API route and sidebar section.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import React from 'react';
import { BloombergOriginalsSection } from '@/components/geopolitical-monitor/components/sidebar/BloombergOriginalsSection';
import { getBloombergForCountry, type BloombergOriginalsFile } from '@/lib/services/bloomberg-originals/store';
import { GET } from '@/app/api/bloomberg-originals/[code]/route';

const fixture: BloombergOriginalsFile = {
  source: 'test',
  channelId: 'x',
  generatedAt: '2026-10-31T00:00:00Z',
  since: '20241031',
  datesApproximate: true,
  videos: [
    { id: 'a', title: 'Old', published: '2025-01-01', views: 1, countries: ['MX'], companies: [{ name: 'Cemex', ticker: 'CX' }], sectors: ['cemento'], stance: 'favorable', thesis: '' },
    { id: 'b', title: 'New', published: '2026-10-01', views: 1, countries: ['MX', 'US'], companies: [{ name: 'CEMEX', ticker: 'cx' }], sectors: ['Cemento', 'inmobiliario'], stance: 'riesgo', thesis: '' },
    { id: 'c', title: 'Other', published: '2026-01-01', views: 1, countries: ['IN'], companies: [], sectors: [], stance: 'neutral', thesis: '' },
  ],
};

describe('getBloombergForCountry', () => {
  it('filters by country, sorts newest first and aggregates companies and sectors', () => {
    const p = getBloombergForCountry('mx', fixture)!;
    expect(p.videos.map(v => v.id)).toEqual(['b', 'a']);
    expect(p.videos[0].url).toBe('https://www.youtube.com/watch?v=b');
    expect(p.totals).toEqual({ videos: 2, favorable: 1, riesgo: 1, mixto: 0, neutral: 0 });
    expect(p.companies).toEqual([{ name: 'CEMEX', ticker: 'cx', mentions: 2 }]); // newest spelling wins
    expect(p.sectors[0]).toEqual({ name: 'Cemento', mentions: 2 });
  });

  it('attaches curated signals for the country', () => {
    const sig = { category: 'politico', ficha: null, videoId: 'a', claim: 'c', quote: 'q' };
    expect(getBloombergForCountry('MX', fixture, { MX: [sig] })!.signals).toEqual([sig]);
    expect(getBloombergForCountry('IN', fixture, { MX: [sig] })!.signals).toEqual([]);
  });

  it('returns an empty payload for a country without videos and null without data', () => {
    expect(getBloombergForCountry('FR', fixture)!.totals.videos).toBe(0);
    expect(getBloombergForCountry('FR', null)).toBeNull();
  });
});

describe('GET /api/bloomberg-originals/[code]', () => {
  it('rejects unknown country codes', async () => {
    const res = await GET({} as any, { params: Promise.resolve({ code: 'ZZZZ' }) });
    expect(res.status).toBe(404);
  });
});

describe('BloombergOriginalsSection', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('shows counters, companies and filters videos by stance', async () => {
    const payload = getBloombergForCountry('MX', fixture);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => payload }));
    render(<BloombergOriginalsSection countryCode="MX" countryName="México" />);

    expect(await screen.findByText('New')).toBeDefined();
    expect(screen.getByText('Old')).toBeDefined();
    expect(screen.getByText(/CEMEX · cx ×2/)).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Riesgo' }));
    expect(screen.queryByText('Old')).toBeNull();
    expect(screen.getByText('New')).toBeDefined();
  });

  it('shows the empty state when the API has no data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    render(<BloombergOriginalsSection countryCode="FR" countryName="Francia" />);
    expect(await screen.findByTestId('bloomberg-originals-section-empty')).toBeDefined();
  });
});
