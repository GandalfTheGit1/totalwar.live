import React, { useMemo, useState } from 'react';
import { Scale, ChevronDown, ChevronRight, Building2, Info } from 'lucide-react';
import { ActiveRelationsMap } from '../../types';
import type { BilateralScore, RelationBand, EmbassySide } from '@/lib/services/bilateral-relations/types';
import { BAND_LABEL_ES } from '../../hooks/monitor/engine-relations';

/** Same colours as the globe / 2D map for each band (see engine-relations.ts and country-styler.ts). */
const BAND_STYLE: Record<RelationBand, { dot: string; text: string }> = {
  ALLIED: { dot: 'bg-emerald-500', text: 'text-emerald-300' },
  PARTNER: { dot: 'bg-indigo-400', text: 'text-indigo-300' },
  NEUTRAL: { dot: 'bg-amber-500', text: 'text-amber-300' },
  TENSE: { dot: 'bg-rose-500', text: 'text-rose-300' },
  HOSTILE: { dot: 'bg-rose-600', text: 'text-rose-400' },
  CONFLICT: { dot: 'bg-rose-700', text: 'text-rose-500' },
};

const STATE_LABEL: Record<string, string> = {
  FULL_DIPLOMATIC: 'Relaciones diplomáticas plenas',
  NONRESIDENT_RELATIONS: 'Relaciones sin embajada residente',
  NO_RELATIONS: 'Sin relaciones diplomáticas',
  AMBASSADOR_ABSENT: 'Embajador ausente',
  DEFENSE_ALLIANCE: 'Alianza de defensa',
  DEEP_INTEGRATION: 'Integración profunda (UE, etc.)',
  SHARED_FORUM: 'Foros compartidos',
  TRADE_HIGH: 'Comercio alto',
  TRADE_MEDIUM: 'Comercio medio',
  HUMAN_TIES: 'Lazos humanos (migración)',
  SHARED_LANGUAGE: 'Lengua oficial común',
  BILATERAL_TREATIES: 'Tratados bilaterales',
  FRIENDSHIP_TREATY: 'Tratado de amistad',
  TERRITORIAL_DISPUTE_LOW: 'Disputa territorial latente',
  TERRITORIAL_DISPUTE_ACTIVE: 'Disputa territorial activa',
  TERRITORIAL_DISPUTE_MILITARIZED: 'Disputa territorial militarizada',
  STRATEGIC_RIVALRY: 'Rivalidad estratégica',
  TRADE_WAR: 'Guerra comercial',
  MEASURES_IN_FORCE: 'Medidas coercitivas en vigor',
  SANCTIONS_REGIME_TARGETED: 'Sanciones selectivas',
  SANCTIONS_REGIME_BROAD: 'Sanciones amplias',
  TECH_RESTRICTIONS: 'Restricciones tecnológicas',
  ARMS_EMBARGO_IN_FORCE: 'Embargo de armas',
};

const EMBASSY_LABEL: Record<EmbassySide['status'], { label: string; cls: string }> = {
  PRESENT: { label: 'Presente', cls: 'text-emerald-300 border-emerald-500/40' },
  ABSENT: { label: 'Ausente', cls: 'text-rose-300 border-rose-500/40' },
  UNKNOWN: { label: 'Desconocido', cls: 'text-zinc-400 border-zinc-600' },
};

const fmt = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(Math.round(v))}`;

function PairRow({ p, open, onToggle }: { p: BilateralScore; open: boolean; onToggle: () => void }) {
  const st = BAND_STYLE[p.band];
  return (
    <div className="border border-zinc-700/50 rounded bg-zinc-800/50">
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between gap-2 px-2 py-1.5 text-left" aria-expanded={open}>
        <span className="flex items-center gap-2 min-w-0">
          {open ? <ChevronDown className="w-3 h-3 text-zinc-500 shrink-0" /> : <ChevronRight className="w-3 h-3 text-zinc-500 shrink-0" />}
          <span className={`w-2 h-2 rounded-sm shrink-0 ${st.dot}`} />
          <span className="text-xs text-zinc-200 truncate">{p.partnerNameEs}</span>
        </span>
        <span className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] font-mono uppercase ${st.text}`}>{BAND_LABEL_ES[p.band]}</span>
          <span className="text-xs font-mono font-bold text-zinc-100 w-9 text-right">{fmt(p.R)}</span>
        </span>
      </button>
      {open && (
        <div className="px-3 pb-2.5 pt-1 border-t border-zinc-700/50 space-y-2 text-[11px]">
          <div className="flex justify-between text-zinc-400">
            <span>Estructura</span>
            <span className="font-mono text-zinc-200">{fmt(p.sStruct)}</span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1 flex items-center gap-1">
              <Building2 className="w-3 h-3" /> Embajadas
            </p>
            {Object.entries(p.embassies).map(([side, e]) => {
              const lab = EMBASSY_LABEL[e.status];
              const ours = side !== p.partner;          // the embassies record has one key per country of the pair
              const who = ours ? `en ${p.partnerNameEs}` : `de ${p.partnerNameEs}`;
              return (
                <div key={side} className="flex items-center justify-between gap-2 py-0.5">
                  <span className="text-zinc-400 truncate">
                    {ours ? 'Nuestro jefe de misión' : 'Jefe de misión'} {who}
                    {e.holder ? <span className="text-zinc-500"> · {e.holder}</span> : null}
                  </span>
                  <span className={`px-1.5 py-px rounded border font-mono text-[10px] ${lab.cls}`}>{lab.label}</span>
                </div>
              );
            })}
          </div>
          {p.states.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1">Estados</p>
              {p.states.map(([code, v]) => (
                <div key={code} className="flex justify-between gap-2 py-0.5">
                  <span className="text-zinc-300 truncate">{STATE_LABEL[code] || code}</span>
                  <span className={`font-mono ${v < 0 ? 'text-rose-300' : 'text-emerald-300'}`}>{fmt(v)}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-zinc-500">
            Cobertura de datos: {p.coverage}
            {p.eventsAnalysed ? ' · con hechos recientes' : ' · solo estructura'}
          </p>
        </div>
      )}
    </div>
  );
}

export function BilateralRelationsSection({ activeRelations }: { activeRelations?: ActiveRelationsMap | null }) {
  const [open, setOpen] = useState<string | null>(null);
  const scores = useMemo(
    () => Object.values(activeRelations || {}).map((r) => r.score).filter((s): s is BilateralScore => !!s).sort((a, b) => b.R - a.R),
    [activeRelations]
  );
  if (scores.length === 0) return null;

  const counts = scores.reduce<Record<string, number>>((acc, s) => ((acc[s.band] = (acc[s.band] || 0) + 1), acc), {});
  const best = scores.slice(0, 6);
  const worst = scores.slice(-6).reverse().filter((s) => !best.includes(s));
  const structuralOnly = scores.every((s) => !s.eventsAnalysed);

  return (
    <div className="p-4 bg-zinc-850/80 rounded-xl border border-teal-500/20 shadow-[0_0_20px_rgba(20,184,166,0.06)]" data-testid="bilateral-relations-section">
      <div>
        <span className="text-sm font-bold text-zinc-100 flex items-center gap-2">
          <Scale className="w-4 h-4 text-teal-400" /> Relaciones bilaterales
        </span>
        <span className="text-xs text-zinc-400 mt-0.5 block">Puntuación R de −200 a +200 con {scores.length} países con datos</span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5 text-[10px] font-mono">
        {(['ALLIED', 'PARTNER', 'NEUTRAL', 'TENSE', 'HOSTILE', 'CONFLICT'] as RelationBand[]).map((b) => (
          <div key={b} className="flex items-center gap-1.5 bg-zinc-800/60 px-1.5 py-1 rounded border border-zinc-700/40">
            <span className={`w-2 h-2 rounded-sm ${BAND_STYLE[b].dot}`} />
            <span className="text-zinc-300">{BAND_LABEL_ES[b]}</span>
            <span className="ml-auto text-zinc-400">{counts[b] || 0}</span>
          </div>
        ))}
      </div>

      {structuralOnly && (
        <p className="mt-3 flex gap-1.5 text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1.5">
          <Info className="w-3.5 h-3.5 shrink-0 mt-px" />
          Solo capa estructural (diplomacia, comercio, alianzas, tratados, migración). Los hechos recientes y las acciones de los líderes aún no están analizados para estos pares.
        </p>
      )}

      <p className="mt-3.5 mb-1.5 text-[10px] text-zinc-400 uppercase tracking-widest font-bold font-mono">Mejores relaciones</p>
      <div className="space-y-1">
        {best.map((p) => (
          <PairRow key={p.partner} p={p} open={open === p.partner} onToggle={() => setOpen(open === p.partner ? null : p.partner)} />
        ))}
      </div>

      {worst.length > 0 && (
        <>
          <p className="mt-3.5 mb-1.5 text-[10px] text-zinc-400 uppercase tracking-widest font-bold font-mono">Peores relaciones</p>
          <div className="space-y-1">
            {worst.map((p) => (
              <PairRow key={p.partner} p={p} open={open === p.partner} onToggle={() => setOpen(open === p.partner ? null : p.partner)} />
            ))}
          </div>
        </>
      )}
      <p className="mt-3 text-[10px] text-zinc-500">Los países en gris no tienen datos suficientes: no se muestran como neutrales.</p>
    </div>
  );
}
