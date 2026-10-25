'use client';

import React from 'react';
import { Globe, Newspaper, Siren } from 'lucide-react';
import { BigStat, Meter, Pill } from '../primitives';
import { levelLowerBetter } from '../metrics';
import type { TopBarContext } from '../types';

export const TensionPanel: React.FC<{ ctx: TopBarContext }> = ({ ctx }) => {
  const w = ctx.worldTension;
  const t = Math.round(w?.tensionIndex ?? 0);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <BigStat icon={Globe} value={`${t}%`} level={levelLowerBetter(t, 30, 60)} title="Tensión mundial" />
        <BigStat icon={Siren} value={String(ctx.defcon)} level={ctx.defcon >= 4 ? 'ok' : ctx.defcon === 3 ? 'warn' : 'bad'} title="Nivel DEFCON" />
      </div>
      {w && (
        <>
          <Meter icon={Newspaper} title={`Artículos analizados: ${w.details.articleCount}`} pct={Math.min(100, w.details.articleCount)} level="neutral" value={String(w.details.articleCount)} />
          <Pill color={w.source === 'gdelt' ? 'var(--gain)' : 'var(--accent)'}>{w.source === 'gdelt' ? 'GDELT en vivo' : 'Valor de reserva'}</Pill>
          <ul className="flex flex-col gap-1 text-xs text-[var(--ink-muted)]">
            {w.events.slice(0, 5).map((e, i) => (
              <li key={i} className="truncate" title={String(e?.title ?? e?.name ?? '')}>{String(e?.title ?? e?.name ?? e?.description ?? '')}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
