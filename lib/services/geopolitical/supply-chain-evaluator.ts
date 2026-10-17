/**
 * lib/services/geopolitical/supply-chain-evaluator.ts
 *
 * Evaluates the cross-border bilateral friction and chokepoint exposure
 * across a company's manufacturing and supply chain footprint.
 */

import { COUNTRY_BY_CODE, GeopoliticalCountry } from '../../data/geopolitical-countries';
import { BilateralEdge } from './types';
import { resolveCountryCode } from './country-resolver';
import { getBilateralRelation } from './matrix-scene-engine';

export interface SupplyChainExposureResult {
  evaluatedCountries: GeopoliticalCountry[];
  compositeFrictionScore: number; // 1-10
  highestRiskPairs: BilateralEdge[];
  chokepointExposures: BilateralEdge[];
  tariffVulnerableRoutes: BilateralEdge[];
  summaryInsight: string;
}

/**
 * Adjusts the base friction score based on the World Tension Index.
 * If WorldTensionIndex > 75, applies a 1.2x multiplier.
 */
export function getAdjustedFrictionScore(baseScore: number, worldTensionIndex: number): number {
  if (worldTensionIndex > 75) {
    return Math.min(10, baseScore * 1.2);
  }
  return baseScore;
}

/**
 * Finds all pairwise bilateral edges between unique participant country codes.
 */
function findSupplyChainEdges(uniqueCodes: string[]): BilateralEdge[] {
  const matchedEdges: BilateralEdge[] = [];
  for (let i = 0; i < uniqueCodes.length; i++) {
    for (let j = i + 1; j < uniqueCodes.length; j++) {
      const edge = getBilateralRelation(uniqueCodes[i], uniqueCodes[j]);
      if (edge) matchedEdges.push(edge);
    }
  }
  return matchedEdges;
}

/**
 * Builds an analytical summary of the footprint friction.
 */
function buildSupplyChainSummary(
  countryCount: number,
  avgFriction: number,
  topRisk?: BilateralEdge
): string {
  let summary = `La cadena de valor abarca ${countryCount} naciones con una fricción promedio de ${avgFriction}/10.`;
  if (topRisk) {
    summary += ` Riesgo crítico detectado en la ruta ${topRisk.countryA.flag} ${topRisk.countryA.nameEs} ↔ ${topRisk.countryB.flag} ${topRisk.countryB.nameEs} (Fricción: ${topRisk.frictionScore}/10).`;
  }
  return summary;
}


/**
 * Calculates aggregate friction and segments vulnerable supply chain routes.
 */
function buildSupplyChainMetrics(matchedEdges: BilateralEdge[]) {
  const totalFriction = matchedEdges.reduce((acc, e) => acc + e.frictionScore, 0);
  const avgFriction = matchedEdges.length > 0
    ? Number((totalFriction / matchedEdges.length).toFixed(2))
    : 2.0;

  const highestRiskPairs = matchedEdges
    .filter(e => e.frictionScore >= 5.0)
    .sort((a, b) => b.frictionScore - a.frictionScore);

  const chokepointExposures = matchedEdges.filter(e => e.chokepointRisk);
  const tariffVulnerableRoutes = matchedEdges.filter(
    e => e.tariffRisk === 'HIGH' || e.tariffRisk === 'EXTREME'
  );

  return { avgFriction, highestRiskPairs, chokepointExposures, tariffVulnerableRoutes };
}

/**
 * Evaluates the collective geopolitical risk of an equity's manufacturing & supply chain footprint.
 */
export function evaluateSupplyChainExposure(countryIdentifiers: string[]): SupplyChainExposureResult {
  const uniqueCodes = Array.from(
    new Set(
      countryIdentifiers
        .map(c => resolveCountryCode(c))
        .filter((c): c is string => Boolean(c))
    )
  );

  const evaluatedCountries = uniqueCodes
    .map(code => COUNTRY_BY_CODE.get(code)!)
    .filter(Boolean);

  if (evaluatedCountries.length <= 1) {
    return {
      evaluatedCountries,
      compositeFrictionScore: 1.5,
      highestRiskPairs: [],
      chokepointExposures: [],
      tariffVulnerableRoutes: [],
      summaryInsight: 'Cadena de suministro concentrada en una sola jurisdicción sin fricción bilateral transfronteriza.'
    };
  }

  const matchedEdges = findSupplyChainEdges(uniqueCodes);
  const metrics = buildSupplyChainMetrics(matchedEdges);
  const summaryInsight = buildSupplyChainSummary(
    evaluatedCountries.length,
    metrics.avgFriction,
    metrics.highestRiskPairs[0]
  );

  return {
    evaluatedCountries,
    compositeFrictionScore: metrics.avgFriction,
    highestRiskPairs: metrics.highestRiskPairs,
    chokepointExposures: metrics.chokepointExposures,
    tariffVulnerableRoutes: metrics.tariffVulnerableRoutes,
    summaryInsight
  };
}
