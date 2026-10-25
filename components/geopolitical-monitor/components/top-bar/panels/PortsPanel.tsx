'use client';

import React, { useEffect, useState } from 'react';
import { Anchor, Banknote, Clock, Container, Ship } from 'lucide-react';
import { CHOKEPOINT_LIST, type MaritimeChokepointId } from '../../../types';
import { BigStat, ChipRow, Meter } from '../primitives';
import { levelHigherBetter, levelLowerBetter } from '../metrics';
import type { TopBarContext } from '../types';

export const PortsPanel: React.FC<{ ctx: TopBarContext }> = ({ ctx }) => {
  const [utilization, setUtilization] = useState<number | null>(null);
  const open = 6 - ctx.blockedChokepoints.length;
  const sim = ctx.simulationResult;

  useEffect(() => {
    setUtilization(null);
    if (!ctx.iso2) return;
    const ctrl = new AbortController();
    fetch(`/api/dev/port-congestion?country=${ctx.iso2}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && typeof d.utilization === 'number') setUtilization(Math.round(d.utilization)); })
      .catch(() => {});
    return () => ctrl.abort();
  }, [ctx.iso2]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <BigStat icon={Anchor} value={`${open}/6`} level={levelHigherBetter(open, 5, 3)} title="Estrechos abiertos" />
        <BigStat icon={Clock} value={`${sim.transitDelayDays} d`} level={levelLowerBetter(sim.transitDelayDays, 0, 10)} title="Retraso adicional de tránsito" />
      </div>
      <ChipRow
        items={CHOKEPOINT_LIST.map((c) => ({
          id: c.id, label: c.nameEs.replace(/^(Estrecho|Canal) (de |del )?/, ''), title: c.nameEs,
          pressed: ctx.blockedChokepoints.includes(c.id), danger: true,
        }))}
        onToggle={(id) => ctx.toggleChokepoint(id as MaritimeChokepointId)}
      />
      <Meter icon={Ship} title="Recargo de fletes" pct={sim.freightRateSurgePct} level={levelLowerBetter(sim.freightRateSurgePct, 5, 40)} value={`+${Math.round(sim.freightRateSurgePct)}%`} />
      <Meter icon={Banknote} title="Impacto en el coste de ventas (COGS)" pct={sim.cogsImpactPct * 5} level={levelLowerBetter(sim.cogsImpactPct, 0.5, 3)} value={`+${sim.cogsImpactPct.toFixed(1)}%`} />
      <Meter
        icon={Container}
        title={ctx.iso2 ? 'Utilización portuaria del país seleccionado' : 'Selecciona un país para ver su congestión portuaria'}
        pct={utilization ?? 0}
        level={utilization === null ? 'na' : levelLowerBetter(utilization, 75, 90)}
        value={utilization === null ? '—' : `${utilization}%`}
      />
    </div>
  );
};
