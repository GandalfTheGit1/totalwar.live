/**
 * lib/data/tech-tree/definition.ts
 *
 * Versioned, fixed definition of the 10 Technology Tree areas and their objective unlock criteria.
 * Note: "Económico / fintech", percentage progress bars, and arbitrary game bonuses are removed by design.
 */

import { TechAreaDefinition, TechAreaId, TechTreeSchema } from './types';
import { TECH_TREE_CONFIG } from './config';

export const TECH_TREE_VERSION = TECH_TREE_CONFIG.version;

export const TECH_TREE_AREAS: TechAreaDefinition[] = [
  {
    id: 'semiconductors',
    nombre: 'Semiconductores',
    descripcion: 'Capacidad de fabricación física de circuitos integrados, fundición y herramientas litográficas.',
    niveles: [
      {
        id: 'semiconductors_1',
        areaId: 'semiconductors',
        nivel: 1,
        nombre: 'Ensamblaje y empaquetado',
        criterio: 'Hay plantas de ensamblaje y empaquetado de chips (OSAT) operativas en el país',
      },
      {
        id: 'semiconductors_2',
        areaId: 'semiconductors',
        nivel: 2,
        nombre: 'Fábrica madura',
        criterio: 'Producción comercial de obleas a 28 nm o nodos más antiguos en territorio nacional',
      },
      {
        id: 'semiconductors_3',
        areaId: 'semiconductors',
        nivel: 3,
        nombre: 'Fábrica avanzada',
        criterio: 'Producción comercial a 7 nm o menos (FinFET con DUV inmersión o EUV)',
      },
      {
        id: 'semiconductors_4',
        areaId: 'semiconductors',
        nivel: 4,
        nombre: 'Frontera',
        criterio: 'Producción comercial en masa a 3 nm o menos (GAA / FinFET extremo)',
      },
      {
        id: 'semiconductors_5',
        areaId: 'semiconductors',
        nivel: 5,
        nombre: 'Soberanía de herramientas',
        criterio: 'Litografía EUV o DUV de inmersión y óptica crítica de fabricación nacional',
      },
    ],
  },
  {
    id: 'ai_compute',
    nombre: 'IA y cómputo',
    descripcion: 'Supercomputación científica, clústeres de entrenamiento y modelos fundacionales soberanos.',
    niveles: [
      {
        id: 'ai_compute_1',
        areaId: 'ai_compute',
        nivel: 1,
        nombre: 'Centros de datos nacionales',
        criterio: 'Infraestructura nacional de centros de datos Tier III/IV e interconexión troncal',
      },
      {
        id: 'ai_compute_2',
        areaId: 'ai_compute',
        nivel: 2,
        nombre: 'Supercomputación TOP500',
        criterio: 'Al menos un supercomputador operativo certificado en la lista mundial TOP500',
      },
      {
        id: 'ai_compute_3',
        areaId: 'ai_compute',
        nivel: 3,
        nombre: 'Cómputo a gran escala / Petaescala-Exaescala',
        criterio: 'Sistemas en el top 10 de TOP500 (>100 PFLOPS / Exaescala) o clústeres >10.000 aceleradores IA',
      },
      {
        id: 'ai_compute_4',
        areaId: 'ai_compute',
        nivel: 4,
        nombre: 'Modelos fundacionales propios',
        criterio: 'Entrenamiento y despliegue de modelos fundacionales multimodales o LLM de frontera propios',
      },
      {
        id: 'ai_compute_5',
        areaId: 'ai_compute',
        nivel: 5,
        nombre: 'Soberanía de aceleradores y compiladores IA',
        criterio: 'Diseño nacional de chips aceleradores de IA de frontera y ecosistema de software propio',
      },
    ],
  },
  {
    id: 'space',
    nombre: 'Espacio',
    descripcion: 'Acceso autónomo a órbita, navegación satelital, vuelos tripulados y exploración profunda.',
    niveles: [
      {
        id: 'space_1',
        areaId: 'space',
        nivel: 1,
        nombre: 'Operación satelital nacional',
        criterio: 'Primer satélite artificial propio puesto en órbita y operado por el país',
      },
      {
        id: 'space_2',
        areaId: 'space',
        nivel: 2,
        nombre: 'Lanzamiento orbital autónomo',
        criterio: 'Lanzador orbital propio despega desde cosmódromo controlado y coloca carga en órbita',
      },
      {
        id: 'space_3',
        areaId: 'space',
        nivel: 3,
        nombre: 'Constelación GNSS o vuelo espacial tripulado',
        criterio: 'Constelación propia de posicionamiento (GPS/GLONASS/BeiDou/Galileo) o nave tripulada propia',
      },
      {
        id: 'space_4',
        areaId: 'space',
        nivel: 4,
        nombre: 'Estación orbital o alunizaje suave',
        criterio: 'Alunizaje controlado en la Luna/Marte o módulo de estación espacial permanente en órbita',
      },
      {
        id: 'space_5',
        areaId: 'space',
        nivel: 5,
        nombre: 'Lanzadores orbitales reutilizables',
        criterio: 'Recuperación y reutilización operativa de primera etapa orbital y megaconstelaciones LEO',
      },
    ],
  },
  {
    id: 'nuclear',
    nombre: 'Nuclear',
    descripcion: 'Fisión civil, ciclo de combustible nuclear, reactores avanzados y propulsión/fusión.',
    niveles: [
      {
        id: 'nuclear_1',
        areaId: 'nuclear',
        nivel: 1,
        nombre: 'Reactor de investigación',
        criterio: 'Primera criticidad en reactor nuclear de investigación en territorio nacional',
      },
      {
        id: 'nuclear_2',
        areaId: 'nuclear',
        nivel: 2,
        nombre: 'Generación electronuclear comercial',
        criterio: 'Central nuclear comercial conectada a la red eléctrica nacional',
      },
      {
        id: 'nuclear_3',
        areaId: 'nuclear',
        nivel: 3,
        nombre: 'Ciclo de enriquecimiento nacional',
        criterio: 'Capacidad industrial propia de enriquecimiento de uranio o reprocesamiento de combustible',
      },
      {
        id: 'nuclear_4',
        areaId: 'nuclear',
        nivel: 4,
        nombre: 'Reactores Gen III+/IV de diseño propio',
        criterio: 'Construcción de reactores de Generación III+ (AP1000, Hualong One, VVER-1200) o reproductores rápidos',
      },
      {
        id: 'nuclear_5',
        areaId: 'nuclear',
        nivel: 5,
        nombre: 'Propulsión naval nuclear o ignición de fusión',
        criterio: 'Reactores navales compactos operativos o demostración experimental de ganancia neta en fusión',
      },
    ],
  },
  {
    id: 'energy_batteries',
    nombre: 'Energía y baterías',
    descripcion: 'Almacenamiento electroquímico, procesado de minerales críticos y redes de ultra-alta tensión.',
    niveles: [
      {
        id: 'energy_batteries_1',
        areaId: 'energy_batteries',
        nivel: 1,
        nombre: 'Ensamblaje de módulos y packs',
        criterio: 'Plantas nacionales de ensamblaje de paneles solares y paquetes de baterías',
      },
      {
        id: 'energy_batteries_2',
        areaId: 'energy_batteries',
        nivel: 2,
        nombre: 'Gigafábricas de celdas Li-ion',
        criterio: 'Producción comercial de celdas de iones de litio a escala de gigavatios-hora (GWh)',
      },
      {
        id: 'energy_batteries_3',
        areaId: 'energy_batteries',
        nivel: 3,
        nombre: 'Refino de precursores y químicas LFP/NMC',
        criterio: 'Producción nacional de cátodos/ánodos de grado batería y celdas de alta densidad',
      },
      {
        id: 'energy_batteries_4',
        areaId: 'energy_batteries',
        nivel: 4,
        nombre: 'Transmisión UHV y almacenamiento de red masivo',
        criterio: 'Líneas de ultra-alta tensión (UHVDC/UHVAC ≥800 kV) y almacenamiento estacionario a escala GW',
      },
      {
        id: 'energy_batteries_5',
        areaId: 'energy_batteries',
        nivel: 5,
        nombre: 'Baterías de estado sólido y sodio en serie',
        criterio: 'Producción comercial de celdas de estado sólido/semisólido (>400 Wh/kg) o iones de sodio',
      },
    ],
  },
  {
    id: 'biotech',
    nombre: 'Biotecnología',
    descripcion: 'Síntesis farmacéutica, biológicos monoclonales, plataformas de ARNm y edición génica.',
    niveles: [
      {
        id: 'biotech_1',
        areaId: 'biotech',
        nivel: 1,
        nombre: 'Formulación de genéricos y vacunas clásicas',
        criterio: 'Plantas GMP nacionales para formulación de medicamentos esenciales y vacunas tradicionales',
      },
      {
        id: 'biotech_2',
        areaId: 'biotech',
        nivel: 2,
        nombre: 'Ingredientes activos (API) y biosimilares',
        criterio: 'Síntesis química nacional de principios activos (API) y aprobación regulatoria de biosimilares',
      },
      {
        id: 'biotech_3',
        areaId: 'biotech',
        nivel: 3,
        nombre: 'Fármacos biológicos y anticuerpos monoclonales',
        criterio: 'Descubrimiento y producción comercial de anticuerpos monoclonales originales',
      },
      {
        id: 'biotech_4',
        areaId: 'biotech',
        nivel: 4,
        nombre: 'Terapias de ARNm y edición génica CRISPR',
        criterio: 'Vacunas o terapias basadas en ARNm sintético o edición génica aprobadas para uso clínico',
      },
      {
        id: 'biotech_5',
        areaId: 'biotech',
        nivel: 5,
        nombre: 'Diseño de proteínas de novo y biofundición',
        criterio: 'Plataformas biodigitales de diseño de proteínas con IA y biofabricación automatizada',
      },
    ],
  },
  {
    id: 'telecom',
    nombre: 'Telecomunicaciones',
    descripcion: 'Redes móviles, equipamiento de radiofrecuencia (RAN), fibra submarina y enlaces satelitales.',
    niveles: [
      {
        id: 'telecom_1',
        areaId: 'telecom',
        nivel: 1,
        nombre: 'Red troncal de fibra y telefonía móvil',
        criterio: 'Cobertura nacional de red móvil digital y red troncal de fibra óptica',
      },
      {
        id: 'telecom_2',
        areaId: 'telecom',
        nivel: 2,
        nombre: 'Despliegue nacional 4G LTE',
        criterio: 'Red comercial 4G LTE de alta velocidad desplegada a escala nacional',
      },
      {
        id: 'telecom_3',
        areaId: 'telecom',
        nivel: 3,
        nombre: 'Red comercial 5G Standalone',
        criterio: 'Operación comercial de redes 5G con núcleo autónomo (Standalone)',
      },
      {
        id: 'telecom_4',
        areaId: 'telecom',
        nivel: 4,
        nombre: 'Fabricación soberana de equipos 5G RAN',
        criterio: 'Diseño y producción nacional de estaciones base 5G, módems y conmutadores ópticos',
      },
      {
        id: 'telecom_5',
        areaId: 'telecom',
        nivel: 5,
        nombre: 'Comunicaciones direct-to-cell y 6G experimental',
        criterio: 'Conectividad satelital directa a teléfono móvil o redes ópticas/terahercios pre-6G',
      },
    ],
  },
  {
    id: 'defense_missiles_drones',
    nombre: 'Defensa (misiles y drones)',
    descripcion: 'Sistemas no tripulados (UAV), misiles de precisión, defensa antiaérea y vectores hipersónicos.',
    niveles: [
      {
        id: 'defense_missiles_drones_1',
        areaId: 'defense_missiles_drones',
        nivel: 1,
        nombre: 'Drones tácticos ISR y munición guiada',
        criterio: 'Producción nacional de drones de reconocimiento táctico y artillería/munición guiada',
      },
      {
        id: 'defense_missiles_drones_2',
        areaId: 'defense_missiles_drones',
        nivel: 2,
        nombre: 'Misiles de crucero y defensa SAM propia',
        criterio: 'Fabricación nacional de misiles de crucero antibuque/ataque a tierra o baterías SAM medias',
      },
      {
        id: 'defense_missiles_drones_3',
        areaId: 'defense_missiles_drones',
        nivel: 3,
        nombre: 'UCAV MALE/HALE y defensa antimisiles',
        criterio: 'Drones de combate de gran altitud y sistemas de intercepción antibalística de largo alcance',
      },
      {
        id: 'defense_missiles_drones_4',
        areaId: 'defense_missiles_drones',
        nivel: 4,
        nombre: 'Munición merodeadora autónoma y cazas furtivos',
        criterio: 'Sistemas autónomos con guiado terminal asistido por IA o aviación furtiva de 5.ª generación',
      },
      {
        id: 'defense_missiles_drones_5',
        areaId: 'defense_missiles_drones',
        nivel: 5,
        nombre: 'Planeadores hipersónicos (HGV) e intercepción exoatmosférica',
        criterio: 'Despliegue operativo de vehículos hipersónicos maniobrables (Mach ≥5) o interceptores exoatmosféricos',
      },
    ],
  },
  {
    id: 'quantum',
    nombre: 'Cuántica',
    descripcion: 'Sensores cuánticos, criptografía cuántica (QKD) y procesadores cuánticos con corrección de errores.',
    niveles: [
      {
        id: 'quantum_1',
        areaId: 'quantum',
        nivel: 1,
        nombre: 'Relojes atómicos y sensores cuánticos',
        criterio: 'Laboratorios nacionales con relojes atómicos ópticos y magnetometría/gravimetría cuántica',
      },
      {
        id: 'quantum_2',
        areaId: 'quantum',
        nivel: 2,
        nombre: 'Distribución cuántica de claves (QKD)',
        criterio: 'Enlaces de comunicación cuántica segura por fibra o satélite demostrados',
      },
      {
        id: 'quantum_3',
        areaId: 'quantum',
        nivel: 3,
        nombre: 'Procesadores cuánticos programables (NISQ ≥50 qubits)',
        criterio: 'Ordenador cuántico nacional operativo con 50 o más qubits físicos programables',
      },
      {
        id: 'quantum_4',
        areaId: 'quantum',
        nivel: 4,
        nombre: 'Qubits lógicos con corrección de errores',
        criterio: 'Demostración experimental de qubits lógicos por debajo del umbral de corrección de errores',
      },
    ],
  },
  {
    id: 'robotics_manufacturing',
    nombre: 'Robótica y manufactura avanzada',
    descripcion: 'Máquinas-herramienta CNC multieje, robótica industrial, actuadores de precisión y fábricas autónomas.',
    niveles: [
      {
        id: 'robotics_manufacturing_1',
        areaId: 'robotics_manufacturing',
        nivel: 1,
        nombre: 'Automatización industrial y CNC básico',
        criterio: 'Integración de líneas robotizadas y producción de maquinaria CNC de 3 ejes',
      },
      {
        id: 'robotics_manufacturing_2',
        areaId: 'robotics_manufacturing',
        nivel: 2,
        nombre: 'Robots industriales articulados nacionales',
        criterio: 'Fabricación comercial nacional de brazos robóticos industriales de 6 ejes',
      },
      {
        id: 'robotics_manufacturing_3',
        areaId: 'robotics_manufacturing',
        nivel: 3,
        nombre: 'Soberanía en reductores, servomotores y CNC 5 ejes',
        criterio: 'Producción nacional de reductores armónicos/RV de ultra-precisión y centros CNC de 5 ejes',
      },
      {
        id: 'robotics_manufacturing_4',
        areaId: 'robotics_manufacturing',
        nivel: 4,
        nombre: 'Fábricas lights-out y manufactura aditiva aeroespacial',
        criterio: 'Plantas automatizadas de operación continua sin operarios e impresión 3D metálica certificada',
      },
      {
        id: 'robotics_manufacturing_5',
        areaId: 'robotics_manufacturing',
        nivel: 5,
        nombre: 'Robótica humanoide y encarnada en planta',
        criterio: 'Despliegue de robots bípedos/humanoides con control visuomotor por IA en líneas fabriles',
      },
    ],
  },
];

export const TECH_TREE_DEFINITION: TechTreeSchema = {
  version: TECH_TREE_VERSION,
  areas: TECH_TREE_AREAS,
};

export const TECH_AREA_BY_ID = new Map<TechAreaId, TechAreaDefinition>(
  TECH_TREE_AREAS.map((area) => [area.id, area])
);

export function getTechAreaDefinition(areaId: TechAreaId): TechAreaDefinition | undefined {
  return TECH_AREA_BY_ID.get(areaId);
}

export function getTechLevelDefinition(areaId: TechAreaId, nivel: number) {
  const area = TECH_AREA_BY_ID.get(areaId);
  if (!area) return undefined;
  return area.niveles.find((lvl) => lvl.nivel === nivel);
}
