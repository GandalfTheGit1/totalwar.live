/**
 * @file curated-corporate-facilities.ts
 * @description Curated, pre-computed dataset of corporate facilities extracted from SEC 10-K Item 2 (Properties)
 * for major technological and industrial firms (AAPL, NVDA, TSM, MSFT, AMZN, GOOGL, TSLA, INTC, ASML, AMD, QCOM, META).
 * Features exact geographical coordinates, square footage, functional classification, tenure (OWNED vs LEASED),
 * and geopolitical risk ratings.
 */

import {
  FacilityFunctionalType,
  FacilityTenure,
  CorporateFacility,
  FACILITY_TYPE_CONFIG,
  makeFacility
} from './corporate-facilities/types';
import { APPLE_FACILITIES } from './corporate-facilities/apple';
import { MICROSOFT_FACILITIES, GOOGLE_FACILITIES } from './corporate-facilities/microsoft-google';
import { TSMC_FACILITIES } from './corporate-facilities/tsmc';
import { INTEL_FACILITIES, ASML_FACILITIES } from './corporate-facilities/litho-intel';
import { FABLESS_CHIPS_FACILITIES } from './corporate-facilities/fabless-chips';
import { HYPERSCALE_AUTO_FACILITIES } from './corporate-facilities/hyperscale-auto';

export type { FacilityFunctionalType, FacilityTenure, CorporateFacility };
export { FACILITY_TYPE_CONFIG, makeFacility };

export const CURATED_CORPORATE_FACILITIES: Record<string, CorporateFacility[]> = {
  AAPL: APPLE_FACILITIES,
  MSFT: MICROSOFT_FACILITIES,
  GOOGL: GOOGLE_FACILITIES,
  TSM: TSMC_FACILITIES,
  INTC: INTEL_FACILITIES,
  ASML: ASML_FACILITIES,
  ...FABLESS_CHIPS_FACILITIES,
  ...HYPERSCALE_AUTO_FACILITIES,
};
