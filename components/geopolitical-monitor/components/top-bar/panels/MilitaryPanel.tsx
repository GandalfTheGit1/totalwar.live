'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowDown, ArrowUp, ChartPie, Coins, Crosshair, Cpu, Link as LinkIcon, Plane, Radiation, Ship, Swords, Users,
  type LucideIcon,
} from 'lucide-react';
import {
  explainRank, rankCountries, MILITARY_FACTORS,
  type MilitaryFactorKey, type RankingCriterion,
} from '@/lib/services/military-ranking';
import { MILITARY_FORCES } from '@/lib/data/military-forces';
import { countryName as name, militaryTechScore } from '../../../utils/sovereign-cache';
import { ChipRow, LEVEL_COLOR, NoCountry, Pill, levelFromRatio } from '../primitives';
import type { TopBarContext } from '../types';

const FACTOR_ICON: Record<MilitaryFactorKey, LucideIcon> = {
  budget: Coins, troops: Users, ground: Crosshair, air: Plane, naval: Ship, nuclear: Radiation, tech: Cpu,
};
const FACTOR_TITLE: Record<MilitaryFactorKey, string> = {
  budget: 'Gasto militar (miles de millones USD)',
  troops: 'Tropas activas',
  ground: 'Carros de combate',
  air: 'Aviones de combate',
  naval: 'Buques mayores',
  nuclear: 'Ojivas nucleares',
  tech: 'Tecnología militar (0-100)',
};
const CRITERIA: { id: RankingCriterion; icon: LucideIcon; title: string }[] = [
  { id: 'global', icon: Swords, title: 'Índice global' },
  { id: 'nuclear', icon: Radiation, title: 'Nuclear' },
  { id: 'naval', icon: Ship, title: 'Naval' },
  { id: 'budget', icon: Coins, title: 'Gasto' },
];

function compact(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace('.', ',')}k` : String(n);
}
function fmt(key: MilitaryFactorKey, v: number): string {
  if (key === 'budget') return `$${v}`;
  if (key === 'tech') return `${v}/100`;
  return compact(v);
}

export const MilitaryPanel: React.FC<{ ctx: TopBarContext }> = ({ ctx }) => {
  const [criterion, setCriterion] = useState<RankingCriterion>('global');
  const ranking = useMemo(() => rankCountries(criterion, militaryTechScore), [criterion]);
  const globalRanking = useMemo(() => rankCountries('global', militaryTechScore), []);
  const mine = ctx.iso2 ? ranking.find((r) => r.code === ctx.iso2) : undefined;
  const explanation = useMemo(
    () => (ctx.iso2 ? explainRank(ctx.iso2, globalRanking, militaryTechScore) : null),
    [ctx.iso2, globalRanking]
  );
  const top = ranking.slice(0, 5);
  const rows = mine && mine.rank > 5 ? [...top, mine] : top;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="font-mono text-3xl font-medium leading-none text-[var(--info)]">
          {mine ? `#${mine.rank}` : '—'}
        </span>
        <span className="text-xs text-[var(--ink-faint)]">de {ranking.length}</span>
        <div className="ml-auto">
          <ChipRow
            items={CRITERIA.map((c) => ({ id: c.id, title: c.title, pressed: criterion === c.id, label: <c.icon className="h-4 w-4" aria-label={c.title} /> }))}
            onToggle={(id) => setCriterion(id as RankingCriterion)}
          />
        </div>
      </div>

      <ol className="flex flex-col gap-0.5" data-testid="military-ranking-list">
        {rows.map((r) => (
          <li
            key={r.code}
            className={`grid grid-cols-[1.5rem_1fr_3.5rem_1.75rem] items-center gap-2 rounded px-1.5 py-0.5 text-xs ${
              r.code === ctx.iso2 ? 'bg-[var(--surface-3)] text-[var(--ink)] ring-1 ring-[var(--accent)]' : 'text-[var(--ink-muted)]'
            }`}
          >
            <span className="font-mono text-[var(--ink-faint)]">{r.rank}</span>
            <span className="truncate">{name(r.code)}</span>
            <span className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
              <span className="block h-full bg-[var(--info)]" style={{ width: `${r.score}%` }} />
            </span>
            <span className="text-right font-mono text-[var(--ink)]">{r.score}</span>
          </li>
        ))}
      </ol>

      {!ctx.iso2 && <NoCountry icon={Swords} />}
      {ctx.iso2 && !MILITARY_FORCES[ctx.iso2] && (
        <NoCountry icon={Swords} text="Sin datos de fuerzas para este país" />
      )}

      {explanation && (
        <section aria-label="Por qué este puesto" className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--ink-muted)]">
            <span>{name(explanation.code)}</span>
            <span className="text-[var(--ink-faint)]">vs #{explanation.rank === 1 ? 2 : 1}</span>
            <span>{name(explanation.referenceCode)}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Pill icon={ArrowUp} color="var(--gain)">{explanation.strongest.label}</Pill>
            <Pill icon={ArrowDown} color="var(--loss)">{explanation.weakest.label}</Pill>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {explanation.factors.map((f) => {
              const Icon = FACTOR_ICON[f.key];
              const level = levelFromRatio(f.pct);
              return (
                <div
                  key={f.key}
                  data-testid={`military-factor-${f.key}`}
                  title={`${FACTOR_TITLE[f.key]} · peso ${f.weight}%`}
                  className="min-w-0 rounded bg-[var(--surface-2)] px-2 py-1.5"
                >
                  <div className="flex items-center gap-1.5 text-xs text-[var(--ink-muted)]">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" aria-hidden="true" />
                    <span className="truncate">{f.label}</span>
                    <b className="ml-auto font-mono font-medium" style={{ color: LEVEL_COLOR[level] }}>{f.pct}%</b>
                  </div>
                  <div className="my-1 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, f.pct)}%`, background: LEVEL_COLOR[level] }} />
                  </div>
                  <div className="font-mono text-[11px] text-[var(--ink-faint)]">
                    {fmt(f.key, f.own)} / {fmt(f.key, f.reference)}
                  </div>
                </div>
              );
            })}
            <div className="min-w-0 rounded bg-[var(--surface-2)] px-2 py-1.5 text-xs text-[var(--ink-muted)]" title="Gasto militar sobre PIB">
              <div className="flex items-center gap-1.5">
                <ChartPie className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden="true" />
                <span>% PIB</span>
              </div>
              <div className="mt-1 font-mono text-[11px] text-[var(--ink-faint)]">
                {MILITARY_FORCES[explanation.code].budgetPctGdp}% / {MILITARY_FORCES[explanation.referenceCode].budgetPctGdp}%
              </div>
            </div>
          </div>
          {ctx.profile && (
            <div className="flex flex-wrap gap-1.5">
              {ctx.profile.dossiers.military.alliances.map((a) => (
                <Pill key={a} icon={LinkIcon}>{a}</Pill>
              ))}
            </div>
          )}
          <span className="sr-only">
            Pesos: {MILITARY_FACTORS.map((f) => `${f.label} ${f.weight}%`).join(', ')}
          </span>
        </section>
      )}
    </div>
  );
};
