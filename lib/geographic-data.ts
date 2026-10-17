/**
 * @file geographic-data.ts
 * @description Facade central para operaciones geográficas, matriz de riesgo soberano y datos macroeconómicos.
 *
 * CONTEXTO ARQUITECTÓNICO & ROL EN EL SISTEMA:
 * - Capa: Facade Unificado de Dominio Geográfico (Geographic Facade).
 * - Módulo: `lib/geographic-data.ts`
 * - Responsabilidades:
 *   1. Centraliza la exportación de contratos de tipos, matrices de riesgo, constantes macro y presets geográficos.
 *   2. Proporciona una interfaz unificada y estable que aísla a los consumidores de la estructura interna en `lib/geographic/`.
 *   3. Mantiene 100% de compatibilidad retrospectiva con todos los módulos clientes, hooks y endpoints del sistema.
 *
 * CONSUMIDORES & RELACIONES EN EL SISTEMA:
 * - Hooks de Frontend:
 *   • `hooks/useGeographicOperations.ts`: Orquesta la carga de operaciones por país y datos de bolsas de valores.
 * - Endpoints de API:
 *   • `app/api/stocks/[ticker]/geographic/route.ts`: Cruza el Segment Reporting de la SEC con RAG de IA y riesgo país.
 *   • `app/api/macro/[country]/route.ts`: Consolida indicadores macroeconómicos de TradingEconomics con spreads de riesgo.
 *   • `app/api/dev/integrated-research/route.ts`: Inyecta métricas de riesgo geopolítico en los pipelines de investigación.
 * - Componentes Visuales:
 *   • `components/geographic-operations/segment-reporting-table.tsx`: Tabla de desgloses de ingresos e insignias de riesgo.
 *   • `components/geographic-operations/tabs/economics-tab.tsx`: Pestaña macroeconómica con paridades de divisas y rating.
 *   • `components/geographic-operations/margin-debt-chart.tsx`: Renderizado de series temporales de apalancamiento bursátil.
 *   • `components/geographic-operations/index.tsx`: Contenedor principal de mapas y pestañas geográficas.
 * - Servicios de Dominio:
 *   • `lib/trading-economics.ts`: Adaptador de scraping y API para datos macroeconómicos globales.
 *   • `lib/dalio-model.ts`: Modelo del ciclo de desapalancamiento y fases de deuda de Ray Dalio.
 *   • `lib/fred.ts`: Conector con la Reserva Federal para Margin Debt histórico.
 */

// 1. Tipos y Contratos de Dominio
export type {
  MarginDebtHistoryPoint,
  CountryEconomicData,
  CountryRiskInfo,
  CountryOperation,
  RegionSummary,
  CompanyGeographicData,
} from './geographic/types';

// 2. Matriz y Motor de Riesgo Soberano
export {
  COUNTRY_RISK_SPREADS,
  getCountryRiskInfo,
} from './geographic/country-risk';

// 3. Tipos de Cambio y Datos Bursátiles
export {
  EXCHANGE_RATES,
  STOCK_MARKET_DETAILS,
  getMockMarginDebtHistory,
  getStockMarketDetails,
} from './geographic/market-data';

// 4. Diccionario de Presets Geográficos (Mock Data)
export {
  geographicMockData,
} from './geographic/mock-data';
