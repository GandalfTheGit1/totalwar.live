import { describe, it, expect } from 'vitest';
import {
  MILITARY_FACTORS, rankCountries, explainRank,
} from '@/lib/services/military-ranking';
import { MILITARY_FORCES } from '@/lib/data/military-forces';

const tech = (code: string) => ({ US: 95, CN: 84, RU: 62 }[code] ?? 50);

describe('military ranking', () => {
  it('factor weights add up to 100', () => {
    expect(MILITARY_FACTORS.reduce((s, f) => s + f.weight, 0)).toBe(100);
  });

  it('ranks every country with data, 1-based and sorted by score', () => {
    const r = rankCountries('global', tech);
    expect(r).toHaveLength(Object.keys(MILITARY_FORCES).length);
    expect(r[0].rank).toBe(1);
    for (let i = 1; i < r.length; i++) expect(r[i - 1].score).toBeGreaterThanOrEqual(r[i].score);
  });

  it('puts the United States first overall', () => {
    expect(rankCountries('global', tech)[0].code).toBe('US');
  });

  it('single criteria rank by that factor only', () => {
    const nuclear = rankCountries('nuclear', tech).map((r) => r.code);
    expect(nuclear.slice(0, 2).sort()).toEqual(['RU', 'US']);
    expect(rankCountries('naval', tech)[0].code).toBe('CN');
  });

  it('explains a non-leader against #1', () => {
    const ranking = rankCountries('global', tech);
    const e = explainRank('CN', ranking, tech)!;
    expect(e.referenceCode).toBe('US');
    expect(e.factors).toHaveLength(MILITARY_FACTORS.length);
    const troops = e.factors.find((f) => f.key === 'troops')!;
    expect(troops.pct).toBeGreaterThan(100);
    const budget = e.factors.find((f) => f.key === 'budget')!;
    expect(budget.pct).toBeLessThan(100);
    expect(e.strongest.pct).toBeGreaterThanOrEqual(e.weakest.pct);
  });

  it('compares the leader against #2', () => {
    const ranking = rankCountries('global', tech);
    const e = explainRank(ranking[0].code, ranking, tech)!;
    expect(e.referenceCode).toBe(ranking[1].code);
  });

  it('returns null for countries without force data', () => {
    expect(explainRank('ZZ', rankCountries('global', tech), tech)).toBeNull();
  });
});
