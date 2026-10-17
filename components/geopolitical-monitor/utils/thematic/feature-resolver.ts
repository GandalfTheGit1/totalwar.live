/**
 * components/dev/geopolitical-monitor/utils/thematic/feature-resolver.ts
 *
 * Resolves thematic layer data for map feature polygons, GeoJSON properties, and mock data.
 */

import { GeoFeature, ThematicLayerCountryData, ThematicLayerMap } from '../../types';
import { GeopoliticalKnowledgeService } from '@/lib/services/geopolitical-knowledge-service';
import { findCountryByName } from '@/lib/data/all-198-countries';

export interface GeoFeatureInput {
  polyId?: string;
  id?: string;
  countryCode?: string;
  properties?: {
    ISO_A3?: string;
    ISO_A2?: string;
    ADM0_A3?: string;
    SU_A3?: string;
    ADMIN?: string;
    NAME?: string;
    name?: string;
    [key: string]: unknown;
  };
}

export type ResolvableFeature = GeoFeature | GeoFeatureInput | string | null | undefined;

function resolveByDirectString(nameOrCode: string, layerData: ThematicLayerMap): ThematicLayerCountryData | undefined {
  const clean = nameOrCode.trim();
  const upper = clean.toUpperCase();
  if (layerData[upper]) return layerData[upper];

  const resolvedByName = findCountryByName(clean);
  if (resolvedByName) {
    const byCode = layerData[resolvedByName.code.toUpperCase()];
    if (byCode) return byCode;
    const byIso3 = layerData[resolvedByName.iso3.toUpperCase()];
    if (byIso3) return byIso3;
  }

  const resolved = GeopoliticalKnowledgeService.resolveCountryCode(clean);
  if (resolved && layerData[resolved.toUpperCase()]) {
    return layerData[resolved.toUpperCase()];
  }
  return undefined;
}

function resolveByPolyId(feat: GeoFeature | GeoFeatureInput, layerData: ThematicLayerMap): ThematicLayerCountryData | undefined {
  const polyId = feat.polyId || ('id' in feat ? feat.id : undefined) || ('countryCode' in feat ? feat.countryCode : undefined);
  if (!polyId || typeof polyId !== 'string') return undefined;

  if (layerData[polyId]) return layerData[polyId];
  const upper = polyId.toUpperCase();
  if (layerData[upper]) return layerData[upper];
  return undefined;
}

function resolveByMockIso(
  feat: GeoFeature | GeoFeatureInput,
  layerData: ThematicLayerMap,
  countryMockData?: Record<string, { iso?: string }>
): ThematicLayerCountryData | undefined {
  const polyId = feat.polyId || ('id' in feat ? feat.id : undefined) || ('countryCode' in feat ? feat.countryCode : undefined);
  if (!countryMockData || !polyId || typeof polyId !== 'string') return undefined;

  const mockIso = countryMockData[polyId]?.iso;
  if (!mockIso) return undefined;

  const iso = String(mockIso).toUpperCase();
  if (layerData[iso]) return layerData[iso];

  const resolved = GeopoliticalKnowledgeService.resolveCountryCode(iso);
  if (resolved && layerData[resolved.toUpperCase()]) {
    return layerData[resolved.toUpperCase()];
  }
  return undefined;
}

function resolveByGeoProperties(feat: GeoFeature | GeoFeatureInput, layerData: ThematicLayerMap): ThematicLayerCountryData | undefined {
  const props = feat.properties;
  if (!props) return undefined;

  const candidateKeys = ['ISO_A3', 'ISO_A2', 'ADM0_A3', 'SU_A3'] as const;
  for (const key of candidateKeys) {
    const val = props[key];
    if (val && val !== '-99') {
      const upperIso = String(val).toUpperCase();
      if (layerData[upperIso]) return layerData[upperIso];
      const resolved = GeopoliticalKnowledgeService.resolveCountryCode(upperIso);
      if (resolved && layerData[resolved.toUpperCase()]) return layerData[resolved.toUpperCase()];
    }
  }

  const name = props.ADMIN || props.NAME || ('name' in props ? props.name : undefined);
  if (name && typeof name === 'string') {
    return resolveByDirectString(name, layerData);
  }

  return undefined;
}

/**
 * Resolves thematic layer data for a country feature using polyId, countryMockData, or feature properties.
 */
export function resolveThematicCountryData(
  feat: ResolvableFeature,
  layerData?: ThematicLayerMap,
  countryMockData?: Record<string, { iso?: string }>
): ThematicLayerCountryData | undefined {
  if (!feat || !layerData || Object.keys(layerData).length === 0) return undefined;

  if (typeof feat === 'string') {
    return resolveByDirectString(feat, layerData);
  }

  const fromPolyId = resolveByPolyId(feat, layerData);
  if (fromPolyId) return fromPolyId;

  const fromMock = resolveByMockIso(feat, layerData, countryMockData);
  if (fromMock) return fromMock;

  return resolveByGeoProperties(feat, layerData);
}
