/**
 * components/dev/geopolitical-monitor/components/map2d/ArcTooltip.tsx
 *
 * Floating tactical tooltip for Friendshoring substitution arcs.
 */

import React from 'react';
import type { SubstitutionArc } from '../../types';
import type { TooltipPos } from './types';

interface ArcTooltipProps {
  arc: SubstitutionArc;
  pos: TooltipPos;
  containerWidth: number;
}

function ArcTooltipHeader({ arc }: { arc: SubstitutionArc }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 mb-2">
      <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
        {arc.commodityLabel}
      </span>
      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
        {arc.feasibilityScore}% VIABILIDAD
      </span>
    </div>
  );
}

function ArcFrictionMetrics({ arc }: { arc: SubstitutionArc }) {
  return (
    <>
      <div className="flex items-center justify-between text-xs py-0.5">
        <span className="text-zinc-400">Fricción Bilateral:</span>
        <span className="font-bold text-emerald-400">
          {arc.frictionScore}/10 (Aliado Seguro &lt; 4.0)
        </span>
      </div>
      {arc.frictionReduction > 0 && (
        <div className="flex items-center justify-between text-xs py-0.5">
          <span className="text-zinc-400">Ahorro Fricción:</span>
          <span className="font-bold text-teal-300">-{arc.frictionReduction} pts</span>
        </div>
      )}
      <div className="flex items-center justify-between text-xs py-0.5">
        <span className="text-zinc-400">Distancia Haversine:</span>
        <span suppressHydrationWarning className="text-zinc-300">
          {arc.distanceKm.toLocaleString('en-US')} km
        </span>
      </div>
    </>
  );
}

function ArcFooterDetails({ arc }: { arc: SubstitutionArc }) {
  return (
    <>
      {arc.allianceMatch && arc.allianceMatch.length > 0 && (
        <div className="mt-2 pt-1.5 border-t border-zinc-800/80 flex items-center gap-1 flex-wrap">
          <span className="text-[10px] text-zinc-400">Tratados:</span>
          {arc.allianceMatch.map((bloc) => (
            <span
              key={bloc}
              className="px-1.5 py-0.2 bg-teal-950/60 text-teal-300 border border-teal-800/60 rounded text-[9px]"
            >
              {bloc}
            </span>
          ))}
        </div>
      )}
      {arc.strategicRationale && (
        <div className="mt-1.5 pt-1.5 border-t border-zinc-800/80 text-[10px] text-zinc-300 line-clamp-2">
          <span className="text-teal-400 font-bold">Activo Clave: </span>
          {arc.strategicRationale}
        </div>
      )}
    </>
  );
}

export function ArcTooltip({ arc, pos, containerWidth }: ArcTooltipProps) {
  return (
    <div
      className="absolute z-50 pointer-events-none bg-zinc-950/95 backdrop-blur-xl border border-teal-500/60 rounded-xl p-3 shadow-[0_0_30px_rgba(16,185,129,0.35)] text-xs font-mono text-zinc-100 min-w-[280px]"
      style={{
        left: Math.min(pos.x, (containerWidth || 800) - 300),
        top: Math.max(10, pos.y - 120),
      }}
    >
      <ArcTooltipHeader arc={arc} />
      <div className="flex items-center justify-between text-xs py-0.5">
        <span className="text-zinc-400">Ruta Sustitución:</span>
        <span className="font-bold text-white flex items-center gap-1">
          <span>{arc.originCountryFlag} {arc.originCountry}</span>
          <span className="text-teal-400">➔</span>
          <span className="text-emerald-300">{arc.substituteCountryFlag} {arc.substituteCountry}</span>
        </span>
      </div>
      <ArcFrictionMetrics arc={arc} />
      <ArcFooterDetails arc={arc} />
    </div>
  );
}
