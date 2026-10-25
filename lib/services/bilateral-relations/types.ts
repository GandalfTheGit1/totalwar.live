/**
 * lib/services/bilateral-relations/types.ts
 *
 * Types of the bilateral relations scores produced by the Python engine in engine/relations
 * (R from -200 to +200, see engine/relations/docs/modelo_puntuacion.md).
 */

export type RelationBand = 'CONFLICT' | 'HOSTILE' | 'TENSE' | 'NEUTRAL' | 'PARTNER' | 'ALLIED';

/** How much data backs a pair: 'none' means R = 0 is "no information", not "neutral relationship". */
export type CoverageLevel = 'none' | 'low' | 'medium' | 'high';

export type EmbassyStatus = 'PRESENT' | 'ABSENT' | 'UNKNOWN';

export interface EmbassySide {
  status: EmbassyStatus;
  since?: string | null;
  source?: 'event' | 'wikidata' | 'web' | 'none';
  holder?: string | null;
}

export interface BilateralScore {
  /** ISO-2 code of the partner country. */
  partner: string;
  partnerNameEs: string;
  partnerIso3: string;
  R: number;
  band: RelationBand;
  /** Structural part of R (data-backed states). */
  sStruct: number;
  /** Sum of the ties states (embassies, trade, migration, treaties, language, forums): how connected the two countries are. */
  ties: number;
  /** R minus the ties: which side the pair is on (alliances, agreements, sanctions, disputes, ruptures; plus the dynamic part when the events layer exists). */
  valence: number;
  coverage: CoverageLevel;
  /** false while the pair has only the structural layer (no news / leaders' actions analysed yet). */
  eventsAnalysed: boolean;
  /** [state code, points] that add up to the structural part. */
  states: [string, number][];
  /** Head of mission of each country in the other, keyed by ISO-2 code. */
  embassies: Record<string, EmbassySide>;
}

export interface CountryRelationsPayload {
  country: string;
  countryNameEs: string;
  generatedAt: string;
  layer: string;
  partners: BilateralScore[];
}
