/**
 * Buscador de indicadores: sugerencias al enfocar y filtrado mientras se escribe,
 * con /api/indicators simulado a partir del catálogo real.
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import catalog from '@/lib/data/trading-economics/catalog.json';
import { IndicatorSearchBar } from '@/components/geopolitical-monitor/components/indicators/IndicatorSearchBar';
import { clearResourcesCache } from '@/components/geopolitical-monitor/hooks/useCountryResources';

afterEach(() => {
  cleanup();
  clearResourcesCache();
  vi.unstubAllGlobals();
});

function mockApi() {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ indicators: catalog }), {
    headers: { 'Content-Type': 'application/json' },
  })));
}

describe('IndicatorSearchBar', () => {
  it('sugiere los indicadores con datos al enfocar y filtra mientras se escribe', async () => {
    mockApi();
    const onSelect = vi.fn();
    render(<IndicatorSearchBar onSelectIndicator={onSelect} />);
    const input = screen.getByRole('combobox', { name: 'Buscar indicador económico' });

    fireEvent.focus(input);
    const withData = catalog.filter((i) => 'countryCount' in i).length;
    expect(await screen.findAllByRole('option')).toHaveLength(withData);
    expect(screen.getByText(/Disponibles en el mapa/)).toBeTruthy();

    fireEvent.change(input, { target: { value: 'par' } });
    expect(screen.getAllByRole('option')[0].textContent).toMatch(/Unemployment Rate/);

    fireEvent.change(input, { target: { value: 'paro' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('unemployment-rate');
  });
});
