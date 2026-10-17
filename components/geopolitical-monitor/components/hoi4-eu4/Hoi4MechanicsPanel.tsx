'use client';

import React from 'react';
import { useHoi4Mechanics } from '../../hooks/useHoi4Mechanics';
import { BankruptcySpiralCard } from './cards/BankruptcySpiralCard';
import { JITStarvationCard } from './cards/JITStarvationCard';
import { CapExTrapCard } from './cards/CapExTrapCard';
import { RetoolingPenaltyCard } from './cards/RetoolingPenaltyCard';
import { TallVsWideCard } from './cards/TallVsWideCard';
import { CommodityDepletionCard } from './cards/CommodityDepletionCard';
import { WeakestLinkCard } from './cards/WeakestLinkCard';
import { NodeAttritionCard } from './cards/NodeAttritionCard';

export * from './cards/types';
export {
  BankruptcySpiralCard,
  JITStarvationCard,
  CapExTrapCard,
  RetoolingPenaltyCard,
  TallVsWideCard,
  CommodityDepletionCard,
  WeakestLinkCard,
  NodeAttritionCard
};

export interface Hoi4MechanicsPanelProps {
  selectedCountryCode?: string | null;
}

export const Hoi4MechanicsPanel: React.FC<Hoi4MechanicsPanelProps> = ({ selectedCountryCode = null }) => {
  const { mechanics, countryMechanics, isLoadingTension, isLoadingCountry } = useHoi4Mechanics({}, selectedCountryCode);

  if (isLoadingTension || isLoadingCountry) {
    return <div className="text-xs text-slate-500 p-4 animate-pulse">Loading intel...</div>;
  }

  if (!selectedCountryCode) {
    return (
      <div className="mt-4 pt-4 border-t border-slate-800">
        <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest mb-3 flex items-center gap-2">
          <span>⚔️</span> Operational Intelligence
        </h3>
        <p className="text-xs text-slate-400 italic text-center p-4">
          Select a country on the map to view its Operational Intelligence
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-slate-800">
      <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest mb-3 flex items-center gap-2">
        <span>⚔️</span> Operational Intelligence
      </h3>
      
      {countryMechanics && (
        <div className="mb-3 text-[10px] font-mono rounded bg-slate-800/50 p-2 text-center border border-slate-700">
          {countryMechanics.dataSource === 'worldbank' ? (
            <span className="text-emerald-400">🌍 World Bank Data</span>
          ) : (
            <span className="text-amber-400">
              ⚡ Fallback Data {countryMechanics.fallbackReason ? `(${countryMechanics.fallbackReason})` : ''}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <BankruptcySpiralCard mechanics={mechanics} countryMechanics={countryMechanics} />
        <JITStarvationCard mechanics={mechanics} countryMechanics={countryMechanics} />
        <CapExTrapCard mechanics={mechanics} countryMechanics={countryMechanics} />
        <RetoolingPenaltyCard mechanics={mechanics} countryMechanics={countryMechanics} />
        <TallVsWideCard mechanics={mechanics} countryMechanics={countryMechanics} />
        <CommodityDepletionCard mechanics={mechanics} countryMechanics={countryMechanics} />
        <WeakestLinkCard mechanics={mechanics} countryMechanics={countryMechanics} />
        <NodeAttritionCard mechanics={mechanics} countryMechanics={countryMechanics} />
      </div>
    </div>
  );
};
