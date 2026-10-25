'use client';

import React from 'react';
import { Gem } from 'lucide-react';
import { FriendshoringService, type CriticalCommodityKey } from '@/lib/services/geographic/friendshoring-service';
import { countryName as nameOf } from '../../../utils/sovereign-cache';
import { ChipRow, Meter, Pill } from '../primitives';
import { levelLowerBetter } from '../metrics';
import type { TopBarContext } from '../types';


export const ResourcesPanel: React.FC<{ ctx: TopBarContext }> = ({ ctx }) => {
  const all = FriendshoringService.getAllCommodities();
  const current = ctx.selectedCommodity ? FriendshoringService.getCommodityById(ctx.selectedCommodity) : undefined;
  return (
    <div className="flex flex-col gap-3">
      <ChipRow
        items={all.map((c) => ({ id: c.id, label: c.label, title: c.name, pressed: c.id === ctx.selectedCommodity }))}
        onToggle={(id) => ctx.setSelectedCommodity(id as CriticalCommodityKey)}
      />
      {current && (
        <>
          <div data-testid="resources-origins" className="flex flex-col">
            {current.vulnerableOrigins.map((o) => (
              <div key={o.countryCode} className={o.countryCode === ctx.iso2 ? 'rounded bg-[var(--surface-3)] px-1' : ''}>
                <Meter icon={Gem} title={`${nameOf(o.countryCode)} · ${o.rationale}`} pct={o.marketSharePercentage} level={levelLowerBetter(o.marketSharePercentage, 25, 50)} value={`${o.marketSharePercentage}%`} />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {current.viableSubstitutes.map((s) => (
              <Pill key={s.countryCode} color="var(--gain)">{nameOf(s.countryCode)}</Pill>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
