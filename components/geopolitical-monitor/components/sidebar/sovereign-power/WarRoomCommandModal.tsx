'use client';

import React, { useState, useEffect } from 'react';
import { 
  CountrySovereignPowerProfile, 
  SovereignRadarScores, 
  WargameShocks, 
  WargameSimulationResult, 
  BenchmarkSuperpower, 
  SovereignDimensionKey 
} from '@/lib/types/sovereign-power';
import { SovereignRadarChart } from './SovereignRadarChart';
import { WargameSimulatorControls } from './WargameSimulatorControls';
import { DimensionDetailView } from './DimensionDetailView';
import { CabinetDossierPanel } from './CabinetDossierPanel';
import { SUPERPOWER_BENCHMARKS } from '@/lib/services/sovereign-power-service';
import { X, Tv, Maximize2, Shield, Crosshair, RefreshCw, Layers } from 'lucide-react';

interface WarRoomCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CountrySovereignPowerProfile;
  globalScores: SovereignRadarScores;
  superpowerKey: BenchmarkSuperpower;
  onSuperpowerChange: (key: BenchmarkSuperpower) => void;
  superpowerScores: SovereignRadarScores;
  shocks: WargameShocks;
  onShockChange: (key: keyof WargameShocks, val: number) => void;
  onResetShocks: () => void;
  simulationResult: WargameSimulationResult;
  selectedDimension: SovereignDimensionKey;
  onSelectDimension: (dim: SovereignDimensionKey) => void;
  onAppointReplacement?: (role: 'DEFENSE' | 'FINANCE' | 'FOREIGN_SECURITY', candidateId: string) => void;
  appointedReplacements?: Partial<Record<'DEFENSE' | 'FINANCE' | 'FOREIGN_SECURITY', string>>;
  onResetCabinet?: () => void;
}

export const WarRoomCommandModal: React.FC<WarRoomCommandModalProps> = ({
  isOpen,
  onClose,
  profile,
  globalScores,
  superpowerKey,
  onSuperpowerChange,
  superpowerScores,
  shocks,
  onShockChange,
  onResetShocks,
  simulationResult,
  selectedDimension,
  onSelectDimension,
  onAppointReplacement,
  appointedReplacements,
  onResetCabinet
}) => {
  const [crtEffect, setCrtEffect] = useState(false);
  const [showGlobal, setShowGlobal] = useState(true);
  const [showSuperpower, setShowSuperpower] = useState(true);
  const [activeTab, setActiveTab] = useState<'simulation' | 'dimensions' | 'cabinet'>('simulation');

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentSuperpowerInfo = SUPERPOWER_BENCHMARKS[superpowerKey];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Sala de Mando Táctico: ${profile.nameEs}`}
    >
      {/* ── Main Command Center Window ── */}
      <div 
        className={`relative w-full max-w-6xl max-h-[94vh] bg-zinc-950 border border-zinc-700/80 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden ${
          crtEffect ? 'crt-scanlines' : ''
        }`}
      >
        {/* Subtle Scanline Overlay */}
        {crtEffect && (
          <div 
            className="pointer-events-none absolute inset-0 z-40 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-40" 
          />
        )}

        {/* ── Top Tactical Header ── */}
        <div className="p-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{profile.flag}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>{profile.nameEs}</span>
                  <span className="text-xs px-2 py-0.5 font-mono rounded bg-zinc-800 text-teal-400 border border-zinc-700">
                    {profile.countryCode} // {profile.iso3}
                  </span>
                </h2>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-black uppercase ${simulationResult.defconStatus.badgeBg}`}>
                  DEFCON {simulationResult.defconStatus.level}: {simulationResult.defconStatus.codeName}
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                [SALA DE MANDO TÁCTICO // SPIDER CHART SOBERANO // RAY DALIO 6 PILARES]
              </p>
            </div>
          </div>

          {/* Action buttons (CRT toggle & Close) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCrtEffect(!crtEffect)}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded border transition-all cursor-pointer flex items-center gap-1.5 ${
                crtEffect 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border-zinc-700'
              }`}
              title="Activar/Desactivar efecto CRT Scanline de videojuego bélico"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>CRT: {crtEffect ? 'ON' : 'OFF'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer border border-zinc-700"
              title="Cerrar sala de mando"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Main Content Grid ── */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 custom-scrollbar">
          {/* ── Left Column: Radar & Comparative Telemetry (5 cols) ── */}
          <div className="lg:col-span-5 flex flex-col items-center bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/80 space-y-4">
            {/* The SVG Radar Canvas */}
            <div className="w-full flex justify-center py-2">
              <SovereignRadarChart
                countryScores={profile.baseScores}
                globalScores={globalScores}
                superpowerScores={superpowerScores}
                warpedScores={simulationResult.warpedScores}
                countryName={profile.nameEs}
                superpowerName={currentSuperpowerInfo.name}
                showGlobal={showGlobal}
                showSuperpower={showSuperpower}
                selectedDimension={selectedDimension}
                onSelectDimension={onSelectDimension}
                size={340}
              />
            </div>

            {/* Comparison Controls */}
            <div className="w-full bg-zinc-950/90 p-3 rounded-lg border border-zinc-800 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-zinc-300 font-bold border-b border-zinc-800/80 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-zinc-400" />
                  Capas Comparativas
                </span>
                <span className="text-[10px] text-zinc-500 uppercase">Benchmark Global</span>
              </div>

              {/* Toggle Global Average */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={showGlobal}
                    onChange={(e) => setShowGlobal(e.target.checked)}
                    className="accent-amber-400 rounded cursor-pointer"
                  />
                  <span>Promedio Global (45 naciones)</span>
                </label>
                <span className="text-amber-400 font-bold text-[11px]">~45 pts</span>
              </div>

              {/* Toggle & Select Superpower */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={showSuperpower}
                    onChange={(e) => setShowSuperpower(e.target.checked)}
                    className="accent-rose-500 rounded cursor-pointer"
                  />
                  <span>Superpotencia:</span>
                </label>
                <select
                  value={superpowerKey}
                  onChange={(e) => onSuperpowerChange(e.target.value as BenchmarkSuperpower)}
                  className="bg-zinc-900 border border-zinc-700 text-rose-300 text-xs rounded px-2 py-1 font-mono cursor-pointer focus:outline-none focus:border-rose-400"
                >
                  <option value="US">EE. UU. 🇺🇸 (Hegemón)</option>
                  <option value="CN">China 🇨🇳 (Industrial)</option>
                  <option value="RU">Rusia 🇷🇺 (Asimétrica)</option>
                </select>
              </div>
            </div>

            {/* Sovereign Power & Leverage Stat Cards */}
            <div className="w-full grid grid-cols-2 gap-3 font-mono">
              <div className="bg-zinc-950/90 p-3 rounded-lg border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase block">Poder Soberano Dalio</span>
                <span className="text-2xl font-black text-emerald-400">
                  {profile.compositePowerIndex}
                  <span className="text-xs text-zinc-500 font-normal"> / 100</span>
                </span>
              </div>
              <div className="bg-zinc-950/90 p-3 rounded-lg border border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase block">Palanca Geopolítica</span>
                <span className="text-2xl font-black text-cyan-400">
                  {simulationResult.warpedLeverage}
                  <span className="text-xs text-zinc-500 font-normal"> / 100</span>
                </span>
              </div>
            </div>
          </div>

          {/* ── Right Column: Interactive Command Controls & Dossiers (7 cols) ── */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {/* Nav Tabs */}
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('simulation')}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                  activeTab === 'simulation'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                Simulador de Shocks Wargame
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('dimensions')}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                  activeTab === 'dimensions'
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-[0_0_12px_rgba(20,184,166,0.25)]'
                    : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                Dossiers de Inteligencia (6 Pilares)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cabinet')}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                  activeTab === 'cabinet'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                    : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                Consejo de Guerra & Gabinete
              </button>
            </div>

            {/* Dynamic View rendering */}
            <div className="flex-1">
              {activeTab === 'simulation' && (
                <WargameSimulatorControls
                  shocks={shocks}
                  onShockChange={onShockChange}
                  onReset={onResetShocks}
                  defconStatus={simulationResult.defconStatus}
                  originalLeverage={simulationResult.originalLeverage}
                  warpedLeverage={simulationResult.warpedLeverage}
                  leverageDelta={simulationResult.leverageDelta}
                  tacticalLogs={simulationResult.tacticalLogs}
                  warpedDalioSpread={simulationResult.warpedDalioSpread}
                />
              )}

              {activeTab === 'dimensions' && (
                <DimensionDetailView
                  profile={profile}
                  selectedDimension={selectedDimension}
                  onSelectDimension={onSelectDimension}
                  onAppointReplacement={onAppointReplacement}
                  appointedReplacements={appointedReplacements}
                  onResetCabinet={onResetCabinet}
                  warpedDalioSpread={simulationResult.warpedDalioSpread}
                />
              )}

              {activeTab === 'cabinet' && (
                <CabinetDossierPanel
                  dossier={profile.dossiers.cabinet}
                  onAppointReplacement={onAppointReplacement}
                  appointedReplacements={appointedReplacements}
                  onResetCabinet={onResetCabinet}
                />
              )}
            </div>
          </div>
        </div>

        {/* ── Telemetry Footer ── */}
        <div className="px-5 py-2.5 bg-zinc-950 border-t border-zinc-800 text-[10px] font-mono text-zinc-500 flex flex-wrap items-center justify-between">
          <div className="flex items-center gap-3">
            <span>SYS_CLK // 2026.Q4</span>
            <span>VECTOR_MATRIX: 6_PILAR_DALIO</span>
            <span className="text-teal-400">TELEMETRY_STREAM: ONLINE</span>
          </div>
          <div className="text-zinc-400">
            [PULSAR ESC PARA SALIR DE SALA DE MANDO]
          </div>
        </div>
      </div>
    </div>
  );
};
