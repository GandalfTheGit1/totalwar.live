/**
 * lib/services/bilateral-relations/valence.ts
 *
 * R mixes two things: how many formal ties a pair has (embassies, trade, migration, treaties, language, shared forums) and which side the pair is on
 * (alliances, integration, trade agreements, partnerships; sanctions, rivalry, disputes, ruptures, war). On the map the first is the OPACITY and the second the TONE:
 *
 *   T = sum of the points of the TIES states          V = R - T      (for pairs with the events layer V also carries their dynamic part)
 *
 * The tone is a piecewise-linear gradient over V with nine fixed stops, each equal to the weight of one named state of the engine's catalogue
 * (engine/relations/model/scoring.py): -30 rupture, -25 broad sanctions band, -10 absent ambassador / targeted sanctions, -5 latent dispute, +5 preferential trade,
 * +10 free trade or strategic partnership, +30 defence alliance. Validation fixed before the change: engine/relations/world/audit_map.py.
 */

import type { CoverageLevel } from './types';

/** States that measure how connected two countries are, not which side they are on. Must match TIES in engine/relations/world/audit_map.py. */
export const TIES: ReadonlySet<string> = new Set([
  'FULL_DIPLOMATIC',
  'NONRESIDENT_RELATIONS',
  'SHARED_LANGUAGE',
  'BILATERAL_TREATIES',
  'INVESTMENT_TREATY',
  'TRADE_HIGH',
  'TRADE_MEDIUM',
  'HUMAN_TIES',
  'SHARED_FORUM',
]);

export interface RelationSplit {
  /** Sum of the ties states (0 or more). */
  ties: number;
  /** R minus the ties: the side the pair is on. */
  valence: number;
}

export function splitRelation(states: ReadonlyArray<readonly [string, number]>, R: number): RelationSplit {
  const ties = states.reduce((s, [code, pts]) => (TIES.has(code) ? s + pts : s), 0);
  return { ties, valence: R - ties };
}

type Rgb = readonly [number, number, number];

/** [V, colour] stops, from the most hostile to the most allied. */
export const TONE_STOPS: ReadonlyArray<readonly [number, Rgb]> = [
  [-60, [159, 18, 57]], //   #9f1239  war, occupation, rupture with sanctions
  [-25, [225, 29, 72]], //   #e11d48  strategic rivalry, broad sanctions
  [-10, [244, 63, 94]], //   #f43f5e  targeted sanctions, absent ambassador
  [-5, [245, 158, 11]], //   #f59e0b  latent territorial dispute
  [0, [148, 163, 184]], //   #94a3b8  ties without a recorded position
  [5, [129, 140, 248]], //   #818cf8  preferential trade
  [10, [52, 211, 153]], //   #34d399  free trade, strategic partnership
  [30, [16, 185, 129]], //   #10b981  defence alliance
  [60, [4, 120, 87]], //     #047857  integration plus alliance
];

export const NODATA_FILL = 'rgba(51, 65, 85, 0.35)';
const ALPHA_MIN = 0.3;
const ALPHA_SPAN = 0.35;
const TIES_FULL = 20;
const HOVER_BOOST = 0.25;
const HOVER_MAX = 0.9;
const STRONG = 25;

/** Colour of a position V (clamped to the outer stops). */
export function toneColor(valence: number): Rgb {
  const v = Math.max(TONE_STOPS[0][0], Math.min(TONE_STOPS[TONE_STOPS.length - 1][0], valence));
  for (let i = 1; i < TONE_STOPS.length; i++) {
    const [v1, c1] = TONE_STOPS[i];
    if (v <= v1) {
      const [v0, c0] = TONE_STOPS[i - 1];
      const t = (v - v0) / (v1 - v0);
      return [0, 1, 2].map((k) => Math.round(c0[k] + (c1[k] - c0[k]) * t)) as unknown as Rgb;
    }
  }
  return TONE_STOPS[TONE_STOPS.length - 1][1];
}

export function toneAlpha(ties: number): number {
  return ALPHA_MIN + (ALPHA_SPAN * Math.min(Math.max(ties, 0), TIES_FULL)) / TIES_FULL;
}

export interface Tone {
  fillColor: string;
  hoverFillColor: string;
  strokeColor: string;
  strokeWidth: string;
  /** Glow filter id (defined in MapDefs) for strong positions only, '' otherwise. */
  glow: '' | 'emerald' | 'rose';
  valence: number;
  ties: number;
}

const rgba = (c: Rgb, a: number) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${Math.round(a * 100) / 100})`;

/** Complete tone of one pair; null when nothing is recorded (coverage 'none'), so the map keeps its grey. */
export function toneOf(valence: number, ties: number, coverage: CoverageLevel = 'low'): Tone | null {
  if (coverage === 'none' || (ties === 0 && Math.abs(valence) < 0.05)) return null;
  const c = toneColor(valence);
  const a = toneAlpha(ties);
  const strong = Math.abs(valence) >= STRONG;
  return {
    fillColor: rgba(c, a),
    hoverFillColor: rgba(c, Math.min(HOVER_MAX, a + HOVER_BOOST)),
    strokeColor: `rgb(${c[0]}, ${c[1]}, ${c[2]})`,
    strokeWidth: strong ? '1.8px' : '1.2px',
    glow: strong ? (valence > 0 ? 'emerald' : 'rose') : '',
    valence,
    ties,
  };
}

/** Short Spanish label of a position, for the panel and the tooltip. */
export function positionLabelEs(valence: number): string {
  if (valence >= 30) return 'Alianza';
  if (valence >= 10) return 'Cooperación estrecha';
  if (valence >= 5) return 'Acuerdo preferencial';
  if (valence > -5) return 'Sin posición registrada';
  if (valence > -10) return 'Fricción latente';
  if (valence > -25) return 'Tensión';
  if (valence > -60) return 'Rivalidad o sanciones';
  return 'Conflicto o ruptura';
}
