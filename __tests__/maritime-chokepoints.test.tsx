/**
 * @file maritime-chokepoints.test.ts
 * @description Comprehensive unit & integration test suite for T03.5:
 * - Deterministic Maritime Chokepoint & Route Simulation Engine (0 LLM tokens).
 * - Calibrated 4-sector quantitative matrix (Semiconductors, Automotive, Retail, Energy).
 * - Geographic rerouting and bypass synergies (Cape of Good Hope, Sunda, Cape Horn).
 * - HoI4 Tactical Navbar component & Chokepoint Simulation Drawer component.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

import {
  MaritimeChokepointService,
  STRATEGIC_CHOKEPOINTS,
  CHOKEPOINT_LIST,
  SECTOR_PROFILES,
  GLOBAL_MARITIME_ROUTES,
  CHOKEPOINT_PRESETS,
  MaritimeChokepointId,
  MaritimeIndustrySector,
} from '@/lib/services/maritime-chokepoint-service';

import { Hoi4TacticalNavbar } from '@/components/dev/geopolitical-monitor/components/Hoi4TacticalNavbar';
import { ChokepointSimulationDrawer } from '@/components/dev/geopolitical-monitor/components/ChokepointSimulationDrawer';
import { Map2D } from '@/components/dev/geopolitical-monitor/components/Map2D';

describe('T03.5: Maritime Chokepoints Simulation & COGS Impact Engine', () => {
  afterEach(() => {
    cleanup();
  });

  // ─── 1. Definición de Chokepoints y Catálogo Estratégico ─────────────────────

  describe('1. Catálogo de Chokepoints y Rutas Marítimas', () => {
    it('debe contener exactamente los 6 estrechos y canales estratégicos acordados', () => {
      const chokepoints = MaritimeChokepointService.getAllChokepoints();
      expect(chokepoints).toHaveLength(6);

      const ids = chokepoints.map((c) => c.id);
      expect(ids).toContain('hormuz');
      expect(ids).toContain('malacca');
      expect(ids).toContain('suez');
      expect(ids).toContain('bab_el_mandeb');
      expect(ids).toContain('panama');
      expect(ids).toContain('bosporus');
    });

    it('debe tener las coordenadas geográficas exactas para los 6 estrechos', () => {
      expect(STRATEGIC_CHOKEPOINTS.hormuz.coordinates).toEqual({ lat: 26.56, lng: 56.25 });
      expect(STRATEGIC_CHOKEPOINTS.malacca.coordinates).toEqual({ lat: 1.43, lng: 102.89 });
      expect(STRATEGIC_CHOKEPOINTS.suez.coordinates).toEqual({ lat: 30.70, lng: 32.34 });
      expect(STRATEGIC_CHOKEPOINTS.bab_el_mandeb.coordinates).toEqual({ lat: 12.58, lng: 43.33 });
      expect(STRATEGIC_CHOKEPOINTS.panama.coordinates).toEqual({ lat: 9.08, lng: -79.68 });
      expect(STRATEGIC_CHOKEPOINTS.bosporus.coordinates).toEqual({ lat: 41.11, lng: 29.07 });
    });

    it('debe asociar los países ribereños clave a cada estrecho', () => {
      expect(STRATEGIC_CHOKEPOINTS.hormuz.riparianCountries).toEqual(
        expect.arrayContaining(['IR', 'OM', 'AE'])
      );
      expect(STRATEGIC_CHOKEPOINTS.malacca.riparianCountries).toEqual(
        expect.arrayContaining(['SG', 'MY', 'ID'])
      );
      expect(STRATEGIC_CHOKEPOINTS.suez.riparianCountries).toContain('EG');
      expect(STRATEGIC_CHOKEPOINTS.bab_el_mandeb.riparianCountries).toEqual(
        expect.arrayContaining(['YE', 'DJ'])
      );
      expect(STRATEGIC_CHOKEPOINTS.panama.riparianCountries).toContain('PA');
      expect(STRATEGIC_CHOKEPOINTS.bosporus.riparianCountries).toContain('TR');
    });

    it('debe proveer rutas de comercio marítimo global con waypoints GeoJSON válidos', () => {
      const routes = MaritimeChokepointService.getAllRoutes();
      expect(routes.length).toBeGreaterThanOrEqual(6);

      for (const route of routes) {
        expect(route.waypoints.length).toBeGreaterThanOrEqual(2);
        for (const [lng, lat] of route.waypoints) {
          expect(lng).toBeGreaterThanOrEqual(-180);
          expect(lng).toBeLessThanOrEqual(180);
          expect(lat).toBeGreaterThanOrEqual(-90);
          expect(lat).toBeLessThanOrEqual(90);
        }
      }

      // Verificar rutas troncales y de desvío
      const routeIds = routes.map((r) => r.id);
      expect(routeIds).toContain('route-asia-europe-suez');
      expect(routeIds).toContain('route-persian-gulf-energy');
      expect(routeIds).toContain('route-panama-interoceanic');
      expect(routeIds).toContain('route-reroute-cape-good-hope');
      expect(routeIds).toContain('route-reroute-cape-horn');
    });

    it('debe calibrar los 4 sectores industriales según la especificación de margen y flete', () => {
      // 1. SEMICONDUCTORS_AI
      const semi = MaritimeChokepointService.getSectorProfile('SEMICONDUCTORS_AI');
      expect(semi.grossMarginPct).toBe(52.0);
      expect(semi.freightShareInCogsPct).toBe(4.0);
      expect(semi.typicalDioDays).toBe(95);

      // 2. AUTOMOTIVE_PARTS
      const auto = MaritimeChokepointService.getSectorProfile('AUTOMOTIVE_PARTS');
      expect(auto.grossMarginPct).toBe(22.0);
      expect(auto.freightShareInCogsPct).toBe(9.0);
      expect(auto.typicalDioDays).toBe(38);
      expect(auto.jitSensitivity).toBe('CRITICAL');

      // 3. RETAIL_CONSUMER_GOODS
      const retail = MaritimeChokepointService.getSectorProfile('RETAIL_CONSUMER_GOODS');
      expect(retail.grossMarginPct).toBe(34.0);
      expect(retail.freightShareInCogsPct).toBe(12.0);

      // 4. ENERGY_PETROCHEMICALS
      const energy = MaritimeChokepointService.getSectorProfile('ENERGY_PETROCHEMICALS');
      expect(energy.grossMarginPct).toBe(20.0);
      expect(energy.freightShareInCogsPct).toBe(15.0);
      expect(energy.chokepointExposureWeights.hormuz).toBe(1.0);
    });
  });

  // ─── 2. Motor Determinista de Simulación (Opción A) ──────────────────────────

  describe('2. Motor Cuantitativo Determinista de COGS y Retrasos', () => {
    it('debe devolver valores baseline neutrales cuando no hay estrechos bloqueados', () => {
      const result = MaritimeChokepointService.simulateChokepointBlockades({
        blockedChokepoints: [],
        sector: 'AUTOMOTIVE_PARTS',
      });

      expect(result.blockedCount).toBe(0);
      expect(result.transitDelayDays).toBe(0);
      expect(result.freightRateSurgePct).toBe(0);
      expect(result.cogsImpactPct).toBe(0);
      expect(result.grossMarginBefore).toBe(22.0);
      expect(result.grossMarginAfter).toBe(22.0);
      expect(result.grossMarginCompressionBps).toBe(0);
      expect(result.jitStarvationRisk).toBe('LOW');
      expect(result.isJitStarved).toBe(false);
      expect(result.reroutingAlternatives).toHaveLength(0);
    });

    it('debe calcular el desvío por Suez (+14 días por Buena Esperanza) y la compresión de margen', () => {
      const result = MaritimeChokepointService.simulateChokepointBlockades({
        blockedChokepoints: ['suez'],
        sector: 'RETAIL_CONSUMER_GOODS',
      });

      expect(result.blockedCount).toBe(1);
      expect(result.transitDelayDays).toBe(14);
      expect(result.freightRateSurgePct).toBeGreaterThan(0);
      expect(result.cogsImpactPct).toBeGreaterThan(0);

      // Margen bruto debe comprimirse (antes 34.0%)
      expect(result.grossMarginAfter).toBeLessThan(34.0);
      expect(result.grossMarginCompressionBps).toBeGreaterThan(0);

      // Debe sugerir la circunnavegación del Cabo de Buena Esperanza
      expect(result.reroutingAlternatives).toHaveLength(1);
      expect(result.reroutingAlternatives[0].alternativeName).toContain('Cabo de Buena Esperanza');
      expect(result.reroutingAlternatives[0].extraDistanceNm).toBe(3600);
    });

    it('debe modelar la sinergia geográfica entre Suez y Bab el-Mandeb (no duplica desvíos)', () => {
      // Bloquear solo Suez
      const delaySuez = MaritimeChokepointService.calculateTransitDelay(['suez']);
      expect(delaySuez).toBe(14);

      // Bloquear solo Bab el-Mandeb
      const delayBab = MaritimeChokepointService.calculateTransitDelay(['bab_el_mandeb']);
      expect(delayBab).toBe(12);

      // Bloquear ambos: no debe ser 14 + 12 = 26, sino max + congestión bunkering (+3) = 17 días
      const delayBoth = MaritimeChokepointService.calculateTransitDelay(['suez', 'bab_el_mandeb']);
      expect(delayBoth).toBe(17);

      // En la lista de rutas alternativas solo debe reportar 1 vez el Cabo de Buena Esperanza
      const alternatives = MaritimeChokepointService.getReroutingAlternatives(['suez', 'bab_el_mandeb']);
      expect(alternatives).toHaveLength(1);
      expect(alternatives[0].alternativeName).toContain('Cabo de Buena Esperanza');
    });

    it('debe activar JIT Starvation CRITICAL en el sector Automotriz ante retrasos severos', () => {
      // Automotriz tiene DIO de 38 días. Si bloqueamos Suez, Panamá y Malaca:
      const result = MaritimeChokepointService.simulateChokepointBlockades({
        blockedChokepoints: ['suez', 'panama', 'malacca'],
        sector: 'AUTOMOTIVE_PARTS',
      });

      expect(result.transitDelayDays).toBeGreaterThan(20);
      expect(result.jitStarvationRisk).toMatch(/HIGH|CRITICAL/);
      expect(result.isJitStarved).toBe(true);
      expect(result.jitOutputMultiplier).toBeLessThan(1.0);
      expect(result.tacticalRecommendation).toContain('ALERTA');
    });

    it('debe reflejar la extrema vulnerabilidad del sector Energía ante el bloqueo de Ormuz', () => {
      const resultEnergy = MaritimeChokepointService.simulateChokepointBlockades({
        blockedChokepoints: ['hormuz'],
        sector: 'ENERGY_PETROCHEMICALS',
      });

      const resultSemi = MaritimeChokepointService.simulateChokepointBlockades({
        blockedChokepoints: ['hormuz'],
        sector: 'SEMICONDUCTORS_AI',
      });

      // El impacto en fletes y COGS debe ser sustancialmente mayor en Energía que en Semiconductores
      expect(resultEnergy.freightRateSurgePct).toBeGreaterThan(resultSemi.freightRateSurgePct);
      expect(resultEnergy.cogsImpactPct).toBeGreaterThan(resultSemi.cogsImpactPct);
      expect(resultEnergy.grossMarginCompressionBps).toBeGreaterThan(resultSemi.grossMarginCompressionBps);
    });

    it('debe escalar proporcionalmente con el multiplicador de sensibilidad', () => {
      const normalResult = MaritimeChokepointService.simulateChokepointBlockades({
        blockedChokepoints: ['suez'],
        sector: 'RETAIL_CONSUMER_GOODS',
        sensitivityMultiplier: 1.0,
      });

      const stressedResult = MaritimeChokepointService.simulateChokepointBlockades({
        blockedChokepoints: ['suez'],
        sector: 'RETAIL_CONSUMER_GOODS',
        sensitivityMultiplier: 2.0,
      });

      expect(stressedResult.freightRateSurgePct).toBeGreaterThan(normalResult.freightRateSurgePct);
      expect(stressedResult.cogsImpactPct).toBeGreaterThan(normalResult.cogsImpactPct);
      expect(stressedResult.grossMarginCompressionBps).toBeGreaterThan(normalResult.grossMarginCompressionBps);
    });

    it('debe manejar el colapso total (6/6 estrechos bloqueados) de forma matemáticamente consistente', () => {
      const allBlocked: MaritimeChokepointId[] = [
        'hormuz',
        'malacca',
        'suez',
        'bab_el_mandeb',
        'panama',
        'bosporus',
      ];

      const result = MaritimeChokepointService.simulateChokepointBlockades({
        blockedChokepoints: allBlocked,
        sector: 'AUTOMOTIVE_PARTS',
      });

      expect(result.blockedCount).toBe(6);
      expect(result.transitDelayDays).toBeGreaterThan(30);
      expect(result.freightRateSurgePct).toBeGreaterThan(200);
      expect(result.jitStarvationRisk).toBe('CRITICAL');
      expect(result.isJitStarved).toBe(true);
      expect(result.grossMarginAfter).toBeLessThan(result.grossMarginBefore);
    });

    it('debe resistir chokepoints inválidos, nulos o no reconocidos sin lanzar excepciones', () => {
      // Chokepoint inválido en calculateFreightSurge
      expect(() => {
        MaritimeChokepointService.calculateFreightSurge(['non_existent_cp' as any]);
      }).not.toThrow();
      expect(MaritimeChokepointService.calculateFreightSurge(['non_existent_cp' as any])).toBe(0);

      // Chokepoint inválido en calculateTransitDelay
      expect(() => {
        MaritimeChokepointService.calculateTransitDelay(['non_existent_cp' as any]);
      }).not.toThrow();
      expect(MaritimeChokepointService.calculateTransitDelay(['non_existent_cp' as any])).toBe(0);

      // Entrada mixta válida e inválida
      const delay = MaritimeChokepointService.calculateTransitDelay(['suez', 'unknown' as any]);
      expect(delay).toBe(14);

      const surge = MaritimeChokepointService.calculateFreightSurge(['suez', 'unknown' as any], 'AUTOMOTIVE_PARTS');
      expect(surge).toBeGreaterThan(0);
    });

    it('debe modelar compresión de margen bruto a valores negativos en escenarios extremos sin truncar a 0', () => {
      // Empresa con margen bajo (5%) y flete alto en COGS (30%) bajo cierre de los 6 estrechos
      const result = MaritimeChokepointService.simulateChokepointBlockades({
        blockedChokepoints: ['hormuz', 'malacca', 'suez', 'bab_el_mandeb', 'panama', 'bosporus'],
        sector: 'ENERGY_PETROCHEMICALS',
        customGrossMarginPct: 5.0,
        customFreightSharePct: 35.0,
        sensitivityMultiplier: 2.5,
      });

      // El margen bruto resultante es negativo (COGS > 100) y la compresión excede 500 bps
      expect(result.grossMarginAfter).toBeLessThan(0);
      expect(result.grossMarginCompressionBps).toBeGreaterThan(1000);
    });

    it('debe manejar sectores no reconocidos y sensibilidad fuera de rango con valores de fallback seguros', () => {
      const result = MaritimeChokepointService.simulateChokepointBlockades({
        blockedChokepoints: ['suez'],
        sector: 'UNKNOWN_SECTOR' as any,
        sensitivityMultiplier: Number.NaN,
      });

      expect(result.transitDelayDays).toBe(14);
      expect(result.freightRateSurgePct).toBeGreaterThan(0);
      expect(result.sensitivityMultiplier).toBe(1.0);
    });
  });

  // ─── 3. Verificación de Componentes UI (Navbar HoI4 & Drawer) ────────────────

  describe('3. Componentes Visuales HoI4 & Simulación', () => {
    it('debe renderizar la barra táctica HoI4 con World Tension, DEFCON y botón de Comercio Marítimo', () => {
      const onToggleMaritime = vi.fn();
      const onOpenDrawer = vi.fn();
      const onToggle2D = vi.fn();
      const onReset = vi.fn();

      render(
        <Hoi4TacticalNavbar
          is2DMode={true}
          onToggle2DMode={onToggle2D}
          onResetView={onReset}
          showMaritimeRoutes={false}
          onToggleMaritimeRoutes={onToggleMaritime}
          blockedCount={0}
          onOpenSimulationDrawer={onOpenDrawer}
          worldTension={{ tensionIndex: 45, source: 'gdelt' }}
        />
      );

      // Verificar elementos HoI4
      expect(screen.getByTestId('hoi4-tactical-navbar')).toBeDefined();
      expect(screen.getByTestId('hoi4-world-tension-badge')).toBeDefined();
      expect(screen.getByText(/45%/)).toBeDefined();
      expect(screen.getByTestId('hoi4-defcon-badge')).toBeDefined();

      // Botón "Comercio Marítimo" prominente
      const maritimeBtn = screen.getByTestId('toggle-maritime-trade-button');
      expect(maritimeBtn).toBeDefined();
      expect(maritimeBtn.textContent).toContain('Comercio Marítimo');
      expect(maritimeBtn.textContent).toContain('OFF');

      // Click en el botón de Comercio Marítimo
      fireEvent.click(maritimeBtn);
      expect(onToggleMaritime).toHaveBeenCalledTimes(1);

      // Botón de estado de chokepoints
      const statusBtn = screen.getByTestId('hoi4-chokepoint-status-button');
      expect(statusBtn.textContent).toContain('0/6 BLOQUEADOS');
      fireEvent.click(statusBtn);
      expect(onOpenDrawer).toHaveBeenCalledTimes(1);
    });

    it('debe mostrar estado de alerta roja y DEFCON elevado cuando hay estrechos bloqueados', () => {
      render(
        <Hoi4TacticalNavbar
          is2DMode={false}
          onToggle2DMode={() => {}}
          onResetView={() => {}}
          showMaritimeRoutes={true}
          onToggleMaritimeRoutes={() => {}}
          blockedCount={3}
          onOpenSimulationDrawer={() => {}}
          worldTension={{ tensionIndex: 75, source: 'gdelt' }}
        />
      );

      const statusBtn = screen.getByTestId('hoi4-chokepoint-status-button');
      expect(statusBtn.textContent).toContain('3/6 BLOQUEADOS');

      const maritimeBtn = screen.getByTestId('toggle-maritime-trade-button');
      expect(maritimeBtn.textContent).toContain('ACTIVO');

      const defconBadge = screen.getByTestId('hoi4-defcon-badge');
      expect(defconBadge.textContent).toMatch(/DEFCON 1|DEFCON 2/);
    });

    it('debe renderizar el Drawer de Simulación con los 6 estrechos y KPIs cuantitativos', () => {
      const onToggleChokepoint = vi.fn();
      const onSelectSector = vi.fn();
      const onClose = vi.fn();

      const simResult = MaritimeChokepointService.simulateChokepointBlockades({
        blockedChokepoints: ['suez'],
        sector: 'AUTOMOTIVE_PARTS',
      });

      render(
        <ChokepointSimulationDrawer
          isOpen={true}
          onClose={onClose}
          blockedChokepoints={['suez']}
          onToggleChokepoint={onToggleChokepoint}
          onSetBlockedChokepoints={() => {}}
          selectedSector="AUTOMOTIVE_PARTS"
          onSelectSector={onSelectSector}
          sensitivityMultiplier={1.0}
          onChangeSensitivity={() => {}}
          simulationResult={simResult}
        />
      );

      // Modal abierto
      expect(screen.getByTestId('chokepoint-simulation-drawer')).toBeDefined();

      // Las 6 tarjetas de chokepoint
      for (const cp of CHOKEPOINT_LIST) {
        expect(screen.getByTestId(`chokepoint-card-${cp.id}`)).toBeDefined();
      }

      // Tarjeta de Suez debe mostrar estado CERRADO / BLOQUEADO
      const suezCard = screen.getByTestId('chokepoint-card-suez');
      expect(suezCard.textContent).toContain('CERRADO');

      // Click para alternar un chokepoint
      fireEvent.click(suezCard);
      expect(onToggleChokepoint).toHaveBeenCalledWith('suez');

      // KPIs cuantitativos
      expect(screen.getByTestId('jit-starvation-badge')).toBeDefined();
      expect(screen.getAllByText(/\+14/).length).toBeGreaterThan(0); // Días de retraso

      // Cerrar drawer con botón X
      const closeBtn = screen.getByTestId('close-chokepoint-drawer');
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('debe cerrar el drawer de simulación al presionar la tecla Escape', () => {
      const onClose = vi.fn();
      const simResult = MaritimeChokepointService.simulateChokepointBlockades({
        blockedChokepoints: [],
      });

      render(
        <ChokepointSimulationDrawer
          isOpen={true}
          onClose={onClose}
          blockedChokepoints={[]}
          onToggleChokepoint={() => {}}
          onSetBlockedChokepoints={() => {}}
          selectedSector="AUTOMOTIVE_PARTS"
          onSelectSector={() => {}}
          sensitivityMultiplier={1.0}
          onChangeSensitivity={() => {}}
          simulationResult={simResult}
        />
      );

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('debe renderizar en Map2D los 6 estrechos con círculos stroke-dasharray="4,4" y rutas marítimas al activar showMaritimeRoutes', () => {
      const mockFeature = {
        polyId: 'poly-TEST',
        type: 'Feature',
        properties: { ADMIN: 'Global Ocean', ISO_A3: 'GLO' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-10, -10],
              [-10, 10],
              [10, 10],
              [10, -10],
              [-10, -10],
            ],
          ],
        },
      };

      const { container } = render(
        <Map2D
          geoData={[mockFeature] as any}
          selectedCountry={null}
          hoveredCountry={null}
          activeMode="risk"
          activeRelations={{}}
          countryMockData={{}}
          showMaritimeRoutes={true}
          blockedChokepoints={['suez']}
          onToggleChokepoint={() => {}}
          onCountryHover={() => {}}
          onCountryClick={() => {}}
          onBackgroundClick={() => {}}
          isPanelOpen={false}
          containerDimensions={{ width: 1000, height: 600 }}
        />
      );

      // 1. Debe haber exactamente 6 marcadores de estrechos
      const markers = container.querySelectorAll('.chokepoint-marker');
      expect(markers).toHaveLength(6);

      // 2. Cada estrecho debe poseer un círculo con stroke-dasharray="4,4"
      const dashedCircles = container.querySelectorAll('.chokepoint-marker circle[stroke-dasharray="4,4"]');
      expect(dashedCircles).toHaveLength(6);

      // 3. El Canal de Suez (bloqueado) debe tener stroke rojo de alerta y clase animate-pulse
      const suezMarker = Array.from(markers).find((m) => m.textContent?.includes('Suez'));
      expect(suezMarker).toBeDefined();

      const suezCircle = suezMarker?.querySelector('circle[stroke-dasharray="4,4"]');
      expect(suezCircle?.getAttribute('stroke')).toBe('#ef4444');
      expect(suezCircle?.getAttribute('class')).toContain('animate-pulse');

      // 4. Los estrechos abiertos (ej. Malaca) deben tener stroke cian #38bdf8
      const malaccaMarker = Array.from(markers).find((m) => m.textContent?.includes('Malaca'));
      expect(malaccaMarker).toBeDefined();

      const malaccaCircle = malaccaMarker?.querySelector('circle[stroke-dasharray="4,4"]');
      expect(malaccaCircle?.getAttribute('stroke')).toBe('#38bdf8');

      // 5. Las rutas marítimas deben estar trazadas
      const tradeLines = container.querySelectorAll('.maritime-trade-line');
      expect(tradeLines.length).toBeGreaterThan(0);
    });

    it('debe alternar el estrecho al hacer clic o presionar Enter en un marcador de Map2D', () => {
      const onToggleChokepoint = vi.fn();
      const mockFeature = {
        polyId: 'poly-TEST',
        type: 'Feature',
        properties: { ADMIN: 'Global Ocean', ISO_A3: 'GLO' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-10, -10],
              [-10, 10],
              [10, 10],
              [10, -10],
              [-10, -10],
            ],
          ],
        },
      };

      const { container } = render(
        <Map2D
          geoData={[mockFeature] as any}
          selectedCountry={null}
          hoveredCountry={null}
          activeMode="risk"
          activeRelations={{}}
          countryMockData={{}}
          showMaritimeRoutes={true}
          blockedChokepoints={[]}
          onToggleChokepoint={onToggleChokepoint}
          onCountryHover={() => {}}
          onCountryClick={() => {}}
          onBackgroundClick={() => {}}
          isPanelOpen={false}
          containerDimensions={{ width: 1000, height: 600 }}
        />
      );

      const markers = container.querySelectorAll('.chokepoint-marker');
      expect(markers.length).toBe(6);

      // Clic en el primer estrecho
      fireEvent.click(markers[0]);
      expect(onToggleChokepoint).toHaveBeenCalledTimes(1);

      // Presionar Enter en el segundo estrecho (accesibilidad de teclado)
      fireEvent.keyDown(markers[1], { key: 'Enter' });
      expect(onToggleChokepoint).toHaveBeenCalledTimes(2);
    });

    it('debe mostrar el tooltip HUD naval al hacer hover sobre un estrecho en Map2D', () => {
      const mockFeature = {
        polyId: 'poly-TEST',
        type: 'Feature',
        properties: { ADMIN: 'Global Ocean', ISO_A3: 'GLO' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-10, -10],
              [-10, 10],
              [10, 10],
              [10, -10],
              [-10, -10],
            ],
          ],
        },
      };

      const { container } = render(
        <Map2D
          geoData={[mockFeature] as any}
          selectedCountry={null}
          hoveredCountry={null}
          activeMode="risk"
          activeRelations={{}}
          countryMockData={{}}
          showMaritimeRoutes={true}
          blockedChokepoints={['suez']}
          onToggleChokepoint={() => {}}
          onCountryHover={() => {}}
          onCountryClick={() => {}}
          onBackgroundClick={() => {}}
          isPanelOpen={false}
          containerDimensions={{ width: 1000, height: 600 }}
        />
      );

      const markers = container.querySelectorAll('.chokepoint-marker');
      expect(markers.length).toBe(6);

      // Hover sobre el primer marcador
      fireEvent.mouseEnter(markers[0], { clientX: 200, clientY: 200 });

      const tooltip = screen.getByTestId('chokepoint-tooltip');
      expect(tooltip).toBeDefined();
      expect(tooltip.textContent).toContain('Tráfico Mundial');
      expect(tooltip.textContent).toContain('Retraso Desvío');
    });

    it('no debe renderizar estrechos ni rutas marítimas en Map2D cuando showMaritimeRoutes es false', () => {
      const mockFeature = {
        polyId: 'poly-TEST',
        type: 'Feature',
        properties: { ADMIN: 'Global Ocean', ISO_A3: 'GLO' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-10, -10],
              [-10, 10],
              [10, 10],
              [10, -10],
              [-10, -10],
            ],
          ],
        },
      };

      const { container } = render(
        <Map2D
          geoData={[mockFeature] as any}
          selectedCountry={null}
          hoveredCountry={null}
          activeMode="risk"
          activeRelations={{}}
          countryMockData={{}}
          showMaritimeRoutes={false}
          blockedChokepoints={[]}
          onToggleChokepoint={() => {}}
          onCountryHover={() => {}}
          onCountryClick={() => {}}
          onBackgroundClick={() => {}}
          isPanelOpen={false}
          containerDimensions={{ width: 1000, height: 600 }}
        />
      );

      const markers = container.querySelectorAll('.chokepoint-marker');
      expect(markers).toHaveLength(0);

      const tradeLines = container.querySelectorAll('.maritime-trade-line');
      expect(tradeLines).toHaveLength(0);
    });
  });
});
