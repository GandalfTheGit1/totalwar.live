/**
 * components/dev/geopolitical-monitor/utils/thematic/tier-n-generator.ts
 *
 * Evaluates bilateral relations with friction >= 7.0, sanctions, and autocratic sovereign risks.
 */

import { ThematicLayerMap } from '../../types';
import { GeopoliticalKnowledgeService } from '@/lib/services/geopolitical-knowledge-service';
import {
  getCachedTierNMap,
  setCachedTierNMap,
  registerCountry
} from './country-registry';

interface CountryFrictionInfo {
  code: string;
  iso3: string;
  nameEs: string;
  maxScore: number;
  adversaryName: string;
  adversaryCode: string;
  reason: string;
  hasSanctionedEdge: boolean;
  isSanctionedRegime: boolean;
  isActiveWar: boolean;
}

type FrictionMap = Record<string, CountryFrictionInfo>;

function ensureCountryEntry(frictionMap: FrictionMap, code: string, iso3: string, nameEs: string): CountryFrictionInfo {
  if (!frictionMap[code]) {
    frictionMap[code] = {
      code,
      iso3,
      nameEs,
      maxScore: 0,
      adversaryName: '',
      adversaryCode: '',
      reason: '',
      hasSanctionedEdge: false,
      isSanctionedRegime: false,
      isActiveWar: false,
    };
  }
  return frictionMap[code];
}

/**
 * Scans bilateral edges for friction >= 7.0 or SANCTIONED_ADVERSARIAL.
 */
function scanBilateralEdges(edges: ReturnType<typeof GeopoliticalKnowledgeService.getTheWholeScene>['edges'], frictionMap: FrictionMap): void {
  for (const edge of edges) {
    const isHostileOrSanctioned = edge.stance === 'SANCTIONED_ADVERSARIAL';
    if (edge.frictionScore < 7.0 && !isHostileOrSanctioned) continue;

    const entryA = ensureCountryEntry(frictionMap, edge.countryA.code, edge.countryA.iso3, edge.countryA.nameEs);
    if (isHostileOrSanctioned) entryA.hasSanctionedEdge = true;
    if (edge.frictionScore >= entryA.maxScore) {
      entryA.maxScore = edge.frictionScore;
      entryA.adversaryName = edge.countryB.nameEs;
      entryA.adversaryCode = edge.countryB.code;
      entryA.reason = edge.summaryNote || `Fricción estratégica bilateral de ${edge.frictionScore}/10 con ${edge.countryB.nameEs}`;
    }

    const entryB = ensureCountryEntry(frictionMap, edge.countryB.code, edge.countryB.iso3, edge.countryB.nameEs);
    if (isHostileOrSanctioned) entryB.hasSanctionedEdge = true;
    if (edge.frictionScore >= entryB.maxScore) {
      entryB.maxScore = edge.frictionScore;
      entryB.adversaryName = edge.countryA.nameEs;
      entryB.adversaryCode = edge.countryA.code;
      entryB.reason = edge.summaryNote || `Fricción estratégica bilateral de ${edge.frictionScore}/10 con ${edge.countryA.nameEs}`;
    }
  }
}

/**
 * Scans sovereign nodes for extreme sovereign risk / autocratic friction (>= 7.0).
 */
function scanSovereignNodes(nodes: ReturnType<typeof GeopoliticalKnowledgeService.getTheWholeScene>['nodes'], frictionMap: FrictionMap): void {
  for (const node of nodes) {
    const isSanctioned = Boolean(
      node.strategicRole?.toLowerCase().includes('sancion') ||
      (node.sovereignRiskBase >= 7.0 && (node.code === 'RU' || node.code === 'IR'))
    );
    const isWar = node.code === 'UA' || (node.code === 'RU' && (frictionMap['RU']?.maxScore ?? 0) >= 10);

    if (node.sovereignRiskBase >= 7.0 || isSanctioned) {
      const entry = ensureCountryEntry(frictionMap, node.code, node.iso3, node.nameEs);
      if (isSanctioned) entry.isSanctionedRegime = true;
      if (isWar) entry.isActiveWar = true;
      if (node.sovereignRiskBase > entry.maxScore) {
        entry.maxScore = node.sovereignRiskBase;
        entry.reason = entry.reason || `Riesgo soberano extremo (${node.sovereignRiskBase}/10) y régimen bajo sanciones internacionales`;
      }
    }
  }
}

/**
 * Scans canonical Hard Countries from GeopoliticalKnowledgeService.
 */
function scanCanonicalHardCountries(frictionMap: FrictionMap): void {
  const canonicalHardCountries = GeopoliticalKnowledgeService.classifyHardCountries();
  for (const hc of canonicalHardCountries) {
    if (hc.isHardCountry || hc.tier === 'EXTREME_HOSTILE' || hc.tier === 'STRATEGIC_ADVERSARIAL') {
      const entry = ensureCountryEntry(frictionMap, hc.countryCode, hc.iso3, hc.countryName);
      if (hc.tier === 'EXTREME_HOSTILE' || hc.sanctionsDetail.level === 'COMPREHENSIVE') {
        entry.isSanctionedRegime = true;
        entry.hasSanctionedEdge = true;
      }
      const canonicalScore = hc.hardCountryIndex / 10;
      if (canonicalScore > entry.maxScore) {
        entry.maxScore = canonicalScore;
        entry.reason = hc.primaryRiskDrivers.join('; ');
      }
    }
  }
}

/**
 * Formats label for a Tier-N country based on risk factors and hostility.
 */
function resolveTierNLabel(info: CountryFrictionInfo): string {
  if (info.code === 'RU') return 'Conflicto Bélico / Sanciones Totales';
  if (info.code === 'UA') return 'Conflicto Bélico Activo';
  if (info.isSanctionedRegime && info.maxScore >= 9.5) return 'Régimen Sancionado / Hostilidad Extrema';
  if (info.isSanctionedRegime) return 'Régimen Sancionado / Riesgo Soberano';
  if (info.maxScore >= 9.5) return 'Tensión Hostil Crítica con Adversarios';
  if (info.maxScore >= 9.0) return 'Tensión Hostil Crítica';
  return 'Fricción Estratégica Bilateral';
}

/**
 * Pure generator for the 'tier-n' layer.
 */
export function getTierNLayerData(): ThematicLayerMap {
  const cached = getCachedTierNMap();
  if (cached) return cached;

  const wholeScene = GeopoliticalKnowledgeService.getTheWholeScene();
  const frictionMap: FrictionMap = {};

  scanBilateralEdges(wholeScene.edges, frictionMap);
  scanSovereignNodes(wholeScene.nodes, frictionMap);
  scanCanonicalHardCountries(frictionMap);

  const map: ThematicLayerMap = {};
  for (const info of Object.values(frictionMap)) {
    const intensity = Math.min(100, Math.round(info.maxScore * 10));
    const isCritical = info.maxScore >= 9.0 || (info.isSanctionedRegime && info.maxScore >= 8.0);
    const colorCategory: 'critical' | 'high' = isCritical ? 'critical' : 'high';
    const label = resolveTierNLabel(info);
    const sublabel = info.reason || `Máxima fricción con ${info.adversaryName} (${info.maxScore.toFixed(1)}/10)`;

    registerCountry(map, info.code, {
      countryCode: info.code,
      intensity,
      label,
      sublabel,
      colorCategory,
    });
  }

  setCachedTierNMap(map);
  return map;
}
