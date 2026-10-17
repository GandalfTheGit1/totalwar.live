import React from 'react';
import { BaseCardProps } from './types';

export const NodeAttritionCard: React.FC<BaseCardProps> = ({ mechanics, countryMechanics }) => {
  if (countryMechanics) {
    const { attritionRisk, infrastructureQuality } = countryMechanics;
    let badgeColor = 'text-emerald-400 bg-emerald-400/10';
    if (attritionRisk === 'CRITICAL') badgeColor = 'text-red-400 bg-red-400/10';
    else if (attritionRisk === 'HIGH') badgeColor = 'text-amber-400 bg-amber-400/10';
    else if (attritionRisk === 'MEDIUM') badgeColor = 'text-yellow-400 bg-yellow-400/10';

    return (
      <div className="bg-slate-900 p-3 rounded-lg border border-slate-700/50 mb-2">
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1">
            <span>⚓</span> Node Attrition
          </h4>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badgeColor}`}>
            {attritionRisk}
          </span>
        </div>
        <div className="flex justify-between text-[11px] font-mono text-slate-300 mt-2">
          <span>Infra Quality:</span>
          <span>{infrastructureQuality.toFixed(2)} (LPI)</span>
        </div>
      </div>
    );
  }

  const { attritionRisk, dioPenaltyMultiplier } = mechanics.nodeAttrition;
  let badgeColor = 'text-emerald-400 bg-emerald-400/10';
  if (attritionRisk === 'CRITICAL') badgeColor = 'text-red-400 bg-red-400/10';
  else if (attritionRisk === 'HIGH') badgeColor = 'text-amber-400 bg-amber-400/10';
  else if (attritionRisk === 'MEDIUM') badgeColor = 'text-yellow-400 bg-yellow-400/10';

  return (
    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700/50 mb-2">
      <div className="flex justify-between items-center mb-1">
        <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1">
          <span>⚓</span> Node Attrition
        </h4>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badgeColor}`}>
          {attritionRisk}
        </span>
      </div>
      <div className="flex justify-between text-[11px] font-mono text-slate-300 mt-2">
        <span>DIO Penalty:</span>
        <span>{dioPenaltyMultiplier}x</span>
      </div>
    </div>
  );
};
