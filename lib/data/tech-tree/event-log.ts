/**
 * lib/data/tech-tree/event-log.ts
 *
 * Event log validation, deterministic point-in-time tree reconstruction (stateAt),
 * node-based score calculation, and bilateral country speed comparison.
 */

import {
  EvidenceLabel,
  ReconstructedAreaState,
  ReconstructedCountryTechTree,
  ReconstructedNodeState,
  TechAreaId,
  TechNodeStatus,
  TechTreeEvent,
  CountryTechComparison,
  AreaSpeedComparison,
} from './types';
import { TECH_AREA_BY_ID, TECH_TREE_AREAS, TECH_TREE_VERSION } from './definition';
import { isPilotCountryCode, TECH_TREE_CONFIG } from './config';

export const STATUS_RANK: Record<TechNodeStatus, number> = {
  no_alcanzado: 0,
  anunciado: 1,
  prototipo: 2,
  produccion: 3,
  exportacion: 4,
};

export const VALID_EVIDENCE_LABELS: ReadonlySet<EvidenceLabel> = new Set<EvidenceLabel>([
  'Hecho',
  'Inferencia',
  'Hipótesis',
  'Suposición',
  'Evidencia insuficiente',
]);

/**
 * Normalizes a year or ISO date into 'YYYY-MM-DD' for start-of-event comparison.
 */
export function normalizeEventDate(dateInput: string | number): string {
  const raw = String(dateInput ?? '').trim();
  if (/^\d{4}$/.test(raw)) {
    return `${raw}-01-01`;
  }
  if (/^\d{4}-\d{2}$/.test(raw)) {
    return `${raw}-01`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }
  throw new Error(`Invalid date format '${raw}'. Expected YYYY or YYYY-MM-DD.`);
}

/**
 * Normalizes a query cutoff date (if a year like 2015 is given, includes the full year '2015-12-31').
 */
export function normalizeCutoffDate(dateInput: string | number): string {
  const raw = String(dateInput ?? '').trim();
  if (/^\d{4}$/.test(raw)) {
    return `${raw}-12-31`;
  }
  if (/^\d{4}-\d{2}$/.test(raw)) {
    return `${raw}-31`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }
  throw new Error(`Invalid cutoff date format '${raw}'. Expected YYYY or YYYY-MM-DD.`);
}

/**
 * Extracts numeric year (e.g. 2015.5 or 2015) from an ISO date string.
 */
export function extractNumericYear(dateStr: string): number {
  const normalized = normalizeEventDate(dateStr);
  const [y, m, d] = normalized.split('-').map(Number);
  return y + ((m - 1) * 30 + (d - 1)) / 365;
}

/**
 * Strictly validates a single TechTreeEvent.
 * Throws a descriptive error if area/level does not exist or if source/label are missing.
 */
export function validateTechEvent(event: TechTreeEvent): void {
  if (!event || typeof event !== 'object') {
    throw new Error('Invalid tech tree event: event must be an object.');
  }
  if (!event.id || typeof event.id !== 'string' || !event.id.trim()) {
    throw new Error('Invalid tech tree event: missing event id.');
  }
  if (!event.pais || typeof event.pais !== 'string' || !event.pais.trim()) {
    throw new Error(`Invalid tech tree event '${event.id}': missing 'pais'.`);
  }

  const areaDef = TECH_AREA_BY_ID.get(event.area);
  if (!areaDef) {
    throw new Error(
      `Invalid tech tree area '${String(event.area)}' in event '${event.id}'.`
    );
  }

  const levelDef = areaDef.niveles.find((l) => l.nivel === event.nivel);
  if (!levelDef) {
    throw new Error(
      `Invalid tech tree level: area '${event.area}' does not have level ${String(
        event.nivel
      )} (event '${event.id}'). Valid levels are 1..${areaDef.niveles.length}.`
    );
  }

  if (!(event.estado_nuevo in STATUS_RANK)) {
    throw new Error(
      `Invalid node status '${String(event.estado_nuevo)}' in event '${event.id}'.`
    );
  }

  if (!event.etiqueta || !VALID_EVIDENCE_LABELS.has(event.etiqueta)) {
    throw new Error(
      `Missing or invalid evidence label ('etiqueta') in event '${event.id}'.`
    );
  }

  if (!Array.isArray(event.fuentes) || event.fuentes.length === 0) {
    throw new Error(
      `Missing sources ('fuentes') in event '${event.id}': every event must have at least one verified source.`
    );
  }

  for (const src of event.fuentes) {
    if (!src || typeof src.nombre !== 'string' || !src.nombre.trim()) {
      throw new Error(
        `Invalid source in event '${event.id}': every source must include a non-empty 'nombre'.`
      );
    }
  }

  normalizeEventDate(event.fecha_hecho);
  normalizeEventDate(event.fecha_conocible);

  if (
    event.origen === 'noticia_auto' &&
    STATUS_RANK[event.estado_nuevo] > STATUS_RANK[TECH_TREE_CONFIG.autoNews.maxAllowedAutoStatus]
  ) {
    throw new Error(
      `Auto news event '${event.id}' cannot set status '${event.estado_nuevo}' above '${TECH_TREE_CONFIG.autoNews.maxAllowedAutoStatus}'.`
    );
  }
}

/**
 * Validates an entire array of TechTreeEvents.
 */
export function validateEventLog(events: TechTreeEvent[]): void {
  const seenIds = new Set<string>();
  for (const ev of events) {
    validateTechEvent(ev);
    if (seenIds.has(ev.id)) {
      throw new Error(`Duplicate event id '${ev.id}' in tech tree event log.`);
    }
    seenIds.add(ev.id);
  }
}

/**
 * Calculates the 0-100 score for a single reconstructed area based on its nodes.
 * Uses the highest reached node progression ((nivel - 1 + statusWeight) / totalLevels)
 * minus penalties for nodes under active sanction or regression.
 */
export function calculateAreaScore(nodos: ReconstructedNodeState[]): number {
  if (nodos.length === 0) return 0;

  const totalLevels = nodos.length;
  let maxProgression = 0;
  let sanctionPenalty = 0;
  let regressionPenalty = 0;

  for (const nodo of nodos) {
    const statusWeight = TECH_TREE_CONFIG.statusWeights[nodo.estado] ?? 0;
    if (statusWeight > 0) {
      const nodeProgression = (nodo.nivel - 1 + statusWeight) / totalLevels;
      if (nodeProgression > maxProgression) {
        maxProgression = nodeProgression;
      }
    }
    if (nodo.bloqueado_por_sancion) {
      sanctionPenalty += 0.08;
    }
    if (nodo.retroceso) {
      regressionPenalty += 0.12;
    }
  }

  const netRatio = Math.max(0, maxProgression - sanctionPenalty - regressionPenalty);
  return Math.round(Math.max(0, Math.min(100, netRatio * 100)));
}

export interface StateAtOptions {
  /**
   * When true, also requires event.fecha_conocible <= fechaCorte to prevent look-ahead bias.
   */
  enforceKnowableDate?: boolean;
}

/**
 * Reconstructs the complete technology tree state for a country at a given year/date
 * using only non-reverted events with fecha_hecho <= fecha.
 */
export function stateAt(
  pais: string,
  fecha: number | string,
  events: TechTreeEvent[],
  options?: StateAtOptions
): ReconstructedCountryTechTree {
  const cleanCountry = (pais || '').trim().toUpperCase();
  if (!cleanCountry) {
    throw new Error('Country code (pais) is required for stateAt.');
  }

  const cutoff = normalizeCutoffDate(fecha);

  // Validate all events in the log (especially for this country) so malformed events fail fast
  for (const ev of events) {
    validateTechEvent(ev);
  }

  const applicableEvents = events
    .map((ev, index) => ({ ev, index }))
    .filter(({ ev }) => {
      if (ev.pais.trim().toUpperCase() !== cleanCountry) return false;
      if (ev.revertido) return false;
      const hechoDate = normalizeEventDate(ev.fecha_hecho);
      if (hechoDate > cutoff) return false;
      if (options?.enforceKnowableDate) {
        const conocibleDate = normalizeEventDate(ev.fecha_conocible);
        if (conocibleDate > cutoff) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = normalizeEventDate(a.ev.fecha_hecho);
      const dateB = normalizeEventDate(b.ev.fecha_hecho);
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      const knowA = normalizeEventDate(a.ev.fecha_conocible);
      const knowB = normalizeEventDate(b.ev.fecha_conocible);
      if (knowA !== knowB) return knowA.localeCompare(knowB);
      return a.index - b.index;
    })
    .map(({ ev }) => ev);

  const areasRecord = {} as Record<TechAreaId, ReconstructedAreaState>;
  const listaAreas: ReconstructedAreaState[] = [];
  const nodosBloqueadosPorSancion: ReconstructedNodeState[] = [];
  const nodosEnRetroceso: ReconstructedNodeState[] = [];

  for (const areaDef of TECH_TREE_AREAS) {
    const nodos: ReconstructedNodeState[] = areaDef.niveles.map((lvlDef) => ({
      nodeId: lvlDef.id,
      areaId: areaDef.id,
      nivel: lvlDef.nivel,
      nombre: lvlDef.nombre,
      criterio: lvlDef.criterio,
      estado: 'no_alcanzado',
      via: null,
      bloqueado_por_sancion: false,
      retroceso: false,
      actualizado_por_noticias: false,
      fecha_hecho: null,
      fecha_conocible: null,
      fuentes: [],
      etiqueta: 'Evidencia insuficiente',
      origen: null,
      ultimo_evento_id: null,
      resumen: null,
      historial_eventos: [],
    }));

    for (const ev of applicableEvents) {
      if (ev.area !== areaDef.id) continue;
      const targetNode = nodos.find((n) => n.nivel === ev.nivel);
      if (!targetNode) continue;

      const prevRank = STATUS_RANK[targetNode.estado];
      const nextRank = STATUS_RANK[ev.estado_nuevo];

      // A non-regression automatic news event is capped at 'prototipo' by policy;
      // it must never downgrade a node already at 'produccion' or 'exportacion' or trigger a false retroceso.
      const isAutoCappedNonRegression =
        ev.origen === 'noticia_auto' &&
        ev.retroceso !== true &&
        prevRank > nextRank;

      if (!isAutoCappedNonRegression) {
        if (ev.retroceso === true || (prevRank > 0 && nextRank < prevRank)) {
          targetNode.retroceso = true;
        } else if (ev.retroceso === false || nextRank > prevRank) {
          targetNode.retroceso = Boolean(ev.retroceso);
        }
        targetNode.estado = ev.estado_nuevo;
        targetNode.via = ev.via;
        targetNode.fecha_hecho = ev.fecha_hecho;
        targetNode.fecha_conocible = ev.fecha_conocible;
        targetNode.fuentes = [...ev.fuentes];
        targetNode.etiqueta = ev.etiqueta;
        targetNode.resumen = ev.resumen ?? null;
      } else {
        targetNode.fuentes = [...targetNode.fuentes, ...ev.fuentes];
      }

      if (typeof ev.bloqueado_por_sancion === 'boolean') {
        targetNode.bloqueado_por_sancion = ev.bloqueado_por_sancion;
      }

      targetNode.origen = ev.origen;
      targetNode.actualizado_por_noticias =
        targetNode.actualizado_por_noticias || ev.origen === 'noticia_auto';
      targetNode.ultimo_evento_id = ev.id;
      targetNode.historial_eventos.push(ev);
    }

    let maxNivelAlcanzado = 0;
    for (const nodo of nodos) {
      if (STATUS_RANK[nodo.estado] >= STATUS_RANK.prototipo) {
        maxNivelAlcanzado = Math.max(maxNivelAlcanzado, nodo.nivel);
      }
      if (nodo.bloqueado_por_sancion) {
        nodosBloqueadosPorSancion.push(nodo);
      }
      if (nodo.retroceso) {
        nodosEnRetroceso.push(nodo);
      }
    }

    const scoreArea = calculateAreaScore(nodos);
    const areaState: ReconstructedAreaState = {
      areaId: areaDef.id,
      nombre: areaDef.nombre,
      descripcion: areaDef.descripcion,
      maxNivelAlcanzado,
      scoreArea,
      nodos,
    };

    areasRecord[areaDef.id] = areaState;
    listaAreas.push(areaState);
  }

  const totalScore =
    listaAreas.length > 0
      ? Math.round(
          listaAreas.reduce((acc, a) => acc + a.scoreArea, 0) / listaAreas.length
        )
      : 0;

  const isPilot = isPilotCountryCode(cleanCountry);
  const hasVerifiedData = isPilot && applicableEvents.length > 0;

  return {
    pais: cleanCountry,
    fechaCorte: cutoff,
    version: TECH_TREE_VERSION,
    isPilotCountry: isPilot,
    hasVerifiedData,
    scoreTecnologico: hasVerifiedData ? totalScore : 0,
    nodosBloqueadosPorSancion,
    nodosEnRetroceso,
    areas: areasRecord,
    listaAreas,
  };
}

/**
 * Computes the average years between consecutive unlocked levels in an area.
 */
export function computeAreaSpeedYears(areaState: ReconstructedAreaState): number | null {
  const datedNodes = areaState.nodos
    .filter((n) => n.estado !== 'no_alcanzado' && n.fecha_hecho)
    .sort((a, b) => a.nivel - b.nivel);

  if (datedNodes.length < 2) return null;

  const intervals: number[] = [];
  for (let i = 1; i < datedNodes.length; i++) {
    const prevYear = extractNumericYear(datedNodes[i - 1].fecha_hecho!);
    const currYear = extractNumericYear(datedNodes[i].fecha_hecho!);
    const levelSpan = Math.max(1, datedNodes[i].nivel - datedNodes[i - 1].nivel);
    const diff = Math.max(0, (currYear - prevYear) / levelSpan);
    intervals.push(diff);
  }

  if (intervals.length === 0) return null;
  const avg = intervals.reduce((s, v) => s + v, 0) / intervals.length;
  return Number(avg.toFixed(1));
}

/**
 * Compares two countries side-by-side at a given date and measures their advancement speed (years between levels).
 */
export function compareCountriesTech(
  paisA: string,
  paisB: string,
  fecha: number | string,
  events: TechTreeEvent[]
): CountryTechComparison {
  const treeA = stateAt(paisA, fecha, events);
  const treeB = stateAt(paisB, fecha, events);

  const areaComparisons: AreaSpeedComparison[] = TECH_TREE_AREAS.map((areaDef) => {
    const areaA = treeA.areas[areaDef.id];
    const areaB = treeB.areas[areaDef.id];
    return {
      areaId: areaDef.id,
      nombreArea: areaDef.nombre,
      maxNivelPaisA: areaA.maxNivelAlcanzado,
      maxNivelPaisB: areaB.maxNivelAlcanzado,
      anosPromedioEntreNivelesA: computeAreaSpeedYears(areaA),
      anosPromedioEntreNivelesB: computeAreaSpeedYears(areaB),
      ventajaNiveles: areaA.maxNivelAlcanzado - areaB.maxNivelAlcanzado,
    };
  });

  const validSpeedsA = areaComparisons
    .map((c) => c.anosPromedioEntreNivelesA)
    .filter((v): v is number => v !== null);
  const validSpeedsB = areaComparisons
    .map((c) => c.anosPromedioEntreNivelesB)
    .filter((v): v is number => v !== null);

  return {
    paisA: treeA.pais,
    paisB: treeB.pais,
    fecha: treeA.fechaCorte,
    scoreA: treeA.scoreTecnologico,
    scoreB: treeB.scoreTecnologico,
    anosPromedioGlobalA:
      validSpeedsA.length > 0
        ? Number((validSpeedsA.reduce((s, v) => s + v, 0) / validSpeedsA.length).toFixed(1))
        : null,
    anosPromedioGlobalB:
      validSpeedsB.length > 0
        ? Number((validSpeedsB.reduce((s, v) => s + v, 0) / validSpeedsB.length).toFixed(1))
        : null,
    areas: areaComparisons,
  };
}
