/**
 * Tipos para el análisis de ciudad-juego educativo
 * Análisis de capital humano e infraestructura educativa como mecánicas de juego
 */

// ============================================
// Estructuras Geográficas
// ============================================

export interface GeographicRegion {
  id: string;
  name: string;
  type: 'country' | 'state' | 'province' | 'community' | 'city';
  parentId?: string; // Para jerarquía (estado -> país)
  iso3?: string; // Código ISO-3 para países
  population: number;
  areaSqKm: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// ============================================
// Edificios Educativos (Mecánica de Juego)
// ============================================

export interface EducationalBuilding {
  id: string;
  name: string;
  type: 'university' | 'technical_institute' | 'research_lab' | 'tech_park' | 'library';
  regionId: string;
  level: number; // Nivel de desarrollo (1-10 como en juegos)
  capacity: number; // Estudiantes/Capacidad
  foundedYear?: number;
  specialization: BuildingSpecialization;
  ownership: 'public' | 'private' | 'mixed';
  status: 'active' | 'under_construction' | 'planned' | 'abandoned';
}

export type BuildingSpecialization = 
  | 'stem_comprehensive' // Ingeniería, ciencias, tecnología
  | 'humanities_comprehensive' // Artes, ciencias sociales, humanidades
  | 'business_economics' // Negocios, economía
  | 'medical_health' // Medicina, salud
  | 'research_innovation' // I+D, patentes
  | 'vocational_technical' // Formación técnica profesional
  | 'mixed_general';

// ============================================
// Métricas de Capital Humano
// ============================================

export interface HumanCapitalMetrics {
  regionId: string;
  
  // Densidad educativa
  universitiesPerMillion: number;
  enrollmentRateTertiary: number; // % de población en educación superior
  publicPrivateRatio: number; // Ratio instituciones públicas vs privadas
  
  // Graduados por área (per cápita)
  stemGraduatesPerCapita: number;
  humanitiesGraduatesPerCapita: number;
  businessGraduatesPerCapita: number;
  totalGraduatesPerCapita: number;
  
  // Balance disciplinar
  stemToHumanitiesRatio: number;
  technologyOrientation: number; // 0-100 (100 = puramente tecnológico)
  
  // Infraestructura de I+D
  rdSpendingGdp: number; // % del PIB
  researchLabsPerRegion: number;
  patentsPerCapita: number;
  techParksCount: number;
}

// ============================================
// Análisis de Tendencia Ideológica
// ============================================

export interface IdeologicalTrendAnalysis {
  regionId: string;
  
  // Orientación educacional
  educationIdeologyScore: number; // -100 (izquierda extrema) a +100 (derecha extrema)
  ideologyLabel: 'far_left' | 'left' | 'center_left' | 'center' | 'center_right' | 'right' | 'far_right';
  
  // Factores contribuyentes
  stemInfluence: number; // Influencia de graduados STEM en política
  humanitiesInfluence: number; // Influencia de graduados humanidades
  academicActivism: number; // Nivel de activismo estudiantil histórico
  
  // Predicción de cambio climático
  politicalShiftProbability: number; // Probabilidad de cambio ideológico significativo
  shiftDirection: 'leftward' | 'rightward' | 'stable';
  
  // Impacto en negocios
  regulatoryRiskScore: number; // 0-100 riesgo de regulaciones progresistas
  innovationCapacityScore: number; // 0-100 capacidad de innovación tecnológica
}

// ============================================
// Nivel de Desarrollo Tecnológico
// ============================================

export interface TechnologicalDevelopment {
  regionId: string;
  
  // Puntuación compuesta
  techDevelopmentLevel: number; // 1-10 (como nivel en juego)
  techTier: 'primitive' | 'developing' | 'emerging' | 'advanced' | 'cutting_edge';
  
  // Componentes
  humanCapitalTech: number; // Capital humano tecnológico
  infrastructureTech: number; // Infraestructura tecnológica
  innovationEcosystem: number; // Ecosistema de innovación
  
  // Comparativas
  globalRank: number;
  regionalPercentile: number;
  
  // Trajectoria
  growthRate: number; // Tasa de crecimiento anual
  projectedLevel5Years: number; // Proyección a 5 años
}

// ============================================
// Tareas y Misiones del Juego
// ============================================

export interface GameTask {
  id: string;
  title: string;
  description: string;
  type: 'construction' | 'research' | 'analysis' | 'diplomacy';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  
  // Requisitos
  requiredBuildings: string[]; // IDs de edificios necesarios
  requiredMetrics: {
    metric: keyof HumanCapitalMetrics;
    threshold: number;
  }[];
  
  // Recompensas
  rewards: {
    xp: number;
    unlocks: string[]; // Edificios o capacidades desbloqueados
    insights: string[]; // Información desbloqueada sobre la región
  };
  
  // Estado
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  progress: number; // 0-100
}

// ============================================
// Estado del Juego por Región
// ============================================

export interface RegionGameState {
  regionId: string;
  regionName: string;
  
  // Edificios construidos
  buildings: EducationalBuilding[];
  buildingCapacity: number;
  buildingLevel: number; // Nivel promedio de edificios
  
  // Métricas educativas
  humanCapital: HumanCapitalMetrics;
  
  // Análisis político
  ideologicalTrend: IdeologicalTrendAnalysis;
  
  // Desarrollo tecnológico
  techDevelopment: TechnologicalDevelopment;
  
  // Progreso del juego
  currentLevel: number;
  xp: number;
  xpToNextLevel: number;
  
  // Tareas disponibles/completadas
  availableTasks: GameTask[];
  completedTasks: string[];
  
  // Logros desbloqueados
  achievements: Achievement[];
  
  // Última actualización
  lastUpdated: string;
}

// ============================================
// Logros del Juego
// ============================================

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon?: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// ============================================
// Comparativas Regionales (Leaderboard)
// ============================================

export interface RegionalLeaderboard {
  metric: 'universities' | 'stem_graduates' | 'rd_spending' | 'patents' | 'innovation';
  rankings: {
    regionId: string;
    regionName: string;
    value: number;
    rank: number;
    change: number; // Cambio respecto al período anterior
  }[];
}

// ============================================
// Datos de Fuentes Externas
// ============================================

export interface StatistaData {
  metric: string;
  country: string;
  year: number;
  value: number;
  source: 'statista';
}

export interface WikipediaUniversityData {
  name: string;
  location: string;
  founded?: number;
  type: string;
  students?: number;
  specializations: string[];
  source: 'wikipedia';
}

export interface TradingEconomicsData {
  indicator: string;
  country: string;
  value: number;
  timestamp: string;
  source: 'trading_economics';
}

// ============================================
// Mapa de Calor Educativo
// ============================================

export interface EducationHeatmapData {
  regionId: string;
  regionName: string;
  coordinates: { lat: number; lng: number };
  
  // Capas de calor
  universityDensity: number; // 0-100
  stemOrientation: number; // 0-100
  innovationCapacity: number; // 0-100
  ideologicalScore: number; // -100 a +100
  
  // Metadata
  population: number;
  lastUpdated: string;
}

// ============================================
// Respuestas de API
// ============================================

export interface CityGameAnalysisResponse {
  regionId: string;
  gameState: RegionGameState;
  heatmapData: EducationHeatmapData;
  leaderboard?: RegionalLeaderboard;
  insights: string[];
  dataSources: {
    statista: boolean;
    wikipedia: boolean;
    tradingEconomics: boolean;
    worldBank: boolean;
  };
}