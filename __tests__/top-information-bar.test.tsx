import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TopInformationBar } from '@/components/geopolitical-monitor/components/top-bar/TopInformationBar';
import { TopBarDrawer } from '@/components/geopolitical-monitor/components/top-bar/TopBarDrawer';
import {
  computeCells, levelLowerBetter, parsePercent,
} from '@/components/geopolitical-monitor/components/top-bar/metrics';
import { computeDefconLevel } from '@/components/geopolitical-monitor/components/top-bar/defcon';
import { getSovereignProfileCached } from '@/components/geopolitical-monitor/utils/sovereign-cache';
import type { TopBarContext } from '@/components/geopolitical-monitor/components/top-bar/types';
import { MaritimeChokepointService } from '@/lib/services/maritime-chokepoint-service';

const emptyCells = computeCells({ iso2: null, profile: null, macro: null, blockedCount: 0 });

describe('top bar metrics', () => {
  it('shows no-data cells without a country, but keeps global ports', () => {
    expect(emptyCells.military.level).toBe('na');
    expect(emptyCells.stability.text).toBe('—');
    expect(emptyCells.ports.text).toBe('6/6');
  });

  it('computes real values for a supported country', () => {
    const profile = getSovereignProfileCached('US');
    const cells = computeCells({ iso2: 'US', profile, macro: null, blockedCount: 2 });
    expect(cells.military.text).toBe('#1');
    expect(Number(cells.stability.text)).toBeGreaterThanOrEqual(0);
    expect(cells.debt.level).toBe('na');
    expect(cells.ports.text).toBe('4/6');
  });

  it('thresholds and parsing behave', () => {
    expect(levelLowerBetter(20, 25, 45)).toBe('ok');
    expect(levelLowerBetter(50, 25, 45)).toBe('bad');
    expect(parsePercent('+123.4%')).toBeCloseTo(123.4);
    expect(parsePercent('N/A')).toBeNull();
  });

  it('computes DEFCON from tension and blocked straits', () => {
    expect(computeDefconLevel(10, 0)).toBe(5);
    expect(computeDefconLevel(10, 1)).toBe(4);
    expect(computeDefconLevel(50, 0)).toBe(3);
    expect(computeDefconLevel(85, 0)).toBe(1);
  });
});

describe('TopInformationBar', () => {
  it('renders icon-only cells with accessible names and selects a domain', () => {
    const onSelect = vi.fn();
    render(
      <TopInformationBar cells={emptyCells} activeDomain={null} onSelectDomain={onSelect} tension={45} defcon={3} countryLabel={null} />
    );
    const btn = screen.getByTestId('topbar-cell-military');
    expect(btn.getAttribute('aria-label')).toContain('Ranking militar');
    expect(btn.textContent).not.toContain('Ranking');
    fireEvent.click(btn);
    expect(onSelect).toHaveBeenCalledWith('military');
    fireEvent.click(screen.getByTestId('topbar-cell-tension'));
    expect(onSelect).toHaveBeenCalledWith('tension');
    expect(screen.getByTestId('topbar-defcon').textContent).toContain('DEFCON 3');
  });

  it('marks the active domain as pressed', () => {
    render(
      <TopInformationBar cells={emptyCells} activeDomain="ports" onSelectDomain={() => {}} tension={20} defcon={5} countryLabel="US" />
    );
    expect(screen.getByTestId('topbar-cell-ports').getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByTestId('topbar-cell-military').getAttribute('aria-pressed')).toBe('false');
  });
});

describe('TopBarDrawer', () => {
  const ctx: TopBarContext = {
    iso2: 'CN',
    countryName: 'China',
    profile: getSovereignProfileCached('CN'),
    macro: null,
    isMacroLoading: false,
    blockedChokepoints: [],
    toggleChokepoint: vi.fn(),
    simulationResult: MaritimeChokepointService.simulateChokepointBlockades({ blockedChokepoints: [] }),
    selectedCommodity: 'rare-earths',
    setSelectedCommodity: vi.fn(),
    worldTension: null,
    defcon: 5,
  };

  it('renders nothing without an active domain', () => {
    const { container } = render(<TopBarDrawer domain={null} ctx={ctx} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows why China is ranked where it is, with a factor tile per factor', () => {
    render(<TopBarDrawer domain="military" ctx={ctx} onClose={() => {}} />);
    for (const k of ['budget', 'troops', 'ground', 'air', 'naval', 'nuclear', 'tech']) {
      expect(screen.getByTestId(`military-factor-${k}`)).toBeDefined();
    }
    expect(screen.getByTestId('military-ranking-list').children.length).toBeGreaterThan(0);
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();
    render(<TopBarDrawer domain="stability" ctx={ctx} onClose={onClose} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('renders every panel without crashing', () => {
    for (const d of ['military', 'stability', 'tech', 'debt', 'relations', 'resources', 'ports', 'energy', 'tension'] as const) {
      const { unmount } = render(<TopBarDrawer domain={d} ctx={ctx} onClose={() => {}} />);
      expect(screen.getByTestId('top-bar-drawer')).toBeDefined();
      unmount();
    }
  });
});
