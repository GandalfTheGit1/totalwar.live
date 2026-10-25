'use client';

/**
 * top-bar/TopBarDrawer.tsx
 *
 * Left drawer that hosts the menu of the active top-bar domain.
 * Esc and the close button hide it (the parent restores the previous map scene).
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { getDomain } from './domains';
import { MilitaryPanel } from './panels/MilitaryPanel';
import { StabilityPanel } from './panels/StabilityPanel';
import { TechPanel } from './panels/TechPanel';
import { DebtPanel } from './panels/DebtPanel';
import { RelationsPanel } from './panels/RelationsPanel';
import { ResourcesPanel } from './panels/ResourcesPanel';
import { PortsPanel } from './panels/PortsPanel';
import { EnergyPanel } from './panels/EnergyPanel';
import { TensionPanel } from './panels/TensionPanel';
import type { TopBarContext, TopBarDomain } from './types';

const PANELS: Record<TopBarDomain, React.FC<{ ctx: TopBarContext }>> = {
  military: MilitaryPanel, stability: StabilityPanel, tech: TechPanel, debt: DebtPanel,
  relations: RelationsPanel, resources: ResourcesPanel, ports: PortsPanel, energy: EnergyPanel,
  tension: TensionPanel,
};

export const TopBarDrawer: React.FC<{
  domain: TopBarDomain | null;
  ctx: TopBarContext;
  onClose: () => void;
}> = ({ domain, ctx, onClose }) => {
  useEffect(() => {
    if (!domain) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [domain, onClose]);

  if (!domain) return null;
  const def = getDomain(domain);
  const Panel = PANELS[domain];
  const Icon = def.icon;

  return (
    <aside
      data-testid="top-bar-drawer"
      aria-label={def.title}
      className="absolute bottom-3 left-3 top-[calc(var(--topbar-h,56px)+0.75rem)] z-30 flex w-[19rem] max-w-[calc(100vw-1.5rem)] flex-col overflow-y-auto rounded-lg border border-[var(--hairline)] bg-[var(--surface-1)]/95 p-3 text-[var(--ink)] shadow-[var(--shadow-pop)] backdrop-blur-xl"
    >
      <header className="mb-3 flex items-center gap-2">
        <Icon className="h-5 w-5 text-[var(--accent)]" aria-hidden="true" />
        <h2 className="text-sm font-medium">{def.title}</h2>
        <span className="truncate text-xs text-[var(--ink-faint)]">
          {['ports', 'energy', 'tension'].includes(domain) ? 'Global' : ctx.countryName ?? ''}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar panel"
          className="ml-auto cursor-pointer rounded p-1 text-[var(--ink-faint)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
        >
          <X className="h-4 w-4" />
        </button>
      </header>
      <Panel ctx={ctx} />
    </aside>
  );
};
