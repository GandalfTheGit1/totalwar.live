/**
 * Perfiles sectoriales calibrados para sensibilidad logística y de flete.
 */

import { MaritimeIndustrySector, IndustrySectorProfile } from './types';

export const SECTOR_PROFILES: Record<MaritimeIndustrySector, IndustrySectorProfile> = {
  SEMICONDUCTORS_AI: {
    sector: 'SEMICONDUCTORS_AI',
    label: 'Semiconductors & AI Hardware',
    labelEs: 'Semiconductores & Hardware de IA',
    grossMarginPct: 52.0,
    freightShareInCogsPct: 4.0,
    typicalDioDays: 95,
    baselineFreightPerFeu: 2800,
    jitSensitivity: 'HIGH',
    chokepointExposureWeights: {
      malacca: 1.0,
      suez: 0.7,
      bab_el_mandeb: 0.7,
      panama: 0.45,
      hormuz: 0.2,
      bosporus: 0.15,
    },
    description: 'Alto margen bruto (~52%) y densidad de valor extrema. El flete marítimo directo representa solo ~4% del COGS, pero el retraso temporal en insumos químicos (gases nobles, sustratos y obleas de silicio) desestabiliza las fabs con riesgo severo de reequipamiento.',
  },
  AUTOMOTIVE_PARTS: {
    sector: 'AUTOMOTIVE_PARTS',
    label: 'Automotive Parts & Assembly',
    labelEs: 'Componentes Automotrices & Ensamblaje',
    grossMarginPct: 22.0,
    freightShareInCogsPct: 9.0,
    typicalDioDays: 38,
    baselineFreightPerFeu: 2400,
    jitSensitivity: 'CRITICAL',
    chokepointExposureWeights: {
      malacca: 0.9,
      suez: 0.95,
      bab_el_mandeb: 0.85,
      panama: 0.8,
      hormuz: 0.3,
      bosporus: 0.4,
    },
    description: 'Margen bruto moderado (~22%) con modelo Just-in-Time estricto y buffer de inventario reducido (~38 días). Un retraso logístico >14 días detiene plantas de montaje de motores y chasis provocando pérdidas multimillonarias por paradas de línea.',
  },
  RETAIL_CONSUMER_GOODS: {
    sector: 'RETAIL_CONSUMER_GOODS',
    label: 'Retail & Consumer Goods',
    labelEs: 'Retail & Bienes de Consumo Masivo',
    grossMarginPct: 34.0,
    freightShareInCogsPct: 12.0,
    typicalDioDays: 65,
    baselineFreightPerFeu: 2200,
    jitSensitivity: 'MODERATE',
    chokepointExposureWeights: {
      suez: 1.0,
      panama: 0.9,
      malacca: 0.85,
      bab_el_mandeb: 0.85,
      hormuz: 0.25,
      bosporus: 0.3,
    },
    description: 'Margen bruto medio (~34%) con gran volumen de carga contenerizada. El flete marítimo representa un notable ~12% del COGS, por lo que las subidas de tarifas spot se absorben con fuerte compresión directa del margen bruto minorista.',
  },
  ENERGY_PETROCHEMICALS: {
    sector: 'ENERGY_PETROCHEMICALS',
    label: 'Energy & Petrochemicals',
    labelEs: 'Energía & Petroquímica',
    grossMarginPct: 20.0,
    freightShareInCogsPct: 15.0,
    typicalDioDays: 25,
    baselineFreightPerFeu: 3500, // Equivalente unitario $/VLCC normalizado
    jitSensitivity: 'CRITICAL',
    chokepointExposureWeights: {
      hormuz: 1.0,
      bab_el_mandeb: 0.85,
      suez: 0.7,
      bosporus: 0.75,
      malacca: 0.8,
      panama: 0.4,
    },
    description: 'Margen bruto volátil (~20%) con altísima dependencia del transporte marítimo en buques cisterna (~15% del COGS). El cierre de Ormuz o Bab el-Mandeb dispara las primas de riesgo de guerra marítimo y desabastece refinerías en menos de 25 días.',
  },
};
