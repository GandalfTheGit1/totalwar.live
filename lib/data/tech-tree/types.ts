/**
 * lib/data/tech-tree/types.ts
 *
 * Canonical types for the Historical Country Technology Tree (HoI4 style)
 * updated with verified events and multi-source news.
 * Registro ID: arbol-tecnologico-historico
 */

export type TechAreaId =
  | 'semiconductors'
  | 'ai_compute'
  | 'space'
  | 'nuclear'
  | 'energy_batteries'
  | 'biotech'
  | 'telecom'
  | 'defense_missiles_drones'
  | 'quantum'
  | 'robotics_manufacturing';

export type TechNodeStatus =
  | 'no_alcanzado'
  | 'anunciado'
  | 'prototipo'
  | 'produccion'
  | 'exportacion';

export type TechAcquisitionVia = 'propio' | 'licencia' | 'compra';

export type EvidenceLabel =
  | 'Hecho'
  | 'Inferencia'
  | 'Hipótesis'
  | 'Suposición'
  | 'Evidencia insuficiente';

export type TechEventOrigin = 'historico' | 'noticia_auto' | 'manual';

export interface TechLevelDefinition {
  id: string;
  areaId: TechAreaId;
  nivel: number;
  nombre: string;
  criterio: string;
}

export interface TechAreaDefinition {
  id: TechAreaId;
  nombre: string;
  descripcion: string;
  niveles: TechLevelDefinition[];
}

export interface TechTreeSchema {
  version: string;
  areas: TechAreaDefinition[];
}

export interface TechEventSource {
  nombre: string;
  url?: string;
  referencia?: string;
  agencia_origen?: string;
  tipo?: 'wikidata' | 'top500' | 'wipo' | 'unesco_oecd' | 'world_bank' | 'gdelt_news' | 'oficial';
}

export interface TechTreeEvent {
  id: string;
  pais: string; // ISO2 country code (e.g. 'US', 'CN', 'RU', 'JP', 'DE', 'TW', 'NL')
  area: TechAreaId;
  nivel: number;
  estado_nuevo: TechNodeStatus;
  via: TechAcquisitionVia;
  fecha_hecho: string; // YYYY or YYYY-MM-DD
  fecha_conocible: string; // YYYY or YYYY-MM-DD (prevents look-ahead bias)
  fuentes: TechEventSource[];
  etiqueta: EvidenceLabel;
  origen: TechEventOrigin;
  revertido: boolean;
  bloqueado_por_sancion?: boolean;
  retroceso?: boolean;
  resumen?: string;
  version_arbol?: string;
}

export interface ReconstructedNodeState {
  nodeId: string;
  areaId: TechAreaId;
  nivel: number;
  nombre: string;
  criterio: string;
  estado: TechNodeStatus;
  via: TechAcquisitionVia | null;
  bloqueado_por_sancion: boolean;
  retroceso: boolean;
  actualizado_por_noticias: boolean;
  fecha_hecho: string | null;
  fecha_conocible: string | null;
  fuentes: TechEventSource[];
  etiqueta: EvidenceLabel;
  origen: TechEventOrigin | null;
  ultimo_evento_id: string | null;
  resumen: string | null;
  historial_eventos: TechTreeEvent[];
}

export interface ReconstructedAreaState {
  areaId: TechAreaId;
  nombre: string;
  descripcion: string;
  maxNivelAlcanzado: number;
  scoreArea: number; // 0-100 deterministic score for this area
  nodos: ReconstructedNodeState[];
}

export interface ReconstructedCountryTechTree {
  pais: string;
  fechaCorte: string;
  version: string;
  isPilotCountry: boolean;
  hasVerifiedData: boolean;
  scoreTecnologico: number; // 0-100 deterministic aggregate score from nodes
  nodosBloqueadosPorSancion: ReconstructedNodeState[];
  nodosEnRetroceso: ReconstructedNodeState[];
  areas: Record<TechAreaId, ReconstructedAreaState>;
  listaAreas: ReconstructedAreaState[];
}

export interface AreaSpeedComparison {
  areaId: TechAreaId;
  nombreArea: string;
  maxNivelPaisA: number;
  maxNivelPaisB: number;
  anosPromedioEntreNivelesA: number | null;
  anosPromedioEntreNivelesB: number | null;
  ventajaNiveles: number; // maxNivelA - maxNivelB
}

export interface CountryTechComparison {
  paisA: string;
  paisB: string;
  fecha: string;
  scoreA: number;
  scoreB: number;
  anosPromedioGlobalA: number | null;
  anosPromedioGlobalB: number | null;
  areas: AreaSpeedComparison[];
}
