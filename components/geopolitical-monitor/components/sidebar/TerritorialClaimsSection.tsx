'use client';

import React, { useEffect, useState } from 'react';
import { Flag, Shield, AlertTriangle, CheckCircle2, MapPin, ExternalLink } from 'lucide-react';
import type { CountryClaimsPayload, TerritorialClaim, ClaimStatus, ClaimSalience } from '@/lib/services/territorial-claims/types';

interface TerritorialClaimsSectionProps {
  countryCode: string;
}

const STATUS_BADGE: Record<ClaimStatus, { label: string; cls: string }> = {
  occupied: { label: 'Ocupación militar', cls: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  militarized: { label: 'Militarizada', cls: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
  active: { label: 'Disputa activa', cls: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  latent: { label: 'Latente', cls: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  frozen: { label: 'Congelada', cls: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/40' },
  resolved: { label: 'Resuelta', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
};

const SALIENCE_BADGE: Record<ClaimSalience, { label: string; cls: string }> = {
  core: { label: 'Crítica', cls: 'text-rose-400 font-bold' },
  major: { label: 'Mayor', cls: 'text-amber-400 font-medium' },
  minor: { label: 'Menor', cls: 'text-zinc-400' },
};

function getEntityName(val: string | { entity: string; note?: string }): string {
  if (typeof val === 'string') return val;
  return val.entity + (val.note ? ` (${val.note})` : '');
}

export function TerritorialClaimsSection({ countryCode }: TerritorialClaimsSectionProps) {
  const [data, setData] = useState<CountryClaimsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!countryCode) return;
    setLoading(true);
    setError(null);
    fetch(`/api/claims/${countryCode}`)
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar reclamaciones');
        return res.json();
      })
      .then((payload: CountryClaimsPayload) => {
        setData(payload);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [countryCode]);

  if (loading) {
    return (
      <div className="p-4 bg-zinc-850/80 rounded-xl border border-zinc-700/60 font-mono text-xs text-zinc-400 animate-pulse">
        Cargando registro de reclamaciones territoriales...
      </div>
    );
  }

  if (error || !data || data.total === 0) {
    return (
      <div className="p-4 bg-zinc-850/80 rounded-xl border border-zinc-700/40 text-xs font-mono text-zinc-500" data-testid="territorial-claims-section-empty">
        <span className="flex items-center gap-2 text-zinc-400 font-bold mb-1">
          <Flag className="w-4 h-4 text-zinc-500" /> Reclamaciones territoriales
        </span>
        Sin disputas ni reclamaciones activas registradas para este país.
      </div>
    );
  }

  return (
    <div className="p-4 bg-zinc-850/80 rounded-xl border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.06)]" data-testid="territorial-claims-section">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Flag className="w-4 h-4 text-amber-400" /> Reclamaciones territoriales
          </span>
          <span className="text-xs text-zinc-400 mt-0.5 block">
            {data.total} disputa{data.total > 1 ? 's' : ''} o postura{data.total > 1 ? 's' : ''} registrada{data.total > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Summary counters */}
      <div className="mt-3 grid grid-cols-3 gap-1.5 text-[10px] font-mono">
        <div className="bg-zinc-800/60 p-2 rounded border border-zinc-700/40 text-center">
          <span className="block text-zinc-500 text-[9px] uppercase">Admin</span>
          <span className="text-sm font-bold text-cyan-300">{data.asAdmin.length}</span>
        </div>
        <div className="bg-zinc-800/60 p-2 rounded border border-zinc-700/40 text-center">
          <span className="block text-zinc-500 text-[9px] uppercase">Reclama</span>
          <span className="text-sm font-bold text-amber-300">{data.asClaimant.length}</span>
        </div>
        <div className="bg-zinc-800/60 p-2 rounded border border-zinc-700/40 text-center">
          <span className="block text-zinc-500 text-[9px] uppercase">Postura 3º</span>
          <span className="text-sm font-bold text-indigo-300">{data.asThirdParty.length}</span>
        </div>
      </div>

      {/* Administered territories in dispute */}
      {data.asAdmin.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold font-mono mb-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400" /> Administrados con reclamos ({data.asAdmin.length})
          </p>
          <div className="space-y-2">
            {data.asAdmin.map((c) => (
              <ClaimCard key={c.id} claim={c} role="admin" />
            ))}
          </div>
        </div>
      )}

      {/* Claimed territories */}
      {data.asClaimant.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold font-mono mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Territorios reclamados ({data.asClaimant.length})
          </p>
          <div className="space-y-2">
            {data.asClaimant.map((c) => (
              <ClaimCard key={c.id} claim={c} role="claimant" />
            ))}
          </div>
        </div>
      )}

      {/* Third party stances */}
      {data.asThirdParty.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold font-mono mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Posturas diplomáticas ({data.asThirdParty.length})
          </p>
          <div className="space-y-2">
            {data.asThirdParty.map(({ claim, stance }) => (
              <div key={claim.id} className="p-2.5 bg-zinc-800/50 rounded-lg border border-indigo-500/20 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-200">{claim.nameEs}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono border border-indigo-500/30 text-indigo-300 bg-indigo-500/10">
                    {stance.stance === 'supports_administrator'
                      ? 'Apoya al administrador'
                      : stance.stance === 'supports_claimant'
                      ? 'Apoya al reclamante'
                      : stance.stance}
                  </span>
                </div>
                {stance.note && <p className="text-[11px] text-zinc-400 mt-1">{stance.note}</p>}
                {stance.since && (
                  <span className="block text-[10px] text-zinc-500 font-mono mt-1">Desde: {stance.since}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ClaimCard({ claim, role }: { claim: TerritorialClaim; role: 'admin' | 'claimant' }) {
  const statusInfo = STATUS_BADGE[claim.status] || { label: claim.status, cls: 'text-zinc-400 border-zinc-700' };
  const salienceInfo = SALIENCE_BADGE[claim.salience] || { label: claim.salience, cls: 'text-zinc-400' };

  return (
    <div className="p-2.5 bg-zinc-800/60 rounded-lg border border-zinc-700/50 text-xs space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-bold text-zinc-200 block">{claim.nameEs}</span>
          <span className="text-[10px] text-zinc-500 italic block">{claim.nameEn}</span>
        </div>
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono border whitespace-nowrap ${statusInfo.cls}`}>
          {statusInfo.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1 border-t border-zinc-700/40">
        <div>
          <span className="text-zinc-500 block uppercase">
            {role === 'admin' ? 'Reclamado por' : 'Administrado por'}
          </span>
          <span className="text-zinc-300 truncate block">
            {role === 'admin'
              ? claim.claimants.map(getEntityName).join(', ')
              : getEntityName(claim.administeredBy)}
          </span>
        </div>
        <div>
          <span className="text-zinc-500 block uppercase">Relevancia</span>
          <span className={salienceInfo.cls}>{salienceInfo.label}</span>
        </div>
      </div>

      {claim.since && (
        <div className="text-[10px] text-zinc-500 font-mono flex items-center justify-between pt-0.5">
          <span>Disputa desde: {claim.since}</span>
          {claim.kind && <span className="uppercase text-[9px] text-zinc-400">[{claim.kind}]</span>}
        </div>
      )}
    </div>
  );
}
