/**
 * lib/services/geopolitical/hard-country-data.ts
 *
 * Curated sanctions and sovereign risk profiles for canonical hard countries
 * (OFAC, EU, UNSC sanctions regimes and strategic adversaries).
 */

import { HardCountryCuratedData } from './types';

export const CANONICAL_HARD_COUNTRIES_DATA: Record<string, HardCountryCuratedData> = {
  RU: {
    sanctions: {
      level: 'COMPREHENSIVE',
      score: 100,
      regimes: ['OFAC_SDN', 'EU_SANCTIONS', 'G7_PRICE_CAP', 'SWIFT_BAN', 'EXPORT_CONTROLS'],
      description: 'Embargo integral OFAC SDN, desconexión SWIFT, sanciones masivas UE y controles de exportación tecnológica militar.'
    },
    sovereignRiskBase: 9.0,
    autocracy: true,
    globalFrictionScore: 9.8,
    stance: 'SANCTIONED_ADVERSARIAL'
  },
  IR: {
    sanctions: {
      level: 'COMPREHENSIVE',
      score: 98,
      regimes: ['OFAC_SDN', 'EU_SANCTIONS', 'SECONDARY_SANCTIONS', 'JCPOA_SNAPBACK'],
      description: 'Embargo integral OFAC, sanciones secundarias extraterritoriales, bloqueo financiero y prohibición de exportaciones petroleras.'
    },
    sovereignRiskBase: 8.5,
    autocracy: true,
    globalFrictionScore: 9.5,
    stance: 'SANCTIONED_ADVERSARIAL'
  },
  KP: {
    sanctions: {
      level: 'COMPREHENSIVE',
      score: 100,
      regimes: ['UNSC_SANCTIONS', 'OFAC_SDN', 'COMPREHENSIVE_EMBARGO', 'FATF_BLACKLIST'],
      description: 'Embargo universal de la ONU y OFAC SDN, aislamiento financiero global absoluto y prohibición comercial total.'
    },
    sovereignRiskBase: 9.8,
    autocracy: true,
    globalFrictionScore: 9.8,
    stance: 'SANCTIONED_ADVERSARIAL'
  },
  SY: {
    sanctions: {
      level: 'COMPREHENSIVE',
      score: 95,
      regimes: ['CAESAR_ACT', 'OFAC_SDN', 'EU_RESTRICTIVE_MEASURES', 'COMPREHENSIVE_EMBARGO'],
      description: 'Ley César de EE.UU., congelamiento de activos soberanos, embargo comercial integral y sanciones financieras multilaterales.'
    },
    sovereignRiskBase: 9.5,
    autocracy: true,
    globalFrictionScore: 9.5,
    stance: 'SANCTIONED_ADVERSARIAL'
  },
  BY: {
    sanctions: {
      level: 'COMPREHENSIVE',
      score: 88,
      regimes: ['OFAC_SDN', 'EU_SANCTIONS', 'POTASH_TRANSPORT_EMBARGO'],
      description: 'Sanciones severas UE/OFAC por co-beligerancia bélica, embargo a la potasa, transporte y aislamiento del sistema bancario.'
    },
    sovereignRiskBase: 8.5,
    autocracy: true,
    globalFrictionScore: 8.8,
    stance: 'SANCTIONED_ADVERSARIAL'
  },
  CU: {
    sanctions: {
      level: 'COMPREHENSIVE',
      score: 85,
      regimes: ['OFAC_CACR', 'HELMS_BURTON', 'TRADE_EMBARGO'],
      description: 'Embargo comercial integral estadounidense bajo regulaciones CACR de OFAC y Ley Helms-Burton.'
    },
    sovereignRiskBase: 8.0,
    autocracy: true,
    globalFrictionScore: 8.0,
    stance: 'SANCTIONED_ADVERSARIAL'
  },
  VE: {
    sanctions: {
      level: 'SECTORAL',
      score: 80,
      regimes: ['OFAC_SDN', 'PDVSA_SECTORAL', 'GOLD_EMBARGO', 'EU_SANCTIONS'],
      description: 'Sanciones sectoriales petroleras contra PdVSA, embargo aurífero y designaciones individuales SDN contra la cúpula estatal.'
    },
    sovereignRiskBase: 8.2,
    autocracy: true,
    globalFrictionScore: 7.5,
    stance: 'FRICTION_STRATEGIC_COMPETITION'
  },
  MM: {
    sanctions: {
      level: 'SECTORAL',
      score: 78,
      regimes: ['OFAC_SDN', 'MOGE_SANCTIONS', 'EU_ARMS_EMBARGO'],
      description: 'Sanciones contra la junta militar golpista, monopolio petrolero MOGE y embargo de tecnología y armamento.'
    },
    sovereignRiskBase: 8.4,
    autocracy: true,
    globalFrictionScore: 7.5,
    stance: 'FRICTION_STRATEGIC_COMPETITION'
  },
  CN: {
    sanctions: {
      level: 'SECTORAL',
      score: 60,
      regimes: ['BIS_ENTITY_LIST', 'EXPORT_CONTROLS_CHIPS', 'UFLPA', 'NS_CMIC'],
      description: 'Controles BIS de exportación de semiconductores avanzados y litografía, Entity List, UFLPA y restricciones al complejo militar-civil.'
    },
    sovereignRiskBase: 7.0,
    autocracy: true,
    globalFrictionScore: 8.5,
    stance: 'FRICTION_STRATEGIC_COMPETITION'
  },
  AF: {
    sanctions: {
      level: 'SECTORAL',
      score: 75,
      regimes: ['OFAC_SDN', 'TALIBAN_SANCTIONS', 'ASSET_FREEZE'],
      description: 'Congelamiento de reservas del banco central de Afganistán y sanciones SDN contra el régimen talibán.'
    },
    sovereignRiskBase: 9.0,
    autocracy: true,
    globalFrictionScore: 8.5,
    stance: 'SANCTIONED_ADVERSARIAL'
  },
  NI: {
    sanctions: {
      level: 'TARGETED',
      score: 55,
      regimes: ['OFAC_SDN', 'RENACER_ACT'],
      description: 'Sanciones específicas bajo la Ley RENACER, restricciones de visados y sanciones al sector aurífero y judicial.'
    },
    sovereignRiskBase: 7.5,
    autocracy: true,
    globalFrictionScore: 6.8,
    stance: 'FRICTION_STRATEGIC_COMPETITION'
  },
  YE: {
    sanctions: {
      level: 'TARGETED',
      score: 65,
      regimes: ['OFAC_SDN', 'FTO_DESIGNATION'],
      description: 'Designación de grupo terrorista internacional a las milicias hutíes y bloqueo de activos vinculados a agresiones marítimas.'
    },
    sovereignRiskBase: 8.8,
    autocracy: true,
    globalFrictionScore: 8.0,
    stance: 'SANCTIONED_ADVERSARIAL'
  },
  SD: {
    sanctions: {
      level: 'TARGETED',
      score: 65,
      regimes: ['OFAC_SDN', 'ARMS_EMBARGO'],
      description: 'Conflicto bélico interno, sanciones OFAC a líderes paramilitares y de las FAS, y embargo de armas.'
    },
    sovereignRiskBase: 8.5,
    autocracy: true,
    globalFrictionScore: 7.5,
    stance: 'FRICTION_STRATEGIC_COMPETITION'
  },
  TR: {
    sanctions: {
      level: 'TARGETED',
      score: 20,
      regimes: ['CAATSA_SECTION_231'],
      description: 'Sanciones específicas CAATSA a la presidencia de industrias de defensa (SSB) por adquisición de sistemas S-400.'
    },
    sovereignRiskBase: 6.2,
    autocracy: false,
    globalFrictionScore: 5.5,
    stance: 'FRICTION_STRATEGIC_COMPETITION'
  },
  SS: {
    sanctions: {
      level: 'SECTORAL',
      score: 75,
      regimes: ['UNSC_SANCTIONS', 'OFAC_SDN', 'ARMS_EMBARGO'],
      description: 'Sanciones ONU y OFAC por conflicto civil, violaciones de DDHH y embargo multilateral de armas.'
    },
    sovereignRiskBase: 9.2,
    autocracy: true,
    globalFrictionScore: 8.0,
    stance: 'FRICTION_STRATEGIC_COMPETITION'
  },
  LY: {
    sanctions: {
      level: 'TARGETED',
      score: 65,
      regimes: ['UNSC_SANCTIONS', 'OFAC_SDN', 'ASSET_FREEZE'],
      description: 'Bloqueo de activos de facciones armadas, sanciones multilaterales y embargo de armamento.'
    },
    sovereignRiskBase: 8.6,
    autocracy: true,
    globalFrictionScore: 7.2,
    stance: 'FRICTION_STRATEGIC_COMPETITION'
  },
  SO: {
    sanctions: {
      level: 'TARGETED',
      score: 70,
      regimes: ['UNSC_SANCTIONS', 'ARMS_EMBARGO', 'OFAC_SDN'],
      description: 'Embargo de armamento del Consejo de Seguridad de la ONU y designaciones antiterroristas globales.'
    },
    sovereignRiskBase: 9.4,
    autocracy: true,
    globalFrictionScore: 7.8,
    stance: 'FRICTION_STRATEGIC_COMPETITION'
  },
  CF: {
    sanctions: {
      level: 'TARGETED',
      score: 65,
      regimes: ['UNSC_SANCTIONS', 'ARMS_EMBARGO'],
      description: 'Embargo de armas de la ONU y sanciones específicas contra grupos paramilitares rebeldes.'
    },
    sovereignRiskBase: 9.0,
    autocracy: true,
    globalFrictionScore: 7.0,
    stance: 'FRICTION_STRATEGIC_COMPETITION'
  },
  ZW: {
    sanctions: {
      level: 'TARGETED',
      score: 60,
      regimes: ['OFAC_GLOBAL_MAGNITSKY', 'ZDERA'],
      description: 'Sanciones financieras específicas Global Magnitsky contra líderes y entidades estatales.'
    },
    sovereignRiskBase: 8.2,
    autocracy: true,
    globalFrictionScore: 6.8,
    stance: 'FRICTION_STRATEGIC_COMPETITION'
  },
  ML: {
    sanctions: {
      level: 'TARGETED',
      score: 65,
      regimes: ['OFAC_SDN', 'ECOWAS_RESTRICTIONS'],
      description: 'Sanciones contra la junta militar golpista y redes paramilitares de seguridad.'
    },
    sovereignRiskBase: 8.5,
    autocracy: true,
    globalFrictionScore: 7.4,
    stance: 'FRICTION_STRATEGIC_COMPETITION'
  }
};
