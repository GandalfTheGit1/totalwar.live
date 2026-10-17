import React from 'react';
import { BaseCardProps } from './types';

export const CapExTrapCard: React.FC<BaseCardProps> = ({ mechanics, countryMechanics }) => {
  if (countryMechanics) {
    const { isCapExCannibalized, publicCapExGapPct } = countryMechanics;
    const badge = isCapExCannibalized ? '🔴 DEFICIT' : 'ADEQUATE';
    const badgeColor = isCapExCannibalized ? 'text-red-400 bg-red-400/10' : 'text-emerald-400 bg-emerald-400/10';

    return (
      <div className="bg-slate-900 p-3 rounded-lg border border-slate-700/50 mb-2">
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1">
            <span>📉</span> Public CapEx Trap
          </h4>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badgeColor}`}>
            {badge}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mb-2">Gross Fixed Capital Formation deficit.</p>
        <div className="flex justify-between text-[11px] font-mono text-slate-300">
          <span>Public CapEx Gap:</span>
          <span className={isCapExCannibalized ? 'text-red-400' : 'text-emerald-400'}>
            {publicCapExGapPct.toFixed(1)}%
          </span>
        </div>
      </div>
    );
  }

  const { isCannibalized, maintenanceCapExDeficit } = mechanics.capexTrap;
  const badge = isCannibalized ? '🔴 CANNIBALIZED' : 'FUNDED';
  const badgeColor = isCannibalized ? 'text-red-400 bg-red-400/10' : 'text-emerald-400 bg-emerald-400/10';

  return (
    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700/50 mb-2">
      <div className="flex justify-between items-center mb-1">
        <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1">
          <span>📉</span> CapEx Trap
        </h4>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badgeColor}`}>
          {badge}
        </span>
      </div>
      <p className="text-[10px] text-slate-400 mb-2">Debt service starves maintenance.</p>
      <div className="flex justify-between text-[11px] font-mono text-slate-300">
        <span>Deficit:</span>
        <span className={isCannibalized ? 'text-red-400' : 'text-emerald-400'}>
          ${(maintenanceCapExDeficit / 1000).toFixed(1)}k
        </span>
      </div>
    </div>
  );
};
