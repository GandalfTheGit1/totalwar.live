/**
 * components/geopolitical-monitor/components/map2d/ClaimTooltip.tsx
 *
 * Tactical HUD floating tooltip for territorial claims in 2D map.
 */

import React from 'react';
import type { TerritorialClaim, ClaimStatus, ClaimSalience } from '@/lib/services/territorial-claims/types';
import type { TooltipPos } from './types';

interface ClaimTooltipProps {
  claim: TerritorialClaim;
  pos: TooltipPos;
}

const STATUS_LABELS: Record<ClaimStatus, { label: string; cls: string }> = {
  occupied: { label: 'OCUPACIÓN MILITAR', cls: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  militarized: { label: 'MILITARIZADA', cls: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
  active: { label: 'DISPUTA ACTIVA', cls: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  latent: { label: 'LATENTE', cls: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  frozen: { label: 'CONGELADA', cls: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/40' },
  resolved: { label: 'RESUELTA', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
};

const SALIENCE_LABELS: Record<ClaimSalience, { label: string; cls: string }> = {
  core: { label: 'CRÍTICA', cls: 'text-rose-400 font-bold' },
  major: { label: 'MAYOR', cls: 'text-amber-400 font-medium' },
  minor: { label: 'MENOR', cls: 'text-zinc-400' },
};

function formatEntity(e: string | { entity: string; note?: string }): string {
  if (typeof e === 'string') return e;
  return e.entity + (e.note ? ` (${e.note})` : '');
}

export function ClaimTooltip({ claim, pos }: ClaimTooltipProps) {
  const statusInfo = STATUS_LABELS[claim.status] || { label: claim.status, cls: 'text-zinc-400 border-zinc-700' };
  const salienceInfo = SALIENCE_LABELS[claim.salience] || { label: claim.salience, cls: 'text-zinc-400' };

  return (
    <div
      className="absolute pointer-events-none z-50 bg-slate-900/95 border border-slate-700/80 rounded-lg shadow-2xl p-3 text-xs font-mono backdrop-blur-md min-w-[260px] max-w-[320px]"
      style={{
        left: `${pos.x + 15}px`,
        top: `${pos.y + 15}px`,
      }}
      data-testid="claim-tooltip"
    >
      <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-800">
        <div>
          <span className="font-black text-slate-100 flex items-center gap-1.5 text-sm">
            <span>🚩</span>
            <span>{claim.nameEs}</span>
          </span>
          <span className="text-[10px] text-slate-400 italic block">{claim.nameEn}</span>
        </div>
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border whitespace-nowrap ${statusInfo.cls}`}>
          {statusInfo.label}
        </span>
      </div>

      <div className="space-y-1 text-[11px] text-slate-300">
        <div className="flex justify-between gap-2">
          <span className="text-slate-400">Administrador:</span>
          <span className="font-bold text-cyan-300 truncate">{formatEntity(claim.administeredBy)}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-slate-400">Reclamante(s):</span>
          <span className="font-bold text-amber-300 truncate">
            {claim.claimants.map(formatEntity).join(', ')}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-slate-400">Importancia:</span>
          <span className={salienceInfo.cls}>{salienceInfo.label}</span>
        </div>
        {claim.since && (
          <div className="flex justify-between gap-2 pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
            <span>En disputa desde:</span>
            <span className="text-slate-200">{claim.since}</span>
          </div>
        )}
      </div>
    </div>
  );
}
