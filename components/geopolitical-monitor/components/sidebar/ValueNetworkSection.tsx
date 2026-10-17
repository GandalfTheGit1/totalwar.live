import React from 'react';
import { Network } from 'lucide-react';
import { ActiveRelationsMap } from '../../types';

export function ValueNetworkSection({ activeRelations }: { activeRelations?: ActiveRelationsMap | Record<string, any> | null }) {
  if (!activeRelations || typeof activeRelations !== 'object' || Object.keys(activeRelations).length === 0) return null;

  return (
    <div className="p-4 bg-zinc-850/80 rounded-xl border border-teal-500/20 shadow-[0_0_20px_rgba(20,184,166,0.06)]">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Network className="w-4 h-4 text-teal-400" /> Cadena de Suministro
          </span>
          <span className="text-xs text-zinc-400 mt-0.5 block">Interconexión y dependencias de nodos</span>
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-zinc-700/60 animate-in fade-in slide-in-from-top-2">
        <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-2 font-bold font-mono">
          Matriz Bilateral Relacional ({Object.keys(activeRelations).length} enlaces)
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="col-span-2 flex items-center gap-2 bg-zinc-800/60 p-1.5 rounded border border-zinc-700/40">
            <div className="w-2.5 h-2.5 bg-sky-400 rounded-sm ring-1 ring-sky-400/50 shadow-[0_0_8px_rgba(56,189,248,0.5)]"></div>
            <span className="text-zinc-200 font-medium">Nodo Central</span>
          </div>
          <div className="flex items-center gap-2 bg-zinc-800/60 p-1.5 rounded border border-zinc-700/40">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></div>
            <span className="text-zinc-300 font-medium">Aliados / Proveedores</span>
          </div>
          <div className="flex items-center gap-2 bg-zinc-800/60 p-1.5 rounded border border-zinc-700/40">
            <div className="w-2.5 h-2.5 bg-indigo-400 rounded-sm ring-1 ring-indigo-400/50 shadow-[0_0_8px_rgba(129,140,248,0.5)]"></div>
            <span className="text-zinc-300 font-medium">Socios Económicos</span>
          </div>
          <div className="flex items-center gap-2 bg-zinc-800/60 p-1.5 rounded border border-zinc-700/40">
            <div className="w-2.5 h-2.5 bg-rose-500 rounded-sm"></div>
            <span className="text-zinc-300 font-medium">Fricción Comercial</span>
          </div>
          <div className="flex items-center gap-2 bg-zinc-800/60 p-1.5 rounded border border-zinc-700/40">
            <div className="w-2.5 h-2.5 bg-amber-500 rounded-sm"></div>
            <span className="text-zinc-300 font-medium">En Observación</span>
          </div>
        </div>
      </div>
    </div>
  );
}
