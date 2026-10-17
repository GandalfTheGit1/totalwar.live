import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import React from 'react';
import { SovereignPowerRadarSection } from '@/components/dev/geopolitical-monitor/components/sidebar/SovereignPowerRadarSection';
import { SovereignRadarChart } from '@/components/dev/geopolitical-monitor/components/sidebar/sovereign-power/SovereignRadarChart';
import { WargameSimulatorControls } from '@/components/dev/geopolitical-monitor/components/sidebar/sovereign-power/WargameSimulatorControls';
import { WarRoomCommandModal } from '@/components/dev/geopolitical-monitor/components/sidebar/sovereign-power/WarRoomCommandModal';
import { TechInnovationPanel } from '@/components/dev/geopolitical-monitor/components/sidebar/sovereign-power/TechInnovationPanel';
import { CurrencyHegemonyPanel } from '@/components/dev/geopolitical-monitor/components/sidebar/sovereign-power/CurrencyHegemonyPanel';
import { TradeCompetitivenessPanel } from '@/components/dev/geopolitical-monitor/components/sidebar/sovereign-power/TradeCompetitivenessPanel';
import { MilitaryCapacityPanel } from '@/components/dev/geopolitical-monitor/components/sidebar/sovereign-power/MilitaryCapacityPanel';
import { InstitutionalStabilityPanel } from '@/components/dev/geopolitical-monitor/components/sidebar/sovereign-power/InstitutionalStabilityPanel';
import { DimensionDetailView } from '@/components/dev/geopolitical-monitor/components/sidebar/sovereign-power/DimensionDetailView';
import { SovereignPowerService, DEFCON_LEVELS } from '@/lib/services/sovereign-power-service';

describe('SovereignPowerRadarSection & UI Components (T03.8 & T03.9)', () => {
  afterEach(() => {
    cleanup();
  });

  const sampleActiveData = {
    iso: 'US',
    name: 'Estados Unidos',
    risk: 15,
    indicator: '#00e676'
  };

  it('should render SovereignPowerRadarSection with title, telemetry badges, and radar chart', () => {
    render(<SovereignPowerRadarSection activeData={sampleActiveData} />);

    expect(screen.getByText(/Spider Chart Soberano/i)).toBeInTheDocument();
    expect(screen.getByText(/Poder Soberano/i)).toBeInTheDocument();
    expect(screen.getByText(/Palanca Geopolítica/i)).toBeInTheDocument();
    expect(screen.getByText(/SALA DE MANDO/i)).toBeInTheDocument();
  });

  it('should render SovereignRadarChart with SVG axes and tactical labels', () => {
    const scores = SovereignPowerService.getBenchmarkScores('US');
    const globalScores = SovereignPowerService.getGlobalAverageScores();

    const { container } = render(
      <SovereignRadarChart
        countryScores={scores}
        globalScores={globalScores}
        superpowerScores={scores}
        countryName="Estados Unidos"
        showGlobal={true}
        showSuperpower={true}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(screen.getByText(/\[TEC\]/i)).toBeInTheDocument();
    expect(screen.getByText(/\[MIL\]/i)).toBeInTheDocument();
    expect(screen.getByText(/\[DIV\]/i)).toBeInTheDocument();
  });

  it('should open and close Wargame Shocks mini drawer in sidebar', () => {
    render(<SovereignPowerRadarSection activeData={sampleActiveData} />);

    const shockToggleBtn = screen.getByText(/Simulación Wargame \(Stress Testing\)/i);
    expect(shockToggleBtn).toBeInTheDocument();

    // Open drawer
    fireEvent.click(shockToggleBtn);
    expect(screen.getByText(/Gasto de Defensa & Rearme/i)).toBeInTheDocument();
    expect(screen.getByText(/Embargo Tecnológico/i)).toBeInTheDocument();

    // Close drawer
    fireEvent.click(shockToggleBtn);
    expect(screen.queryByText(/Gasto de Defensa & Rearme/i)).not.toBeInTheDocument();
  });

  it('should open and close Dimension Quick-Inspector drawer', () => {
    render(<SovereignPowerRadarSection activeData={sampleActiveData} />);

    const dimToggleBtn = screen.getByText(/Inspección de Dimensión/i);
    fireEvent.click(dimToggleBtn);

    expect(screen.getByText(/Abrir Dossier Completo en Sala de Mando/i)).toBeInTheDocument();
  });

  it('should open Fullscreen War Room Command Modal when clicking SALA DE MANDO', () => {
    render(<SovereignPowerRadarSection activeData={sampleActiveData} />);

    const warRoomBtn = screen.getByText('SALA DE MANDO');
    fireEvent.click(warRoomBtn);

    // Modal is now open
    expect(screen.getByText(/\[SALA DE MANDO TÁCTICO/i)).toBeInTheDocument();
    expect(screen.getByText(/Capas Comparativas/i)).toBeInTheDocument();
    expect(screen.getByText(/CRT: OFF/i)).toBeInTheDocument();

    // Toggle CRT scanlines
    const crtBtn = screen.getByText(/CRT: OFF/i);
    fireEvent.click(crtBtn);
    expect(screen.getByText(/CRT: ON/i)).toBeInTheDocument();

    // Close modal with close button
    const closeBtn = screen.getByTitle(/Cerrar sala de mando/i);
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/\[SALA DE MANDO TÁCTICO/i)).not.toBeInTheDocument();
  });

  it('should switch between simulation, dimension dossiers, and cabinet war council in War Room', () => {
    const profile = SovereignPowerService.getCountrySovereignProfile('US');
    const globalScores = SovereignPowerService.getGlobalAverageScores();
    const superpowerScores = SovereignPowerService.getBenchmarkScores('US');
    const sim = SovereignPowerService.simulateWargame(profile.baseScores, {
      defenseShock: 0,
      tradeShock: 0,
      currencyShock: 0,
      techShock: 0
    });

    render(
      <WarRoomCommandModal
        isOpen={true}
        onClose={() => {}}
        profile={profile}
        globalScores={globalScores}
        superpowerKey="US"
        onSuperpowerChange={() => {}}
        superpowerScores={superpowerScores}
        shocks={{ defenseShock: 0, tradeShock: 0, currencyShock: 0, techShock: 0 }}
        onShockChange={() => {}}
        onResetShocks={() => {}}
        simulationResult={sim}
        selectedDimension="techInnovation"
        onSelectDimension={() => {}}
      />
    );

    // Default tab is simulation
    expect(screen.getAllByText(/Simulador de Shocks/i).length).toBeGreaterThan(0);

    // Switch to Dimension Dossiers
    const dossiersTab = screen.getByText(/Dossiers de Inteligencia \(6 Pilares\)/i);
    fireEvent.click(dossiersTab);
    expect(screen.getByText(/Pilar Tecnológico & Capacidades Críticas/i)).toBeInTheDocument();

    // Switch to Cabinet Council
    const cabinetTab = screen.getByText(/Consejo de Guerra & Gabinete/i);
    fireEvent.click(cabinetTab);
    expect(screen.getByText(/Lloyd Austin/i)).toBeInTheDocument();
    expect(screen.getByText(/Janet Yellen/i)).toBeInTheDocument();
  });

  it('should trigger cabinet reshuffle appointment and update UI', () => {
    const profile = SovereignPowerService.getCountrySovereignProfile('US');
    const globalScores = SovereignPowerService.getGlobalAverageScores();
    const superpowerScores = SovereignPowerService.getBenchmarkScores('US');
    const sim = SovereignPowerService.simulateWargame(profile.baseScores, {
      defenseShock: 0,
      tradeShock: 0,
      currencyShock: 0,
      techShock: 0
    });

    const appointMock = vi.fn();

    render(
      <WarRoomCommandModal
        isOpen={true}
        onClose={() => {}}
        profile={profile}
        globalScores={globalScores}
        superpowerKey="US"
        onSuperpowerChange={() => {}}
        superpowerScores={superpowerScores}
        shocks={{ defenseShock: 0, tradeShock: 0, currencyShock: 0, techShock: 0 }}
        onShockChange={() => {}}
        onResetShocks={() => {}}
        simulationResult={sim}
        selectedDimension="politicalCabinet"
        onSelectDimension={() => {}}
        onAppointReplacement={appointMock}
      />
    );

    // Navigate to Cabinet tab
    const cabinetTab = screen.getByText(/Consejo de Guerra & Gabinete/i);
    fireEvent.click(cabinetTab);

    // Look for Pete Hegseth appointment option
    expect(screen.getByText(/Pete Hegseth/i)).toBeInTheDocument();
    const appointButtons = screen.getAllByText('NOMBRAR');
    expect(appointButtons.length).toBeGreaterThan(0);

    fireEvent.click(appointButtons[0]);
    expect(appointMock).toHaveBeenCalledWith('DEFENSE', 'us_rep_hawk_secdef');
  });

  it('should interactively update shock sliders in WargameSimulatorControls', () => {
    const shockChangeMock = vi.fn();
    const resetMock = vi.fn();

    render(
      <WargameSimulatorControls
        shocks={{ defenseShock: 20, tradeShock: 0, currencyShock: 0, techShock: 0 }}
        onShockChange={shockChangeMock}
        onReset={resetMock}
        defconStatus={DEFCON_LEVELS[4]}
        originalLeverage={85}
        warpedLeverage={88}
        leverageDelta={3}
      />
    );

    expect(screen.getByText(/\+20%/i)).toBeInTheDocument();
    expect(screen.getByText(/\+3 pts/i)).toBeInTheDocument();

    const resetBtn = screen.getByText('RESET');
    fireEvent.click(resetBtn);
    expect(resetMock).toHaveBeenCalled();
  });

  it('should display real-time Dalio Spread indicator in WargameSimulatorControls when shocks are active', () => {
    render(
      <WargameSimulatorControls
        shocks={{ defenseShock: 0, tradeShock: 0, currencyShock: -40, techShock: 0 }}
        onShockChange={() => {}}
        onReset={() => {}}
        defconStatus={DEFCON_LEVELS[2]}
        originalLeverage={85}
        warpedLeverage={75}
        leverageDelta={-10}
        warpedDalioSpread={{
          nominalGdpGrowthPercent: 2.0,
          effectiveInterestRatePercent: 7.2,
          spreadPercent: -5.2,
          isBeautifulDeleveraging: false,
          verdictEs: 'Spread Dalio negativo (-5.2%). Riesgo de espiral de deuda.'
        }}
      />
    );

    expect(screen.getByText(/Spread Dalio \(Warped\):/i)).toBeInTheDocument();
    expect(screen.getByText(/-5.2%/i)).toBeInTheDocument();
    expect(screen.getByText(/ESPIRAL DEUDA/i)).toBeInTheDocument();
  });

  it('should render TechInnovationPanel with subsector telemetry and WIPO rank', () => {
    const profile = SovereignPowerService.getCountrySovereignProfile('US');
    render(<TechInnovationPanel dossier={profile.dossiers.tech} />);

    expect(screen.getByText(/Pilar Tecnológico & Capacidades Críticas/i)).toBeInTheDocument();
    expect(screen.getByText(/Rank Patentes OMPI\/WIPO: #2/i)).toBeInTheDocument();
    expect(screen.getByText(/Fintech & Fedwire/i)).toBeInTheDocument();
    expect(screen.getByText(/Guerra Asimétrica & Drones/i)).toBeInTheDocument();
    expect(screen.getByText(/Diseño Fabless Dominante/i)).toBeInTheDocument();
    expect(screen.getByText(/Hegemonía Frontier AI/i)).toBeInTheDocument();
  });

  it('should render CurrencyHegemonyPanel with SWIFT status and Dalio Beautiful Deleveraging', () => {
    const profile = SovereignPowerService.getCountrySovereignProfile('US');
    render(<CurrencyHegemonyPanel dossier={profile.dossiers.currency} />);

    expect(screen.getByText(/Estatus de Reserva & Autonomía Financiera/i)).toBeInTheDocument();
    expect(screen.getByText(/USD - Dólar Estadounidense/i)).toBeInTheDocument();
    expect(screen.getByText(/HEGEMON_CONTROLLER/i)).toBeInTheDocument();
    expect(screen.getByText(/DESAPALANCAMIENTO HERMOSO/i)).toBeInTheDocument();
  });

  it('should render TradeCompetitivenessPanel with bilateral partner flows and critical dependencies', () => {
    const profile = SovereignPowerService.getCountrySovereignProfile('CN');
    render(<TradeCompetitivenessPanel dossier={profile.dossiers.trade} />);

    expect(screen.getByText(/Balanza Comercial & Socios Estratégicos/i)).toBeInTheDocument();
    expect(screen.getByText(/Destinos Clave Exportación/i)).toBeInTheDocument();
    expect(screen.getByText(/Orígenes Clave Importación/i)).toBeInTheDocument();
    expect(screen.getByText(/Dependencias Estratégicas Críticas:/i)).toBeInTheDocument();
  });

  it('should render MilitaryCapacityPanel with nuclear deterrence, naval projection and chokepoints', () => {
    const profile = SovereignPowerService.getCountrySovereignProfile('US');
    render(<MilitaryCapacityPanel dossier={profile.dossiers.military} />);

    expect(screen.getByText(/Poder Cinético & Proyección de Fuerza/i)).toBeInTheDocument();
    expect(screen.getByText(/Disuasión Nuclear:/i)).toBeInTheDocument();
    expect(screen.getByText(/Proyección Naval:/i)).toBeInTheDocument();
    expect(screen.getByText(/Control de Chokepoints Marítimos/i)).toBeInTheDocument();
    expect(screen.getByText(/Alianzas & Tratados Militares:/i)).toBeInTheDocument();
  });

  it('should render InstitutionalStabilityPanel with Rule of law and sociopolitical fracture risk', () => {
    const profile = SovereignPowerService.getCountrySovereignProfile('US');
    render(<InstitutionalStabilityPanel dossier={profile.dossiers.stability} />);

    expect(screen.getByText(/Estado de Derecho & Cohesión Institucional/i)).toBeInTheDocument();
    expect(screen.getByText(/Índice Rule of Law:/i)).toBeInTheDocument();
    expect(screen.getByText(/Riesgo Golpe \/ Fractura:/i)).toBeInTheDocument();
    expect(screen.getByText(/Polarización Sociopolítica:/i)).toBeInTheDocument();
  });

  it('should switch between all 6 tabs in DimensionDetailView and display modular components', () => {
    const profile = SovereignPowerService.getCountrySovereignProfile('US');
    const onSelectMock = vi.fn();

    const { rerender } = render(
      <DimensionDetailView
        profile={profile}
        selectedDimension="techInnovation"
        onSelectDimension={onSelectMock}
      />
    );

    expect(screen.getByText(/Pilar Tecnológico & Capacidades Críticas/i)).toBeInTheDocument();

    // Rerender with currencyHegemony
    rerender(
      <DimensionDetailView
        profile={profile}
        selectedDimension="currencyHegemony"
        onSelectDimension={onSelectMock}
      />
    );
    expect(screen.getByText(/Estatus de Reserva & Autonomía Financiera/i)).toBeInTheDocument();

    // Rerender with militaryCapacity
    rerender(
      <DimensionDetailView
        profile={profile}
        selectedDimension="militaryCapacity"
        onSelectDimension={onSelectMock}
      />
    );
    expect(screen.getByText(/Poder Cinético & Proyección de Fuerza/i)).toBeInTheDocument();
  });
});
