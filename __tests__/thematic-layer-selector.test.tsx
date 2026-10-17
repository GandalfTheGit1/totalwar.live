import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, renderHook, act, cleanup } from '@testing-library/react';
import React from 'react';
import { ThematicLayerSelector } from '@/components/dev/geopolitical-monitor/components/ThematicLayerSelector';
import { useGeopoliticalMonitor } from '@/components/dev/geopolitical-monitor/hooks/useGeopoliticalMonitor';
import GeopoliticalMonitor from '@/components/dev/geopolitical-monitor/GeopoliticalMonitor';
import { ThematicLayer } from '@/components/dev/geopolitical-monitor/types';
import { SettingsProvider } from '@/lib/settings-context';

describe('T03.2 - Ronda 2: ThematicLayerSelector & State Management', () => {
  beforeEach(() => {
    (window as any).Globe = vi.fn().mockReturnValue({
      width: vi.fn().mockReturnThis(),
      height: vi.fn().mockReturnThis(),
      globeImageUrl: vi.fn().mockReturnThis(),
      bumpImageUrl: vi.fn().mockReturnThis(),
      backgroundColor: vi.fn().mockReturnThis(),
      polygonAltitude: vi.fn().mockReturnThis(),
      polygonsTransitionDuration: vi.fn().mockReturnThis(),
      polygonSideColor: vi.fn().mockReturnThis(),
      polygonStrokeColor: vi.fn().mockReturnThis(),
      polygonCapColor: vi.fn().mockReturnThis(),
      polygonLabel: vi.fn().mockReturnThis(),
      arcDashLength: vi.fn().mockReturnThis(),
      arcDashGap: vi.fn().mockReturnThis(),
      arcDashInitialGap: vi.fn().mockReturnThis(),
      arcDashAnimateTime: vi.fn().mockReturnThis(),
      arcStroke: vi.fn().mockReturnThis(),
      arcColor: vi.fn().mockReturnThis(),
      arcsTransitionDuration: vi.fn().mockReturnThis(),
      onPolygonHover: vi.fn().mockReturnThis(),
      onPolygonClick: vi.fn().mockReturnThis(),
      onGlobeClick: vi.fn().mockReturnThis(),
      renderer: vi.fn().mockReturnValue({ setPixelRatio: vi.fn() }),
      controls: vi.fn().mockReturnValue({ autoRotate: false }),
      pointOfView: vi.fn(),
      pauseAnimation: vi.fn(),
      resumeAnimation: vi.fn(),
      polygonsData: vi.fn(),
      arcsData: vi.fn(),
    });
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
    delete (window as any).Globe;
    cleanup();
    vi.restoreAllMocks();
  });
  describe('ThematicLayerSelector UI Component', () => {
    it('should render all 5 thematic layer buttons with expected labels', () => {
      render(
        <ThematicLayerSelector
          activeLayer="none"
          onLayerChange={() => {}}
        />
      );

      expect(screen.getByRole('toolbar', { name: /Selector de capas temáticas/i })).toBeInTheDocument();
      expect(screen.getByTestId('thematic-layer-none')).toHaveTextContent('BASE');
      expect(screen.getByTestId('thematic-layer-tier-n')).toHaveTextContent('TIER-N');
      expect(screen.getByTestId('thematic-layer-resources')).toHaveTextContent('RECURSOS');
      expect(screen.getByTestId('thematic-layer-maritime')).toHaveTextContent('RUTAS');
      expect(screen.getByTestId('thematic-layer-footprint')).toHaveTextContent('HUELLA');
    });

    it('should set aria-pressed true on the active option and false on others', () => {
      const layers: ThematicLayer[] = ['none', 'tier-n', 'resources', 'maritime', 'footprint'];

      for (const current of layers) {
        const { unmount } = render(
          <ThematicLayerSelector
            activeLayer={current}
            onLayerChange={() => {}}
          />
        );

        for (const layer of layers) {
          const btn = screen.getByTestId(`thematic-layer-${layer}`);
          if (layer === current) {
            expect(btn).toHaveAttribute('aria-pressed', 'true');
          } else {
            expect(btn).toHaveAttribute('aria-pressed', 'false');
          }
        }

        unmount();
      }
    });

    it('should fire onLayerChange callback with correct layer id when clicked', () => {
      const onLayerChange = vi.fn();
      render(
        <ThematicLayerSelector
          activeLayer="none"
          onLayerChange={onLayerChange}
        />
      );

      fireEvent.click(screen.getByTestId('thematic-layer-tier-n'));
      expect(onLayerChange).toHaveBeenCalledWith('tier-n');

      fireEvent.click(screen.getByTestId('thematic-layer-resources'));
      expect(onLayerChange).toHaveBeenCalledWith('resources');

      fireEvent.click(screen.getByTestId('thematic-layer-maritime'));
      expect(onLayerChange).toHaveBeenCalledWith('maritime');

      fireEvent.click(screen.getByTestId('thematic-layer-footprint'));
      expect(onLayerChange).toHaveBeenCalledWith('footprint');

      fireEvent.click(screen.getByTestId('thematic-layer-none'));
      expect(onLayerChange).toHaveBeenCalledWith('none');

      expect(onLayerChange).toHaveBeenCalledTimes(5);
    });

    it('should apply tactical styling and specific accent classes when active', () => {
      const { rerender } = render(
        <ThematicLayerSelector
          activeLayer="tier-n"
          onLayerChange={() => {}}
        />
      );

      // TIER-N has amber accent
      const tierNBtn = screen.getByTestId('thematic-layer-tier-n');
      expect(tierNBtn.className).toContain('text-amber-300');
      expect(tierNBtn.className).toContain('bg-amber-500/20');

      // Resources has violet/purple accent
      rerender(
        <ThematicLayerSelector
          activeLayer="resources"
          onLayerChange={() => {}}
        />
      );
      const resourcesBtn = screen.getByTestId('thematic-layer-resources');
      expect(resourcesBtn.className).toContain('text-purple-300');
      expect(resourcesBtn.className).toContain('bg-purple-500/20');

      // Maritime has sky/celeste accent
      rerender(
        <ThematicLayerSelector
          activeLayer="maritime"
          onLayerChange={() => {}}
        />
      );
      const maritimeBtn = screen.getByTestId('thematic-layer-maritime');
      expect(maritimeBtn.className).toContain('text-sky-300');
      expect(maritimeBtn.className).toContain('bg-sky-500/20');

      // Footprint has emerald accent
      rerender(
        <ThematicLayerSelector
          activeLayer="footprint"
          onLayerChange={() => {}}
        />
      );
      const footprintBtn = screen.getByTestId('thematic-layer-footprint');
      expect(footprintBtn.className).toContain('text-emerald-300');
      expect(footprintBtn.className).toContain('bg-emerald-500/20');

      // Base has zinc accent
      rerender(
        <ThematicLayerSelector
          activeLayer="none"
          onLayerChange={() => {}}
        />
      );
      const baseBtn = screen.getByTestId('thematic-layer-none');
      expect(baseBtn.className).toContain('text-zinc-200');
    });

    it('should disable all buttons and prevent clicks when disabled is true', () => {
      const onLayerChange = vi.fn();
      render(
        <ThematicLayerSelector
          activeLayer="none"
          onLayerChange={onLayerChange}
          disabled={true}
        />
      );

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar.className).toContain('opacity-50');
      expect(toolbar.className).toContain('pointer-events-none');

      const buttons = screen.getAllByRole('button');
      for (const btn of buttons) {
        expect(btn).toBeDisabled();
        expect(btn.className).toContain('cursor-not-allowed');
      }

      fireEvent.click(screen.getByTestId('thematic-layer-tier-n'));
      expect(onLayerChange).not.toHaveBeenCalled();
    });

    it('should provide informative tooltips via title attribute for each layer option', () => {
      render(
        <ThematicLayerSelector
          activeLayer="none"
          onLayerChange={() => {}}
        />
      );

      expect(screen.getByTestId('thematic-layer-none')).toHaveAttribute(
        'title',
        'Vista geopolítica base sin capas temáticas'
      );
      expect(screen.getByTestId('thematic-layer-tier-n')).toHaveAttribute(
        'title',
        'Fricciones estratégicas y dependencias críticas Tier-N'
      );
      expect(screen.getByTestId('thematic-layer-resources')).toHaveAttribute(
        'title',
        'Concentración de materias primas críticas y semiconductores'
      );
      expect(screen.getByTestId('thematic-layer-maritime')).toHaveAttribute(
        'title',
        'Chokepoints y rutas marítimas estratégicas'
      );
      expect(screen.getByTestId('thematic-layer-footprint')).toHaveAttribute(
        'title',
        'Huella corporativa: sedes, manufactura y mercados de expansión'
      );
    });

    it('should support keyboard navigation across buttons with ArrowLeft, ArrowRight, Home, and End', () => {
      render(
        <ThematicLayerSelector
          activeLayer="none"
          onLayerChange={() => {}}
        />
      );

      const toolbar = screen.getByRole('toolbar');
      const baseBtn = screen.getByTestId('thematic-layer-none');
      const tierNBtn = screen.getByTestId('thematic-layer-tier-n');
      const resourcesBtn = screen.getByTestId('thematic-layer-resources');
      const footprintBtn = screen.getByTestId('thematic-layer-footprint');

      baseBtn.focus();
      expect(document.activeElement).toBe(baseBtn);

      // ArrowRight moves focus to TIER-N
      fireEvent.keyDown(toolbar, { key: 'ArrowRight' });
      expect(document.activeElement).toBe(tierNBtn);

      // ArrowRight moves focus to RECURSOS
      fireEvent.keyDown(toolbar, { key: 'ArrowRight' });
      expect(document.activeElement).toBe(resourcesBtn);

      // End moves focus to last button (HUELLA)
      fireEvent.keyDown(toolbar, { key: 'End' });
      expect(document.activeElement).toBe(footprintBtn);

      // ArrowRight wraps around to first button (BASE)
      fireEvent.keyDown(toolbar, { key: 'ArrowRight' });
      expect(document.activeElement).toBe(baseBtn);

      // ArrowLeft wraps around to last button (HUELLA)
      fireEvent.keyDown(toolbar, { key: 'ArrowLeft' });
      expect(document.activeElement).toBe(footprintBtn);

      // Home moves focus to first button (BASE)
      fireEvent.keyDown(toolbar, { key: 'Home' });
      expect(document.activeElement).toBe(baseBtn);
    });

    it('should accept and merge custom className on the outer toolbar container', () => {
      render(
        <ThematicLayerSelector
          activeLayer="none"
          onLayerChange={() => {}}
          className="custom-tactical-class top-20"
        />
      );

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar.className).toContain('custom-tactical-class');
      expect(toolbar.className).toContain('top-20');
    });

    it('should include aria-label on buttons and aria-hidden on decorative icons', () => {
      render(
        <ThematicLayerSelector
          activeLayer="none"
          onLayerChange={() => {}}
        />
      );

      const baseBtn = screen.getByTestId('thematic-layer-none');
      expect(baseBtn).toHaveAttribute('aria-label', expect.stringContaining('BASE'));

      const svgs = baseBtn.querySelectorAll('svg');
      expect(svgs.length).toBe(1);
      expect(svgs[0]).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('useGeopoliticalMonitor Hook Integration', () => {
    it('should default activeLayer to "none" and provide empty layerData', () => {
      const { result, unmount } = renderHook(() => useGeopoliticalMonitor());

      expect(result.current.activeLayer).toBe('none');
      expect(result.current.layerData).toEqual({});
      expect(typeof result.current.handleLayerChange).toBe('function');
      unmount();
    });

    it('should support defaultLayer option in hook initialization', () => {
      const { result, unmount } = renderHook(() => useGeopoliticalMonitor({ defaultLayer: 'tier-n' }));

      expect(result.current.activeLayer).toBe('tier-n');
      expect(result.current.layerData['RU']).toBeDefined();
      unmount();
    });

    it('should update activeLayer and layerData reactively when calling handleLayerChange', () => {
      const { result, unmount } = renderHook(() => useGeopoliticalMonitor());

      expect(result.current.activeLayer).toBe('none');
      expect(result.current.layerData).toEqual({});

      // Switch to tier-n
      act(() => {
        result.current.handleLayerChange('tier-n');
      });
      expect(result.current.activeLayer).toBe('tier-n');
      expect(result.current.layerData['RU']).toBeDefined();
      expect(result.current.layerData['US']).toBeDefined();

      // Switch to resources
      act(() => {
        result.current.handleLayerChange('resources');
      });
      expect(result.current.activeLayer).toBe('resources');
      expect(result.current.layerData['CL']).toBeDefined();
      expect(result.current.layerData['CN']).toBeDefined();

      // Switch to maritime
      act(() => {
        result.current.handleLayerChange('maritime');
      });
      expect(result.current.activeLayer).toBe('maritime');
      expect(result.current.layerData['EG']).toBeDefined();
      expect(result.current.layerData['YE']).toBeDefined();

      // Switch to footprint
      act(() => {
        result.current.handleLayerChange('footprint');
      });
      expect(result.current.activeLayer).toBe('footprint');
      expect(result.current.layerData['US']).toBeDefined();

      // Switch back to none
      act(() => {
        result.current.handleLayerChange('none');
      });
      expect(result.current.activeLayer).toBe('none');
      expect(result.current.layerData).toEqual({});
      unmount();
    });

    it('should expose setActiveLayer directly and allow setting activeLayer without handleLayerChange', () => {
      const { result, unmount } = renderHook(() => useGeopoliticalMonitor());

      expect(typeof result.current.setActiveLayer).toBe('function');
      act(() => {
        result.current.setActiveLayer('maritime');
      });
      expect(result.current.activeLayer).toBe('maritime');
      expect(result.current.layerData['EG']).toBeDefined();
      unmount();
    });
  });

  describe('GeopoliticalMonitor Orchestrator Integration', () => {
    it('should render ThematicLayerSelector only when activeMode is "risk"', () => {
      const { unmount } = render(
        <SettingsProvider>
          <GeopoliticalMonitor hideSidebar={true} />
        </SettingsProvider>
      );

      // Default mode is 'risk', so ThematicLayerSelector must be visible
      expect(screen.getByRole('toolbar', { name: /Selector de capas temáticas/i })).toBeInTheDocument();
      expect(screen.getByTestId('thematic-layer-none')).toBeInTheDocument();

      // Switch to 'relations' mode
      const relationsBtn = screen.getByRole('button', { name: /RELACIONES/i });
      act(() => {
        fireEvent.click(relationsBtn);
      });

      // ThematicLayerSelector should be unmounted
      expect(screen.queryByRole('toolbar', { name: /Selector de capas temáticas/i })).toBeNull();
      expect(screen.queryByTestId('thematic-layer-none')).toBeNull();

      // Switch to 'news' mode
      const newsBtn = screen.getByRole('button', { name: /NOTICIAS/i });
      act(() => {
        fireEvent.click(newsBtn);
      });

      // ThematicLayerSelector still not mounted
      expect(screen.queryByRole('toolbar', { name: /Selector de capas temáticas/i })).toBeNull();

      // Switch back to 'risk' mode
      const riskBtn = screen.getByRole('button', { name: /RIESGO/i });
      act(() => {
        fireEvent.click(riskBtn);
      });

      // ThematicLayerSelector is back
      expect(screen.getByRole('toolbar', { name: /Selector de capas temáticas/i })).toBeInTheDocument();
      expect(screen.getByTestId('thematic-layer-none')).toBeInTheDocument();

      unmount();
    });

    it('should allow clicking a thematic layer button in GeopoliticalMonitor and highlight it', () => {
      const { unmount } = render(
        <SettingsProvider>
          <GeopoliticalMonitor hideSidebar={true} />
        </SettingsProvider>
      );

      const baseBtn = screen.getByTestId('thematic-layer-none');
      const tierNBtn = screen.getByTestId('thematic-layer-tier-n');

      expect(baseBtn).toHaveAttribute('aria-pressed', 'true');
      expect(tierNBtn).toHaveAttribute('aria-pressed', 'false');

      act(() => {
        fireEvent.click(tierNBtn);
      });

      expect(baseBtn).toHaveAttribute('aria-pressed', 'false');
      expect(tierNBtn).toHaveAttribute('aria-pressed', 'true');
      expect(tierNBtn.className).toContain('text-amber-300');

      unmount();
    });

    it('should respect defaultLayer prop passed to GeopoliticalMonitor', () => {
      const { unmount } = render(
        <SettingsProvider>
          <GeopoliticalMonitor hideSidebar={true} defaultLayer="maritime" />
        </SettingsProvider>
      );

      const maritimeBtn = screen.getByTestId('thematic-layer-maritime');
      const baseBtn = screen.getByTestId('thematic-layer-none');

      expect(maritimeBtn).toHaveAttribute('aria-pressed', 'true');
      expect(baseBtn).toHaveAttribute('aria-pressed', 'false');
      expect(maritimeBtn.className).toContain('text-sky-300');

      unmount();
    });
  });
});
