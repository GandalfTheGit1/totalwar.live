import React from 'react';
import { BaseCardProps } from './types';

export const CommodityDepletionCard: React.FC<BaseCardProps> = ({ mechanics, countryMechanics }) => {
  if (countryMechanics) {
    const { dutchDiseaseRisk, primaryCommodityType } = countryMechanics;
    const badgeColor = dutchDiseaseRisk === 'HIGH'
      ? 'text-red-400 bg-red-400/10'
      : dutchDiseaseRisk === 'MEDIUM'
      ? 'text-amber-400 bg-amber-400/10'
      : 'text-emerald-400 bg-emerald-400/10';

    return (
      <div className="bg-slate-900 p-3 rounded-lg border border-slate-700/50 mb-2">
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1">
            <span>🛢️</span> Commodity Depletion
          </h4>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badgeColor}`}>
            RISK: {dutchDiseaseRisk}
          </span>
        </div>
        <div className="flex justify-between text-[11px] font-mono text-slate-300 mt-2">
          <span>Primary Export:</span>
          <span>{primaryCommodityType}</span>
        </div>
      </div>
    );
  }

  const { depletionProbability, yearsToExhaustion, cogsSpikeRisk } = mechanics.depletion;
  const badgeColor = cogsSpikeRisk === 'HIGH'
    ? 'text-red-400 bg-red-400/10'
    : cogsSpikeRisk === 'MEDIUM'
    ? 'text-amber-400 bg-amber-400/10'
    : 'text-emerald-400 bg-emerald-400/10';

  return (
    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700/50 mb-2">
      <div className="flex justify-between items-center mb-1">
        <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1">
          <span>🛢️</span> Commodity Depletion
        </h4>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badgeColor}`}>
          RISK: {cogsSpikeRisk}
        </span>
      </div>
      <div className="flex justify-between text-[11px] font-mono text-slate-300 mt-2">
        <span>Depletion Prob: {(depletionProbability * 100).toFixed(1)}%</span>
        <span>Exhausts in: {yearsToExhaustion.toFixed(1)}y</span>
      </div>
    </div>
  );
};
