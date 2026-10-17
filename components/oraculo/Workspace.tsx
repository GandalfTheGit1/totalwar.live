'use client';

import React from 'react';
import type { WorkspaceProps } from './types';

function cx(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function Workspace({
  title,
  actions,
  rail = [],
  active,
  onSelect,
  className,
  children,
}: WorkspaceProps) {
  const hasRail = rail && rail.length > 0;

  return (
    <div className={cx('orc-ws', className)}>
      {title || actions ? (
        <div className="orc-ws-bar">
          {title ? <h1 className="title orc-ws-title">{title}</h1> : null}
          {actions ? <div className="orc-ws-actions">{actions}</div> : null}
        </div>
      ) : null}
      <div className={cx('orc-ws-main', !hasRail && 'orc-ws-main--no-rail')}>
        {hasRail ? (
          <nav className="orc-rail" aria-label="Secciones">
            {rail.map((item) => (
              <button
                key={item.id}
                type="button"
                className="orc-rail-item"
                title={item.label}
                aria-label={item.label}
                aria-current={item.id === active ? 'page' : undefined}
                onClick={onSelect ? () => onSelect(item.id) : undefined}
              >
                {item.glyph}
              </button>
            ))}
          </nav>
        ) : null}
        <div className="orc-panes">{children}</div>
      </div>
    </div>
  );
}
