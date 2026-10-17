import {
  CorporateFacility,
  FACILITY_TYPE_CONFIG,
  FacilityFunctionalType,
  FacilityTenure,
} from '@/lib/data/curated-corporate-facilities';

export type { CorporateFacility, FacilityFunctionalType, FacilityTenure };
export { FACILITY_TYPE_CONFIG };

export interface FacilityStats {
  totalFacilities: number;
  totalSqFt: number;
  totalSqMeters: number;
  ownedCount: number;
  leasedCount: number;
  ownedPercentage: number;
  leasedPercentage: number;
  byFunctionalType: Record<FacilityFunctionalType, number>;
  countryCodes: string[];
  averageRiskScore: number;
}

/**
 * Geocoding coordinate lookup fallback for common global cities if LLM omits lat/lng.
 */
export const CITY_COORDINATES_MAP: Record<string, { lat: number; lng: number; countryCode: string }> = {
  'cupertino': { lat: 37.3349, lng: -122.009, countryCode: 'US' },
  'austin': { lat: 30.2672, lng: -97.7431, countryCode: 'US' },
  'santa clara': { lat: 37.3541, lng: -121.9552, countryCode: 'US' },
  'mountain view': { lat: 37.3861, lng: -122.0839, countryCode: 'US' },
  'seattle': { lat: 47.6062, lng: -122.3321, countryCode: 'US' },
  'redmond': { lat: 47.674, lng: -122.1215, countryCode: 'US' },
  'san diego': { lat: 32.7157, lng: -117.1611, countryCode: 'US' },
  'fremont': { lat: 37.5485, lng: -121.9886, countryCode: 'US' },
  'hillsboro': { lat: 45.5229, lng: -122.9898, countryCode: 'US' },
  'chandler': { lat: 33.3062, lng: -111.8413, countryCode: 'US' },
  'phoenix': { lat: 33.4484, lng: -112.074, countryCode: 'US' },
  'hsinchu': { lat: 24.8039, lng: 120.9647, countryCode: 'TW' },
  'tainan': { lat: 22.9997, lng: 120.227, countryCode: 'TW' },
  'taichung': { lat: 24.1477, lng: 120.6736, countryCode: 'TW' },
  'veldhoven': { lat: 51.4172, lng: 5.4056, countryCode: 'NL' },
  'eindhoven': { lat: 51.4416, lng: 5.4697, countryCode: 'NL' },
  'cork': { lat: 51.8985, lng: -8.4756, countryCode: 'IE' },
  'dublin': { lat: 53.3498, lng: -6.2603, countryCode: 'IE' },
  'shanghai': { lat: 31.2304, lng: 121.4737, countryCode: 'CN' },
  'shenzhen': { lat: 22.5431, lng: 114.0579, countryCode: 'CN' },
  'tokyo': { lat: 35.6762, lng: 139.6503, countryCode: 'JP' },
  'kumamoto': { lat: 32.8032, lng: 130.7079, countryCode: 'JP' },
  'berlin': { lat: 52.52, lng: 13.405, countryCode: 'DE' },
  'dresden': { lat: 51.0504, lng: 13.7373, countryCode: 'DE' },
  'munich': { lat: 48.1351, lng: 11.582, countryCode: 'DE' },
  'frankfurt': { lat: 50.1109, lng: 8.6821, countryCode: 'DE' },
  'hyderabad': { lat: 17.385, lng: 78.4867, countryCode: 'IN' },
  'bengaluru': { lat: 12.9716, lng: 77.5946, countryCode: 'IN' },
  'bangalore': { lat: 12.9716, lng: 77.5946, countryCode: 'IN' },
  'pune': { lat: 18.5204, lng: 73.8567, countryCode: 'IN' },
  'penang': { lat: 5.4141, lng: 100.3288, countryCode: 'MY' },
  'singapore': { lat: 1.3521, lng: 103.8198, countryCode: 'SG' },
  'seoul': { lat: 37.5665, lng: 126.978, countryCode: 'KR' },
  'tel aviv': { lat: 32.0853, lng: 34.7818, countryCode: 'IL' },
  'haifa': { lat: 32.794, lng: 34.9896, countryCode: 'IL' },
};
