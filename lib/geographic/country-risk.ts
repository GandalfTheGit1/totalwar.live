/**
 * @file country-risk.ts
 * @description Matriz de spreads EMBI, ratings crediticios soberanos y motor de clasificación de riesgo país.
 *
 * CONTEXTO ARQUITECTÓNICO & ROL EN EL SISTEMA:
 * - Capa: Motor de Riesgo Soberano y Macroeconómico.
 * - Módulo: `lib/geographic`
 * - Relación con el Sistema:
 *   1. Mantiene el índice de referencia de spreads de bonos soberanos (EMBI de J.P. Morgan, Bund Spreads europeos y Bond Spreads).
 *   2. Clasifica el riesgo país en 5 categorías ('Bajo', 'Moderado', 'Alto', 'Extremo', 'Falta de Transparencia').
 *   3. Asigna la métrica de cálculo adecuada:
 *      - 'zero-risk': Deuda soberana de máxima solvencia (EE.UU., Suiza, Suecia, Noruega, Dinamarca).
 *      - 'bund-spread': Diferencial frente al Bund alemán a 10 años para países de la Eurozona.
 *      - 'bond-spread': Deuda soberana de referencia local fuera de la Eurozona (Reino Unido - Gilt, Japón - JGB).
 *      - 'embi': Emerging Markets Bond Index para economías emergentes y en desarrollo.
 *      - 'unknown': Países sin cobertura formal de agencias o datos opacos.
 *
 * PUNTOS DE INTEGRACIÓN & CONSUMIDORES:
 * - `app/api/stocks/[ticker]/geographic/route.ts`: Modula el riesgo operativo ponderado por ingresos de cada filial internacional.
 * - `app/api/macro/[country]/route.ts`: Inyecta el spread y rating en los informes macroeconómicos por país.
 * - `app/api/dev/integrated-research/route.ts`: Evalúa el riesgo institucional en investigaciones de proveedores.
 * - `components/geographic-operations/segment-reporting-table.tsx`: Renderiza etiquetas visuales y tooltips de riesgo por país.
 * - `components/geographic-operations/tabs/economics-tab.tsx`: Muestra el perfil de riesgo crediticio y spread soberano.
 */

import { CountryRiskInfo } from './types';

/**
 * Matriz estática de spreads soberanos (EMBI en puntos básicos) y calificaciones crediticias soberanas
 * para más de 45 países clave en el comercio y las cadenas de valor internacionales.
 */
export const COUNTRY_RISK_SPREADS: Record<string, CountryRiskInfo> = {
  US: { embi: 0, rating: 'AA+ Stable', classification: 'Bajo' },
  DE: { embi: 12, rating: 'AAA Stable', classification: 'Bajo' },
  CA: { embi: 18, rating: 'AAA Stable', classification: 'Bajo' },
  AU: { embi: 22, rating: 'AAA Stable', classification: 'Bajo' },
  JP: { embi: 28, rating: 'A+ Stable', classification: 'Bajo' },
  FR: { embi: 32, rating: 'AA- Negative', classification: 'Bajo' },
  IE: { embi: 35, rating: 'AA Stable', classification: 'Bajo' },
  GB: { embi: 42, rating: 'AA Stable', classification: 'Bajo' },
  KR: { embi: 45, rating: 'AA Stable', classification: 'Bajo' },
  TW: { embi: 52, rating: 'AA+ Stable', classification: 'Bajo' },
  ES: { embi: 65, rating: 'A Stable', classification: 'Bajo' },
  CN: { embi: 75, rating: 'A+ Stable', classification: 'Bajo' },
  IT: { embi: 88, rating: 'BBB Stable', classification: 'Bajo' },
  IN: { embi: 185, rating: 'BBB- Stable', classification: 'Moderado' },
  BR: { embi: 270, rating: 'BB- Stable', classification: 'Moderado' },
  MX: { embi: 330, rating: 'BBB Stable', classification: 'Moderado' },
  UY: { embi: 145, rating: 'BBB+ Stable', classification: 'Moderado' },
  CL: { embi: 160, rating: 'A Stable', classification: 'Bajo' },
  PE: { embi: 195, rating: 'BBB Stable', classification: 'Moderado' },
  PY: { embi: 215, rating: 'BB+ Stable', classification: 'Moderado' },
  CO: { embi: 340, rating: 'BB+ Stable', classification: 'Moderado' },
  CR: { embi: 280, rating: 'BB- Stable', classification: 'Moderado' },
  PA: { embi: 390, rating: 'BBB- Stable', classification: 'Moderado' },
  GT: { embi: 290, rating: 'BB Stable', classification: 'Moderado' },
  HN: { embi: 380, rating: 'BB- Stable', classification: 'Moderado' },
  SV: { embi: 620, rating: 'CCC+ Stable', classification: 'Alto' },
  EC: { embi: 1250, rating: 'CCC+ Stable', classification: 'Alto' },
  BO: { embi: 1950, rating: 'CCC Stable', classification: 'Extremo' },
  VE: { embi: 18500, rating: 'SD', classification: 'Extremo' },
  AR: { embi: 1100, rating: 'CCC Stable', classification: 'Alto' },
  RU: { embi: 2500, rating: 'SD', classification: 'Extremo' },
  UA: { embi: 4500, rating: 'SD', classification: 'Extremo' },
  ZA: { embi: 310, rating: 'BB- Stable', classification: 'Moderado' },
  IL: { embi: 140, rating: 'A+ Negative', classification: 'Moderado' },
  SA: { embi: 95, rating: 'A+ Stable', classification: 'Bajo' },
  TR: { embi: 295, rating: 'B+ Stable', classification: 'Moderado' },
  EG: { embi: 780, rating: 'B- Stable', classification: 'Alto' },
  SG: { embi: 10, rating: 'AAA Stable', classification: 'Bajo' },
  NL: { embi: 14, rating: 'AAA Stable', classification: 'Bajo' },
  BE: { embi: 25, rating: 'AA Stable', classification: 'Bajo' },
  CH: { embi: 8, rating: 'AAA Stable', classification: 'Bajo' },
  NZ: { embi: 18, rating: 'AA+ Stable', classification: 'Bajo' },
  SE: { embi: 12, rating: 'AAA Stable', classification: 'Bajo' },
  NO: { embi: 9, rating: 'AAA Stable', classification: 'Bajo' },
  FI: { embi: 15, rating: 'AA+ Stable', classification: 'Bajo' },
  DK: { embi: 10, rating: 'AAA Stable', classification: 'Bajo' },
  PT: { embi: 50, rating: 'A- Stable', classification: 'Bajo' },
  GR: { embi: 85, rating: 'BBB- Stable', classification: 'Bajo' },
  PL: { embi: 70, rating: 'A- Stable', classification: 'Bajo' },
  NG: { embi: 680, rating: 'B- Stable', classification: 'Alto' },
};

/**
 * Resuelve la información de riesgo soberano y métricas para un código de país dado.
 * Si el país no está catalogado, aplica un fallback defensivo con clasificación 'Falta de Transparencia'.
 * 
 * @param countryCode Código ISO de 2 letras del país (ej. "US", "DE", "AR")
 * @returns Objeto `CountryRiskInfo` con spread, rating, clasificación y métrica aplicable
 */
export function getCountryRiskInfo(countryCode?: string | null): CountryRiskInfo {
  if (!countryCode || typeof countryCode !== 'string') {
    return {
      embi: 0,
      rating: 'N/A',
      classification: 'Falta de Transparencia',
      riskMetricType: 'unknown',
      dataSource: 'static'
    };
  }

  const code = countryCode.trim().toUpperCase();
  const staticData = COUNTRY_RISK_SPREADS[code];
  if (staticData) {
    let riskMetricType: 'embi' | 'bund-spread' | 'bond-spread' | 'zero-risk' | 'unknown' = 'embi';
    if (['US', 'CH', 'SE', 'NO', 'DK'].includes(code)) riskMetricType = 'zero-risk';
    else if (['DE', 'FR', 'IT', 'ES', 'IE', 'NL', 'BE', 'PT', 'GR'].includes(code)) riskMetricType = 'bund-spread';
    else if (['GB', 'JP'].includes(code)) riskMetricType = 'bond-spread';

    return {
      ...staticData,
      riskMetricType,
      dataSource: 'static'
    };
  }
  return { 
    embi: 0, 
    rating: 'N/A', 
    classification: 'Falta de Transparencia',
    riskMetricType: 'unknown',
    dataSource: 'static'
  };
}
