/**
 * lib/data/critical-commodities/energy-tech.ts
 *
 * Strategic Energy & Tech profiles: Advanced Semiconductors, Crude Oil & LNG.
 */

import { CriticalCommodityProfile } from './types';

export const ENERGY_TECH_COMMODITIES: CriticalCommodityProfile[] = [
  {
    id: 'semiconductors',
    name: 'Semiconductores Avanzados (<3nm & CoWoS)',
    label: 'Semiconductores Avanzados',
    category: 'Technology',
    description: 'Fundición avanzada de nodos <3nm y empaquetado CoWoS/HBM para aceleradores de inteligencia artificial y computación soberana.',
    searchKeywords: ['semiconductor', 'fundición', 'tsmc', 'chips', 'litografía', 'cowos', 'hbm'],
    vulnerableOrigins: [
      {
        countryCode: 'TW',
        marketSharePercentage: 92,
        chokepointType: 'MILITARY_CHOKEPOINT',
        rationale: 'Taiwán (TSMC Hsinchu/Tainan) produce >92% de los microchips avanzados <3nm en zona de amenaza directa de bloqueo naval.',
      },
    ],
    viableSubstitutes: [
      {
        countryCode: 'US',
        productionCapacityScore: 92,
        strategicAsset: 'TSMC Fab 21 en Phoenix (Arizona), Intel Foundry en Ohio/Oregon y Samsung Foundry en Taylor (Texas).',
        provenReservesRank: 1,
        readinessMonths: 6,
      },
      {
        countryCode: 'JP',
        productionCapacityScore: 88,
        strategicAsset: 'JASM (TSMC en Kumamoto Fab 1 & 2) e iniciativa Rapidus nodo 2nm en Hokkaido.',
        provenReservesRank: 2,
        readinessMonths: 6,
      },
      {
        countryCode: 'DE',
        productionCapacityScore: 84,
        strategicAsset: 'ESMC (TSMC joint venture en Dresden con Bosch/Infineon/NXP) e inversiones Silicon Saxony.',
        provenReservesRank: 3,
        readinessMonths: 18,
      },
      {
        countryCode: 'KR',
        productionCapacityScore: 90,
        strategicAsset: 'Samsung Foundry Pyeongtaek Fab y SK Hynix (monopolio de memorias HBM3e para GPUs IA).',
        provenReservesRank: 1,
        readinessMonths: 0,
      },
      {
        countryCode: 'NL',
        productionCapacityScore: 94,
        strategicAsset: 'ASML Veldhoven (monopolio de maquinaria EUV High-NA) y ecosistema NXP en Eindhoven.',
        provenReservesRank: 1,
        readinessMonths: 0,
      },
    ],
  },
  {
    id: 'oil-gas',
    name: 'Petróleo Crudo & Gas Natural Licuado (GNL)',
    label: 'Petróleo & GNL',
    category: 'Energy',
    description: 'Hidrocarburos líquidos y gas natural licuado para seguridad energética, petroquímica y resiliencia de transporte.',
    searchKeywords: ['petróleo', 'gas natural', 'gnl', 'crudo', 'hidrocarburos'],
    vulnerableOrigins: [
      {
        countryCode: 'RU',
        marketSharePercentage: 14,
        chokepointType: 'GEOPOLITICAL_SANCTION',
        rationale: 'Rusia sujeta a embargos de la UE/G7, sabotaje de gasoductos Nord Stream y redireccionamiento forzoso hacia Asia.',
      },
      {
        countryCode: 'IR',
        marketSharePercentage: 4,
        chokepointType: 'MILITARY_CHOKEPOINT',
        rationale: 'Irán bajo sanciones secundarias del Tesoro de EE. UU. y capacidad de disrupción militar del Estrecho de Ormuz.',
      },
    ],
    viableSubstitutes: [
      {
        countryCode: 'US',
        productionCapacityScore: 98,
        strategicAsset: 'Cuenca Pérmica (Shale Oil) y terminales de licuefacción de GNL Cheniere Sabine Pass y Freeport LNG.',
        provenReservesRank: 1,
        readinessMonths: 0,
      },
      {
        countryCode: 'CA',
        productionCapacityScore: 90,
        strategicAsset: 'Arenas bituminosas de Alberta, oleoducto Trans Mountain hacia el Pacífico y proyectos LNG Canada.',
        provenReservesRank: 3,
        readinessMonths: 0,
      },
      {
        countryCode: 'NO',
        productionCapacityScore: 88,
        strategicAsset: 'Equinor (plataformas Troll y Johan Sverdrup), principal exportador de gas por tubería para desvincular a Europa de Rusia.',
        provenReservesRank: 4,
        readinessMonths: 0,
      },
      {
        countryCode: 'QA',
        productionCapacityScore: 92,
        strategicAsset: 'North Field Expansion (QatarEnergy), el mayor yacimiento no asociado de gas natural y líder en contratos GNL a 27 años.',
        provenReservesRank: 2,
        readinessMonths: 0,
      },
      {
        countryCode: 'AU',
        productionCapacityScore: 86,
        strategicAsset: 'Proyectos Gorgon, Wheatstone y Prelude FLNG en Western Australia abasteciendo a Japón y Corea del Sur.',
        provenReservesRank: 5,
        readinessMonths: 0,
      },
    ],
  },
];
