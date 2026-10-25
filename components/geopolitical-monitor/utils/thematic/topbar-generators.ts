/**
 * utils/thematic/topbar-generators.ts
 *
 * Map layers driven by the top information bar: military ranking and
 * internal-unrest risk. Keys are ISO-2 so the shared feature resolver finds them.
 */

import type { ThematicLayerMap } from '../../types';
import { rankCountries } from '@/lib/services/military-ranking';
import { GeopoliticalKnowledgeService } from '@/lib/services/geopolitical-knowledge-service';
import { getSovereignProfileCached, militaryTechScore, unrestRisk } from '../sovereign-cache';

let militaryCache: ThematicLayerMap | null = null;
let stabilityCache: ThematicLayerMap | null = null;

export function getMilitaryLayerData(): ThematicLayerMap {
  if (militaryCache) return militaryCache;
  const map: ThematicLayerMap = {};
  for (const r of rankCountries('global', militaryTechScore)) {
    map[r.code] = {
      countryCode: r.code,
      intensity: r.score,
      label: `#${r.rank} · índice ${r.score}`,
      colorCategory: r.rank <= 3 ? 'critical' : r.rank <= 7 ? 'high' : r.rank <= 12 ? 'medium' : 'low',
    };
  }
  militaryCache = map;
  return map;
}

export function getStabilityLayerData(): ThematicLayerMap {
  if (stabilityCache) return stabilityCache;
  const map: ThematicLayerMap = {};
  for (const c of GeopoliticalKnowledgeService.getAllCountries()) {
    const risk = unrestRisk(getSovereignProfileCached(c.code));
    map[c.code] = {
      countryCode: c.code,
      intensity: risk,
      label: `Riesgo de conflicto interno ${risk}/100`,
      colorCategory: risk >= 60 ? 'critical' : risk >= 40 ? 'high' : risk >= 25 ? 'medium' : 'low',
    };
  }
  stabilityCache = map;
  return map;
}

export function resetTopBarLayerCaches(): void {
  militaryCache = null;
  stabilityCache = null;
}
