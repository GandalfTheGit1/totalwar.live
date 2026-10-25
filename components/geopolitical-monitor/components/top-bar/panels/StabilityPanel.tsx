'use client';

import React from 'react';
import { Gavel, HeartHandshake, Megaphone, Siren, Skull, Split } from 'lucide-react';
import { unrestRisk } from '../../../utils/sovereign-cache';
import { BigStat, Meter, NoCountry, Pill } from '../primitives';
import { levelHigherBetter, levelLowerBetter } from '../metrics';
import type { TopBarContext } from '../types';

const ZONES = ['Calma', 'Tensión social', 'Revueltas probables', 'Crisis abierta'];
const ZONE_COLOR = ['#2b6f68', '#8a7a3a', '#b0663f', '#a23b34'];
const POLARIZATION_PCT = { LOW: 20, MODERATE: 45, HIGH: 70, EXTREME: 95 } as const;

export const StabilityPanel: React.FC<{ ctx: TopBarContext }> = ({ ctx }) => {
  if (!ctx.profile) return <NoCountry icon={Siren} />;
  const s = ctx.profile.dossiers.stability;
  const risk = unrestRisk(ctx.profile);
  const zone = risk < 20 ? 0 : risk < 40 ? 1 : risk < 60 ? 2 : 3;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <BigStat icon={Siren} value={String(risk)} level={levelLowerBetter(risk, 25, 45)} title="Cercanía a revueltas o conflicto interno (0-100)" />
        <Pill color={ZONE_COLOR[zone]}>{ZONES[zone]}</Pill>
      </div>
      <div>
        <div className="relative flex h-2 overflow-hidden rounded-sm" role="img" aria-label={`Riesgo ${risk} de 100: ${ZONES[zone]}`}>
          {ZONE_COLOR.map((c) => <i key={c} className="flex-1" style={{ background: c }} />)}
          <u className="absolute -top-0.5 h-3 w-[3px] rounded-sm bg-[var(--ink)]" style={{ left: `calc(${risk}% - 1px)` }} />
        </div>
      </div>
      <Meter icon={Megaphone} title="Malestar social" pct={s.socialUnrestIndex} level={levelLowerBetter(s.socialUnrestIndex, 25, 45)} value={String(s.socialUnrestIndex)} />
      <Meter icon={Skull} title="Riesgo de golpe o fractura" pct={s.coupOrFractureRiskPercent} level={levelLowerBetter(s.coupOrFractureRiskPercent, 25, 45)} value={`${s.coupOrFractureRiskPercent}%`} />
      <Meter icon={Split} title={`Polarización: ${s.polarizationLevel}`} pct={POLARIZATION_PCT[s.polarizationLevel]} level={levelLowerBetter(POLARIZATION_PCT[s.polarizationLevel], 30, 60)} value={s.polarizationLevel.slice(0, 3)} />
      <Meter icon={HeartHandshake} title="Cohesión interna" pct={s.internalCohesionScore} level={levelHigherBetter(s.internalCohesionScore, 60, 40)} value={String(s.internalCohesionScore)} />
      <Meter icon={Gavel} title="Estado de derecho" pct={s.ruleOfLawScore} level={levelHigherBetter(s.ruleOfLawScore, 60, 40)} value={String(s.ruleOfLawScore)} />
    </div>
  );
};
