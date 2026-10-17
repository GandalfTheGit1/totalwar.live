import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, renderHook } from '@testing-library/react';
import React from 'react';
import { useGlobeStyling } from '@/components/dev/geopolitical-monitor/hooks/useGlobeStyling';
import { Map2D } from '@/components/dev/geopolitical-monitor/components/Map2D';
import { GeopoliticalHUD, LayerLegendPanel } from '@/components/dev/geopolitical-monitor/components/GeopoliticalHUD';
import GeopoliticalMonitor from '@/components/dev/geopolitical-monitor/GeopoliticalMonitor';
import { getThematicLayerData, resolveThematicCountryData } from '@/components/dev/geopolitical-monitor/hooks/useThematicLayerData';
import { GeoFeature, ThematicLayer, ThematicLayerMap } from '@/components/dev/geopolitical-monitor/types';
import { SettingsProvider } from '@/lib/settings-context';

describe('T03.2 - Ronda 3: Colorimetría en Mapa 2D/3D y Panel de Leyenda en HUD', () => {
  const mockGeometry = {
    type: 'Polygon',
    coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]],
  };

  const russiaFeat: GeoFeature = {
    type: 'Feature',
    polyId: 'poly-ru',
    properties: { ADMIN: 'Russia', ISO_A3: 'RUS' },
    geometry: mockGeometry,
  };

  const chinaFeat: GeoFeature = {
    type: 'Feature',
    polyId: 'poly-cn',
    properties: { ADMIN: 'China', ISO_A3: 'CHN' },
    geometry: mockGeometry,
  };

  const canadaFeat: GeoFeature = {
    type: 'Feature',
    polyId: 'poly-ca',
    properties: { ADMIN: 'Canada', ISO_A3: 'CAN' },
    geometry: mockGeometry,
  };

  const brazilFeat: GeoFeature = {
    type: 'Feature',
    polyId: 'poly-br',
    properties: { ADMIN: 'Brazil', ISO_A3: 'BRA' },
    geometry: mockGeometry,
  };

  const switzerlandFeat: GeoFeature = {
    type: 'Feature',
    polyId: 'poly-ch',
    properties: { ADMIN: 'Switzerland', ISO_A3: 'CHE' },
    geometry: mockGeometry,
  };

  const customThematicMap: ThematicLayerMap = {
    RU: {
      countryCode: 'RU',
      intensity: 100,
      label: 'Guerra Activa',
      colorCategory: 'critical',
    },
    RUS: {
      countryCode: 'RU',
      intensity: 100,
      label: 'Guerra Activa',
      colorCategory: 'critical',
    },
    CN: {
      countryCode: 'CN',
      intensity: 80,
      label: 'Fricción Alta',
      colorCategory: 'high',
    },
    CHN: {
      countryCode: 'CN',
      intensity: 80,
      label: 'Fricción Alta',
      colorCategory: 'high',
    },
    CA: {
      countryCode: 'CA',
      intensity: 60,
      label: 'Suministro Medio',
      colorCategory: 'medium',
    },
    CAN: {
      countryCode: 'CA',
      intensity: 60,
      label: 'Suministro Medio',
      colorCategory: 'medium',
    },
    BR: {
      countryCode: 'BR',
      intensity: 40,
      label: 'Expansión Baja',
      colorCategory: 'low',
    },
    BRA: {
      countryCode: 'BR',
      intensity: 40,
      label: 'Expansión Baja',
      colorCategory: 'low',
    },
  };

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          features: [russiaFeat, chinaFeat, canadaFeat, brazilFeat, switzerlandFeat],
        }),
      })
    ));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. useGlobeStyling (Colorimetría 3D Globe)
  // ─────────────────────────────────────────────────────────────────────────────
  describe('1. useGlobeStyling with Thematic Layers', () => {
    it('should assign correct thematic colors and strokes for all 4 severity categories', () => {
      const { result } = renderHook(() =>
        useGlobeStyling(null, null, 'risk', {}, {}, 'tier-n', customThematicMap)
      );

      // Critical (RU): rgba(239, 68, 68, 0.7) and #ef4444
      expect(result.current.getPolygonColor(russiaFeat)).toBe('rgba(239, 68, 68, 0.7)');
      expect(result.current.getPolygonStroke(russiaFeat)).toBe('#ef4444');

      // High (CN): rgba(249, 115, 22, 0.6) and #f97316
      expect(result.current.getPolygonColor(chinaFeat)).toBe('rgba(249, 115, 22, 0.6)');
      expect(result.current.getPolygonStroke(chinaFeat)).toBe('#f97316');

      // Medium (CA): rgba(234, 179, 8, 0.5) and #eab308
      expect(result.current.getPolygonColor(canadaFeat)).toBe('rgba(234, 179, 8, 0.5)');
      expect(result.current.getPolygonStroke(canadaFeat)).toBe('#eab308');

      // Low (BR): rgba(34, 197, 94, 0.4) and #22c55e
      expect(result.current.getPolygonColor(brazilFeat)).toBe('rgba(34, 197, 94, 0.4)');
      expect(result.current.getPolygonStroke(brazilFeat)).toBe('#22c55e');
    });

    it('should attenuate countries NOT present in layerData with dark neutral fill and subtle stroke', () => {
      const { result } = renderHook(() =>
        useGlobeStyling(null, null, 'risk', {}, {}, 'tier-n', customThematicMap)
      );

      // Switzerland is not in layerData:
      expect(result.current.getPolygonColor(switzerlandFeat)).toBe('rgba(15, 23, 42, 0.25)');
      expect(result.current.getPolygonStroke(switzerlandFeat)).toBe('rgba(51, 65, 85, 0.3)');
    });

    it('should intensify thematic color on hover over an affected country', () => {
      const { result } = renderHook(() =>
        useGlobeStyling(null, russiaFeat, 'risk', {}, {}, 'tier-n', customThematicMap)
      );

      // Russia is hovered and critical:
      expect(result.current.getPolygonColor(russiaFeat)).toBe('rgba(239, 68, 68, 0.85)');
    });

    it('should maintain intensified thematic tint and set cyan focus stroke when country is selected', () => {
      const { result } = renderHook(() =>
        useGlobeStyling(russiaFeat, null, 'risk', {}, {}, 'tier-n', customThematicMap)
      );

      // Russia is selected: maintains intensified crimson tint and cyan tactical border
      expect(result.current.getPolygonColor(russiaFeat)).toBe('rgba(239, 68, 68, 0.85)');
      expect(result.current.getPolygonStroke(russiaFeat)).toBe('#38bdf8');
    });

    it('should highlight selected country with cyan when it is NOT in layerData', () => {
      const { result } = renderHook(() =>
        useGlobeStyling(switzerlandFeat, null, 'risk', {}, {}, 'tier-n', customThematicMap)
      );

      expect(result.current.getPolygonColor(switzerlandFeat)).toBe('rgba(56, 189, 248, 0.75)');
      expect(result.current.getPolygonStroke(switzerlandFeat)).toBe('#38bdf8');
    });

    it('should fall back to standard base risk color when activeLayer is "none"', () => {
      const mockData = {
        'poly-ru': {
          name: 'Russia',
          iso: 'RUS',
          risk: 80,
          friction: '8.0/10',
          aiExposure: 'Alta' as const,
          baseColor: 'rgba(255, 23, 68, 0.28)',
          baseStroke: 'rgba(255, 23, 68, 0.95)',
          indicator: '#ff1744',
          textClass: 'text-[#ff1744]',
        },
      };

      const { result } = renderHook(() =>
        useGlobeStyling(null, null, 'risk', {}, mockData, 'none', customThematicMap)
      );

      expect(result.current.getPolygonColor(russiaFeat)).toBe('rgba(255, 23, 68, 0.28)');
      expect(result.current.getPolygonStroke(russiaFeat)).toBe('rgba(255, 23, 68, 0.95)');
    });

    it('should respect relations mode even if activeLayer is passed', () => {
      const activeRelations = {
        'poly-cn': {
          type: 'STRATEGIC_ALLY' as const,
          polygon: chinaFeat,
        },
      };

      const { result } = renderHook(() =>
        useGlobeStyling(russiaFeat, null, 'relations', activeRelations, {}, 'tier-n', customThematicMap)
      );

      // China is ally: gets emerald relation color
      expect(result.current.getPolygonColor(chinaFeat)).toBe('rgba(16, 185, 129, 0.65)');
      expect(result.current.getPolygonStroke(chinaFeat)).toBe('#10b981');
    });

    it('should resolve country by polyId, ADM0_A3, ADMIN, or mockData iso', () => {
      const featByAdm0 = {
        type: 'Feature',
        polyId: 'unique-id-1',
        properties: { ADM0_A3: 'RUS' },
        geometry: mockGeometry,
      };

      const featByAdmin = {
        type: 'Feature',
        polyId: 'unique-id-2',
        properties: { ADMIN: 'Canada' },
        geometry: mockGeometry,
      };

      const featByMock = {
        type: 'Feature',
        polyId: 'unique-id-3',
        properties: {},
        geometry: mockGeometry,
      };

      const mockData = {
        'unique-id-3': { iso: 'BRA' } as any,
      };

      const { result } = renderHook(() =>
        useGlobeStyling(null, null, 'risk', {}, mockData, 'tier-n', customThematicMap)
      );

      expect(result.current.getPolygonColor(featByAdm0)).toBe('rgba(239, 68, 68, 0.7)');
      expect(result.current.getPolygonColor(featByAdmin)).toBe('rgba(234, 179, 8, 0.5)');
      expect(result.current.getPolygonColor(featByMock)).toBe('rgba(34, 197, 94, 0.4)');
    });

    it('should NOT paint country as critical crimson when colorCategory is "none"', () => {
      const noneCategoryMap: ThematicLayerMap = {
        CH: {
          countryCode: 'CH',
          intensity: 10,
          label: 'Neutro',
          colorCategory: 'none',
        },
      };

      const { result } = renderHook(() =>
        useGlobeStyling(null, null, 'risk', {}, {}, 'tier-n', noneCategoryMap)
      );

      // Base: attenuated
      expect(result.current.getPolygonColor(switzerlandFeat)).toBe('rgba(15, 23, 42, 0.25)');
      expect(result.current.getPolygonStroke(switzerlandFeat)).toBe('rgba(51, 65, 85, 0.3)');

      // Hover: subtle cyan, definitely NOT critical crimson rgba(239, 68, 68, 0.85) or #ef4444
      const { result: hoverResult } = renderHook(() =>
        useGlobeStyling(null, switzerlandFeat, 'risk', {}, {}, 'tier-n', noneCategoryMap)
      );
      expect(hoverResult.current.getPolygonColor(switzerlandFeat)).toBe('rgba(56, 189, 248, 0.45)');
      expect(hoverResult.current.getPolygonStroke(switzerlandFeat)).toBe('rgba(51, 65, 85, 0.3)');
    });

    it('should give subtle cyan hover tint to unaffected country not in layerData', () => {
      const { result } = renderHook(() =>
        useGlobeStyling(null, switzerlandFeat, 'risk', {}, {}, 'tier-n', customThematicMap)
      );

      expect(result.current.getPolygonColor(switzerlandFeat)).toBe('rgba(56, 189, 248, 0.45)');
      expect(result.current.getPolygonStroke(switzerlandFeat)).toBe('rgba(148, 163, 184, 0.6)');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Map2D (Colorimetría 2D D3 Mercator)
  // ─────────────────────────────────────────────────────────────────────────────
  describe('2. Map2D D3 Mercator Thematic Layer Rendering', () => {
    it('should apply thematic fill, stroke, and glow filter in risk mode with activeLayer', () => {
      const { container } = render(
        <Map2D
          geoData={[russiaFeat, chinaFeat, canadaFeat, brazilFeat, switzerlandFeat]}
          selectedCountry={null}
          hoveredCountry={null}
          activeMode="risk"
          activeRelations={{}}
          countryMockData={{}}
          activeLayer="tier-n"
          layerData={customThematicMap}
          onCountryHover={() => {}}
          onCountryClick={() => {}}
          onBackgroundClick={() => {}}
          isPanelOpen={false}
          containerDimensions={{ width: 800, height: 600 }}
        />
      );

      // Critical (RU): crimson fill, red stroke, glow-rose
      const ruPath = container.querySelector('#poly-ru');
      expect(ruPath?.getAttribute('fill')).toBe('rgba(239, 68, 68, 0.7)');
      expect(ruPath?.getAttribute('stroke')).toBe('#ef4444');
      expect(ruPath?.getAttribute('stroke-width')).toBe('1.2px');
      expect(ruPath?.getAttribute('filter')).toBe('url(#glow-rose)');

      // High (CN): orange fill, amber stroke, glow-amber
      const cnPath = container.querySelector('#poly-cn');
      expect(cnPath?.getAttribute('fill')).toBe('rgba(249, 115, 22, 0.6)');
      expect(cnPath?.getAttribute('stroke')).toBe('#f97316');
      expect(cnPath?.getAttribute('stroke-width')).toBe('1.1px');
      expect(cnPath?.getAttribute('filter')).toBe('url(#glow-amber)');

      // Medium (CA): yellow fill, yellow stroke, glow-amber
      const caPath = container.querySelector('#poly-ca');
      expect(caPath?.getAttribute('fill')).toBe('rgba(234, 179, 8, 0.5)');
      expect(caPath?.getAttribute('stroke')).toBe('#eab308');
      expect(caPath?.getAttribute('stroke-width')).toBe('1.0px');
      expect(caPath?.getAttribute('filter')).toBe('url(#glow-amber)');

      // Low (BR): green fill, emerald stroke, glow-emerald
      const brPath = container.querySelector('#poly-br');
      expect(brPath?.getAttribute('fill')).toBe('rgba(34, 197, 94, 0.4)');
      expect(brPath?.getAttribute('stroke')).toBe('#22c55e');
      expect(brPath?.getAttribute('stroke-width')).toBe('0.9px');
      expect(brPath?.getAttribute('filter')).toBe('url(#glow-emerald)');

      // Unaffected (CH): dark neutral fill, subtle stroke, filter none
      const chPath = container.querySelector('#poly-ch');
      expect(chPath?.getAttribute('fill')).toBe('rgba(15, 23, 42, 0.25)');
      expect(chPath?.getAttribute('stroke')).toBe('rgba(51, 65, 85, 0.3)');
      expect(chPath?.getAttribute('filter')).toBe('none');
    });

    it('should intensify hover style and preserve glow filter on hovered country', () => {
      const { container } = render(
        <Map2D
          geoData={[russiaFeat, switzerlandFeat]}
          selectedCountry={null}
          hoveredCountry={russiaFeat}
          activeMode="risk"
          activeRelations={{}}
          countryMockData={{}}
          activeLayer="tier-n"
          layerData={customThematicMap}
          onCountryHover={() => {}}
          onCountryClick={() => {}}
          onBackgroundClick={() => {}}
          isPanelOpen={false}
          containerDimensions={{ width: 800, height: 600 }}
        />
      );

      const ruPath = container.querySelector('#poly-ru');
      expect(ruPath?.getAttribute('fill')).toBe('rgba(239, 68, 68, 0.85)');
      expect(ruPath?.getAttribute('stroke')).toBe('#ef4444');
      expect(ruPath?.getAttribute('stroke-width')).toBe('1.8px');
      expect(ruPath?.getAttribute('filter')).toBe('url(#glow-rose)');
    });

    it('should respect selected country state with cyan tactical focus border and glow', () => {
      const { container } = render(
        <Map2D
          geoData={[russiaFeat, switzerlandFeat]}
          selectedCountry={russiaFeat}
          hoveredCountry={null}
          activeMode="risk"
          activeRelations={{}}
          countryMockData={{}}
          activeLayer="tier-n"
          layerData={customThematicMap}
          onCountryHover={() => {}}
          onCountryClick={() => {}}
          onBackgroundClick={() => {}}
          isPanelOpen={false}
          containerDimensions={{ width: 800, height: 600 }}
        />
      );

      const ruPath = container.querySelector('#poly-ru');
      // Must maintain intensified thematic tint AND cyan tactical focus border
      expect(ruPath?.getAttribute('fill')).toBe('rgba(239, 68, 68, 0.85)');
      expect(ruPath?.getAttribute('stroke')).toBe('#38bdf8');
      expect(ruPath?.getAttribute('stroke-width')).toBe('2px');
      expect(ruPath?.getAttribute('filter')).toBe('url(#glow-cyan)');
    });

    it('should style selected unaffected country with cyan fill and tactical border', () => {
      const { container } = render(
        <Map2D
          geoData={[russiaFeat, switzerlandFeat]}
          selectedCountry={switzerlandFeat}
          hoveredCountry={null}
          activeMode="risk"
          activeRelations={{}}
          countryMockData={{}}
          activeLayer="tier-n"
          layerData={customThematicMap}
          onCountryHover={() => {}}
          onCountryClick={() => {}}
          onBackgroundClick={() => {}}
          isPanelOpen={false}
          containerDimensions={{ width: 800, height: 600 }}
        />
      );

      const chPath = container.querySelector('#poly-ch');
      expect(chPath?.getAttribute('fill')).toBe('rgba(14, 165, 233, 0.45)');
      expect(chPath?.getAttribute('stroke')).toBe('#38bdf8');
      expect(chPath?.getAttribute('stroke-width')).toBe('2px');
      expect(chPath?.getAttribute('filter')).toBe('url(#glow-cyan)');
    });

    it('should style hovered unaffected country with subtle cyan highlight in 2D mode', () => {
      const { container } = render(
        <Map2D
          geoData={[russiaFeat, switzerlandFeat]}
          selectedCountry={null}
          hoveredCountry={switzerlandFeat}
          activeMode="risk"
          activeRelations={{}}
          countryMockData={{}}
          activeLayer="tier-n"
          layerData={customThematicMap}
          onCountryHover={() => {}}
          onCountryClick={() => {}}
          onBackgroundClick={() => {}}
          isPanelOpen={false}
          containerDimensions={{ width: 800, height: 600 }}
        />
      );

      const chPath = container.querySelector('#poly-ch');
      expect(chPath?.getAttribute('fill')).toBe('rgba(56, 189, 248, 0.25)');
      expect(chPath?.getAttribute('stroke')).toBe('#7dd3fc');
      expect(chPath?.getAttribute('stroke-width')).toBe('1.2px');
      expect(chPath?.getAttribute('filter')).toBe('url(#glow-cyan)');
    });

    it('should restore normal risk score appearance when activeLayer is "none"', () => {
      const mockData = {
        'poly-ru': {
          name: 'Russia',
          iso: 'RUS',
          risk: 85,
          friction: '8.5/10',
          aiExposure: 'Alta' as const,
          baseColor: 'rgba(255, 23, 68, 0.28)',
          baseStroke: 'rgba(255, 23, 68, 0.95)',
          indicator: '#ff1744',
          textClass: 'text-[#ff1744]',
        },
      };

      const { container } = render(
        <Map2D
          geoData={[russiaFeat]}
          selectedCountry={null}
          hoveredCountry={null}
          activeMode="risk"
          activeRelations={{}}
          countryMockData={mockData}
          activeLayer="none"
          layerData={{}}
          onCountryHover={() => {}}
          onCountryClick={() => {}}
          onBackgroundClick={() => {}}
          isPanelOpen={false}
          containerDimensions={{ width: 800, height: 600 }}
        />
      );

      const ruPath = container.querySelector('#poly-ru');
      expect(ruPath?.getAttribute('fill')).toBe('rgba(255, 23, 68, 0.28)');
      expect(ruPath?.getAttribute('stroke')).toBe('rgba(255, 23, 68, 0.95)');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. GeopoliticalHUD & LayerLegendPanel
  // ─────────────────────────────────────────────────────────────────────────────
  describe('3. GeopoliticalHUD & LayerLegendPanel', () => {
    it('should NOT render LayerLegendPanel when activeLayer is "none"', () => {
      render(
        <SettingsProvider>
          <GeopoliticalHUD
            geoDataCount={10}
            is2DMode={true}
            setIs2DMode={() => {}}
            activeMode="risk"
            onResetView={() => {}}
            searchFilter=""
            setSearchFilter={() => {}}
            filteredCountries={[]}
            countryMockData={{}}
            onSelectCountry={() => {}}
            activeLayer="none"
            layerData={{}}
          />
        </SettingsProvider>
      );

      expect(screen.queryByTestId('layer-legend-panel')).toBeNull();
    });

    it('should NOT render LayerLegendPanel in non-risk modes (relations or news)', () => {
      render(
        <SettingsProvider>
          <GeopoliticalHUD
            geoDataCount={10}
            is2DMode={true}
            setIs2DMode={() => {}}
            activeMode="relations"
            onResetView={() => {}}
            searchFilter=""
            setSearchFilter={() => {}}
            filteredCountries={[]}
            countryMockData={{}}
            onSelectCountry={() => {}}
            activeLayer="tier-n"
            layerData={customThematicMap}
          />
        </SettingsProvider>
      );

      expect(screen.queryByTestId('layer-legend-panel')).toBeNull();
    });

    it('should render LayerLegendPanel with correct badge, title, and counts in risk mode', () => {
      render(
        <SettingsProvider>
          <GeopoliticalHUD
            geoDataCount={10}
            is2DMode={true}
            setIs2DMode={() => {}}
            activeMode="risk"
            onResetView={() => {}}
            searchFilter=""
            setSearchFilter={() => {}}
            filteredCountries={[]}
            countryMockData={{}}
            onSelectCountry={() => {}}
            activeLayer="tier-n"
            layerData={customThematicMap}
          />
        </SettingsProvider>
      );

      expect(screen.getByTestId('layer-legend-panel')).toBeInTheDocument();
      expect(screen.getByTestId('layer-legend-badge')).toHaveTextContent('TIER-N');

      // Deduplicated unique countries: RU (critical), CN (high), CA (medium), BR (low) = 4 total
      expect(screen.getByTestId('layer-legend-total')).toHaveTextContent('4 países');
      expect(screen.getByTestId('legend-chip-critical')).toHaveTextContent('1');
      expect(screen.getByTestId('legend-chip-high')).toHaveTextContent('1');
      expect(screen.getByTestId('legend-chip-medium')).toHaveTextContent('1');
      expect(screen.getByTestId('legend-chip-low')).toHaveTextContent('1');
    });

    it('should render correct badges for resources, maritime, and footprint layers', () => {
      const layers: Array<{ layer: ThematicLayer; badge: string }> = [
        { layer: 'resources', badge: 'RECURSOS CRÍTICOS' },
        { layer: 'maritime', badge: 'RUTAS MARÍTIMAS' },
        { layer: 'footprint', badge: 'HUELLA CORPORATIVA' },
      ];

      for (const item of layers) {
        const { unmount } = render(
          <LayerLegendPanel
            activeLayer={item.layer}
            layerData={getThematicLayerData(item.layer)}
            onResetLayer={() => {}}
          />
        );

        expect(screen.getByTestId('layer-legend-badge')).toHaveTextContent(item.badge);
        expect(screen.getByTestId('reset-layer-button')).toHaveTextContent('Restablecer a Base');
        unmount();
      }
    });

    it('should call onResetLayer when clicking "Restablecer a Base"', () => {
      const onResetLayer = vi.fn();

      render(
        <LayerLegendPanel
          activeLayer="tier-n"
          layerData={customThematicMap}
          onResetLayer={onResetLayer}
        />
      );

      const resetBtn = screen.getByTestId('reset-layer-button');
      fireEvent.click(resetBtn);

      expect(onResetLayer).toHaveBeenCalledTimes(1);
    });

    it('should NOT drop distinct countries that share identical labels when computing counts', () => {
      const sharedLabelMap: ThematicLayerMap = {
        DE: { countryCode: 'DE', intensity: 70, label: 'Hub Regional', colorCategory: 'high' },
        FR: { countryCode: 'FR', intensity: 65, label: 'Hub Regional', colorCategory: 'high' },
        IT: { countryCode: 'IT', intensity: 60, label: 'Hub Regional', colorCategory: 'medium' },
      };

      render(
        <LayerLegendPanel
          activeLayer="footprint"
          layerData={sharedLabelMap}
          onResetLayer={() => {}}
        />
      );

      // 3 distinct countries despite sharing identical label string
      expect(screen.getByTestId('layer-legend-total')).toHaveTextContent('3 países');
      expect(screen.getByTestId('legend-chip-high')).toHaveTextContent('2');
      expect(screen.getByTestId('legend-chip-medium')).toHaveTextContent('1');
    });

    it('should NOT count items with colorCategory "none" toward affected countries total', () => {
      const withNoneCategoryMap: ThematicLayerMap = {
        DE: { countryCode: 'DE', intensity: 80, label: 'Critical Node', colorCategory: 'critical' },
        CH: { countryCode: 'CH', intensity: 10, label: 'Neutral Jurisdiction', colorCategory: 'none' },
      };

      render(
        <LayerLegendPanel
          activeLayer="tier-n"
          layerData={withNoneCategoryMap}
          onResetLayer={() => {}}
        />
      );

      // Only DE is affected; CH is none/unrated
      expect(screen.getByTestId('layer-legend-total')).toHaveTextContent('1 países');
      expect(screen.getByTestId('legend-chip-critical')).toHaveTextContent('1');
    });

    it('should handle empty or undefined layerData safely without crashing', () => {
      render(
        <LayerLegendPanel
          activeLayer="tier-n"
          layerData={undefined}
          onResetLayer={() => {}}
        />
      );

      expect(screen.getByTestId('layer-legend-panel')).toBeInTheDocument();
      expect(screen.getByTestId('layer-legend-total')).toHaveTextContent('0 países');
      expect(screen.getByTestId('legend-chip-critical')).toHaveTextContent('0');
      expect(screen.getByTestId('legend-chip-high')).toHaveTextContent('0');
      expect(screen.getByTestId('legend-chip-medium')).toHaveTextContent('0');
      expect(screen.getByTestId('legend-chip-low')).toHaveTextContent('0');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. GeopoliticalMonitor Full Orchestrator Integration
  // ─────────────────────────────────────────────────────────────────────────────
  describe('4. GeopoliticalMonitor Integration Flow', () => {
    it('should toggle legend panel when selecting a thematic layer and allow resetting from legend button', async () => {
      await React.act(async () => {
        render(
          <SettingsProvider>
            <GeopoliticalMonitor hideSidebar={true} />
          </SettingsProvider>
        );
      });

      // Initially activeLayer is 'none', so legend panel is not mounted
      expect(screen.queryByTestId('layer-legend-panel')).toBeNull();

      // Click on TIER-N button in ThematicLayerSelector
      const tierNBtn = screen.getByTestId('thematic-layer-tier-n');
      await React.act(async () => {
        fireEvent.click(tierNBtn);
      });

      // Now LayerLegendPanel should appear in the HUD
      expect(screen.getByTestId('layer-legend-panel')).toBeInTheDocument();
      expect(screen.getByTestId('layer-legend-badge')).toHaveTextContent('TIER-N');

      // Click "Restablecer a Base" inside the HUD's LayerLegendPanel
      const resetBtn = screen.getByTestId('reset-layer-button');
      await React.act(async () => {
        fireEvent.click(resetBtn);
      });

      // LayerLegendPanel unmounts and BASE is active again
      expect(screen.queryByTestId('layer-legend-panel')).toBeNull();
      expect(screen.getByTestId('thematic-layer-none')).toHaveAttribute('aria-pressed', 'true');
    });
  });
});
