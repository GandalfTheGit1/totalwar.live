'use client';

import React from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  glyph?: string;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Standard Oráculo Page Header component for all views and routes.
 * Enforces uniform typography, surface alignment, glyph branding, and responsive layout.
 */
export function PageHeader({
  title,
  subtitle,
  badge,
  glyph = '◈',
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <header className={`flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-6 border-b border-hairline ${className}`}>
      <div className="space-y-1.5">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="w-7 h-7 rounded-[8px] bg-accent-soft border border-accent/30 text-accent-text flex items-center justify-center font-mono font-bold text-sm select-none">
            {glyph}
          </span>
          <h1 className="text-display font-semibold tracking-tight text-ink">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-body text-ink-muted max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {actions}
        </div>
      )}
    </header>
  );
}
