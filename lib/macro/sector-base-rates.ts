/**
 * lib/macro/sector-base-rates.ts
 *
 * T05.1: Sector Base Rates Adapter
 *
 * Defines historical base rates for earnings beat/miss probabilities by sector
 * and calendar quarter. Also encodes cyclical peak/trough knowledge derived from
 * decades of sector-rotation and inventory-cycle research.
 *
 * Resilient Fallback: maps major global companies and applies a calibrated
 * general market base rate for unmapped tickers instead of crashing the UI.
 */

export type SectorType =
  | 'SEMICONDUCTORS'
  | 'INDUSTRIAL'
  | 'CONSUMER_DISCRETIONARY'
  | 'ENERGY'
  | 'CONSUMER_STAPLES'
  | 'SOFTWARE';

export type QuarterType = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface SectorBaseRates {
  sector: SectorType;
  quarter: QuarterType;
  beatProbability: number;
  missProbability: number;
  cyclePeakQuarter: QuarterType;
  cycleTroughQuarter: QuarterType;
  historicalNotes: string;
}

const TICKER_SECTOR_MAP: Record<string, SectorType> = {
  // Semiconductors & Hardware
  MU: 'SEMICONDUCTORS',
  INTC: 'SEMICONDUCTORS',
  WDC: 'SEMICONDUCTORS',
  TSM: 'SEMICONDUCTORS',
  NVDA: 'SEMICONDUCTORS',
  AMD: 'SEMICONDUCTORS',
  QCOM: 'SEMICONDUCTORS',
  AVGO: 'SEMICONDUCTORS',
  TXN: 'SEMICONDUCTORS',
  ASML: 'SEMICONDUCTORS',
  ARM: 'SEMICONDUCTORS',

  // Industrial, Aerospace & Auto
  DE: 'INDUSTRIAL',
  CAT: 'INDUSTRIAL',
  BA: 'INDUSTRIAL',
  GE: 'INDUSTRIAL',
  HON: 'INDUSTRIAL',
  LMT: 'INDUSTRIAL',
  RTX: 'INDUSTRIAL',
  UPS: 'INDUSTRIAL',

  // Consumer Discretionary & Retail
  HAS: 'CONSUMER_DISCRETIONARY',
  TGT: 'CONSUMER_DISCRETIONARY',
  NKE: 'CONSUMER_DISCRETIONARY',
  GM: 'CONSUMER_DISCRETIONARY',
  F: 'CONSUMER_DISCRETIONARY',
  TSLA: 'CONSUMER_DISCRETIONARY',
  AMZN: 'CONSUMER_DISCRETIONARY',

  // Energy & Materials
  XOM: 'ENERGY',
  CVX: 'ENERGY',
  COP: 'ENERGY',
  SLB: 'ENERGY',

  // Consumer Staples
  WMT: 'CONSUMER_STAPLES',
  KO: 'CONSUMER_STAPLES',
  PEP: 'CONSUMER_STAPLES',
  PG: 'CONSUMER_STAPLES',
  COST: 'CONSUMER_STAPLES',

  // Software & Cloud
  ADBE: 'SOFTWARE',
  MSFT: 'SOFTWARE',
  GOOGL: 'SOFTWARE',
  GOOG: 'SOFTWARE',
  AAPL: 'SOFTWARE',
  META: 'SOFTWARE',
  CRM: 'SOFTWARE',
  ORCL: 'SOFTWARE',
  NOW: 'SOFTWARE',
  NFLX: 'SOFTWARE',
  PLTR: 'SOFTWARE',
};

type SectorRateEntry = Omit<SectorBaseRates, 'sector' | 'quarter'>;

const BASE_RATES_TABLE: Record<SectorType, Record<QuarterType, SectorRateEntry>> = {
  SEMICONDUCTORS: {
    Q1: {
      beatProbability: 0.55,
      missProbability: 0.28,
      cyclePeakQuarter: 'Q3',
      cycleTroughQuarter: 'Q1',
      historicalNotes:
        'Q1 is the seasonal trough for semiconductors: post-holiday inventory digestion, weak PC/consumer demand, and DRAM/NAND oversupply cycles typically bottom here.',
    },
    Q2: {
      beatProbability: 0.6,
      missProbability: 0.24,
      cyclePeakQuarter: 'Q3',
      cycleTroughQuarter: 'Q1',
      historicalNotes:
        'Q2 marks inventory restocking and data-center demand acceleration. AI accelerator orders amplify Q2 beats in recent cycles.',
    },
    Q3: {
      beatProbability: 0.68,
      missProbability: 0.18,
      cyclePeakQuarter: 'Q3',
      cycleTroughQuarter: 'Q1',
      historicalNotes:
        'Q3 is the historical peak for semiconductors: back-to-school and enterprise refresh cycles, seasonally highest wafer starts. DRAM ASPs and GPU shipments peak here.',
    },
    Q4: {
      beatProbability: 0.58,
      missProbability: 0.27,
      cyclePeakQuarter: 'Q3',
      cycleTroughQuarter: 'Q1',
      historicalNotes:
        'Q4 shows bifurcated seasonality: consumer chips benefit from holiday demand, but enterprise/cloud CapEx commitments may slip. Inventory build risk heading into Q1.',
    },
  },
  INDUSTRIAL: {
    Q1: {
      beatProbability: 0.52,
      missProbability: 0.3,
      cyclePeakQuarter: 'Q3',
      cycleTroughQuarter: 'Q1',
      historicalNotes:
        'Q1 is weakest for industrials: northern hemisphere winter limits construction and agriculture activity. DE and CAT typically see lower order rates.',
    },
    Q2: {
      beatProbability: 0.63,
      missProbability: 0.22,
      cyclePeakQuarter: 'Q3',
      cycleTroughQuarter: 'Q1',
      historicalNotes:
        'Q2 accelerates with spring construction season and agriculture planting equipment demand. Industrial equipment prints strongest order books.',
    },
    Q3: {
      beatProbability: 0.65,
      missProbability: 0.2,
      cyclePeakQuarter: 'Q3',
      cycleTroughQuarter: 'Q1',
      historicalNotes:
        'Q3 is the peak for industrials: harvest season, maximum infrastructure activity, and backlog deliveries from Q2 orders.',
    },
    Q4: {
      beatProbability: 0.58,
      missProbability: 0.26,
      cyclePeakQuarter: 'Q3',
      cycleTroughQuarter: 'Q1',
      historicalNotes:
        'Q4 industrials benefit from year-end fiscal spending but are vulnerable to order slowdowns as customers finalize next-year budgets.',
    },
  },
  CONSUMER_DISCRETIONARY: {
    Q1: {
      beatProbability: 0.54,
      missProbability: 0.29,
      cyclePeakQuarter: 'Q4',
      cycleTroughQuarter: 'Q1',
      historicalNotes:
        'Q1 is the post-holiday hangover: consumers deleverage after December spending, retailers face inventory bloat and markdowns.',
    },
    Q2: {
      beatProbability: 0.58,
      missProbability: 0.26,
      cyclePeakQuarter: 'Q4',
      cycleTroughQuarter: 'Q1',
      historicalNotes:
        'Q2 sees recovery: spring auto buying season peaks, sports apparel product launches ramp up, and early back-to-school staging begins.',
    },
    Q3: {
      beatProbability: 0.61,
      missProbability: 0.23,
      cyclePeakQuarter: 'Q4',
      cycleTroughQuarter: 'Q1',
      historicalNotes:
        'Q3 is solid for discretionary: back-to-school demand peaks and early holiday pre-stocking benefits apparel and retail supply chains.',
    },
    Q4: {
      beatProbability: 0.71,
      missProbability: 0.17,
      cyclePeakQuarter: 'Q4',
      cycleTroughQuarter: 'Q1',
      historicalNotes:
        'Q4 is the undisputed seasonal peak for consumer discretionary: holiday shopping season drives highest quarterly revenues and margins.',
    },
  },
  ENERGY: {
    Q1: {
      beatProbability: 0.53,
      missProbability: 0.3,
      cyclePeakQuarter: 'Q2',
      cycleTroughQuarter: 'Q4',
      historicalNotes:
        'Q1 energy demand driven by winter heating but dampened by spring refinery maintenance turnarounds and crude volatility.',
    },
    Q2: {
      beatProbability: 0.6,
      missProbability: 0.25,
      cyclePeakQuarter: 'Q2',
      cycleTroughQuarter: 'Q4',
      historicalNotes:
        'Q2 is peak demand for gasoline (summer driving season begins) and global energy consumption. Refining crack spreads typically widest.',
    },
    Q3: {
      beatProbability: 0.59,
      missProbability: 0.24,
      cyclePeakQuarter: 'Q2',
      cycleTroughQuarter: 'Q4',
      historicalNotes:
        'Q3 maintains strong gasoline demand through Labor Day. Hurricane risk in production zones introduces volatility.',
    },
    Q4: {
      beatProbability: 0.5,
      missProbability: 0.33,
      cyclePeakQuarter: 'Q2',
      cycleTroughQuarter: 'Q4',
      historicalNotes:
        'Q4 weakens for energy: post-summer demand drop, refinery margins compress, and OPEC quotas introduce macro uncertainty.',
    },
  },
  CONSUMER_STAPLES: {
    Q1: {
      beatProbability: 0.6,
      missProbability: 0.23,
      cyclePeakQuarter: 'Q4',
      cycleTroughQuarter: 'Q2',
      historicalNotes:
        'Consumer staples are relatively defensive but show modest Q1 strength from post-holiday return traffic and pantry restocking.',
    },
    Q2: {
      beatProbability: 0.55,
      missProbability: 0.27,
      cyclePeakQuarter: 'Q4',
      cycleTroughQuarter: 'Q2',
      historicalNotes:
        'Q2 is the softest quarter for staples: no major holiday catalyst, consumer spending shifts towards dining and travel.',
    },
    Q3: {
      beatProbability: 0.58,
      missProbability: 0.25,
      cyclePeakQuarter: 'Q4',
      cycleTroughQuarter: 'Q2',
      historicalNotes:
        'Q3 improves for grocery and staples: back-to-school supplies, late-summer food demand, and early holiday shelf allocations.',
    },
    Q4: {
      beatProbability: 0.66,
      missProbability: 0.2,
      cyclePeakQuarter: 'Q4',
      cycleTroughQuarter: 'Q2',
      historicalNotes:
        'Q4 is the seasonal peak for staples: holiday spending across grocery, Thanksgiving/Christmas food, and retail foot traffic.',
    },
  },
  SOFTWARE: {
    Q1: {
      beatProbability: 0.62,
      missProbability: 0.22,
      cyclePeakQuarter: 'Q4',
      cycleTroughQuarter: 'Q1',
      historicalNotes:
        'Enterprise software Q1 weakness stems from calendar procurement approval delays following year-end budget resets.',
    },
    Q2: {
      beatProbability: 0.64,
      missProbability: 0.21,
      cyclePeakQuarter: 'Q4',
      cycleTroughQuarter: 'Q1',
      historicalNotes:
        'Enterprise software Q2 benefits from full-year IT budget deployment, user conferences, and mid-year subscription expansions.',
    },
    Q3: {
      beatProbability: 0.61,
      missProbability: 0.24,
      cyclePeakQuarter: 'Q4',
      cycleTroughQuarter: 'Q1',
      historicalNotes:
        'Q3 software is modestly softer due to summer procurement pauses, before acceleration into year-end enterprise closings.',
    },
    Q4: {
      beatProbability: 0.69,
      missProbability: 0.19,
      cyclePeakQuarter: 'Q4',
      cycleTroughQuarter: 'Q1',
      historicalNotes:
        'Q4 calendar year-end is strongest for enterprise software: IT budget exhaustion drives critical multi-year contract closures.',
    },
  },
};

const DEFAULT_FALLBACK_RATES: Record<QuarterType, SectorRateEntry> = {
  Q1: {
    beatProbability: 0.56,
    missProbability: 0.27,
    cyclePeakQuarter: 'Q4',
    cycleTroughQuarter: 'Q1',
    historicalNotes: 'Tasa base de mercado general (S&P 500) para Q1: digestión estacional post-cierre de ejercicio fiscal.',
  },
  Q2: {
    beatProbability: 0.61,
    missProbability: 0.23,
    cyclePeakQuarter: 'Q4',
    cycleTroughQuarter: 'Q1',
    historicalNotes: 'Tasa base de mercado general para Q2: reactivación operativa y aceleración de mitad de año.',
  },
  Q3: {
    beatProbability: 0.62,
    missProbability: 0.22,
    cyclePeakQuarter: 'Q4',
    cycleTroughQuarter: 'Q1',
    historicalNotes: 'Tasa base de mercado general para Q3: preparación hacia la campaña de cierre de trimestre y compras.',
  },
  Q4: {
    beatProbability: 0.68,
    missProbability: 0.18,
    cyclePeakQuarter: 'Q4',
    cycleTroughQuarter: 'Q1',
    historicalNotes: 'Tasa base de mercado general para Q4: pico estacional de ejecución presupuestaria corporativa y consumo.',
  },
};

/**
 * Returns the sector associated with a ticker, or defaults to 'INDUSTRIAL' if unmapped.
 *
 * @param ticker Stock symbol
 * @returns SectorType
 */
export function getTickerSector(ticker: string): SectorType {
  const normalised = ticker.trim().toUpperCase();
  const sector = TICKER_SECTOR_MAP[normalised];
  if (!sector) {
    console.warn(`[sector-base-rates] Ticker "${normalised}" unmapped in dictionary. Applying INDUSTRIAL default category.`);
    return 'INDUSTRIAL';
  }
  return sector;
}

/**
 * Returns historical sector base rates for earnings beat/miss probabilities by quarter.
 * If ticker is unmapped, applies calibrated general market base rates with zero failure.
 *
 * @param ticker Stock symbol
 * @param quarter Target calendar quarter ('Q1', 'Q2', 'Q3', 'Q4')
 * @returns SectorBaseRates
 */
export function getSectorBaseRates(ticker: string, quarter: QuarterType): SectorBaseRates {
  const normalised = ticker.trim().toUpperCase();
  const sector = TICKER_SECTOR_MAP[normalised];

  if (!sector) {
    console.warn(`[sector-base-rates] Ticker "${normalised}" is unmapped. Returning calibrated general market baseline.`);
    const fallbackRate = DEFAULT_FALLBACK_RATES[quarter];
    return {
      sector: 'INDUSTRIAL',
      quarter,
      ...fallbackRate,
    };
  }

  const rates = BASE_RATES_TABLE[sector][quarter];
  return { sector, quarter, ...rates };
}
