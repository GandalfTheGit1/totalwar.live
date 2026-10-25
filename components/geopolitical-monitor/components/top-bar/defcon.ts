/** top-bar/defcon.ts - global alert level from world tension and blocked straits. */
export function computeDefconLevel(tension: number, blockedCount: number): 1 | 2 | 3 | 4 | 5 {
  if (tension >= 80 || blockedCount >= 4) return 1;
  if (tension >= 65 || blockedCount >= 3) return 2;
  if (tension >= 45 || blockedCount >= 2) return 3;
  if (tension >= 25 || blockedCount >= 1) return 4;
  return 5;
}
