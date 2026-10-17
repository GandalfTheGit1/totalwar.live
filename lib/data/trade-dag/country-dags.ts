/**
 * lib/data/trade-dag/country-dags.ts
 *
 * Country-specific Trade DAG generators for US, China, and generic bilateral flows.
 */

import type { TradeDagGraph, TradeEdge, TradeNode } from '@/lib/services/trade-dag-service';

const US_DAG_NODES: TradeNode[] = [
  {
    id: 'node_latam_raw',
    name: 'Minería & Energía Upstream (LATAM/Canadá)',
    type: 'ORIGIN',
    countryCode: 'CA',
    industry: 'Recursos Naturales',
    description: 'Suministro básico de hidrocarburos, madera y minerales.',
    operatingMargin: 0.14,
    fcf: 3500,
    revenue: 28000,
    pricingPower: 42,
    moatScore: 38,
    moatType: 'NONE_COMMODITIZED',
    substitutability: 0.60,
    switchingCost: 35
  },
  {
    id: 'node_mexico_assembly',
    name: 'Manufactura Nearshoring (México / MX)',
    type: 'PASS_THROUGH',
    countryCode: 'MX',
    industry: 'Maquiladoras & Autopartes',
    description: 'Centros de ensamblaje con salarios competitivos y proximidad geográfica.',
    operatingMargin: 0.052,
    fcf: 1100,
    revenue: 42000,
    pricingPower: 24,
    moatScore: 25,
    moatType: 'NONE_COMMODITIZED',
    substitutability: 0.80,
    switchingCost: 30
  },
  {
    id: 'node_asia_ems',
    name: 'Maquila Contractual Asiática (China / CN)',
    type: 'PASS_THROUGH',
    countryCode: 'CN',
    industry: 'Electrónica de Consumo Masiva',
    description: 'Capacidad de escala física sin marcas propietarias.',
    operatingMargin: 0.038,
    fcf: 3200,
    revenue: 95000,
    pricingPower: 20,
    moatScore: 30,
    moatType: 'NONE_COMMODITIZED',
    substitutability: 0.75,
    switchingCost: 35
  },
  {
    id: 'node_us_ip_end',
    name: 'Corporaciones de Innovación (EE. UU. / US)',
    type: 'END_NODE',
    countryCode: 'US',
    industry: 'Plataformas de Software & Marcas Globales',
    description: 'Retención de propiedad intelectual, diseño de arquitectura y monetización recurrente.',
    operatingMargin: 0.38,
    fcf: 84000,
    revenue: 220000,
    pricingPower: 94,
    moatScore: 96,
    moatType: 'IP_PATENTS',
    substitutability: 0.08,
    switchingCost: 92
  }
];

const US_DAG_EDGES: TradeEdge[] = [
  { source: 'node_latam_raw', target: 'node_mexico_assembly', flowValue: 14000, goodsDescription: 'Acero, Plásticos y Cobre' },
  { source: 'node_latam_raw', target: 'node_asia_ems', flowValue: 9000, goodsDescription: 'Commodities a Granel' },
  { source: 'node_mexico_assembly', target: 'node_us_ip_end', flowValue: 36000, goodsDescription: 'Bienes Industriales Semiterminados' },
  { source: 'node_asia_ems', target: 'node_us_ip_end', flowValue: 68000, goodsDescription: 'Hardware Ensamblado' }
];

export function getUnitedStatesTradeDag(countryName: string): TradeDagGraph {
  return {
    id: 'dag_us_global_trade',
    name: `Red Comercial Global de ${countryName} (US)`,
    sector: 'Macro Comercio & Redes de Valor Transnacionales',
    description: 'Modelo de captura de FCF de corporaciones estadounidenses sostenidas por propiedad intelectual frente a maquilas asiáticas y nearshoring.',
    nodes: US_DAG_NODES,
    edges: US_DAG_EDGES
  };
}

const CN_DAG_NODES: TradeNode[] = [
  {
    id: 'node_aus_brazil_ores',
    name: 'Mineral de Hierro & Hidrocarburos (AU/BR/RU)',
    type: 'ORIGIN',
    countryCode: 'AU',
    industry: 'Minería Pesada',
    operatingMargin: 0.28,
    fcf: 12000,
    revenue: 45000,
    pricingPower: 60,
    moatScore: 50,
    moatType: 'NONE_COMMODITIZED',
    substitutability: 0.40,
    switchingCost: 45
  },
  {
    id: 'node_cn_heavy_pass',
    name: 'Acerías y Petroquímica (China / CN)',
    type: 'PASS_THROUGH',
    countryCode: 'CN',
    industry: 'Industria Pesada Básica',
    operatingMargin: 0.045,
    fcf: 1800,
    revenue: 65000,
    pricingPower: 22,
    moatScore: 25,
    moatType: 'NONE_COMMODITIZED',
    substitutability: 0.85,
    switchingCost: 20
  },
  {
    id: 'node_cn_assemblers',
    name: 'Mega-Plantas de Ensamblaje (China / CN)',
    type: 'PASS_THROUGH',
    countryCode: 'CN',
    industry: 'Manufactura Electrónica y Mecánica',
    operatingMargin: 0.035,
    fcf: 4500,
    revenue: 140000,
    pricingPower: 25,
    moatScore: 35,
    moatType: 'SCALE_CHOKEPOINT',
    substitutability: 0.60,
    switchingCost: 45,
    isChokepoint: true
  },
  {
    id: 'node_cn_ev_solar_end',
    name: 'Líderes de Energía Solar y EV (BYD / CATL)',
    type: 'END_NODE',
    countryCode: 'CN',
    industry: 'Tecnología Verde & Automoción',
    operatingMargin: 0.16,
    fcf: 8500,
    revenue: 62000,
    pricingPower: 75,
    moatScore: 78,
    moatType: 'SCALE_CHOKEPOINT',
    substitutability: 0.22,
    switchingCost: 70
  },
  {
    id: 'node_global_consumers',
    name: 'Consumidores de Occidente (EE. UU. / UE)',
    type: 'END_NODE',
    countryCode: 'US',
    industry: 'Mercados Terminales de Consumo',
    operatingMargin: 0.32,
    fcf: 35000,
    revenue: 110000,
    pricingPower: 88,
    moatScore: 92,
    moatType: 'BRAND_MONOPOLY',
    substitutability: 0.15,
    switchingCost: 85
  }
];

const CN_DAG_EDGES: TradeEdge[] = [
  { source: 'node_aus_brazil_ores', target: 'node_cn_heavy_pass', flowValue: 32000, goodsDescription: 'Carga de Mineral de Hierro' },
  { source: 'node_cn_heavy_pass', target: 'node_cn_assemblers', flowValue: 28000, goodsDescription: 'Bobinas de Acero y Resinas' },
  { source: 'node_cn_assemblers', target: 'node_global_consumers', flowValue: 85000, goodsDescription: 'Bienes de Consumo Finales' },
  { source: 'node_cn_heavy_pass', target: 'node_cn_ev_solar_end', flowValue: 14000, goodsDescription: 'Estructuras y Componentes' },
  { source: 'node_cn_ev_solar_end', target: 'node_global_consumers', flowValue: 22000, goodsDescription: 'Vehículos Eléctricos y Paneles' }
];

export function getChinaTradeDag(countryName: string): TradeDagGraph {
  return {
    id: 'dag_cn_global_trade',
    name: `Matriz Fabril y de Comercio de ${countryName} (CN)`,
    sector: 'Manufactura Global & Cadenas de Suministro',
    description: 'Dependencia de materias primas externas, procesamiento intermedio y competencia contra marcas terminales occidentales.',
    nodes: CN_DAG_NODES,
    edges: CN_DAG_EDGES
  };
}

function buildPrimaryInputsNode(cleanIso: string): TradeNode {
  return {
    id: `node_${cleanIso.toLowerCase()}_inputs`,
    name: 'Insumos y Suministro Primario',
    type: 'ORIGIN',
    countryCode: cleanIso,
    industry: 'Materias Primas & Energía',
    description: 'Aporte de materias primas o componentes base.',
    operatingMargin: 0.10,
    fcf: 450,
    revenue: 4200,
    pricingPower: 35,
    moatScore: 30,
    moatType: 'NONE_COMMODITIZED',
    substitutability: 0.70,
    switchingCost: 30
  };
}

function buildIntermediateHubNode(cleanIso: string, countryName: string): TradeNode {
  return {
    id: `node_${cleanIso.toLowerCase()}_pass_intermediate`,
    name: `${countryName}: Hub de Transformación`,
    type: 'PASS_THROUGH',
    countryCode: cleanIso,
    industry: 'Manufactura & Logística Intermedia',
    description: 'Fase de ensamblaje o procesamiento intermedio sujeta a competencia de costes.',
    operatingMargin: 0.055,
    fcf: 380,
    revenue: 7800,
    pricingPower: 28,
    moatScore: 24,
    moatType: 'NONE_COMMODITIZED',
    substitutability: 0.80,
    switchingCost: 25
  };
}

function buildEndConsumerNode(): TradeNode {
  return {
    id: 'node_target_end_consumer',
    name: 'Clientes Terminales & Canales de Distribución',
    type: 'END_NODE',
    countryCode: 'US',
    industry: 'Mercado Minorista y Clientes Finales',
    description: 'Control de la relación con el cliente, precios y márgenes de marca.',
    operatingMargin: 0.35,
    fcf: 6200,
    revenue: 19000,
    pricingPower: 90,
    moatScore: 92,
    moatType: 'DISTRIBUTION_LOCK',
    substitutability: 0.12,
    switchingCost: 88
  };
}

function buildGenericNodes(cleanIso: string, countryName: string): TradeNode[] {
  return [
    buildPrimaryInputsNode(cleanIso),
    buildIntermediateHubNode(cleanIso, countryName),
    buildEndConsumerNode()
  ];
}

function buildGenericEdges(cleanIso: string): TradeEdge[] {
  return [
    { source: `node_${cleanIso.toLowerCase()}_inputs`, target: `node_${cleanIso.toLowerCase()}_pass_intermediate`, flowValue: 3100, goodsDescription: 'Componentes y Materias Primas' },
    { source: `node_${cleanIso.toLowerCase()}_pass_intermediate`, target: 'node_target_end_consumer', flowValue: 6900, goodsDescription: 'Productos Exportados a Mercados Finales' }
  ];
}

export function getGenericBilateralTradeDag(cleanIso: string, countryName: string): TradeDagGraph {
  return {
    id: `dag_${cleanIso.toLowerCase()}_bilateral`,
    name: `Grafo DAG de Comercio: ${countryName} (${cleanIso})`,
    sector: 'Flujos Comerciales Bilaterales & Cadena de Suministro',
    description: `Estructura económica de flujo para ${countryName}, analizando si su valor agregado se concentra en extracción, intermediación o producto final.`,
    nodes: buildGenericNodes(cleanIso, countryName),
    edges: buildGenericEdges(cleanIso)
  };
}
