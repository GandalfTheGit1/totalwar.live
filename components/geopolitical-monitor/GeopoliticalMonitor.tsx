/**
 * @file GeopoliticalMonitor.tsx
 * @description Main orchestrator component for the Sovereign Risk and Supply Chain Network Monitor.
 */

'use client';

import React from 'react';
import { AlertTriangle, Globe as GlobeIcon } from 'lucide-react';
import { useGeopoliticalMonitor } from './hooks/useGeopoliticalMonitor';
import { GeopoliticalHUD } from './components/GeopoliticalHUD';
import { GeopoliticalSidebar } from './components/GeopoliticalSidebar';
import { GeopoliticalTooltip } from './components/GeopoliticalTooltip';
import { Map2D } from './components/Map2D';
import { MapModeSelector } from './components/MapModeSelector';
import { ThematicLayerSelector } from './components/ThematicLayerSelector';
import { FacilityTacticalPopover } from './components/FacilityTacticalPopover';
import { Hoi4TacticalNavbar } from './components/Hoi4TacticalNavbar';
import { ChokepointSimulationDrawer } from './components/ChokepointSimulationDrawer';
import { useHoi4Mechanics } from './hooks/useHoi4Mechanics';
import { ThematicLayer } from './types';
import { resolveThematicCountryData } from './hooks/useThematicLayerData';

/**
 * Propiedades de configuración para el monitor geopolítico.
 */
export interface GeopoliticalMonitorProps {
  /**
   * Cuando es true, omite el renderizado del sidebar deslizante lateral
   * permitiendo incrustar el mapa 3D/2D en layouts split-view o dashboards.
   */
  hideSidebar?: boolean;
  /**
   * Modo inicial de visualización (2D D3 Mercator o 3D Globe.GL).
   * @default true
   */
  default2D?: boolean;
  /**
   * Capa temática inicial para visualización en modo riesgo.
   * @default 'none'
   */
  defaultLayer?: ThematicLayer;
}

export default function GeopoliticalMonitor({
  hideSidebar = false,
  default2D = true,
  defaultLayer = 'none',
}: GeopoliticalMonitorProps = {}) {
  const {
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
    handleLayerChange,
    layerData,
    selectedResourceId,
    selectResource,
    clearResource,
    selectedCountry,
    hoveredCountry,
    tooltipPos,
    cursorPos,
    searchFilter,
    setSearchFilter,
    filteredCountries,
    globeContainerRef,
    containerRef,
    containerDimensions,
    activeData,
    handlePointerMove,
    handleCountryHover,
    handleCountryClick,
    handleBackgroundClick,
    handleModeChange,
    handleResetView,
    // Macro data
    macroCache,
    activeMacro,
    isMacroLoading,
    macroError,
    // Corporate facilities SEC Item 2 (T03.1)
    footprintTicker,
    setFootprintTicker,
    facilities,
    hoveredFacility,
    selectedFacility,
    facilityTooltipPos,
    handleFacilityHover,
    handleFacilityClick,
    setSelectedFacility,
    // Friendshoring & Substitution Arcs (T03.4)
    selectedCommodity,
    setSelectedCommodity,
    substitutionArcs,
    handleSelectCountryByIso,
    // Comercio Marítimo & Simulación de Chokepoints (T03.5)
    showMaritimeRoutes,
    toggleMaritimeRoutes,
    blockedChokepoints,
    setBlockedChokepoints,
    toggleChokepoint,
    selectedSector,
    setSelectedSector,
    sensitivityMultiplier,
    setSensitivityMultiplier,
    isChokepointDrawerOpen,
    openChokepointDrawer,
    closeChokepointDrawer,
    simulationResult,
  } = useGeopoliticalMonitor({ default2D, defaultLayer });

  // Cómputo de World Tension (GDELT / Hoi4 Mechanics)
  const { worldTension } = useHoi4Mechanics({});

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      className="relative w-full h-full bg-[#020617] text-zinc-100 overflow-hidden font-sans select-none"
    >
      {/* ─── Loading State Overlay ────────────────────────────────────────── */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-md transition-opacity duration-700">
          <div className="relative">
            <div className="animate-spin rounded-full border-4 border-zinc-800 border-t-teal-400 h-16 w-16 mb-4"></div>
            <GlobeIcon className="w-6 h-6 text-teal-400 absolute top-5 left-5 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold tracking-wider uppercase text-zinc-100">Motor Geopolítico</h2>
          <p className="text-sm text-zinc-400 mt-2 font-mono">Cargando topología global y nodos soberanos...</p>
        </div>
      )}

      {/* ─── Error Fallback Overlay ───────────────────────────────────────── */}
      {loadError && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/95 p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-rose-500 mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Fallo de Inicialización</h3>
          <p className="text-sm text-zinc-400 max-w-md mb-4">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Reintentar Conexión
          </button>
        </div>
      )}

      {/* ─── Hearts of Iron IV Tactical Command Navbar (T03.5) ───────────── */}
      <Hoi4TacticalNavbar
        is2DMode={is2DMode}
        onToggle2DMode={setIs2DMode}
        onResetView={handleResetView}
        showMaritimeRoutes={showMaritimeRoutes}
        onToggleMaritimeRoutes={toggleMaritimeRoutes}
        blockedCount={blockedChokepoints.length}
        onOpenSimulationDrawer={openChokepointDrawer}
        worldTension={worldTension}
      />

      {/* ─── Chokepoint Blockade Simulation Drawer (T03.5) ───────────────── */}
      <ChokepointSimulationDrawer
        isOpen={isChokepointDrawerOpen}
        onClose={closeChokepointDrawer}
        blockedChokepoints={blockedChokepoints}
        onToggleChokepoint={toggleChokepoint}
        onSetBlockedChokepoints={setBlockedChokepoints}
        selectedSector={selectedSector}
        onSelectSector={setSelectedSector}
        sensitivityMultiplier={sensitivityMultiplier}
        onChangeSensitivity={setSensitivityMultiplier}
        simulationResult={simulationResult}
      />

      {/* ─── Floating Top Controls & HUD ─────────────────────────────────── */}
      <GeopoliticalHUD
        geoDataCount={geoJsonData.length}
        is2DMode={is2DMode}
        setIs2DMode={setIs2DMode}
        activeMode={activeMode}
        onResetView={handleResetView}
        searchFilter={searchFilter}
        setSearchFilter={setSearchFilter}
        filteredCountries={filteredCountries}
        countryMockData={countryMockData}
        onSelectCountry={handleCountryClick}
        activeLayer={activeLayer}
        layerData={layerData}
        onResetLayer={() => handleLayerChange('none')}
        activeResourceId={selectedResourceId}
        onSelectResource={selectResource}
        onClearResource={clearResource}
        onSelectCountryByIso={handleSelectCountryByIso}
      />

      {/* ─── Mode Selector Tab ───────────────────────────────────────────── */}
      <MapModeSelector activeMode={activeMode} onModeChange={handleModeChange} />

      {/* ─── Thematic Layer Selector (Visible in Risk Mode) ──────────────── */}
      {activeMode === 'risk' && (
        <ThematicLayerSelector
          activeLayer={activeLayer}
          onLayerChange={handleLayerChange}
        />
      )}

      {/* ─── Footprint Ticker Filter (Visible when Footprint layer is active) ─ */}
      {activeMode === 'risk' && activeLayer === 'footprint' && (
        <div className="absolute top-40 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <div className="flex items-center gap-1 bg-zinc-950/85 backdrop-blur-xl border border-zinc-700/80 px-2 py-1 rounded-xl shadow-xl max-w-[calc(100vw-2rem)] overflow-x-auto text-[10px] font-mono">
            <span className="text-zinc-400 font-bold px-1.5 py-0.5 flex items-center gap-1">
              <span>🏢</span>
              <span className="hidden sm:inline">HUELLA:</span>
            </span>
            {['ALL', 'AAPL', 'NVDA', 'TSM', 'MSFT', 'AMZN', 'GOOGL', 'TSLA', 'INTC', 'ASML'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFootprintTicker(t)}
                className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  footprintTicker === t
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent'
                }`}
              >
                {t === 'ALL' ? 'GLOBAL' : t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Tactical Facility Popover (SEC Item 2 Properties) ─────────── */}
      {activeLayer === 'footprint' && (hoveredFacility || selectedFacility) && (
        <FacilityTacticalPopover
          facility={selectedFacility || hoveredFacility}
          position={facilityTooltipPos}
          onClose={() => setSelectedFacility(null)}
          isPinned={!!selectedFacility}
        />
      )}

      {/* ─── Hover Node Tooltip ──────────────────────────────────────── */}
      <GeopoliticalTooltip
        isPanelOpen={isPanelOpen}
        hoveredCountry={hoveredCountry}
        countryData={hoveredCountry ? countryMockData[hoveredCountry.polyId] : undefined}
        tooltipPos={tooltipPos}
        cursorPos={cursorPos}
        macroData={
          hoveredCountry
            ? (macroCache[countryMockData[hoveredCountry.polyId]?.iso] ?? macroCache[hoveredCountry.properties?.ISO_A3])
            : undefined
        }
        thematicData={
          hoveredCountry && activeMode === 'risk' && activeLayer !== 'none'
            ? resolveThematicCountryData(hoveredCountry, layerData, countryMockData)
            : undefined
        }
      />

      {/* ─── Country Inspector Slide-out Sidebar ──────────────────────── */}
      {!hideSidebar && (
        <GeopoliticalSidebar
          isPanelOpen={isPanelOpen}
          activeData={activeData}
          activeMode={activeMode}
          activeRelations={activeRelations}
          onClose={handleBackgroundClick}
          activeMacro={activeMacro}
          isMacroLoading={isMacroLoading}
          macroError={macroError}
          selectedCommodity={selectedCommodity}
          onSelectCommodity={setSelectedCommodity}
          onSelectSubstitute={handleSelectCountryByIso}
          onOpenSimulationDrawer={openChokepointDrawer}
          blockedCount={blockedChokepoints.length}
          simulationResult={simulationResult}
          activeResourceId={selectedResourceId}
          onShowResourceOnMap={selectResource}
        />
      )}

      {/* ─── 3D Globe WebGL Container ─────────────────────────────────────── */}
      <div
        ref={globeContainerRef}
        className={`absolute inset-0 z-0 transition-opacity duration-500 ${
          is2DMode ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
        }`}
      />

      {/* ─── 2D D3 Mercator SVG Canvas ────────────────────────────────────── */}
      <div
        className={`absolute inset-0 z-0 transition-opacity duration-500 ${
          !is2DMode ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
        }`}
      >
        {is2DMode && geoJsonData.length > 0 && (
          <Map2D
            geoData={geoJsonData}
            selectedCountry={selectedCountry}
            hoveredCountry={hoveredCountry}
            activeMode={activeMode}
            activeRelations={activeRelations}
            countryMockData={countryMockData}
            activeLayer={activeLayer}
            layerData={layerData}
            substitutionArcs={substitutionArcs}
            onArcClick={(arc) => handleSelectCountryByIso(arc.substituteCountry)}
            facilities={facilities}
            selectedFacility={selectedFacility}
            showMaritimeRoutes={showMaritimeRoutes}
            blockedChokepoints={blockedChokepoints}
            onToggleChokepoint={toggleChokepoint}
            onFacilityHover={handleFacilityHover}
            onFacilityClick={handleFacilityClick}
            onCountryHover={handleCountryHover}
            onCountryClick={handleCountryClick}
            onBackgroundClick={handleBackgroundClick}
            isPanelOpen={isPanelOpen}
            containerDimensions={containerDimensions}
          />
        )}
      </div>
    </div>
  );
}
