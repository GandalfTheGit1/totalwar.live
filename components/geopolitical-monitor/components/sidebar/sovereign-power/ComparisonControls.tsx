import React from 'react';
import { Layers } from 'lucide-react';
import type { BenchmarkSuperpower } from '@/lib/types/sovereign-power';

interface ComparisonControlsProps {
  showGlobal: boolean;
  setShowGlobal: (val: boolean) => void;
  showSuperpower: boolean;
  setShowSuperpower: (val: boolean) => void;
  superpowerKey: BenchmarkSuperpower;
  setSuperpowerKey: (val: BenchmarkSuperpower) => void;
}

export function ComparisonControls({
  showGlobal,
  setShowGlobal,
  showSuperpower,
  setShowSuperpower,
  superpowerKey,
  setSuperpowerKey,
}: ComparisonControlsProps) {
  return (
    <div className="bg-zinc-900/70 p-2.5 rounded-lg border border-zinc-800 text-[11px] font-mono space-y-2">
      <div className="flex items-center justify-between text-zinc-400">
        <span className="flex items-center gap-1.5 font-bold">
          <Layers className="w-3.5 h-3.5 text-zinc-400" /> Comparativas:
        </span>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1 cursor-pointer hover:text-zinc-200">
            <input
              type="checkbox"
              checked={showGlobal}
              onChange={(e) => setShowGlobal(e.target.checked)}
              className="accent-amber-400 rounded cursor-pointer"
            />
            <span className="text-amber-400">Global</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer hover:text-zinc-200">
            <input
              type="checkbox"
              checked={showSuperpower}
              onChange={(e) => setShowSuperpower(e.target.checked)}
              className="accent-rose-500 rounded cursor-pointer"
            />
            <span className="text-rose-400">Superpotencia</span>
          </label>
        </div>
      </div>

      {showSuperpower && (
        <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60">
          <span className="text-zinc-400">Hegemón de Referencia:</span>
          <select
            value={superpowerKey}
            onChange={(e) => setSuperpowerKey(e.target.value as BenchmarkSuperpower)}
            className="bg-zinc-950 border border-zinc-700 text-rose-300 text-[10px] rounded px-2 py-0.5 font-mono cursor-pointer focus:outline-none"
          >
            <option value="US">EE. UU. 🇺🇸</option>
            <option value="CN">China 🇨🇳</option>
            <option value="RU">Rusia 🇷🇺</option>
          </select>
        </div>
      )}
    </div>
  );
}
