'use client';

/**
 * top-bar/TopInformationBar.tsx
 *
 * One-glance row: an icon and a number per domain, with a status underline.
 * Pressing a button opens its drawer and map layer. Names live in title/aria-label only.
 */

import React from 'react';
import { Globe } from 'lucide-react';
import { DOMAINS, GROUP_LABEL } from './domains';
import type { CellDomain, DomainDef, Level, TopBarCells, TopBarDomain } from './types';

const LEVEL_BAR: Record<Level, string> = {
  ok: 'bg-[var(--gain)]',
  warn: 'bg-[var(--accent)]',
  bad: 'bg-[var(--loss)]',
  neutral: 'bg-[var(--info)]',
  na: 'bg-[var(--hairline)]',
};

const LEVEL_TEXT: Record<Level, string> = {
  ok: 'correcto', warn: 'atención', bad: 'crítico', neutral: '', na: 'sin datos',
};

const DEFCON_COLOR: Record<number, string> = {
  1: '#ff7a66', 2: '#f2955a', 3: '#f2b84b', 4: '#a8d86b', 5: '#46d3c2',
};

function tensionColor(t: number): string {
  return t >= 80 ? '#ff7a66' : t >= 60 ? '#f2955a' : t >= 30 ? '#f2b84b' : '#46d3c2';
}

export interface TopInformationBarProps {
  cells: TopBarCells;
  activeDomain: TopBarDomain | null;
  onSelectDomain: (d: TopBarDomain) => void;
  tension: number;
  defcon: number;
  countryLabel: string | null;
  countryFlag?: string;
  className?: string;
}

const CellButton: React.FC<{
  def: DomainDef;
  value: { text: string; level: Level };
  active: boolean;
  onSelect: () => void;
}> = ({ def, value, active, onSelect }) => {
  const Icon = def.icon;
  const status = LEVEL_TEXT[value.level];
  return (
    <button
      type="button"
      data-testid={`topbar-cell-${def.key}`}
      aria-pressed={active}
      aria-label={`${def.title}: ${value.text}${status ? `, ${status}` : ''}`}
      title={def.title}
      onClick={onSelect}
      className={`flex min-w-[3.75rem] cursor-pointer flex-col items-center gap-0.5 rounded px-2 pb-1 pt-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] ${
        active
          ? 'bg-[var(--surface-3)] ring-1 ring-[var(--accent)]'
          : 'bg-[var(--surface-2)] hover:bg-[var(--surface-3)]'
      }`}
    >
      <span className="flex items-center gap-1.5">
        <Icon className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
        <span className="font-mono text-sm font-medium text-[var(--ink)]">{value.text}</span>
      </span>
      <span className={`h-0.5 w-3/4 rounded-full ${LEVEL_BAR[value.level]}`} />
    </button>
  );
};

export const TopInformationBar: React.FC<TopInformationBarProps> = ({
  cells,
  activeDomain,
  onSelectDomain,
  tension,
  defcon,
  countryLabel,
  countryFlag,
  className = '',
}) => {
  const groups = (['country', 'bilateral', 'flows'] as const).map((g) => ({
    g,
    items: DOMAINS.filter((d) => d.group === g),
  }));
  const tensionDef = DOMAINS.find((d) => d.key === 'tension')!;
  const dcColor = DEFCON_COLOR[defcon] ?? DEFCON_COLOR[5];
  const tColor = tensionColor(tension);

  return (
    <div
      data-testid="top-information-bar"
      role="toolbar"
      aria-label="Barra de situación global"
      className={`flex w-full flex-wrap items-stretch gap-2.5 border-b border-[var(--hairline)] bg-[var(--surface-1)] px-3 py-2 select-none ${className}`}
    >
      <div
        data-testid="topbar-country"
        className="flex min-w-24 flex-col justify-center rounded bg-[var(--surface-2)] px-3 py-1"
      >
        <span className="font-mono text-base font-medium text-[var(--ink)]">
          {countryFlag ? `${countryFlag} ` : ''}{countryLabel ?? 'Mundo'}
        </span>
      </div>

      {groups.map(({ g, items }) => (
        <div key={g} className="flex flex-col gap-0.5">
          <span className="hidden pl-0.5 text-[11px] uppercase tracking-wider text-[var(--ink-faint)] lg:block">
            {GROUP_LABEL[g]}
          </span>
          <div className="flex gap-0.5 self-start rounded-md border border-[var(--hairline)] bg-[var(--void)] p-0.5">
            {items.map((d) => (
              <CellButton
                key={d.key}
                def={d}
                value={cells[d.key as CellDomain]}
                active={activeDomain === d.key}
                onSelect={() => onSelectDomain(d.key)}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="ml-auto flex items-center gap-2.5">
        <div
          data-testid="topbar-defcon"
          className="rounded border bg-[var(--void)] px-2.5 py-1.5 font-mono text-sm font-medium"
          style={{ color: dcColor, borderColor: dcColor }}
        >
          DEFCON {defcon}
        </div>
        <button
          type="button"
          data-testid="topbar-cell-tension"
          aria-pressed={activeDomain === 'tension'}
          aria-label={`${tensionDef.title}: ${Math.round(tension)}%`}
          title={tensionDef.title}
          onClick={() => onSelectDomain('tension')}
          className="flex cursor-pointer flex-col items-center font-mono text-sm font-medium text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
        >
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full border-2 bg-[var(--void)] ${
              activeDomain === 'tension' ? 'ring-2 ring-[var(--accent)]' : ''
            }`}
            style={{ borderColor: tColor }}
          >
            <Globe className="h-5 w-5" style={{ color: tColor }} aria-hidden="true" />
          </span>
          {Math.round(tension)}%
        </button>
      </div>
    </div>
  );
};
