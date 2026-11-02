/**
 * lib/trading-economics/search.ts
 *
 * Buscador de indicadores de Trading Economics: nombre en inglés, alias en español
 * y categoría, sin distinguir acentos. Prioriza los indicadores ya descargados.
 */

import { matchScore, normalizeSearchText } from '@/lib/services/country-resources/query';
import type { TeIndicator } from './country-list';

/** Alias en español de los indicadores más buscados (el catálogo solo viene en inglés). */
const ES_ALIASES: Record<string, string[]> = {
  gdp: ['PIB', 'producto interior bruto'],
  'gdp-growth-rate': ['crecimiento del PIB', 'crecimiento trimestral'],
  'gdp-annual-growth-rate': ['crecimiento anual del PIB'],
  'gdp-per-capita': ['PIB per cápita', 'renta per cápita'],
  'inflation-rate': ['inflación', 'IPC', 'precios'],
  'core-inflation-rate': ['inflación subyacente'],
  'interest-rate': ['tipo de interés', 'tasa de interés', 'tipos oficiales'],
  'unemployment-rate': ['paro', 'desempleo', 'tasa de paro'],
  'youth-unemployment-rate': ['paro juvenil', 'desempleo juvenil'],
  'government-debt-to-gdp': ['deuda pública', 'deuda sobre PIB'],
  'government-budget': ['déficit público', 'saldo presupuestario'],
  'current-account-to-gdp': ['cuenta corriente', 'balanza por cuenta corriente'],
  'balance-of-trade': ['balanza comercial', 'saldo comercial'],
  'foreign-exchange-reserves': ['reservas de divisas', 'reservas internacionales'],
  rating: ['calificación crediticia', 'rating soberano', 'nota de crédito'],
  'minimum-wages': ['salario mínimo'],
  'average-annual-wages': ['salario medio'],
  population: ['población'],
  'corporate-tax-rate': ['impuesto de sociedades'],
  'personal-income-tax-rate': ['IRPF', 'impuesto sobre la renta'],
  'sales-tax-rate': ['IVA', 'impuesto sobre ventas'],
  'co2-emissions': ['emisiones de CO2'],
  'military-expenditure': ['gasto militar', 'defensa'],
  'housing-index': ['precio de la vivienda'],
  'consumer-confidence': ['confianza del consumidor'],
  'business-confidence': ['confianza empresarial'],
  'money-supply-m2': ['masa monetaria'],
  'foreign-direct-investment': ['inversión extranjera directa', 'IED'],
};

export interface IndicatorSearchResult {
  indicator: TeIndicator;
  /** Texto que coincidió, para mostrar «vía …» si no es el nombre. */
  matched: string;
  score: number;
}

export function searchIndicators(catalog: TeIndicator[], rawQuery: string, limit = 10): IndicatorSearchResult[] {
  const query = normalizeSearchText(rawQuery);
  if (!query) return [];
  const results: IndicatorSearchResult[] = [];
  for (const indicator of catalog) {
    const candidates: [string, number][] = [
      [indicator.name, 1],
      ...(ES_ALIASES[indicator.slug] ?? []).map((a): [string, number] => [a, 1]),
      [indicator.category, 0.5],
    ];
    let best = { score: 0, matched: '' };
    for (const [text, weight] of candidates) {
      const score = matchScore(text, query) * weight;
      if (score > best.score) best = { score, matched: text };
    }
    if (best.score > 0) results.push({ indicator, matched: best.matched, score: best.score });
  }
  return results
    .sort((a, b) => b.score - a.score || (b.indicator.countryCount ?? 0) - (a.indicator.countryCount ?? 0))
    .slice(0, limit);
}
