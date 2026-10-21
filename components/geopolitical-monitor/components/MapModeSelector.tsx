'use client';

import React from 'react';
import { Activity, Flag, Network, Newspaper } from 'lucide-react';

export type MapMode = 'risk' | 'relations' | 'claims' | 'news';

export interface MapModeSelectorProps {
  activeMode: MapMode;
  onModeChange: (mode: MapMode) => void;
  className?: string;
}

export const MapModeSelector: React.FC<MapModeSelectorProps> = ({ activeMode, onModeChange, className = '' }) => {
  return (
    <div className={`absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-auto ${className}`}>
      <div className="flex items-center bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/80 p-1 rounded-xl shadow-2xl">
        <button
          onClick={() => onModeChange('risk')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
            activeMode === 'risk'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          RIESGO
        </button>
        <div className="w-px h-4 bg-zinc-700 mx-1"></div>
        <button
          onClick={() => onModeChange('relations')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
            activeMode === 'relations'
              ? 'bg-zinc-500/20 text-zinc-300 border border-zinc-500/30 font-bold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          RELACIONES
        </button>
        <div className="w-px h-4 bg-zinc-700 mx-1"></div>
        <button
          onClick={() => onModeChange('claims')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
            activeMode === 'claims'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <Flag className="w-3.5 h-3.5" />
          RECLAMOS
        </button>
        <div className="w-px h-4 bg-zinc-700 mx-1"></div>
        <button
          onClick={() => onModeChange('news')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
            activeMode === 'news'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <Newspaper className="w-3.5 h-3.5" />
          NOTICIAS
        </button>
      </div>
    </div>
  );
};
