/**
 * Líneas troncales y rutas de contingencia del comercio marítimo mundial.
 */

import { MaritimeTradeRoute } from './types';

export const GLOBAL_MARITIME_ROUTES: MaritimeTradeRoute[] = [
  {
    id: 'route-asia-europe-suez',
    name: 'Asia-Europe Main Lane (via Suez)',
    nameEs: 'Corredor Asia-Europa (vía Suez)',
    waypoints: [
      [121.5, 31.2],   // Shanghai
      [114.2, 22.3],   // Hong Kong
      [103.89, 1.43],  // Estrecho de Malaca
      [79.8, 6.9],     // Colombo (Sri Lanka)
      [60.0, 12.0],    // Mar Arábigo
      [43.33, 12.58],  // Bab el-Mandeb
      [38.0, 22.0],    // Mar Rojo
      [32.34, 30.70],  // Canal de Suez
      [18.0, 35.0],    // Mediterráneo Central
      [-5.3, 36.1],    // Gibraltar
      [4.4, 51.9],     // Rotterdam / Norte de Europa
    ],
    primaryChokepoints: ['malacca', 'bab_el_mandeb', 'suez'],
    volumeSharePct: 32,
    description: 'Ruta troncal de contenedores que une las fábricas de Asia Oriental con los mercados europeos.',
  },
  {
    id: 'route-persian-gulf-energy',
    name: 'Persian Gulf Energy Artery',
    nameEs: 'Arteria Petrolera del Golfo Pérsico (Ormuz)',
    waypoints: [
      [50.5, 27.0],    // Ras Tanura (Arabia Saudí)
      [56.25, 26.56],  // Estrecho de Ormuz
      [59.0, 24.0],    // Golfo de Omán
      [70.0, 15.0],    // Mar Arábigo
      [95.0, 6.0],     // Entrada a Malaca
      [103.89, 1.43],  // Malaca (hacia Asia Oriental)
    ],
    primaryChokepoints: ['hormuz', 'malacca'],
    volumeSharePct: 21,
    description: 'Flujo crítico de crudo y GNL desde el Golfo Pérsico hacia Japón, China, Corea e India.',
  },
  {
    id: 'route-transpacific',
    name: 'Transpacific Eastbound (Asia to US West Coast)',
    nameEs: 'Corredor Transpacífico (Asia - Costa Oeste EE. UU.)',
    waypoints: [
      [121.5, 31.2],   // Shanghai
      [140.0, 35.0],   // Tokio / Yokohama
      [175.0, 38.0],   // Pacífico Norte Central
      [-160.0, 38.0],  // Pacífico Central
      [-135.0, 36.0],  // Aproximación California
      [-118.2, 33.7],  // Los Ángeles / Long Beach
    ],
    primaryChokepoints: [],
    volumeSharePct: 26,
    description: 'Mayor corredor de comercio bilateral mundial de bienes tecnológicos y de consumo masivo.',
  },
  {
    id: 'route-transatlantic',
    name: 'Transatlantic Trade Lane (Europe to US East Coast)',
    nameEs: 'Corredor Transatlántico (Europa - Costa Este EE. UU.)',
    waypoints: [
      [4.4, 51.9],     // Rotterdam
      [-5.0, 48.0],    // Salida Canal de la Mancha
      [-25.0, 46.0],   // Atlántico Norte
      [-50.0, 42.0],   // Bancos de Terranova
      [-74.0, 40.7],   // Nueva York / Nueva Jersey
    ],
    primaryChokepoints: [],
    volumeSharePct: 14,
    description: 'Intercambio de bienes de capital, automoción y productos químicos especializados.',
  },
  {
    id: 'route-panama-interoceanic',
    name: 'Panama Interoceanic Lane (US East / Gulf to Pacific)',
    nameEs: 'Corredor Interoceánico Canal de Panamá',
    waypoints: [
      [-95.0, 29.5],   // Houston / Golfo de México
      [-82.0, 22.0],   // Estrecho de Florida
      [-79.68, 9.08],  // Canal de Panamá
      [-85.0, 5.0],    // Pacífico Este
      [-118.2, 33.7],  // Los Ángeles
    ],
    primaryChokepoints: ['panama'],
    volumeSharePct: 11,
    description: 'Vía clave para granos agrícolas, GNL y contenedores entre la costa este de EE. UU. y Asia.',
  },
  {
    id: 'route-black-sea-bosporus',
    name: 'Black Sea Grain & Oil Corridor (Bosporus)',
    nameEs: 'Corredor Cerealero & Petrolero del Mar Negro (Bósforo)',
    waypoints: [
      [30.7, 46.5],    // Odesa (Ucrania)
      [37.8, 44.7],    // Novorossiysk (Rusia)
      [29.07, 41.11],  // Estrecho del Bósforo
      [25.0, 38.0],    // Mar Egeo
      [18.0, 35.0],    // Mediterráneo Central
    ],
    primaryChokepoints: ['bosporus'],
    volumeSharePct: 7,
    description: 'Paso obligado para trigo, girasol, fertilizantes y crudo kazajo/ruso hacia el mundo.',
  },
  {
    id: 'route-reroute-cape-good-hope',
    name: 'Cape of Good Hope Contingency Route',
    nameEs: 'Ruta de Desvío por el Cabo de Buena Esperanza',
    waypoints: [
      [79.8, 6.9],     // Océano Índico (Sri Lanka)
      [55.0, -10.0],   // Madagascar Norte
      [18.5, -34.5],   // Cabo de Buena Esperanza (Sudáfrica)
      [-5.0, -15.0],   // Atlántico Sur
      [-15.0, 10.0],   // África Occidental
      [-15.0, 28.0],   // Islas Canarias
      [-5.3, 36.1],    // Gibraltar
      [4.4, 51.9],     // Rotterdam
    ],
    primaryChokepoints: [],
    volumeSharePct: 0,
    description: 'Ruta de contingencia activada cuando Suez o Bab el-Mandeb están bloqueados (+14 días).',
  },
  {
    id: 'route-reroute-cape-horn',
    name: 'Cape Horn Contingency Route (Panama Bypass)',
    nameEs: 'Ruta de Desvío por el Cabo de Hornos (Bypass de Panamá)',
    waypoints: [
      [-75.0, 35.0],   // Costa Este EE. UU.
      [-40.0, 0.0],    // Atlántico Tropical
      [-38.0, -20.0],  // Brasil
      [-68.0, -55.0],  // Cabo de Hornos / Magallanes
      [-75.0, -35.0],  // Chile Pacífico
      [-85.0, 5.0],    // Pacífico Ecuatorial
      [-118.2, 33.7],  // California
    ],
    primaryChokepoints: [],
    volumeSharePct: 0,
    description: 'Ruta de circunnavegación extrema activada ante colapso del Canal de Panamá (+18 días).',
  },
];
