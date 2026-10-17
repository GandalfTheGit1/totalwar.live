'use client';

import React from 'react';
import type { MetricProps } from './types';
import { Badge } from './Badge';

function cx(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function Metric({
  label,
  value,
  delta,
  direction = 'flat',
  tone,
  sentiment,
  glyph: customGlyph,
  hint,
  className,
}: MetricProps) {
  const dir = direction || 'flat';
  const resolvedTone = tone || sentiment || (dir === 'up' ? 'gain' : dir === 'down' ? 'loss' : 'neutral');
  const glyph = customGlyph ?? (dir === 'up' ? '▲' : dir === 'down' ? '▼' : '—');

  return (
    <div className={cx('orc-metric', className)}>
      <p className="label orc-eyebrow">{label}</p>
      <p className="num-lg orc-metric-value">{value}</p>
      {delta || hint ? (
        <div className="orc-metric-foot">
          {delta ? (
            <Badge tone={resolvedTone} glyph={glyph} mono>
              {delta}
            </Badge>
          ) : null}
          {hint ? <p className="body-sm orc-metric-hint">{hint}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
