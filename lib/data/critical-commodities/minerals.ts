/**
 * lib/data/critical-commodities/minerals.ts
 *
 * Mineral profiles: Rare Earths & Permanent Magnets, Graphite for Anodes.
 */

import { CriticalCommodityProfile } from './types';

export const MINERAL_COMMODITIES: CriticalCommodityProfile[] = [
  {
    id: 'rare-earths',
    name: 'Tierras Raras & Imanes Permanentes',
    label: 'Tierras Raras',
    category: 'Minerals',
    description: 'Neodimio, Disprosio, Praseodimio e iterbio esenciales para motores EV, turbinas eólicas y guiado de misiles.',
    searchKeywords: ['tierras raras', 'rare earth', 'neodimio', 'disprosio', 'monacita', 'bastanita'],
    vulnerableOrigins: [
      {
        countryCode: 'CN',
        marketSharePercentage: 72,
        chokepointType: 'REFINING_BOTTLENECK',
        rationale: 'China domina el 72% de la extracción y >90% del refinado de óxidos de tierras raras e imanes NdFeB permanentes.',
      },
    ],
    viableSubstitutes: [
      {
        countryCode: 'AU',
        productionCapacityScore: 92,
        strategicAsset: 'Lynas Rare Earths (Mt Weld & planta de craqueo en Kalgoorlie) e Iluka Resources Eneabba.',
        provenReservesRank: 2,
        readinessMonths: 0,
      },
      {
        countryCode: 'US',
        productionCapacityScore: 84,
        strategicAsset: 'MP Materials (Mina Mountain Pass en California) e inversión DARPA en procesamiento local.',
        provenReservesRank: 4,
        readinessMonths: 6,
      },
      {
        countryCode: 'CA',
        productionCapacityScore: 78,
        strategicAsset: 'Vital Metals (Nechalacho NWT) y Saskatchewan Research Council Rare Earth Processing Facility.',
        provenReservesRank: 5,
        readinessMonths: 12,
      },
      {
        countryCode: 'VN',
        productionCapacityScore: 68,
        strategicAsset: 'Reservas masivas en Nam Xe y acuerdos de cooperación con el bloque occidental.',
        provenReservesRank: 3,
        readinessMonths: 18,
      },
    ],
  },
  {
    id: 'graphite',
    name: 'Grafito Esférico y Natural para Ánodos',
    label: 'Grafito',
    category: 'Minerals',
    description: 'Material activo imprescindible de ánodos en baterías de litio, con cuotas controladas por licencias del gobierno de Pekín.',
    searchKeywords: ['grafito', 'graphite', 'ánodo', 'carbono esférico'],
    vulnerableOrigins: [
      {
        countryCode: 'CN',
        marketSharePercentage: 79,
        chokepointType: 'REFINING_BOTTLENECK',
        rationale: 'China extrae el 79% del grafito natural y controla el 95% del refinado de grafito esférico purificado (CSPG).',
      },
    ],
    viableSubstitutes: [
      {
        countryCode: 'CA',
        productionCapacityScore: 88,
        strategicAsset: 'Nouveau Monde Graphite (Matawinie & Bécancour en Quebec) y Northern Graphite (Lac des Iles).',
        provenReservesRank: 3,
        readinessMonths: 12,
      },
      {
        countryCode: 'AU',
        productionCapacityScore: 85,
        strategicAsset: 'Syrah Resources (con refinería Vidalia en Louisiana USMCA) y Renascor Resources (Siviour).',
        provenReservesRank: 2,
        readinessMonths: 6,
      },
      {
        countryCode: 'US',
        productionCapacityScore: 78,
        strategicAsset: 'Westwater Resources (Alabama Graphite) y Anovion (ánodos sintéticos subvencionados por el DOE).',
        provenReservesRank: 6,
        readinessMonths: 12,
      },
      {
        countryCode: 'NO',
        productionCapacityScore: 80,
        strategicAsset: 'Vianode en Herøya (producción de grafito sintético impulsada por energía hidroeléctrica de cero emisiones).',
        provenReservesRank: 5,
        readinessMonths: 6,
      },
      {
        countryCode: 'MZ',
        productionCapacityScore: 82,
        strategicAsset: 'Mina Balama de Syrah Resources en Cabo Delgado, el mayor yacimiento de grafito en copos fuera de China.',
        provenReservesRank: 1,
        readinessMonths: 0,
      },
    ],
  },
];
