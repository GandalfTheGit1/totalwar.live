/**
 * components/dev/geopolitical-monitor/utils/thematic/footprint-generator.ts
 *
 * Footprint layer generator for corporate headquarters, manufacturing, and expansion hubs.
 */

import { ThematicLayerMap } from '../../types';
import { findCountryByCode, findCountryByIso3 } from '@/lib/data/all-198-countries';
import { GeopoliticalKnowledgeService } from '@/lib/services/geopolitical-knowledge-service';
import {
  getCachedDefaultFootprintMap,
  setCachedDefaultFootprintMap,
  registerCountry
} from './country-registry';
import {
  CorporateFootprintConfig,
  CorporateFootprintCountryConfig
} from './types';

const DEFAULT_CONSOLIDATED: CorporateFootprintCountryConfig[] = [
  { code: 'CN', intensity: 85, label: 'Hub de Fabricación Consolidado', sublabel: 'Ensamblaje masivo e integración de proveedores Tier-1/Tier-2', colorCategory: 'high' },
  { code: 'TW', intensity: 80, label: 'Suministro de Componentes Críticos', sublabel: 'Fundición avanzada de semiconductores y empaquetado de silicio', colorCategory: 'high' },
  { code: 'MX', intensity: 75, label: 'Nearshoring Estratégico Consolidado', sublabel: 'Manufactura adyacente para el mercado norteamericano (USMCA)', colorCategory: 'high' },
  { code: 'VN', intensity: 72, label: 'Polo de Diversificación (China+1)', sublabel: 'Líneas consolidadas de ensamblaje electrónico y componentes', colorCategory: 'high' },
  { code: 'DE', intensity: 68, label: 'Hub Europeo Consolidado', sublabel: 'Centro de ingeniería de alta precisión y distribución regional', colorCategory: 'medium' },
  { code: 'JP', intensity: 65, label: 'Suministro de Materiales Avanzados', sublabel: 'Componentes de alta pureza y sensores especializados', colorCategory: 'medium' },
  { code: 'KR', intensity: 65, label: 'Suministro de Memorias y Pantallas', sublabel: 'Módulos de memoria de alto rendimiento y paneles visuales', colorCategory: 'medium' },
];

const DEFAULT_EXPANSION: CorporateFootprintCountryConfig[] = [
  { code: 'IN', intensity: 60, label: 'Expansión de Capacidad y Mercado', sublabel: 'Escalado acelerado de producción local y mercado en rápida expansión', colorCategory: 'medium' },
  { code: 'BR', intensity: 45, label: 'Expansión Regional Sudamérica', sublabel: 'Crecimiento de penetración comercial y distribución local', colorCategory: 'low' },
  { code: 'SA', intensity: 40, label: 'Expansión Estratégica Oriente Medio', sublabel: 'Inversión en infraestructura tecnológica y asociaciones locales', colorCategory: 'low' },
  { code: 'PL', intensity: 45, label: 'Expansión Nearshoring Europa Oriental', sublabel: 'Centros de servicios operativos y logística continental', colorCategory: 'low' },
];

function markCodeAsRegistered(registeredCodes: Set<string>, code: string): void {
  const clean = code.trim().toUpperCase();
  registeredCodes.add(clean);

  const byCode = clean.length === 2 ? findCountryByCode(clean) : undefined;
  const byIso3 = clean.length === 3 ? findCountryByIso3(clean) : undefined;
  if (byCode) registeredCodes.add(byCode.iso3.toUpperCase());
  if (byIso3) registeredCodes.add(byIso3.code.toUpperCase());

  if (!byCode && !byIso3) {
    const resolved = GeopoliticalKnowledgeService.resolveCountryCode(clean);
    if (resolved) {
      registeredCodes.add(resolved.toUpperCase());
      const c = findCountryByCode(resolved);
      if (c?.iso3) registeredCodes.add(c.iso3.toUpperCase());
    }
  }
}

function registerFootprintList(
  map: ThematicLayerMap,
  list: CorporateFootprintCountryConfig[],
  registeredCodes: Set<string>,
  defaultIntensity: number,
  defaultLabel: string,
  defaultCategory: 'critical' | 'high' | 'medium' | 'low'
): void {
  for (const c of list) {
    const clean = c?.code ? c.code.trim().toUpperCase() : '';
    if (!clean || registeredCodes.has(clean)) continue;

    registerCountry(map, c.code, {
      countryCode: c.code,
      intensity: c.intensity ?? defaultIntensity,
      label: c.label ?? defaultLabel,
      sublabel: c.sublabel,
      colorCategory: c.colorCategory ?? defaultCategory,
    });
    markCodeAsRegistered(registeredCodes, c.code);
  }
}

/**
 * Pure generator for the 'footprint' layer.
 */
export function getFootprintLayerData(config?: CorporateFootprintConfig): ThematicLayerMap {
  if (!config) {
    const cached = getCachedDefaultFootprintMap();
    if (cached) return cached;
  }

  const map: ThematicLayerMap = {};
  const registeredCodes = new Set<string>();

  // 1. Headquarters
  const hq = config?.headquarters || {
    code: 'US',
    intensity: 95,
    label: 'Sede Central & Núcleo Operativo',
    sublabel: 'Gobernanza corporativa, I+D central y mercado consolidado',
    colorCategory: 'critical' as const,
  };
  registerCountry(map, hq.code, {
    countryCode: hq.code,
    intensity: hq.intensity ?? 95,
    label: hq.label ?? 'Sede Central & Núcleo Operativo',
    sublabel: hq.sublabel ?? 'Gobernanza corporativa, I+D central y mercado consolidado',
    colorCategory: hq.colorCategory ?? 'critical',
  });
  markCodeAsRegistered(registeredCodes, hq.code);

  // 2. Manufacturing & High-Value Supply Chain
  const consolidatedList = config?.consolidatedManufacturing || DEFAULT_CONSOLIDATED;
  registerFootprintList(map, consolidatedList, registeredCodes, 70, 'Hub Operativo Consolidado', 'high');

  // 3. Expansion Markets
  const expansionList = config?.expansionMarkets || DEFAULT_EXPANSION;
  registerFootprintList(map, expansionList, registeredCodes, 45, 'Mercado de Expansión Estratégica', 'low');

  if (!config) {
    setCachedDefaultFootprintMap(map);
  }
  return map;
}
