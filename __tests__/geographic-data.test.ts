/**
 * @file geographic-data.test.ts
 * @description Suite exhaustiva de pruebas unitarias para datos geográficos, riesgo soberano y macroeconomía.
 *
 * CONTEXTO ARQUITECTÓNICO & ROL EN EL SISTEMA:
 * - Capa: Testing & Verificación de Dominio Macroeconómico y Geopolítico.
 * - Módulo: `__tests__/geographic-data.test.ts`
 * - Responsabilidades de Prueba:
 *   1. Verificar la solidez del motor de clasificación de riesgo soberano (`getCountryRiskInfo`) ante entradas válidas,
 *      códigos en minúsculas, espacios en blanco, valores nulos, indefinidos y códigos no catalogados.
 *   2. Validar las 4 tipologías de spreads soberanos (`zero-risk`, `bund-spread`, `bond-spread`, `embi`) y todas las
 *      categorías de severidad ('Bajo', 'Moderado', 'Alto', 'Extremo', 'Falta de Transparencia').
 *   3. Auditar la consistencia completa de la matriz `COUNTRY_RISK_SPREADS` (45+ países).
 *   4. Probar la resolución de plazas bursátiles (`getStockMarketDetails`) y tasas de cambio (`EXCHANGE_RATES`).
 *   5. Validar la integridad estructural y contable de los 5 presets del diccionario (`geographicMockData`).
 *   6. Garantizar la paridad de exportaciones entre el Facade unificado y los submódulos especializados.
 */

import { describe, it, expect } from 'vitest';
import {
  getCountryRiskInfo,
  COUNTRY_RISK_SPREADS,
  EXCHANGE_RATES,
  STOCK_MARKET_DETAILS,
  getStockMarketDetails,
  getMockMarginDebtHistory,
  geographicMockData,
} from '@/lib/geographic-data';
import { getCountryRiskInfo as getCountryRiskInfoDirect } from '@/lib/geographic/country-risk';
import { getStockMarketDetails as getStockMarketDetailsDirect } from '@/lib/geographic/market-data';
import { geographicMockData as geographicMockDataDirect } from '@/lib/geographic/mock-data';

describe('Geographic Data & Country Risk Subsystem', () => {
  // ─── 1. Pruebas de Motor de Riesgo Soberano (getCountryRiskInfo) ─────────────────
  describe('Motor de Riesgo Soberano (getCountryRiskInfo)', () => {
    it('debe clasificar países zero-risk con spread 0 o negligible y máxima calificación', () => {
      const zeroRiskCodes = ['US', 'CH', 'SE', 'NO', 'DK'];
      zeroRiskCodes.forEach((code) => {
        const info = getCountryRiskInfo(code);
        expect(info.riskMetricType).toBe('zero-risk');
        expect(info.classification).toBe('Bajo');
        expect(info.rating).toMatch(/AA\+|AAA/);
        expect(info.embi).toBeGreaterThanOrEqual(0);
        expect(info.dataSource).toBe('static');
      });
    });

    it('debe clasificar países de la Eurozona con la métrica bund-spread', () => {
      const euroCodes = ['DE', 'FR', 'IT', 'ES', 'IE', 'NL', 'BE', 'PT', 'GR'];
      euroCodes.forEach((code) => {
        const info = getCountryRiskInfo(code);
        expect(info.riskMetricType).toBe('bund-spread');
        expect(info.classification).toBe('Bajo');
        expect(info.embi).toBeGreaterThanOrEqual(0);
      });
    });

    it('debe clasificar países soberanos con deuda de referencia local (bond-spread)', () => {
      const bondSpreadCodes = ['GB', 'JP'];
      bondSpreadCodes.forEach((code) => {
        const info = getCountryRiskInfo(code);
        expect(info.riskMetricType).toBe('bond-spread');
        expect(info.classification).toBe('Bajo');
      });
    });

    it('debe clasificar economías emergentes con spread EMBI y sus respectivas categorías de severidad', () => {
      // Moderado
      const moderados = ['BR', 'MX', 'IN', 'CO', 'PE', 'ZA', 'TR'];
      moderados.forEach((code) => {
        const info = getCountryRiskInfo(code);
        expect(info.riskMetricType).toBe('embi');
        expect(info.classification).toBe('Moderado');
        expect(info.embi).toBeGreaterThan(100);
      });

      // Alto
      const altos = ['AR', 'EG', 'NG', 'SV', 'EC'];
      altos.forEach((code) => {
        const info = getCountryRiskInfo(code);
        expect(info.riskMetricType).toBe('embi');
        expect(info.classification).toBe('Alto');
        expect(info.embi).toBeGreaterThanOrEqual(600);
      });

      // Extremo
      const extremos = ['VE', 'RU', 'UA', 'BO'];
      extremos.forEach((code) => {
        const info = getCountryRiskInfo(code);
        expect(info.riskMetricType).toBe('embi');
        expect(info.classification).toBe('Extremo');
        expect(info.embi).toBeGreaterThanOrEqual(1900);
      });
    });

    it('debe ser tolerante a mayúsculas/minúsculas y espacios en blanco', () => {
      const resLower = getCountryRiskInfo('us');
      expect(resLower.riskMetricType).toBe('zero-risk');

      const resSpaces = getCountryRiskInfo('  ES   ');
      expect(resSpaces.riskMetricType).toBe('bund-spread');
      expect(resSpaces.embi).toBe(65);

      const resMixed = getCountryRiskInfo('bR');
      expect(resMixed.riskMetricType).toBe('embi');
      expect(resMixed.embi).toBe(270);
    });

    it('debe gestionar defensivamente entradas vacías, nulas o no válidas con Falta de Transparencia', () => {
      const fallbackNull = getCountryRiskInfo(null);
      expect(fallbackNull).toEqual({
        embi: 0,
        rating: 'N/A',
        classification: 'Falta de Transparencia',
        riskMetricType: 'unknown',
        dataSource: 'static',
      });

      const fallbackUndefined = getCountryRiskInfo(undefined);
      expect(fallbackUndefined.classification).toBe('Falta de Transparencia');

      const fallbackEmpty = getCountryRiskInfo('');
      expect(fallbackEmpty.classification).toBe('Falta de Transparencia');

      const fallbackSpaces = getCountryRiskInfo('   ');
      expect(fallbackSpaces.classification).toBe('Falta de Transparencia');

      const fallbackUnknown = getCountryRiskInfo('XYZ_UNKNOWN');
      expect(fallbackUnknown.classification).toBe('Falta de Transparencia');
      expect(fallbackUnknown.riskMetricType).toBe('unknown');
    });

    it('debe validar la integridad de todos los países catalogados en COUNTRY_RISK_SPREADS', () => {
      const entries = Object.entries(COUNTRY_RISK_SPREADS);
      expect(entries.length).toBeGreaterThanOrEqual(45);

      entries.forEach(([countryCode, risk]) => {
        expect(countryCode).toHaveLength(2);
        expect(risk.embi).toBeGreaterThanOrEqual(0);
        expect(risk.rating).toBeTruthy();
        expect(['Bajo', 'Moderado', 'Alto', 'Extremo']).toContain(risk.classification);

        // Al procesar vía getCountryRiskInfo, debe asignar una métrica válida
        const resolved = getCountryRiskInfo(countryCode);
        expect(['zero-risk', 'bund-spread', 'bond-spread', 'embi']).toContain(resolved.riskMetricType);
      });
    });
  });

  // ─── 2. Pruebas de Bolsas de Valores y Divisas ──────────────────────────────────
  describe('Bolsas de Valores y Tasas de Cambio', () => {
    it('debe resolver la bolsa oficial para países con cobertura bursátil', () => {
      expect(getStockMarketDetails('US').stockMarketName).toBe('NYSE & NASDAQ (Estados Unidos)');
      expect(getStockMarketDetails('jp').stockMarketName).toBe('TSE (Tokio)');
      expect(getStockMarketDetails('  DE  ').stockMarketName).toBe('Frankfurt Stock Exchange (Alemania)');
      expect(getStockMarketDetails('BR').stockMarketName).toBe('B3 (Brasil)');
      expect(getStockMarketDetails('MX').stockMarketName).toBe('BMV (México)');
      expect(getStockMarketDetails('GB').stockMarketName).toBe('LSE (Reino Unido)');
    });

    it('debe retornar objeto vacío ante países sin bolsa mapeada o entradas defectuosas', () => {
      expect(getStockMarketDetails('XX')).toEqual({});
      expect(getStockMarketDetails(null)).toEqual({});
      expect(getStockMarketDetails(undefined)).toEqual({});
      expect(getStockMarketDetails('')).toEqual({});
      expect(getStockMarketDetails('   ')).toEqual({});
    });

    it('todas las entradas de STOCK_MARKET_DETAILS deben tener un stockMarketName no vacío', () => {
      Object.entries(STOCK_MARKET_DETAILS).forEach(([code, details]) => {
        expect(code).toHaveLength(2);
        expect(details.stockMarketName).toBeTruthy();
        expect(typeof details.stockMarketName).toBe('string');
      });
    });

    it('debe exponer tasas de cambio numéricas positivas para todas las monedas soportadas', () => {
      expect(EXCHANGE_RATES.US).toBe(1.0);
      Object.entries(EXCHANGE_RATES).forEach(([code, rate]) => {
        expect(code).toHaveLength(2);
        expect(typeof rate).toBe('number');
        expect(rate).toBeGreaterThan(0);
      });
    });

    it('getMockMarginDebtHistory debe retornar un array vacío para evitar datos ficticios no persistidos', () => {
      expect(getMockMarginDebtHistory('US')).toEqual([]);
      expect(getMockMarginDebtHistory('DE')).toEqual([]);
      expect(getMockMarginDebtHistory(null)).toEqual([]);
    });
  });

  // ─── 3. Pruebas del Diccionario de Mock Data Geográfica ─────────────────────────
  describe('Diccionario de Presets Geográficos (geographicMockData)', () => {
    const EXPECTED_PRESET_IDS = ['1', '2', '3', '4', '5'];

    it('debe contener exactamente los presets de las 5 empresas modelo del portafolio Buffett', () => {
      EXPECTED_PRESET_IDS.forEach((id) => {
        expect(geographicMockData[id]).toBeDefined();
        expect(geographicMockData[id].companyId).toBe(id);
      });
      expect(geographicMockData['999']).toBeUndefined();
    });

    it('cada preset debe poseer regiones válidas con porcentajes de ingresos y coordenadas SVG', () => {
      EXPECTED_PRESET_IDS.forEach((id) => {
        const company = geographicMockData[id];
        expect(company.regions.length).toBeGreaterThan(0);

        company.regions.forEach((region) => {
          expect(region.name).toBeTruthy();
          expect(region.revenuePercent).toBeGreaterThan(0);
          expect(region.revenuePercent).toBeLessThanOrEqual(100);
          expect(typeof region.coordinates.x).toBe('number');
          expect(typeof region.coordinates.y).toBe('number');
        });
      });
    });

    it('cada preset debe poseer operaciones desglosadas por país con datos macro y riesgos', () => {
      EXPECTED_PRESET_IDS.forEach((id) => {
        const company = geographicMockData[id];
        expect(company.countries.length).toBeGreaterThan(0);

        company.countries.forEach((op) => {
          expect(op.countryCode).toHaveLength(2);
          expect(op.countryName).toBeTruthy();
          expect(op.flag).toBeTruthy();
          expect(op.revenuePercent).toBeGreaterThanOrEqual(0);
          expect(op.operationType).toBeTruthy();
          expect(op.riskScore).toBeGreaterThanOrEqual(0);
          expect(op.riskScore).toBeLessThanOrEqual(10);
          expect(op.riskDescription).toBeTruthy();
          expect(op.details).toBeTruthy();

          if (op.economics) {
            expect(op.economics.gdpGrowth).toBeTruthy();
            expect(op.economics.inflation).toBeTruthy();
            expect(op.economics.interestRate).toBeTruthy();
            expect(op.economics.debtToGdp).toBeTruthy();
            expect(op.economics.corporateTax).toBeTruthy();
            expect(op.economics.unemployment).toBeTruthy();
            expect(op.economics.creditRating).toBeTruthy();
            expect(op.economics.tradingEconomicsSlug).toBeTruthy();
          }
        });
      });
    });

    it('cada preset debe incluir deducciones de foso geopolítico coherentes con el modelo Buffett', () => {
      expect(geographicMockData['1'].geopoliticalMoatInsight).toMatch(/Apple.*cadena de suministro.*China.*Taiwán/i);
      expect(geographicMockData['2'].geopoliticalMoatInsight).toMatch(/Berkshire.*economía doméstica.*EE\. UU\./i);
      expect(geographicMockData['3'].geopoliticalMoatInsight).toMatch(/Microsoft.*software.*Cloud/i);
      expect(geographicMockData['4'].geopoliticalMoatInsight).toMatch(/Coca-Cola.*asset-light.*embotellado/i);
      expect(geographicMockData['5'].geopoliticalMoatInsight).toMatch(/foso de red de Visa.*(?:UnionPay|PIX)/i);
    });
  });

  // ─── 4. Paridad de Fachada y Submódulos ─────────────────────────────────────────
  describe('Paridad entre Fachada (@/lib/geographic-data) y Submódulos (@/lib/geographic/*)', () => {
    it('getCountryRiskInfo debe comportarse idénticamente si se invoca desde la fachada o el submódulo', () => {
      const testCodes = ['US', 'DE', 'GB', 'BR', 'AR', 'VE', 'XX', '', null];
      testCodes.forEach((code) => {
        expect(getCountryRiskInfo(code as any)).toEqual(getCountryRiskInfoDirect(code as any));
      });
    });

    it('getStockMarketDetails debe comportarse idénticamente en la fachada y en el submódulo', () => {
      const testCodes = ['US', 'JP', 'DE', 'XX', null];
      testCodes.forEach((code) => {
        expect(getStockMarketDetails(code as any)).toEqual(getStockMarketDetailsDirect(code as any));
      });
    });

    it('geographicMockData debe ser exactamente la misma referencia o contenido entre fachada y submódulo', () => {
      expect(geographicMockData).toEqual(geographicMockDataDirect);
    });
  });
});
