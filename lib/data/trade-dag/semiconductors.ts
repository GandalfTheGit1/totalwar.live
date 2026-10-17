/**
 * lib/data/trade-dag/semiconductors.ts
 *
 * Arquetipo 1: Semiconductores y Hardware de Inteligencia Artificial.
 * Muestra la asimetría extrema entre ASML / TSMC (chokepoints) y Apple/Nvidia (End Nodes)
 * frente a maquila OSAT y ensambladores (Foxconn/ASE) comoditizados.
 */

import type { TradeDagGraph, TradeEdge, TradeNode } from '@/lib/services/trade-dag-service';

const SEMICONDUCTOR_NODES: TradeNode[] = [
  {
    id: 'node_raw_silicon',
    name: 'Tierras Raras & Silicio Policristalino',
    type: 'ORIGIN',
    countryCode: 'CN',
    industry: 'Minería & Materiales Críticos',
    description: 'Extracción y refinamiento de silicio grado electrónico y metales de tierras raras.',
    operatingMargin: 0.12,
    fcf: 450,
    revenue: 3500,
    pricingPower: 45,
    moatScore: 40,
    moatType: 'NONE_COMMODITIZED',
    substitutability: 0.65,
    switchingCost: 35
  },
  {
    id: 'node_asml_euv',
    name: 'ASML Litografía EUV',
    type: 'PASS_THROUGH',
    countryCode: 'NL',
    industry: 'Equipos de Fotolitografía',
    description: 'Monopolio global en sistemas de litografía ultravioleta extrema para nodos sub-3nm.',
    operatingMargin: 0.33,
    fcf: 7200,
    revenue: 29000,
    pricingPower: 96,
    moatScore: 98,
    moatType: 'SCALE_CHOKEPOINT',
    substitutability: 0.02,
    switchingCost: 98,
    isChokepoint: true
  },
  {
    id: 'node_tsmc_foundry',
    name: 'TSMC Fundición Pura',
    type: 'PASS_THROUGH',
    countryCode: 'TW',
    industry: 'Fabricación de Wafers',
    description: 'Líder absoluto de fabricación de semiconductores avanzados con empaquetado CoWoS.',
    operatingMargin: 0.42,
    fcf: 24000,
    revenue: 69000,
    pricingPower: 92,
    moatScore: 94,
    moatType: 'SCALE_CHOKEPOINT',
    substitutability: 0.08,
    switchingCost: 92,
    isChokepoint: true
  },
  {
    id: 'node_osat_ase',
    name: 'ASE Group (OSAT Packaging)',
    type: 'PASS_THROUGH',
    countryCode: 'TW',
    industry: 'Empaquetado & Test de Chips',
    description: 'Ensamblaje y testeo de chips comoditizado con baja diferenciación tecnológica.',
    operatingMargin: 0.075,
    fcf: 650,
    revenue: 19500,
    pricingPower: 25,
    moatScore: 28,
    moatType: 'NONE_COMMODITIZED',
    substitutability: 0.82,
    switchingCost: 22
  },
  {
    id: 'node_foxconn_assembly',
    name: 'Foxconn / Hon Hai Ensamblaje',
    type: 'PASS_THROUGH',
    countryCode: 'CN',
    industry: 'Manufactura por Contrato (EMS)',
    description: 'Ensamblaje masivo de placas y teléfonos con márgenes operativos comprimidos.',
    operatingMargin: 0.028,
    fcf: 2100,
    revenue: 190000,
    pricingPower: 18,
    moatScore: 22,
    moatType: 'NONE_COMMODITIZED',
    substitutability: 0.78,
    switchingCost: 28
  },
  {
    id: 'node_nvidia_compute',
    name: 'NVIDIA (Aceleradores IA & CUDA)',
    type: 'END_NODE',
    countryCode: 'US',
    industry: 'Diseño de Chips & Software Ecosistema',
    description: 'Control de la plataforma de cómputo IA acelerado respaldado por el foso del ecosistema CUDA.',
    operatingMargin: 0.62,
    fcf: 48000,
    revenue: 96000,
    pricingPower: 98,
    moatScore: 96,
    moatType: 'IP_PATENTS',
    substitutability: 0.05,
    switchingCost: 95
  },
  {
    id: 'node_apple_ecosystem',
    name: 'Apple Inc. (Dispositivos & Ecosistema)',
    type: 'END_NODE',
    countryCode: 'US',
    industry: 'Electrónica de Consumo & Servicios',
    description: 'Marca global de fidelidad extrema, canal minorista cerrado y alto pricing power.',
    operatingMargin: 0.31,
    fcf: 108000,
    revenue: 385000,
    pricingPower: 94,
    moatScore: 97,
    moatType: 'BRAND_MONOPOLY',
    substitutability: 0.10,
    switchingCost: 90
  }
];

const SEMICONDUCTOR_EDGES: TradeEdge[] = [
  { source: 'node_raw_silicon', target: 'node_tsmc_foundry', flowValue: 2800, goodsDescription: 'Lingotes de Silicio y Químicos' },
  { source: 'node_asml_euv', target: 'node_tsmc_foundry', flowValue: 12000, goodsDescription: 'Escáneres Litográficos EUV Twinscan' },
  { source: 'node_tsmc_foundry', target: 'node_osat_ase', flowValue: 22000, goodsDescription: 'Wafers Procesados para Test' },
  { source: 'node_tsmc_foundry', target: 'node_nvidia_compute', flowValue: 24000, goodsDescription: 'Silicon Dies de Arquitectura Blackwell/Hopper' },
  { source: 'node_osat_ase', target: 'node_foxconn_assembly', flowValue: 14000, goodsDescription: 'Módulos y Circuitos Integrados Listos' },
  { source: 'node_foxconn_assembly', target: 'node_apple_ecosystem', flowValue: 75000, goodsDescription: 'Dispositivos Terminados (iPhone/Mac)' },
  { source: 'node_foxconn_assembly', target: 'node_nvidia_compute', flowValue: 28000, goodsDescription: 'Ensamblaje de Racks y Servidores HGX/DGX' }
];

export function getSemiconductorAiDag(): TradeDagGraph {
  return {
    id: 'dag_semiconductors_ai',
    name: 'Semiconductores & Hardware IA',
    sector: 'Tecnología & Hardware Avanzado',
    description: 'Cadena de valor desde silicio bruto y óptica EUV hasta procesadores IA y ecosistemas de consumo final.',
    nodes: SEMICONDUCTOR_NODES,
    edges: SEMICONDUCTOR_EDGES
  };
}
