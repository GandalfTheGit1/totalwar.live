/**
 * Panel de recursos del país, buscador de recursos, panel de productores y capa del mapa,
 * con /api/resources simulado a partir del dataset real.
 */

import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor, within } from '@testing-library/react';
import React from 'react';
import { COUNTRY_RESOURCES } from '@/lib/services/country-resources/dataset';
import { getCountryCeased, getCountryResources, getProducers } from '@/lib/services/country-resources/query';
import { CountryResourcesSection } from '@/components/geopolitical-monitor/components/resources/CountryResourcesSection';
import { ResourceSearchBar } from '@/components/geopolitical-monitor/components/resources/ResourceSearchBar';
import { ResourceProducersPanel } from '@/components/geopolitical-monitor/components/resources/ResourceProducersPanel';
import { buildResourceLayerMap } from '@/components/geopolitical-monitor/components/resources/resource-layer';
import { clearResourcesCache } from '@/components/geopolitical-monitor/hooks/useCountryResources';

const { meta, commodities } = COUNTRY_RESOURCES;

function mockApi() {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input), 'http://localhost');
    let body: unknown = { error: 'bad request' };
    let status = 200;
    if (url.searchParams.has('catalog')) body = { meta, commodities };
    else if (url.searchParams.get('country')) {
      const code = url.searchParams.get('country')!;
      body = {
        meta,
        country: { iso2: 'ES', iso3: 'ESP', nameEs: 'España' },
        resources: getCountryResources(COUNTRY_RESOURCES, code),
        ceased: getCountryCeased(COUNTRY_RESOURCES, code),
      };
    } else if (url.searchParams.get('commodity')) {
      const id = url.searchParams.get('commodity')!;
      const commodity = commodities.find((c) => c.id === id);
      if (commodity) body = { meta, commodity, producers: getProducers(COUNTRY_RESOURCES, id) };
      else status = 404;
    } else status = 400;
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

beforeEach(() => {
  clearResourcesCache();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('CountryResourcesSection', () => {
  it('lista los recursos del país con cantidad, cuota y puesto, y muestra 12 de inicio', async () => {
    mockApi();
    render(<CountryResourcesSection countryCode="ESP" countryName="España" />);
    const rows = await screen.findAllByTestId('resource-row');
    expect(rows).toHaveLength(12);
    const total = getCountryResources(COUNTRY_RESOURCES, 'ES').length;
    expect(screen.getByTestId('resources-total')).toHaveTextContent(String(total));
    expect(screen.getByText('Aceite de oliva')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: `Ver los ${total - 12} restantes` })).toBeInTheDocument();
  });

  it('filtra por categoría y por texto', async () => {
    mockApi();
    render(<CountryResourcesSection countryCode="ES" countryName="España" />);
    await screen.findAllByTestId('resource-row');

    fireEvent.click(screen.getByRole('button', { name: /^Electricidad/ }));
    const electricity = screen.getAllByTestId('resource-row');
    expect(electricity.length).toBeGreaterThan(2);
    expect(within(screen.getByTestId('resources-list')).getByText('Energía eólica')).toBeInTheDocument();
    expect(screen.getAllByText(/de su electricidad/).length).toBe(electricity.length);

    fireEvent.click(screen.getByRole('button', { name: /^Todos/ }));
    fireEvent.change(screen.getByLabelText('Filtrar recursos del país'), { target: { value: 'wolfram' } });
    expect(screen.getAllByTestId('resource-row')).toHaveLength(1);
    expect(screen.getByText('Wolframio')).toBeInTheDocument();
  });

  it('el botón de mapa devuelve el id del recurso', async () => {
    mockApi();
    const onShowOnMap = vi.fn();
    render(<CountryResourcesSection countryCode="ES" countryName="España" onShowOnMap={onShowOnMap} />);
    await screen.findAllByTestId('resource-row');
    fireEvent.click(screen.getByRole('button', { name: 'Ver productores de Aceite de oliva en el mapa' }));
    expect(onShowOnMap).toHaveBeenCalledWith('fao:261');
  });

  it('incluye pesca y cabaña ganadera, y señala la fuente cuando no es la habitual', async () => {
    mockApi();
    render(<CountryResourcesSection countryCode="ALB" countryName="Albania" />);
    await screen.findAllByTestId('resource-row');
    expect(screen.getByRole('button', { name: /^Pesca/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^Electricidad/ }));
    const hydro = screen.getByText('Energía hidroeléctrica').closest('li')!;
    expect(hydro).toHaveTextContent('fuente: Eurostat');
    expect(hydro).toHaveTextContent(/de su electricidad/);
  });

  it('lista aparte la producción detenida con su último dato', async () => {
    mockApi();
    render(<CountryResourcesSection countryCode="ES" countryName="España" />);
    const ceased = await screen.findByTestId('resources-ceased');
    expect(within(ceased).getByText('Aluminio')).toBeInTheDocument();
    expect(ceased).toHaveTextContent(/en 2021 · 0 en 2024/);
  });

  it('muestra un aviso si el país no tiene datos', async () => {
    mockApi();
    render(<CountryResourcesSection countryCode="AQ" countryName="Antártida" />);
    expect(await screen.findByTestId('resources-empty')).toBeInTheDocument();
  });

  it('no muestra enlaces, badges ni menciones de Wikipedia en los recursos', async () => {
    mockApi();
    const { container } = render(<CountryResourcesSection countryCode="ESP" countryName="España" />);
    await screen.findAllByTestId('resource-row');
    expect(screen.queryByTitle(/Wikipedia/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Wikipedia/i)).not.toBeInTheDocument();
    expect(container.textContent).not.toMatch(/wikipedia/i);
    const links = container.querySelectorAll('a');
    for (const link of links) {
      expect(link.getAttribute('href')).not.toMatch(/wikipedia\.org/i);
    }
  });
});

describe('ResourceSearchBar', () => {
  it('carga el catálogo al enfocar, sugiere sin acentos y selecciona con clic', async () => {
    const fetchMock = mockApi();
    const onSelect = vi.fn();
    render(<ResourceSearchBar onSelectResource={onSelect} />);
    expect(fetchMock).not.toHaveBeenCalled();

    const input = screen.getByRole('combobox', { name: 'Buscar recurso' });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'litio' } });
    const option = await screen.findByRole('option', { name: /Litio/ });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    fireEvent.click(option);
    expect(onSelect).toHaveBeenCalledWith('wmd:lithium');
  });

  it('navega con teclado y avisa cuando no hay coincidencias', async () => {
    mockApi();
    const onSelect = vi.fn();
    render(<ResourceSearchBar onSelectResource={onSelect} />);
    const input = screen.getByRole('combobox', { name: 'Buscar recurso' });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'aceite oliva' } });
    await screen.findAllByRole('option');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('fao:261');

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'xyzzy' } });
    expect(await screen.findByText(/Ningún recurso coincide/)).toBeInTheDocument();
  });

  it('no muestra badge ni mención de Wikipedia en los resultados', async () => {
    mockApi();
    const { container } = render(<ResourceSearchBar onSelectResource={vi.fn()} />);
    const input = screen.getByRole('combobox', { name: 'Buscar recurso' });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'aceite' } });
    await screen.findAllByRole('option');
    expect(screen.queryByText(/^Wiki$/i)).not.toBeInTheDocument();
    expect(screen.queryByTitle(/Wikipedia/i)).not.toBeInTheDocument();
    expect(container.textContent).not.toMatch(/wiki/i);
  });
});

describe('ResourceProducersPanel', () => {
  it('muestra la producción mundial y el ranking, y abre el país al hacer clic', async () => {
    mockApi();
    const onSelectCountry = vi.fn();
    const onClose = vi.fn();
    render(<ResourceProducersPanel commodityId="wmd:cobalt" onSelectCountry={onSelectCountry} onClose={onClose} />);
    expect(await screen.findByTestId('resource-producers-title')).toHaveTextContent('Cobalto');
    expect(screen.getByText(/Producción mundial \d{4}/)).toBeInTheDocument();
    const rows = screen.getAllByTestId('resource-producer-row');
    expect(rows[0]).toHaveTextContent('Congo');
    fireEvent.click(rows[0]);
    expect(onSelectCountry).toHaveBeenCalledWith('COD');
    fireEvent.click(screen.getByTestId('resource-clear-button'));
    expect(onClose).toHaveBeenCalled();
  });

  it('no muestra contenedor ni enlaces a Wikipedia', async () => {
    mockApi();
    const { container } = render(<ResourceProducersPanel commodityId="wmd:cobalt" />);
    await screen.findByTestId('resource-producers-title');
    expect(screen.queryByTestId('resource-wikipedia-links')).not.toBeInTheDocument();
    expect(container.textContent).not.toMatch(/wikipedia/i);
    const links = container.querySelectorAll('a');
    for (const link of links) {
      expect(link.getAttribute('href')).not.toMatch(/wikipedia\.org/i);
    }
  });
});

describe('buildResourceLayerMap', () => {
  it('registra cada productor por ISO2 e ISO3 con el color de su peso mundial', () => {
    const commodity = commodities.find((c) => c.id === 'wmd:cobalt')!;
    const map = buildResourceLayerMap(commodity, getProducers(COUNTRY_RESOURCES, 'wmd:cobalt'));
    expect(map.CD.colorCategory).toBe('critical');
    expect(map.COD).toBe(map.CD);
    expect(map.CD.label).toMatch(/^Cobalto: /);
    expect(map.CD.sublabel).toMatch(/puesto 1 de/);
    expect(map.CD.intensity).toBeGreaterThan(80);
    expect(map.CD.sublabel).not.toMatch(/wikipedia/i);
    expect(map.CD.label).not.toMatch(/wikipedia/i);
  });
});
