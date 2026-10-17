/**
 * components/dev/geopolitical-monitor/components/map2d/CornerReticles.tsx
 *
 * Decorative C2 military HUD corner reticles.
 */

import React from 'react';

export function CornerReticles() {
  return (
    <>
      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-teal-500/40 pointer-events-none" />
      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-teal-500/40 pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-teal-500/40 pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-teal-500/40 pointer-events-none" />
    </>
  );
}
