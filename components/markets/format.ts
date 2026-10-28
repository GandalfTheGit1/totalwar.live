export const usd = (n: number, digits = 2) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);

export function compactUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toFixed(0)}`;
}

/** Share price as cents, e.g. 0.265 -> "26.5¢". */
export function cents(price: number | null): string {
  if (price === null) return '—';
  const c = price * 100;
  return `${Number.isInteger(c) ? c : c.toFixed(1)}¢`;
}

export function percent(n: number, digits = 1): string {
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(digits)}%`;
}

export function signedUsd(n: number): string {
  return `${n > 0 ? '+' : ''}${usd(n)}`;
}

export function shortDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
}
