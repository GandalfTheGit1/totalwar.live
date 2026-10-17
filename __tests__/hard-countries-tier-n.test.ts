/**
 * @file hard-countries-tier-n.test.ts
 * @description Comprehensive test suite for T03.3:
 * - Deterministic Hard Country Index (HCI: 0-100) and 4-tier classification.
 * - Multi-tier Bill of Materials (BOM) exposure evaluator (Tier-2..Tier-N leakages, HoI4 buffers, Friendshoring).
 * - Integration with Tier-N Thematic Layer.
 */

import { describe, it, expect } from 'vitest';
import { 
  GeopoliticalKnowledgeService, 
  TierNInputPayload 
} from '@/lib/services/geopolitical-knowledge-service';
import { getTierNLayerData, resetThematicCaches } from '@/components/dev/geopolitical-monitor/utils/thematic-generators';

describe('T03.3: Hard Countries Engine & Tier-N Exposure Evaluator', () => {
  // ─── 1. Hard Country Classification Core ─────────────────────────────────────

  describe('1. Núcleo de Clasificación de Países Duros (HCI)', () => {
    it('debe clasificar todos los países del catálogo sin tokens LLM de forma determinista', () => {
      const allClassified = GeopoliticalKnowledgeService.classifyHardCountries();
      
      expect(allClassified.length).toBeGreaterThanOrEqual(198);

      // Debe estar ordenado descendentemente por hardCountryIndex (HCI)
      for (let i = 0; i < allClassified.length - 1; i++) {
        expect(allClassified[i].hardCountryIndex).toBeGreaterThanOrEqual(allClassified[i + 1].hardCountryIndex);
      }

      // Validar integridad estructural de cada perfil
      for (const profile of allClassified) {
        expect(profile.countryCode).toMatch(/^[A-Z]{2}$/);
        expect(profile.iso3).toMatch(/^[A-Z]{2,3}$/);
        expect(profile.hardCountryIndex).toBeGreaterThanOrEqual(0);
        expect(profile.hardCountryIndex).toBeLessThanOrEqual(100);
        expect(['EXTREME_HOSTILE', 'STRATEGIC_ADVERSARIAL', 'HIGH_FRICTION_NEUTRAL', 'STABLE_COOPERATIVE'])
          .toContain(profile.tier);
        expect(['COMPREHENSIVE', 'SECTORAL', 'TARGETED', 'NONE'])
          .toContain(profile.sanctionsDetail.level);
        expect(profile.primaryRiskDrivers.length).toBeGreaterThan(0);
      }
    });

    it('debe catalogar a Rusia, Irán, Corea del Norte, Siria y Bielorrusia en EXTREME_HOSTILE (HCI >= 80)', () => {
      const extremeCases = ['RU', 'IR', 'KP', 'SY', 'BY'];

      for (const code of extremeCases) {
        const profile = GeopoliticalKnowledgeService.getHardCountryProfile(code);
        expect(profile).not.toBeNull();
        expect(profile!.tier).toBe('EXTREME_HOSTILE');
        expect(profile!.hardCountryIndex).toBeGreaterThanOrEqual(80);
        expect(profile!.sanctionsDetail.level).toBe('COMPREHENSIVE');
        expect(profile!.sanctionsScore).toBeGreaterThanOrEqual(85);
        expect(profile!.autocraticNature).toBe(true);
        expect(profile!.isHardCountry).toBe(true);
      }

      // Casos específicos emblemáticos
      const ru = GeopoliticalKnowledgeService.getHardCountryProfile('RU')!;
      expect(ru.countryName).toBe('Rusia');
      expect(ru.sanctionsScore).toBe(100);
      expect(ru.sovereignRiskScore).toBe(90);
      expect(ru.hardCountryIndex).toBeGreaterThanOrEqual(90);

      const ir = GeopoliticalKnowledgeService.getHardCountryProfile('IR')!;
      expect(ir.countryName).toBe('Irán');
      expect(ir.sanctionsScore).toBe(98);
      expect(ir.hardCountryIndex).toBeGreaterThanOrEqual(90);

      const kp = GeopoliticalKnowledgeService.getHardCountryProfile('KP')!;
      expect(kp.countryName).toBe('Corea del Norte');
      expect(kp.sanctionsScore).toBe(100);
      expect(kp.hardCountryIndex).toBeGreaterThanOrEqual(90);
    });

    it('debe clasificar a China, Venezuela, Cuba y Myanmar como países duros con fricción estratégica', () => {
      const cn = GeopoliticalKnowledgeService.getHardCountryProfile('CN')!;
      expect(cn).not.toBeNull();
      expect(cn.tier).toBe('STRATEGIC_ADVERSARIAL');
      expect(cn.hardCountryIndex).toBeGreaterThanOrEqual(60);
      expect(cn.hardCountryIndex).toBeLessThan(80);
      expect(cn.sanctionsDetail.level).toBe('SECTORAL');
      expect(cn.sanctionsDetail.regimes).toContain('BIS_ENTITY_LIST');
      expect(cn.autocraticNature).toBe(true);
      expect(cn.isHardCountry).toBe(true);

      const ve = GeopoliticalKnowledgeService.getHardCountryProfile('VE')!;
      expect(ve.tier).toBe('STRATEGIC_ADVERSARIAL');
      expect(ve.isHardCountry).toBe(true);
      expect(ve.hardCountryIndex).toBeGreaterThanOrEqual(60);

      const mm = GeopoliticalKnowledgeService.getHardCountryProfile('MM')!;
      expect(mm.tier).toBe('STRATEGIC_ADVERSARIAL');
      expect(mm.isHardCountry).toBe(true);

      const cu = GeopoliticalKnowledgeService.getHardCountryProfile('CU')!;
      expect(cu.isHardCountry).toBe(true);
      expect(cu.sanctionsDetail.level).toBe('COMPREHENSIVE');
    });

    it('debe clasificar a democracias aliadas y estados estables en STABLE_COOPERATIVE (HCI < 35)', () => {
      const cooperativeCases = ['US', 'CA', 'DE', 'FR', 'GB', 'JP', 'KR', 'TW', 'AU', 'NL'];

      for (const code of cooperativeCases) {
        const profile = GeopoliticalKnowledgeService.getHardCountryProfile(code);
        expect(profile).not.toBeNull();
        expect(profile!.tier).toBe('STABLE_COOPERATIVE');
        expect(profile!.hardCountryIndex).toBeLessThan(35);
        expect(profile!.sanctionsScore).toBe(0);
        expect(profile!.sanctionsDetail.level).toBe('NONE');
        expect(profile!.isHardCountry).toBe(false);
      }

      // Taiwán: democracia tecnológica aliada con bajo riesgo soberano y cero sanciones
      const tw = GeopoliticalKnowledgeService.getHardCountryProfile('TW')!;
      expect(tw.tier).toBe('STABLE_COOPERATIVE');
      expect(tw.hardCountryIndex).toBeLessThanOrEqual(25);
      expect(tw.isHardCountry).toBe(false);

      // Estados Unidos: jurisdicción de mercado rule-of-law
      const us = GeopoliticalKnowledgeService.getHardCountryProfile('US')!;
      expect(us.tier).toBe('STABLE_COOPERATIVE');
      expect(us.hardCountryIndex).toBeLessThanOrEqual(15);
      expect(us.isHardCountry).toBe(false);
    });

    it('debe clasificar estados de alta fricción o no-alineados en HIGH_FRICTION_NEUTRAL (35 <= HCI < 60)', () => {
      const neutralCases = ['TR', 'SA', 'EG', 'ZA'];

      for (const code of neutralCases) {
        const profile = GeopoliticalKnowledgeService.getHardCountryProfile(code);
        expect(profile).not.toBeNull();
        expect(profile!.hardCountryIndex).toBeGreaterThanOrEqual(30);
        expect(profile!.hardCountryIndex).toBeLessThan(60);
      }

      // Turquía (TR): miembro OTAN pero con sanciones CAATSA específicas y fricción
      const tr = GeopoliticalKnowledgeService.getHardCountryProfile('TR')!;
      expect(tr.tier).toBe('HIGH_FRICTION_NEUTRAL');
      expect(tr.sanctionsDetail.regimes).toContain('CAATSA_SECTION_231');
    });

    it('debe soportar evaluación relativa con targetCountry (ej. perspectiva de EE.UU.)', () => {
      // Auto-evaluación: EE.UU. frente a EE.UU.
      const usRelative = GeopoliticalKnowledgeService.getHardCountryProfile('US', 'US')!;
      expect(usRelative.tier).toBe('STABLE_COOPERATIVE');
      expect(usRelative.hardCountryIndex).toBeLessThanOrEqual(10);
      expect(usRelative.bilateralFrictionScore).toBe(0);

      // Rusia frente a EE.UU.: máxima hostilidad bilateral
      const ruVsUs = GeopoliticalKnowledgeService.getHardCountryProfile('RU', 'US')!;
      expect(ruVsUs.tier).toBe('EXTREME_HOSTILE');
      expect(ruVsUs.bilateralFrictionScore).toBeGreaterThanOrEqual(95);
      expect(ruVsUs.bilateralStance).toBe('SANCTIONED_ADVERSARIAL');

      // China frente a EE.UU.: competencia estratégica y aranceles
      const cnVsUs = GeopoliticalKnowledgeService.getHardCountryProfile('CN', 'US')!;
      expect(cnVsUs.tier).toBe('STRATEGIC_ADVERSARIAL');
      expect(cnVsUs.bilateralFrictionScore).toBeGreaterThanOrEqual(70);

      // Taiwán frente a EE.UU.: aliado estratégico
      const twVsUs = GeopoliticalKnowledgeService.getHardCountryProfile('TW', 'US')!;
      expect(twVsUs.tier).toBe('STABLE_COOPERATIVE');
      expect(twVsUs.bilateralFrictionScore).toBeLessThanOrEqual(20);
    });

    it('debe resolver identificadores con flexibilidad (código ISO-2, ISO-3, nombres en español e inglés)', () => {
      const fromIso2 = GeopoliticalKnowledgeService.getHardCountryProfile('RU');
      const fromIso3 = GeopoliticalKnowledgeService.getHardCountryProfile('RUS');
      const fromSpanish = GeopoliticalKnowledgeService.getHardCountryProfile('Rusia');
      const fromEnglish = GeopoliticalKnowledgeService.getHardCountryProfile('Russia');
      const fromLowerCase = GeopoliticalKnowledgeService.getHardCountryProfile('ru');

      expect(fromIso2).not.toBeNull();
      expect(fromIso3).not.toBeNull();
      expect(fromSpanish).not.toBeNull();
      expect(fromEnglish).not.toBeNull();
      expect(fromLowerCase).not.toBeNull();

      expect(fromIso2!.countryCode).toBe('RU');
      expect(fromIso3!.countryCode).toBe('RU');
      expect(fromSpanish!.countryCode).toBe('RU');
      expect(fromEnglish!.countryCode).toBe('RU');
      expect(fromLowerCase!.countryCode).toBe('RU');

      // Prueba con Taiwán
      expect(GeopoliticalKnowledgeService.getHardCountryProfile('TWN')?.countryCode).toBe('TW');
      expect(GeopoliticalKnowledgeService.getHardCountryProfile('Taiwán')?.countryCode).toBe('TW');
      expect(GeopoliticalKnowledgeService.getHardCountryProfile('Taiwan')?.countryCode).toBe('TW');

      // Código inexistente retorna null sin lanzar excepción
      expect(GeopoliticalKnowledgeService.getHardCountryProfile('ZZZ_INVALID')).toBeNull();
    });
  });

  // ─── 2. Tier-N BOM Evaluator ─────────────────────────────────────────────────

  describe('2. Evaluador de Insumos Tier-2..Tier-N (BOM)', () => {
    it('debe evaluar como seguro (LOW exposure) un BOM con insumos 100% de países cooperativos', () => {
      const cleanBOM: TierNInputPayload[] = [
        {
          componentName: 'Estructura aeroespacial de aluminio',
          originCountry: 'US',
          tier: 1,
          criticality: 'HIGH',
          substitutability: 0.8,
          sharePercentage: 40
        },
        {
          componentName: 'Actuadores hidráulicos de precisión',
          originCountry: 'DE',
          tier: 2,
          criticality: 'MEDIUM',
          substitutability: 0.7,
          sharePercentage: 30
        },
        {
          componentName: 'Sensores ópticos LiDAR',
          originCountry: 'JP',
          tier: 2,
          criticality: 'MEDIUM',
          substitutability: 0.6,
          sharePercentage: 20
        },
        {
          componentName: 'Semiconductores lógicos avanzados',
          originCountry: 'TW',
          tier: 2,
          criticality: 'CRITICAL',
          substitutability: 0.4,
          sharePercentage: 10
        }
      ];

      const result = GeopoliticalKnowledgeService.evaluateTierNInputExposure(cleanBOM, 'US');

      expect(result.totalInputsEvaluated).toBe(4);
      expect(result.compositeExposureScore).toBeLessThan(25);
      expect(result.exposureLevel).toBe('LOW');
      expect(result.hardCountryBottlenecks.length).toBe(0);
      expect(result.tierNLeakages.length).toBe(0);
      expect(result.summaryAudit).toContain('Cadena de valor resiliente');
    });

    it('debe detectar cuellos de botella en países duros (tierras raras en CN, paladio en RU)', () => {
      const contaminatedBOM: TierNInputPayload[] = [
        {
          componentName: 'Chasis automotriz ensamblado',
          originCountry: 'MX',
          tier: 1,
          criticality: 'HIGH',
          substitutability: 0.8,
          sharePercentage: 45
        },
        {
          componentName: 'Módulo de batería NMC',
          originCountry: 'KR',
          tier: 2,
          criticality: 'HIGH',
          substitutability: 0.5,
          sharePercentage: 25
        },
        {
          componentName: 'Imanes permanentes de Neodimio y Disprosio',
          originCountry: 'China', // Resuelve 'China' -> 'CN'
          tier: 3,
          criticality: 'CRITICAL',
          substitutability: 0.05, // Cuasi-insustituible
          sharePercentage: 15
        },
        {
          componentName: 'Paladio para celda catalizadora',
          originCountry: 'Russia', // Resuelve 'Russia' -> 'RU'
          tier: 3,
          criticality: 'CRITICAL',
          substitutability: 0.1,  // Cuasi-insustituible
          sharePercentage: 15
        }
      ];

      const result = GeopoliticalKnowledgeService.evaluateTierNInputExposure(contaminatedBOM, 'US');

      expect(result.totalInputsEvaluated).toBe(4);
      expect(result.compositeExposureScore).toBeGreaterThanOrEqual(60);
      expect(['HIGH', 'CRITICAL']).toContain(result.exposureLevel);

      // Debe detectar exactamente los 2 cuellos de botella en países duros
      expect(result.hardCountryBottlenecks.length).toBe(2);
      
      const cnBottleneck = result.hardCountryBottlenecks.find(b => b.originCountry === 'CN');
      expect(cnBottleneck).toBeDefined();
      expect(cnBottleneck!.tierClassification).toBe('STRATEGIC_ADVERSARIAL');
      expect(cnBottleneck!.componentRiskScore).toBeGreaterThanOrEqual(80);

      const ruBottleneck = result.hardCountryBottlenecks.find(b => b.originCountry === 'RU');
      expect(ruBottleneck).toBeDefined();
      expect(ruBottleneck!.tierClassification).toBe('EXTREME_HOSTILE');
      expect(ruBottleneck!.componentRiskScore).toBeGreaterThanOrEqual(90);

      // Orígenes de mayor riesgo identificados
      const topCodes = result.highestRiskOrigins.map(o => o.countryCode);
      expect(topCodes).toContain('RU');
      expect(topCodes).toContain('CN');

      // Mitigaciones recomendadas
      const friendshoring = result.mitigationStrategies.find(s => s.category === 'FRIENDSHORING_T03_4');
      expect(friendshoring).toBeDefined();
      expect(friendshoring!.priority).toBe('URGENT'); // RU es EXTREME_HOSTILE

      const inventoryBuffer = result.mitigationStrategies.find(s => s.category === 'INVENTORY_BUFFER_HOI4_T03_19');
      expect(inventoryBuffer).toBeDefined();
      expect(inventoryBuffer!.description).toContain('180 días');
      expect(inventoryBuffer!.description).toContain('90-120 días');
    });

    it('debe detectar fugas profundas en Tier-2 y Tier-N ocultas bajo proveedores Tier-1 limpios', () => {
      const hiddenLeakageBOM: TierNInputPayload[] = [
        {
          componentName: 'Servidor ensamblado de centro de datos',
          originCountry: 'US',
          tier: 1, // Tier-1 limpio
          criticality: 'HIGH',
          substitutability: 0.8,
          sharePercentage: 60
        },
        {
          componentName: 'Placa madre y subsistema de potencia',
          originCountry: 'TW',
          tier: 2, // Tier-2 limpio
          criticality: 'HIGH',
          substitutability: 0.6,
          sharePercentage: 25
        },
        {
          componentName: 'Condensadores de Tantalio y Niobio purificado',
          originCountry: 'BY', // Bielorrusia (Tier 3 profundo)
          tier: 3,
          criticality: 'CRITICAL',
          substitutability: 0.1,
          sharePercentage: 10
        },
        {
          componentName: 'Grafito sintético para disipación térmica',
          originCountry: 'KP', // Corea del Norte (Tier 4 muy profundo)
          tier: 4,
          criticality: 'CRITICAL',
          substitutability: 0.0,
          sharePercentage: 5
        }
      ];

      const result = GeopoliticalKnowledgeService.evaluateTierNInputExposure(hiddenLeakageBOM, 'US');

      // Ambas dependencias profundas deben ser detectadas como fugas
      expect(result.tierNLeakages.length).toBe(2);
      
      for (const leakage of result.tierNLeakages) {
        expect(leakage.isLeakage).toBe(true);
        expect(leakage.tier).toBeGreaterThanOrEqual(2);
        expect(['BY', 'KP']).toContain(leakage.originCountry);
      }

      expect(result.summaryAudit).toContain('fugas en capas profundas (Tier-2..Tier-N)');
    });

    it('debe ser sensible a la sustituibilidad: menor sustituibilidad implica mayor severidad', () => {
      // Comparar dos insumos chinos: uno con sustituibilidad 1.0 (commodity) vs 0.0 (irremplazable)
      const commodityBOM: TierNInputPayload[] = [
        {
          componentName: 'Tornillos estándar M4 de acero',
          originCountry: 'CN',
          tier: 2,
          criticality: 'HIGH',
          substitutability: 1.0, // Sustituible de inmediato
          sharePercentage: 100
        }
      ];

      const irreplaceableBOM: TierNInputPayload[] = [
        {
          componentName: 'Matriz de sensores patentada monolítica',
          originCountry: 'CN',
          tier: 2,
          criticality: 'HIGH',
          substitutability: 0.0, // Imposible de sustituir
          sharePercentage: 100
        }
      ];

      const commodityResult = GeopoliticalKnowledgeService.evaluateTierNInputExposure(commodityBOM);
      const irreplaceableResult = GeopoliticalKnowledgeService.evaluateTierNInputExposure(irreplaceableBOM);

      expect(irreplaceableResult.compositeExposureScore)
        .toBeGreaterThan(commodityResult.compositeExposureScore);

      // El insumo irremplazable debe generar alerta de diversificación obligatoria
      const divStrategy = irreplaceableResult.mitigationStrategies.find(s => s.category === 'SUPPLIER_DIVERSIFICATION');
      expect(divStrategy).toBeDefined();
    });

    it('debe ser resiliente ante entradas vacías y campos opcionales no definidos (Fail Fast y Fail Safe)', () => {
      // 1. Array vacío
      const emptyResult = GeopoliticalKnowledgeService.evaluateTierNInputExposure([]);
      expect(emptyResult.compositeExposureScore).toBe(0);
      expect(emptyResult.exposureLevel).toBe('LOW');
      expect(emptyResult.hardCountryBottlenecks).toEqual([]);

      // 2. Insumo con campos opcionales omitidos (substitutability y sharePercentage omitidos)
      const minimalBOM: TierNInputPayload[] = [
        {
          componentName: 'Insumo básico',
          originCountry: 'DE',
          tier: 1,
          criticality: 'HIGH'
        }
      ];

      const minimalResult = GeopoliticalKnowledgeService.evaluateTierNInputExposure(minimalBOM);
      expect(minimalResult.totalInputsEvaluated).toBe(1);
      expect(minimalResult.compositeExposureScore).toBeLessThan(25);

      // 3. País no reconocido se gestiona con cautela sin lanzar excepción
      const unknownBOM: TierNInputPayload[] = [
        {
          componentName: 'Insumo de origen opaco',
          originCountry: 'TERRA_INCOGNITA',
          tier: 2,
          criticality: 'CRITICAL',
          substitutability: 0.2
        }
      ];

      const unknownResult = GeopoliticalKnowledgeService.evaluateTierNInputExposure(unknownBOM);
      expect(unknownResult.totalInputsEvaluated).toBe(1);
      expect(unknownResult.hardCountryBottlenecks.length).toBeGreaterThan(0);
      expect(unknownResult.hardCountryBottlenecks[0].reason).toContain('Jurisdicción');
    });

    it('debe asignar cuotas proporcionales correctamente cuando hay mezcla de shares explícitos y no definidos', () => {
      const mixedBOM: TierNInputPayload[] = [
        {
          componentName: 'Componente Primario',
          originCountry: 'US',
          tier: 1,
          criticality: 'HIGH',
          sharePercentage: 60 // Explícito 60%
        },
        {
          componentName: 'Componente Secundario A',
          originCountry: 'DE',
          tier: 2,
          criticality: 'MEDIUM'
          // sharePercentage omitido
        },
        {
          componentName: 'Componente Secundario B',
          originCountry: 'JP',
          tier: 2,
          criticality: 'MEDIUM'
          // sharePercentage omitido
        }
      ];

      const result = GeopoliticalKnowledgeService.evaluateTierNInputExposure(mixedBOM);
      expect(result.totalInputsEvaluated).toBe(3);
      
      const originUS = result.highestRiskOrigins.find(o => o.countryCode === 'US');
      expect(originUS).toBeDefined();
      expect(originUS!.totalShare).toBe(60); // Conserva su 60% explícito

      const originDE = result.highestRiskOrigins.find(o => o.countryCode === 'DE');
      expect(originDE).toBeDefined();
      expect(originDE!.totalShare).toBe(20); // Recibe la mitad del 40% restante

      const originJP = result.highestRiskOrigins.find(o => o.countryCode === 'JP');
      expect(originJP).toBeDefined();
      expect(originJP!.totalShare).toBe(20); // Recibe la mitad del 40% restante
    });

    it('debe soportar cuotas explícitas con 0% sin descartar la intención del usuario', () => {
      const zeroShareBOM: TierNInputPayload[] = [
        {
          componentName: 'Traza residual de paladio',
          originCountry: 'RU',
          tier: 3,
          criticality: 'CRITICAL',
          substitutability: 0.1,
          sharePercentage: 0 // Cuota explícita 0%
        },
        {
          componentName: 'Chasis principal',
          originCountry: 'US',
          tier: 1,
          criticality: 'HIGH',
          sharePercentage: 100
        }
      ];

      const result = GeopoliticalKnowledgeService.evaluateTierNInputExposure(zeroShareBOM);
      expect(result.totalInputsEvaluated).toBe(2);
      expect(result.hardCountryBottlenecks.length).toBe(1);
      expect(result.hardCountryBottlenecks[0].sharePercentage).toBe(0);
      const usOrigin = result.highestRiskOrigins.find(o => o.countryCode === 'US');
      expect(usOrigin!.totalShare).toBe(100);
    });

    it('debe procesar BOM masivo (> 70,000 líneas) sin desbordar el stack (RangeError: Maximum call stack size exceeded)', () => {
      const count = 75000;
      const largeBOM: TierNInputPayload[] = new Array(count);
      for (let i = 0; i < count; i++) {
        largeBOM[i] = {
          componentName: `Pieza industrial #${i}`,
          originCountry: i === 50000 ? 'RU' : 'US',
          tier: i === 50000 ? 3 : 1,
          criticality: 'MEDIUM'
        };
      }

      // No debe lanzar RangeError
      expect(() => {
        const result = GeopoliticalKnowledgeService.evaluateTierNInputExposure(largeBOM);
        expect(result.totalInputsEvaluated).toBe(count);
        expect(result.hardCountryBottlenecks.length).toBe(1);
      }).not.toThrow();
    });

    it('debe resolver alias comerciales habituales (UK -> GB, UAE -> AE, DPRK -> KP, PRC -> CN)', () => {
      const ukProfile = GeopoliticalKnowledgeService.getHardCountryProfile('UK');
      expect(ukProfile).not.toBeNull();
      expect(ukProfile!.countryCode).toBe('GB');
      expect(ukProfile!.tier).toBe('STABLE_COOPERATIVE');

      const uaeProfile = GeopoliticalKnowledgeService.getHardCountryProfile('UAE');
      expect(uaeProfile).not.toBeNull();
      expect(uaeProfile!.countryCode).toBe('AE');

      const dprkProfile = GeopoliticalKnowledgeService.getHardCountryProfile('DPRK');
      expect(dprkProfile).not.toBeNull();
      expect(dprkProfile!.countryCode).toBe('KP');
      expect(dprkProfile!.tier).toBe('EXTREME_HOSTILE');

      const prcProfile = GeopoliticalKnowledgeService.getHardCountryProfile('PRC');
      expect(prcProfile).not.toBeNull();
      expect(prcProfile!.countryCode).toBe('CN');
      expect(prcProfile!.tier).toBe('STRATEGIC_ADVERSARIAL');
    });

    it('debe diferenciar autocracias de democracias con alto riesgo soberano (Ucrania)', () => {
      const ua = GeopoliticalKnowledgeService.getHardCountryProfile('UA');
      expect(ua).not.toBeNull();
      // Ucrania tiene alto riesgo soberano por la guerra pero NO es una autocracia
      expect(ua!.autocraticNature).toBe(false);
      expect(ua!.sovereignRiskScore).toBe(80);
      expect(ua!.primaryRiskDrivers.some(d => d.includes('Alto riesgo soberano'))).toBe(true);
      expect(ua!.primaryRiskDrivers.some(d => d.includes('Régimen autocrático'))).toBe(false);
    });

    it('debe clasificar regímenes sancionados africanos (Sudán del Sur, Libia, Somalia, Zimbabue)', () => {
      const ss = GeopoliticalKnowledgeService.getHardCountryProfile('SS');
      expect(ss).not.toBeNull();
      expect(ss!.isHardCountry).toBe(true);
      expect(ss!.sanctionsScore).toBeGreaterThanOrEqual(70);

      const zw = GeopoliticalKnowledgeService.getHardCountryProfile('ZW');
      expect(zw).not.toBeNull();
      expect(zw!.isHardCountry).toBe(true);
      expect(zw!.autocraticNature).toBe(true);
    });

    it('debe sanear entradas corruptas con null/undefined y tipos no string sin lanzar TypeError', () => {
      const corruptedBOM: any[] = [
        null,
        undefined,
        {
          componentName: 9999,
          originCountry: 840,
          tier: 'invalid',
          criticality: 'UNKNOWN_CRIT'
        },
        {
          componentName: 'Componente Válido',
          originCountry: 'DE',
          tier: 1,
          criticality: 'HIGH'
        }
      ];

      expect(() => {
        const result = GeopoliticalKnowledgeService.evaluateTierNInputExposure(corruptedBOM);
        expect(result.totalInputsEvaluated).toBe(2);
      }).not.toThrow();
    });
  });

  // ─── 3. Thematic Layer Integration ───────────────────────────────────────────

  describe('3. Integración con Capa Temática Tier-N (M03)', () => {
    it('debe poblar la capa Tier-N utilizando los países duros canónicos y bilateralidades extremas', () => {
      resetThematicCaches();
      const tierNMap = getTierNLayerData();

      // Países duros clave deben estar presentes
      expect(tierNMap['RU']).toBeDefined();
      expect(tierNMap['RUS']).toBeDefined();
      expect(tierNMap['IR']).toBeDefined();
      expect(tierNMap['IRN']).toBeDefined();
      expect(tierNMap['KP']).toBeDefined();
      expect(tierNMap['PRK']).toBeDefined();
      expect(tierNMap['BY']).toBeDefined();
      expect(tierNMap['BLR']).toBeDefined();
      expect(tierNMap['SY']).toBeDefined();
      expect(tierNMap['SYR']).toBeDefined();
      expect(tierNMap['CN']).toBeDefined();
      expect(tierNMap['CHN']).toBeDefined();

      // Regímenes de sanciones totales deben tener categoría crítica y alta intensidad
      expect(tierNMap['RU'].colorCategory).toBe('critical');
      expect(tierNMap['RU'].intensity).toBe(100);
      expect(tierNMap['IR'].colorCategory).toBe('critical');
      expect(tierNMap['IR'].intensity).toBeGreaterThanOrEqual(95);
      expect(tierNMap['KP'].colorCategory).toBe('critical');
      expect(tierNMap['KP'].intensity).toBeGreaterThanOrEqual(95);

      // Equivalencia ISO-2 e ISO-3
      expect(tierNMap['RU']).toEqual(tierNMap['RUS']);
      expect(tierNMap['KP']).toEqual(tierNMap['PRK']);
      expect(tierNMap['BY']).toEqual(tierNMap['BLR']);
      expect(tierNMap['CN']).toEqual(tierNMap['CHN']);
    });
  });
});
