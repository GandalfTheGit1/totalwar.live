export interface SovereignYieldItem {
  country: string;
  code: string;
  tenor10Y: number;
  tenor2Y: number;
  spread: number;
  policyRate: number;
}

export interface WorldBankLpiItem {
  economy: string;
  code: string;
  score: number;
  customs: number;
  infrastructure: number;
  timeliness: number;
  tier: 'High' | 'Medium' | 'Low';
}

// Refactor reason: Extracted static macro calibration matrices out of page component to optimize bundle size and reuse.
export const SAMPLE_SOVEREIGN_RATES: SovereignYieldItem[] = [
  { country: 'Estados Unidos', code: 'US', tenor10Y: 4.42, tenor2Y: 4.02, spread: 0.40, policyRate: 4.75 },
  { country: 'Alemania (Bund)', code: 'DE', tenor10Y: 2.38, tenor2Y: 2.12, spread: 0.26, policyRate: 3.25 },
  { country: 'Japón (JGB)', code: 'JP', tenor10Y: 1.05, tenor2Y: 0.45, spread: 0.60, policyRate: 0.25 },
  { country: 'Reino Unido (Gilt)', code: 'GB', tenor10Y: 4.28, tenor2Y: 4.05, spread: 0.23, policyRate: 4.75 },
  { country: 'Suiza', code: 'CH', tenor10Y: 0.52, tenor2Y: 0.38, spread: 0.14, policyRate: 1.00 },
  { country: 'China (Gov Bond)', code: 'CN', tenor10Y: 2.10, tenor2Y: 1.48, spread: 0.62, policyRate: 3.10 },
];

export const SAMPLE_LPI_SCORES: WorldBankLpiItem[] = [
  { economy: 'Singapur', code: 'SG', score: 4.30, customs: 4.20, infrastructure: 4.60, timeliness: 4.30, tier: 'High' },
  { economy: 'Finlandia', code: 'FI', score: 4.20, customs: 4.10, infrastructure: 4.30, timeliness: 4.30, tier: 'High' },
  { economy: 'Alemania', code: 'DE', score: 4.10, customs: 3.90, infrastructure: 4.30, timeliness: 4.10, tier: 'High' },
  { economy: 'Estados Unidos', code: 'US', score: 3.90, customs: 3.70, infrastructure: 4.00, timeliness: 4.00, tier: 'High' },
  { economy: 'Taiwán', code: 'TW', score: 3.80, customs: 3.65, infrastructure: 3.90, timeliness: 3.85, tier: 'Medium' },
  { economy: 'México', code: 'MX', score: 2.90, customs: 2.70, infrastructure: 2.80, timeliness: 3.10, tier: 'Medium' },
];
