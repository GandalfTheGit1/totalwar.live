/**
 * top-bar/metrics.ts
 *
 * Pure computation of the nine cell values from real engine data.
 * No React: unit-testable. `na` means "no data for this country", never zero.
 */

import { GeopoliticalKnowledgeService } from '@/lib/services/geopolitical-knowledge-service';
import { CRITICAL_COMMODITIES_REGISTRY } from '@/lib/data/critical-commodities-registry';
import { rankCountries } from '@/lib/services/military-ranking';
import type { CountrySovereignPowerProfile } from '@/lib/types/sovereign-power';
import type { CountryMacroData } from '../../types';
import { militaryTechScore, unrestRisk } from '../../utils/sovereign-cache';
import type { CellValue, Level, TopBarCells } from './types';

const NA: CellValue = { text: '—', level: 'na' };

export function levelHigherBetter(v: number, ok: number, warn: number): Level {
  return v >= ok ? 'ok' : v >= warn ? 'warn' : 'bad';
}

export function levelLowerBetter(v: number, ok: number, warn: number): Level {
  return v <= ok ? 'ok' : v <= warn ? 'warn' : 'bad';
}

export function parsePercent(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const n = parseFloat(String(raw).replace(',', '.').replace(/[^\d.+-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

export function averageFriction(iso2: string | null): number | null {
  if (!iso2) return null;
  const prof = GeopoliticalKnowledgeService.getCountryProfile(iso2);
  if (!prof || prof.relations.length === 0) return null;
  const sum = prof.relations.reduce((s, e) => s + e.frictionScore, 0);
  return Math.round((sum / prof.relations.length) * 10) / 10;
}

export function controlledCommodities(iso2: string | null, minShare = 20): number {
  if (!iso2) return 0;
  return Object.values(CRITICAL_COMMODITIES_REGISTRY).filter((c) =>
    c.vulnerableOrigins.some((o) => o.countryCode === iso2 && o.marketSharePercentage >= minShare)
  ).length;
}

export interface MetricsInput {
  iso2: string | null;
  profile: CountrySovereignPowerProfile | null;
  macro: CountryMacroData | null;
  blockedCount: number;
}

export function computeCells({ iso2, profile, macro, blockedCount }: MetricsInput): TopBarCells {
  const ranking = rankCountries('global', militaryTechScore);
  const rank = iso2 ? ranking.find((r) => r.code === iso2)?.rank : undefined;

  const risk = profile ? unrestRisk(profile) : null;
  const tech = profile ? profile.dossiers.tech.score : null;
  const debt = parsePercent(macro?.debtToGdp);
  const friction = averageFriction(iso2);
  const controlled = controlledCommodities(iso2);
  const open = 6 - blockedCount;

  return {
    military: rank ? { text: `#${rank}`, level: 'neutral' } : NA,
    stability: risk !== null ? { text: String(risk), level: levelLowerBetter(risk, 25, 45) } : NA,
    tech: tech !== null ? { text: String(Math.round(tech)), level: levelHigherBetter(tech, 70, 50) } : NA,
    debt: debt !== null ? { text: `${Math.round(debt)}%`, level: levelLowerBetter(debt, 60, 100) } : NA,
    relations: friction !== null ? { text: friction.toFixed(1), level: levelLowerBetter(friction, 4, 6.5) } : NA,
    resources: iso2 && profile ? { text: String(controlled), level: controlled > 0 ? 'warn' : 'neutral' } : NA,
    ports: { text: `${open}/6`, level: levelHigherBetter(open, 5, 3) },
    energy: NA,
  };
}
