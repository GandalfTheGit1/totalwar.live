/**
 * lib/data/country-metrics.ts
 *
 * Series reales por país (último dato disponible) para la barra superior y sus capas:
 * Banco Mundial (WDI, WGI, SIPRI vía WDI) y Trading Economics. Generado por scripts/build-country-metrics.ts.
 * Un campo ausente significa «sin dato», nunca cero.
 */

import data from './country-metrics.json';

/** Clave de métrica → slug del fichero en lib/data/trading-economics/values/. */
export const METRIC_SOURCES = {
  milSpendUsd: 'wb-ms-mil-xpnd-cd',
  milPctGdp: 'wb-ms-mil-xpnd-gd-zs',
  armedForces: 'wb-ms-mil-totl-p1',
  armsImportsTiv: 'wb-ms-mil-mprt-kd',
  wgiStability: 'wb-gov_wgi_pv_sc',
  wgiRuleOfLaw: 'wb-gov_wgi_rl_sc',
  wgiGovEffectiveness: 'wb-gov_wgi_ge_sc',
  wgiVoice: 'wb-gov_wgi_va_sc',
  wgiCorruption: 'wb-gov_wgi_cc_sc',
  terrorismIndex: 'terrorism-index',
  homicidesPer100k: 'wb-vc-ihr-psrc-p5',
  rdPctGdp: 'wb-gb-xpd-rsdv-gd-zs',
  researchersPerM: 'wb-sp-pop-scie-rd-p6',
  patentsResidents: 'wb-ip-pat-resd',
  internetPct: 'wb-it-net-user-zs',
  renewablePct: 'wb-eg-fec-rnew-zs',
  fossilElecPct: 'wb-eg-elc-fosl-zs',
  nuclearElecPct: 'wb-eg-elc-nucl-zs',
  fuelImportsPct: 'wb-tm-val-fuel-zs-un',
  oilRentsPct: 'wb-ny-gdp-petr-rt-zs',
  govDebtPct: 'government-debt-to-gdp',
} as const;

export type MetricKey = keyof typeof METRIC_SOURCES;
/** v = valor, y = periodo de referencia (año en el Banco Mundial, «Dec/25» en Trading Economics). */
export interface MetricPoint { v: number; y: string }
export type CountryMetrics = Partial<Record<MetricKey, MetricPoint>>;
export interface CountryMetricsFile {
  generatedAt: string;
  sources: Record<string, string>;
  countries: Record<string, CountryMetrics>;
}

const FILE = data as CountryMetricsFile;

export function getCountryMetrics(iso2: string | null | undefined): CountryMetrics {
  return (iso2 && FILE.countries[iso2]) || {};
}

export function metricValue(iso2: string | null | undefined, key: MetricKey): number | null {
  return getCountryMetrics(iso2)[key]?.v ?? null;
}

export function countriesWithMetrics(): string[] {
  return Object.keys(FILE.countries);
}

/** Riesgo de inestabilidad 0-100: inverso del percentil de Estabilidad Política del WGI. */
export function stabilityRisk(iso2: string | null | undefined): number | null {
  const pv = metricValue(iso2, 'wgiStability');
  return pv === null ? null : Math.round(100 - pv);
}

/**
 * Índice tecnológico 0-100: media de I+D sobre PIB (tope 4 %), investigadores por millón
 * (tope 8.000) y uso de Internet. Necesita al menos dos de los tres para no inflar con uno solo.
 */
export function realTechIndex(iso2: string | null | undefined): number | null {
  const parts = [
    [metricValue(iso2, 'rdPctGdp'), 4],
    [metricValue(iso2, 'researchersPerM'), 8000],
    [metricValue(iso2, 'internetPct'), 100],
  ].filter(([v]) => v !== null).map(([v, cap]) => Math.min(1, (v as number) / (cap as number)));
  return parts.length >= 2 ? Math.round((100 * parts.reduce((s, p) => s + p, 0)) / parts.length) : null;
}
