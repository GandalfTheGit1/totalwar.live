'use client';

import React from 'react';
import { 
  CountrySovereignPowerProfile, 
  SovereignDimensionKey,
  WargameSimulationResult
} from '@/lib/types/sovereign-power';
import { TechInnovationPanel } from './TechInnovationPanel';
import { CabinetDossierPanel } from './CabinetDossierPanel';
import { CurrencyHegemonyPanel } from './CurrencyHegemonyPanel';
import { TradeCompetitivenessPanel } from './TradeCompetitivenessPanel';
import { MilitaryCapacityPanel } from './MilitaryCapacityPanel';
import { InstitutionalStabilityPanel } from './InstitutionalStabilityPanel';
import { 
  Cpu, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  Shield, 
  Building2 
} from 'lucide-react';

interface DimensionDetailViewProps {
  profile: CountrySovereignPowerProfile;
  selectedDimension: SovereignDimensionKey;
  onSelectDimension: (dim: SovereignDimensionKey) => void;
  onAppointReplacement?: (role: 'DEFENSE' | 'FINANCE' | 'FOREIGN_SECURITY', candidateId: string) => void;
  appointedReplacements?: Partial<Record<'DEFENSE' | 'FINANCE' | 'FOREIGN_SECURITY', string>>;
  onResetCabinet?: () => void;
  warpedDalioSpread?: WargameSimulationResult['warpedDalioSpread'];
}

const TABS: { key: SovereignDimensionKey; label: string; icon: any; tag: string }[] = [
  { key: 'techInnovation', label: 'Tecnología e IA', icon: Cpu, tag: 'TEC' },
  { key: 'politicalCabinet', label: 'Política y Gabinete', icon: Users, tag: 'POL' },
  { key: 'currencyHegemony', label: 'Moneda y Dalio', icon: DollarSign, tag: 'DIV' },
  { key: 'tradeCompetitiveness', label: 'Comercio Exterior', icon: ShoppingCart, tag: 'COM' },
  { key: 'militaryCapacity', label: 'Capacidad Militar', icon: Shield, tag: 'MIL' },
  { key: 'institutionalStability', label: 'Estado de Derecho', icon: Building2, tag: 'EST' },
];

export const DimensionDetailView: React.FC<DimensionDetailViewProps> = ({
  profile,
  selectedDimension,
  onSelectDimension,
  onAppointReplacement,
  appointedReplacements,
  onResetCabinet,
  warpedDalioSpread
}) => {
  const { dossiers } = profile;

  return (
    <div className="space-y-4">
      {/* ── Dimension Selector Tab Pills ── */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-1 bg-zinc-950/90 rounded-lg border border-zinc-800">
        {TABS.map(({ key, label, icon: Icon, tag }) => {
          const isSelected = selectedDimension === key;
          const score = profile.baseScores[key];

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDimension(key)}
              className={`p-2 rounded flex flex-col items-center justify-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-teal-500/20 border border-teal-400 text-teal-300 shadow-[0_0_12px_rgba(20,184,166,0.35)]'
                  : 'bg-zinc-900/50 hover:bg-zinc-800/60 text-zinc-400 border border-transparent'
              }`}
              title={label}
            >
              <div className="flex items-center gap-1">
                <Icon className="w-3 h-3" />
                <span className="text-[10px] font-mono font-bold">[{tag}]</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-500 font-bold mt-0.5">
                {Math.round(score)}/100
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Modular Dimension Panels ── */}
      {selectedDimension === 'techInnovation' && (
        <TechInnovationPanel dossier={dossiers.tech} countryCode={profile.countryCode} />
      )}

      {selectedDimension === 'politicalCabinet' && (
        <CabinetDossierPanel 
          dossier={dossiers.cabinet}
          onAppointReplacement={onAppointReplacement}
          appointedReplacements={appointedReplacements}
          onResetCabinet={onResetCabinet}
        />
      )}

      {selectedDimension === 'currencyHegemony' && (
        <CurrencyHegemonyPanel 
          dossier={dossiers.currency} 
          warpedDalioSpread={warpedDalioSpread}
        />
      )}

      {selectedDimension === 'tradeCompetitiveness' && (
        <TradeCompetitivenessPanel dossier={dossiers.trade} />
      )}

      {selectedDimension === 'militaryCapacity' && (
        <MilitaryCapacityPanel dossier={dossiers.military} />
      )}

      {selectedDimension === 'institutionalStability' && (
        <InstitutionalStabilityPanel dossier={dossiers.stability} />
      )}
    </div>
  );
};
