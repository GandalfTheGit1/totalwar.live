'use client';

/** top-bar/primitives.tsx - small icon-first building blocks shared by the drawer panels. */

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import type { Level } from './types';

export const LEVEL_COLOR: Record<Level, string> = {
  ok: 'var(--gain)', warn: 'var(--accent)', bad: 'var(--loss)', neutral: 'var(--info)', na: 'var(--ink-faint)',
};

export function levelFromRatio(pct: number): Level {
  return pct >= 100 ? 'ok' : pct >= 60 ? 'warn' : 'bad';
}

export const BigStat: React.FC<{ icon: LucideIcon; value: string; level?: Level; title: string }> = ({
  icon: Icon, value, level = 'neutral', title,
}) => (
  <div title={title} className="flex flex-1 items-center gap-2 rounded bg-[var(--surface-2)] px-3 py-2">
    <Icon className="h-5 w-5 shrink-0" style={{ color: LEVEL_COLOR[level] }} aria-hidden="true" />
    <span className="font-mono text-xl font-medium" style={{ color: LEVEL_COLOR[level] }}>{value}</span>
  </div>
);

export const Meter: React.FC<{ icon: LucideIcon; title: string; pct: number; level: Level; value: string }> = ({
  icon: Icon, title, pct, level, value,
}) => (
  <div title={title} className="grid grid-cols-[1rem_1fr_auto] items-center gap-2 py-1">
    <Icon className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
      <div className="h-full rounded-full" style={{ width: `${Math.max(2, Math.min(100, pct))}%`, background: LEVEL_COLOR[level] }} />
    </div>
    <span className="min-w-8 text-right font-mono text-xs text-[var(--ink)]">{value}</span>
  </div>
);

export const Pill: React.FC<{ icon?: LucideIcon; color?: string; children: React.ReactNode }> = ({
  icon: Icon, color, children,
}) => (
  <span
    className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-2)] px-2.5 py-0.5 text-xs"
    style={{ color: color ?? 'var(--ink-muted)' }}
  >
    {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
    {children}
  </span>
);

export const ChipRow: React.FC<{
  items: { id: string; label: React.ReactNode; title?: string; pressed: boolean; danger?: boolean }[];
  onToggle: (id: string) => void;
}> = ({ items, onToggle }) => (
  <div className="flex flex-wrap gap-1" role="group">
    {items.map((i) => (
      <button
        key={i.id}
        type="button"
        title={i.title}
        aria-pressed={i.pressed}
        onClick={() => onToggle(i.id)}
        className={`cursor-pointer rounded border px-2 py-1 text-xs transition-colors ${
          i.pressed
            ? i.danger
              ? 'border-[var(--loss)] text-[var(--loss)]'
              : 'border-[var(--accent)] text-[var(--accent)]'
            : 'border-[var(--hairline)] bg-[var(--surface-2)] text-[var(--ink-muted)] hover:bg-[var(--surface-3)]'
        }`}
      >
        {i.label}
      </button>
    ))}
  </div>
);

export const NoCountry: React.FC<{ icon: LucideIcon; text?: string }> = ({ icon: Icon, text }) => (
  <div className="flex flex-col items-center gap-2 py-8 text-center text-xs text-[var(--ink-faint)]">
    <Icon className="h-8 w-8" aria-hidden="true" />
    <span>{text ?? 'Selecciona un país en el mapa'}</span>
  </div>
);
