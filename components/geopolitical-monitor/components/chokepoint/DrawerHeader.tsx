'use client';

import React from 'react';
import { Ship, X } from 'lucide-react';

interface DrawerHeaderProps {
  onClose: () => void;
}

export function DrawerHeader({ onClose }: DrawerHeaderProps) {
  return (
    <div className="p-3.5 sm:p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-600 flex items-center justify-center text-amber-400 shadow-inner">
          <Ship className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
              T03.5 LOGÍSTICA NAVAL
            </span>
            <h2
              id="chokepoint-drawer-title"
              className="text-base sm:text-lg font-black font-mono tracking-wider text-slate-100 uppercase"
            >
              Simulador de Bloqueo de Chokepoints
            </h2>
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            Cálculo determinista de sobrecostes de flete sobre COGS, retrasos de tránsito y compresión de margen bruto.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          data-testid="close-chokepoint-drawer"
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
          title="Cerrar simulador (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
