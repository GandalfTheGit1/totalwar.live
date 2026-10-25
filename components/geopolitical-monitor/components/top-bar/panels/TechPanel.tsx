'use client';

import React from 'react';
import { Brain, Cpu, FlaskConical, Gauge } from 'lucide-react';
import { BigStat, Meter, NoCountry, Pill } from '../primitives';
import { levelHigherBetter } from '../metrics';
import type { TopBarContext } from '../types';

export const TechPanel: React.FC<{ ctx: TopBarContext }> = ({ ctx }) => {
  if (!ctx.profile) return <NoCountry icon={Cpu} />;
  const t = ctx.profile.dossiers.tech;
  const { semiconductors: chips, artificialIntelligence: ai } = t.subsectors;
  return (
    <div className="flex flex-col gap-3">
      <BigStat icon={Gauge} value={String(Math.round(t.score))} level={levelHigherBetter(t.score, 70, 50)} title="Índice de desarrollo tecnológico" />
      <Meter icon={Cpu} title="Semiconductores" pct={chips.score} level={levelHigherBetter(chips.score, 70, 50)} value={String(chips.score)} />
      <Meter icon={Brain} title="IA y cómputo" pct={ai.score} level={levelHigherBetter(ai.score, 70, 50)} value={String(ai.score)} />
      <Meter icon={FlaskConical} title={`I+D: ${t.rAndDPercentGdp}% del PIB`} pct={Math.min(100, t.rAndDPercentGdp * 25)} level={levelHigherBetter(t.rAndDPercentGdp, 2.5, 1.5)} value={`${t.rAndDPercentGdp}%`} />
      <div className="flex flex-wrap gap-1.5">
        <Pill icon={Cpu}>{chips.fabricationNode}</Pill>
        <Pill icon={Brain}>{ai.computeTier.split(':')[0]}</Pill>
      </div>
    </div>
  );
};
