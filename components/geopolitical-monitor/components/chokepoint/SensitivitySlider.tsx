'use client';

import React from 'react';
import { Sliders } from 'lucide-react';

interface SensitivitySliderProps {
  sensitivityMultiplier: number;
  onChangeSensitivity: (val: number) => void;
}

export function SensitivitySlider({
  sensitivityMultiplier,
  onChangeSensitivity,
}: SensitivitySliderProps) {
  return (
    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <Sliders className="w-4 h-4 text-amber-400" />
        <div>
          <span className="text-xs font-bold text-slate-200 block">
            Sensibilidad de Sobrecoste / Estrés de Flete
          </span>
          <span className="text-[10px] text-slate-400">
            Multiplicador de congestión portuaria spot y escasez de buques
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min="0.5"
          max="3.0"
          step="0.1"
          value={sensitivityMultiplier}
          onChange={(e) => onChangeSensitivity(parseFloat(e.target.value))}
          className="w-36 accent-amber-500 cursor-pointer"
        />
        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-bold text-amber-300 text-xs">
          {sensitivityMultiplier.toFixed(1)}x
        </span>
        <button
          type="button"
          onClick={() => onChangeSensitivity(1.0)}
          className="px-2 py-1 text-[10px] rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors border border-slate-700 cursor-pointer"
          title="Restablecer sensibilidad a 1.0x"
        >
          1.0x
        </button>
      </div>
    </div>
  );
}
