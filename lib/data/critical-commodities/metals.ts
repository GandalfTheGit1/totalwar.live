/**
 * lib/data/critical-commodities/metals.ts
 *
 * Metal profiles: Lithium, Cobalt, Nickel, Copper, Gallium & Germanium.
 */

import { CriticalCommodityProfile } from './types';

export const METAL_COMMODITIES: CriticalCommodityProfile[] = [
  {
    id: 'lithium',
    name: 'Litio para Celdas Electroquímicas',
    label: 'Litio',
    category: 'Metals',
    description: 'Hidróxido y carbonato de litio para baterías de iones de litio en movilidad eléctrica y almacenamiento de red.',
    searchKeywords: ['litio', 'lithium', 'espodumena', 'salmuera'],
    vulnerableOrigins: [
      {
        countryCode: 'CN',
        marketSharePercentage: 65,
        chokepointType: 'REFINING_BOTTLENECK',
        rationale: 'China procesa el 65% del hidróxido de litio mundial y controla plantas de conversión química de espodumena.',
      },
    ],
    viableSubstitutes: [
      {
        countryCode: 'AU',
        productionCapacityScore: 96,
        strategicAsset: 'Mina Greenbushes (Talison Lithium), Pilbara Minerals Pilgangoora y refinería Kwinana Tianqi/IGO.',
        provenReservesRank: 1,
        readinessMonths: 0,
      },
      {
        countryCode: 'CL',
        productionCapacityScore: 90,
        strategicAsset: 'Salar de Atacama (SQM & Albemarle), salmueras de mayor concentración y menor coste operativo del planeta.',
        provenReservesRank: 2,
        readinessMonths: 0,
      },
      {
        countryCode: 'CA',
        productionCapacityScore: 82,
        strategicAsset: 'Proyectos James Bay (Arcadium), Whabouchi (Nemaska Lithium) y cuencas en Ontario y Quebec.',
        provenReservesRank: 6,
        readinessMonths: 12,
      },
      {
        countryCode: 'AR',
        productionCapacityScore: 78,
        strategicAsset: 'Salar de Olaroz (Arcadium Lithium), Hombre Muerto (Livent) y Centenario-Ratones (Eramet).',
        provenReservesRank: 3,
        readinessMonths: 6,
      },
      {
        countryCode: 'US',
        productionCapacityScore: 75,
        strategicAsset: 'Thacker Pass en Nevada (Lithium Americas), Silver Peak (Albemarle) y salmueras del Mar de Salton.',
        provenReservesRank: 4,
        readinessMonths: 18,
      },
    ],
  },
  {
    id: 'cobalt',
    name: 'Cobalto Grado Batería & Superaleaciones',
    label: 'Cobalto',
    category: 'Metals',
    description: 'Componente estabilizador en cátodos ternarios NMC/NCA y superaleaciones de turbinas aeroespaciales.',
    searchKeywords: ['cobalto', 'cobalt', 'katanga', 'heterogenita'],
    vulnerableOrigins: [
      {
        countryCode: 'CD',
        marketSharePercentage: 73,
        chokepointType: 'MONOPOLY_EXTRACTION',
        rationale: 'La R.D. del Congo concentra más del 73% de la extracción minera global en el cinturón de Katanga con grave inestabilidad.',
      },
    ],
    viableSubstitutes: [
      {
        countryCode: 'AU',
        productionCapacityScore: 82,
        strategicAsset: 'Glencore Murrin Murrin (planta hidrometalúrgica de níquel-cobalto) y depósitos de Ni-Co en Western Australia.',
        provenReservesRank: 2,
        readinessMonths: 0,
      },
      {
        countryCode: 'CA',
        productionCapacityScore: 80,
        strategicAsset: 'Cuenca de Sudbury (Glencore/Vale) y mina Voisey’s Bay en Terranova/Labrador.',
        provenReservesRank: 3,
        readinessMonths: 0,
      },
      {
        countryCode: 'NO',
        productionCapacityScore: 75,
        strategicAsset: 'Refinería Nikkelverk de Glencore en Kristiansand, líder europeo en cobalto refinado de alta pureza.',
        provenReservesRank: 5,
        readinessMonths: 0,
      },
      {
        countryCode: 'PH',
        productionCapacityScore: 70,
        strategicAsset: 'Plantas Coral Bay y Taganito HPAL de Nickel Asia Corp con subproducto de hidróxido de cobalto.',
        provenReservesRank: 4,
        readinessMonths: 6,
      },
    ],
  },
  {
    id: 'nickel',
    name: 'Níquel Clase 1 (Sulfuros de Alta Pureza)',
    label: 'Níquel',
    category: 'Metals',
    description: 'Níquel clase 1 (>99.8% pureza) imprescindible para cátodos de baterías de alta densidad energética y aceros inoxidables.',
    searchKeywords: ['níquel', 'nickel', 'laterita', 'sulfuro de níquel', 'hpal'],
    vulnerableOrigins: [
      {
        countryCode: 'RU',
        marketSharePercentage: 21,
        chokepointType: 'GEOPOLITICAL_SANCTION',
        rationale: 'Norilsk Nickel controla el 21% del níquel Clase 1 de alta pureza mundial, sometido a sanciones y exclusión de bolsas occidentales.',
      },
      {
        countryCode: 'ID',
        marketSharePercentage: 54,
        chokepointType: 'REFINING_BOTTLENECK',
        rationale: 'Indonesia produce más del 54% del níquel mundial con monopolio de capital y fundidoras chinas en parques de Morowali.',
      },
    ],
    viableSubstitutes: [
      {
        countryCode: 'CA',
        productionCapacityScore: 90,
        strategicAsset: 'Complejos mineros de sulfuros en Sudbury (Vale/KGHM) y Voisey’s Bay con bajísima intensidad de carbono.',
        provenReservesRank: 4,
        readinessMonths: 0,
      },
      {
        countryCode: 'AU',
        productionCapacityScore: 88,
        strategicAsset: 'BHP Nickel West (Mt Keith, Leinster) e IGO Nova-Bollinger en Western Australia.',
        provenReservesRank: 1,
        readinessMonths: 0,
      },
      {
        countryCode: 'NO',
        productionCapacityScore: 76,
        strategicAsset: 'Refinería de sulfuros Glencore Nikkelverk en Kristiansand, abasteciendo la industria automotriz europea.',
        provenReservesRank: 8,
        readinessMonths: 0,
      },
      {
        countryCode: 'PH',
        productionCapacityScore: 74,
        strategicAsset: 'Nickel Asia y Global Ferronickel con plantas HPAL en Surigao del Norte y Palawan.',
        provenReservesRank: 5,
        readinessMonths: 6,
      },
    ],
  },
  {
    id: 'copper',
    name: 'Cobre Electrolítico & Concentrados',
    label: 'Cobre',
    category: 'Metals',
    description: 'Conductor central de la transición energética, redes de alta tensión y centros de datos de inteligencia artificial.',
    searchKeywords: ['cobre', 'copper', 'calcopirita', 'fundición'],
    vulnerableOrigins: [
      {
        countryCode: 'CD',
        marketSharePercentage: 11,
        chokepointType: 'MILITARY_CHOKEPOINT',
        rationale: 'Complejo Kamoa-Kakula de alta ley dependiente del ferrocarril de Benguela y expuesto a inestabilidad política.',
      },
      {
        countryCode: 'CN',
        marketSharePercentage: 48,
        chokepointType: 'REFINING_BOTTLENECK',
        rationale: 'China concentra el 48% de la fundición y refinado electrolítico de cátodos de cobre a escala global.',
      },
    ],
    viableSubstitutes: [
      {
        countryCode: 'CL',
        productionCapacityScore: 98,
        strategicAsset: 'Codelco (El Teniente, Chuquicamata), Minera Escondida (BHP) y Collahuasi (~24% del cobre mundial).',
        provenReservesRank: 1,
        readinessMonths: 0,
      },
      {
        countryCode: 'CA',
        productionCapacityScore: 85,
        strategicAsset: 'Teck Resources Highland Valley Copper, Sudbury Basin y New Afton.',
        provenReservesRank: 5,
        readinessMonths: 0,
      },
      {
        countryCode: 'AU',
        productionCapacityScore: 86,
        strategicAsset: 'BHP Olympic Dam (cobre-uranio-oro) y Carrapateena en South Australia.',
        provenReservesRank: 2,
        readinessMonths: 0,
      },
      {
        countryCode: 'US',
        productionCapacityScore: 82,
        strategicAsset: 'Freeport-McMoRan Morenci en Arizona y Rio Tinto Kennecott Bingham Canyon en Utah.',
        provenReservesRank: 6,
        readinessMonths: 0,
      },
      {
        countryCode: 'PE',
        productionCapacityScore: 88,
        strategicAsset: 'Cerro Verde, Antamina, Las Bambas y Southern Copper Cuajone/Toquepala.',
        provenReservesRank: 3,
        readinessMonths: 0,
      },
      {
        countryCode: 'PL',
        productionCapacityScore: 78,
        strategicAsset: 'KGHM Polska Miedź, mayor productor europeo de cobre electrolítico y fundiciones en Głogów y Legnica.',
        provenReservesRank: 7,
        readinessMonths: 0,
      },
    ],
  },
  {
    id: 'gallium-germanium',
    name: 'Galio & Germanio Ultra-Puros',
    label: 'Galio & Germanio',
    category: 'Metals',
    description: 'Semiconductores compuestos de nitruro de galio (GaN), arseniuro de galio (GaAs), radares militares AESA y óptica infrarroja.',
    searchKeywords: ['galio', 'gallium', 'germanio', 'germanium', 'gan', 'gaas'],
    vulnerableOrigins: [
      {
        countryCode: 'CN',
        marketSharePercentage: 92,
        chokepointType: 'REFINING_BOTTLENECK',
        rationale: 'China produce >92% del galio primario y >60% del germanio, imponiendo controles y licencias de exportación hostiles desde 2023.',
      },
    ],
    viableSubstitutes: [
      {
        countryCode: 'JP',
        productionCapacityScore: 88,
        strategicAsset: 'Dowa Holdings y Sumitomo Chemical: capacidad líder mundial en reciclaje y purificación grado 7N.',
        provenReservesRank: 3,
        readinessMonths: 6,
      },
      {
        countryCode: 'CA',
        productionCapacityScore: 84,
        strategicAsset: 'Teck Resources Trail Smelter en BC: extracción y refinación comercial de germanio de alta pureza.',
        provenReservesRank: 2,
        readinessMonths: 6,
      },
      {
        countryCode: 'DE',
        productionCapacityScore: 82,
        strategicAsset: 'PPM Pure Metals GmbH en Langelsheim: refinador histórico de galio y reciclador semiconductor.',
        provenReservesRank: 4,
        readinessMonths: 6,
      },
      {
        countryCode: 'US',
        productionCapacityScore: 80,
        strategicAsset: 'Materion e Indium Corporation, con financiamiento DPA Título III del Pentágono para recuperación de galio.',
        provenReservesRank: 5,
        readinessMonths: 12,
      },
      {
        countryCode: 'KR',
        productionCapacityScore: 76,
        strategicAsset: 'RFHIC y SK siltron: fundición y síntesis de obleas de GaN sobre SiC.',
        provenReservesRank: 6,
        readinessMonths: 12,
      },
    ],
  },
];
