/**
 * lib/data/corporate-facilities/types.ts
 *
 * Types, visual styling configuration, and factory helper for SEC Item 2 corporate facilities.
 */

export type FacilityFunctionalType = 'HQ' | 'MANUFACTURING' | 'RND' | 'LOGISTICS_DATACENTER';
export type FacilityTenure = 'OWNED' | 'LEASED';

export interface CorporateFacility {
  id: string;
  ticker: string;
  name: string;
  city: string;
  stateProvince?: string;
  country: string;
  countryCode: string; // ISO-2
  lat: number;
  lng: number;
  functionalType: FacilityFunctionalType;
  tenure: FacilityTenure;
  sqFt: number;
  sqMeters: number;
  description: string;
  geopoliticalRiskScore?: number; // 0-10 scale
}

export const FACILITY_TYPE_CONFIG: Record<
  FacilityFunctionalType,
  {
    label: string;
    shortLabel: string;
    badgeClass: string;
    hexColor: string;
    iconGlyph: string;
    glowFilter: string;
  }
> = {
  HQ: {
    label: 'Sede Central Corporativa',
    shortLabel: 'HQ',
    badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    hexColor: '#38bdf8',
    iconGlyph: '🏢',
    glowFilter: 'url(#glow-cyan)',
  },
  MANUFACTURING: {
    label: 'Fabricación y Fundición Avanzada',
    shortLabel: 'Manufactura',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    hexColor: '#10b981',
    iconGlyph: '🏭',
    glowFilter: 'url(#glow-emerald)',
  },
  RND: {
    label: 'Investigación y Desarrollo (I+D)',
    shortLabel: 'I+D',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    hexColor: '#a855f7',
    iconGlyph: '🔬',
    glowFilter: 'url(#glow-indigo)',
  },
  LOGISTICS_DATACENTER: {
    label: 'Logística y Centros de Datos',
    shortLabel: 'Logística/Cloud',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    hexColor: '#f59e0b',
    iconGlyph: '📦',
    glowFilter: 'url(#glow-amber)',
  },
};

export const SQFT_TO_SQM = 0.092903;

export function makeFacility(
  data: Omit<CorporateFacility, 'sqMeters'> & { sqMeters?: number }
): CorporateFacility {
  return {
    ...data,
    sqMeters: data.sqMeters ?? Math.round(data.sqFt * SQFT_TO_SQM),
  };
}
