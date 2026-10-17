'use client';

import React from 'react';

interface DrawerFooterProps {
  onClose: () => void;
}

export function DrawerFooter({ onClose }: DrawerFooterProps) {
  return (
    <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0 font-mono text-[11px]">
      <div className="text-slate-400 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-teal-400" />
        <span>Motor determinista: 0 tokens LLM consumidos</span>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer border border-slate-600"
      >
        Aceptar & Cerrar
      </button>
    </div>
  );
}
