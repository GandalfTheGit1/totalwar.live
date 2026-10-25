/**
 * lib/services/military-ranking.ts
 *
 * Pure military ranking and "why this rank" comparison against the leader.
 * Each factor is normalised against the best value in the pool (0-100) and
 * combined with fixed weights into a composite index.
 */

import { MILITARY_FORCES, type MilitaryForces } from '../data/military-forces';

export type MilitaryFactorKey =
  | 'budget' | 'troops' | 'ground' | 'air' | 'naval' | 'nuclear' | 'tech';

export type RankingCriterion = 'global' | 'nuclear' | 'naval' | 'budget';

export interface MilitaryFactorDef {
  key: MilitaryFactorKey;
  label: string;
  weight: number; // percent, sums to 100
}

export const MILITARY_FACTORS: MilitaryFactorDef[] = [
  { key: 'budget', label: 'Gasto', weight: 20 },
  { key: 'troops', label: 'Tropas', weight: 15 },
  { key: 'ground', label: 'Tanques', weight: 15 },
  { key: 'air', label: 'Aviones', weight: 15 },
  { key: 'naval', label: 'Buques', weight: 15 },
  { key: 'nuclear', label: 'Nuclear', weight: 10 },
  { key: 'tech', label: 'Tecnología', weight: 10 },
];

export type TechScoreFn = (code: string) => number;

export function factorValue(code: string, key: MilitaryFactorKey, tech: TechScoreFn): number {
  const f: MilitaryForces | undefined = MILITARY_FORCES[code];
  if (!f) return 0;
  switch (key) {
    case 'budget': return f.budgetBnUsd;
    case 'troops': return f.activeTroopsK;
    case 'ground': return f.mainBattleTanks;
    case 'air': return f.combatAircraft;
    case 'naval': return f.majorWarships;
    case 'nuclear': return f.warheads;
    case 'tech': return tech(code);
  }
}

export interface RankedCountry {
  code: string;
  score: number; // 0-100
  rank: number;  // 1-based
}

export function rankCountries(criterion: RankingCriterion, tech: TechScoreFn): RankedCountry[] {
  const codes = Object.keys(MILITARY_FORCES);
  const keys: MilitaryFactorKey[] =
    criterion === 'nuclear' ? ['nuclear']
    : criterion === 'naval' ? ['naval']
    : criterion === 'budget' ? ['budget']
    : MILITARY_FACTORS.map((f) => f.key);

  const maxByKey = new Map<MilitaryFactorKey, number>();
  for (const k of keys) {
    maxByKey.set(k, Math.max(1, ...codes.map((c) => factorValue(c, k, tech))));
  }

  const weightOf = (k: MilitaryFactorKey) =>
    criterion === 'global' ? MILITARY_FACTORS.find((f) => f.key === k)!.weight : 100;

  return codes
    .map((code) => ({
      code,
      // weights sum to 100 (single criteria use 100), so the sum is already 0-100
      score: Math.round(
        keys.reduce((s, k) => s + (factorValue(code, k, tech) / maxByKey.get(k)!) * weightOf(k), 0)
      ),
    }))
    .sort((a, b) => b.score - a.score || a.code.localeCompare(b.code))
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

export interface FactorComparison {
  key: MilitaryFactorKey;
  label: string;
  weight: number;
  own: number;
  reference: number;
  pct: number; // own / reference, 100 = parity
}

export interface RankExplanation {
  code: string;
  rank: number;
  referenceCode: string;
  factors: FactorComparison[];
  strongest: FactorComparison;
  weakest: FactorComparison;
}

/** Compares a country against the #1 power (or against #2 when it is the leader). */
export function explainRank(
  code: string,
  ranking: RankedCountry[],
  tech: TechScoreFn
): RankExplanation | null {
  const me = ranking.find((r) => r.code === code);
  if (!me) return null;
  const ref = me.rank === 1 ? ranking[1] : ranking[0];
  if (!ref) return null;

  const factors = MILITARY_FACTORS.map((f) => {
    const own = factorValue(code, f.key, tech);
    const reference = factorValue(ref.code, f.key, tech);
    const pct = reference === 0 ? (own === 0 ? 100 : 200) : Math.round((own / reference) * 100);
    return { key: f.key, label: f.label, weight: f.weight, own, reference, pct };
  });
  const sorted = [...factors].sort((a, b) => b.pct - a.pct);
  return {
    code,
    rank: me.rank,
    referenceCode: ref.code,
    factors,
    strongest: sorted[0],
    weakest: sorted[sorted.length - 1],
  };
}
