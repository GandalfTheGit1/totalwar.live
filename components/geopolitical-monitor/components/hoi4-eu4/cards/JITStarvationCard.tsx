import React from 'react';
import { BaseCardProps } from './types';

export const JITStarvationCard: React.FC<BaseCardProps> = ({ mechanics, countryMechanics }) => {
  if (countryMechanics) {
    const { importBufferMonths, isImportStarved } = countryMechanics;
    const badge = isImportStarved ? '🔴 STARVED' : 'BUFFER OK';
    const badgeColor = isImportStarved ? 'text-red-400 bg-red-400/10' : 'text-emerald-400 bg-emerald-400/10';

    return (
      <div className="bg-slate-900 p-3 rounded-lg border border-slate-700/50 mb-2">
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1">
            <span>🏭</span> Import Starvation
          </h4>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badgeColor}`}>
            {badge}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mb-2">Import buffer threshold: 2.0 months.</p>
        <div className="flex justify-between text-[11px] font-mono text-slate-300">
          <span>Import Buffer:</span>
          <span className={isImportStarved ? 'text-red-400' : 'text-emerald-400'}>
            {importBufferMonths.toFixed(1)} mo
          </span>
        </div>
      </div>
    );
  }

  const { isStarved } = mechanics.jitStarvation;
  const badge = isStarved ? '🔴 STARVED' : 'BUFFER OK';
  const badgeColor = isStarved ? 'text-red-400 bg-red-400/10' : 'text-emerald-400 bg-emerald-400/10';

  return (
    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700/50 mb-2">
      <div className="flex justify-between items-center mb-1">
        <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1">
          <span>🏭</span> JIT Starvation
        </h4>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badgeColor}`}>
          {badge}
        </span>
      </div>
      <p className="text-[10px] text-slate-400 mb-2">Disruption exceeds inventory buffers.</p>
    </div>
  );
};
