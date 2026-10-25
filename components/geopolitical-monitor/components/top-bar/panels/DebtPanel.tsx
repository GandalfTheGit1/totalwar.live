'use client';

import React from 'react';
import { Coins, Flame, Percent, TrendingUp, Waves } from 'lucide-react';
import { BigStat, Meter, NoCountry, Pill } from '../primitives';
import { levelLowerBetter, parsePercent } from '../metrics';
import type { TopBarContext } from '../types';

export const DebtPanel: React.FC<{ ctx: TopBarContext }> = ({ ctx }) => {
  if (!ctx.iso2) return <NoCountry icon={TrendingUp} />;
  if (ctx.isMacroLoading) return <NoCountry icon={TrendingUp} text="Cargando datos macro…" />;
  const m = ctx.macro;
  if (!m) return <NoCountry icon={TrendingUp} text="Sin datos macro para este país" />;
  const debt = parsePercent(m.debtToGdp);
  const infl = parsePercent(m.inflation);
  const rate = parsePercent(m.interestRate);
  const spread = m.dalioDebtCycle.dalioFormula?.spread ?? null;
  const reserve = ctx.profile?.dossiers.currency.globalReserveSharePercent ?? null;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <BigStat icon={TrendingUp} value={debt !== null ? `${Math.round(debt)}%` : '—'} level={debt !== null ? levelLowerBetter(debt, 60, 100) : 'na'} title="Deuda sobre PIB" />
        <BigStat icon={Waves} value={spread !== null ? `${spread > 0 ? '+' : ''}${spread.toFixed(1)}` : '—'} level={spread === null ? 'na' : spread >= 0 ? 'ok' : spread >= -1 ? 'warn' : 'bad'} title="Spread PIB nominal menos tipo efectivo" />
      </div>
      <Meter icon={Percent} title={`Tipo de interés: ${m.interestRate}`} pct={(rate ?? 0) * 8} level={levelLowerBetter(rate ?? 0, 3, 6)} value={m.interestRate} />
      <Meter icon={Flame} title={`Inflación: ${m.inflation}`} pct={(infl ?? 0) * 8} level={levelLowerBetter(infl ?? 0, 3, 5)} value={m.inflation} />
      {reserve !== null && (
        <Meter icon={Coins} title="Peso de su moneda en las reservas del mundo" pct={reserve} level="neutral" value={`${reserve}%`} />
      )}
      <Pill icon={TrendingUp}>{m.yieldCurveStatus.replace(/⚠️/g, '').trim()}</Pill>
    </div>
  );
};
