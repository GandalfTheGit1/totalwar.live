import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  useThematicLayerData,
  getThematicLayerData,
  getTierNLayerData,
  getResourcesLayerData,
  getMaritimeLayerData,
  getFootprintLayerData,
  CorporateFootprintConfig,
  resetThematicCaches,
} from '@/components/dev/geopolitical-monitor/hooks/useThematicLayerData';
import { ThematicLayer, ThematicLayerCountryData } from '@/components/dev/geopolitical-monitor/types';

describe('T03.2 - Thematic Layers Foundation (Ronda 1)', () => {
  describe('Layer: none', () => {
    it('should return an empty map for "none"', () => {
      const data = getThematicLayerData('none');
      expect(data).toEqual({});
      expect(Object.keys(data)).toHaveLength(0);
    });

    it('hook should return empty map when activeLayer is "none"', () => {
      const { result } = renderHook(() => useThematicLayerData('none'));
      expect(result.current).toEqual({});
    });
  });

  describe('Layer: tier-n', () => {
    it('should map countries with bilateral friction >= 7.0 or sanctions/autocracies', () => {
      const data = getTierNLayerData();

      // Key adversarial nations should be present
      expect(data['RU']).toBeDefined();
      expect(data['RUS']).toBeDefined();
      expect(data['UA']).toBeDefined();
      expect(data['UKR']).toBeDefined();
      expect(data['IR']).toBeDefined();
      expect(data['IRN']).toBeDefined();
      expect(data['IL']).toBeDefined();
      expect(data['ISR']).toBeDefined();
      expect(data['CN']).toBeDefined();
      expect(data['CHN']).toBeDefined();
      expect(data['TW']).toBeDefined();
      expect(data['TWN']).toBeDefined();
      expect(data['US']).toBeDefined();
      expect(data['USA']).toBeDefined();

      // Active interstate war / extreme sanctions must be critical
      expect(data['RU'].colorCategory).toBe('critical');
      expect(data['RU'].intensity).toBe(100);
      expect(data['UA'].colorCategory).toBe('critical');
      expect(data['UA'].intensity).toBe(100);

      // Iran and Israel must be critical
      expect(data['IR'].colorCategory).toBe('critical');
      expect(data['IR'].intensity).toBeGreaterThanOrEqual(95);
      expect(data['IL'].colorCategory).toBe('critical');
      expect(data['IL'].intensity).toBeGreaterThanOrEqual(95);

      // Taiwan and China must have high or critical friction
      expect(['critical', 'high']).toContain(data['TW'].colorCategory);
      expect(data['TW'].intensity).toBeGreaterThanOrEqual(70);
      expect(['critical', 'high']).toContain(data['CN'].colorCategory);
      expect(data['CN'].intensity).toBeGreaterThanOrEqual(70);

      // Verify data integrity for all entries
      for (const [key, item] of Object.entries(data)) {
        expect(item.countryCode).toBeTruthy();
        expect(item.intensity).toBeGreaterThanOrEqual(0);
        expect(item.intensity).toBeLessThanOrEqual(100);
        expect(['critical', 'high', 'medium', 'low', 'none']).toContain(item.colorCategory);
        expect(item.label.length).toBeGreaterThan(0);
      }
    });

    it('should maintain equivalence between ISO-2 and ISO-3 lookups', () => {
      const data = getTierNLayerData();
      expect(data['RU']).toEqual(data['RUS']);
      expect(data['US']).toEqual(data['USA']);
      expect(data['CN']).toEqual(data['CHN']);
    });

    it('should assign semantically accurate labels without mischaracterizing non-sanctioned democracies', () => {
      const data = getTierNLayerData();
      // Russia and Ukraine are in active interstate war
      expect(data['RU'].label).toBe('Conflicto Bélico / Sanciones Totales');
      expect(data['UA'].label).toBe('Conflicto Bélico Activo');

      // Iran is a sanctioned regime under secondary embargoes
      expect(data['IR'].label).toBe('Régimen Sancionado / Hostilidad Extrema');

      // Israel is facing hostile strikes with Iran
      expect(data['IL'].label).toBe('Tensión Hostil Crítica con Adversarios');

      // USA is a sovereign power with critical adversarial friction, NOT under sanctions or war
      expect(data['US'].label).toBe('Tensión Hostil Crítica con Adversarios');
      expect(data['US'].colorCategory).toBe('critical');

      // Taiwan and China have bilateral strategic friction
      expect(data['TW'].label).toBe('Fricción Estratégica Bilateral');
      expect(data['CN'].label).toBe('Fricción Estratégica Bilateral');
    });
  });

  describe('Layer: resources', () => {
    it('should map countries dominating critical commodities', () => {
      const data = getResourcesLayerData();

      // 1. Rare Earths (China, Australia, USA)
      expect(data['CN']).toBeDefined();
      expect(data['CN'].intensity).toBeGreaterThanOrEqual(95);
      expect(data['CN'].colorCategory).toBe('critical');
      expect(data['CN'].label).toMatch(/Tierras Raras/i);

      // 2. Lithium (Chile, Australia, Argentina)
      expect(data['CL']).toBeDefined();
      expect(data['CL'].intensity).toBeGreaterThanOrEqual(90);
      expect(data['CL'].colorCategory).toBe('critical');
      expect(data['AR']).toBeDefined();

      // 3. Cobalt (Democratic Republic of Congo, Indonesia)
      expect(data['CD']).toBeDefined();
      expect(data['COD']).toBeDefined();
      expect(data['CD'].intensity).toBeGreaterThanOrEqual(95);
      expect(data['CD'].colorCategory).toBe('critical');
      expect(data['CD'].label).toMatch(/Cobalto/i);

      // 4. Nickel (Indonesia, Philippines, Canada, Russia)
      expect(data['ID']).toBeDefined();
      expect(data['ID'].intensity).toBeGreaterThanOrEqual(90);
      expect(data['ID'].label).toMatch(/Níquel/i);
      expect(data['PH']).toBeDefined();
      expect(data['CA']).toBeDefined();

      // 5. Copper (Chile, Peru, DRC)
      expect(data['PE']).toBeDefined();
      expect(data['PER']).toBeDefined();
      expect(data['PE'].label).toMatch(/Cobre/i);

      // 6. Oil / Gas (Saudi Arabia, Russia, Qatar, UAE, Norway, USA)
      expect(data['SA']).toBeDefined();
      expect(data['SA'].intensity).toBeGreaterThanOrEqual(95);
      expect(data['SA'].label).toMatch(/Petróleo/i);
      expect(data['QA']).toBeDefined();
      expect(data['QA'].label).toMatch(/Gas Natural Licuado/i);
      expect(data['NO']).toBeDefined();

      // 7. Semiconductors (Taiwan, Netherlands, South Korea, Japan, USA)
      expect(data['TW']).toBeDefined();
      expect(data['TW'].intensity).toBe(100);
      expect(data['TW'].label).toMatch(/Fundición Avanzada|Semiconductores/i);
      expect(data['NL']).toBeDefined();
      expect(data['NL'].intensity).toBeGreaterThanOrEqual(95);
      expect(data['NL'].label).toMatch(/Litografía EUV/i);
      expect(data['KR']).toBeDefined();
      expect(data['JP']).toBeDefined();
    });

    it('should index both ISO-2 and ISO-3 for commodity nations', () => {
      const data = getResourcesLayerData();
      expect(data['CL']).toEqual(data['CHL']);
      expect(data['CD']).toEqual(data['COD']);
      expect(data['TW']).toEqual(data['TWN']);
      expect(data['NL']).toEqual(data['NLD']);
      expect(data['SA']).toEqual(data['SAU']);
    });
  });

  describe('Layer: maritime', () => {
    it('should map countries connected to all 6 maritime chokepoints', () => {
      const data = getMaritimeLayerData();

      // 1. Hormuz: IR, OM, AE
      expect(data['IR']).toBeDefined();
      expect(data['IR'].label).toMatch(/Ormuz/i);
      expect(data['OM']).toBeDefined();
      expect(data['OMN']).toBeDefined();
      expect(data['AE']).toBeDefined();

      // 2. Malacca: SG, MY, ID
      expect(data['SG']).toBeDefined();
      expect(data['SG'].label).toMatch(/Malaca/i);
      expect(data['MY']).toBeDefined();
      expect(data['ID']).toBeDefined();

      // 3. Suez: EG
      expect(data['EG']).toBeDefined();
      expect(data['EGY']).toBeDefined();
      expect(data['EG'].intensity).toBeGreaterThanOrEqual(90);
      expect(data['EG'].colorCategory).toBe('critical');
      expect(data['EG'].label).toMatch(/Suez/i);

      // 4. Bab el-Mandeb: YE, DJ, SA
      expect(data['YE']).toBeDefined();
      expect(data['YEM']).toBeDefined();
      expect(data['YE'].intensity).toBeGreaterThanOrEqual(95);
      expect(data['YE'].colorCategory).toBe('critical');
      expect(data['YE'].label).toMatch(/Bab el-Mandeb/i);
      expect(data['DJ']).toBeDefined();
      expect(data['DJI']).toBeDefined();

      // 5. Panama: PA, US
      expect(data['PA']).toBeDefined();
      expect(data['PAN']).toBeDefined();
      expect(data['PA'].label).toMatch(/Panamá/i);
      expect(data['US']).toBeDefined();

      // 6. Turkish Straits / Bosporus: TR, UA, RU
      expect(data['TR']).toBeDefined();
      expect(data['TUR']).toBeDefined();
      expect(data['TR'].label).toMatch(/Bósforo|Estrechos Turcos/i);
      expect(data['UA']).toBeDefined();
      expect(data['RU']).toBeDefined();
    });

    it('should assign correct severity levels to maritime conflict zones', () => {
      const data = getMaritimeLayerData();
      // Yemen and Egypt (Red Sea crisis and Suez collapse) must be critical
      expect(data['YE'].colorCategory).toBe('critical');
      expect(data['EG'].colorCategory).toBe('critical');
      expect(data['IR'].colorCategory).toBe('critical');
    });
  });

  describe('Layer: footprint', () => {
    it('should provide base functional corporate footprint for consolidated vs expansion', () => {
      const data = getFootprintLayerData();

      // Headquarters
      expect(data['US']).toBeDefined();
      expect(data['USA']).toBeDefined();
      expect(data['US'].colorCategory).toBe('critical');
      expect(data['US'].intensity).toBe(95);
      expect(data['US'].label).toMatch(/Sede Central/i);

      // Consolidated manufacturing
      expect(data['CN']).toBeDefined();
      expect(data['TW']).toBeDefined();
      expect(data['MX']).toBeDefined();
      expect(data['VN']).toBeDefined();
      expect(data['DE']).toBeDefined();
      expect(data['JP']).toBeDefined();
      expect(data['KR']).toBeDefined();

      // Expansion markets
      expect(data['IN']).toBeDefined();
      expect(data['BR']).toBeDefined();
      expect(data['SA']).toBeDefined();
      expect(data['PL']).toBeDefined();
      expect(data['IN'].colorCategory).toBe('medium');
      expect(data['BR'].colorCategory).toBe('low');
    });

    it('should support custom corporate footprint configurations', () => {
      const customConfig: CorporateFootprintConfig = {
        headquarters: {
          code: 'DE',
          intensity: 90,
          label: 'Sede Europea (Alemania)',
          colorCategory: 'critical',
        },
        consolidatedManufacturing: [
          {
            code: 'MX',
            intensity: 80,
            label: 'Planta Principal de Ensamblaje',
            colorCategory: 'high',
          },
        ],
        expansionMarkets: [
          {
            code: 'JP',
            intensity: 50,
            label: 'Apertura Mercado Japón',
            colorCategory: 'low',
          },
        ],
      };

      const data = getFootprintLayerData(customConfig);
      expect(data['DE'].label).toBe('Sede Europea (Alemania)');
      expect(data['DEU'].label).toBe('Sede Europea (Alemania)');
      expect(data['MX'].label).toBe('Planta Principal de Ensamblaje');
      expect(data['JP'].label).toBe('Apertura Mercado Japón');
    });

    it('should resolve full country names in English and Spanish to ISO-2 and ISO-3', () => {
      const nameConfig: CorporateFootprintConfig = {
        headquarters: {
          code: 'Alemania',
          intensity: 92,
          label: 'Sede Global en Alemania',
        },
        consolidatedManufacturing: [
          {
            code: 'United States',
            intensity: 85,
            label: 'Fábrica en Austin',
          },
        ],
        expansionMarkets: [
          {
            code: 'Japan',
            intensity: 55,
            label: 'Centro Comercial Tokio',
          },
        ],
      };

      const data = getFootprintLayerData(nameConfig);
      expect(data['DE']).toBeDefined();
      expect(data['DEU']).toBeDefined();
      expect(data['DE'].label).toBe('Sede Global en Alemania');
      expect(data['US']).toBeDefined();
      expect(data['USA']).toBeDefined();
      expect(data['US'].label).toBe('Fábrica en Austin');
      expect(data['JP']).toBeDefined();
      expect(data['JPN']).toBeDefined();
      expect(data['JP'].label).toBe('Centro Comercial Tokio');
    });

    it('should protect hierarchy priority and not allow lower tier to downgrade headquarters', () => {
      const duplicateConfig: CorporateFootprintConfig = {
        headquarters: {
          code: 'US',
          intensity: 95,
          label: 'Sede Central',
          colorCategory: 'critical',
        },
        consolidatedManufacturing: [
          {
            code: 'US', // Duplicate in manufacturing
            intensity: 70,
            label: 'Planta Secundaria',
            colorCategory: 'high',
          },
        ],
      };

      const data = getFootprintLayerData(duplicateConfig);
      expect(data['US'].label).toBe('Sede Central');
      expect(data['US'].colorCategory).toBe('critical');
      expect(data['US'].intensity).toBe(95);
    });

    it('should clamp out-of-bounds intensity and handle invalid numbers safely', () => {
      const boundaryConfig: CorporateFootprintConfig = {
        headquarters: {
          code: 'US',
          intensity: 150, // Above 100
        },
        consolidatedManufacturing: [
          {
            code: 'MX',
            intensity: -20, // Negative
          },
          {
            code: 'VN',
            intensity: Number.NaN, // Invalid
          },
        ],
      };

      const data = getFootprintLayerData(boundaryConfig);
      expect(data['US'].intensity).toBe(100);
      expect(data['MX'].intensity).toBe(0);
      expect(data['VN'].intensity).toBe(0);
    });
  });

  describe('Hook useThematicLayerData', () => {
    it('should react dynamically when changing activeLayer', () => {
      let layer: ThematicLayer = 'none';
      const { result, rerender } = renderHook(() => useThematicLayerData(layer));

      expect(result.current).toEqual({});

      layer = 'tier-n';
      rerender();
      expect(result.current['RU']).toBeDefined();

      layer = 'resources';
      rerender();
      expect(result.current['CL']).toBeDefined();

      layer = 'maritime';
      rerender();
      expect(result.current['EG']).toBeDefined();

      layer = 'footprint';
      rerender();
      expect(result.current['US']).toBeDefined();

      layer = 'none';
      rerender();
      expect(result.current).toEqual({});
    });

    it('should memoize results when layer does not change', () => {
      const { result, rerender } = renderHook(() => useThematicLayerData('tier-n'));
      const firstRef = result.current;
      rerender();
      const secondRef = result.current;
      expect(firstRef).toBe(secondRef);
    });

    it('should reset module caches when resetThematicCaches is called', () => {
      const first = getTierNLayerData();
      expect(first).toBe(getTierNLayerData());
      resetThematicCaches();
      const second = getTierNLayerData();
      expect(second).not.toBe(first);
      expect(second['RU']).toEqual(first['RU']);
    });
  });
});
