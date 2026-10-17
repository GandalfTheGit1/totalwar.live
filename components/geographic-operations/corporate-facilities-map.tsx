/**
 * @file corporate-facilities-map.tsx
 * @description Dedicated interactive map and directory for SEC Item 2 (Properties) corporate facilities
 * integrated into GeographicOperations for individual equity analysis.
 */

'use client';

import React from 'react';
import { FacilityTacticalPopover } from '@/components/dev/geopolitical-monitor/components/FacilityTacticalPopover';
import { CorporateFacility } from '@/lib/services/geographic/sec-properties-service';

import { CorporateFacilitiesMapProps, PopoverPosition } from './facilities/types';
import { useCorporateFacilities } from './facilities/useCorporateFacilities';
import { FacilitiesKpiStrip } from './facilities/FacilitiesKpiStrip';
import { FacilitiesFilterBar } from './facilities/FacilitiesFilterBar';
import { FacilitiesD3Map } from './facilities/FacilitiesD3Map';
import { FacilitiesDirectoryList } from './facilities/FacilitiesDirectoryList';

export type { CorporateFacilitiesMapProps };

function FacilitiesPopoverView({
  hoveredFacility,
  selectedFacility,
  popoverPos,
  onClose,
}: {
  hoveredFacility: CorporateFacility | null;
  selectedFacility: CorporateFacility | null;
  popoverPos: PopoverPosition;
  onClose: () => void;
}) {
  const target = selectedFacility || hoveredFacility;
  if (!target) return null;

  return (
    <FacilityTacticalPopover
      facility={target}
      position={popoverPos}
      onClose={onClose}
      isPinned={!!selectedFacility}
    />
  );
}

export function CorporateFacilitiesMap({
  company,
  selectedCountryCode,
  onSelectCountry,
}: CorporateFacilitiesMapProps) {
  const {
    isLoading, error, functionalFilter, setFunctionalFilter,
    searchQuery, setSearchQuery, hoveredFacility, setHoveredFacility,
    selectedFacility, setSelectedFacility, popoverPos, setPopoverPos,
    geoData, filteredFacilities, stats
  } = useCorporateFacilities(company);

  const handleHover = (fac: CorporateFacility | null, pos?: PopoverPosition) => {
    setHoveredFacility(fac);
    if (pos) setPopoverPos(pos);
  };

  const handleSelect = (fac: CorporateFacility, pos: PopoverPosition) => {
    setSelectedFacility(fac);
    setPopoverPos(pos);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <FacilitiesKpiStrip stats={stats} />
      <FacilitiesFilterBar
        stats={stats} functionalFilter={functionalFilter} searchQuery={searchQuery}
        onFilterChange={setFunctionalFilter} onSearchChange={setSearchQuery}
      />
      <FacilitiesD3Map
        geoData={geoData} filteredFacilities={filteredFacilities} selectedFacility={selectedFacility}
        selectedCountryCode={selectedCountryCode} isLoading={isLoading} error={error}
        onSelectCountry={onSelectCountry} onHoverFacility={handleHover} onSelectFacility={handleSelect}
      />
      <FacilitiesPopoverView
        hoveredFacility={hoveredFacility} selectedFacility={selectedFacility}
        popoverPos={popoverPos} onClose={() => setSelectedFacility(null)}
      />
      <FacilitiesDirectoryList
        facilities={filteredFacilities} selectedFacility={selectedFacility}
        isLoading={isLoading} onSelectFacility={setSelectedFacility}
      />
    </div>
  );
}
