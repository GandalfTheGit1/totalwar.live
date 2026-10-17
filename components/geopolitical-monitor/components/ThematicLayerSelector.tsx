'use client';

import React from 'react';
import { Layers, Link2, Gem, Ship, Factory } from 'lucide-react';
import { ThematicLayer } from '../types';

export interface ThematicLayerSelectorProps {
  activeLayer: ThematicLayer;
  onLayerChange: (layer: ThematicLayer) => void;
  disabled?: boolean;
  className?: string;
}

interface LayerOption {
  id: ThematicLayer;
  label: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  activeClasses: string;
  hoverClasses: string;
  description: string;
}

const LAYER_OPTIONS: LayerOption[] = [
  {
    id: 'none',
    label: 'BASE',
    icon: Layers,
    activeClasses: 'bg-zinc-700/30 text-zinc-200 border-zinc-500/40 shadow-[0_0_10px_rgba(161,161,170,0.15)] font-bold',
    hoverClasses: 'hover:text-zinc-200 hover:bg-zinc-800',
    description: 'Vista geopolítica base sin capas temáticas',
  },
  {
    id: 'tier-n',
    label: 'TIER-N',
    icon: Link2,
    activeClasses: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)] font-bold',
    hoverClasses: 'hover:text-amber-200 hover:bg-zinc-800',
    description: 'Fricciones estratégicas y dependencias críticas Tier-N',
  },
  {
    id: 'resources',
    label: 'RECURSOS',
    icon: Gem,
    activeClasses: 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)] font-bold',
    hoverClasses: 'hover:text-purple-200 hover:bg-zinc-800',
    description: 'Concentración de materias primas críticas y semiconductores',
  },
  {
    id: 'maritime',
    label: 'RUTAS',
    icon: Ship,
    activeClasses: 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-[0_0_10px_rgba(14,165,233,0.2)] font-bold',
    hoverClasses: 'hover:text-sky-200 hover:bg-zinc-800',
    description: 'Chokepoints y rutas marítimas estratégicas',
  },
  {
    id: 'footprint',
    label: 'HUELLA',
    icon: Factory,
    activeClasses: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)] font-bold',
    hoverClasses: 'hover:text-emerald-200 hover:bg-zinc-800',
    description: 'Huella corporativa: sedes, manufactura y mercados de expansión',
  },
];

export const ThematicLayerSelector: React.FC<ThematicLayerSelectorProps> = ({
  activeLayer,
  onLayerChange,
  disabled = false,
  className = '',
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const buttons = e.currentTarget.querySelectorAll<HTMLButtonElement>('button[data-testid^="thematic-layer-"]');
    if (!buttons.length) return;
    const currentIndex = Array.from(buttons).findIndex((btn) => btn === document.activeElement);

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % buttons.length;
      buttons[nextIndex]?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex <= 0 ? buttons.length - 1 : currentIndex - 1;
      buttons[prevIndex]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      buttons[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      buttons[buttons.length - 1]?.focus();
    }
  };

  return (
    <div
      className={`absolute top-28 left-1/2 -translate-x-1/2 z-20 pointer-events-auto transition-opacity duration-200 ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      } ${className}`}
      role="toolbar"
      aria-label="Selector de capas temáticas"
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/80 p-1 rounded-xl shadow-2xl max-w-[calc(100vw-2rem)] overflow-x-auto custom-scrollbar">
        {LAYER_OPTIONS.map((option, index) => {
          const Icon = option.icon;
          const isActive = activeLayer === option.id;

          return (
            <React.Fragment key={option.id}>
              {index > 0 && <div className="w-px h-4 bg-zinc-700 mx-0.5 sm:mx-1 shrink-0" />}
              <button
                type="button"
                data-testid={`thematic-layer-${option.id}`}
                disabled={disabled}
                onClick={() => onLayerChange(option.id)}
                aria-pressed={isActive}
                aria-label={`Capa temática: ${option.label} - ${option.description}`}
                title={option.description}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-mono rounded-lg transition-all shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-900 ${
                  isActive
                    ? `border ${option.activeClasses}`
                    : `text-zinc-400 border border-transparent ${option.hoverClasses}`
                } ${disabled ? 'cursor-not-allowed' : ''}`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{option.label}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
