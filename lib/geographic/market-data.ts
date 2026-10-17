/**
 * @file market-data.ts
 * @description Constantes de tipos de cambio, bolsas de valores y utilidades de apalancamiento por país.
 *
 * CONTEXTO ARQUITECTÓNICO & ROL EN EL SISTEMA:
 * - Capa: Datos de Mercado Macroeconómico e Índices Bursátiles.
 * - Módulo: `lib/geographic`
 * - Relación con el Sistema:
 *   1. Mapea códigos de país (ISO-2) a sus principales bolsas de valores y plazas bursátiles mundiales.
 *   2. Proporciona tasas de cambio estáticas de referencia a USD para conversiones monetarias preliminares y normalización de ingresos.
 *   3. Soporta interfaces para series temporales de Margin Debt y apalancamiento financiero.
 *
 * PUNTOS DE INTEGRACIÓN & CONSUMIDORES:
 * - `hooks/useGeographicOperations.ts`: Inyecta el nombre oficial de la bolsa en el estado reactivo del componente de operaciones.
 * - `components/geographic-operations/index.tsx`: Despliega el resumen de la plaza bursátil asociada al país seleccionado.
 * - `components/geographic-operations/tabs/economics-tab.tsx`: Utiliza `EXCHANGE_RATES` para la conversión y análisis de divisas locales.
 * - `lib/trading-economics.ts`: Vincula la plaza bursátil correspondiente al recuperar métricas de TradingEconomics.
 * - `scripts/update-db-leverage-history.ts`: Utilizado en scripts batch para actualizar la base de datos de deuda de margen.
 */

import { MarginDebtHistoryPoint } from './types';

/**
 * Tasas de cambio de referencia respecto al Dólar Estadounidense (USD).
 * Utilizado como benchmark estático rápido cuando las APIs en vivo de divisas están en enfriamiento o no configuradas.
 */
export const EXCHANGE_RATES: Record<string, number> = {
  US: 1.0,
  CN: 0.138,    // CNY to USD
  TW: 0.031,    // TWD to USD
  IE: 1.08,     // EUR to USD
  IN: 0.012,    // INR to USD
  GB: 1.27,     // GBP to USD
  JP: 0.0064,   // JPY to USD
  MX: 0.054,    // MXN to USD
  BR: 0.18,     // BRL to USD
  DE: 1.08,     // EUR to USD
  FR: 1.08,     // EUR to USD
  KR: 0.00072,  // KRW to USD
  IT: 1.08,     // EUR to USD
  CA: 0.73,     // CAD to USD
  AU: 0.66,     // AUD to USD
  ES: 1.08,     // EUR to USD
};

/**
 * Diccionario de principales plazas bursátiles e índices accionarios por código ISO de país.
 */
export const STOCK_MARKET_DETAILS: Record<string, { stockMarketName: string; stockMarketDebt?: string; stockMarketLeverage?: string; buffettIndicator?: string }> = {
  US: { stockMarketName: 'NYSE & NASDAQ (Estados Unidos)' },
  CN: { stockMarketName: 'SSE & SZSE (Shanghai/Shenzhen)' },
  TW: { stockMarketName: 'TWSE (Taiwán)' },
  IE: { stockMarketName: 'Euronext Dublin (Irlanda)' },
  IN: { stockMarketName: 'NSE & BSE (India)' },
  GB: { stockMarketName: 'LSE (Reino Unido)' },
  JP: { stockMarketName: 'TSE (Tokio)' },
  MX: { stockMarketName: 'BMV (México)' },
  BR: { stockMarketName: 'B3 (Brasil)' },
  DE: { stockMarketName: 'Frankfurt Stock Exchange (Alemania)' },
  FR: { stockMarketName: 'Euronext Paris (Francia)' },
  KR: { stockMarketName: 'KRX (Corea del Sur)' },
  IT: { stockMarketName: 'Borsa Italiana (Italia)' },
  CA: { stockMarketName: 'TSX (Canadá)' },
  AU: { stockMarketName: 'ASX (Australia)' },
  ES: { stockMarketName: 'BME (España)' }
};

/**
 * Devuelve el historial de margin debt (apalancamiento bursátil).
 * En la arquitectura de producción solo retorna datos reales (o array vacío si no hay registros persistidos en Supabase).
 */
export function getMockMarginDebtHistory(countryCode?: string | null): MarginDebtHistoryPoint[] {
  return [];
}

/**
 * Resuelve los detalles del mercado bursátil de un país dado su código ISO-2.
 * 
 * @param countryCode Código ISO de 2 letras (ej. "US", "DE", "JP")
 * @returns Objeto con `stockMarketName` o estructura vacía si no existe.
 */
export function getStockMarketDetails(countryCode?: string | null) {
  if (!countryCode || typeof countryCode !== 'string') return {};
  const code = countryCode.trim().toUpperCase();
  const base = STOCK_MARKET_DETAILS[code];
  if (!base) return {};
  return {
    stockMarketName: base.stockMarketName
  };
}
