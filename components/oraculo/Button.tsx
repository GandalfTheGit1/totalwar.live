'use client';

import React from 'react';
import type { ButtonProps } from './types';

function cx(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function Button({
  variant = 'secondary',
  size = 'md',
  disabled = false,
  type = 'button',
  ariaLabel,
  onClick,
  className,
  children,
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        'orc-btn',
        'body-sm',
        `orc-btn--${variant}`,
        size === 'sm' && 'orc-btn--sm',
        className
      )}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
