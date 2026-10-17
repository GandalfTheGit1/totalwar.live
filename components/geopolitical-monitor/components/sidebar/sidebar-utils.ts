export function parseNumericValue(val: string | undefined | null): number | null {
  if (!val || val === 'N/A') return null;
  const clean = val.replace(/[^0-9.\-+]/g, '');
  const n = parseFloat(clean);
  return isNaN(n) ? null : n;
}

export function gdpColor(val: string): string {
  const n = parseNumericValue(val);
  if (n === null) return 'text-zinc-400';
  if (n >= 2) return 'text-emerald-400';
  if (n >= 0) return 'text-yellow-400';
  return 'text-rose-400';
}

export function inflationColor(val: string): string {
  const n = parseNumericValue(val);
  if (n === null) return 'text-zinc-400';
  if (n < 0) return 'text-rose-400'; // deflation
  if (n <= 4) return 'text-emerald-400';
  if (n <= 6) return 'text-yellow-400';
  return 'text-rose-400';
}

export function yieldCurveBadge(status: string): { label: string; cls: string } {
  if (status?.includes('Invertida') || status?.includes('⚠️'))
    return { label: '⚠️ Invertida', cls: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
  if (status?.includes('N/A'))
    return { label: 'Sin datos', cls: 'bg-zinc-700/50 text-zinc-400 border-zinc-600/30' };
  return { label: 'Normal', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
}

export function creditImpulseColor(val: string): string {
  const n = parseNumericValue(val);
  if (n === null) return 'text-zinc-400';
  if (n > 10) return 'text-amber-400';    // overheating signal
  if (n > 0) return 'text-emerald-400';
  return 'text-rose-400';
}

export const PHASE_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  'Early Expansion':   { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30', label: '🟢 Expansión Temprana' },
  'Late Expansion':    { bg: 'bg-yellow-500/20',  text: 'text-yellow-300',  border: 'border-yellow-500/30',  label: '🟡 Expansión Tardía' },
  'Peak & Tightening': { bg: 'bg-orange-500/20',  text: 'text-orange-300',  border: 'border-orange-500/30',  label: '🟠 Cima y Endurecimiento' },
  'Contraction':       { bg: 'bg-rose-500/20',    text: 'text-rose-300',    border: 'border-rose-500/30',    label: '🔴 Contracción' },
  'Recovery':          { bg: 'bg-zinc-500/20',     text: 'text-zinc-300',     border: 'border-zinc-500/30',     label: '⚪ Recuperación' },
  'Falta de Transparencia': { bg: 'bg-zinc-700/40', text: 'text-zinc-400', border: 'border-zinc-600/30', label: '⚫ Sin Datos Suficientes' },
};

export const RULE_STATUS_ICON: Record<string, { icon: string; cls: string }> = {
  ok:      { icon: '✅', cls: 'text-emerald-400' },
  warning: { icon: '⚠️', cls: 'text-yellow-400' },
  breach:  { icon: '❌', cls: 'text-rose-400' },
  unknown: { icon: '❓', cls: 'text-zinc-500' },
};

export const CONFIDENCE_BADGE: Record<string, { label: string; cls: string }> = {
  high:   { label: 'Alta confianza (FRED)', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  medium: { label: 'Confianza media (TE)', cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  low:    { label: 'Datos parciales', cls: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  none:   { label: 'Sin datos', cls: 'text-zinc-500 bg-zinc-700/30 border-zinc-600/30' },
};
