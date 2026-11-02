import { describe, expect, it } from 'vitest';
import catalog from '@/lib/data/trading-economics/catalog.json';
import { searchIndicators } from '@/lib/trading-economics/search';
import type { TeIndicator, TeIndicatorValues } from '@/lib/trading-economics/country-list';
import { buildIndicatorLayerMap } from '@/components/geopolitical-monitor/components/indicators/indicator-layer';

const CATALOG = catalog as TeIndicator[];
const top = (q: string) => searchIndicators(CATALOG, q, 3)[0]?.indicator.slug;

describe('searchIndicators (real catalog)', () => {
  it.each([
    ['inflacion', 'inflation-rate'],
    ['paro', 'unemployment-rate'],
    ['deuda publica', 'government-debt-to-gdp'],
    ['tipo de interes', 'interest-rate'],
    ['PIB', 'gdp'],
    ['Interest Rate', 'interest-rate'],
  ])('«%s» → %s first', (q, slug) => {
    expect(top(q)).toBe(slug);
  });

  it('returns nothing for empty queries', () => {
    expect(searchIndicators(CATALOG, '  ')).toEqual([]);
  });
});

describe('buildIndicatorLayerMap', () => {
  const values = {
    slug: 'inflation-rate', name: 'Inflation Rate', category: 'Prices',
    countries: {
      VEN: { name: 'Venezuela', value: 466, previous: 534, reference: 'Sep/26', unit: '%', cells: {} },
      ESP: { name: 'Spain', value: 2, previous: null, reference: 'Oct/26', unit: '%', cells: {} },
      CHE: { name: 'Switzerland', value: 1, previous: 0.8, reference: 'Sep/26', unit: '%', cells: {} },
      ERI: { name: 'Eritrea', value: null, previous: null, reference: null, unit: null, cells: {} },
    },
  } as unknown as TeIndicatorValues;

  it('ranks by value, skips nulls and registers ISO2 + ISO3', () => {
    const map = buildIndicatorLayerMap(values);
    expect(map.VEN.colorCategory).toBe('critical');
    expect(map.CHE.colorCategory).toBe('low');
    expect(map.ES).toBe(map.ESP);
    expect(map.ERI).toBeUndefined();
    expect(map.VEN.label).toBe('Inflation Rate: 466 % (Sep/26)');
    expect(map.VEN.sublabel).toBe('Puesto 1 de 3 · anterior 534 %');
  });
});
