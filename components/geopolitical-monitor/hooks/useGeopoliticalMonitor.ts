/**
 * components/dev/geopolitical-monitor/hooks/useGeopoliticalMonitor.ts
 *
 * Primary coordinator hook for 2D/3D Geopolitical Monitor visualization,
 * delegating to specialized sub-hooks in ./monitor/.
 */

'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ActiveRelationsMap,
  ThematicLayer,
  CountryMacroData,
} from '../types';
import { FriendshoringService, CriticalCommodityKey, SubstitutionArc } from '@/lib/services/geographic/friendshoring-service';
import { MapMode } from '../components/MapModeSelector';

import { useMacroData } from './useMacroData';
import { useGlobeResize } from './useGlobeResize';
import { useGlobeStyling } from './useGlobeStyling';
import { useGlobeInit } from './useGlobeInit';
import { useThematicLayerData } from './useThematicLayerData';

import { UseGeopoliticalMonitorOptions } from './monitor/types';
import { buildRealRelations, resolveIsoFromFeature } from './monitor/relations-builder';
import { computeMonitorPoints } from './monitor/points-builder';
import { useMonitorMaritime } from './monitor/useMonitorMaritime';
import { useMonitorFacilities } from './monitor/useMonitorFacilities';
import { useMonitorCountrySelection } from './monitor/useMonitorCountrySelection';
import { useMonitorGlobeSync } from './monitor/useMonitorGlobeSync';

export type { UseGeopoliticalMonitorOptions };

export function useGeopoliticalMonitor({
  default2D = true,
  defaultLayer = 'none',
  initialFootprintTicker = 'ALL',
  initialCommodity = 'rare-earths',
}: UseGeopoliticalMonitorOptions = {}) {
  const [is2DMode, setIs2DMode] = useState(default2D);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<MapMode>('risk');
  const [activeRelations, setActiveRelations] = useState<ActiveRelationsMap>({});
  const [activeLayer, setActiveLayer] = useState<ThematicLayer>(defaultLayer);
  const [cursorPos, setCursorPos] = useState({ x: 20, y: 20 });
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState<CriticalCommodityKey | null>(initialCommodity);

  const layerData = useThematicLayerData(activeLayer);
  const handleLayerChange = useCallback((layer: ThematicLayer) => {
    setActiveLayer(layer);
  }, []);

  const getPolygonColorRef = useRef<any>(null);
  const getPolygonStrokeRef = useRef<any>(null);
  const handleCountryHoverRef = useRef<any>(null);
  const handleCountryClickRef = useRef<any>(null);
  const handleBackgroundClickRef = useRef<any>(null);
  const handleFacilityHoverRef = useRef<any>(null);
  const handleFacilityClickRef = useRef<any>(null);

  const { macroCache, macroLoadingISO, macroError, fetchMacroForCountry } = useMacroData();
  const dummyGlobeInstanceRef = useRef<any>(null);
  const { containerRef, containerDimensions } = useGlobeResize(dummyGlobeInstanceRef);

  const {
    globeContainerRef,
    globeInstanceRef,
    isLoading,
    loadError,
    geoJsonData,
    countryMockData,
  } = useGlobeInit(
    containerRef,
    getPolygonStrokeRef,
    getPolygonColorRef,
    handleCountryHoverRef,
    handleCountryClickRef,
    handleBackgroundClickRef,
    handleFacilityHoverRef,
    handleFacilityClickRef
  );

  useEffect(() => {
    dummyGlobeInstanceRef.current = globeInstanceRef.current;
  }, [globeInstanceRef.current]);

  const maritime = useMonitorMaritime(activeLayer, setActiveLayer, defaultLayer);

  const facilities = useMonitorFacilities(
    initialFootprintTicker,
    is2DMode,
    globeInstanceRef,
    maritime.toggleChokepoint
  );

  const countrySel = useMonitorCountrySelection(
    geoJsonData,
    activeMode,
    setActiveRelations,
    fetchMacroForCountry,
    is2DMode,
    globeInstanceRef,
    isPanelOpen,
    setIsPanelOpen
  );

  const substitutionArcs = useMemo<SubstitutionArc[]>(() => {
    if (activeLayer === 'resources') {
      return FriendshoringService.getSubstitutionArcs(selectedCommodity || undefined);
    }
    return [];
  }, [activeLayer, selectedCommodity]);

  const { getPolygonColor, getPolygonStroke, arcsData } = useGlobeStyling(
    countrySel.selectedCountry,
    countrySel.hoveredCountry,
    activeMode,
    activeRelations,
    countryMockData,
    activeLayer,
    layerData,
    selectedCommodity,
    substitutionArcs,
    maritime.showMaritimeRoutes,
    maritime.blockedChokepoints
  );

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (typeof e.clientX === 'number' && Number.isFinite(e.clientX) &&
        typeof e.clientY === 'number' && Number.isFinite(e.clientY)) {
      setCursorPos({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleBackgroundClick = useCallback(() => {
    setIsPanelOpen(false);
    countrySel.setSelectedCountry(null);
    setActiveRelations({});
    facilities.setSelectedFacility(null);
    facilities.setHoveredFacility(null);
  }, [countrySel, facilities]);

  useEffect(() => { getPolygonColorRef.current = getPolygonColor; }, [getPolygonColor]);
  useEffect(() => { getPolygonStrokeRef.current = getPolygonStroke; }, [getPolygonStroke]);
  useEffect(() => { handleCountryHoverRef.current = countrySel.handleCountryHover; }, [countrySel.handleCountryHover]);
  useEffect(() => { handleCountryClickRef.current = countrySel.handleCountryClick; }, [countrySel.handleCountryClick]);
  useEffect(() => { handleBackgroundClickRef.current = handleBackgroundClick; }, [handleBackgroundClick]);
  useEffect(() => { handleFacilityHoverRef.current = facilities.handleFacilityHover; }, [facilities.handleFacilityHover]);
  useEffect(() => { handleFacilityClickRef.current = facilities.handleFacilityClick; }, [facilities.handleFacilityClick]);

  const handleModeChange = useCallback((mode: MapMode) => {
    setActiveMode(mode);
    if (mode === 'relations' && countrySel.selectedCountry) {
      setActiveRelations(buildRealRelations(countrySel.selectedCountry, geoJsonData));
    } else {
      setActiveRelations({});
    }
  }, [countrySel.selectedCountry, geoJsonData]);

  const handleResetView = useCallback(() => {
    countrySel.setSelectedCountry(null);
    facilities.setSelectedFacility(null);
    setIsPanelOpen(false);
    setActiveRelations({});
    if (globeInstanceRef.current) {
      globeInstanceRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1200);
    }
  }, [countrySel, facilities, globeInstanceRef]);

  const pointsData = useMemo(() => {
    return computeMonitorPoints(
      activeLayer,
      facilities.facilities,
      facilities.selectedFacility,
      maritime.showMaritimeRoutes,
      maritime.blockedChokepoints
    );
  }, [activeLayer, facilities.facilities, facilities.selectedFacility, maritime.showMaritimeRoutes, maritime.blockedChokepoints]);

  useMonitorGlobeSync(
    globeInstanceRef,
    is2DMode,
    countrySel.selectedCountry,
    getPolygonColor,
    getPolygonStroke,
    arcsData,
    pointsData,
    isLoading,
    isPanelOpen
  );

  const activeData = countrySel.selectedCountry ? countryMockData[countrySel.selectedCountry.polyId] || null : null;

  const filteredCountries = useMemo(() => {
    if (!searchFilter.trim()) return [];
    const query = searchFilter.toLowerCase();
    return geoJsonData
      .filter((feat) =>
        feat.properties.ADMIN?.toLowerCase().includes(query) ||
        feat.properties.ISO_A3?.toLowerCase().includes(query) ||
        feat.properties.ADM0_A3?.toLowerCase().includes(query)
      )
      .slice(0, 8);
  }, [searchFilter, geoJsonData]);

  const selectedCountryIso = countrySel.selectedCountry
    ? resolveIsoFromFeature(countrySel.selectedCountry)
    : null;

  const activeMacro: CountryMacroData | null = selectedCountryIso
    ? (macroCache[selectedCountryIso] ?? null)
    : null;

  const isMacroLoading = !!selectedCountryIso && macroLoadingISO === selectedCountryIso;

  return {
    isLoading,
    loadError,
    geoJsonData,
    countryMockData,
    is2DMode,
    setIs2DMode,
    isPanelOpen,
    activeMode,
    activeRelations,
    activeLayer,
    setActiveLayer,
    handleLayerChange,
    layerData,
    selectedCountry: countrySel.selectedCountry,
    hoveredCountry: countrySel.hoveredCountry,
    tooltipPos: countrySel.tooltipPos,
    cursorPos,
    searchFilter,
    setSearchFilter,
    filteredCountries,
    globeContainerRef,
    containerRef,
    containerDimensions,
    activeData,
    handlePointerMove,
    handleCountryHover: countrySel.handleCountryHover,
    handleCountryClick: countrySel.handleCountryClick,
    handleBackgroundClick,
    handleModeChange,
    handleResetView,
    macroCache,
    activeMacro,
    isMacroLoading,
    macroError,
    footprintTicker: facilities.footprintTicker,
    setFootprintTicker: facilities.setFootprintTicker,
    facilities: facilities.facilities,
    hoveredFacility: facilities.hoveredFacility,
    selectedFacility: facilities.selectedFacility,
    facilityTooltipPos: facilities.facilityTooltipPos,
    handleFacilityHover: facilities.handleFacilityHover,
    handleFacilityClick: facilities.handleFacilityClick,
    setSelectedFacility: facilities.setSelectedFacility,
    selectedCommodity,
    setSelectedCommodity,
    substitutionArcs,
    handleSelectCountryByIso: countrySel.handleSelectCountryByIso,
    showMaritimeRoutes: maritime.showMaritimeRoutes,
    setShowMaritimeRoutes: maritime.setShowMaritimeRoutes,
    toggleMaritimeRoutes: maritime.toggleMaritimeRoutes,
    blockedChokepoints: maritime.blockedChokepoints,
    setBlockedChokepoints: maritime.setBlockedChokepoints,
    toggleChokepoint: maritime.toggleChokepoint,
    selectedSector: maritime.selectedSector,
    setSelectedSector: maritime.setSelectedSector,
    sensitivityMultiplier: maritime.sensitivityMultiplier,
    setSensitivityMultiplier: maritime.setSensitivityMultiplier,
    isChokepointDrawerOpen: maritime.isChokepointDrawerOpen,
    setIsChokepointDrawerOpen: maritime.setIsChokepointDrawerOpen,
    openChokepointDrawer: maritime.openChokepointDrawer,
    closeChokepointDrawer: maritime.closeChokepointDrawer,
    simulationResult: maritime.simulationResult,
  };
}