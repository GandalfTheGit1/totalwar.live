/**
 * @file mock-data.ts
 * @description Diccionario de datos geográficos y desgloses de operaciones por país para empresas preconfiguradas.
 *
 * CONTEXTO ARQUITECTÓNICO & ROL EN EL SISTEMA:
 * - Capa: Diccionario Estático de Referencia y Presets Geográficos (Mock / Benchmark Data).
 * - Módulo: `lib/geographic`
 * - Descompuesto en submódulos por empresa modelo en `lib/geographic/presets/`:
 *   - "1": Apple Inc. (AAPL)
 *   - "2": Berkshire Hathaway Inc. (BRK.B)
 *   - "3": Microsoft Corporation (MSFT)
 *   - "4": The Coca-Cola Company (KO)
 *   - "5": Visa Inc. (V)
 */

import { CompanyGeographicData } from './types';
import { AAPL_GEOGRAPHIC_DATA } from './presets/apple';
import { BRKB_GEOGRAPHIC_DATA } from './presets/berkshire';
import { MSFT_GEOGRAPHIC_DATA } from './presets/microsoft';
import { KO_GEOGRAPHIC_DATA } from './presets/coca-cola';
import { V_GEOGRAPHIC_DATA } from './presets/visa';

export {
  AAPL_GEOGRAPHIC_DATA,
  BRKB_GEOGRAPHIC_DATA,
  MSFT_GEOGRAPHIC_DATA,
  KO_GEOGRAPHIC_DATA,
  V_GEOGRAPHIC_DATA,
};

export const geographicMockData: Record<string, CompanyGeographicData> = {
  "1": AAPL_GEOGRAPHIC_DATA,
  "2": BRKB_GEOGRAPHIC_DATA,
  "3": MSFT_GEOGRAPHIC_DATA,
  "4": KO_GEOGRAPHIC_DATA,
  "5": V_GEOGRAPHIC_DATA,
};
