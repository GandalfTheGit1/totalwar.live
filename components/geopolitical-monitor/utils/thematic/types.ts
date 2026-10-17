/**
 * components/dev/geopolitical-monitor/utils/thematic/types.ts
 *
 * Types and configuration interfaces for Thematic Layers.
 */

export interface CorporateFootprintCountryConfig {
  code: string;
  intensity?: number;
  label?: string;
  sublabel?: string;
  colorCategory?: 'critical' | 'high' | 'medium' | 'low';
}

export interface CorporateFootprintConfig {
  headquarters?: CorporateFootprintCountryConfig;
  consolidatedManufacturing?: CorporateFootprintCountryConfig[];
  expansionMarkets?: CorporateFootprintCountryConfig[];
}
