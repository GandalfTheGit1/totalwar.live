'use client';

import React, { useState, useMemo } from 'react';
import { 
  SovereignPowerService, 
  SUPERPOWER_BENCHMARKS 
} from '@/lib/services/sovereign-power-service';
import type { 
  BenchmarkSuperpower, 
  WargameShocks, 
  SovereignDimensionKey 
} from '@/lib/types/sovereign-power';
import { SovereignRadarChart } from './sovereign-power/SovereignRadarChart';
import { WarRoomCommandModal } from './sovereign-power/WarRoomCommandModal';
import { PowerTelemetryHud } from './sovereign-power/PowerTelemetryHud';
import { ComparisonControls } from './sovereign-power/ComparisonControls';
import { WargameShocksDrawer } from './sovereign-power/WargameShocksDrawer';
import { DimensionQuickInspector } from './sovereign-power/DimensionQuickInspector';
import { Maximize2 } from 'lucide-react';

interface SovereignPowerRadarSectionProps {
  activeData: any;
}

const DEFAULT_SHOCKS: WargameShocks = {
  defenseShock: 0,
  tradeShock: 0,
  currencyShock: 0,
  techShock: 0,
};

export const SovereignPowerRadarSection: React.FC<SovereignPowerRadarSectionProps> = ({
  activeData,
}) => {
  const iso = activeData?.iso || 'US';

  const [superpowerKey, setSuperpowerKey] = useState<BenchmarkSuperpower>(() => (
    iso.toUpperCase() === 'US' ? 'CN' : 'US'
  ));
  const [showGlobal, setShowGlobal] = useState(true);
  const [showSuperpower, setShowSuperpower] = useState(true);
  const [isWarRoomOpen, setIsWarRoomOpen] = useState(false);
  const [shocks, setShocks] = useState<WargameShocks>(DEFAULT_SHOCKS);
  const [appointedCabinet, setAppointedCabinet] = useState<Partial<Record<'DEFENSE' | 'FINANCE' | 'FOREIGN_SECURITY', string>>>({});
  const [selectedDimension, setSelectedDimension] = useState<SovereignDimensionKey>('techInnovation');
  const [isShocksDrawerOpen, setIsShocksDrawerOpen] = useState(false);
  const [isDimensionDrawerOpen, setIsDimensionDrawerOpen] = useState(false);

  const profile = useMemo(() => {
    try {
      return SovereignPowerService.getCountrySovereignProfile(iso, appointedCabinet);
    } catch (err) {
      console.error('[SovereignPowerRadarSection] Error building sovereign profile:', err);
      return SovereignPowerService.getCountrySovereignProfile('US');
    }
  }, [iso, appointedCabinet]);

  const globalScores = useMemo(() => SovereignPowerService.getGlobalAverageScores(), []);
  const superpowerScores = useMemo(() => SovereignPowerService.getBenchmarkScores(superpowerKey), [superpowerKey]);
  const simulationResult = useMemo(
    () => SovereignPowerService.simulateWargame(profile.baseScores, shocks, profile.countryCode),
    [profile.baseScores, shocks, profile.countryCode]
  );

  const handleShockChange = (key: keyof WargameShocks, val: number) => {
    setShocks((prev) => ({ ...prev, [key]: val }));
  };

  const handleResetShocks = () => setShocks(DEFAULT_SHOCKS);
  const handleAppointReplacement = (role: 'DEFENSE' | 'FINANCE' | 'FOREIGN_SECURITY', candidateId: string) => {
    setAppointedCabinet((prev) => ({ ...prev, [role]: candidateId }));
  };
  const handleResetCabinet = () => setAppointedCabinet({});

  const superpowerInfo = SUPERPOWER_BENCHMARKS[superpowerKey];
  const isShocked = Object.values(shocks).some((v) => v !== 0);

  return (
    <div className="bg-zinc-850/70 p-4 rounded-xl border border-zinc-700/60 space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-teal-300 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
            Spider Chart Soberano // 6 Pilares Dalio
          </h4>
          <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">
            País vs Promedio Global vs Superpotencia
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsWarRoomOpen(true)}
          className="px-2.5 py-1 text-[11px] font-mono font-bold text-teal-300 bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 rounded-lg flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(20,184,166,0.2)] cursor-pointer"
          title="Abrir Sala de Mando Táctico en Pantalla Completa"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>SALA DE MANDO</span>
        </button>
      </div>

      <PowerTelemetryHud
        compositePowerIndex={profile.compositePowerIndex}
        simulationResult={simulationResult}
      />

      <div className="bg-zinc-900/40 p-2 rounded-xl border border-zinc-800/80 flex justify-center">
        <SovereignRadarChart
          countryScores={profile.baseScores}
          globalScores={globalScores}
          superpowerScores={superpowerScores}
          warpedScores={simulationResult.warpedScores}
          countryName={profile.nameEs}
          superpowerName={superpowerInfo.name}
          showGlobal={showGlobal}
          showSuperpower={showSuperpower}
          selectedDimension={selectedDimension}
          onSelectDimension={(dim) => {
            setSelectedDimension(dim);
            setIsDimensionDrawerOpen(true);
          }}
          size={290}
        />
      </div>

      <ComparisonControls
        showGlobal={showGlobal}
        setShowGlobal={setShowGlobal}
        showSuperpower={showSuperpower}
        setShowSuperpower={setShowSuperpower}
        superpowerKey={superpowerKey}
        setSuperpowerKey={setSuperpowerKey}
      />

      <WargameShocksDrawer
        isOpen={isShocksDrawerOpen}
        setIsOpen={setIsShocksDrawerOpen}
        isShocked={isShocked}
        shocks={shocks}
        onShockChange={handleShockChange}
        onReset={handleResetShocks}
        simulationResult={simulationResult}
      />

      <DimensionQuickInspector
        isOpen={isDimensionDrawerOpen}
        setIsOpen={setIsDimensionDrawerOpen}
        selectedDimension={selectedDimension}
        setSelectedDimension={setSelectedDimension}
        profile={profile}
        onOpenWarRoom={() => setIsWarRoomOpen(true)}
      />

      <WarRoomCommandModal
        isOpen={isWarRoomOpen}
        onClose={() => setIsWarRoomOpen(false)}
        profile={profile}
        globalScores={globalScores}
        superpowerKey={superpowerKey}
        onSuperpowerChange={setSuperpowerKey}
        superpowerScores={superpowerScores}
        shocks={shocks}
        onShockChange={handleShockChange}
        onResetShocks={handleResetShocks}
        simulationResult={simulationResult}
        selectedDimension={selectedDimension}
        onSelectDimension={setSelectedDimension}
        onAppointReplacement={handleAppointReplacement}
        appointedReplacements={appointedCabinet}
        onResetCabinet={handleResetCabinet}
      />
    </div>
  );
};
