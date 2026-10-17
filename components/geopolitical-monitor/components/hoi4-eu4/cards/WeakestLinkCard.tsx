import React from 'react';
import { BaseCardProps } from './types';

export const WeakestLinkCard: React.FC<BaseCardProps> = ({ mechanics, countryMechanics }) => {
  if (countryMechanics) {
    const { weakestLinkScore, bottleneckDimension, revenueCeilingMultiplier } = countryMechanics;
    
    return (
      <div className="bg-slate-900 p-3 rounded-lg border border-slate-700/50 mb-2">
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1">
            <span>🔗</span> Weakest Link
          </h4>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-amber-400 bg-amber-400/10">
            LPI {weakestLinkScore.toFixed(1)}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mb-2">Bottleneck: {bottleneckDimension}</p>
        <div className="flex justify-between text-[11px] font-mono text-slate-300 mt-2">
          <span>Rev Ceiling:</span>
          <span>{(revenueCeilingMultiplier * 100).toFixed(0)}%</span>
        </div>
      </div>
    );
  }

  const { bottleneckScore, revenueCeilingMultiplier } = mechanics.weakestLink;
  
  return (
    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700/50 mb-2">
      <div className="flex justify-between items-center mb-1">
        <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1">
          <span>🔗</span> Weakest Link
        </h4>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-amber-400 bg-amber-400/10">
          LPI {bottleneckScore.toFixed(1)}
        </span>
      </div>
      <div className="flex justify-between text-[11px] font-mono text-slate-300 mt-2">
        <span>Rev Ceiling:</span>
        <span>{(revenueCeilingMultiplier * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
};
