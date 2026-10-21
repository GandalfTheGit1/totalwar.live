import React, { useMemo, useState } from 'react';
import { Scale, ChevronDown, ChevronRight, Building2, Info, Flag } from 'lucide-react';
import { ActiveRelationsMap } from '../../types';
import type { BilateralScore, EmbassySide } from '@/lib/services/bilateral-relations/types';
import { TONE_STOPS, toneColor, toneAlpha, positionLabelEs } from '@/lib/services/bilateral-relations/valence';
import claimsData from '@/lib/data/territorial-claims/claims.json';

const CLAIM_NAME_ES: Record<string, string> = Object.fromEntries(
  claimsData.claims.map((c) => [c.id, c.nameEs])
);

/** The map paints each partner with colour = position (V) and opacity = ties (T); the panel uses the same colours (see valence.ts). */
const rgb = (v: number) => {
  const c = toneColor(v);
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
};

const STATE_LABEL: Record<string, string> = {
  FULL_DIPLOMATIC: 'Relaciones diplomáticas plenas',
  NONRESIDENT_RELATIONS: 'Relaciones sin embajada residente',
  NO_RELATIONS: 'Sin relaciones diplomáticas',
  NON_RECOGNITION: 'No reconocimiento',
  AMBASSADOR_ABSENT: 'Embajador ausente',
  DEFENSE_ALLIANCE: 'Alianza de defensa',
  DEEP_INTEGRATION: 'Integración profunda (UE, etc.)',
  INTEL_ALLIANCE: 'Alianza de inteligencia',
  STRATEGIC_PARTNERSHIP: 'Asociación estratégica',
  FTA_IN_FORCE: 'Libre comercio en vigor',
  PREFERENTIAL_TRADE: 'Acuerdo comercial preferencial',
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
  CLAIM_STANCE_SUPPORT: 'Postura de apoyo territorial',
  CLAIM_STANCE_OPPOSE: 'Postura de oposición territorial',
  STRATEGIC_RIVALRY: 'Rivalidad estratégica',
  TRADE_WAR: 'Guerra comercial',
  MEASURES_IN_FORCE: 'Medidas coercitivas en vigor',
  SANCTIONS_REGIME_TARGETED: 'Sanciones selectivas',
  SANCTIONS_REGIME_BROAD: 'Sanciones amplias',
  TECH_RESTRICTIONS: 'Restricciones tecnológicas',
  ARMS_EMBARGO_IN_FORCE: 'Embargo de armas',
  PROXY_HOSTILITY: 'Hostilidad indirecta (apoyo a grupos hostiles)',
  OCCUPATION: 'Ocupación',
  ARMED_CONFLICT: 'Conflicto armado',
  HISTORICAL_WAR: 'Guerra reciente',
};

const EMBASSY_LABEL: Record<EmbassySide['status'], { label: string; cls: string }> = {
  PRESENT: { label: 'Presente', cls: 'text-emerald-300 border-emerald-500/40' },
  ABSENT: { label: 'Ausente', cls: 'text-rose-300 border-rose-500/40' },
  UNKNOWN: { label: 'Desconocido', cls: 'text-zinc-400 border-zinc-600' },
};

const fmt = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(Math.round(v))}`;

/** Position classes of the counts, with a representative value for the dot colour. */
const CLASSES: ReadonlyArray<{ label: string; test: (v: number) => boolean; sample: number }> = [
  { label: 'Alianza', test: (v) => v >= 30, sample: 30 },
  { label: 'Cooperación', test: (v) => v >= 10 && v < 30, sample: 10 },
  { label: 'Preferencial', test: (v) => v >= 5 && v < 10, sample: 5 },
  { label: 'Sin posición', test: (v) => v > -5 && v < 5, sample: 0 },
  { label: 'Fricción', test: (v) => v > -25 && v <= -5, sample: -10 },
  { label: 'Rivalidad', test: (v) => v <= -25, sample: -25 },
];

function PairRow({ p, open, onToggle }: { p: BilateralScore; open: boolean; onToggle: () => void }) {
  return (
    <div className="border border-zinc-700/50 rounded bg-zinc-800/50">
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between gap-2 px-2 py-1.5 text-left" aria-expanded={open}>
        <span className="flex items-center gap-2 min-w-0">
          {open ? <ChevronDown className="w-3 h-3 text-zinc-500 shrink-0" /> : <ChevronRight className="w-3 h-3 text-zinc-500 shrink-0" />}
          <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: rgb(p.valence), opacity: toneAlpha(p.ties) + 0.2 }} />
          <span className="text-xs text-zinc-200 truncate">{p.partnerNameEs}</span>
        </span>
        <span className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono text-zinc-400">{positionLabelEs(p.valence)}</span>
          <span className="text-xs font-mono font-bold text-zinc-100 w-9 text-right">{fmt(p.R)}</span>
        </span>
      </button>
      {open && (
        <div className="px-3 pb-2.5 pt-1 border-t border-zinc-700/50 space-y-2 text-[11px]">
          <div className="grid grid-cols-3 gap-2 text-zinc-400">
            <div>
              <span className="block text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Posición</span>
              <span className="font-mono text-zinc-100">{fmt(p.valence)}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Vínculos</span>
              <span className="font-mono text-zinc-100">{fmt(p.ties)}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Estructura</span>
              <span className="font-mono text-zinc-100">{fmt(p.sStruct)}</span>
            </div>
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
          {p.claimIds && p.claimIds.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-1 flex items-center gap-1">
                <Flag className="w-3 h-3 text-amber-400" /> Disputas territoriales
              </p>
              <div className="space-y-1">
                {p.claimIds.map((cid) => (
                  <div
                    key={cid}
                    className="flex items-center justify-between gap-2 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-[11px]"
                  >
                    <span className="text-zinc-200">{CLAIM_NAME_ES[cid] || cid}</span>
                    <span className="text-[9px] font-mono text-amber-400/80 uppercase">{cid}</span>
                  </div>
                ))}
              </div>
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

function Group({ title, items, open, setOpen }: { title: string; items: BilateralScore[]; open: string | null; setOpen: (c: string | null) => void }) {
  if (items.length === 0) return null;
  return (
    <>
      <p className="mt-3.5 mb-1.5 text-[10px] text-zinc-400 uppercase tracking-widest font-bold font-mono">{title}</p>
      <div className="space-y-1">
        {items.map((p) => (
          <PairRow key={p.partner} p={p} open={open === p.partner} onToggle={() => setOpen(open === p.partner ? null : p.partner)} />
        ))}
      </div>
    </>
  );
}

export function BilateralRelationsSection({ activeRelations }: { activeRelations?: ActiveRelationsMap | null }) {
  const [open, setOpen] = useState<string | null>(null);
  const scores = useMemo(() => Object.values(activeRelations || {}).map((r) => r.score).filter((s): s is BilateralScore => !!s), [activeRelations]);
  const groups = useMemo(() => {
    const byPosition = (a: BilateralScore, b: BilateralScore) => b.valence - a.valence || b.ties - a.ties;
    return {
      favorable: scores.filter((s) => s.valence >= 5).sort(byPosition).slice(0, 6),
      adverse: scores.filter((s) => s.valence <= -5).sort((a, b) => a.valence - b.valence || b.ties - a.ties).slice(0, 6),
      connected: scores.filter((s) => s.valence > -5 && s.valence < 5).sort((a, b) => b.ties - a.ties).slice(0, 6),
    };
  }, [scores]);
  if (scores.length === 0) return null;

  const structuralOnly = scores.every((s) => !s.eventsAnalysed);
  const gradient = `linear-gradient(to right, ${TONE_STOPS.map(([v, c]) => `rgb(${c[0]}, ${c[1]}, ${c[2]}) ${((v + 60) / 120) * 100}%`).join(', ')})`;

  return (
    <div className="p-4 bg-zinc-850/80 rounded-xl border border-teal-500/20 shadow-[0_0_20px_rgba(20,184,166,0.06)]" data-testid="bilateral-relations-section">
      <div>
        <span className="text-sm font-bold text-zinc-100 flex items-center gap-2">
          <Scale className="w-4 h-4 text-teal-400" /> Relaciones bilaterales
        </span>
        <span className="text-xs text-zinc-400 mt-0.5 block">Posición (color) y vínculos (intensidad) con {scores.length} países con datos</span>
      </div>

      <div className="mt-3" data-testid="bilateral-legend">
        <div className="h-2 rounded" style={{ background: gradient }} />
        <div className="relative h-3 mt-0.5 text-[9px] font-mono text-zinc-500">
          {[-60, -25, 0, 10, 30, 60].map((v) => (
            <span key={v} className="absolute -translate-x-1/2" style={{ left: `${((v + 60) / 120) * 100}%` }}>
              {v > 0 ? `+${v}` : v}
            </span>
          ))}
        </div>
        <p className="mt-1 text-[10px] text-zinc-500">Color = posición (rivalidad ← → alianza). Más opaco = más vínculos (embajadas, comercio, migración, tratados).</p>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5 text-[10px] font-mono">
        {CLASSES.map((cl) => (
          <div key={cl.label} className="flex items-center gap-1.5 bg-zinc-800/60 px-1.5 py-1 rounded border border-zinc-700/40">
            <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: rgb(cl.sample) }} />
            <span className="text-zinc-300">{cl.label}</span>
            <span className="ml-auto text-zinc-400">{scores.filter((s) => cl.test(s.valence)).length}</span>
          </div>
        ))}
      </div>

      {structuralOnly && (
        <p className="mt-3 flex gap-1.5 text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1.5">
          <Info className="w-3.5 h-3.5 shrink-0 mt-px" />
          Solo capa estructural (diplomacia, comercio, alianzas, tratados, migración). Los hechos recientes y las acciones de los líderes aún no están analizados para estos pares.
        </p>
      )}

      <Group title="Posiciones favorables" items={groups.favorable} open={open} setOpen={setOpen} />
      <Group title="Posiciones adversas" items={groups.adverse} open={open} setOpen={setOpen} />
      <Group title="Más conectados, sin posición registrada" items={groups.connected} open={open} setOpen={setOpen} />
      <p className="mt-3 text-[10px] text-zinc-500">Los países en gris no tienen vínculos ni posición registrados: no se muestran como neutrales.</p>
    </div>
  );
}
