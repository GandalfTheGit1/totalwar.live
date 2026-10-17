/**
 * components/geographic-operations/facilities/types.ts
 *
 * Types and contracts for corporate facilities map and directory views.
 */

import { Company } from '@/lib/types';
import {
  CorporateFacility,
  FacilityFunctionalType,
  FacilityStats
} from '@/lib/services/geographic/sec-properties-service';

export interface CorporateFacilitiesMapProps {
  company: Company;
  selectedCountryCode?: string | null;
  onSelectCountry?: (code: string) => void;
}

export type FacilityCategoryFilter = FacilityFunctionalType | 'ALL';

export interface PopoverPosition {
  x: number;
  y: number;
}

export interface FacilitiesKpiStripProps {
  stats: FacilityStats;
}

export interface FacilitiesFilterBarProps {
  stats: FacilityStats;
  functionalFilter: FacilityCategoryFilter;
  searchQuery: string;
  onFilterChange: (filter: FacilityCategoryFilter) => void;
  onSearchChange: (query: string) => void;
}

export interface FacilitiesDirectoryListProps {
  facilities: CorporateFacility[];
  selectedFacility: CorporateFacility | null;
  isLoading: boolean;
  onSelectFacility: (facility: CorporateFacility) => void;
}
