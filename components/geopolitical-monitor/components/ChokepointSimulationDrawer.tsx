/**
 * @file ChokepointSimulationDrawer.tsx
 * @description Tactical Drawer / Modal for Maritime Chokepoint Blockade Simulation (T03.5):
 * - Hearts of Iron IV (HoI4) aesthetic with dark brushed steel, rivets, and military telemetry.
 * - Interactive toggles for each of the 6 strategic straits/canals.
 * - Calibrated sector selector (Semiconductors, Automotive, Retail, Energy).
 * - Stress sensitivity slider.
 * - Real-time deterministic telemetry: ΔCOGS %, Transit Delay Days, Freight Surge $/FEU,
 *   Gross Margin Compression (bps), and HoI4 JIT Starvation risk badge.
 * - Contingency rerouting alternatives and bypass routes list.
 *
 * Decomposed into modular presentation components under components/chokepoint/.
 */

'use client';

import React, { useEffect } from 'react';
import { ChokepointSimulationDrawerProps } from './chokepoint/types';
import { DrawerHeader } from './chokepoint/DrawerHeader';
import { PresetsAndSectorSection } from './chokepoint/PresetsAndSectorSection';
import { SensitivitySlider } from './chokepoint/SensitivitySlider';
import { ChokepointMatrixGrid } from './chokepoint/ChokepointMatrixGrid';
import { QuantitativeKpiSection } from './chokepoint/QuantitativeKpiSection';
import { ReroutingAlternativesList } from './chokepoint/ReroutingAlternativesList';
import { DrawerFooter } from './chokepoint/DrawerFooter';

export type { ChokepointSimulationDrawerProps };

export const ChokepointSimulationDrawer: React.FC<ChokepointSimulationDrawerProps> = ({
  isOpen,
  onClose,
  blockedChokepoints,
  onToggleChokepoint,
  onSetBlockedChokepoints,
  selectedSector,
  onSelectSector,
  sensitivityMultiplier,
  onChangeSensitivity,
  simulationResult,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="chokepoint-drawer-title"
      data-testid="chokepoint-simulation-drawer"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto select-none"
    >
      {/* Contenedor Principal Estilo Sala de Mando HoI4 */}
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-gradient-to-b from-slate-900 via-slate-925 to-zinc-950 border-2 border-slate-700/90 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden">
        {/* Remaches de esquina HoI4 */}
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-slate-500 border border-slate-400/50 pointer-events-none" />
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-slate-500 border border-slate-400/50 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-slate-500 border border-slate-400/50 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-slate-500 border border-slate-400/50 pointer-events-none" />

        <DrawerHeader onClose={onClose} />

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar font-mono text-xs text-slate-200">
          <PresetsAndSectorSection
            blockedChokepoints={blockedChokepoints}
            onSetBlockedChokepoints={onSetBlockedChokepoints}
            selectedSector={selectedSector}
            onSelectSector={onSelectSector}
          />

          <SensitivitySlider
            sensitivityMultiplier={sensitivityMultiplier}
            onChangeSensitivity={onChangeSensitivity}
          />

          <ChokepointMatrixGrid
            chokepointDetails={simulationResult.chokepointDetails}
            onToggleChokepoint={onToggleChokepoint}
            onSetBlockedChokepoints={onSetBlockedChokepoints}
          />

          <QuantitativeKpiSection simulationResult={simulationResult} />

          <ReroutingAlternativesList
            reroutingAlternatives={simulationResult.reroutingAlternatives}
          />
        </div>

        <DrawerFooter onClose={onClose} />
      </div>
    </div>
  );
};

export default ChokepointSimulationDrawer;
