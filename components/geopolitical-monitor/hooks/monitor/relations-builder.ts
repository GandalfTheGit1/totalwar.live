/**
 * components/dev/geopolitical-monitor/hooks/monitor/relations-builder.ts
 *
 * Pure function helper to resolve features and assemble active geopolitical relation graphs.
 */

import { GeoFeature, ActiveRelationsMap } from '../../types';
import { GeopoliticalKnowledgeService } from '@/lib/services/geopolitical-knowledge-service';

export function resolveIsoFromFeature(feat: GeoFeature): string | null {
  const rawIso = feat.properties?.ISO_A3;
  if (rawIso && rawIso !== '-99') return rawIso;
  return feat.properties?.ADM0_A3 || feat.properties?.SU_A3 || feat.properties?.ADMIN || null;
}

export function buildRealRelations(
  originPoly: GeoFeature,
  geoJsonData: GeoFeature[]
): ActiveRelationsMap {
  if (!originPoly) return {};
  const iso = resolveIsoFromFeature(originPoly);
  if (!iso) return {};

  const profile = GeopoliticalKnowledgeService.getCountryProfile(iso);
  if (!profile) return {};

  const newRelations: ActiveRelationsMap = {};
  const isoToPolyId = new Map<string, string>();

  geoJsonData.forEach((f) => {
    const fIso = resolveIsoFromFeature(f);
    if (fIso) {
      const code = GeopoliticalKnowledgeService.resolveCountryCode(fIso);
      if (code) isoToPolyId.set(code, f.polyId);
    }
  });

  profile.relations.forEach((edge) => {
    const otherCode = edge.countryA.code === profile.country.code
      ? edge.countryB.code
      : edge.countryA.code;
    const polyId = isoToPolyId.get(otherCode);

    if (polyId) {
      const targetPoly = geoJsonData.find((f) => f.polyId === polyId);
      if (targetPoly) {
        newRelations[polyId] = {
          type: edge.stance as any,
          polygon: targetPoly,
          frictionScore: edge.frictionScore,
          tariffRisk: edge.tariffRisk,
          chokepointRisk: edge.chokepointRisk,
          summaryNote: edge.summaryNote,
        };
      }
    }
  });

  return newRelations;
}
