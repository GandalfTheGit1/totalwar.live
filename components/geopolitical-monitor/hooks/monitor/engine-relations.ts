/**
 * components/geopolitical-monitor/hooks/monitor/engine-relations.ts
 *
 * Bilateral relations from the scoring engine (GET /api/relations/[code]) turned into the ActiveRelationsMap the globe and the 2D map already paint.
 * Each band of R is mapped onto the existing relation types, so the current colours keep their meaning:
 *   ALLIED -> STRATEGIC_ALLY (green), PARTNER -> ECONOMIC_PARTNER (indigo), NEUTRAL -> NEUTRAL_COMMERCIAL (amber),
 *   TENSE -> FRICTION_STRATEGIC_COMPETITION (rose), HOSTILE / CONFLICT -> SANCTIONED_ADVERSARIAL (rose).
 * Pairs with no data (coverage 'none') are left out, so they stay grey ("sin datos") instead of looking neutral.
 */

import { GeoFeature, ActiveRelationsMap, RelationType } from '../../types';
import { resolveIsoFromFeature } from './relations-builder';
import { GeopoliticalKnowledgeService } from '@/lib/services/geopolitical-knowledge-service';
import type { CountryRelationsPayload, RelationBand } from '@/lib/services/bilateral-relations/types';

export const BAND_TO_TYPE: Record<RelationBand, RelationType> = {
  ALLIED: 'STRATEGIC_ALLY',
  PARTNER: 'ECONOMIC_PARTNER',
  NEUTRAL: 'NEUTRAL_COMMERCIAL',
  TENSE: 'FRICTION_STRATEGIC_COMPETITION',
  HOSTILE: 'SANCTIONED_ADVERSARIAL',
  CONFLICT: 'SANCTIONED_ADVERSARIAL',
};

export const BAND_LABEL_ES: Record<RelationBand, string> = {
  ALLIED: 'Aliados',
  PARTNER: 'Socios',
  NEUTRAL: 'Neutral',
  TENSE: 'Tensa',
  HOSTILE: 'Hostil',
  CONFLICT: 'Conflicto',
};

export async function fetchEngineRelations(polygon: GeoFeature): Promise<CountryRelationsPayload | null> {
  const iso = resolveIsoFromFeature(polygon);
  const code = iso ? GeopoliticalKnowledgeService.resolveCountryCode(iso) : null;
  if (!code) return null;
  try {
    const res = await fetch(`/api/relations/${code}`);
    if (!res.ok) return null;
    return (await res.json()) as CountryRelationsPayload;
  } catch {
    return null;
  }
}

export function buildEngineRelations(payload: CountryRelationsPayload, geoJsonData: GeoFeature[]): ActiveRelationsMap {
  const byCode = new Map(payload.partners.map((p) => [p.partner, p]));
  const out: ActiveRelationsMap = {};
  for (const f of geoJsonData) {
    const iso = resolveIsoFromFeature(f);
    const code = iso ? GeopoliticalKnowledgeService.resolveCountryCode(iso) : null;
    const p = code ? byCode.get(code) : undefined;
    if (!p || p.coverage === 'none') continue;
    out[f.polyId] = {
      type: BAND_TO_TYPE[p.band],
      polygon: f,
      summaryNote: `${BAND_LABEL_ES[p.band]} · R ${p.R > 0 ? '+' : ''}${Math.round(p.R)}`,
      score: p,
    };
  }
  return out;
}

let requestSeq = 0;

/**
 * Paints the curated relations at once (if any), then replaces them with the engine's scores when they arrive.
 * Only the latest request is applied: a newer selection or leaving the relations mode (cancelEngineRelations) discards older answers.
 */
export function loadRelations(
  polygon: GeoFeature,
  geoJsonData: GeoFeature[],
  setActiveRelations: (rel: ActiveRelationsMap) => void,
  curated: (polygon: GeoFeature, geoJsonData: GeoFeature[]) => ActiveRelationsMap
): Promise<void> {
  setActiveRelations(curated(polygon, geoJsonData));
  const token = ++requestSeq;
  return fetchEngineRelations(polygon).then((payload) => {
    if (payload && token === requestSeq) setActiveRelations(buildEngineRelations(payload, geoJsonData));
  });
}

export function cancelEngineRelations(): void {
  requestSeq++;
}
