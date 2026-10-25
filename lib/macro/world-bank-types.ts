// Module: lib/macro/world-bank-types.ts
// Canonical type definitions and indicator constants for the World Bank (Banco Mundial / BIRF) API v2.

/**
 * Standard World Bank v2 pagination header (element 0 in response array).
 */
export interface WorldBankPaginationHeader {
  page: number;
  pages: number;
  per_page: number;
  total: number;
  sourceid?: string;
  sourcename?: string;
  lastupdated?: string;
}

/**
 * Raw observation item returned by the World Bank API (element in array at index 1).
 */
export interface WorldBankRawRecord {
  indicator: { id: string; value: string };
  country: { id: string; value: string };
  countryiso3code: string;
  date: string;
  value: number | string | null;
  unit?: string;
  obs_status?: string;
  decimal?: number;
}

/**
 * Standard parsed observation record for consumption throughout the application.
 */
export interface WorldBankObservation {
  indicatorId: string;
  indicatorName: string;
  countryCode: string; // ISO-2 or short code (e.g., 'US')
  countryIso3: string; // ISO-3 normalized code (e.g., 'USA')
  countryName: string; // Official country name
  year: number;        // Calendar year
  date?: string;       // Raw date string (e.g. '2022', '2022Q1', '2022M01')
  value: number | null;
}

/**
 * Mapping of country ISO3 code to LPI score.
 */
export type WorldBankLpiScoreMap = Record<string, number>;

/**
 * Options for querying World Bank indicators.
 */
export interface WorldBankFetchOptions {
  mrv?: number;                    // Most recent values count (e.g. 1)
  date?: string;                   // Date range or single year (e.g. '2020:2024' or '2023')
  perPage?: number;                // Records per page (default: 300)
  page?: number;                   // Page number (default: 1)
  revalidateSeconds?: number;      // Next.js ISR cache duration in seconds (default: 7 days)
  filterNullValues?: boolean;      // Filter out observations where value is null (default: false)
  delayBetweenRequestsMs?: number; // Delay between sequential batch requests to avoid quota strain (default: 50ms)
}

/**
 * Macroeconomic profile aggregating key World Bank structural indicators for a country.
 */
export interface WorldBankMacroProfile {
  countryCode: string;
  countryIso3: string;
  countryName?: string;
  year?: number;
  interestPaymentsPctRevenue: number | null;     // GC.XPN.INTP.RV.ZS
  fxReservesMonthsImport: number | null;         // FI.RES.TOTL.MO
  grossCapitalFormationPctGdp: number | null;    // NE.GDI.FTOT.ZS
  manufacturingValueAddedPctGdp: number | null;  // NV.IND.MANF.ZS
  gdpPerCapitaUsd: number | null;                // NY.GDP.PCAP.CD
  urbanPopulationConcentrationPct: number | null;// EN.URB.MCTY.TL.ZS
  naturalResourceRentsPctGdp: number | null;     // NY.GDP.TOTL.RT.ZS
  lpiOverall: number | null;                     // LP.LPI.OVRL.XQ
  lpiInfrastructure: number | null;              // LP.LPI.INFR.XQ
  lpiTrackingTracing: number | null;             // LP.LPI.TRAC.XQ
  lpiShipments: number | null;                   // LP.LPI.ITRN.XQ
  lpiCustoms: number | null;                     // LP.LPI.CUST.XQ
  rawIndicators: Record<string, number | null>;
}

/**
 * Common canonical World Bank indicator IDs used across macro and supply-chain modules.
 */
export const WORLD_BANK_INDICATORS = {
  // Logistics Performance Index (LPI)
  LPI_OVERALL: 'LP.LPI.OVRL.XQ',
  LPI_INFRASTRUCTURE: 'LP.LPI.INFR.XQ',
  LPI_TRACKING: 'LP.LPI.TRAC.XQ',
  LPI_SHIPMENTS: 'LP.LPI.ITRN.XQ',
  LPI_CUSTOMS: 'LP.LPI.CUST.XQ',

  // Macro, Debt & Reserves
  INTEREST_PAYMENTS_PCT_REVENUE: 'GC.XPN.INTP.RV.ZS',
  FX_RESERVES_MONTHS_IMPORT: 'FI.RES.TOTL.MO',
  GROSS_CAPITAL_FORMATION_PCT_GDP: 'NE.GDI.FTOT.ZS',
  MANUFACTURING_PCT_GDP: 'NV.IND.MANF.ZS',
  GDP_PER_CAPITA_USD: 'NY.GDP.PCAP.CD',
  URBAN_AGGLOMERATION_PCT: 'EN.URB.MCTY.TL.ZS',
  NATURAL_RESOURCE_RENTS_PCT: 'NY.GDP.TOTL.RT.ZS',
  POPULATION_TOTAL: 'SP.POP.TOTL',

  // Education & Human Capital
  EDUCATION_TERTIARY_ENROLLMENT: 'SE.TER.ENRR',
  EDUCATION_EXPENDITURE_PCT_GDP: 'SE.XPD.TOTL.GD.ZS',
  RD_EXPENDITURE_PCT_GDP: 'GB.XPD.RSDV.GD.ZS',
  PATENT_APPLICATIONS_RESIDENTS: 'IP.PAT.RESD',
} as const;
