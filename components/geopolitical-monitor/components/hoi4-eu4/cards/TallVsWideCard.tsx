import React from 'react';
import { BaseCardProps } from './types';

export const TallVsWideCard: React.FC<BaseCardProps> = ({ mechanics, countryMechanics }) => {
  if (countryMechanics) {
    const { geographicMode, sprawlPenaltyScore } = countryMechanics;
    let badgeColor = 'text-slate-400 bg-slate-800';
    if (geographicMode === 'TALL') badgeColor = 'text-emerald-400 bg-emerald-400/10';
    if (geographicMode === 'WIDE') badgeColor = 'text-amber-400 bg-amber-400/10';

    return (
      <div className="bg-slate-900 p-3 rounded-lg border border-slate-700/50 mb-2">
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1">
            <span>📏</span> Geographic Sprawl
          </h4>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badgeColor}`}>
            {geographicMode}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 mb-1">GDP/Capita & Urbanization Context.</p>
        <div className="flex justify-between text-[11px] font-mono text-slate-300 mt-2">
          <span>Sprawl Penalty Score:</span>
          <span>{sprawlPenaltyScore.toFixed(1)} / 100</span>
        </div>
      </div>
    );
  }

  const { mode, sprawlPenaltyBps } = mechanics.tallVsWide;
  let badgeColor = 'text-slate-400 bg-slate-800';
  if (mode === 'TALL') badgeColor = 'text-emerald-400 bg-emerald-400/10';
  if (mode === 'WIDE') badgeColor = 'text-amber-400 bg-amber-400/10';

  return (
    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700/50 mb-2">
      <div className="flex justify-between items-center mb-1">
        <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1">
          <span>📏</span> Sprawl (Tall vs Wide)
        </h4>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badgeColor}`}>
          {mode}
        </span>
      </div>
      <div className="flex justify-between text-[11px] font-mono text-slate-300 mt-2">
        <span>Penalty:</span>
        <span>{sprawlPenaltyBps.toFixed(1)} bps</span>
      </div>
    </div>
  );
};
