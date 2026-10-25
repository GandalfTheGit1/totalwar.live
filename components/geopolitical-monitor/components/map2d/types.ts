/**
 * components/dev/geopolitical-monitor/components/map2d/types.ts
 *
 * Type definitions and contracts for 2D D3 Mercator tactical map.
 */

import type {
  ActiveRelationsMap,
  CountryMockDataMap,
  GeoFeature,
  ThematicLayer,
  ThematicLayerMap,
  CorporateFacility,
  SubstitutionArc,
  MaritimeChokepointId,
  StrategicChokepointDefinition,
} from '../../types';

export interface Map2DProps {
  geoData: GeoFeature[];
  selectedCountry: GeoFeature | null;
  hoveredCountry: GeoFeature | null;
  activeMode: string;
  activeRelations: ActiveRelationsMap;
  countryMockData: CountryMockDataMap;
  activeLayer?: ThematicLayer;
  layerData?: ThematicLayerMap;
  facilities?: CorporateFacility[];
  selectedFacility?: CorporateFacility | null;
  substitutionArcs?: SubstitutionArc[];
  showMaritimeRoutes?: boolean;
  blockedChokepoints?: MaritimeChokepointId[];
  onToggleChokepoint?: (id: MaritimeChokepointId) => void;
  onFacilityHover?: (facility: CorporateFacility | null, event?: unknown) => void;
  onFacilityClick?: (facility: CorporateFacility, event?: unknown) => void;
  onArcHover?: (arc: SubstitutionArc | null, event?: unknown) => void;
  onArcClick?: (arc: SubstitutionArc) => void;
  onCountryHover: (feature: GeoFeature | null, event?: unknown) => void;
  onCountryClick: (feature: GeoFeature) => void;
  onBackgroundClick: () => void;
  isPanelOpen: boolean;
  containerDimensions: { width: number; height: number };
  claimsGeo?: any;
  onClaimHover?: (claim: any, event?: any) => void;
  onClaimClick?: (claim: any) => void;
}

export interface TooltipPos {
  x: number;
  y: number;
}

export interface ChokepointMarkerData extends StrategicChokepointDefinition {
  pt: [number, number];
  isBlocked: boolean;
}

export interface CountryTacticalStyle {
  fillColor: string;
  strokeColor: string;
  strokeWidth: string;
  filter: string;
}
