/**
 * @file sec-properties-components.test.tsx
 * @description UI component tests for SEC Item 2 (Properties) pins and map visualizations (T03.1).
 * Tests FacilityTacticalPopover, Map2D markers layer rendering, CorporateFacilitiesMap,
 * and view mode toggling in GeographicOperations.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FacilityTacticalPopover } from '@/components/dev/geopolitical-monitor/components/FacilityTacticalPopover';
import { Map2D } from '@/components/dev/geopolitical-monitor/components/Map2D';
import { CorporateFacilitiesMap } from '@/components/geographic-operations/corporate-facilities-map';
import { CorporateFacility, secPropertiesService } from '@/lib/services/geographic/sec-properties-service';
import { Company } from '@/lib/types';

// Mock GeoFeature
const mockGeoFeatures = [
  {
    type: 'Feature',
    polyId: 'poly-1',
    properties: { ADMIN: 'United States', ISO_A3: 'USA', ISO_A2: 'US' },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-120, 35],
          [-120, 45],
          [-100, 45],
          [-100, 35],
          [-120, 35],
        ],
      ],
    },
  },
];

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ features: mockGeoFeatures }),
    })
  ));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const mockFacilityHq: CorporateFacility = {
  id: 'aapl-hq-apple-park',
  ticker: 'AAPL',
  name: 'Apple Park (Global Headquarters)',
  city: 'Cupertino',
  stateProvince: 'California',
  country: 'Estados Unidos',
  countryCode: 'US',
  lat: 37.3349,
  lng: -122.009,
  functionalType: 'HQ',
  tenure: 'OWNED',
  sqFt: 2800000,
  sqMeters: 260128,
  description: 'Sede central icónica con 100% energía renovable.',
  geopoliticalRiskScore: 2.2,
};

const mockFacilityFab: CorporateFacility = {
  id: 'tsm-fab18-tainan',
  ticker: 'TSM',
  name: 'Fab 18 - GigaFab 3nm/5nm',
  city: 'Tainan',
  stateProvince: 'Southern Taiwan Science Park',
  country: 'Taiwán',
  countryCode: 'TW',
  lat: 23.111,
  lng: 120.278,
  functionalType: 'MANUFACTURING',
  tenure: 'OWNED',
  sqFt: 8000000,
  sqMeters: 743224,
  description: 'GigaFab de vanguardia mundial en nodos de 3nm.',
  geopoliticalRiskScore: 7.8,
};

const mockFacilityLeased: CorporateFacility = {
  id: 'nvda-taiwan-ai',
  ticker: 'NVDA',
  name: 'Taiwan AI Technology Center',
  city: 'Hsinchu',
  country: 'Taiwán',
  countryCode: 'TW',
  lat: 24.782,
  lng: 121.0064,
  functionalType: 'RND',
  tenure: 'LEASED',
  sqFt: 200000,
  sqMeters: 18581,
  description: 'Co-diseño y validación de sustratos CoWoS con TSMC.',
  geopoliticalRiskScore: 7.5,
};

describe('FacilityTacticalPopover Component', () => {
  it('should render facility tactical details properly', () => {
    const onClose = vi.fn();
    render(
      <FacilityTacticalPopover
        facility={mockFacilityHq}
        position={{ x: 100, y: 150 }}
        onClose={onClose}
        isPinned={true}
      />
    );

    expect(screen.getByText('Apple Park (Global Headquarters)')).toBeDefined();
    expect(screen.getByText('AAPL')).toBeDefined();
    expect(screen.getByText(/Cupertino/)).toBeDefined();
    expect(screen.getByText('2,800,000 sq ft')).toBeDefined();
    expect(screen.getByText('EN PROPIEDAD')).toBeDefined();
    expect(screen.getByText(/2.2\/10/)).toBeDefined();
    expect(screen.getByText('Sede central icónica con 100% energía renovable.')).toBeDefined();

    // Check close button
    const closeBtn = screen.getByLabelText('Cerrar detalles de la instalación');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should render ARRENDADO badge when tenure is LEASED', () => {
    render(
      <FacilityTacticalPopover
        facility={mockFacilityLeased}
        position={{ x: 50, y: 50 }}
      />
    );

    expect(screen.getByText('ARRENDADO')).toBeDefined();
    expect(screen.getByText(/Taiwan AI Technology Center/)).toBeDefined();
    expect(screen.getByText(/7.5\/10/)).toBeDefined();
    expect(screen.getByText(/Riesgo Crítico/)).toBeDefined();
  });

  it('should return null when facility is null', () => {
    const { container } = render(
      <FacilityTacticalPopover
        facility={null}
        position={{ x: 0, y: 0 }}
      />
    );
    expect(container.firstChild).toBeNull();
  });
});

describe('Map2D - SEC Item 2 Pins Rendering in Footprint Layer', () => {
  it('should render facility markers in .markers-layer when activeLayer is footprint', () => {
    const facilities = [mockFacilityHq, mockFacilityFab];
    const { container } = render(
      <Map2D
        geoData={mockGeoFeatures as any}
        selectedCountry={null}
        hoveredCountry={null}
        activeMode="risk"
        activeRelations={{}}
        countryMockData={{}}
        activeLayer="footprint"
        facilities={facilities}
        onCountryHover={vi.fn()}
        onCountryClick={vi.fn()}
        onBackgroundClick={vi.fn()}
        isPanelOpen={false}
        containerDimensions={{ width: 800, height: 600 }}
      />
    );

    const markersLayer = container.querySelector('.markers-layer');
    expect(markersLayer).toBeDefined();
    const facilityMarkers = container.querySelectorAll('.facility-marker');
    expect(facilityMarkers.length).toBe(2);
  });

  it('should not render facility markers when activeLayer is not footprint', () => {
    const facilities = [mockFacilityHq, mockFacilityFab];
    const { container } = render(
      <Map2D
        geoData={mockGeoFeatures as any}
        selectedCountry={null}
        hoveredCountry={null}
        activeMode="risk"
        activeRelations={{}}
        countryMockData={{}}
        activeLayer="resources"
        facilities={facilities}
        onCountryHover={vi.fn()}
        onCountryClick={vi.fn()}
        onBackgroundClick={vi.fn()}
        isPanelOpen={false}
        containerDimensions={{ width: 800, height: 600 }}
      />
    );

    const facilityMarkers = container.querySelectorAll('.facility-marker');
    expect(facilityMarkers.length).toBe(0);
  });
});

describe('CorporateFacilitiesMap Component', () => {
  const mockCompany: Company = {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Technology',
    industry: 'Consumer Electronics',
    country: 'USA',
  } as any;

  it('should render facility stats and directory list for Apple', () => {
    render(
      <CorporateFacilitiesMap
        company={mockCompany}
      />
    );

    expect(screen.getByText(/Apple Park/)).toBeDefined();
    expect(screen.getByText(/Austin Americas Operations/)).toBeDefined();
    expect(screen.getByText('Instalaciones')).toBeDefined();
    expect(screen.getByText('Superficie Total')).toBeDefined();
    expect(screen.getByText('Tenencia')).toBeDefined();
  });

  it('should filter facilities when functional tab is clicked', () => {
    render(
      <CorporateFacilitiesMap
        company={mockCompany}
      />
    );

    // Click HQ filter tab
    const hqTab = screen.getByText(/HQ \(/);
    fireEvent.click(hqTab);

    // Apple Park should be present
    expect(screen.getByText(/Apple Park/)).toBeDefined();
  });

  it('should filter facilities based on search query', () => {
    render(
      <CorporateFacilitiesMap
        company={mockCompany}
      />
    );

    const searchInput = screen.getByPlaceholderText('Buscar planta o ciudad...');
    fireEvent.change(searchInput, { target: { value: 'Mesa' } });

    expect(screen.getByText(/Mesa Global Command/)).toBeDefined();
  });

  it('should fetch from API route and render facilities for uncurated company', async () => {
    const uncuratedCompany: Company = {
      ticker: 'UNCURATED_TECH',
      name: 'Uncurated Tech Corp',
      sector: 'Technology',
      industry: 'Semiconductors',
      country: 'USA',
    } as any;

    const mockExtractedFacility: CorporateFacility = {
      id: 'uncurated-plant-1',
      ticker: 'UNCURATED_TECH',
      name: 'Palo Alto Nanotech Lab',
      city: 'Palo Alto',
      stateProvince: 'California',
      country: 'Estados Unidos',
      countryCode: 'US',
      lat: 37.4419,
      lng: -122.143,
      functionalType: 'RND',
      tenure: 'OWNED',
      sqFt: 450000,
      sqMeters: 41806,
      description: 'Advanced silicon photonics laboratory',
      geopoliticalRiskScore: 1.8,
    };

    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/facilities')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            ticker: 'UNCURATED_TECH',
            facilities: [mockExtractedFacility],
            source: 'sec-llm',
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ features: mockGeoFeatures }),
      });
    }));

    render(
      <CorporateFacilitiesMap
        company={uncuratedCompany}
      />
    );

    expect(await screen.findByText(/Palo Alto Nanotech Lab/)).toBeDefined();
    expect(screen.getByText(/450k sq ft/i)).toBeDefined();
  });

  it('should display visible error banner if API extraction fails (Rule 7.5 & 11)', async () => {
    const errorCompany: Company = {
      ticker: 'ERROR_TECH',
      name: 'Error Corp',
      sector: 'Technology',
    } as any;

    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/facilities')) {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({
            error: 'Failed to extract',
            detail: 'Fallo al parsear 10-K de la SEC',
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ features: mockGeoFeatures }),
      });
    }));

    render(
      <CorporateFacilitiesMap
        company={errorCompany}
      />
    );

    expect(await screen.findByText(/Fallo al parsear 10-K de la SEC/)).toBeDefined();
  });
});

