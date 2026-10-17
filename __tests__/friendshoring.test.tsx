/**
 * @file friendshoring.test.tsx
 * @description Comprehensive unit and integration test suite for T03.4:
 * - Algoritmo de Friendshoring y arcos de sustitución de materias primas críticas.
 * - Validación de las 9 commodities críticas (Tierras Raras, Litio, Cobalto, Níquel, Cobre, Galio/Germanio, Grafito, Semiconductores, Petróleo/Gas).
 * - Filtro estricto de fricción bilateral < 4.0 para aliados seguros.
 * - Cálculo de distancias Haversine y bonificación por tratados comerciales/defensa.
 * - Visualización de arcos en Map2D (.arcs-layer) y sección interactiva del Sidebar (FriendshoringSection).
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, renderHook } from '@testing-library/react';
import {
  FriendshoringService,
  CriticalCommodityKey,
  calculateHaversineDistance,
  getCountryCentroid,
  COUNTRY_CENTROIDS,
} from '@/lib/services/geographic/friendshoring-service';
import { Map2D } from '@/components/dev/geopolitical-monitor/components/Map2D';
import { FriendshoringSection } from '@/components/dev/geopolitical-monitor/components/sidebar/FriendshoringSection';
import { useGlobeStyling } from '@/components/dev/geopolitical-monitor/hooks/useGlobeStyling';

describe('T03.4: Friendshoring Engine & Critical Commodities Substitution', () => {
  // ─── 1. Registry & Commodities Modeling Tests ──────────────────────────────
  describe('Critical Commodities Registry (9 Required Commodities)', () => {
    const requiredKeys: CriticalCommodityKey[] = [
      'rare-earths',
      'lithium',
      'cobalt',
      'nickel',
      'copper',
      'gallium-germanium',
      'graphite',
      'semiconductors',
      'oil-gas',
    ];

    it('should model exactly all 9 critical commodities required by the specification', () => {
      const all = FriendshoringService.getAllCommodities();
      expect(all).toHaveLength(9);
      const keys = all.map((c) => c.id);
      for (const k of requiredKeys) {
        expect(keys).toContain(k);
      }
    });

    it('should retrieve individual commodities by ID with complete metadata', () => {
      for (const k of requiredKeys) {
        const comm = FriendshoringService.getCommodityById(k);
        expect(comm).toBeDefined();
        expect(comm?.id).toBe(k);
        expect(comm?.name.length).toBeGreaterThan(3);
        expect(comm?.description.length).toBeGreaterThan(10);
        expect(comm?.vulnerableOrigins.length).toBeGreaterThan(0);
        expect(comm?.viableSubstitutes.length).toBeGreaterThan(0);
        expect(['Metals', 'Minerals', 'Energy', 'Technology']).toContain(comm?.category);
      }
    });

    it('should return undefined for non-existent commodity IDs', () => {
      const nonExistent = FriendshoringService.getCommodityById('uranium-fake' as any);
      expect(nonExistent).toBeUndefined();
    });
  });

  // ─── 2. Geographic Calculations & Centroids Tests ─────────────────────────
  describe('Geographic Centroids & Haversine Distance Formula', () => {
    it('should resolve centroids with valid coordinates for all key geopolitical nations', () => {
      const sampleCodes = ['US', 'CA', 'CN', 'AU', 'CL', 'CD', 'ID', 'TW', 'RU', 'NO', 'JP', 'DE', 'NL', 'KR'];
      for (const code of sampleCodes) {
        const coords = getCountryCentroid(code);
        expect(coords).toBeDefined();
        expect(typeof coords.lat).toBe('number');
        expect(typeof coords.lng).toBe('number');
        expect(coords.lat).toBeGreaterThanOrEqual(-90);
        expect(coords.lat).toBeLessThanOrEqual(90);
        expect(coords.lng).toBeGreaterThanOrEqual(-180);
        expect(coords.lng).toBeLessThanOrEqual(180);
      }
    });

    it('should return 0 km distance between identical coordinates', () => {
      const pt = { lat: 37.0902, lng: -95.7129 };
      expect(calculateHaversineDistance(pt, pt)).toBe(0);
    });

    it('should compute accurate Haversine distance between US and Canada', () => {
      const us = COUNTRY_CENTROIDS.US;
      const ca = COUNTRY_CENTROIDS.CA;
      const dist = calculateHaversineDistance(us, ca);
      // Expected distance between US and CA geographic centroids is ~2,200 - 2,400 km
      expect(dist).toBeGreaterThan(1800);
      expect(dist).toBeLessThan(2600);
    });

    it('should compute large trans-oceanic distance between Australia and US', () => {
      const au = COUNTRY_CENTROIDS.AU;
      const us = COUNTRY_CENTROIDS.US;
      const dist = calculateHaversineDistance(au, us);
      expect(dist).toBeGreaterThan(13000);
      expect(dist).toBeLessThan(17000);
    });

    it('should fallback gracefully for unknown country codes', () => {
      const fallback = getCountryCentroid('UNKNOWN_XYZ');
      expect(fallback).toEqual({ lat: 20, lng: 0 });
    });
  });

  // ─── 3. Algorithmic Feasibility & Strict Friction Filter (< 4.0) ───────────
  describe('Friendshoring Feasibility Index & Bilateral Friction Filter', () => {
    it('should strictly disqualify candidates with friction >= 4.0 by returning score 0', () => {
      // High friction adversarial state (e.g. friction 4.0, 7.5, 9.5)
      expect(
        FriendshoringService.computeFeasibilityScore({
          frictionScore: 4.0,
          productionCapacityScore: 95,
          distanceKm: 500,
          allianceCount: 3,
        })
      ).toBe(0);

      expect(
        FriendshoringService.computeFeasibilityScore({
          frictionScore: 7.8,
          productionCapacityScore: 100,
          distanceKm: 200,
          allianceCount: 2,
        })
      ).toBe(0);
    });

    it('should produce a high feasibility score (> 80) for ideal allies (friction 1.0, high capacity)', () => {
      const score = FriendshoringService.computeFeasibilityScore({
        frictionScore: 1.0,
        productionCapacityScore: 92,
        distanceKm: 2500,
        allianceCount: 3,
      });
      expect(score).toBeGreaterThanOrEqual(80);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should penalize long geographic distances (Nearshoring factor)', () => {
      const nearScore = FriendshoringService.computeFeasibilityScore({
        frictionScore: 1.0,
        productionCapacityScore: 85,
        distanceKm: 1200, // Nearshoring
        allianceCount: 2,
      });

      const farScore = FriendshoringService.computeFeasibilityScore({
        frictionScore: 1.0,
        productionCapacityScore: 85,
        distanceKm: 15000, // Distant
        allianceCount: 2,
      });

      expect(nearScore).toBeGreaterThan(farScore);
    });

    it('should award a bonus for shared defense/trade alliances', () => {
      const withAlliances = FriendshoringService.computeFeasibilityScore({
        frictionScore: 1.2,
        productionCapacityScore: 80,
        distanceKm: 5000,
        allianceCount: 4, // NATO, G7, USMCA, FiveEyes
      });

      const withoutAlliances = FriendshoringService.computeFeasibilityScore({
        frictionScore: 1.2,
        productionCapacityScore: 80,
        distanceKm: 5000,
        allianceCount: 0,
      });

      expect(withAlliances).toBeGreaterThan(withoutAlliances);
    });
  });

  // ─── 4. Structured Substitution Arcs Generation ────────────────────────────
  describe('Substitution Arcs Generation (`getSubstitutionArcs`)', () => {
    it('should generate arcs conforming strictly to the required schema', () => {
      const arcs = FriendshoringService.getSubstitutionArcs('rare-earths', 'US');
      expect(arcs.length).toBeGreaterThan(0);

      for (const arc of arcs) {
        expect(arc).toHaveProperty('id');
        expect(arc).toHaveProperty('originCountry');
        expect(arc).toHaveProperty('substituteCountry');
        expect(arc).toHaveProperty('commodity', 'rare-earths');
        expect(arc).toHaveProperty('feasibilityScore');
        expect(arc).toHaveProperty('frictionScore');
        expect(arc).toHaveProperty('distanceKm');
        expect(arc).toHaveProperty('sourceCoords');
        expect(arc).toHaveProperty('targetCoords');
        expect(arc).toHaveProperty('allianceMatch');

        // All arcs must adhere to strict safe ally threshold < 4.0
        expect(arc.frictionScore).toBeLessThan(4.0);
        expect(arc.feasibilityScore).toBeGreaterThan(0);
        expect(arc.feasibilityScore).toBeLessThanOrEqual(100);
        expect(arc.distanceKm).toBeGreaterThan(0);
        expect(arc.sourceCoords.lat).toBeDefined();
        expect(arc.targetCoords.lat).toBeDefined();
      }
    });

    it('should sort arcs by feasibility score descending', () => {
      const arcs = FriendshoringService.getSubstitutionArcs('lithium', 'US');
      expect(arcs.length).toBeGreaterThan(1);
      for (let i = 0; i < arcs.length - 1; i++) {
        expect(arcs[i].feasibilityScore).toBeGreaterThanOrEqual(arcs[i + 1].feasibilityScore);
      }
    });

    it('should substitute China (CN) with safe allies for Rare Earths', () => {
      const arcs = FriendshoringService.getSubstitutionArcs('rare-earths', 'US');
      const originCodes = new Set(arcs.map((a) => a.originCountry));
      expect(originCodes.has('CN')).toBe(true);

      const subCodes = arcs.map((a) => a.substituteCountry);
      expect(subCodes).toContain('AU'); // Lynas Mt Weld
      expect(subCodes).toContain('CA'); // Vital Metals / Nechalacho
      expect(subCodes).toContain('US'); // Mountain Pass MP Materials
    });

    it('should substitute Taiwan (TW) foundry with US/JP/DE/KR for Advanced Semiconductors', () => {
      const arcs = FriendshoringService.getSubstitutionArcs('semiconductors', 'US');
      const originCodes = new Set(arcs.map((a) => a.originCountry));
      expect(originCodes.has('TW')).toBe(true);

      const subCodes = arcs.map((a) => a.substituteCountry);
      expect(subCodes).toContain('US'); // TSMC Phoenix / Intel Ohio
      expect(subCodes).toContain('JP'); // JASM Kumamoto
      expect(subCodes).toContain('DE'); // ESMC Dresden
      expect(subCodes).toContain('KR'); // Samsung / SK Hynix
    });

    it('should substitute DR Congo (CD) with AU/CA/NO/PH for Cobalt', () => {
      const arcs = FriendshoringService.getSubstitutionArcs('cobalt', 'US');
      const originCodes = new Set(arcs.map((a) => a.originCountry));
      expect(originCodes.has('CD')).toBe(true);

      const subCodes = arcs.map((a) => a.substituteCountry);
      expect(subCodes).toContain('AU');
      expect(subCodes).toContain('CA');
      expect(subCodes).toContain('NO');
    });

    it('should filter arcs for specific vulnerable origin with getFriendshoringAlternativesForOrigin', () => {
      const cnArcs = FriendshoringService.getFriendshoringAlternativesForOrigin('CN', 'gallium-germanium', 'US');
      expect(cnArcs.length).toBeGreaterThan(0);
      for (const a of cnArcs) {
        expect(a.originCountry).toBe('CN');
        expect(a.frictionScore).toBeLessThan(4.0);
      }
    });

    it('should return an empty array for an invalid origin country with getFriendshoringAlternativesForOrigin', () => {
      const empty = FriendshoringService.getFriendshoringAlternativesForOrigin('NON_EXISTENT_ISO');
      expect(empty).toEqual([]);
    });

    it('should produce a tactical executive summary with getFriendshoringSummary', () => {
      const summary = FriendshoringService.getFriendshoringSummary('copper', 'US');
      expect(summary.commodity).toBeDefined();
      expect(summary.totalArcs).toBeGreaterThan(0);
      expect(summary.averageFeasibility).toBeGreaterThan(0);
      expect(summary.topAlternative).toBeDefined();
      expect(summary.arcs).toHaveLength(summary.totalArcs);
    });
  });

  // ─── 5. Globe.GL 3D useGlobeStyling Integration ───────────────────────────
  describe('useGlobeStyling 3D Arcs Integration (arcsData)', () => {
    it('should populate arcsData when activeLayer is "resources"', () => {
      const { result } = renderHook(() =>
        useGlobeStyling(null, null, 'risk' as any, {}, {}, 'resources', {}, 'rare-earths')
      );

      expect(result.current.arcsData.length).toBeGreaterThan(0);
      const firstArc = result.current.arcsData[0];
      expect(firstArc).toHaveProperty('startLat');
      expect(firstArc).toHaveProperty('startLng');
      expect(firstArc).toHaveProperty('endLat');
      expect(firstArc).toHaveProperty('endLng');
      expect(firstArc).toHaveProperty('color');
      expect(firstArc).toHaveProperty('stroke');
      expect(firstArc).toHaveProperty('arcData');
    });

    it('should return empty arcsData when activeLayer is not "resources"', () => {
      const { result } = renderHook(() =>
        useGlobeStyling(null, null, 'risk' as any, {}, {}, 'none', {}, null)
      );

      expect(result.current.arcsData).toHaveLength(0);
    });
  });

  // ─── 6. Map2D 2D SVG Canvas Arcs & Tooltip Rendering ──────────────────────
  describe('Map2D SVG Arcs & Hover Tooltip Rendering', () => {
    const mockGeoData = [
      {
        type: 'Feature',
        polyId: 'poly-cn',
        properties: { ADMIN: 'China', ISO_A3: 'CHN' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[100, 30], [110, 30], [110, 40], [100, 40], [100, 30]]],
        },
      },
      {
        type: 'Feature',
        polyId: 'poly-au',
        properties: { ADMIN: 'Australia', ISO_A3: 'AUS' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[130, -30], [140, -30], [140, -20], [130, -20], [130, -30]]],
        },
      },
    ];

    it('should render .substitution-arc-2d elements in .arcs-layer when activeLayer is "resources"', () => {
      const sampleArcs = FriendshoringService.getSubstitutionArcs('rare-earths', 'US').slice(0, 3);

      const { container } = render(
        <Map2D
          geoData={mockGeoData as any}
          selectedCountry={null}
          hoveredCountry={null}
          activeMode="risk"
          activeRelations={{}}
          countryMockData={{}}
          activeLayer="resources"
          substitutionArcs={sampleArcs}
          onCountryHover={() => {}}
          onCountryClick={() => {}}
          onBackgroundClick={() => {}}
          isPanelOpen={false}
          containerDimensions={{ width: 800, height: 600 }}
        />
      );

      const arcs = container.querySelectorAll('.substitution-arc-2d');
      expect(arcs.length).toBeGreaterThan(0);
      expect(arcs[0].getAttribute('stroke')).toBe('url(#arc-gradient-emerald-cyan)');
      expect(arcs[0].getAttribute('marker-end')).toBe('url(#arrow-friendshoring)');
    });

    it('should trigger hover events and display the floating tactical tooltip on arc hover', () => {
      const onArcHover = vi.fn();
      const sampleArcs = FriendshoringService.getSubstitutionArcs('rare-earths', 'US').slice(0, 1);

      const { container } = render(
        <Map2D
          geoData={mockGeoData as any}
          selectedCountry={null}
          hoveredCountry={null}
          activeMode="risk"
          activeRelations={{}}
          countryMockData={{}}
          activeLayer="resources"
          substitutionArcs={sampleArcs}
          onArcHover={onArcHover}
          onCountryHover={() => {}}
          onCountryClick={() => {}}
          onBackgroundClick={() => {}}
          isPanelOpen={false}
          containerDimensions={{ width: 800, height: 600 }}
        />
      );

      const arcGroup = container.querySelector('.substitution-arc-group');
      expect(arcGroup).not.toBeNull();

      if (arcGroup) {
        fireEvent.mouseEnter(arcGroup, { clientX: 200, clientY: 150 });
        expect(onArcHover).toHaveBeenCalledWith(sampleArcs[0], expect.anything());

        // Floating tooltip should be displayed in DOM
        expect(screen.getByText(/VIABILIDAD/i)).toBeInTheDocument();
        expect(screen.getByText(/Fricción Bilateral:/i)).toBeInTheDocument();
        expect(screen.getByText(/Distancia Haversine:/i)).toBeInTheDocument();

        fireEvent.mouseLeave(arcGroup);
        expect(onArcHover).toHaveBeenCalledWith(null);
      }
    });

    it('should not render substitution arcs when activeLayer is "none" and no arcs provided', () => {
      const { container } = render(
        <Map2D
          geoData={mockGeoData as any}
          selectedCountry={null}
          hoveredCountry={null}
          activeMode="risk"
          activeRelations={{}}
          countryMockData={{}}
          activeLayer="none"
          substitutionArcs={[]}
          onCountryHover={() => {}}
          onCountryClick={() => {}}
          onBackgroundClick={() => {}}
          isPanelOpen={false}
          containerDimensions={{ width: 800, height: 600 }}
        />
      );

      const arcs = container.querySelectorAll('.substitution-arc-2d');
      expect(arcs).toHaveLength(0);
    });
  });

  // ─── 7. FriendshoringSection Sidebar UI Tests ──────────────────────────────
  describe('FriendshoringSection Sidebar Component', () => {
    it('should render header and HUD metadata', () => {
      render(<FriendshoringSection countryCode="US" countryName="Estados Unidos" />);
      expect(screen.getByText('FRIENDSHORING DE MATERIAS PRIMAS')).toBeInTheDocument();
      expect(screen.getAllByText(/Fricción < 4.0/i).length).toBeGreaterThan(0);
      expect(screen.getByText('RADAR ACTIVO')).toBeInTheDocument();
    });

    it('should render all 9 commodity buttons in the selector', () => {
      render(<FriendshoringSection countryCode="US" countryName="Estados Unidos" />);
      expect(screen.getByText('Tierras Raras')).toBeInTheDocument();
      expect(screen.getByText('Litio')).toBeInTheDocument();
      expect(screen.getByText('Cobalto')).toBeInTheDocument();
      expect(screen.getByText('Níquel')).toBeInTheDocument();
      expect(screen.getByText('Cobre')).toBeInTheDocument();
      expect(screen.getByText('Galio & Germanio')).toBeInTheDocument();
      expect(screen.getByText('Grafito')).toBeInTheDocument();
      expect(screen.getByText('Semiconductores Avanzados')).toBeInTheDocument();
      expect(screen.getByText('Petróleo & GNL')).toBeInTheDocument();
    });

    it('should switch commodity and update alternatives when clicking button', () => {
      const onSelectCommodity = vi.fn();
      render(
        <FriendshoringSection
          countryCode="US"
          countryName="Estados Unidos"
          onSelectCommodity={onSelectCommodity}
        />
      );

      const lithiumBtn = screen.getByText('Litio');
      fireEvent.click(lithiumBtn);

      expect(onSelectCommodity).toHaveBeenCalledWith('lithium');
      // Should show lithium details and substitutes
      expect(screen.getByText(/Atacama/i)).toBeInTheDocument();
    });

    it('should render viable substitutes with friction < 4.0 and feasibility badges', () => {
      render(<FriendshoringSection countryCode="US" countryName="Estados Unidos" />);

      const feasibilityBadges = screen.getAllByText(/% VIABILIDAD/i);
      expect(feasibilityBadges.length).toBeGreaterThan(0);

      const frictionLabels = screen.getAllByText(/Fricción: \d\.\d\/10/i);
      expect(frictionLabels.length).toBeGreaterThan(0);
    });

    it('should call onSelectSubstitute when clicking a substitute card', () => {
      const onSelectSubstitute = vi.fn();
      render(
        <FriendshoringSection
          countryCode="US"
          countryName="Estados Unidos"
          onSelectSubstitute={onSelectSubstitute}
        />
      );

      const firstCard = screen.getByText('Australia').closest('div[class*="cursor-pointer"]');
      expect(firstCard).not.toBeNull();
      if (firstCard) {
        fireEvent.click(firstCard);
        expect(onSelectSubstitute).toHaveBeenCalledWith('AU');
      }
    });
  });
});
