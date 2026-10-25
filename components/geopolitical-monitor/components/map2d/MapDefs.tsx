/**
 * components/dev/geopolitical-monitor/components/map2d/MapDefs.tsx
 *
 * SVG definitions: radial ocean gradients, glow filters,
 * neon friendshoring arc gradients, and marker heads.
 */

import React from 'react';

function RadialOceanGradient() {
  return (
    <radialGradient id="oceanGradient" cx="50%" cy="45%" r="75%">
      <stop offset="0%" stopColor="#081126" />
      <stop offset="55%" stopColor="#040916" />
      <stop offset="100%" stopColor="#020617" />
    </radialGradient>
  );
}

function ArcGradientsAndMarkers() {
  return (
    <>
      <linearGradient id="arc-gradient-emerald-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
      <marker
        id="arrow-friendshoring"
        viewBox="0 0 10 10"
        refX="6"
        refY="5"
        markerWidth="5"
        markerHeight="5"
        orient="auto-start-reverse"
      >
        <path d="M 0 2 L 8 5 L 0 8 z" fill="#06b6d4" />
      </marker>
    </>
  );
}

function SingleGlowFilter({ id }: { id: string }) {
  return (
    <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
}

export function MapDefs() {
  return (
    <defs>
      <RadialOceanGradient />
      <ArcGradientsAndMarkers />
      <SingleGlowFilter id="glow-cyan" />
      <SingleGlowFilter id="glow-indigo" />
      <SingleGlowFilter id="glow-emerald" />
      <SingleGlowFilter id="glow-rose" />
      <SingleGlowFilter id="glow-amber" />
      {/* Diagonal hatch patterns for territorial claims by status */}
      <pattern id="hatch-occupied" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="8" stroke="#f43f5e" strokeWidth="2.5" strokeOpacity="0.85" />
      </pattern>
      <pattern id="hatch-militarized" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="8" stroke="#f97316" strokeWidth="2" strokeOpacity="0.8" />
      </pattern>
      <pattern id="hatch-active" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="8" stroke="#eab308" strokeWidth="1.8" strokeOpacity="0.8" />
      </pattern>
      <pattern id="hatch-latent" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="8" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.7" />
      </pattern>
      <pattern id="hatch-frozen" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="8" stroke="#64748b" strokeWidth="1.5" strokeOpacity="0.7" />
      </pattern>
      <pattern id="hatch-resolved" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="8" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.6" />
      </pattern>
    </defs>
  );
}
