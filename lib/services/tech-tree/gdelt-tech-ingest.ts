/**
 * lib/services/tech-tree/gdelt-tech-ingest.ts
 *
 * Thematic GDELT v2 Doc API ingestion for the Historical Country Technology Tree.
 * Reuses the GDELT v2 artlist JSON pattern from app/api/dev/world-tension/route.ts.
 * If GDELT is unavailable or rate-limited (429/403), preserves the last saved tree state without deleting anything.
 */

import { TechAreaId, TechTreeEvent } from '@/lib/data/tech-tree/types';
import { appendTechTreeEvent, getTechTreeEvents } from '@/lib/data/tech-tree/historical-seed';
import { RawNewsArticle } from './source-deduplicator';
import {
  AutoNewsEvaluationOutcome,
  classifyTechNewsDeterministic,
  evaluateCandidateNewsGroup,
} from './news-classifier';

export const GDELT_AREA_THEMATIC_KEYWORDS: Record<TechAreaId, string> = {
  semiconductors: '(semiconductor OR lithography OR EUV OR wafer OR TSMC OR SMIC OR ASML)',
  ai_compute: '(supercomputer OR TOP500 OR exascale OR "foundation model" OR "AI chip")',
  space: '(satellite OR "orbital launch" OR "reusable rocket" OR "lunar landing" OR "space station")',
  nuclear: '("nuclear reactor" OR "uranium enrichment" OR "fusion ignition" OR Hualong OR AP1000)',
  energy_batteries: '("solid-state battery" OR "sodium-ion" OR gigafactory OR UHVDC OR CATL)',
  biotech: '("mRNA vaccine" OR CRISPR OR "gene editing" OR "monoclonal antibody" OR biofoundry)',
  telecom: '("5G standalone" OR "5G RAN" OR "direct-to-cell" OR "6G")',
  defense_missiles_drones: '(hypersonic OR "cruise missile" OR UCAV OR "stealth fighter" OR antimissile)',
  quantum: '("quantum processor" OR qubit OR "quantum key distribution" OR QKD)',
  robotics_manufacturing: '("industrial robot" OR "humanoid robot" OR "5-axis CNC" OR "harmonic drive")',
};

export interface GdeltIngestResult {
  ok: boolean;
  preservedLastState: boolean;
  queryUrl: string;
  articles: RawNewsArticle[];
  errorReason?: string;
}

export interface GdeltSyncPipelineResult {
  ok: boolean;
  preservedLastState: boolean;
  queryUrl: string;
  totalEventsBefore: number;
  totalEventsAfter: number;
  appliedEvents: TechTreeEvent[];
  outcomes: AutoNewsEvaluationOutcome[];
  errorReason?: string;
}

/**
 * Builds a GDELT v2 Doc API URL with thematic filters for a tech tree area and optional country.
 */
export function buildGdeltTechQueryUrl(areaId: TechAreaId, countryCode?: string): string {
  const keywords = GDELT_AREA_THEMATIC_KEYWORDS[areaId] || areaId;
  const locationFilter = countryCode ? ` sourcecountry:${countryCode.toUpperCase()}` : '';
  const encodedQuery = encodeURIComponent(`${keywords}${locationFilter}`);
  return `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodedQuery}&mode=artlist&maxrecords=25&timespan=7d&format=json`;
}

/**
 * Fetches thematic articles from GDELT v2.
 * Never mutates or deletes existing tree events if GDELT fails or returns 429/non-JSON.
 */
export async function fetchGdeltThematicArticles(
  areaId: TechAreaId,
  countryCode?: string,
  fetchFn: typeof fetch = fetch
): Promise<GdeltIngestResult> {
  const queryUrl = buildGdeltTechQueryUrl(areaId, countryCode);
  console.log(`[GDELTTechIngest] Querying thematic GDELT feed for ${areaId} (${countryCode || 'ALL'})`);

  try {
    const response = await fetchFn(queryUrl);
    if (!response.ok) {
      console.warn(`[GDELTTechIngest] GDELT responded with HTTP ${response.status}. Preserving last state.`);
      return {
        ok: false,
        preservedLastState: true,
        queryUrl,
        articles: [],
        errorReason: `GDELT HTTP ${response.status}`,
      };
    }

    const contentType = response.headers?.get?.('content-type') || '';
    if (!contentType.includes('application/json')) {
      console.warn(`[GDELTTechIngest] GDELT returned non-JSON content-type (${contentType}). Preserving last state.`);
      return {
        ok: false,
        preservedLastState: true,
        queryUrl,
        articles: [],
        errorReason: `GDELT non-JSON response: ${contentType}`,
      };
    }

    const payload = await response.json();
    if (!payload || !Array.isArray(payload.articles)) {
      return {
        ok: false,
        preservedLastState: true,
        queryUrl,
        articles: [],
        errorReason: "Invalid GDELT payload missing 'articles' array",
      };
    }

    const articles: RawNewsArticle[] = payload.articles.map((art: any, idx: number) => ({
      id: `gdelt_${areaId}_${idx}`,
      title: String(art.title || ''),
      summary: String(art.seendate || ''),
      url: String(art.url || ''),
      sourceName: String(art.domain || 'gdelt_source'),
      domain: String(art.domain || ''),
      publishedDate: typeof art.seendate === 'string' && art.seendate.length >= 8
        ? `${art.seendate.slice(0, 4)}-${art.seendate.slice(4, 6)}-${art.seendate.slice(6, 8)}`
        : '2026-01-15',
    }));

    return {
      ok: true,
      preservedLastState: true,
      queryUrl,
      articles,
    };
  } catch (err: any) {
    console.warn(`[GDELTTechIngest] GDELT fetch error (${err?.message}). Tree remains at last state.`);
    return {
      ok: false,
      preservedLastState: true,
      queryUrl,
      articles: [],
      errorReason: err?.message || 'Network error',
    };
  }
}

/**
 * End-to-end automatic news update pipeline:
 * 1. Fetches thematic articles from GDELT v2 for the requested area/country.
 * 2. If GDELT fails or is unavailable, keeps the event log untouched (preservedLastState = true).
 * 3. Groups candidate articles by (pais, area, nivel), deduplicates wire agencies,
 *    and appends automatic unlock events (capped at 'prototipo') only when >= 2 independent sources confirm.
 */
export async function syncTechTreeFromGdelt(
  areaId: TechAreaId,
  countryCode?: string,
  fetchFn: typeof fetch = fetch
): Promise<GdeltSyncPipelineResult> {
  const totalEventsBefore = getTechTreeEvents().length;
  const ingest = await fetchGdeltThematicArticles(areaId, countryCode, fetchFn);

  if (!ingest.ok) {
    const totalEventsAfter = getTechTreeEvents().length;
    return {
      ok: false,
      preservedLastState: totalEventsAfter === totalEventsBefore,
      queryUrl: ingest.queryUrl,
      totalEventsBefore,
      totalEventsAfter,
      appliedEvents: [],
      outcomes: [],
      errorReason: ingest.errorReason,
    };
  }

  const candidateGroups = new Map<string, RawNewsArticle[]>();
  for (const art of ingest.articles) {
    const cls = classifyTechNewsDeterministic({ title: art.title, summary: art.summary });
    if (cls.isRelevant && cls.pais && cls.area && cls.nivel) {
      const key = `${cls.pais}_${cls.area}_l${cls.nivel}`;
      const existing = candidateGroups.get(key) ?? [];
      existing.push(art);
      candidateGroups.set(key, existing);
    }
  }

  const outcomes: AutoNewsEvaluationOutcome[] = [];
  const appliedEvents: TechTreeEvent[] = [];
  const existingIds = new Set(getTechTreeEvents().map((e) => e.id));

  for (const [groupKey, groupArticles] of candidateGroups.entries()) {
    const outcome = evaluateCandidateNewsGroup(`gdelt_${groupKey}`, groupArticles);
    outcomes.push(outcome);
    if (outcome.applied && outcome.event && !existingIds.has(outcome.event.id)) {
      const appended = appendTechTreeEvent(outcome.event);
      existingIds.add(appended.id);
      appliedEvents.push(appended);
    }
  }

  const totalEventsAfter = getTechTreeEvents().length;
  return {
    ok: true,
    preservedLastState: totalEventsAfter >= totalEventsBefore,
    queryUrl: ingest.queryUrl,
    totalEventsBefore,
    totalEventsAfter,
    appliedEvents,
    outcomes,
  };
}

