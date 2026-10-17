/**
 * Escenarios y presets preconfigurados para simulación táctica.
 */

import { ChokepointSimulationPreset } from './types';

export const CHOKEPOINT_PRESETS: ChokepointSimulationPreset[] = [
  {
    id: 'baseline-open',
    name: 'Operación Normal (0 Bloqueados)',
    nameEs: 'Operación Normal (Todos Abiertos)',
    description: 'Todas las rutas marítimas principales y los 6 estrechos operan con normalidad.',
    blockedChokepoints: [],
    recommendedSector: 'AUTOMOTIVE_PARTS',
  },
  {
    id: 'red-sea-crisis',
    name: 'Crisis del Mar Rojo (Suez + Bab el-Mandeb)',
    nameEs: 'Crisis del Mar Rojo (Suez + Bab el-Mandeb)',
    description: 'Cierre del eje Mar Rojo obligando al desvío por el Cabo de Buena Esperanza hacia Europa.',
    blockedChokepoints: ['suez', 'bab_el_mandeb'],
    recommendedSector: 'RETAIL_CONSUMER_GOODS',
  },
  {
    id: 'hormuz-oil-shock',
    name: 'Shock Petrolero en Ormuz',
    nameEs: 'Shock Petrolero en Ormuz',
    description: 'Bloqueo naval en el Golfo Pérsico atrapando el 21% del petróleo y el GNL mundial.',
    blockedChokepoints: ['hormuz'],
    recommendedSector: 'ENERGY_PETROCHEMICALS',
  },
  {
    id: 'pacific-dual-choke',
    name: 'Pinza del Pacífico (Malaca + Panamá)',
    nameEs: 'Pinza del Pacífico (Malaca + Panamá)',
    description: 'Disrupción simultánea en el sudeste asiático y el canal interoceánico americano.',
    blockedChokepoints: ['malacca', 'panama'],
    recommendedSector: 'SEMICONDUCTORS_AI',
  },
  {
    id: 'global-chokepoint-blackout',
    name: 'Bloqueo Marítimo Total (6/6 Estrechos)',
    nameEs: 'Colapso Logístico Global (6 Bloqueados)',
    description: 'Escenario catastrófico de guerra global y parálisis de los 6 cuellos de botella estratégicos.',
    blockedChokepoints: ['hormuz', 'malacca', 'suez', 'bab_el_mandeb', 'panama', 'bosporus'],
    recommendedSector: 'AUTOMOTIVE_PARTS',
  },
];
