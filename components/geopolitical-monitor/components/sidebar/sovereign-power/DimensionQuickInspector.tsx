import React from 'react';
import {
  ChevronDown,
  ChevronUp,
  Cpu,
  Users,
  DollarSign,
  ShoppingCart,
  Shield,
  Building2,
} from 'lucide-react';
import type { SovereignDimensionKey } from '@/lib/types/sovereign-power';

interface DimensionQuickInspectorProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  selectedDimension: SovereignDimensionKey;
  setSelectedDimension: (val: SovereignDimensionKey) => void;
  profile: any;
  onOpenWarRoom: () => void;
}

const DIMENSION_ICONS: Record<SovereignDimensionKey, any> = {
  techInnovation: Cpu,
  politicalCabinet: Users,
  currencyHegemony: DollarSign,
  tradeCompetitiveness: ShoppingCart,
  militaryCapacity: Shield,
  institutionalStability: Building2,
};

const DIMENSION_TAGS: Record<SovereignDimensionKey, string> = {
  techInnovation: 'TEC',
  politicalCabinet: 'POL',
  currencyHegemony: 'DIV',
  tradeCompetitiveness: 'COM',
  militaryCapacity: 'MIL',
  institutionalStability: 'EST',
};

const ALL_DIMENSIONS: SovereignDimensionKey[] = [
  'techInnovation',
  'politicalCabinet',
  'currencyHegemony',
  'tradeCompetitiveness',
  'militaryCapacity',
  'institutionalStability',
];

function renderPrimaryDimensions(selectedDimension: SovereignDimensionKey, profile: any) {
  if (selectedDimension === 'techInnovation') {
    return (
      <div>
        <span className="text-teal-400 font-bold block mb-1">Tecnología e IA ({profile.baseScores.techInnovation}/100)</span>
        <p className="text-[11px] text-zinc-400 leading-snug">{profile.dossiers.tech.summary}</p>
        <p className="text-[10px] text-zinc-500 mt-1">Nodo: {profile.dossiers.tech.subsectors.semiconductors.fabricationNode}</p>
      </div>
    );
  }
  if (selectedDimension === 'politicalCabinet') {
    return (
      <div>
        <span className="text-purple-400 font-bold block mb-1">Gabinete ({profile.baseScores.politicalCabinet}/100)</span>
        <p className="text-[11px] text-zinc-300">Mandatario: {profile.dossiers.cabinet.headOfState.name} ({profile.dossiers.cabinet.headOfState.faction})</p>
        <p className="text-[10px] text-zinc-400 mt-1">Doctrina: &ldquo;{profile.dossiers.cabinet.activeDoctrine}&rdquo;</p>
      </div>
    );
  }
  if (selectedDimension === 'currencyHegemony') {
    return (
      <div>
        <span className="text-emerald-400 font-bold block mb-1">Moneda & Dalio ({profile.baseScores.currencyHegemony}/100)</span>
        <p className="text-[11px] text-zinc-300">Divisa: {profile.dossiers.currency.currencyCode} (Reservas COFER: {profile.dossiers.currency.globalReserveSharePercent}%)</p>
        <p className="text-[10px] text-zinc-400 mt-1">{profile.dossiers.currency.dalioSpread.verdictEs}</p>
      </div>
    );
  }
  return null;
}

function renderSecondaryDimensions(selectedDimension: SovereignDimensionKey, profile: any) {
  if (selectedDimension === 'tradeCompetitiveness') {
    const bal = profile.dossiers.trade.tradeBalanceBillionUSD;
    const balText = bal >= 0 ? `+$${bal}B` : `-$${Math.abs(bal)}B`;
    return (
      <div>
        <span className="text-cyan-400 font-bold block mb-1">Comercio ({profile.baseScores.tradeCompetitiveness}/100)</span>
        <p className="text-[11px] text-zinc-300">Balanza: {balText}</p>
        <p className="text-[10px] text-zinc-400 mt-1">Socio Top: {profile.dossiers.trade.topExportPartners[0]?.countryName || 'N/A'}</p>
      </div>
    );
  }
  if (selectedDimension === 'militaryCapacity') {
    return (
      <div>
        <span className="text-rose-400 font-bold block mb-1">Militar ({profile.baseScores.militaryCapacity}/100)</span>
        <p className="text-[11px] text-zinc-300">Presupuesto: ${profile.dossiers.military.defenseBudgetBillionUSD}B ({profile.dossiers.military.defenseBudgetGdpPercent}% PIB)</p>
        <p className="text-[10px] text-zinc-400 mt-1">Arsenal Nuclear: {profile.dossiers.military.nuclearDeterrence.warheadCount} ojivas ({profile.dossiers.military.nuclearDeterrence.doctrineStatus})</p>
      </div>
    );
  }
  return (
    <div>
      <span className="text-amber-400 font-bold block mb-1">Estado de Derecho ({profile.baseScores.institutionalStability}/100)</span>
      <p className="text-[11px] text-zinc-300">Rule of Law: {profile.dossiers.stability.ruleOfLawScore}/100</p>
      <p className="text-[10px] text-zinc-400 mt-1">Riesgo Golpe / Fractura: {profile.dossiers.stability.coupOrFractureRiskPercent}%</p>
    </div>
  );
}

function DimensionSnapshot({
  selectedDimension,
  profile,
}: {
  selectedDimension: SovereignDimensionKey;
  profile: any;
}) {
  const primary = renderPrimaryDimensions(selectedDimension, profile);
  if (primary) return primary;
  return renderSecondaryDimensions(selectedDimension, profile);
}

export function DimensionQuickInspector({
  isOpen,
  setIsOpen,
  selectedDimension,
  setSelectedDimension,
  profile,
  onOpenWarRoom,
}: DimensionQuickInspectorProps) {
  const Icon = DIMENSION_ICONS[selectedDimension] || Cpu;

  return (
    <div className="bg-zinc-900/60 rounded-lg border border-zinc-800 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2.5 flex items-center justify-between text-xs font-mono font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-teal-400" />
          <span>Inspección de Dimensión: {selectedDimension}</span>
        </div>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {isOpen && (
        <div className="p-3 border-t border-zinc-800 bg-zinc-950/80 space-y-3">
          <div className="grid grid-cols-6 gap-1 font-mono text-[9px]">
            {ALL_DIMENSIONS.map((dimKey) => {
              const isSelected = selectedDimension === dimKey;
              return (
                <button
                  key={dimKey}
                  type="button"
                  onClick={() => setSelectedDimension(dimKey)}
                  className={`p-1 text-center rounded border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-500/20 text-teal-300 border-teal-400 font-bold'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  [{DIMENSION_TAGS[dimKey]}]
                </button>
              );
            })}
          </div>

          <div className="text-xs font-mono text-zinc-300 bg-zinc-900/70 p-2.5 rounded border border-zinc-800">
            <DimensionSnapshot selectedDimension={selectedDimension} profile={profile} />
            <button
              type="button"
              onClick={onOpenWarRoom}
              className="mt-2.5 w-full py-1 text-[10px] font-mono text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded cursor-pointer transition-colors"
            >
              Abrir Dossier Completo en Sala de Mando ↗
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
