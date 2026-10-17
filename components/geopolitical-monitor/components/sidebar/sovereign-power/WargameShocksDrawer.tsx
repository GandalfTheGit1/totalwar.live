import React from 'react';
import { Sliders, ChevronDown, ChevronUp } from 'lucide-react';
import type { WargameShocks, WargameSimulationResult } from '@/lib/types/sovereign-power';
import { WargameSimulatorControls } from './WargameSimulatorControls';

interface WargameShocksDrawerProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  isShocked: boolean;
  shocks: WargameShocks;
  onShockChange: (key: keyof WargameShocks, val: number) => void;
  onReset: () => void;
  simulationResult: WargameSimulationResult;
}

export function WargameShocksDrawer({
  isOpen,
  setIsOpen,
  isShocked,
  shocks,
  onShockChange,
  onReset,
  simulationResult,
}: WargameShocksDrawerProps) {
  return (
    <div className="bg-zinc-900/60 rounded-lg border border-zinc-800 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2.5 flex items-center justify-between text-xs font-mono font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span>Simulación Wargame (Stress Testing)</span>
          {isShocked && (
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
              ACTIVO
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {isOpen && (
        <div className="p-3 border-t border-zinc-800 bg-zinc-950/70">
          <WargameSimulatorControls
            shocks={shocks}
            onShockChange={onShockChange}
            onReset={onReset}
            defconStatus={simulationResult.defconStatus}
            originalLeverage={simulationResult.originalLeverage}
            warpedLeverage={simulationResult.warpedLeverage}
            leverageDelta={simulationResult.leverageDelta}
            tacticalLogs={simulationResult.tacticalLogs}
            compact={true}
            warpedDalioSpread={simulationResult.warpedDalioSpread}
          />
        </div>
      )}
    </div>
  );
}
