/**
 * components/dev/geopolitical-monitor/components/map2d/country-styler.ts
 *
 * Tactical styling calculator for SVG country polygon paths.
 */

import type {
  ActiveRelationsMap,
  CountryMockDataMap,
  GeoFeature,
  ThematicLayer,
  ThematicLayerMap,
} from '../../types';
import { getRiskAppearance } from '../../utils/geo-helpers';
import { resolveThematicCountryData } from '../../hooks/useThematicLayerData';
import type { CountryTacticalStyle } from './types';

const THEMATIC_PALETTE: Record<string, { fill: string; stroke: string; width: string; filter: string }> = {
  critical: { fill: 'rgba(239, 68, 68, 0.7)', stroke: '#ef4444', width: '1.2px', filter: 'url(#glow-rose)' },
  high: { fill: 'rgba(249, 115, 22, 0.6)', stroke: '#f97316', width: '1.1px', filter: 'url(#glow-amber)' },
  medium: { fill: 'rgba(234, 179, 8, 0.5)', stroke: '#eab308', width: '1.0px', filter: 'url(#glow-amber)' },
  low: { fill: 'rgba(34, 197, 94, 0.4)', stroke: '#22c55e', width: '0.9px', filter: 'url(#glow-emerald)' },
  none: { fill: 'rgba(15, 23, 42, 0.25)', stroke: 'rgba(51, 65, 85, 0.3)', width: '0.6px', filter: 'none' },
  default: { fill: 'rgba(15, 23, 42, 0.25)', stroke: 'rgba(51, 65, 85, 0.3)', width: '0.6px', filter: 'none' },
};

const THEMATIC_HOVER_PALETTE: Record<string, { fill: string; stroke: string; width: string; filter: string }> = {
  critical: { fill: 'rgba(239, 68, 68, 0.85)', stroke: '#ef4444', width: '1.8px', filter: 'url(#glow-rose)' },
  high: { fill: 'rgba(249, 115, 22, 0.8)', stroke: '#f97316', width: '1.6px', filter: 'url(#glow-amber)' },
  medium: { fill: 'rgba(234, 179, 8, 0.75)', stroke: '#eab308', width: '1.5px', filter: 'url(#glow-amber)' },
  low: { fill: 'rgba(34, 197, 94, 0.65)', stroke: '#22c55e', width: '1.4px', filter: 'url(#glow-emerald)' },
  none: { fill: 'rgba(56, 189, 248, 0.25)', stroke: '#7dd3fc', width: '1.4px', filter: 'url(#glow-cyan)' },
  default: { fill: 'rgba(56, 189, 248, 0.25)', stroke: '#7dd3fc', width: '1.4px', filter: 'url(#glow-cyan)' },
};

function getThematicBaseStyle(
  d: GeoFeature,
  layerData: ThematicLayerMap,
  mockData: CountryMockDataMap
): CountryTacticalStyle {
  const item = resolveThematicCountryData(d, layerData, mockData);
  const conf = item && THEMATIC_PALETTE[item.colorCategory]
    ? THEMATIC_PALETTE[item.colorCategory]
    : THEMATIC_PALETTE.default;
  return { fillColor: conf.fill, strokeColor: conf.stroke, strokeWidth: conf.width, filter: conf.filter };
}

function getRelationsBaseStyle(
  d: GeoFeature,
  activeRelations: ActiveRelationsMap,
  selectedCountry: GeoFeature | null
): CountryTacticalStyle | null {
  if (!selectedCountry) return null;
  const rel = activeRelations?.[d.polyId];
  if (rel) {
    if (rel.type === 'ALLIED' || rel.type === 'STRATEGIC_ALLY' || rel.type === 'ally') {
      return { fillColor: 'rgba(16, 185, 129, 0.32)', strokeColor: '#10b981', strokeWidth: '1.5px', filter: 'url(#glow-emerald)' };
    }
    if (rel.type === 'ECONOMIC_PARTNER' || (rel.type as string) === 'economic_partner') {
      return { fillColor: 'rgba(129, 140, 248, 0.35)', strokeColor: '#818cf8', strokeWidth: '1.4px', filter: 'url(#glow-indigo)' };
    }
    if (rel.type === 'FRICTION_STRATEGIC_COMPETITION' || rel.type === 'SANCTIONED_ADVERSARIAL' || rel.type === 'conflict') {
      return { fillColor: 'rgba(244, 63, 94, 0.38)', strokeColor: '#f43f5e', strokeWidth: '1.8px', filter: 'url(#glow-rose)' };
    }
    if (rel.type === 'NEUTRAL_COMMERCIAL' || rel.type === 'neutral') {
      return { fillColor: 'rgba(245, 158, 11, 0.3)', strokeColor: '#f59e0b', strokeWidth: '1.2px', filter: 'url(#glow-amber)' };
    }
    return { fillColor: 'rgba(100, 116, 139, 0.3)', strokeColor: '#94a3b8', strokeWidth: '1.2px', filter: 'none' };
  }
  if (selectedCountry.polyId !== d.polyId) {
    return { fillColor: 'rgba(51, 65, 85, 0.35)', strokeColor: 'rgba(100, 116, 139, 0.4)', strokeWidth: '0.6px', filter: 'none' };
  }
  return null;
}

function getRiskOrNewsStyle(activeMode: string, risk: number): CountryTacticalStyle {
  if (activeMode === 'news') {
    if (risk >= 65) {
      const app = getRiskAppearance(100);
      return { fillColor: app.color, strokeColor: app.stroke, strokeWidth: '0.9px', filter: 'none' };
    }
    return { fillColor: 'rgba(15, 23, 42, 0.6)', strokeColor: 'rgba(71, 85, 105, 0.3)', strokeWidth: '0.6px', filter: 'none' };
  }
  const app = getRiskAppearance(risk);
  return { fillColor: app.color, strokeColor: app.stroke, strokeWidth: '0.85px', filter: 'none' };
}

function getHoverRelationsStyle(d: GeoFeature, activeRelations: ActiveRelationsMap): CountryTacticalStyle {
  const rel = activeRelations?.[d.polyId];
  if (!rel) {
    return { fillColor: 'rgba(148, 163, 184, 0.25)', strokeColor: 'rgba(148, 163, 184, 0.6)', strokeWidth: '1.2px', filter: 'none' };
  }
  if (rel.type === 'ALLIED' || rel.type === 'STRATEGIC_ALLY' || rel.type === 'ally') {
    return { fillColor: 'rgba(16, 185, 129, 0.55)', strokeColor: '#10b981', strokeWidth: '2px', filter: 'url(#glow-emerald)' };
  }
  if (rel.type === 'ECONOMIC_PARTNER' || (rel.type as string) === 'economic_partner') {
    return { fillColor: 'rgba(129, 140, 248, 0.55)', strokeColor: '#a5b4fc', strokeWidth: '2px', filter: 'url(#glow-indigo)' };
  }
  if (rel.type === 'FRICTION_STRATEGIC_COMPETITION' || rel.type === 'SANCTIONED_ADVERSARIAL' || rel.type === 'conflict') {
    return { fillColor: 'rgba(244, 63, 94, 0.55)', strokeColor: '#f43f5e', strokeWidth: '2px', filter: 'url(#glow-rose)' };
  }
  if (rel.type === 'NEUTRAL_COMMERCIAL' || rel.type === 'neutral') {
    return { fillColor: 'rgba(245, 158, 11, 0.5)', strokeColor: '#f59e0b', strokeWidth: '2px', filter: 'url(#glow-amber)' };
  }
  return { fillColor: 'rgba(148, 163, 184, 0.45)', strokeColor: '#94a3b8', strokeWidth: '1.6px', filter: 'none' };
}

function getHoverCountryStyle(
  d: GeoFeature,
  activeMode: string,
  activeLayer: ThematicLayer | undefined,
  layerData: ThematicLayerMap,
  mockData: CountryMockDataMap,
  activeRelations: ActiveRelationsMap,
  selectedCountry: GeoFeature | null
): CountryTacticalStyle {
  if (activeMode === 'risk' && activeLayer && activeLayer !== 'none') {
    const item = resolveThematicCountryData(d, layerData, mockData);
    if (!item) {
      return { fillColor: 'rgba(56, 189, 248, 0.25)', strokeColor: '#7dd3fc', strokeWidth: '1.2px', filter: 'url(#glow-cyan)' };
    }
    const conf = THEMATIC_HOVER_PALETTE[item.colorCategory] || THEMATIC_HOVER_PALETTE.default;
    return { fillColor: conf.fill, strokeColor: conf.stroke, strokeWidth: conf.width, filter: conf.filter };
  }
  if (activeMode === 'relations' && selectedCountry) {
    return getHoverRelationsStyle(d, activeRelations);
  }
  return { fillColor: 'rgba(56, 189, 248, 0.25)', strokeColor: '#7dd3fc', strokeWidth: '1.4px', filter: 'url(#glow-cyan)' };
}

function getSelectedCountryFill(
  d: GeoFeature,
  activeMode: string,
  activeLayer: ThematicLayer | undefined,
  layerData: ThematicLayerMap,
  mockData: CountryMockDataMap
): string {
  if (activeMode === 'risk' && activeLayer && activeLayer !== 'none') {
    const item = resolveThematicCountryData(d, layerData, mockData);
    if (item) {
      if (item.colorCategory === 'critical') return 'rgba(239, 68, 68, 0.85)';
      if (item.colorCategory === 'high') return 'rgba(249, 115, 22, 0.8)';
      if (item.colorCategory === 'medium') return 'rgba(234, 179, 8, 0.75)';
      if (item.colorCategory === 'low') return 'rgba(34, 197, 94, 0.65)';
    }
  }
  return 'rgba(14, 165, 233, 0.45)';
}

export function computeCountryTacticalStyle(
  d: GeoFeature,
  activeMode: string,
  activeLayer: ThematicLayer | undefined,
  layerData: ThematicLayerMap,
  countryMockData: CountryMockDataMap,
  activeRelations: ActiveRelationsMap,
  selectedCountry: GeoFeature | null,
  hoveredCountry: GeoFeature | null
): CountryTacticalStyle {
  if (d.properties?.ISO_A3 === 'ATA') {
    return { fillColor: '#020617', strokeColor: 'rgba(30, 41, 59, 0.2)', strokeWidth: '0.6px', filter: 'none' };
  }

  let baseStyle: CountryTacticalStyle = {
    fillColor: '#0c1527',
    strokeColor: 'rgba(71, 85, 105, 0.45)',
    strokeWidth: '0.6px',
    filter: 'none',
  };

  const m = countryMockData[d.polyId];
  const risk = m?.risk ?? 45;

  if (activeMode === 'risk' && activeLayer && activeLayer !== 'none') {
    baseStyle = getThematicBaseStyle(d, layerData, countryMockData);
  } else if (activeMode === 'risk' || activeMode === 'news') {
    baseStyle = getRiskOrNewsStyle(activeMode, risk);
  }

  if (activeMode === 'relations' && selectedCountry) {
    const relStyle = getRelationsBaseStyle(d, activeRelations, selectedCountry);
    if (relStyle) baseStyle = relStyle;
  }

  if (selectedCountry && selectedCountry.polyId === d.polyId) {
    const fill = getSelectedCountryFill(d, activeMode, activeLayer, layerData, countryMockData);
    return { fillColor: fill, strokeColor: '#38bdf8', strokeWidth: '2px', filter: 'url(#glow-cyan)' };
  }

  if (hoveredCountry && hoveredCountry.polyId === d.polyId) {
    return getHoverCountryStyle(d, activeMode, activeLayer, layerData, countryMockData, activeRelations, selectedCountry);
  }

  return baseStyle;
}
