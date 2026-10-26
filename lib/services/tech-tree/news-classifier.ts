/**
 * lib/services/tech-tree/news-classifier.ts
 *
 * GDELT thematic filter, news classification (deterministic + LLM LIGHT tier with circuit breaker),
 * wire agency deduplication, and strict status capping at 'prototipo'.
 */

import {
  TechAcquisitionVia,
  TechAreaId,
  TechNodeStatus,
  TechTreeEvent,
} from '@/lib/data/tech-tree/types';
import { TECH_TREE_CONFIG } from '@/lib/data/tech-tree/config';
import { STATUS_RANK } from '@/lib/data/tech-tree/event-log';
import { TECH_TREE_VERSION } from '@/lib/data/tech-tree/definition';
import {
  deduplicateNewsSources,
  detectWireAgency,
  RawNewsArticle,
} from './source-deduplicator';
import { callLlm } from '@/lib/llm-client';

export interface NewsClassificationResult {
  isRelevant: boolean;
  pais: string | null;
  area: TechAreaId | null;
  nivel: number | null;
  achievementType: 'anuncio' | 'logro_demostrado' | 'ruido';
  rawSuggestedStatus: TechNodeStatus;
  cappedStatus: TechNodeStatus;
  via: TechAcquisitionVia;
  bloqueado_por_sancion: boolean;
  retroceso: boolean;
}

export interface AutoNewsEvaluationOutcome {
  applied: boolean;
  reason: string;
  independentSourceCount: number;
  classification: NewsClassificationResult;
  event: TechTreeEvent | null;
}

/**
 * Enforces the hard ceiling for automatic news: never above 'prototipo'.
 */
export function capAutoNewsStatus(suggested: TechNodeStatus): TechNodeStatus {
  const maxAllowed = TECH_TREE_CONFIG.autoNews.maxAllowedAutoStatus; // 'prototipo'
  if (STATUS_RANK[suggested] > STATUS_RANK[maxAllowed]) {
    return maxAllowed;
  }
  return suggested;
}

const COUNTRY_PATTERNS: Array<{ code: string; regex: RegExp }> = [
  { code: 'US', regex: /\b(united states|u\.s\.|usa|ee\.\s*uu\.|pentagon|nasa|darpa|intel|nvidia|spacex|openai)\b/i },
  { code: 'CN', regex: /\b(china|chinese|beijing|pekin|smic|huawei|catl|byd|cnsa|zhuque|landspace|xinhua)\b/i },
  { code: 'RU', regex: /\b(russia|russian|rusia|moscow|roscosmos|rosatom|sukhoi|mikron)\b/i },
  { code: 'JP', regex: /\b(japan|japanese|japon|tokyo|jaxa|rapidus|riken|fugaku|fanuc)\b/i },
  { code: 'DE', regex: /\b(germany|german|alemania|berlin|zeiss|trumpf|biontech|kuka)\b/i },
  { code: 'TW', regex: /\b(taiwan|taiwanese|taipei|tsmc|hsinchu|ase group)\b/i },
  { code: 'NL', regex: /\b(netherlands|dutch|paises bajos|holanda|asml|veldhoven|qutech)\b/i },
];

/**
 * Resolves the primary country for a news item.
 * 1. If the headline describes an export ban/sanction targeting a country ("ban ... to/against/on <Country>"),
 *    resolves to the sanctioned target country rather than the sanctioning issuer.
 * 2. Otherwise, resolves to the country mentioned earliest in the title (grammatical subject),
 *    falling back to the earliest mention in the summary.
 */
function resolveCountryFromText(title: string, summary: string): string | null {
  const fullText = `${title} ${summary}`.trim();

  // Check if there is an explicit sanction/export-ban target clause (e.g., "to China", "against Russia")
  const sanctionTargetRegex =
    /\b(?:ban|bans|banned|sanction|sanctions|export\s+control|export\s+controls|embargo|restrict|restricts|restriction|veto|block|blocks|bloqueo|sanciones?)\b[^.,;]*?\b(?:to|against|targeting|hacia|contra)\s+([^.,;]+)/i;
  const targetMatch = fullText.match(sanctionTargetRegex);
  if (targetMatch && targetMatch[1]) {
    const targetClause = targetMatch[1];
    let earliestTargetCode: string | null = null;
    let earliestTargetIdx = Infinity;
    for (const c of COUNTRY_PATTERNS) {
      const m = c.regex.exec(targetClause);
      if (m && m.index < earliestTargetIdx) {
        earliestTargetIdx = m.index;
        earliestTargetCode = c.code;
      }
    }
    if (earliestTargetCode) {
      return earliestTargetCode;
    }
  }

  // Otherwise pick the country that appears earliest in the title (subject position)
  let bestTitleCode: string | null = null;
  let bestTitleIndex = Infinity;
  for (const c of COUNTRY_PATTERNS) {
    const m = c.regex.exec(title);
    if (m && m.index < bestTitleIndex) {
      bestTitleIndex = m.index;
      bestTitleCode = c.code;
    }
  }
  if (bestTitleCode) {
    return bestTitleCode;
  }

  // Fallback: earliest mention in summary
  let bestSummaryCode: string | null = null;
  let bestSummaryIndex = Infinity;
  for (const c of COUNTRY_PATTERNS) {
    const m = c.regex.exec(summary);
    if (m && m.index < bestSummaryIndex) {
      bestSummaryIndex = m.index;
      bestSummaryCode = c.code;
    }
  }
  return bestSummaryCode;
}

const AREA_RULES: Array<{
  area: TechAreaId;
  regex: RegExp;
  levelResolver: (text: string) => number;
}> = [
  {
    area: 'ai_compute',
    regex: /\b(supercomputer|supercomputador|top500|exascale|pflops|llm|foundation\s+model|modelo\s+fundacional|ai\s+accelerator|ai\s+chip|gpu\s+cluster|ascend\s+910|blackwell|deepseek|gpt-)\b/i,
    levelResolver: (t) => {
      if (/\b(ai\s+chip|ai\s+accelerator|ascend\s+910|blackwell|tpu|cuda\s+stack|acelerador\s+ia)\b/i.test(t)) return 5;
      if (/\b(llm|foundation\s+model|modelo\s+fundacional|deepseek|gpt-|qwen|claude|gemini)\b/i.test(t)) return 4;
      if (/\b(exascale|exaescala|100\s+pflops|top\s*10\s+top500|10,000\s+gpu|frontier\s+supercomputer|fugaku|tianhe)\b/i.test(t)) return 3;
      if (/\b(top500|supercomputer|supercomputador)\b/i.test(t)) return 2;
      return 1;
    },
  },
  {
    area: 'semiconductors',
    regex: /\b(semiconductor|chip|wafer|oblea|lithography|litografia|euv|duv|2nm|3nm|5nm|7nm|28nm|tsmc|smic|asml|rapidus|osat|packaging)\b/i,
    levelResolver: (t) => {
      if (/\b(euv\s+scanner|euv\s+machine|high-na|soberania.*litografia|duv\s+immersion\s+scanner|duv\s+shipments|asml\s+nxe|asml\s+duv|smee)\b/i.test(t)) return 5;
      if (/\b(1\.4nm|18a|2nm|3nm|sub-3nm|gate-all-around|gaa)\b/i.test(t)) return 4;
      if (/\b(5nm|7nm|n7|finfet)\b/i.test(t)) return 3;
      if (/\b(14nm|28nm|45nm|65nm|mature\s+node|fabrica\s+madura)\b/i.test(t)) return 2;
      return 1;
    },
  },
  {
    area: 'telecom',
    regex: /\b(5g\s+standalone|5g\s+ran|base\s+station|estacion\s+base\s+5g|direct-to-cell|direct\s+to\s+cell|6g\s+terahertz|4g\s+lte)\b/i,
    levelResolver: (t) => {
      if (/\b(direct-to-cell|direct\s+to\s+cell|satellite-to-phone|6g\s+test)\b/i.test(t)) return 5;
      if (/\b(5g\s+ran\s+manufacturing|domestic\s+5g\s+base\s+station|estaciones\s+base\s+5g\s+propias)\b/i.test(t)) return 4;
      if (/\b(5g\s+standalone|5g\s+sa\s+network)\b/i.test(t)) return 3;
      if (/\b(4g\s+lte)\b/i.test(t)) return 2;
      return 1;
    },
  },
  {
    area: 'space',
    regex: /\b(satellite|satelite|orbital\s+rocket|orbital\s+launch|carrier\s+rocket|cohete\s+orbital|vtvl|reusable\s+rocket|cohete\s+reutilizable|lunar\s+landing|alunizaje|space\s+station|estacion\s+espacial|gnss|beidou|glonass|crewed\s+spaceflight)\b/i,
    levelResolver: (t) => {
      if (/\b(reusable\s+rocket|vtvl|vertical\s+landing|booster\s+recovery|cohete\s+reutilizable|falcon\s+9|zhuque-3|starship)\b/i.test(t)) return 5;
      if (/\b(lunar\s+landing|moon\s+landing|alunizaje|space\s+station|estacion\s+espacial|tiangong|slim\s+lander|chang'e)\b/i.test(t)) return 4;
      if (/\b(crewed|astronaut|taikonaut|vuelo\s+tripulado|gnss|beidou|glonass|gps\s+constellation)\b/i.test(t)) return 3;
      if (/\b(orbital\s+launch|lanzamiento\s+orbital|carrier\s+rocket)\b/i.test(t)) return 2;
      return 1;
    },
  },
  {
    area: 'nuclear',
    regex: /\b(nuclear\s+reactor|reactor\s+nuclear|uranium\s+enrichment|enriquecimiento\s+de\s+uranio|hualong|ap1000|vver-1200|fast\s+breeder|fusion\s+ignition|fusión\s+nuclear|smr)\b/i,
    levelResolver: (t) => {
      if (/\b(fusion\s+ignition|net\s+energy\s+gain|ganancia\s+neta.*fusion|nuclear\s+submarine\s+reactor|propulsion\s+naval\s+nuclear)\b/i.test(t)) return 5;
      if (/\b(gen\s+iii\+|generation\s+iv|hualong|ap1000|vver-1200|bn-800|fast\s+breeder|smr)\b/i.test(t)) return 4;
      if (/\b(uranium\s+enrichment|centrifuge\s+cascade|enriquecimiento\s+de\s+uranio)\b/i.test(t)) return 3;
      if (/\b(commercial\s+nuclear\s+plant|central\s+nuclear|grid\s+connection)\b/i.test(t)) return 2;
      return 1;
    },
  },
  {
    area: 'energy_batteries',
    regex: /\b(solid-state\s+battery|bateria\s+de\s+estado\s+solido|sodium-ion|iones\s+de\s+sodio|uhvdc|ultra-high\s+voltage|lfp\s+blade|gigafactory|lithium\s+refining|catl)\b/i,
    levelResolver: (t) => {
      if (/\b(solid-state|semi-solid|condensed\s+battery|sodium-ion|estado\s+solido|iones\s+de\s+sodio)\b/i.test(t)) return 5;
      if (/\b(uhvdc|uhvac|800\s*kv|1100\s*kv|grid-scale\s+bess)\b/i.test(t)) return 4;
      if (/\b(cathode\s+precursor|lithium\s+refining|lfp\s+blade|nmc\s+cell)\b/i.test(t)) return 3;
      if (/\b(gigafactory|gwh\s+cell\s+plant)\b/i.test(t)) return 2;
      return 1;
    },
  },
  {
    area: 'biotech',
    regex: /\b(mrna\s+vaccine|vacuna\s+arnm|crispr|gene\s+editing|edicion\s+genica|monoclonal\s+antibody|anticuerpo\s+monoclonal|de\s+novo\s+protein|alphafold|biosimilar)\b/i,
    levelResolver: (t) => {
      if (/\b(de\s+novo\s+protein|biofoundry|biofundicion|ai\s+protein\s+design)\b/i.test(t)) return 5;
      if (/\b(mrna|arnm|crispr|gene\s+editing|edicion\s+genica)\b/i.test(t)) return 4;
      if (/\b(monoclonal\s+antibody|anticuerpo\s+monoclonal|novel\s+biologic)\b/i.test(t)) return 3;
      if (/\b(biosimilar|active\s+pharmaceutical\s+ingredient)\b/i.test(t)) return 2;
      return 1;
    },
  },
  {
    area: 'defense_missiles_drones',
    regex: /\b(hypersonic\s+glide|hipersonico|hgv|df-17|avangard|zircon|stealth\s+fighter|loitering\s+munition|drone\s+swarm|ucav|cruise\s+missile|antimissile)\b/i,
    levelResolver: (t) => {
      if (/\b(hypersonic|hipersonico|hgv|mach\s+[5-9]|df-17|avangard|zircon|exoatmospheric)\b/i.test(t)) return 5;
      if (/\b(stealth\s+fighter|5th\s+gen|caza\s+furtivo|autonomous\s+swarm|loitering\s+munition\s+ai)\b/i.test(t)) return 4;
      if (/\b(ucav|male\s+drone|hale\s+drone|thaad|s-400|patriot\s+pac-3)\b/i.test(t)) return 3;
      if (/\b(cruise\s+missile|misil\s+de\s+crucero|medium\s+sam)\b/i.test(t)) return 2;
      return 1;
    },
  },
  {
    area: 'quantum',
    regex: /\b(quantum\s+processor|procesador\s+cuantico|qubit|qkd|quantum\s+key\s+distribution|logical\s+qubit|qubit\s+logico|quantum\s+error\s+correction|atomic\s+clock)\b/i,
    levelResolver: (t) => {
      if (/\b(logical\s+qubit|qubit\s+logico|error\s+correction\s+threshold|correccion\s+de\s+errores\s+cuanticos)\b/i.test(t)) return 4;
      if (/\b([5-9]\d\s*-?\s*qubit|\d{3}\s*-?\s*qubit|sycamore|zuchongzhi|programmable\s+quantum\s+processor)\b/i.test(t)) return 3;
      if (/\b(qkd|quantum\s+key\s+distribution|quantum\s+satellite|micius|quantum\s+network)\b/i.test(t)) return 2;
      return 1;
    },
  },
  {
    area: 'robotics_manufacturing',
    regex: /\b(humanoid\s+robot|robot\s+humanoide|lights-out\s+factory|dark\s+factory|5-axis\s+cnc|harmonic\s+drive|reductor\s+armonico|industrial\s+robot|civil\s+aviation\s+manufacturing|sukhoi\s+superjet)\b/i,
    levelResolver: (t) => {
      if (/\b(humanoid\s+robot|robot\s+humanoide|bipedal\s+factory\s+robot)\b/i.test(t)) return 5;
      if (/\b(lights-out\s+factory|dark\s+factory|aerospace\s+3d\s+metal\s+printing|manufactura\s+aditiva\s+aeroespacial)\b/i.test(t)) return 4;
      if (/\b(harmonic\s+drive|reductor\s+armonico|5-axis\s+cnc|sukhoi\s+superjet|aviacion\s+civil)\b/i.test(t)) return 3;
      if (/\b(6-axis\s+robot|articulated\s+industrial\s+robot|kuka|fanuc)\b/i.test(t)) return 2;
      return 1;
    },
  },
];

/**
 * Deterministic rule-based classifier that distinguishes announcements from physical prototypes/achievements
 * and detects sanctions/regressions.
 */
export function classifyTechNewsDeterministic(input: {
  title: string;
  summary?: string;
  countryHint?: string;
}): NewsClassificationResult {
  const title = input.title || '';
  const summary = input.summary || '';
  const text = `${title} ${summary}`.trim();

  const pais: string | null = input.countryHint
    ? input.countryHint.toUpperCase()
    : resolveCountryFromText(title, summary);

  let matchedArea: TechAreaId | null = null;
  let matchedNivel: number | null = null;

  for (const rule of AREA_RULES) {
    if (rule.regex.test(text)) {
      matchedArea = rule.area;
      matchedNivel = rule.levelResolver(text);
      break;
    }
  }

  if (!matchedArea || !matchedNivel || !pais) {
    return {
      isRelevant: false,
      pais,
      area: matchedArea,
      nivel: matchedNivel,
      achievementType: 'ruido',
      rawSuggestedStatus: 'no_alcanzado',
      cappedStatus: 'no_alcanzado',
      via: 'propio',
      bloqueado_por_sancion: false,
      retroceso: false,
    };
  }

  const isSanction = /\b(sanction|sancion|embargo|export\s+ban|export\s+control|veto|blacklist|bloqueo)\b/i.test(text);
  const isRegression = /\b(regression|retroceso|grounded|halt\s+production|paraliza|pierde\s+capacidad|shortage\s+of\s+parts)\b/i.test(text);

  let via: TechAcquisitionVia = 'propio';
  if (/\b(license|licensed|licencia|joint\s+venture|technology\s+transfer)\b/i.test(text)) {
    via = 'licencia';
  } else if (/\b(purchased|bought|imported\s+equipment|compra|adquisicion\s+de\s+equipos)\b/i.test(text)) {
    via = 'compra';
  }

  const isPureAnnouncement =
    /\b(plans\s+to|will\s+invest|announces\s+plan|anuncia\s+plan|proposes|roadmap|target\s+by\s+2030|promete|planea|memorandum|mou\b|subsidy\s+package|bill\s+to\s+fund)\b/i.test(
      text
    ) &&
    !/\b(completes\s+test|prototype\s+tested|successfully\s+tested|trial\s+wafer|powers\s+up|mass\s+production|commercial\s+launch|ensayo\s+exitoso|entra\s+en\s+produccion)\b/i.test(
      text
    );

  const isCommercialOrExport =
    /\b(mass\s+production|commercial\s+production|volume\s+production|exports\s+to|ships\s+commercial|produccion\s+en\s+masa|produccion\s+comercial)\b/i.test(
      text
    );

  let rawSuggestedStatus: TechNodeStatus = 'prototipo';
  let achievementType: 'anuncio' | 'logro_demostrado' = 'logro_demostrado';

  if (isPureAnnouncement) {
    rawSuggestedStatus = 'anunciado';
    achievementType = 'anuncio';
  } else if (isCommercialOrExport) {
    rawSuggestedStatus = 'produccion';
    achievementType = 'logro_demostrado';
  } else {
    rawSuggestedStatus = 'prototipo';
    achievementType = 'logro_demostrado';
  }

  const cappedStatus = capAutoNewsStatus(rawSuggestedStatus);

  return {
    isRelevant: true,
    pais,
    area: matchedArea,
    nivel: matchedNivel,
    achievementType,
    rawSuggestedStatus,
    cappedStatus,
    via,
    bloqueado_por_sancion: isSanction,
    retroceso: isRegression,
  };
}

/**
 * Evaluates a candidate group of articles and generates a 'noticia_auto' TechTreeEvent
 * ONLY if there are >= 2 independent sources that corroborate the SAME (pais, area, nivel) node
 * after wire agency and text similarity deduplication.
 * Status is strictly capped at 'prototipo'.
 */
export function evaluateCandidateNewsGroup(
  groupId: string,
  articles: RawNewsArticle[],
  eventDate: string = '2026-01-15',
  options?: { enabledOverride?: boolean }
): AutoNewsEvaluationOutcome {
  const isEnabled = options?.enabledOverride ?? TECH_TREE_CONFIG.autoNews.enabledInPublic;
  if (!isEnabled) {
    return {
      applied: false,
      reason: 'Modo automático por noticias desactivado en configuración (enabledInPublic=false).',
      independentSourceCount: 0,
      classification: classifyTechNewsDeterministic({ title: '' }),
      event: null,
    };
  }

  const validArticles = (articles || []).filter((a) => a && a.title && a.title.trim());
  if (validArticles.length === 0) {
    return {
      applied: false,
      reason: 'Sin artículos válidos en el grupo.',
      independentSourceCount: 0,
      classification: classifyTechNewsDeterministic({ title: '' }),
      event: null,
    };
  }

  // Classify each article individually so unrelated or noise articles never inflate the source count
  const nodeBuckets = new Map<
    string,
    { articles: RawNewsArticle[]; classifications: NewsClassificationResult[] }
  >();

  let firstClassification: NewsClassificationResult | null = null;

  for (const art of validArticles) {
    const cls = classifyTechNewsDeterministic({
      title: art.title,
      summary: art.summary,
    });
    if (!firstClassification) {
      firstClassification = cls;
    }
    if (cls.isRelevant && cls.pais && cls.area && cls.nivel) {
      const key = `${cls.pais}:${cls.area}:${cls.nivel}`;
      const bucket = nodeBuckets.get(key) ?? { articles: [], classifications: [] };
      bucket.articles.push(art);
      bucket.classifications.push(cls);
      nodeBuckets.set(key, bucket);
    }
  }

  if (nodeBuckets.size === 0) {
    return {
      applied: false,
      reason: 'Noticia descartada por no corresponder a un criterio objetivo del árbol tecnológico.',
      independentSourceCount: 0,
      classification: firstClassification ?? classifyTechNewsDeterministic({ title: '' }),
      event: null,
    };
  }

  // Select the candidate node bucket with the highest number of corroborating articles
  const bestBucket = Array.from(nodeBuckets.values()).sort(
    (a, b) => b.articles.length - a.articles.length
  )[0];

  const clusters = deduplicateNewsSources(bestBucket.articles);
  const independentSourceCount = clusters.length;
  const classification = bestBucket.classifications[0];
  const representative = clusters[0]?.representativeArticle ?? bestBucket.articles[0];

  if (independentSourceCount < TECH_TREE_CONFIG.autoNews.minIndependentSources) {
    return {
      applied: false,
      reason: `Fuentes independientes insuficientes para ${classification.pais} ${classification.area} L${classification.nivel} (${independentSourceCount}/${TECH_TREE_CONFIG.autoNews.minIndependentSources}). Notas de agencia duplicadas o artículos no relacionados descartados.`,
      independentSourceCount,
      classification,
      event: null,
    };
  }

  const event: TechTreeEvent = {
    id: `auto_${groupId}_${classification.pais!.toLowerCase()}_${classification.area}_l${classification.nivel}`,
    pais: classification.pais!,
    area: classification.area!,
    nivel: classification.nivel!,
    estado_nuevo: classification.cappedStatus,
    via: classification.via,
    fecha_hecho: representative.publishedDate || eventDate,
    fecha_conocible: representative.publishedDate || eventDate,
    fuentes: clusters.map((c) => ({
      nombre: `${c.representativeArticle.sourceName}: ${c.representativeArticle.title}`,
      url: c.representativeArticle.url,
      agencia_origen: detectWireAgency(c.representativeArticle) || c.canonicalAgencyOrPublisher,
      tipo: 'gdelt_news',
    })),
    etiqueta: 'Inferencia',
    origen: 'noticia_auto',
    revertido: false,
    bloqueado_por_sancion: classification.bloqueado_por_sancion || undefined,
    retroceso: classification.retroceso || undefined,
    resumen: representative.title,
    version_arbol: TECH_TREE_VERSION,
  };

  return {
    applied: true,
    reason: `Aplicado con ${independentSourceCount} fuentes independientes (tope '${classification.cappedStatus}').`,
    independentSourceCount,
    classification,
    event,
  };
}

/**
 * Optional LLM classification helper using LIGHT tier sequentially with 429/403 circuit breaker.
 */
export async function classifyNewsBatchWithLlmSequential(
  items: RawNewsArticle[]
): Promise<NewsClassificationResult[]> {
  const results: NewsClassificationResult[] = [];

  for (const item of items) {
    try {
      const rawOutput = await callLlm({
        systemPrompt:
          'Clasifica noticias tecnológicas en JSON estricto: {"isRelevant":boolean,"pais":"ISO2","area":"semiconductors|ai_compute|space|nuclear|energy_batteries|biotech|telecom|defense_missiles_drones|quantum|robotics_manufacturing","nivel":1-5,"achievementType":"anuncio|logro_demostrado|ruido","rawSuggestedStatus":"anunciado|prototipo|produccion|exportacion","via":"propio|licencia|compra"}',
        userPrompt: `Título: ${item.title}\nResumen: ${item.summary || ''}`,
        tier: 'LIGHT',
        temperature: 0,
        maxTokens: 350,
      });

      const match = rawOutput.match(/\{[\s\S]*\}/);
      if (!match) {
        throw new Error(`Invalid JSON from LLM: ${rawOutput}`);
      }
      const parsed = JSON.parse(match[0]);
      const rawStatus = (parsed.rawSuggestedStatus || 'anunciado') as TechNodeStatus;
      results.push({
        isRelevant: Boolean(parsed.isRelevant),
        pais: parsed.pais || null,
        area: parsed.area || null,
        nivel: parsed.nivel ? Number(parsed.nivel) : null,
        achievementType: parsed.achievementType || 'anuncio',
        rawSuggestedStatus: rawStatus,
        cappedStatus: capAutoNewsStatus(rawStatus),
        via: parsed.via || 'propio',
        bloqueado_por_sancion: Boolean(parsed.bloqueado_por_sancion),
        retroceso: Boolean(parsed.retroceso),
      });
    } catch (err: any) {
      const msg = String(err?.message || err);
      if (msg.includes('429') || msg.includes('403') || msg.toLowerCase().includes('quota')) {
        console.error(`[TechTreeNewsClassifier] Circuit breaker triggered on quota/rate limit: ${msg}`);
        break;
      }
      throw err;
    }
  }

  return results;
}
