/**
 * @file types.ts
 * @description Interfaces y tipos para operaciones geográficas, riesgo país y datos macroeconómicos.
 *
 * CONTEXTO ARQUITECTÓNICO & ROL EN EL SISTEMA:
 * - Capa: Definición de Tipos de Dominio Geográfico y Macroeconómico.
 * - Módulo: `lib/geographic`
 * - Relación con el Sistema:
 *   1. Modela los desgloses geográficos de ingresos y operaciones de empresas cotizadas (Segment Reporting SEC Form 10-K / Item 1).
 *   2. Define las estructuras de deuda de margen, ratings crediticios e indicadores macroeconómicos (EMBI, ciclos Dalio, paridades cambiarias).
 *   3. Establece los contratos tipados compartidos entre APIs backend (`/api/stocks/[ticker]/geographic`, `/api/macro/[country]`),
 *      motores de scraping (`trading-economics.ts`), y componentes UI de visualización cartográfica (`components/geographic-operations/*`).
 */

/**
 * Punto de serie temporal de apalancamiento bursátil (Margin Debt).
 * Utilizado por `components/geographic-operations/margin-debt-chart.tsx` y el servicio `lib/fred.ts`.
 */
export interface MarginDebtHistoryPoint {
  month: string;
  marginDebt: number;
  marginDebtPercent: number;
  averageLeverage: number;
}

/**
 * Snapshot macroeconómico integral de un país.
 * Consolida datos de PIB, inflación, tasas de interés, deuda/PIB, impuestos, rating crediticio y el ciclo de deuda de Ray Dalio.
 * Consumido por `lib/trading-economics.ts`, `lib/dalio-model.ts` y `components/geographic-operations/tabs/economics-tab.tsx`.
 */
export interface CountryEconomicData {
  gdpGrowth: string;
  gdpGrowthPrevious?: string;
  inflation: string;
  inflationPrevious?: string;
  interestRate: string;
  interestRatePrevious?: string;
  debtToGdp: string;
  debtToGdpPrevious?: string;
  corporateTax: string;
  corporateTaxPrevious?: string;
  unemployment: string;
  unemploymentPrevious?: string;
  gdpPerCapita: string;
  gdpPerCapitaPrevious?: string;
  tradeBalance: string;
  tradeBalancePrevious?: string;
  creditRating: string;
  creditRatingPrevious?: string;
  rdSpending: string;
  rdSpendingPrevious?: string;
  manufacturingPmi?: string;
  manufacturingPmiPrevious?: string;
  servicesPmi?: string;
  servicesPmiPrevious?: string;
  compositePmi?: string;
  compositePmiPrevious?: string;
  tradingEconomicsSlug: string;
  stockMarketName?: string;
  stockMarketDebt?: string;
  stockMarketLeverage?: string;
  marginDebtHistory?: MarginDebtHistoryPoint[];
  buffettIndicator?: string;
  exchangeRate?: number;
  dalioDebtCycle?: {
    shortTermCyclePhase: string;
    longTermCyclePhase: string;
    productivityGrowthTrend: string;
    levers: {
      austerity: number;
      debtReduction: number;
      wealthRedistribution: number;
      moneyPrinting: number;
    };
    deleveragingStatus: string;
    dalioCommentary: string;
  };
}

/**
 * Información de riesgo soberano y spreads de deuda pública.
 * Evalúa spreads EMBI (J.P. Morgan), Bund Spreads europeos o Bond Spreads para calificar el riesgo país.
 */
export interface CountryRiskInfo {
  embi: number; // Spread en puntos básicos (pb), 0 para EE.UU. o riesgo despreciable
  rating: string; // Rating crediticio soberano (ej. "AAA Stable", "BBB- Stable")
  classification: 'Bajo' | 'Moderado' | 'Alto' | 'Extremo' | 'Falta de Transparencia';
  riskMetricType?: 'embi' | 'bund-spread' | 'bond-spread' | 'zero-risk' | 'unknown';
  dataSource?: 'live' | 'static';
}

/**
 * Desglose operativo y de ingresos de una empresa en un país determinado.
 * Mapea el porcentaje de ingresos, tipo de operación (Sede, R&D, Manufactura, etc.), score de riesgo y detalles regulatorios.
 */
export interface CountryOperation {
  countryCode: string; // ej. "US", "CN", "TW", "IE", "JP", "MX", "BR", "IN", "GB"
  countryName: string;
  flag: string; // Emoji de bandera
  revenuePercent: number; // Porcentaje del total de ingresos de la empresa
  operationType: string; // ej. "Sede Central y Diseño", "Manufactura", "Optimización Fiscal"
  riskScore: number; // Score numérico 0-10
  riskDescription: string;
  details: string; // Especificaciones operativas y dependencias
  analysisPoints?: Array<{ source?: string; sentiment?: string; point?: string; quote?: string } | string>;
  economics?: CountryEconomicData;
  countryRisk?: CountryRiskInfo;
}

/**
 * Resumen de ingresos agrupados por macro-región geográfica y coordenadas de proyección cartográfica SVG.
 */
export interface RegionSummary {
  name: string; // ej. "Norteamérica", "Europa", "Gran China", "Asia-Pacífico"
  revenuePercent: number;
  coordinates: { x: number; y: number }; // Coordenadas en la proyección SVG del mapa interactivo
}

/**
 * Estructura agregada raíz que consolida la presencia geográfica global de una empresa.
 * Incluye regiones, operaciones desglosadas por país y la deducción cualitativa del foso geopolítico al estilo Warren Buffett.
 */
export interface CompanyGeographicData {
  companyId: string;
  regions: RegionSummary[];
  countries: CountryOperation[];
  geopoliticalMoatInsight: string; // Comentario cualitativo sobre exposición geopolítica y foso estructural
}
