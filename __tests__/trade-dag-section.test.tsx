import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { TradeDagSection } from '@/components/dev/geopolitical-monitor/components/sidebar/TradeDagSection';
import { TradeDagService } from '@/lib/services/trade-dag-service';

describe('TradeDagSection UI Component (T03.11)', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should render TradeDagSection with header, T03.11 badge, and all 4 KPI cards', () => {
    render(<TradeDagSection countryCode="US" countryName="Estados Unidos" />);

    expect(screen.getByText(/DAG de Comercio & Trade Steering/i)).toBeInTheDocument();
    expect(screen.getByText(/T03.11/i)).toBeInTheDocument();
    expect(screen.getByText(/Drenaje Margen/i)).toBeInTheDocument();
    expect(screen.getByText(/Captura FCF/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Trade Steering/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Chokepoints/i)).toBeInTheDocument();
    expect(screen.getByText(/Diagnóstico Ejecutivo/i)).toBeInTheDocument();
  });

  it('should switch between industrial archetypes (Semiconductors, EV, BioPharma, Luxury)', () => {
    render(<TradeDagSection countryCode="TW" countryName="Taiwán" />);

    // Click on Semiconductores IA archetype
    const semiBtn = screen.getByRole('button', { name: /Semiconductores IA/i });
    fireEvent.click(semiBtn);
    expect(screen.getByText(/ASML Litografía EUV/i)).toBeInTheDocument();
    expect(screen.getByText(/TSMC Fundición Pura/i)).toBeInTheDocument();
    expect(screen.getByText(/NVIDIA/i)).toBeInTheDocument();

    // Click on Baterías EV archetype
    const evBtn = screen.getByRole('button', { name: /Baterías EV/i });
    fireEvent.click(evBtn);
    expect(screen.getAllByText(/CATL/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Tesla Inc\./i)).toBeInTheDocument();

    // Click on Biofarma archetype
    const pharmaBtn = screen.getByRole('button', { name: /Biofarma/i });
    fireEvent.click(pharmaBtn);
    expect(screen.getByText(/Lonza \/ Catalent/i)).toBeInTheDocument();
    expect(screen.getByText(/Big Pharma Protegida/i)).toBeInTheDocument();

    // Click on Lujo archetype
    const luxuryBtn = screen.getByRole('button', { name: /Lujo/i });
    fireEvent.click(luxuryBtn);
    expect(screen.getByText(/Hermès \/ LVMH/i)).toBeInTheDocument();
  });

  it('should filter nodes by category (Todos, End, Pass, Chokepoint)', () => {
    render(<TradeDagSection countryCode="US" countryName="Estados Unidos" />);

    // Switch to semiconductors where all categories exist
    const semiBtn = screen.getByRole('button', { name: /Semiconductores IA/i });
    fireEvent.click(semiBtn);

    // Filter to End Nodes
    const endFilterBtn = screen.getByRole('button', { name: /^End$/i });
    fireEvent.click(endFilterBtn);
    expect(screen.getByText(/NVIDIA/i)).toBeInTheDocument();
    expect(screen.getByText(/Apple Inc\./i)).toBeInTheDocument();
    expect(screen.queryByText(/Foxconn \/ Hon Hai/i)).not.toBeInTheDocument();

    // Filter to Chokepoints
    const chokepointFilterBtn = screen.getByRole('button', { name: /^Chokepoint$/i });
    fireEvent.click(chokepointFilterBtn);
    expect(screen.getByText(/ASML Litografía EUV/i)).toBeInTheDocument();
    expect(screen.getByText(/TSMC Fundición Pura/i)).toBeInTheDocument();
    expect(screen.queryByText(/Apple Inc\./i)).not.toBeInTheDocument();

    // Filter back to All
    const allFilterBtn = screen.getByRole('button', { name: /^Todos$/i });
    fireEvent.click(allFilterBtn);
    expect(screen.getByText(/ASML Litografía EUV/i)).toBeInTheDocument();
    expect(screen.getByText(/Apple Inc\./i)).toBeInTheDocument();
  });

  it('should toggle and interact with Trade Steering Shock Simulator', () => {
    render(<TradeDagSection countryCode="US" countryName="Estados Unidos" />);

    // Simulator button
    const simToggleBtn = screen.getByRole('button', { name: /Simulador/i });
    fireEvent.click(simToggleBtn);

    expect(screen.getByText(/Simulación de Desvío Comercial \(Bypass Shock\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Flujo Desviado/i)).toBeInTheDocument();
    expect(screen.getByText(/Pérdida Margen/i)).toBeInTheDocument();
    expect(screen.getByText(/Nuevo FCF Capture/i)).toBeInTheDocument();

    // Adjust slider
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '60' } });

    expect(screen.getByText(/60% Desvío/i)).toBeInTheDocument();
  });

  it('should fail fast and loud: display visible error alert on cyclic DAG or analysis failure (Rule 7.5 & 11)', async () => {
    // Spy on analyzeTradeDag and simulate validation failure
    vi.spyOn(TradeDagService, 'analyzeTradeDag').mockImplementation(() => {
      throw new Error('[TradeDagService] Error de aciclicidad detectado: dependencia circular X ➔ Y ➔ X');
    });

    render(<TradeDagSection countryCode="US" countryName="Estados Unidos" />);

    expect(await screen.findByText(/Fallo de Validación DAG de Comercio/i)).toBeInTheDocument();
    expect(screen.getByText(/dependencia circular X ➔ Y ➔ X/i)).toBeInTheDocument();
  });

  it('should handle empty countryCode or countryName gracefully without empty parentheses', () => {
    render(<TradeDagSection countryCode="" countryName="" />);
    expect(screen.getByText(/US \(Estados Un\)/i)).toBeInTheDocument();
  });

  it('should display empty filter message when no nodes match filter', () => {
    // In Luxury archetype, there are only ORIGIN, PASS_THROUGH and END_NODE, but no CHOKEPOINTS
    render(<TradeDagSection countryCode="FR" countryName="Francia" />);
    const luxuryBtn = screen.getByRole('button', { name: /Lujo/i });
    fireEvent.click(luxuryBtn);

    const chokepointBtn = screen.getByRole('button', { name: /^Chokepoint$/i });
    fireEvent.click(chokepointBtn);

    expect(screen.getByText(/No se encontraron nodos para el filtro seleccionado/i)).toBeInTheDocument();
  });

  it('should display informational message when a graph has no pass-through nodes in simulator', () => {
    // Mock getTradeDagForCountry to return graph with no pass-through nodes
    vi.spyOn(TradeDagService, 'getTradeDagForCountry').mockReturnValue({
      id: 'no_pass',
      name: 'Direct Bilateral',
      sector: 'Direct',
      description: 'No intermediaries',
      nodes: [
        {
          id: 'orig', name: 'Origin Raw', type: 'ORIGIN', countryCode: 'CL', industry: 'Raw',
          operatingMargin: 0.2, fcf: 100, revenue: 500, pricingPower: 50, moatScore: 50,
          moatType: 'NONE_COMMODITIZED', substitutability: 0.5, switchingCost: 30
        },
        {
          id: 'end', name: 'Direct End', type: 'END_NODE', countryCode: 'US', industry: 'End',
          operatingMargin: 0.3, fcf: 300, revenue: 1000, pricingPower: 90, moatScore: 90,
          moatType: 'BRAND_MONOPOLY', substitutability: 0.1, switchingCost: 90
        }
      ],
      edges: [
        { source: 'orig', target: 'end', flowValue: 400 }
      ]
    });

    render(<TradeDagSection countryCode="CL" countryName="Chile" />);

    const simToggleBtn = screen.getByRole('button', { name: /Simulador/i });
    fireEvent.click(simToggleBtn);

    expect(screen.getByText(/Esta cadena no contiene nodos intermedios de paso/i)).toBeInTheDocument();
  });
});
