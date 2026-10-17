import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, renderHook, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { getPolygonCentroid, getRiskAppearance } from '@/components/dev/geopolitical-monitor/utils/geo-helpers';
import { GeopoliticalHUD } from '@/components/dev/geopolitical-monitor/components/GeopoliticalHUD';
import { GeopoliticalTooltip } from '@/components/dev/geopolitical-monitor/components/GeopoliticalTooltip';
import { GeopoliticalSidebar } from '@/components/dev/geopolitical-monitor/components/GeopoliticalSidebar';
import { useGeopoliticalMonitor } from '@/components/dev/geopolitical-monitor/hooks/useGeopoliticalMonitor';
import { useGlobeStyling } from '@/components/dev/geopolitical-monitor/hooks/useGlobeStyling';
import { GeopoliticalKnowledgeService } from '@/lib/services/geopolitical-knowledge-service';
import { Map2D } from '@/components/dev/geopolitical-monitor/components/Map2D';
import { ValueNetworkSection } from '@/components/dev/geopolitical-monitor/components/sidebar/ValueNetworkSection';
import { TacticalLogisticsSection } from '@/components/dev/geopolitical-monitor/components/sidebar/TacticalLogisticsSection';
import { RelationType } from '@/components/dev/geopolitical-monitor/types';
import { SettingsProvider } from '@/lib/settings-context';

describe('Geopolitical Monitor - Helpers & Components', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (typeof url === 'string' && url.includes('world-tension')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ tensionIndex: 45, events: [] }),
        });
      }
      if (typeof url === 'string' && url.includes('world-bank-lpi')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ lpiScore: 3.5, data: {} }),
        });
      }
      if (typeof url === 'string' && url.includes('country-mechanics')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: {} }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ features: [] }),
      });
    }));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('should compute risk appearances correctly for low, medium, and high risk bands', () => {
    const lowRisk = getRiskAppearance(20);
    expect(lowRisk.indicator).toBe('#00e676');

    const medRisk = getRiskAppearance(50);
    expect(medRisk.indicator).toBe('#ffea00');

    const highRisk = getRiskAppearance(85);
    expect(highRisk.indicator).toBe('#ff1744');
  });

  it('should compute polygon centroid coordinates for GeoJSON geometry', () => {
    const polygonGeometry = {
      type: 'Polygon',
      coordinates: [
        [[0, 0], [10, 0], [10, 20], [0, 20], [0, 0]],
      ],
    };
    const centroid = getPolygonCentroid(polygonGeometry);
    expect(centroid.lat).toBe(10);
    expect(centroid.lng).toBe(5);
  });

  it('should render GeopoliticalHUD with telemetry controls', () => {
    render(
      <SettingsProvider>
        <GeopoliticalHUD
          geoDataCount={175}
          is2DMode={false}
          setIs2DMode={() => {}}
          activeMode="nodes"
          onResetView={() => {}}
          searchFilter=""
          setSearchFilter={() => {}}
          filteredCountries={[]}
          countryMockData={{}}
          onSelectCountry={() => {}}
        />
      </SettingsProvider>
    );

    expect(screen.getByText(/Geopolitics/i)).toBeInTheDocument();
    expect(screen.getByText('HUD 3D/2D')).toBeInTheDocument();
    expect(screen.getByText('Nodos')).toBeInTheDocument();
    expect(screen.getByText('Vínculos')).toBeInTheDocument();
  });

  it('should render GeopoliticalTooltip when hovered over a country', () => {
    const hoveredFeature = {
      type: 'Feature',
      polyId: 'FRA',
      properties: { ADMIN: 'France' },
    };
    const countryData = {
      name: 'France',
      iso: 'FRA',
      risk: 25,
      riskLevel: 'Bajo',
      threat: 'Estable',
      gdp: '$3.0T',
      supply: 'Aeroespacial & Nuclear',
      chokepoint: 'Canal de la Mancha',
      color: 'rgba(0, 230, 118, 0.18)',
      stroke: 'rgba(0, 230, 118, 0.85)',
      indicator: '#00e676',
      textClass: 'text-[#00e676]',
      baseColor: 'rgba(0, 230, 118, 0.18)',
    };

    render(
      <GeopoliticalTooltip
        isPanelOpen={false}
        hoveredCountry={hoveredFeature as any}
        countryData={countryData as any}
        tooltipPos={{ x: 100, y: 150 }}
        cursorPos={{ x: 100, y: 150 }}
      />
    );

    expect(screen.getByText('France')).toBeInTheDocument();
    expect(screen.getByText(/Riesgo 25/i)).toBeInTheDocument();
  });

  it('should render GeopoliticalSidebar with country details', () => {
    const activeData = {
      name: 'United States of America',
      iso: 'USA',
      risk: 20,
      riskLevel: 'Bajo',
      threat: 'Alianza Estratégica',
      gdp: '$26.9T',
      supply: 'Semiconductores avanzados, Aeroespacial, Petróleo y GNL',
      chokepoint: 'Estrecho de Malaca (Rutas Comerciales Pacífico)',
      friction: 'Baja (2.1%)',
      aiExposure: 'Alta (Líder GPU/Cloud)',
      color: 'rgba(0, 230, 118, 0.18)',
      stroke: 'rgba(0, 230, 118, 0.85)',
      indicator: '#00e676',
      textClass: 'text-[#00e676]',
      baseColor: 'rgba(0, 230, 118, 0.18)',
    };

    const { rerender } = render(
      <GeopoliticalSidebar
        isPanelOpen={true}
        activeData={activeData as any}
        activeMode="risk"
        activeRelations={{}}
        onClose={() => {}}
        activeMacro={null}
        isMacroLoading={false}
        macroError={null}
      />
    );

    expect(screen.getByText('United States of America')).toBeInTheDocument();
    expect(screen.getByText('USA')).toBeInTheDocument();
    expect(screen.getByText('Nodo Resiliente')).toBeInTheDocument();
    expect(screen.getByText(/Métricas Soberanas Cuantitativas/i)).toBeInTheDocument();
    expect(screen.getByText(/Deducción Causal Multimodal/i)).toBeInTheDocument();

    rerender(
      <GeopoliticalSidebar
        isPanelOpen={true}
        activeData={activeData as any}
        activeMode="relations"
        activeRelations={{ CHN: { type: 'supplier', weight: 0.8 } as any }}
        onClose={() => {}}
        activeMacro={null}
        isMacroLoading={false}
        macroError={null}
      />
    );

    expect(screen.getByText(/Cadena de Suministro/i)).toBeInTheDocument();
  });

  it('should clean JSON string responses into plain text correctly', () => {
    const rawJson = '{"analisis": "La economía de la India se encuentra en una fase de expansión..."}';
    const trimmed = rawJson.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(trimmed);
    expect(parsed.analisis).toBe('La economía de la India se encuentra en una fase de expansión...');
  });

  it('should default to 2D mode in useGeopoliticalMonitor', () => {
    const { result } = renderHook(() => useGeopoliticalMonitor());
    expect(result.current.is2DMode).toBe(true);

    const { result: result3D } = renderHook(() => useGeopoliticalMonitor({ default2D: false }));
    expect(result3D.current.is2DMode).toBe(false);
  });

  it('should style STRATEGIC_ALLY relations with emerald green in useGlobeStyling (3D)', () => {
    const selected = {
      polyId: 'poly-USA',
      type: 'Feature',
      properties: { ADMIN: 'United States', ISO_A3: 'USA' },
      geometry: { type: 'Polygon', coordinates: [] },
    };
    const ally = {
      polyId: 'poly-FRA',
      type: 'Feature',
      properties: { ADMIN: 'France', ISO_A3: '-99', ADM0_A3: 'FRA' },
      geometry: { type: 'Polygon', coordinates: [] },
    };
    const activeRelations = {
      'poly-FRA': {
        type: 'STRATEGIC_ALLY' as RelationType,
        polygon: ally as any,
      },
    };

    const { result } = renderHook(() =>
      useGlobeStyling(selected as any, null, 'relations', activeRelations as any, {})
    );

    expect(result.current.getPolygonColor(ally)).toBe('rgba(16, 185, 129, 0.65)');
    expect(result.current.getPolygonStroke(ally)).toBe('#10b981');

    // On hover
    const { result: resultHover } = renderHook(() =>
      useGlobeStyling(selected as any, ally as any, 'relations', activeRelations as any, {})
    );
    expect(resultHover.current.getPolygonColor(ally)).toBe('rgba(16, 185, 129, 0.88)');
  });

  it('should resolve France and Norway country codes from ADM0_A3 fallback', () => {
    // In Natural Earth 110m, France and Norway have ISO_A3: -99, with ADM0_A3: FRA and NOR
    const fraCode = GeopoliticalKnowledgeService.resolveCountryCode('FRA');
    expect(fraCode).toBe('FR');
    const fraProfile = GeopoliticalKnowledgeService.getCountryProfile('FRA');
    expect(fraProfile).not.toBeNull();
    expect(fraProfile?.country.code).toBe('FR');

    const norCode = GeopoliticalKnowledgeService.resolveCountryCode('NOR');
    expect(norCode).toBe('NO');
    const norProfile = GeopoliticalKnowledgeService.getCountryProfile('NOR');
    expect(norProfile).not.toBeNull();
    expect(norProfile?.country.code).toBe('NO');
  });

  it('should style STRATEGIC_ALLY and fallback relations correctly in Map2D', () => {
    const usaFeature = {
      type: 'Feature',
      polyId: 'poly-0',
      properties: { ADMIN: 'United States', ISO_A3: 'USA' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]],
      },
    };
    const fraFeature = {
      type: 'Feature',
      polyId: 'poly-1',
      properties: { ADMIN: 'France', ISO_A3: '-99', ADM0_A3: 'FRA' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[20, 20], [30, 20], [30, 30], [20, 30], [20, 20]]],
      },
    };
    const customFeature = {
      type: 'Feature',
      polyId: 'poly-2',
      properties: { ADMIN: 'CustomLand', ISO_A3: 'CST' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[40, 40], [50, 40], [50, 50], [40, 50], [40, 40]]],
      },
    };

    const activeRelations = {
      'poly-1': {
        type: 'STRATEGIC_ALLY' as RelationType,
        polygon: fraFeature as any,
      },
      'poly-2': {
        type: 'UNKNOWN_CUSTOM_RELATION' as any,
        polygon: customFeature as any,
      },
    };

    const { container } = render(
      <Map2D
        geoData={[usaFeature, fraFeature, customFeature] as any}
        selectedCountry={usaFeature as any}
        hoveredCountry={null}
        activeMode="relations"
        activeRelations={activeRelations as any}
        countryMockData={{}}
        onCountryHover={() => {}}
        onCountryClick={() => {}}
        onBackgroundClick={() => {}}
        isPanelOpen={false}
        containerDimensions={{ width: 800, height: 600 }}
      />
    );

    const fraPath = container.querySelector('#poly-1');
    expect(fraPath).not.toBeNull();
    // In Map2D, STRATEGIC_ALLY gets emerald green
    expect(fraPath?.getAttribute('fill')).toBe('rgba(16, 185, 129, 0.32)');
    expect(fraPath?.getAttribute('stroke')).toBe('#10b981');

    // Unknown relation gets fallback else styling instead of being left unstyled
    const customPath = container.querySelector('#poly-2');
    expect(customPath).not.toBeNull();
    expect(customPath?.getAttribute('fill')).toBe('rgba(100, 116, 139, 0.3)');
    expect(customPath?.getAttribute('stroke')).toBe('#94a3b8');
  });

  it('should return empty arcsData in useGlobeStyling (3D arcs removed per user request)', () => {
    const selected = {
      polyId: 'poly-USA',
      type: 'Feature',
      properties: { ADMIN: 'United States', ISO_A3: 'USA' },
      geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] },
    };
    const ally = {
      polyId: 'poly-FRA',
      type: 'Feature',
      properties: { ADMIN: 'France', ISO_A3: '-99', ADM0_A3: 'FRA' },
      geometry: { type: 'Polygon', coordinates: [[[10, 10], [11, 10], [11, 11], [10, 11], [10, 10]]] },
    };
    const activeRelations = {
      'poly-FRA': {
        type: 'STRATEGIC_ALLY' as RelationType,
        polygon: ally as any,
      },
    };

    const { result } = renderHook(() =>
      useGlobeStyling(selected as any, null, 'relations', activeRelations as any, {})
    );

    expect(result.current.arcsData).toEqual([]);
  });

  it('should preserve emerald green on hover for STRATEGIC_ALLY in Map2D relations mode and not render arcs or centroid markers', () => {
    const usaFeature = {
      type: 'Feature',
      polyId: 'poly-0',
      properties: { ADMIN: 'United States', ISO_A3: 'USA' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]],
      },
    };
    const fraFeature = {
      type: 'Feature',
      polyId: 'poly-1',
      properties: { ADMIN: 'France', ISO_A3: '-99', ADM0_A3: 'FRA' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[20, 20], [30, 20], [30, 30], [20, 30], [20, 20]]],
      },
    };

    const activeRelations = {
      'poly-1': {
        type: 'STRATEGIC_ALLY' as RelationType,
        polygon: fraFeature as any,
      },
    };

    const { container } = render(
      <Map2D
        geoData={[usaFeature, fraFeature] as any}
        selectedCountry={usaFeature as any}
        hoveredCountry={fraFeature as any}
        activeMode="relations"
        activeRelations={activeRelations as any}
        countryMockData={{}}
        onCountryHover={() => {}}
        onCountryClick={() => {}}
        onBackgroundClick={() => {}}
        isPanelOpen={false}
        containerDimensions={{ width: 800, height: 600 }}
      />
    );

    const fraPath = container.querySelector('#poly-1');
    expect(fraPath).not.toBeNull();
    // Hovering over France in relations mode keeps emerald green rather than falling back to cyan
    expect(fraPath?.getAttribute('fill')).toBe('rgba(16, 185, 129, 0.55)');
    expect(fraPath?.getAttribute('stroke')).toBe('#10b981');
    expect(fraPath?.getAttribute('filter')).toBe('url(#glow-emerald)');

    // Arcs layer should NOT contain any relation arcs (removed per user request)
    const arc = container.querySelector('.relation-arc-2d');
    expect(arc).toBeNull();

    // Markers layer should NOT contain any centroid circles (removed per user request)
    const circles = container.querySelectorAll('.markers-layer circle');
    expect(circles).toHaveLength(0);
  });

  it('should style ECONOMIC_PARTNER relations with tactical indigo in useGlobeStyling (3D)', () => {
    const selected = {
      polyId: 'poly-ESP',
      type: 'Feature',
      properties: { ADMIN: 'Spain', ISO_A3: 'ESP' },
      geometry: { type: 'Polygon', coordinates: [] },
    };
    const partner = {
      polyId: 'poly-MEX',
      type: 'Feature',
      properties: { ADMIN: 'Mexico', ISO_A3: 'MEX' },
      geometry: { type: 'Polygon', coordinates: [] },
    };
    const activeRelations = {
      'poly-MEX': {
        type: 'ECONOMIC_PARTNER' as RelationType,
        polygon: partner as any,
      },
    };

    const { result } = renderHook(() =>
      useGlobeStyling(selected as any, null, 'relations', activeRelations as any, {})
    );

    // Selected country keeps exclusive cyan
    expect(result.current.getPolygonColor(selected)).toBe('rgba(56, 189, 248, 0.75)');
    expect(result.current.getPolygonStroke(selected)).toBe('#38bdf8');

    // Economic partner gets tactical indigo
    expect(result.current.getPolygonColor(partner)).toBe('rgba(129, 140, 248, 0.65)');
    expect(result.current.getPolygonStroke(partner)).toBe('#818cf8');

    // On hover, partner gets brighter indigo
    const { result: resultHover } = renderHook(() =>
      useGlobeStyling(selected as any, partner as any, 'relations', activeRelations as any, {})
    );
    expect(resultHover.current.getPolygonColor(partner)).toBe('rgba(129, 140, 248, 0.88)');
  });

  it('should style ECONOMIC_PARTNER relations with tactical indigo in Map2D and include glow-indigo filter', () => {
    const espFeature = {
      type: 'Feature',
      polyId: 'poly-ESP',
      properties: { ADMIN: 'Spain', ISO_A3: 'ESP' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]],
      },
    };
    const mexFeature = {
      type: 'Feature',
      polyId: 'poly-MEX',
      properties: { ADMIN: 'Mexico', ISO_A3: 'MEX' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[20, 20], [30, 20], [30, 30], [20, 30], [20, 20]]],
      },
    };

    const activeRelations = {
      'poly-MEX': {
        type: 'ECONOMIC_PARTNER' as RelationType,
        polygon: mexFeature as any,
      },
    };

    const { container } = render(
      <Map2D
        geoData={[espFeature, mexFeature] as any}
        selectedCountry={espFeature as any}
        hoveredCountry={null}
        activeMode="relations"
        activeRelations={activeRelations as any}
        countryMockData={{}}
        onCountryHover={() => {}}
        onCountryClick={() => {}}
        onBackgroundClick={() => {}}
        isPanelOpen={false}
        containerDimensions={{ width: 800, height: 600 }}
      />
    );

    // Verify glow-indigo filter exists in defs
    const glowIndigoFilter = container.querySelector('#glow-indigo');
    expect(glowIndigoFilter).not.toBeNull();
    expect(glowIndigoFilter?.querySelector('feGaussianBlur')).not.toBeNull();

    // Selected country keeps exclusive cyan styling
    const espPath = container.querySelector('#poly-ESP');
    expect(espPath).not.toBeNull();
    expect(espPath?.getAttribute('fill')).toBe('rgba(14, 165, 233, 0.45)');
    expect(espPath?.getAttribute('stroke')).toBe('#38bdf8');
    expect(espPath?.getAttribute('filter')).toBe('url(#glow-cyan)');

    // Economic partner country has indigo styling
    const mexPath = container.querySelector('#poly-MEX');
    expect(mexPath).not.toBeNull();
    expect(mexPath?.getAttribute('fill')).toBe('rgba(129, 140, 248, 0.35)');
    expect(mexPath?.getAttribute('stroke')).toBe('#818cf8');
    expect(mexPath?.getAttribute('stroke-width')).toBe('1.4px');
    expect(mexPath?.getAttribute('filter')).toBe('url(#glow-indigo)');
  });

  it('should preserve tactical indigo on hover for ECONOMIC_PARTNER in Map2D relations mode', () => {
    const espFeature = {
      type: 'Feature',
      polyId: 'poly-ESP',
      properties: { ADMIN: 'Spain', ISO_A3: 'ESP' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]],
      },
    };
    const mexFeature = {
      type: 'Feature',
      polyId: 'poly-MEX',
      properties: { ADMIN: 'Mexico', ISO_A3: 'MEX' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[20, 20], [30, 20], [30, 30], [20, 30], [20, 20]]],
      },
    };

    const activeRelations = {
      'poly-MEX': {
        type: 'ECONOMIC_PARTNER' as RelationType,
        polygon: mexFeature as any,
      },
    };

    const { container } = render(
      <Map2D
        geoData={[espFeature, mexFeature] as any}
        selectedCountry={espFeature as any}
        hoveredCountry={mexFeature as any}
        activeMode="relations"
        activeRelations={activeRelations as any}
        countryMockData={{}}
        onCountryHover={() => {}}
        onCountryClick={() => {}}
        onBackgroundClick={() => {}}
        isPanelOpen={false}
        containerDimensions={{ width: 800, height: 600 }}
      />
    );

    const mexPath = container.querySelector('#poly-MEX');
    expect(mexPath).not.toBeNull();
    expect(mexPath?.getAttribute('fill')).toBe('rgba(129, 140, 248, 0.55)');
    expect(mexPath?.getAttribute('stroke')).toBe('#a5b4fc');
    expect(mexPath?.getAttribute('stroke-width')).toBe('2px');
    expect(mexPath?.getAttribute('filter')).toBe('url(#glow-indigo)');
  });

  it('should render ValueNetworkSection with cyan central node and indigo economic partners', () => {
    const activeRelations = {
      MEX: { type: 'ECONOMIC_PARTNER', weight: 0.9 },
    };

    const { container } = render(<ValueNetworkSection activeRelations={activeRelations} />);

    expect(screen.getByText('Nodo Central')).toBeInTheDocument();
    expect(screen.getByText('Aliados / Proveedores')).toBeInTheDocument();
    expect(screen.getByText('Socios Económicos')).toBeInTheDocument();
    expect(screen.getByText('Fricción Comercial')).toBeInTheDocument();
    expect(screen.getByText('En Observación')).toBeInTheDocument();

    // Check indicator classes
    const cyanNode = container.querySelector('.bg-sky-400');
    expect(cyanNode).not.toBeNull();
    expect(cyanNode?.className).toContain('ring-sky-400/50');

    const indigoNode = container.querySelector('.bg-indigo-400');
    expect(indigoNode).not.toBeNull();
    expect(indigoNode?.className).toContain('ring-indigo-400/50');
  });

  it('should gracefully handle null, undefined, or empty activeRelations in ValueNetworkSection', () => {
    const { container: containerNull } = render(<ValueNetworkSection activeRelations={null} />);
    expect(containerNull.firstChild).toBeNull();

    const { container: containerUndefined } = render(<ValueNetworkSection activeRelations={undefined} />);
    expect(containerUndefined.firstChild).toBeNull();

    const { container: containerEmpty } = render(<ValueNetworkSection activeRelations={{}} />);
    expect(containerEmpty.firstChild).toBeNull();
  });

  it('should safely handle null or undefined activeRelations in useGlobeStyling and Map2D', () => {
    const selected = {
      polyId: 'poly-ESP',
      type: 'Feature',
      properties: { ADMIN: 'Spain', ISO_A3: 'ESP' },
      geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] },
    };

    // useGlobeStyling with null activeRelations
    const { result } = renderHook(() =>
      useGlobeStyling(selected as any, null, 'relations', null as any, {})
    );
    expect(result.current.getPolygonColor(selected)).toBe('rgba(56, 189, 248, 0.75)');
    expect(result.current.getPolygonStroke(selected)).toBe('#38bdf8');

    // Map2D with undefined activeRelations
    const { container } = render(
      <Map2D
        geoData={[selected] as any}
        selectedCountry={selected as any}
        hoveredCountry={null}
        activeMode="relations"
        activeRelations={undefined as any}
        countryMockData={{}}
        onCountryHover={() => {}}
        onCountryClick={() => {}}
        onBackgroundClick={() => {}}
        isPanelOpen={false}
        containerDimensions={{ width: 800, height: 600 }}
      />
    );
    const espPath = container.querySelector('#poly-ESP');
    expect(espPath).not.toBeNull();
    expect(espPath?.getAttribute('fill')).toBe('rgba(14, 165, 233, 0.45)');
    expect(espPath?.getAttribute('stroke')).toBe('#38bdf8');
  });

  it('should apply thematic layer coloring in useGlobeStyling and Map2D when activeMode is risk and activeLayer is set', () => {
    const esp = {
      polyId: 'poly-ESP',
      type: 'Feature',
      properties: { ADMIN: 'Spain', ISO_A3: 'ESP' },
      geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]] },
    };
    const fra = {
      polyId: 'poly-FRA',
      type: 'Feature',
      properties: { ADMIN: 'France', ISO_A3: 'FRA' },
      geometry: { type: 'Polygon', coordinates: [[[2, 0], [3, 0], [3, 1], [2, 1], [2, 0]]] },
    };

    const mockLayerData = {
      'poly-ESP': {
        countryCode: 'ES',
        intensity: 95,
        label: 'Test Critical Hub',
        sublabel: 'Bottleneck node',
        colorCategory: 'critical' as const,
      },
    };

    // 1. 3D Globe Styling
    const { result } = renderHook(() =>
      useGlobeStyling(null, null, 'risk', {}, {}, 'tier-n', mockLayerData)
    );
    expect(result.current.getPolygonColor(esp)).toBe('rgba(239, 68, 68, 0.7)');
    expect(result.current.getPolygonStroke(esp)).toBe('#ef4444');
    // Non-thematic country gets dimmed styling
    expect(result.current.getPolygonColor(fra)).toBe('rgba(15, 23, 42, 0.25)');
    expect(result.current.getPolygonStroke(fra)).toBe('rgba(51, 65, 85, 0.3)');

    // 2. 2D Map Styling
    const { container } = render(
      <Map2D
        geoData={[esp, fra] as any}
        selectedCountry={null}
        hoveredCountry={null}
        activeMode="risk"
        activeRelations={{}}
        activeLayer="tier-n"
        layerData={mockLayerData}
        countryMockData={{}}
        onCountryHover={() => {}}
        onCountryClick={() => {}}
        onBackgroundClick={() => {}}
        isPanelOpen={false}
        containerDimensions={{ width: 800, height: 600 }}
      />
    );
    const espPath = container.querySelector('#poly-ESP');
    const fraPath = container.querySelector('#poly-FRA');
    expect(espPath?.getAttribute('fill')).toBe('rgba(239, 68, 68, 0.7)');
    expect(espPath?.getAttribute('stroke')).toBe('#ef4444');
    expect(fraPath?.getAttribute('fill')).toBe('rgba(15, 23, 42, 0.25)');
  });

  it('should render thematic label and sublabel inside GeopoliticalTooltip when thematicData is provided', () => {
    const hovered = {
      polyId: 'poly-ESP',
      type: 'Feature',
      properties: { ADMIN: 'Spain', ISO_A3: 'ESP' },
    };
    render(
      <GeopoliticalTooltip
        isPanelOpen={false}
        hoveredCountry={hovered as any}
        countryData={{
          name: 'Spain',
          iso: 'ESP',
          risk: 45,
          friction: '4.2/10',
          indicator: '#ffea00',
        } as any}
        tooltipPos={{ x: 100, y: 100 }}
        cursorPos={{ x: 100, y: 100 }}
        thematicData={{
          countryCode: 'ES',
          intensity: 85,
          label: 'Cuello de Botella Marítimo',
          sublabel: 'Ruta estratégica del Mediterráneo',
          colorCategory: 'high',
        }}
      />
    );

    expect(screen.getByText('Cuello de Botella Marítimo')).toBeInTheDocument();
    expect(screen.getByText('Ruta estratégica del Mediterráneo')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('should support lowercase economic_partner and smoothly switch between countries without artifacts', () => {
    const espFeature = {
      type: 'Feature',
      polyId: 'poly-ESP',
      properties: { ADMIN: 'Spain', ISO_A3: 'ESP' },
      geometry: { type: 'Polygon', coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]] },
    };
    const mexFeature = {
      type: 'Feature',
      polyId: 'poly-MEX',
      properties: { ADMIN: 'Mexico', ISO_A3: 'MEX' },
      geometry: { type: 'Polygon', coordinates: [[[20, 20], [30, 20], [30, 30], [20, 30], [20, 20]]] },
    };

    // When Spain is selected, Mexico is economic partner (lowercase 'economic_partner')
    const espRelations = {
      'poly-MEX': {
        type: 'economic_partner' as any,
        polygon: mexFeature as any,
      },
    };

    const { result: globeResult } = renderHook(() =>
      useGlobeStyling(espFeature as any, null, 'relations', espRelations as any, {})
    );
    expect(globeResult.current.getPolygonColor(mexFeature)).toBe('rgba(129, 140, 248, 0.65)');
    expect(globeResult.current.getPolygonStroke(mexFeature)).toBe('#818cf8');

    // 2D dynamic render
    const { container, rerender } = render(
      <Map2D
        geoData={[espFeature, mexFeature] as any}
        selectedCountry={espFeature as any}
        hoveredCountry={null}
        activeMode="relations"
        activeRelations={espRelations as any}
        countryMockData={{}}
        onCountryHover={() => {}}
        onCountryClick={() => {}}
        onBackgroundClick={() => {}}
        isPanelOpen={false}
        containerDimensions={{ width: 800, height: 600 }}
      />
    );

    let espPath = container.querySelector('#poly-ESP');
    let mexPath = container.querySelector('#poly-MEX');
    expect(espPath?.getAttribute('stroke')).toBe('#38bdf8'); // Cyan central
    expect(mexPath?.getAttribute('stroke')).toBe('#818cf8'); // Indigo partner

    // Transition: User clicks Mexico -> Mexico is now central node, Spain is economic partner
    const mexRelations = {
      'poly-ESP': {
        type: 'ECONOMIC_PARTNER' as any,
        polygon: espFeature as any,
      },
    };

    rerender(
      <Map2D
        geoData={[espFeature, mexFeature] as any}
        selectedCountry={mexFeature as any}
        hoveredCountry={null}
        activeMode="relations"
        activeRelations={mexRelations as any}
        countryMockData={{}}
        onCountryHover={() => {}}
        onCountryClick={() => {}}
        onBackgroundClick={() => {}}
        isPanelOpen={false}
        containerDimensions={{ width: 800, height: 600 }}
      />
    );

    espPath = container.querySelector('#poly-ESP');
    mexPath = container.querySelector('#poly-MEX');
    expect(mexPath?.getAttribute('stroke')).toBe('#38bdf8'); // Mexico is now Cyan central!
    expect(mexPath?.getAttribute('fill')).toBe('rgba(14, 165, 233, 0.45)');
    expect(espPath?.getAttribute('stroke')).toBe('#818cf8'); // Spain is now Indigo partner!
    expect(espPath?.getAttribute('fill')).toBe('rgba(129, 140, 248, 0.35)');
  });

  it('should render tactical tab buttons and navigate between Perfil Geopolítico and Ciclo Económico Dalio in GeopoliticalSidebar', () => {
    const activeData = {
      name: 'United States of America',
      iso: 'USA',
      risk: 20,
      riskLevel: 'Bajo',
      threat: 'Alianza Estratégica',
      gdp: '$26.9T',
      supply: 'Semiconductores avanzados',
      chokepoint: 'Estrecho de Malaca',
      friction: 'Baja (2.1%)',
      aiExposure: 'Alta',
      color: 'rgba(0, 230, 118, 0.18)',
      stroke: 'rgba(0, 230, 118, 0.85)',
      indicator: '#00e676',
      textClass: 'text-[#00e676]',
      baseColor: 'rgba(0, 230, 118, 0.18)',
    };

    const activeMacro = {
      gdpGrowth: '+2.5%',
      inflation: '2.8%',
      interestRate: '5.25%',
      yieldSpread10Y2Y: '0.15',
      yieldCurveStatus: 'Normal',
      dataConfidence: 'high',
      dalioDebtCycle: {
        shortTermCyclePhase: 'Late Cycle',
        longTermCyclePhase: 'Late Cycle Top',
        productivityGrowthTrend: 'Stable',
        levers: { austerity: 2, debtReduction: 3, wealthRedistribution: 4, moneyPrinting: 5 },
        deleveragingStatus: 'Orderly',
        dalioCommentary: 'Strong fiscal impulse',
        dataConfidence: 'high',
      },
    };

    render(
      <GeopoliticalSidebar
        isPanelOpen={true}
        activeData={activeData as any}
        activeMode="risk"
        activeRelations={{}}
        onClose={() => {}}
        activeMacro={activeMacro as any}
        isMacroLoading={false}
        macroError={null}
      />
    );

    const geoTab = screen.getByRole('button', { name: /Perfil Geopolítico/i });
    const dalioTab = screen.getByRole('button', { name: /Ciclo Económico Dalio/i });
    expect(geoTab).toBeInTheDocument();
    expect(dalioTab).toBeInTheDocument();

    // Default is geopolitical tab
    expect(geoTab.className).toContain('border-teal-400');
    expect(screen.getByText(/Logística Portuaria e Industria/i)).toBeInTheDocument();
    expect(screen.getByText(/Métricas Soberanas Cuantitativas/i)).toBeInTheDocument();

    // Switch to Dalio tab
    fireEvent.click(dalioTab);
    expect(dalioTab.className).toContain('border-teal-400');
    expect(screen.getByText(/Motor Macro Dalio/i)).toBeInTheDocument();
    expect(screen.queryByText(/Logística Portuaria e Industria/i)).toBeNull();

    // Switch back to Geopolitical tab
    fireEvent.click(geoTab);
    expect(geoTab.className).toContain('border-teal-400');
    expect(screen.getByText(/Logística Portuaria e Industria/i)).toBeInTheDocument();
  });

  it('should support tab navigation in relations mode without losing relations section', () => {
    const activeData = {
      name: 'Germany',
      iso: 'DEU',
      risk: 22,
      riskLevel: 'Bajo',
      threat: 'Aliado',
      gdp: '$4.4T',
      supply: 'Ingeniería y Automoción',
      chokepoint: 'Mar del Norte',
      friction: 'Baja',
      aiExposure: 'Media',
      color: 'rgba(0, 230, 118, 0.18)',
      stroke: 'rgba(0, 230, 118, 0.85)',
      indicator: '#00e676',
      textClass: 'text-[#00e676]',
      baseColor: 'rgba(0, 230, 118, 0.18)',
    };

    const activeRelations = {
      FRA: { type: 'STRATEGIC_ALLY', weight: 0.9 },
    };

    render(
      <GeopoliticalSidebar
        isPanelOpen={true}
        activeData={activeData as any}
        activeMode="relations"
        activeRelations={activeRelations as any}
        onClose={() => {}}
        activeMacro={null}
        isMacroLoading={false}
        macroError={null}
      />
    );

    // Both relations and logistics are visible in geopolitical tab
    expect(screen.getByText(/Cadena de Suministro/i)).toBeInTheDocument();
    expect(screen.getByText(/Logística Portuaria e Industria/i)).toBeInTheDocument();

    // Switch to Dalio tab
    const dalioTab = screen.getByRole('button', { name: /Ciclo Económico Dalio/i });
    fireEvent.click(dalioTab);

    // Dalio macro section rendered
    expect(screen.getByText(/Motor Macro Dalio/i)).toBeInTheDocument();
    expect(screen.queryByText(/Cadena de Suministro/i)).toBeNull();
  });

  it('should render TacticalLogisticsSection with PortWatch and IMF SDMX data, and handle interactive toggle', () => {
    const countryMechanics = {
      portCongestion: 12.4,
      industrialChangePct: 4.8,
      dataSources: {
        portCongestion: 'imf_portwatch',
        industrialProduction: 'imf_pi',
      },
    };

    render(<TacticalLogisticsSection countryMechanics={countryMechanics} iso="USA" />);

    expect(screen.getByText(/Logística Portuaria e Industria \[USA\]/i)).toBeInTheDocument();
    expect(screen.getByText('IMF PortWatch')).toBeInTheDocument();
    expect(screen.getByTestId('bottleneck-status-badge')).toHaveTextContent('FLUIDO');
    expect(screen.getByText('IMF SDMX PI')).toBeInTheDocument();
    expect(screen.getByText('EXPANSIÓN')).toBeInTheDocument();
    expect(screen.getByText('+4.8%')).toBeInTheDocument();
    expect(screen.getByText(/Ritmo fabril sostenido por encima del umbral de amortiguamiento/i)).toBeInTheDocument();

    // Test toggle switch to collapse port details
    const toggleButton = screen.getByRole('switch', { name: /Alternar detalle de Logística Portuaria/i });
    expect(toggleButton).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByText(/Logística Portuaria \(Resumen\)/i)).toBeInTheDocument();
    expect(screen.getByTestId('bottleneck-status-badge')).toHaveTextContent('FLUIDO');

    // Toggle back on
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText(/Congestión \/ Demora:/i)).toBeInTheDocument();
  });

  it('should correctly evaluate minimal port delays (< 1h) as FLUIDO without discontinuous jumps', () => {
    const countryMechanics = {
      portCongestion: 0.8,
      industrialChangePct: 0.2,
      dataSources: {
        portCongestion: 'imf_portwatch',
        industrialProduction: 'imf_pi',
      },
    };

    render(<TacticalLogisticsSection countryMechanics={countryMechanics} iso="SGP" />);

    // 0.8h delay must be FLUIDO with minimal congestion percentage
    const badge = screen.getByTestId('bottleneck-status-badge');
    expect(badge).toHaveTextContent('FLUIDO');
    expect(screen.getByText(/0\.8h demora/i)).toBeInTheDocument();
    
    // Industrial production of +0.2% is TRANSICIÓN TÉCNICA with non-contradictory description
    expect(screen.getByText('TRANSICIÓN TÉCNICA')).toBeInTheDocument();
    expect(screen.getByText(/Sector secundario en consolidación o transición técnica/i)).toBeInTheDocument();
    expect(screen.queryByText(/Contracción en volumen/i)).toBeNull();
  });

  it('should render Drewry WCI, critical bottleneck and contraction when metrics reflect severe disruption', () => {
    const countryMechanics = {
      portCongestion: 4600,
      industrialChangePct: -5.2,
      dataSources: {
        portCongestion: 'drewry',
        industrialProduction: 'wb_annual',
      },
    };

    render(<TacticalLogisticsSection countryMechanics={countryMechanics} iso="CHN" />);

    expect(screen.getByText('Drewry WCI')).toBeInTheDocument();
    expect(screen.getByTestId('bottleneck-status-badge')).toHaveTextContent('CUELLO DE BOTELLA CRÍTICO');
    expect(screen.getByText('World Bank Annual')).toBeInTheDocument();
    expect(screen.getByText('CONTRACCIÓN')).toBeInTheDocument();
    expect(screen.getByText('-5.2%')).toBeInTheDocument();
    expect(screen.getByText(/Contracción en volumen de manufactura y bienes de equipo/i)).toBeInTheDocument();
  });

  it('should handle fallback data gracefully when countryMechanics is null or uses World Bank LPI', () => {
    const { rerender } = render(<TacticalLogisticsSection countryMechanics={null} iso="ZWE" />);

    expect(screen.getByText(/Logística Portuaria e Industria \[ZWE\]/i)).toBeInTheDocument();
    expect(screen.getByText('World Bank LPI')).toBeInTheDocument();
    expect(screen.getByText('World Bank Annual')).toBeInTheDocument();
    expect(screen.getByText('TRANSICIÓN TÉCNICA')).toBeInTheDocument();

    // Rerender with WB LPI score
    rerender(
      <TacticalLogisticsSection
        countryMechanics={{
          infrastructureQuality: 2.2,
          isInTransition: true,
          dataSources: {
            portCongestion: 'wb_lpi',
            industrialProduction: 'wb_annual',
          },
        }}
        iso="IND"
      />
    );

    expect(screen.getByText('World Bank LPI')).toBeInTheDocument();
    expect(screen.getByTestId('bottleneck-status-badge')).toHaveTextContent('FRICCIÓN MODERADA');
    expect(screen.getByText('TRANSICIÓN TÉCNICA')).toBeInTheDocument();
  });

  it('should navigate to DalioMacroSection from news mode when clicking the Dalio tab', () => {
    const activeData = {
      name: 'Japan',
      iso: 'JPN',
      risk: 18,
      indicator: '#00e676',
    };

    const activeMacro = {
      gdpGrowth: '+1.1%',
      inflation: '2.5%',
      interestRate: '0.25%',
      yieldSpread10Y2Y: '0.60',
      yieldCurveStatus: 'Normal',
      dataConfidence: 'high',
      dalioDebtCycle: {
        shortTermCyclePhase: 'Mid Cycle',
        longTermCyclePhase: 'Deleveraging',
        productivityGrowthTrend: 'Moderate',
        levers: { austerity: 1, debtReduction: 2, wealthRedistribution: 2, moneyPrinting: 5 },
        deleveragingStatus: 'Orderly',
        dalioCommentary: 'Monetary easing backdrop',
      },
    };

    render(
      <GeopoliticalSidebar
        isPanelOpen={true}
        activeData={activeData as any}
        activeMode="news"
        activeRelations={{}}
        onClose={() => {}}
        activeMacro={activeMacro as any}
        isMacroLoading={false}
        macroError={null}
      />
    );

    // In news mode with default geopolitical tab, NewsPanel is rendered
    expect(screen.getByText(/Noticias Geopolíticas Recientes/i)).toBeInTheDocument();

    // Switch to Dalio tab
    const dalioTab = screen.getByRole('button', { name: /Ciclo Económico Dalio/i });
    fireEvent.click(dalioTab);

    // Dalio macro section rendered even though activeMode is news
    expect(screen.getByText(/Motor Macro Dalio/i)).toBeInTheDocument();
    expect(screen.queryByText(/Noticias Geopolíticas Recientes/i)).toBeNull();
  });
});

