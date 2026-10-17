'use client';

import React from 'react';
import { Zap, Radio } from 'lucide-react';
import {
  MaritimeChokepointId,
  MaritimeIndustrySector,
  CHOKEPOINT_PRESETS,
  SECTOR_PROFILES,
} from '@/lib/services/maritime-chokepoint-service';

interface PresetsAndSectorSectionProps {
  blockedChokepoints: MaritimeChokepointId[];
  onSetBlockedChokepoints: (list: MaritimeChokepointId[]) => void;
  selectedSector: MaritimeIndustrySector;
  onSelectSector: (sector: MaritimeIndustrySector) => void;
}

export function PresetsAndSectorSection({
  blockedChokepoints,
  onSetBlockedChokepoints,
  selectedSector,
  onSelectSector,
}: PresetsAndSectorSectionProps) {
  const currentBlockedSet = new Set(blockedChokepoints);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      {/* Presets de Simulación */}
      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
        <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" /> Presets Tácticos Rápidos
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {CHOKEPOINT_PRESETS.map((preset) => {
            const isCurrent =
              preset.blockedChokepoints.length === currentBlockedSet.size &&
              preset.blockedChokepoints.every((id) => currentBlockedSet.has(id));
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onSetBlockedChokepoints(preset.blockedChokepoints);
                  onSelectSector(preset.recommendedSector);
                }}
                className={`p-1.5 rounded-lg text-[10px] font-bold text-left transition-all border cursor-pointer truncate ${
                  isCurrent
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-slate-700/60'
                }`}
                title={preset.description}
              >
                <div className="truncate">{preset.nameEs}</div>
                <div className="text-[9px] text-slate-500 font-normal mt-0.5">
                  {preset.blockedChokepoints.length} estrechos
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selector de Industria Calibrada */}
      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
        <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-teal-400" /> Matriz Sectorial Calibrada
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {Object.values(SECTOR_PROFILES).map((prof) => {
            const isSelected = selectedSector === prof.sector;
            return (
              <button
                key={prof.sector}
                type="button"
                onClick={() => onSelectSector(prof.sector)}
                className={`p-2 rounded-lg text-left transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/60 shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-slate-700/60'
                }`}
              >
                <div className="font-bold text-[11px] truncate">{prof.labelEs}</div>
                <div className="flex items-center justify-between text-[9px] text-slate-500 mt-1">
                  <span>Margen: {prof.grossMarginPct}%</span>
                  <span>Flete COGS: {prof.freightShareInCogsPct}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
