/**
 * lib/data/trade-dag/ev-battery.ts
 *
 * Arquetipo 2: Baterías EV y Minerales Críticos.
 */

import type { TradeDagGraph, TradeEdge, TradeNode } from '@/lib/services/trade-dag-service';

const EV_BATTERY_NODES: TradeNode[] = [
  {
    id: 'node_lithium_brine',
    name: 'Salar de Atacama & Minas Spodumene',
    type: 'ORIGIN',
    countryCode: 'CL',
    industry: 'Extracción de Litio',
    description: 'Salmueras de litio y yacimientos base.',
    operatingMargin: 0.22,
    fcf: 850,
    revenue: 4200,
    pricingPower: 50,
    moatScore: 45,
    moatType: 'NONE_COMMODITIZED',
    substitutability: 0.50,
    switchingCost: 40
  },
  {
    id: 'node_chemical_refiners',
    name: 'Refinadores Químicos de Cátodos',
    type: 'PASS_THROUGH',
    countryCode: 'CN',
    industry: 'Procesamiento Químico',
    description: 'Conversión de carbonato a hidróxido de litio y precursores pCAM.',
    operatingMargin: 0.08,
    fcf: 480,
    revenue: 12500,
    pricingPower: 30,
    moatScore: 35,
    moatType: 'NONE_COMMODITIZED',
    substitutability: 0.75,
    switchingCost: 30
  },
  {
    id: 'node_catl_cells',
    name: 'CATL (Fabricación de Celdas LFP/NMC)',
    type: 'PASS_THROUGH',
    countryCode: 'CN',
    industry: 'Celdas de Batería',
    description: 'Monopolio de escala en producción masiva de packs de batería.',
    operatingMargin: 0.14,
    fcf: 4200,
    revenue: 55000,
    pricingPower: 65,
    moatScore: 70,
    moatType: 'SCALE_CHOKEPOINT',
    substitutability: 0.25,
    switchingCost: 65,
    isChokepoint: true
  },
  {
    id: 'node_tier1_harness',
    name: 'Proveedores Tier-1 de Chasis y Cableado',
    type: 'PASS_THROUGH',
    countryCode: 'MX',
    industry: 'Autopartes & Cableado',
    description: 'Maquila y ensamblaje de arneses eléctricos y piezas de carrocería.',
    operatingMargin: 0.045,
    fcf: 350,
    revenue: 16000,
    pricingPower: 20,
    moatScore: 18,
    moatType: 'NONE_COMMODITIZED',
    substitutability: 0.85,
    switchingCost: 25
  },
  {
    id: 'node_tesla_oem',
    name: 'Tesla Inc. & OEMs Premium',
    type: 'END_NODE',
    countryCode: 'US',
    industry: 'Fabricantes EV & Red Superchargers',
    description: 'Control de la marca, red de recarga y software de conducción autónoma.',
    operatingMargin: 0.165,
    fcf: 7500,
    revenue: 97000,
    pricingPower: 82,
    moatScore: 88,
    moatType: 'BRAND_MONOPOLY',
    substitutability: 0.18,
    switchingCost: 80
  }
];

const EV_BATTERY_EDGES: TradeEdge[] = [
  { source: 'node_lithium_brine', target: 'node_chemical_refiners', flowValue: 3500, goodsDescription: 'Carbonato de Litio Grado Técnico' },
  { source: 'node_chemical_refiners', target: 'node_catl_cells', flowValue: 9800, goodsDescription: 'Material de Cátodo Refinado' },
  { source: 'node_catl_cells', target: 'node_tesla_oem', flowValue: 18500, goodsDescription: 'Packs de Batería Estructurales' },
  { source: 'node_tier1_harness', target: 'node_tesla_oem', flowValue: 7200, goodsDescription: 'Arneses de Voltaje y Subchasis' }
];

export function getEvBatteryDag(): TradeDagGraph {
  return {
    id: 'dag_ev_battery',
    name: 'Vehículos Eléctricos & Baterías de Litio',
    sector: 'Automoción & Transición Energética',
    description: 'Extracción de litio y níquel, procesamiento químico, celdas CATL y ensamblaje automotriz final.',
    nodes: EV_BATTERY_NODES,
    edges: EV_BATTERY_EDGES
  };
}
