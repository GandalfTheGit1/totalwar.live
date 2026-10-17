import React from 'react';
import type { WargameSimulationResult } from '@/lib/types/sovereign-power';

interface PowerTelemetryHudProps {
  compositePowerIndex: number;
  simulationResult: WargameSimulationResult;
}

export function PowerTelemetryHud({
  compositePowerIndex,
  simulationResult,
}: PowerTelemetryHudProps) {
  return (
    <div className="grid grid-cols-3 gap-2 text-center font-mono">
      <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
        <span className="text-[9px] text-zinc-400 uppercase block font-semibold">Poder Soberano</span>
        <span className="text-lg font-black text-emerald-400">
          {compositePowerIndex}
          <span className="text-[10px] text-zinc-500 font-normal"> / 100</span>
        </span>
      </div>

      <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
        <span className="text-[9px] text-zinc-400 uppercase block font-semibold">Palanca Geopolítica</span>
        <span className="text-lg font-black text-cyan-400">
          {simulationResult.warpedLeverage}
          <span className="text-[10px] text-zinc-500 font-normal"> / 100</span>
        </span>
      </div>

      <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800 flex flex-col items-center justify-center">
        <span className="text-[9px] text-zinc-400 uppercase block font-semibold">Estatus Táctico</span>
        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase mt-0.5 ${simulationResult.defconStatus.badgeBg}`}>
          DEFCON {simulationResult.defconStatus.level}
        </span>
      </div>
    </div>
  );
}
