import React from 'react';
import { BaseCardProps } from './types';

export const RetoolingPenaltyCard: React.FC<BaseCardProps> = ({ mechanics, countryMechanics }) => {
  if (countryMechanics) {
    const { industrialChangePct, isInTransition } = countryMechanics;
    const badge = isInTransition ? 'TRANSITIONING' : 'STABLE';
    const badgeColor = isInTransition ? 'text-amber-400 bg-amber-400/10' : 'text-emerald-400 bg-emerald-400/10';

    return (
      <div className="bg-slate-900 p-3 rounded-lg border border-slate-700/50 mb-2">
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1">
            <span>⚙️</span> Industrial Transition
          </h4>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badgeColor}`}>
            {badge}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mb-2">YoY manufacturing capacity change.</p>
        <div className="flex justify-between text-[11px] font-mono text-slate-300">
          <span>Industrial Change:</span>
          <span className={isInTransition ? 'text-amber-400' : 'text-slate-300'}>
            {industrialChangePct.toFixed(1)}%
          </span>
        </div>
      </div>
    );
  }

  const { currentCompressionBps, isInRetoolingPhase } = mechanics.retooling;
  const badge = isInRetoolingPhase ? 'RETOOLING' : 'STABLE';
  const badgeColor = isInRetoolingPhase ? 'text-amber-400 bg-amber-400/10' : 'text-emerald-400 bg-emerald-400/10';

  return (
    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700/50 mb-2">
      <div className="flex justify-between items-center mb-1">
        <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1">
          <span>⚙️</span> Retooling Penalty
        </h4>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badgeColor}`}>
          {badge}
        </span>
      </div>
      <p className="text-[10px] text-slate-400 mb-2">Margin compression from shifting production.</p>
      <div className="flex justify-between text-[11px] font-mono text-slate-300">
        <span>Compression:</span>
        <span className={isInRetoolingPhase ? 'text-amber-400' : 'text-slate-300'}>
          {currentCompressionBps.toFixed(1)} bps
        </span>
      </div>
    </div>
  );
};
