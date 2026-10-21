/**
 * lib/services/bilateral-relations/relations-store.ts
 *
 * Server-side reader of lib/data/bilateral-relations/relations.json, the export of the engine's world run
 * (engine/relations/world/export_app.py). The file holds every pair of the 197 states once; it is read once per server process.
 *
 * Compact pair record: [R, band, sStruct, coverage, eventsAnalysed, states, embassies]
 *   embassies: { ISO2: [status, since, source, holder] }
 */

import fs from 'fs';
import path from 'path';
import { splitRelation } from './valence';
import type { BilateralScore, CountryRelationsPayload, EmbassySide, RelationBand, CoverageLevel } from './types';

type CompactEmbassy = [EmbassySide['status'], string | null, EmbassySide['source'] | null, string | null];
type CompactPair = [number, RelationBand, number, CoverageLevel, boolean, [string, number][], Record<string, CompactEmbassy>, string[]?];

interface RelationsFile {
  meta: { generatedAt: string; layer: string; states: number; pairs: number };
  countries: Record<string, [string, string]>; // ISO2 -> [nameEs, iso3]
  pairs: Record<string, CompactPair>; // "AA-BB" (alphabetical) -> record
}

const DATA_FILE = path.join(process.cwd(), 'lib', 'data', 'bilateral-relations', 'relations.json');
let cache: RelationsFile | null = null;

export function loadRelationsFile(file: string = DATA_FILE): RelationsFile | null {
  if (cache) return cache;
  try {
    cache = JSON.parse(fs.readFileSync(file, 'utf8')) as RelationsFile;
    return cache;
  } catch {
    return null;
  }
}

/** For tests: forget the loaded file. */
export function resetRelationsCache(): void {
  cache = null;
}

function expandEmbassies(raw: Record<string, CompactEmbassy>): Record<string, EmbassySide> {
  const out: Record<string, EmbassySide> = {};
  for (const [side, [status, since, source, holder]] of Object.entries(raw || {})) {
    out[side] = { status, since, source: source ?? undefined, holder };
  }
  return out;
}

/** All partners of one country, sorted from the best relationship to the worst. */
export function getCountryRelations(code: string, data: RelationsFile | null = loadRelationsFile()): CountryRelationsPayload | null {
  if (!data) return null;
  const c = code.trim().toUpperCase();
  const me = data.countries[c];
  if (!me) return null;
  const partners: BilateralScore[] = [];
  for (const [other, [nameEs, iso3]] of Object.entries(data.countries)) {
    if (other === c) continue;
    const key = c < other ? `${c}-${other}` : `${other}-${c}`;
    const rec = data.pairs[key];
    if (!rec) continue;
    const [R, band, sStruct, coverage, eventsAnalysed, states, embassies, claimIds] = rec;
    const { ties, valence } = splitRelation(states, R);
    partners.push({ partner: other, partnerNameEs: nameEs, partnerIso3: iso3, R, band, sStruct, ties, valence, coverage, eventsAnalysed, states, embassies: expandEmbassies(embassies), claimIds: claimIds ?? undefined });
  }
  partners.sort((x, y) => y.R - x.R);
  return { country: c, countryNameEs: me[0], generatedAt: data.meta.generatedAt, layer: data.meta.layer, partners };
}
