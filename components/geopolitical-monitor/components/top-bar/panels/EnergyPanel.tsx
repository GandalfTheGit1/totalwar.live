'use client';

import React from 'react';
import { Fuel, Flame } from 'lucide-react';
import { CHOKEPOINT_LIST } from '../../../types';
import { Meter, Pill } from '../primitives';
import { levelLowerBetter } from '../metrics';
import type { TopBarContext } from '../types';

const ENERGY = /crudo|gnl|glp|condensado|petr|gas/i;

export const EnergyPanel: React.FC<{ ctx: TopBarContext }> = ({ ctx }) => {
  const rows = CHOKEPOINT_LIST.filter((c) => c.primaryCommodities.some((p) => ENERGY.test(p)));
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col">
        {rows.map((c) => {
          const blocked = ctx.blockedChokepoints.includes(c.id);
          return (
            <Meter key={c.id} icon={blocked ? Flame : Fuel} title={`${c.nameEs}${blocked ? ' (bloqueado)' : ''}`} pct={c.globalTradeSharePct * 3} level={blocked ? 'bad' : levelLowerBetter(c.globalTradeSharePct, 10, 20)} value={`${c.globalTradeSharePct}%`} />
          );
        })}
      </div>
      <Pill icon={Fuel} color="var(--accent)">Sin precios Brent/TTF</Pill>
    </div>
  );
};
