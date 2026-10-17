/**
 * lib/data/trade-dag/biopharma-luxury.ts
 *
 * Arquetipo 3: Farmacéutica y Principios Activos (APIs)
 * Arquetipo 4: Bienes de Lujo y Artesanía
 */

import type { TradeDagGraph, TradeEdge, TradeNode } from '@/lib/services/trade-dag-service';

const BIOPHARMA_NODES: TradeNode[] = [
  {
    id: 'node_fine_chemicals',
    name: 'Química Fina & Reactivos Base',
    type: 'ORIGIN',
    countryCode: 'IN',
    industry: 'Química Orgánica',
    description: 'Reactivos y disolventes para síntesis molecular.',
    operatingMargin: 0.09,
    fcf: 220,
    revenue: 2800,
    pricingPower: 35,
    moatScore: 30,
    moatType: 'NONE_COMMODITIZED',
    substitutability: 0.70,
    switchingCost: 25
  },
  {
    id: 'node_cdmo_contractor',
    name: 'Lonza / Catalent (CDMO)',
    type: 'PASS_THROUGH',
    countryCode: 'CH',
    industry: 'Manufactura Farmacéutica por Contrato',
    description: 'Instalaciones cGMP para formulación estéril y cultivo celular.',
    operatingMargin: 0.15,
    fcf: 1200,
    revenue: 9500,
    pricingPower: 55,
    moatScore: 62,
    moatType: 'SCALE_CHOKEPOINT',
    substitutability: 0.35,
    switchingCost: 75
  },
  {
    id: 'node_patented_pharma',
    name: 'Big Pharma Protegida (Eli Lilly / Pfizer)',
    type: 'END_NODE',
    countryCode: 'US',
    industry: 'Fármacos Éticos Patentados',
    description: 'Monopolio de 20 años respaldado por patentes y fuerza comercial hospitalaria.',
    operatingMargin: 0.44,
    fcf: 18500,
    revenue: 48000,
    pricingPower: 95,
    moatScore: 96,
    moatType: 'IP_PATENTS',
    substitutability: 0.05,
    switchingCost: 95
  }
];

const BIOPHARMA_EDGES: TradeEdge[] = [
  { source: 'node_fine_chemicals', target: 'node_cdmo_contractor', flowValue: 1900, goodsDescription: 'Principios Activos a Granel' },
  { source: 'node_cdmo_contractor', target: 'node_patented_pharma', flowValue: 6500, goodsDescription: 'Formulación y Embalaje Inyectable' }
];

export function getBioPharmaDag(): TradeDagGraph {
  return {
    id: 'dag_biopharma',
    name: 'Biofarmacia & Principios Activos',
    sector: 'Salud & Biotecnología',
    description: 'Química básica, organizaciones CDMO de manufactura y laboratorios con patentes protegidas.',
    nodes: BIOPHARMA_NODES,
    edges: BIOPHARMA_EDGES
  };
}

const LUXURY_NODES: TradeNode[] = [
  {
    id: 'node_raw_leather',
    name: 'Ganaderías & Curtido de Pieles Crudas',
    type: 'ORIGIN',
    countryCode: 'IT',
    industry: 'Materias Primas Agrícolas',
    description: 'Suministro de pieles y seda natural.',
    operatingMargin: 0.11,
    fcf: 120,
    revenue: 1400,
    pricingPower: 40,
    moatScore: 35,
    moatType: 'NONE_COMMODITIZED',
    substitutability: 0.60,
    switchingCost: 30
  },
  {
    id: 'node_pass_tanning',
    name: 'Talleres de Curtido y Cosido Tercerizados',
    type: 'PASS_THROUGH',
    countryCode: 'ES',
    industry: 'Manufactura Textil & Cuero',
    description: 'Confección y costura subcontractada sin marca propia.',
    operatingMargin: 0.065,
    fcf: 160,
    revenue: 3200,
    pricingPower: 22,
    moatScore: 20,
    moatType: 'NONE_COMMODITIZED',
    substitutability: 0.85,
    switchingCost: 20
  },
  {
    id: 'node_hermes_lvmh',
    name: 'Hermès / LVMH (Casas de Lujo)',
    type: 'END_NODE',
    countryCode: 'FR',
    industry: 'Alta Costura & Marroquinería de Lujo',
    description: 'Marca centenaria con listas de espera exclusivas y tiendas propias monomarca.',
    operatingMargin: 0.42,
    fcf: 8900,
    revenue: 26000,
    pricingPower: 99,
    moatScore: 98,
    moatType: 'BRAND_MONOPOLY',
    substitutability: 0.03,
    switchingCost: 92
  }
];

const LUXURY_EDGES: TradeEdge[] = [
  { source: 'node_raw_leather', target: 'node_pass_tanning', flowValue: 950, goodsDescription: 'Pieles Curtidas al Cromo y Vegetal' },
  { source: 'node_pass_tanning', target: 'node_hermes_lvmh', flowValue: 2400, goodsDescription: 'Piezas Semiterminadas para Taller de Acabado' }
];

export function getLuxuryGoodsDag(): TradeDagGraph {
  return {
    id: 'dag_luxury_goods',
    name: 'Bienes de Lujo & Alta Costura',
    sector: 'Consumo Discrecional Premium',
    description: 'Pieles crudas, curtido especializado y casas de moda históricas con canales cerrados.',
    nodes: LUXURY_NODES,
    edges: LUXURY_EDGES
  };
}
