import React from 'react';
import { BaseCardProps } from './types';

function SovereignBankruptcyCard({ countryMechanics }: { countryMechanics: any }) {
  const { sovereignICR, sovereignDistressScore, sovereignICRBreached } = countryMechanics;
  let badge = 'SOLVENT';
  let badgeColor = 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
  if (sovereignICRBreached) {
    badge = 'INSOLVENT';
    badgeColor = 'text-red-400 bg-red-400/10 border-red-400/20';
  } else if (sovereignDistressScore > 0) {
    badge = 'DISTRESSED';
    badgeColor = 'text-amber-400 bg-amber-400/10 border-amber-400/20';
  }

  return (
    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700/50 mb-2">
      <div className="flex justify-between items-center mb-1">
        <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1">
          <span>🌀</span> Sovereign Debt Spiral
        </h4>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${badgeColor}`}>
          {badge}
        </span>
      </div>
      <p className="text-[10px] text-slate-400 mb-2">ICR falls, capital cost rises.</p>
      <div className="flex justify-between text-[11px] font-mono text-slate-300">
        <span>Sovereign ICR: {sovereignICR.toFixed(2)}</span>
        <span>Distress: {sovereignDistressScore.toFixed(0)}%</span>
      </div>
      <div className="h-1 bg-slate-800 mt-1 rounded overflow-hidden">
        <div className="h-full bg-red-500" style={{ width: `${sovereignDistressScore}%` }} />
      </div>
    </div>
  );
}

function CorporateBankruptcyCard({ mechanics }: { mechanics: any }) {
  const { icr, distressScore } = mechanics.bankruptcy;
  let badge = 'SOLVENT';
  let badgeColor = 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
  if (icr < 1.0) {
    badge = 'INSOLVENT';
    badgeColor = 'text-red-400 bg-red-400/10 border-red-400/20';
  } else if (distressScore > 0) {
    badge = 'DISTRESSED';
    badgeColor = 'text-amber-400 bg-amber-400/10 border-amber-400/20';
  }

  return (
    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700/50 mb-2">
      <div className="flex justify-between items-center mb-1">
        <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1">
          <span>🌀</span> Bankruptcy Spiral
        </h4>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${badgeColor}`}>
          {badge}
        </span>
      </div>
      <p className="text-[10px] text-slate-400 mb-2">ICR falls, capital cost rises.</p>
      <div className="flex justify-between text-[11px] font-mono text-slate-300">
        <span>ICR: {icr.toFixed(2)}</span>
        <span>Distress: {distressScore.toFixed(0)}%</span>
      </div>
      <div className="h-1 bg-slate-800 mt-1 rounded overflow-hidden">
        <div className="h-full bg-red-500" style={{ width: `${distressScore}%` }} />
      </div>
    </div>
  );
}

export const BankruptcySpiralCard: React.FC<BaseCardProps> = ({ mechanics, countryMechanics }) => {
  if (countryMechanics) {
    return <SovereignBankruptcyCard countryMechanics={countryMechanics} />;
  }
  return <CorporateBankruptcyCard mechanics={mechanics} />;
};
