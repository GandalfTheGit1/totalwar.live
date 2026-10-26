/**
 * lib/data/tech-tree/wikidata-parser.ts
 *
 * Parser and validator for Wikidata SPARQL JSON responses into TechTreeEvent records.
 * Fails fast and loudly with descriptive errors if the response structure or bindings are broken.
 */

import {
  TechAcquisitionVia,
  TechAreaId,
  TechNodeStatus,
  TechTreeEvent,
} from './types';
import { validateTechEvent } from './event-log';
import { TECH_TREE_VERSION } from './definition';

export interface WikidataSparqlResponse {
  head?: {
    vars?: string[];
  };
  results?: {
    bindings?: Array<Record<string, { type: string; value: string }>>;
  };
}

function extractIsoDate(isoDateTime: string, contextId: string): string {
  const match = String(isoDateTime || '').match(/^(\d{4}-\d{2}-\d{2})/);
  if (!match) {
    throw new Error(
      `Malformed Wikidata date '${String(isoDateTime)}' in binding '${contextId}'.`
    );
  }
  return match[1];
}

function extractWikidataQid(uri: string): string {
  const match = String(uri || '').match(/(Q\d+)$/);
  if (!match) {
    throw new Error(`Malformed Wikidata entity URI '${String(uri)}': missing QID.`);
  }
  return match[1];
}

/**
 * Parses a Wikidata SPARQL JSON response into validated TechTreeEvent records.
 */
export function parseWikidataTechResponse(raw: unknown): TechTreeEvent[] {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid Wikidata response: payload must be a non-null JSON object.');
  }

  const data = raw as WikidataSparqlResponse;
  if (!data.head || !Array.isArray(data.head.vars)) {
    throw new Error("Invalid Wikidata response: missing 'head.vars' array.");
  }
  if (!data.results || !Array.isArray(data.results.bindings)) {
    throw new Error("Invalid Wikidata response: missing 'results.bindings' array.");
  }

  const events: TechTreeEvent[] = [];

  for (let i = 0; i < data.results.bindings.length; i++) {
    const row = data.results.bindings[i];
    if (!row || typeof row !== 'object') {
      throw new Error(`Invalid Wikidata binding at index ${i}: binding is not an object.`);
    }

    const itemUri = row.item?.value;
    const itemLabel = row.itemLabel?.value;
    const countryCode = row.countryCode?.value;
    const areaId = row.areaId?.value as TechAreaId;
    const nivelRaw = row.nivel?.value;
    const estado = (row.estado?.value || 'produccion') as TechNodeStatus;
    const via = (row.via?.value || 'propio') as TechAcquisitionVia;
    const inceptionRaw = row.inceptionDate?.value;
    const pubRaw = row.publicationDate?.value || inceptionRaw;

    if (!itemUri || !itemLabel || !countryCode || !areaId || !nivelRaw || !inceptionRaw) {
      throw new Error(
        `Incomplete Wikidata binding at index ${i}: required fields (item, itemLabel, countryCode, areaId, nivel, inceptionDate) are missing.`
      );
    }

    const qid = extractWikidataQid(itemUri);
    const nivel = Number(nivelRaw);
    if (!Number.isInteger(nivel)) {
      throw new Error(`Invalid level '${nivelRaw}' in Wikidata binding '${qid}'.`);
    }

    const fecha_hecho = extractIsoDate(inceptionRaw, qid);
    const fecha_conocible = extractIsoDate(pubRaw!, qid);

    const event: TechTreeEvent = {
      id: `wd_${countryCode.toLowerCase()}_${areaId}_lvl${nivel}_${qid.toLowerCase()}`,
      pais: countryCode.toUpperCase(),
      area: areaId,
      nivel,
      estado_nuevo: estado,
      via,
      fecha_hecho,
      fecha_conocible,
      fuentes: [
        {
          nombre: `Wikidata ${qid} (${itemLabel})`,
          url: `https://www.wikidata.org/wiki/${qid}`,
          referencia: qid,
          tipo: 'wikidata',
        },
      ],
      etiqueta: 'Hecho',
      origen: 'historico',
      revertido: false,
      resumen: itemLabel,
      version_arbol: TECH_TREE_VERSION,
    };

    validateTechEvent(event);
    events.push(event);
  }

  return events;
}
