/**
 * Tipos y modelos de dominio para el motor de simulación de chokepoints marítimos.
 */

export type MaritimeChokepointId =
  | 'hormuz'
  | 'malacca'
  | 'suez'
  | 'bab_el_mandeb'
  | 'panama'
  | 'bosporus';

export type MaritimeIndustrySector =
  | 'SEMICONDUCTORS_AI'
  | 'AUTOMOTIVE_PARTS'
  | 'RETAIL_CONSUMER_GOODS'
  | 'ENERGY_PETROCHEMICALS';

export type JitStarvationRiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface StrategicChokepointDefinition {
  id: MaritimeChokepointId;
  name: string;
  nameEs: string;
  coordinates: { lat: number; lng: number };
  riparianCountries: string[]; // Códigos ISO-2 de países ribereños
  annualThroughputMmt: number; // Millones de toneladas métricas anuales
  globalTradeSharePct: number; // % del comercio marítimo mundial que transita
  baselineTransitDelayDays: number; // Días típicos de desvío si se cierra
  alternativeRouteName: string;
  alternativeRouteDescription: string;
  reroutingDistanceNm: number; // Millas náuticas adicionales
  strategicVulnerability: 'EXTREME' | 'HIGH' | 'MODERATE';
  primaryCommodities: string[];
  baseSurgePct: number; // Subida del flete spot $/FEU individual ante bloqueo
}

export interface IndustrySectorProfile {
  sector: MaritimeIndustrySector;
  label: string;
  labelEs: string;
  grossMarginPct: number; // Margen bruto porcentual de referencia (ej. 52 = 52%)
  freightShareInCogsPct: number; // % del flete marítimo dentro del COGS (ej. 4 = 4%)
  typicalDioDays: number; // Días de inventario de seguridad típicos (DIO)
  baselineFreightPerFeu: number; // Flete base en USD por contenedor de 40 pies (FEU)
  jitSensitivity: 'CRITICAL' | 'HIGH' | 'MODERATE';
  chokepointExposureWeights: Record<MaritimeChokepointId, number>; // Factor de exposición 0.0 - 1.0
  description: string;
}

export interface ReroutingAlternative {
  chokepointId: MaritimeChokepointId;
  chokepointName: string;
  alternativeName: string;
  description: string;
  extraTransitDays: number;
  extraDistanceNm: number;
  capacityBottleneck: string;
  estimatedExtraFuelCostPerFeu: number;
}

export interface ChokepointSimulationInput {
  blockedChokepoints: MaritimeChokepointId[];
  sector?: MaritimeIndustrySector;
  sensitivityMultiplier?: number; // Multiplicador de estrés (1.0 = normal, 1.5 = crisis, 2.0 = extrema)
  customGrossMarginPct?: number;
  customFreightSharePct?: number;
}

export interface ChokepointStatusDetail {
  id: MaritimeChokepointId;
  name: string;
  isBlocked: boolean;
  coordinates: { lat: number; lng: number };
  transitDelayDays: number;
  surgeContributionPct: number;
  alternativeRouteName: string;
  riparianCountries: string[];
}

export interface MaritimeSimulationResult {
  blockedChokepoints: MaritimeChokepointId[];
  blockedCount: number; // 0 a 6
  sector: MaritimeIndustrySector;
  sectorProfile: IndustrySectorProfile;
  sensitivityMultiplier: number;

  // Métricas logísticas
  transitDelayDays: number; // Días adicionales de tránsito
  freightRateSurgePct: number; // Incremento porcentual de fletes marítimos
  simulatedFreightRatePerFeu: number; // Tarifa simulada en USD/FEU

  // Métricas financieras deterministas
  cogsImpactPct: number; // Impacto porcentual de sobrecoste en el COGS (ΔCOGS %)
  grossMarginBefore: number; // Margen bruto inicial (%)
  grossMarginAfter: number; // Margen bruto resultante (%)
  grossMarginCompressionBps: number; // Compresión del margen en puntos básicos (bps)

  // Evaluación operativa HoI4 JIT Starvation
  jitStarvationRisk: JitStarvationRiskLevel;
  jitOutputMultiplier: number; // Multiplicador de producción (0.0 a 1.0)
  isJitStarved: boolean;

  // Rutas y mitigaciones
  reroutingAlternatives: ReroutingAlternative[];
  chokepointDetails: ChokepointStatusDetail[];
  tacticalRecommendation: string;
}

export interface MaritimeTradeRoute {
  id: string;
  name: string;
  nameEs: string;
  waypoints: [number, number][]; // [lng, lat] GeoJSON coordinates format
  primaryChokepoints: MaritimeChokepointId[];
  volumeSharePct: number;
  description: string;
}

export interface ChokepointSimulationPreset {
  id: string;
  name: string;
  nameEs: string;
  description: string;
  blockedChokepoints: MaritimeChokepointId[];
  recommendedSector: MaritimeIndustrySector;
}
