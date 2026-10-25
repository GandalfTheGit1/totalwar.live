'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

import { DimensionSection } from './DimensionSection';
import { NewsPanel } from './NewsPanel';

// Hooks
import { useLlmCausalAnalysis } from '../hooks/useLlmCausalAnalysis';
import { useCountryVideos } from '../hooks/useCountryVideos';
import { useHoi4Mechanics } from '../hooks/useHoi4Mechanics';

// Sidebar sub-components
import { ValueNetworkSection } from './sidebar/ValueNetworkSection';
import { TradeDagSection } from './sidebar/TradeDagSection';
import { FriendshoringSection } from './sidebar/FriendshoringSection';
import { CriticalCommodityKey } from '@/lib/services/geographic/friendshoring-service';
import { TacticalLogisticsSection } from './sidebar/TacticalLogisticsSection';
import { PmiActivitySection } from './sidebar/PmiActivitySection';
import { DalioMacroSection } from './sidebar/DalioMacroSection';
import { SovereignMetricsSection } from './sidebar/SovereignMetricsSection';
import { SovereignPowerRadarSection } from './sidebar/SovereignPowerRadarSection';
import { CausalAnalysisSection } from './sidebar/CausalAnalysisSection';
import { VideoBriefingSection } from './sidebar/VideoBriefingSection';
import { Hoi4MechanicsPanel } from './hoi4-eu4/Hoi4MechanicsPanel';

interface GeopoliticalSidebarProps {
  isPanelOpen: boolean;
  activeData: any; // Using any or global types if they exist: CountryRiskInfo | null
  activeMode: 'risk' | 'relations' | 'news';
  activeRelations: any; // ActiveRelationsMap
  onClose: () => void;
  activeMacro: any; // CountryMacroData | null
  isMacroLoading: boolean;
  macroError: string | null;
  selectedCommodity?: CriticalCommodityKey | null;
  onSelectCommodity?: (commodity: CriticalCommodityKey) => void;
  onSelectSubstitute?: (substituteCountryCode: string) => void;
  onOpenSimulationDrawer?: () => void;
  blockedCount?: number;
  simulationResult?: any;
}

export const GeopoliticalSidebar: React.FC<GeopoliticalSidebarProps> = ({
  isPanelOpen,
  activeData,
  activeMode,
  activeRelations,
  onClose,
  activeMacro,
  isMacroLoading,
  macroError,
  selectedCommodity,
  onSelectCommodity,
  onSelectSubstitute,
  onOpenSimulationDrawer,
  blockedCount = 0,
  simulationResult,
}) => {
  const [activeTab, setActiveTab] = useState<'geopolitical' | 'dalio'>('geopolitical');

  // Country Mechanics Hook
  const { countryMechanics } = useHoi4Mechanics({}, activeData?.iso || null);

  // Causal Analysis Hook
  const { llmAnalysis, llmLoading, llmError } = useLlmCausalAnalysis(isPanelOpen, activeData, activeMacro);

  // Video Briefing Hook
  const { 
    countryVideos, 
    videosLoading, 
    videosError, 
    selectedVideoIndex, 
    setSelectedVideoIndex 
  } = useCountryVideos(isPanelOpen, activeData);

  return (
    <div
      className={`fixed right-0 top-[var(--topbar-h,56px)] bottom-0 w-full sm:w-[460px] transform ${
        isPanelOpen ? 'translate-x-0' : 'translate-x-full'
      } transition-transform duration-300 z-30 bg-zinc-900/95 backdrop-blur-2xl border-l border-zinc-700/80 flex flex-col shadow-2xl overflow-hidden`}
    >
      <div className="p-5 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-950/50">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-8 rounded-full"
            style={{ backgroundColor: activeData?.indicator || '#0d9488' }}
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white tracking-tight">{activeData?.name || '---'}</h2>
              <span className="px-2 py-0.5 bg-zinc-800 text-teal-400 text-xs font-mono rounded border border-zinc-700 uppercase font-bold">
                {activeData?.iso || '---'}
              </span>
            </div>
            {/* Interactive Tactical Tabs */}
            <div className="flex items-center gap-1.5 mt-2" aria-label="Secciones del Sidebar">
              <button
                type="button"
                aria-pressed={activeTab === 'geopolitical'}
                onClick={() => setActiveTab('geopolitical')}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-all cursor-pointer ${
                  activeTab === 'geopolitical'
                    ? 'border border-teal-400 bg-teal-500/15 text-teal-300 shadow-[0_0_12px_rgba(20,184,166,0.35)] font-bold'
                    : 'border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                Perfil Geopolítico
              </button>
              <button
                type="button"
                aria-pressed={activeTab === 'dalio'}
                onClick={() => setActiveTab('dalio')}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-all cursor-pointer ${
                  activeTab === 'dalio'
                    ? 'border border-teal-400 bg-teal-500/15 text-teal-300 shadow-[0_0_12px_rgba(20,184,166,0.35)] font-bold'
                    : 'border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                Ciclo Económico Dalio
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg p-2 transition-colors cursor-pointer border border-zinc-700"
          title="Cerrar panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 overflow-y-auto flex-1 space-y-5 custom-scrollbar">
        {activeTab === 'dalio' ? (
          <DalioMacroSection 
            activeMacro={activeMacro} 
            isMacroLoading={isMacroLoading} 
            macroError={macroError} 
          />
        ) : (
          <>
            {activeMode === 'news' ? (
              <NewsPanel iso={activeData?.iso || 'N/A'} name={activeData?.name || ''} />
            ) : (
              <>
                {(activeMode === 'relations' || (activeRelations && Object.keys(activeRelations).length > 0)) && (
                  <>
                    <ValueNetworkSection activeRelations={activeRelations} />
                    <TradeDagSection 
                      countryCode={activeData?.iso || ''} 
                      countryName={activeData?.name || ''} 
                    />
                  </>
                )}

                <TacticalLogisticsSection 
                  countryMechanics={countryMechanics} 
                  iso={activeData?.iso || ''} 
                  onOpenSimulationDrawer={onOpenSimulationDrawer}
                  blockedCount={blockedCount}
                  simulationResult={simulationResult}
                />

                <FriendshoringSection 
                  countryCode={activeData?.iso || 'US'}
                  countryName={activeData?.name || 'Estados Unidos'}
                  selectedCommodity={selectedCommodity || undefined}
                  onSelectCommodity={onSelectCommodity}
                  onSelectSubstitute={onSelectSubstitute}
                />

                <PmiActivitySection activeData={activeData} />

                <div className="space-y-4">
                  <SovereignPowerRadarSection activeData={activeData} />
                  <SovereignMetricsSection activeData={activeData} />
                  <CausalAnalysisSection 
                    llmLoading={llmLoading}
                    llmError={llmError}
                    llmAnalysis={llmAnalysis}
                    activeMacro={activeMacro}
                    activeData={activeData}
                  />
                </div>

                <DimensionSection iso={activeData?.iso || 'N/A'} name={activeData?.name || ''} />

                <VideoBriefingSection 
                  videosLoading={videosLoading}
                  videosError={videosError}
                  countryVideos={countryVideos}
                  selectedVideoIndex={selectedVideoIndex}
                  setSelectedVideoIndex={setSelectedVideoIndex}
                  activeData={activeData}
                />

                <Hoi4MechanicsPanel selectedCountryCode={activeData?.iso || null} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
