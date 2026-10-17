'use client';

import React from 'react';
import type { PanelProps } from './types';

function cx(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function Panel({
  title,
  eyebrow,
  actions,
  dense = false,
  raised = false,
  span,
  className,
  children,
}: PanelProps) {
  const hasHead = title || eyebrow || actions;

  return (
    <section
      className={cx(
        'orc-panel',
        dense && 'orc-panel--dense',
        raised && 'orc-panel--raised',
        span === 2 && 'orc-span-2',
        span === 'full' && 'orc-span-full',
        className
      )}
      aria-label={title || eyebrow || undefined}
    >
      {hasHead ? (
        <header className="orc-panel-head">
          <div>
            {eyebrow ? <p className="label orc-eyebrow">{eyebrow}</p> : null}
            {title ? <h2 className="heading orc-panel-title">{title}</h2> : null}
          </div>
          {actions ? <div className="orc-panel-actions">{actions}</div> : null}
        </header>
      ) : null}
      <div className="orc-panel-body">{children}</div>
    </section>
  );
}
