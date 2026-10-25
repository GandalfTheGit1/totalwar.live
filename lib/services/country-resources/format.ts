/**
 * Formato en español de cantidades y cuotas del dataset de recursos.
 */

import { ResourceUnit } from './types';

function num(value: number, maxDecimals: number): string {
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: maxDecimals }).format(value);
}

/** Valor con 3 cifras significativas aprox. y un sufijo de escala. */
function scaled(value: number, unit: string, scales: [number, string][]): string {
  for (const [factor, prefix] of scales) {
    if (Math.abs(value) >= factor) {
      const v = value / factor;
      return `${num(v, v < 10 ? 2 : v < 100 ? 1 : 0)} ${prefix}${unit}`;
    }
  }
  return `${num(value, value < 10 ? 2 : 0)} ${unit}`;
}

const TONNE_SCALES: [number, string][] = [[1e9, 'G'], [1e6, 'M'], [1e3, 'k']];

/** «8,31 Mt», «854 kt», «1,34 t», «62,9 TWh», «102.055 Mm³», «9,3 M quilates». */
export function formatQuantity(value: number, unit: ResourceUnit): string {
  switch (unit) {
    case 't':
      return scaled(value, 't', TONNE_SCALES);
    case 'kg':
      return value >= 1000 ? scaled(value / 1000, 't', TONNE_SCALES) : `${num(value, 1)} kg`;
    case 'ct':
      return value >= 1e6 ? `${num(value / 1e6, 1)} M quilates` : `${num(value, 0)} quilates`;
    case 'Mm3':
      return value >= 1000 ? `${num(value / 1000, 1)} mil M m³` : `${num(value, 1)} M m³`;
    case 'm3':
      return scaled(value, 'm³', [[1e6, 'M '], [1e3, 'mil ']]);
    case 'TWh':
      return value >= 1 ? `${num(value, 1)} TWh` : `${num(value * 1000, 0)} GWh`;
    case 'head':
      return scaled(value, 'cabezas', [[1e6, 'M '], [1e3, 'mil ']]);
    case 'hive':
      return scaled(value, 'colmenas', [[1e6, 'M '], [1e3, 'mil ']]);
    default:
      return num(value, 2);
  }
}

/** Nombre largo de la unidad para leyendas y tooltips. */
export const UNIT_LABELS: Record<ResourceUnit, string> = {
  t: 'toneladas',
  kg: 'kilogramos',
  ct: 'quilates',
  Mm3: 'millones de m³',
  m3: 'metros cúbicos',
  TWh: 'teravatios-hora',
  head: 'cabezas de ganado',
  hive: 'colmenas',
};

/** «32,5 %», «0,04 %», «<0,01 %». */
export function formatShare(share: number | null): string {
  if (share === null) return '—';
  const pct = share * 100;
  if (pct > 0 && pct < 0.01) return '<0,01 %';
  return `${num(pct, pct < 1 ? 2 : 1)} %`;
}
