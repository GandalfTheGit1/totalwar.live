/**
 * @file GeopoliticalHUD.tsx
 * @description Floating top-left HUD controller with mode toggle, search bar, stats chips, and camera reset.
 */

'use client';

import React, { useMemo } from 'react';
import { Layers, RotateCcw, Search, X } from 'lucide-react';
import { CountryMockDataMap, GeoFeature, ThematicLayer, ThematicLayerMap } from '../types';
import { GeopoliticalKnowledgeService } from '@/lib/services/geopolitical-knowledge-service';
import { useSettings } from '@/lib/settings-context';
import { WorldTensionWidget } from './hoi4-eu4/WorldTensionWidget';
import { ResourceSearchBar } from './resources/ResourceSearchBar';
import { ResourceProducersPanel } from './resources/ResourceProducersPanel';

export interface LayerLegendPanelProps {
  activeLayer: ThematicLayer;
  layerData?: ThematicLayerMap;
  onResetLayer?: () => void;
}

const LAYER_META: Record<
  Exclude<ThematicLayer, 'none'>,
  {
    badge: string;
    title: string;
    description: string;
    badgeStyle: string;
  }
> = {
  'tier-n': {
    badge: 'TIER-N',
    title: 'Fricciones & Sanciones',
    description: 'Dependencias bilaterales críticas y fricción comercial',
    badgeStyle: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  resources: {
    badge: 'RECURSOS CRÍTICOS',
    title: 'Materias Primas & Silicio',
    description: 'Monopolios de extracción y procesado estratégico',
    badgeStyle: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  },
  maritime: {
    badge: 'RUTAS MARÍTIMAS',
    title: 'Chokepoints Estratégicos',
    description: 'Estrechos navales y cuellos de botella de tránsito marítimo',
    badgeStyle: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  },
  military: {
    badge: 'RANKING MILITAR',
    title: 'Potencia militar',
    description: 'Más intenso = mejor posición en el ranking',
    badgeStyle: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  },
  stability: {
    badge: 'ESTABILIDAD',
    title: 'Riesgo de conflicto interno',
    description: 'Más intenso = más cerca de revueltas o conflicto interno',
    badgeStyle: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  },
  footprint: {
    badge: 'HUELLA CORPORATIVA',
    title: 'Red Operativa & Expansión',
    description: 'Sedes centrales, manufactura consolidada y expansión',
    badgeStyle: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  'resource-search': {
    badge: 'RECURSO',
    title: 'Productores del recurso buscado',
    description: 'Países productores coloreados por su cuota de la producción mundial',
    badgeStyle: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  },
};

export const LayerLegendPanel: React.FC<LayerLegendPanelProps> = ({
  activeLayer,
  layerData,
  onResetLayer,
}) => {
  const counts = useMemo(() => {
    if (!activeLayer || activeLayer === 'none' || !layerData) {
      return { critical: 0, high: 0, medium: 0, low: 0, total: 0 };
    }

    const seen = new Set<string>();
    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

    for (const [key, item] of Object.entries(layerData)) {
      if (!item) continue;
      const candidate = (item.countryCode && item.countryCode.trim().length > 0)
        ? item.countryCode.trim().toUpperCase()
        : key.trim().toUpperCase();
      const resolved = GeopoliticalKnowledgeService.resolveCountryCode(candidate) || candidate;
      if (seen.has(resolved)) continue;
      seen.add(resolved);

      if (item.colorCategory === 'critical') critical++;
      else if (item.colorCategory === 'high') high++;
      else if (item.colorCategory === 'medium') medium++;
      else if (item.colorCategory === 'low') low++;
    }

    return { critical, high, medium, low, total: critical + high + medium + low };
  }, [activeLayer, layerData]);

  if (!activeLayer || activeLayer === 'none') return null;
  const meta = LAYER_META[activeLayer];
  if (!meta) return null;

  return (
    <div
      data-testid="layer-legend-panel"
      className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/80 p-3.5 rounded-xl shadow-2xl pointer-events-auto flex flex-col gap-2.5 transition-all"
    >
      {/* Header: Insignia y Título */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            data-testid="layer-legend-badge"
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border shrink-0 ${meta.badgeStyle}`}
          >
            {meta.badge}
          </span>
          <span
            data-testid="layer-legend-title"
            className="text-xs font-bold text-zinc-100 truncate"
            title={meta.title}
          >
            {meta.title}
          </span>
        </div>
        <span
          data-testid="layer-legend-total"
          className="text-[10px] font-mono text-zinc-400 shrink-0"
        >
          {counts.total} países
        </span>
      </div>

      <p className="text-[11px] text-zinc-400 leading-tight">
        {meta.description}
      </p>

      {/* Chips compactos de colorimetría con recuento dinámico */}
      <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[10px] pt-1 border-t border-zinc-800">
        <div
          data-testid="legend-chip-critical"
          className="bg-rose-500/10 border border-rose-500/30 rounded p-1.5 flex flex-col items-center"
        >
          <span className="text-rose-400 font-semibold flex items-center gap-1 text-[9px] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            Crítico
          </span>
          <span className="text-white font-bold text-xs mt-0.5">{counts.critical}</span>
        </div>

        <div
          data-testid="legend-chip-high"
          className="bg-orange-500/10 border border-orange-500/30 rounded p-1.5 flex flex-col items-center"
        >
          <span className="text-orange-400 font-semibold flex items-center gap-1 text-[9px] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
            Alto
          </span>
          <span className="text-white font-bold text-xs mt-0.5">{counts.high}</span>
        </div>

        <div
          data-testid="legend-chip-medium"
          className="bg-amber-500/10 border border-amber-500/30 rounded p-1.5 flex flex-col items-center"
        >
          <span className="text-amber-400 font-semibold flex items-center gap-1 text-[9px] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            Medio
          </span>
          <span className="text-white font-bold text-xs mt-0.5">{counts.medium}</span>
        </div>

        <div
          data-testid="legend-chip-low"
          className="bg-emerald-500/10 border border-emerald-500/30 rounded p-1.5 flex flex-col items-center"
        >
          <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[9px] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            Bajo
          </span>
          <span className="text-white font-bold text-xs mt-0.5">{counts.low}</span>
        </div>
      </div>

      {/* Botón táctico "Restablecer a Base" */}
      <button
        type="button"
        data-testid="reset-layer-button"
        onClick={() => onResetLayer?.()}
        className="mt-0.5 flex items-center justify-center gap-1.5 w-full py-1.5 px-2.5 text-[11px] font-mono font-semibold text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700/90 border border-zinc-700 hover:border-zinc-600 rounded-lg transition-colors cursor-pointer"
      >
        <RotateCcw className="w-3 h-3 text-teal-400" />
        <span>Restablecer a Base</span>
      </button>
    </div>
  );
};

export interface GeopoliticalHUDProps {
  geoDataCount: number;
  is2DMode: boolean;
  setIs2DMode: (val: boolean) => void;
  activeMode: string;
  onResetView: () => void;
  searchFilter: string;
  setSearchFilter: (val: string) => void;
  filteredCountries: GeoFeature[];
  countryMockData: CountryMockDataMap;
  onSelectCountry: (feature: GeoFeature) => void;
  activeLayer?: ThematicLayer;
  layerData?: ThematicLayerMap;
  onResetLayer?: () => void;
  /** Buscador de recursos */
  activeResourceId?: string | null;
  onSelectResource?: (commodityId: string) => void;
  onClearResource?: () => void;
  onSelectCountryByIso?: (isoCode: string) => void;
  className?: string;
}

export const GeopoliticalHUD: React.FC<GeopoliticalHUDProps> = ({
  geoDataCount,
  is2DMode,
  setIs2DMode,
  activeMode,
  onResetView,
  searchFilter,
  setSearchFilter,
  filteredCountries,
  countryMockData,
  onSelectCountry,
  activeLayer = 'none',
  layerData = {},
  onResetLayer,
  activeResourceId = null,
  onSelectResource,
  onClearResource,
  onSelectCountryByIso,
  className = '',
}) => {
  const showResourcePanel = activeMode === 'risk' && activeLayer === 'resource-search' && !!activeResourceId;
  const { showWorldTensionIndex } = useSettings();
  const theWholeScene = GeopoliticalKnowledgeService.getTheWholeScene();
  return (
    <div className={`absolute top-[calc(var(--topbar-h,56px)+8px)] left-4 z-20 pointer-events-none flex flex-col gap-3 max-w-sm ${className}`}>
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/80 p-4 rounded-xl shadow-2xl pointer-events-auto">
        {/* Title Header */}
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></div>
            <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
              Equity <span className="bg-gradient-to-r from-teal-400 to-zinc-300 bg-clip-text text-transparent font-bold">Geopolitics</span>
            </h1>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/10 text-teal-300 border border-teal-500/30">
            HUD 3D/2D
          </span>
        </div>
        <p className="text-zinc-400 text-xs leading-relaxed">
          Monitor soberano de riesgos geopolíticos, fricciones aduaneras (COGS) y dependencias críticas en redes de valor.
        </p>

        {/* Quick Stats Grid */}
        <div className="mt-3 pt-3 border-t border-zinc-800 grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
          <div className="bg-zinc-800/50 p-1.5 rounded border border-zinc-700/50">
            <span className="text-zinc-400 block">Nodos</span>
            <span className="text-teal-300 font-bold">{theWholeScene.totalCountries}</span>
          </div>
          <div className="bg-zinc-800/50 p-1.5 rounded border border-zinc-700/50">
            <span className="text-zinc-400 block">Vínculos</span>
            <span className="text-zinc-300 font-bold">{theWholeScene.totalBilateralEdges}</span>
          </div>
          <div className="bg-zinc-800/50 p-1.5 rounded border border-zinc-700/50">
            <span className="text-zinc-400 block" title="Fricción Media Global">Fricción G.</span>
            <span className="text-rose-400 font-bold">{theWholeScene.globalAverageFriction}/10</span>
          </div>
          <div className="bg-zinc-800/50 p-1.5 rounded border border-zinc-700/50">
            <span className="text-zinc-400 block">Vista</span>
            <span className="text-zinc-200 font-bold">{is2DMode ? '2D' : '3D'}</span>
          </div>
        </div>

        {/* Controls Row */}
        <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-400" /> Modo
            </span>
            <div className="flex items-center gap-1.5 bg-zinc-800/90 p-0.5 rounded-lg border border-zinc-700">
              <button
                onClick={() => setIs2DMode(false)}
                className={`px-2 py-1 text-[11px] font-mono rounded font-semibold transition-all cursor-pointer ${
                  !is2DMode ? 'bg-teal-500 text-zinc-950 font-bold shadow' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                3D
              </button>
              <button
                onClick={() => setIs2DMode(true)}
                className={`px-2 py-1 text-[11px] font-mono rounded font-semibold transition-all cursor-pointer ${
                  is2DMode ? 'bg-teal-500 text-zinc-950 font-bold shadow' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                2D
              </button>
            </div>
          </div>

          <button
            onClick={onResetView}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white rounded-lg border border-zinc-700 transition-colors cursor-pointer"
            title="Restablecer posición de cámara"
          >
            <RotateCcw className="w-3 h-3 text-teal-400" />
            <span>Reset</span>
          </button>
        </div>

        {/* Search Box with Autocomplete Dropdown */}
        <div className="mt-3 relative">
          <div className="flex items-center bg-zinc-950/70 border border-zinc-700/80 rounded-lg px-2.5 py-1.5">
            <Search className="w-3.5 h-3.5 text-zinc-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Buscar país o código ISO..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 focus:outline-none w-full placeholder-slate-500"
            />
            {searchFilter && (
              <button onClick={() => setSearchFilter('')} className="text-zinc-500 hover:text-zinc-300 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {filteredCountries.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900/95 border border-zinc-700 rounded-lg shadow-2xl p-1 z-30 max-h-48 overflow-y-auto custom-scrollbar">
              {filteredCountries.map((c) => {
                const m = countryMockData[c.polyId];
                return (
                  <button
                    key={c.polyId}
                    onClick={() => {
                      onSelectCountry(c);
                      setSearchFilter('');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between hover:bg-zinc-800/80 text-xs transition-colors cursor-pointer"
                  >
                    <span className="text-zinc-200 font-medium">{c.properties.ADMIN}</span>
                    <span className="font-mono text-[10px] text-teal-400 font-bold">
                      {m?.risk ? `${m.risk}/100` : c.properties.ISO_A3}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Buscador de recursos: pinta en el mapa a los países productores */}
        {onSelectResource && (
          <div className="mt-2">
            <ResourceSearchBar
              activeResourceId={activeResourceId}
              onSelectResource={onSelectResource}
              onClearResource={onClearResource}
            />
          </div>
        )}
      </div>

      {showResourcePanel && activeResourceId && (
        <ResourceProducersPanel
          commodityId={activeResourceId}
          onSelectCountry={onSelectCountryByIso}
          onClose={onClearResource}
        />
      )}

      {/* Panel Táctico de Leyenda de Capas (T03.2 Ronda 3) */}
      {activeMode === 'risk' && activeLayer && activeLayer !== 'none' && !showResourcePanel && (
        <LayerLegendPanel
          activeLayer={activeLayer}
          layerData={layerData}
          onResetLayer={onResetLayer}
        />
      )}

      {/* Dynamic Overlay Elements */}
      {showWorldTensionIndex && (
        <div className="fixed top-[calc(var(--topbar-h,56px)+8px)] right-4 pointer-events-auto">
          <WorldTensionWidget />
        </div>
      )}
    </div>
  );
};
