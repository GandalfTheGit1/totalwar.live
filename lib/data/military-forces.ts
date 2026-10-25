/**
 * lib/data/military-forces.ts
 *
 * Approximate order-of-magnitude military force data per country (ISO-2).
 * Static reference figures for ranking and side-by-side comparison; not a live feed.
 * Countries missing here are simply not ranked.
 */

export interface MilitaryForces {
  activeTroopsK: number;     // active personnel, thousands
  mainBattleTanks: number;
  combatAircraft: number;
  majorWarships: number;     // destroyers and larger, incl. carriers/submarines of note
  budgetBnUsd: number;       // annual defence budget, USD billions
  budgetPctGdp: number;
  warheads: number;
}

export const MILITARY_FORCES: Record<string, MilitaryForces> = {
  US: { activeTroopsK: 1330, mainBattleTanks: 4600, combatAircraft: 2800, majorWarships: 120, budgetBnUsd: 900, budgetPctGdp: 3.4, warheads: 5044 },
  CN: { activeTroopsK: 2035, mainBattleTanks: 5000, combatAircraft: 1900, majorWarships: 130, budgetBnUsd: 290, budgetPctGdp: 1.7, warheads: 500 },
  RU: { activeTroopsK: 1130, mainBattleTanks: 12000, combatAircraft: 1400, majorWarships: 40, budgetBnUsd: 110, budgetPctGdp: 5.9, warheads: 5580 },
  IN: { activeTroopsK: 1450, mainBattleTanks: 3700, combatAircraft: 600, majorWarships: 35, budgetBnUsd: 83, budgetPctGdp: 2.4, warheads: 170 },
  JP: { activeTroopsK: 247, mainBattleTanks: 500, combatAircraft: 330, majorWarships: 50, budgetBnUsd: 55, budgetPctGdp: 1.2, warheads: 0 },
  DE: { activeTroopsK: 181, mainBattleTanks: 300, combatAircraft: 200, majorWarships: 12, budgetBnUsd: 66, budgetPctGdp: 1.5, warheads: 0 },
  GB: { activeTroopsK: 142, mainBattleTanks: 200, combatAircraft: 140, majorWarships: 20, budgetBnUsd: 75, budgetPctGdp: 2.2, warheads: 225 },
  FR: { activeTroopsK: 205, mainBattleTanks: 220, combatAircraft: 260, majorWarships: 25, budgetBnUsd: 61, budgetPctGdp: 2.1, warheads: 290 },
  TW: { activeTroopsK: 169, mainBattleTanks: 1000, combatAircraft: 280, majorWarships: 25, budgetBnUsd: 19, budgetPctGdp: 2.5, warheads: 0 },
  SA: { activeTroopsK: 257, mainBattleTanks: 900, combatAircraft: 300, majorWarships: 10, budgetBnUsd: 75, budgetPctGdp: 7.1, warheads: 0 },
  BR: { activeTroopsK: 366, mainBattleTanks: 400, combatAircraft: 70, majorWarships: 8, budgetBnUsd: 23, budgetPctGdp: 1.1, warheads: 0 },
  KR: { activeTroopsK: 500, mainBattleTanks: 2200, combatAircraft: 400, majorWarships: 25, budgetBnUsd: 46, budgetPctGdp: 2.7, warheads: 0 },
  AU: { activeTroopsK: 60, mainBattleTanks: 59, combatAircraft: 100, majorWarships: 11, budgetBnUsd: 33, budgetPctGdp: 2.0, warheads: 0 },
  IL: { activeTroopsK: 170, mainBattleTanks: 1300, combatAircraft: 340, majorWarships: 7, budgetBnUsd: 27, budgetPctGdp: 5.3, warheads: 90 },
  TR: { activeTroopsK: 355, mainBattleTanks: 2200, combatAircraft: 350, majorWarships: 20, budgetBnUsd: 21, budgetPctGdp: 2.2, warheads: 0 },
  IR: { activeTroopsK: 610, mainBattleTanks: 1500, combatAircraft: 190, majorWarships: 12, budgetBnUsd: 10, budgetPctGdp: 2.5, warheads: 0 },
  PK: { activeTroopsK: 650, mainBattleTanks: 2500, combatAircraft: 400, majorWarships: 12, budgetBnUsd: 10, budgetPctGdp: 2.8, warheads: 170 },
  KP: { activeTroopsK: 1280, mainBattleTanks: 4300, combatAircraft: 560, majorWarships: 3, budgetBnUsd: 4, budgetPctGdp: 20, warheads: 50 },
  UA: { activeTroopsK: 900, mainBattleTanks: 1000, combatAircraft: 120, majorWarships: 0, budgetBnUsd: 65, budgetPctGdp: 34, warheads: 0 },
  IT: { activeTroopsK: 165, mainBattleTanks: 200, combatAircraft: 240, majorWarships: 18, budgetBnUsd: 38, budgetPctGdp: 1.6, warheads: 0 },
};
