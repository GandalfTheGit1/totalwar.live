/**
 * lib/services/sovereign-power/benchmarks.ts
 *
 * Sovereign Power benchmarks, global average reference baselines,
 * and DEFCON tactical alert level constants for Dalio 6-Pillar framework.
 */

import { 
  SovereignRadarScores, 
  BenchmarkSuperpower, 
  DefconLevel, 
  DefconStatus 
} from '../../types/sovereign-power';

/**
 * Global average benchmark across all 45 monitored sovereign nations.
 * Serves as the normalized radar centerpoint.
 */
export const GLOBAL_AVERAGE_SCORES: SovereignRadarScores = {
  techInnovation: 45,
  politicalCabinet: 50,
  currencyHegemony: 36,
  tradeCompetitiveness: 48,
  militaryCapacity: 38,
  institutionalStability: 52
};

/**
 * Calibrated sovereign radar benchmarks for global superpowers (US, CN, RU).
 * Used for comparative radar overlays and relative strength assessments.
 */
export const SUPERPOWER_BENCHMARKS: Record<
  BenchmarkSuperpower, 
  { name: string; flag: string; scores: SovereignRadarScores }
> = {
  US: {
    name: 'Estados Unidos',
    flag: '🇺🇸',
    scores: {
      techInnovation: 96,
      politicalCabinet: 72,
      currencyHegemony: 98,
      tradeCompetitiveness: 82,
      militaryCapacity: 99,
      institutionalStability: 78
    }
  },
  CN: {
    name: 'China',
    flag: '🇨🇳',
    scores: {
      techInnovation: 90,
      politicalCabinet: 88,
      currencyHegemony: 68,
      tradeCompetitiveness: 98,
      militaryCapacity: 88,
      institutionalStability: 82
    }
  },
  RU: {
    name: 'Rusia',
    flag: '🇷🇺',
    scores: {
      techInnovation: 65,
      politicalCabinet: 78,
      currencyHegemony: 42,
      tradeCompetitiveness: 60,
      militaryCapacity: 92,
      institutionalStability: 64
    }
  }
};

/**
 * Tactical DEFCON operational readiness levels (1 = Maximum nuclear/war readiness, 5 = Peace).
 * Colors and styling adhere to the Oráculo terminal design tokens.
 */
export const DEFCON_LEVELS: Record<DefconLevel, DefconStatus> = {
  5: {
    level: 5,
    codeName: 'FADE OUT',
    color: '#10b981', // Emerald
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Paz normal. Disuasión estable y monitoreo de rutina.'
  },
  4: {
    level: 4,
    codeName: 'DOUBLE TAKE',
    color: '#3b82f6', // Blue
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    description: 'Vigilancia incrementada. Fricciones comerciales o cibernéticas detectadas.'
  },
  3: {
    level: 3,
    codeName: 'ROUND HOUSE',
    color: '#eab308', // Amber/Yellow
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'Alerta táctica elevada. Fuerzas militares en preaviso, sanciones activadas.'
  },
  2: {
    level: 2,
    codeName: 'FAST PACE',
    color: '#f97316', // Orange
    badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    description: 'Crisis aguda inminente. Movilización de tropas y bloqueo de suministros.'
  },
  1: {
    level: 1,
    codeName: 'COCKED PISTOL',
    color: '#ef4444', // Red
    badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse',
    description: 'Máxima alerta bélica. Guerra nuclear o colapso soberano inminente.'
  }
};
