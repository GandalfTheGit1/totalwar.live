/**
 * lib/services/tech-tree/source-deduplicator.ts
 *
 * Wire agency detection and text similarity deduplication for automatic news unlocks.
 * Ensures a Reuters, AP, or EFE wire story republished across 30 outlets counts as 1 single source.
 */

import { TECH_TREE_CONFIG } from '@/lib/data/tech-tree/config';

export interface RawNewsArticle {
  id?: string;
  title: string;
  summary?: string;
  url?: string;
  sourceName: string;
  domain?: string;
  agency?: string;
  publishedDate?: string;
}

export interface DeduplicatedSourceCluster {
  clusterId: string;
  canonicalAgencyOrPublisher: string;
  representativeArticle: RawNewsArticle;
  groupedArticles: RawNewsArticle[];
}

const WIRE_AGENCY_PATTERNS: Array<{ canonical: string; regex: RegExp }> = [
  { canonical: 'Reuters', regex: /\b(reuters|thomson\s+reuters)\b/i },
  { canonical: 'Associated Press', regex: /\b(associated\s+press|ap\s+news|\(ap\)|—\s*ap\b|via\s+ap\b)\b/i },
  { canonical: 'EFE', regex: /\b(agencia\s+efe|\(efe\)|\befe\b)\b/i },
  { canonical: 'AFP', regex: /\b(agence\s+france[- ]presse|\(afp\)|\bafp\b)\b/i },
  { canonical: 'Bloomberg', regex: /\b(bloomberg\s+news|bloomberg\s+lp|\bbloomberg\b)\b/i },
  { canonical: 'Xinhua', regex: /\b(xinhua|xinhuanet)\b/i },
  { canonical: 'TASS', regex: /\b(tass|itar-tass)\b/i },
  { canonical: 'Kyodo', regex: /\b(kyodo\s+news|\bkyodo\b)\b/i },
  { canonical: 'Yonhap', regex: /\b(yonhap)\b/i },
  { canonical: 'DPA', regex: /\b(deutsche\s+presse[- ]agentur|\bdpa\b)\b/i },
];

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'that', 'with', 'from', 'this', 'into', 'over', 'after', 'under',
  'para', 'con', 'los', 'las', 'una', 'por', 'del', 'que', 'como', 'mas', 'pero', 'sus',
  'says', 'said', 'report', 'reports', 'new', 'first', 'world', 'country', 'state',
]);

/**
 * Detects if an article originates from a major wire agency via metadata, domain, or inline text attribution.
 */
export function detectWireAgency(article: RawNewsArticle): string | null {
  const combinedMeta = `${article.agency || ''} ${article.sourceName || ''} ${article.domain || ''}`;
  const combinedText = `${combinedMeta} ${article.title || ''} ${article.summary || ''}`;

  for (const { canonical, regex } of WIRE_AGENCY_PATTERNS) {
    if (regex.test(combinedText)) {
      return canonical;
    }
  }
  return null;
}

/**
 * Normalizes publisher identity (wire agency if detected, otherwise normalized domain/sourceName).
 */
export function resolveCanonicalOrigin(article: RawNewsArticle): string {
  const wire = detectWireAgency(article);
  if (wire) return `agency:${wire.toLowerCase()}`;

  if (article.domain && article.domain.trim()) {
    const cleanDomain = article.domain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0];
    return `domain:${cleanDomain}`;
  }

  const cleanSource = (article.sourceName || 'unknown')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_');
  return `source:${cleanSource}`;
}

/**
 * Extracts normalized content tokens for Jaccard similarity comparison.
 */
export function tokenizeNewsText(text: string): Set<string> {
  const normalized = (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ');

  const words = normalized
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));

  return new Set(words);
}

/**
 * Calculates Jaccard token similarity between two news texts in [0, 1].
 */
export function computeTextSimilarity(textA: string, textB: string): number {
  const setA = tokenizeNewsText(textA);
  const setB = tokenizeNewsText(textB);

  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }

  const union = setA.size + setB.size - intersection;
  const jaccard = union > 0 ? intersection / union : 0;

  // Also compute overlap coefficient to catch shortened wire headlines vs full wire leads
  const minSize = Math.min(setA.size, setB.size);
  const overlap = minSize > 0 ? intersection / minSize : 0;

  return Number((jaccard * 0.6 + overlap * 0.4).toFixed(3));
}

/**
 * Deduplicates a list of news articles by wire agency origin, publisher domain, and text similarity.
 * Returns only independent source clusters.
 */
export function deduplicateNewsSources(
  articles: RawNewsArticle[],
  similarityThreshold: number = TECH_TREE_CONFIG.autoNews.textSimilarityThreshold
): DeduplicatedSourceCluster[] {
  const clusters: DeduplicatedSourceCluster[] = [];

  for (const article of articles) {
    if (!article || !article.title || !article.title.trim()) continue;

    const originKey = resolveCanonicalOrigin(article);
    const fullText = `${article.title} ${article.summary || ''}`;

    let matchedCluster: DeduplicatedSourceCluster | undefined;

    for (const cluster of clusters) {
      // 1. Same wire agency or same canonical domain/publisher
      if (cluster.canonicalAgencyOrPublisher === originKey) {
        matchedCluster = cluster;
        break;
      }

      // 2. High text similarity (reprinted or lightly edited wire copy)
      const repText = `${cluster.representativeArticle.title} ${cluster.representativeArticle.summary || ''}`;
      const sim = computeTextSimilarity(fullText, repText);
      if (sim >= similarityThreshold) {
        matchedCluster = cluster;
        break;
      }
    }

    if (matchedCluster) {
      matchedCluster.groupedArticles.push(article);
    } else {
      clusters.push({
        clusterId: `cluster_${clusters.length + 1}_${originKey}`,
        canonicalAgencyOrPublisher: originKey,
        representativeArticle: article,
        groupedArticles: [article],
      });
    }
  }

  return clusters;
}
