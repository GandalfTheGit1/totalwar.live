'use client';

import React from 'react';
import type { BadgeProps } from './types';

function cx(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

const GLYPH: Record<string, string> = {
  gain: '▲',
  loss: '▼',
  info: '◆',
  notice: '●',
  neutral: '○',
  accent: '◈',
  secondary: '○',
};

export function Badge({
  tone,
  variant,
  glyph,
  mono = false,
  className,
  children,
}: BadgeProps) {
  const activeTone = variant ?? tone ?? 'neutral';
  const glyphSymbol = glyph === false ? null : (glyph ?? GLYPH[activeTone] ?? GLYPH.neutral);

  return (
    <span
      className={cx(
        'orc-badge',
        mono ? 'num-sm' : 'body-sm',
        `orc-badge--${activeTone}`,
        className
      )}
    >
      {glyphSymbol ? (
        <span className="orc-badge-glyph" aria-hidden="true">
          {glyphSymbol}
        </span>
      ) : null}
      {children}
    </span>
  );
}
