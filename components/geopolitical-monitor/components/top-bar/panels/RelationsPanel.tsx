'use client';

import React, { useMemo, useState } from 'react';
import { Ban, Handshake, Receipt, Swords } from 'lucide-react';
import { GeopoliticalKnowledgeService } from '@/lib/services/geopolitical-knowledge-service';
import { BigStat, ChipRow, LEVEL_COLOR, NoCountry } from '../primitives';
import { averageFriction, levelLowerBetter } from '../metrics';
import type { Level, TopBarContext } from '../types';

type Tab = 'tariffs' | 'sanctions' | 'allies';
const TARIFF_RANK: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, EXTREME: 4 };
const TARIFF_ES: Record<string, string> = { LOW: 'Bajo', MEDIUM: 'Medio', HIGH: 'Alto', EXTREME: 'Extremo' };
const TARIFF_LEVEL: Record<string, Level> = { LOW: 'ok', MEDIUM: 'warn', HIGH: 'bad', EXTREME: 'bad' };
const TABS = [
  { id: 'tariffs', icon: Receipt, title: 'Aranceles' },
  { id: 'sanctions', icon: Ban, title: 'Sanciones y fricción' },
  { id: 'allies', icon: Handshake, title: 'Alianzas' },
] as const;

export const RelationsPanel: React.FC<{ ctx: TopBarContext }> = ({ ctx }) => {
  const [tab, setTab] = useState<Tab>('tariffs');
  const profile = useMemo(() => (ctx.iso2 ? GeopoliticalKnowledgeService.getCountryProfile(ctx.iso2) : null), [ctx.iso2]);
  const friction = averageFriction(ctx.iso2);

  const rows = useMemo(() => {
    if (!profile) return [];
    const mapped = profile.relations.map((e) => {
      const other = e.countryA.code === profile.country.code ? e.countryB : e.countryA;
      return { code: other.code, name: other.nameEs, edge: e };
    });
    if (tab === 'tariffs') {
      return mapped
        .filter((r) => r.edge.tariffRisk)
        .sort((a, b) => (TARIFF_RANK[b.edge.tariffRisk!] ?? 0) - (TARIFF_RANK[a.edge.tariffRisk!] ?? 0))
        .map((r) => ({ ...r, value: TARIFF_ES[r.edge.tariffRisk!] ?? r.edge.tariffRisk!, level: TARIFF_LEVEL[r.edge.tariffRisk!] ?? 'warn' as Level }));
    }
    if (tab === 'sanctions') {
      return mapped
        .filter((r) => r.edge.stance === 'SANCTIONED_ADVERSARIAL' || r.edge.stance === 'FRICTION_STRATEGIC_COMPETITION')
        .sort((a, b) => b.edge.frictionScore - a.edge.frictionScore)
        .map((r) => ({ ...r, value: r.edge.frictionScore.toFixed(1), level: (r.edge.stance === 'SANCTIONED_ADVERSARIAL' ? 'bad' : 'warn') as Level }));
    }
    return mapped
      .filter((r) => r.edge.stance === 'STRATEGIC_ALLY' || r.edge.stance === 'ECONOMIC_PARTNER')
      .map((r) => ({ ...r, value: r.edge.stance === 'STRATEGIC_ALLY' ? 'Aliado' : 'Socio', level: 'ok' as Level }));
  }, [profile, tab]);

  if (!ctx.iso2 || !profile) return <NoCountry icon={Handshake} />;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <BigStat icon={Swords} value={friction !== null ? `${friction.toFixed(1)}/10` : '—'} level={friction !== null ? levelLowerBetter(friction, 4, 6.5) : 'na'} title="Fricción media con sus socios" />
        <ChipRow
          items={TABS.map((t) => ({ id: t.id, title: t.title, pressed: tab === t.id, label: <t.icon className="h-4 w-4" aria-label={t.title} /> }))}
          onToggle={(id) => setTab(id as Tab)}
        />
      </div>
      <ul className="flex flex-col" data-testid="relations-list">
        {rows.length === 0 && <li className="py-3 text-center text-xs text-[var(--ink-faint)]">—</li>}
        {rows.slice(0, 8).map((r) => (
          <li key={r.code} className="flex items-center justify-between border-b border-[var(--hairline)] py-1.5 text-xs text-[var(--ink-muted)]">
            <span>{r.name}</span>
            <b className="font-mono font-medium" style={{ color: LEVEL_COLOR[r.level] }}>{r.value}</b>
          </li>
        ))}
      </ul>
    </div>
  );
};
