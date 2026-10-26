'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  TechAreaId,
  TechNodeStatus,
  ReconstructedNodeState,
  ReconstructedCountryTechTree,
  ReconstructedAreaState,
  TechTreeEvent,
  TechAcquisitionVia,
} from '@/lib/data/tech-tree/types';
import { TECH_TREE_AREAS } from '@/lib/data/tech-tree/definition';
import { isPilotCountryCode } from '@/lib/data/tech-tree/config';
import { getTechTreeEvents } from '@/lib/data/tech-tree/historical-seed';
import { stateAt } from '@/lib/data/tech-tree/event-log';
import { recordTechTreeTelemetry } from '@/lib/services/tech-tree/telemetry';
import {
  Cpu,
  Brain,
  Rocket,
  Atom,
  Zap,
  Dna,
  Radio,
  ShieldAlert,
  Binary,
  Bot,
  Play,
  Pause,
  RotateCcw,
  X,
  ExternalLink,
  ChevronRight,
  Award,
  Layers,
  Map,
  GitCompare,
  Lock,
  Flame,
  CheckCircle2,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export interface TechTreeWarRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryCode: string;
  initialYear?: number;
  customEvents?: TechTreeEvent[];
}

const PILOT_COUNTRIES_META: Record<
  string,
  { name: string; flag: string; doctrine: string }
> = {
  US: { name: 'Estados Unidos', flag: '🇺🇸', doctrine: 'Hegemonía Fabless & Cómputo Frontera' },
  CN: { name: 'China', flag: '🇨🇳', doctrine: 'Autosuficiencia Integral & Escala Fab' },
  RU: { name: 'Rusia', flag: '🇷🇺', doctrine: 'Economía de Guerra & Disuasión Estratégica' },
  JP: { name: 'Japón', flag: '🇯🇵', doctrine: 'Materiales Avanzados & Consorcio 2nm' },
  DE: { name: 'Alemania', flag: '🇩🇪', doctrine: 'Ingeniería de Precisión & Óptica Crítica' },
  TW: { name: 'Taiwán', flag: '🇹🇼', doctrine: 'Monopolio Pure-Play Foundry (Escudo de Silicio)' },
  NL: { name: 'Países Bajos', flag: '🇳🇱', doctrine: 'Monopolio Litografía EUV de Última Generación' },
};

const AREA_ICONS: Record<TechAreaId, React.ComponentType<{ className?: string }>> = {
  semiconductors: Cpu,
  ai_compute: Brain,
  space: Rocket,
  nuclear: Atom,
  energy_batteries: Zap,
  biotech: Dna,
  telecom: Radio,
  defense_missiles_drones: ShieldAlert,
  quantum: Binary,
  robotics_manufacturing: Bot,
};

const STATUS_CONFIG: Record<
  TechNodeStatus,
  {
    symbol: string;
    label: string;
    badgeStyle: string;
    cardBorder: string;
    glow: string;
    lineColor: string;
  }
> = {
  no_alcanzado: {
    symbol: '○',
    label: 'NO ALCANZADO',
    badgeStyle: 'bg-zinc-900/90 text-zinc-500 border-zinc-700/60 border-dashed',
    cardBorder: 'border-zinc-800/80 bg-zinc-950/70 opacity-60',
    glow: '',
    lineColor: '#27272a',
  },
  anunciado: {
    symbol: '◇',
    label: 'ANUNCIADO',
    badgeStyle: 'bg-amber-950/70 text-amber-300 border-amber-600/70',
    cardBorder: 'border-amber-700/60 bg-zinc-900/90',
    glow: 'shadow-[0_0_12px_rgba(217,119,6,0.15)]',
    lineColor: '#d97706',
  },
  prototipo: {
    symbol: '△',
    label: 'PROTOTIPO',
    badgeStyle: 'bg-cyan-950/70 text-cyan-300 border-cyan-500/70',
    cardBorder: 'border-cyan-500/60 bg-zinc-900/95',
    glow: 'shadow-[0_0_15px_rgba(6,182,212,0.2)]',
    lineColor: '#06b6d4',
  },
  produccion: {
    symbol: '■',
    label: 'PRODUCCIÓN',
    badgeStyle: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/80',
    cardBorder: 'border-emerald-500/80 bg-zinc-900/95',
    glow: 'shadow-[0_0_18px_rgba(16,185,129,0.25)]',
    lineColor: '#10b981',
  },
  exportacion: {
    symbol: '★',
    label: 'EXPORTACIÓN',
    badgeStyle: 'bg-teal-950/90 text-teal-200 border-teal-400 font-black',
    cardBorder: 'border-teal-400 bg-zinc-900',
    glow: 'shadow-[0_0_22px_rgba(20,184,166,0.35)]',
    lineColor: '#14b8a6',
  },
};

const VIA_BADGES: Record<TechAcquisitionVia, { label: string; style: string }> = {
  propio: { label: 'PROPIO', style: 'bg-blue-950/80 text-blue-300 border-blue-600/70' },
  licencia: { label: 'LICENCIA', style: 'bg-purple-950/80 text-purple-300 border-purple-600/70' },
  compra: { label: 'COMPRA', style: 'bg-amber-950/80 text-amber-300 border-amber-600/70' },
};

export const TechTreeWarRoomModal: React.FC<TechTreeWarRoomModalProps> = ({
  isOpen,
  onClose,
  countryCode: initialCountryCode,
  initialYear = 2026,
  customEvents,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>(
    initialCountryCode?.toUpperCase() || 'US'
  );
  const [year, setYear] = useState<number>(initialYear);
  const [activeArea, setActiveArea] = useState<TechAreaId>('semiconductors');
  const [selectedNode, setSelectedNode] = useState<ReconstructedNodeState | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [viewScope, setViewScope] = useState<'focused' | 'panoramic'>('focused');

  // Synchronize country from props
  useEffect(() => {
    if (initialCountryCode) {
      setSelectedCountry(initialCountryCode.toUpperCase());
    }
  }, [initialCountryCode]);

  // Handle native <dialog> showModal / close according to modern-web-guidance
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
      setIsPlaying(false);
    }
  }, [isOpen]);

  // Fallback for browsers that do not yet support <dialog closedby="any">
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isContent =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;

      if (!isContent) {
        onClose();
      }
    };

    dialog.addEventListener('click', handleBackdropClick);
    return () => dialog.removeEventListener('click', handleBackdropClick);
  }, [onClose]);

  // Evolution Time Player (Advances year from 1955 to 2026)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setYear((prevYear) => {
        if (prevYear >= 2026) {
          setIsPlaying(false);
          return 2026;
        }
        return prevYear + 1;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Calculate tree state at the selected country and year
  const treeState: ReconstructedCountryTechTree | null = useMemo(() => {
    if (!isPilotCountryCode(selectedCountry)) return null;
    try {
      const events = customEvents ?? getTechTreeEvents();
      return stateAt(selectedCountry, year, events);
    } catch (err) {
      console.error('[TechTreeWarRoomModal] Reconstruct error:', err);
      return null;
    }
  }, [selectedCountry, year, customEvents]);

  // Record Telemetry on navigation
  useEffect(() => {
    if (isOpen && isPilotCountryCode(selectedCountry)) {
      recordTechTreeTelemetry({
        tipo: 'consulta_pais_area',
        pais: selectedCountry,
        area: activeArea,
        anioConsultado: year,
      });
    }
  }, [isOpen, selectedCountry, activeArea, year]);

  if (!isOpen) return null;

  const currentCountryMeta = PILOT_COUNTRIES_META[selectedCountry] || {
    name: selectedCountry,
    flag: '🌐',
    doctrine: 'Doctrina Nacional',
  };

  const activeAreaDef = TECH_TREE_AREAS.find((a) => a.id === activeArea) || TECH_TREE_AREAS[0];
  const activeAreaState = treeState?.areas[activeArea];

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: 'any' } as Record<string, string>)}
      aria-labelledby="tech-war-room-title"
      className="fixed inset-0 m-auto w-[96vw] max-w-[1400px] h-[92vh] max-h-[920px] bg-zinc-950 border border-zinc-700/80 rounded-2xl text-zinc-100 font-mono shadow-[0_0_50px_rgba(0,0,0,0.85)] backdrop:bg-black/80 backdrop:backdrop-blur-md p-0 flex flex-col overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-200"
    >
      {/* ── TOP WAR-ROOM COMMAND BAR ── */}
      <header className="shrink-0 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 id="tech-war-room-title" className="text-sm font-black tracking-wider uppercase text-zinc-100 flex items-center gap-2">
                <span>ÁRBOL DE INVESTIGACIÓN TECNOLÓGICA</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 font-bold">
                  SISTEMA HoI4 v1.0
                </span>
              </h2>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans">
              Trayectoria histórica de capacidades soberanas, cuellos de botella y desbloqueos por evidencia verificada.
            </p>
          </div>
        </div>

        {/* Global Nation Score & Sanction Counters */}
        <div className="flex items-center gap-3">
          {treeState && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="text-[11px] text-zinc-400 uppercase font-bold">Índice Global:</span>
              <span className="text-sm font-black text-emerald-400">
                {treeState.scoreTecnologico} / 100
              </span>
            </div>
          )}

          {treeState && treeState.nodosBloqueadosPorSancion.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-500/80 text-red-300 text-xs font-bold animate-pulse">
              <Lock className="w-3.5 h-3.5 text-red-400" />
              <span>{treeState.nodosBloqueadosPorSancion.length} Sancionados</span>
            </div>
          )}

          {treeState && treeState.nodosEnRetroceso.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-950/80 border border-orange-500/80 text-orange-300 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>{treeState.nodosEnRetroceso.length} Retrocesos</span>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar Árbol Tecnológico HoI4"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-700/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── NATION SELECTOR & TEMPORAL EVOLUTION STRIP ── */}
      <div className="shrink-0 bg-zinc-900/60 border-b border-zinc-800/80 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Country Quick Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-zinc-400 uppercase mr-1">Nación:</span>
          {Object.entries(PILOT_COUNTRIES_META).map(([code, meta]) => {
            const isSelected = selectedCountry === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setSelectedCountry(code);
                  recordTechTreeTelemetry({
                    tipo: 'consulta_pais_area',
                    pais: code,
                    area: activeArea,
                    anioConsultado: year,
                  });
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <span>{meta.flag}</span>
                <span>{code}</span>
              </button>
            );
          })}
        </div>

        {/* Temporal Evolution Slider with Play/Pause & Epoch Jumps */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPlaying((prev) => !prev)}
            className={`px-2.5 py-1 rounded-md text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-all ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/60 hover:bg-emerald-900/40'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Evolución (Play)</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1.5">
            {[1960, 1980, 2000, 2015, 2026].map((targetYear) => (
              <button
                key={targetYear}
                type="button"
                onClick={() => setYear(targetYear)}
                className={`px-2 py-0.5 text-[10px] rounded border cursor-pointer ${
                  year === targetYear
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 font-bold'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                {targetYear}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-800">
            <span className="text-xs font-bold text-emerald-400 min-w-[70px]">Año: {year}</span>
            <input
              type="range"
              min={1955}
              max={2026}
              value={year}
              onChange={(e) => {
                setYear(Number(e.target.value));
                setIsPlaying(false);
              }}
              className="w-36 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>
        </div>
      </div>

      {/* ── HoI4 MILITARY FOLDER TABS (10 CATEGORIES) ── */}
      <div className="shrink-0 bg-zinc-950 border-b border-zinc-800 px-4 pt-2.5 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          {TECH_TREE_AREAS.map((areaDef) => {
            const Icon = AREA_ICONS[areaDef.id] || Cpu;
            const areaState = treeState?.areas[areaDef.id];
            const maxLvl = areaState?.maxNivelAlcanzado || 0;
            const totalLvl = areaDef.niveles.length;
            const isSelected = activeArea === areaDef.id && viewScope === 'focused';
            const hasSanctions = areaState?.nodos.some((n: ReconstructedNodeState) => n.bloqueado_por_sancion);

            return (
              <button
                key={areaDef.id}
                type="button"
                onClick={() => {
                  setActiveArea(areaDef.id);
                  setViewScope('focused');
                }}
                className={`group px-3 py-2 rounded-t-xl text-xs font-bold border-t border-x transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  isSelected
                    ? 'bg-zinc-900 text-emerald-300 border-zinc-700 border-b-2 border-b-emerald-400 shadow-[0_-2px_12px_rgba(16,185,129,0.15)]'
                    : 'bg-zinc-950/80 text-zinc-400 border-zinc-800/80 hover:text-zinc-200 hover:bg-zinc-900/40 border-b border-b-zinc-800'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isSelected ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-300'
                  }`}
                />
                <span>{areaDef.nombre}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    maxLvl === totalLvl
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/60'
                      : maxLvl > 0
                      ? 'bg-zinc-800 text-zinc-300'
                      : 'bg-zinc-900 text-zinc-600'
                  }`}
                >
                  N{maxLvl}/{totalLvl}
                </span>
                {hasSanctions && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" title="Sanción activa" />
                )}
              </button>
            );
          })}
        </div>

        {/* View Scope Toggle: Focused vs Panoramic Grid */}
        <div className="flex items-center gap-1 shrink-0 pb-1.5">
          <button
            type="button"
            onClick={() => setViewScope((prev) => (prev === 'focused' ? 'panoramic' : 'focused'))}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              viewScope === 'panoramic'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:text-white'
            }`}
          >
            {viewScope === 'panoramic' ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{viewScope === 'panoramic' ? 'Vista Enfocada' : 'Matriz Global (10 Áreas)'}</span>
          </button>
        </div>
      </div>

      {/* ── MAIN TECH CANVAS (DAG FLOWCHART WITH TIMELINE & CONNECTORS) ── */}
      <div className="flex-1 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] bg-zinc-950/95 p-6 overflow-auto flex flex-col relative">
        {viewScope === 'focused' ? (
          /* Focused Category Tree with Visual Branching and Connectors */
          <div className="space-y-6 max-w-5xl mx-auto w-full">
            {/* Category Subheader */}
            <div className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-800 flex flex-wrap items-center justify-between gap-3 shadow-md">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
                    Rama de Especialización
                  </span>
                  <span className="text-xs text-zinc-500">·</span>
                  <h3 className="text-base font-black text-white">{activeAreaDef.nombre}</h3>
                </div>
                <p className="text-xs text-zinc-400 font-sans mt-0.5">{activeAreaDef.descripcion}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Nivel Máximo Alcanzado:</span>
                <span className="text-sm font-black text-emerald-400 bg-zinc-950 px-3 py-1 rounded border border-zinc-800">
                  NIVEL {activeAreaState?.maxNivelAlcanzado || 0} DE {activeAreaDef.niveles.length}
                </span>
              </div>
            </div>

            {/* HoI4 Interactive Node Chain (Vertical/Horizontal DAG with Status Connectors) */}
            <div className="space-y-4 relative">
              {activeAreaDef.niveles.map((levelDef, index) => {
                const nodeState: ReconstructedNodeState = activeAreaState?.nodos.find(
                  (n: ReconstructedNodeState) => n.nivel === levelDef.nivel
                ) || {
                  nodeId: levelDef.id,
                  areaId: activeArea,
                  nivel: levelDef.nivel,
                  nombre: levelDef.nombre,
                  criterio: levelDef.criterio,
                  estado: 'no_alcanzado' as TechNodeStatus,
                  via: null,
                  bloqueado_por_sancion: false,
                  retroceso: false,
                  actualizado_por_noticias: false,
                  fecha_hecho: null,
                  fecha_conocible: null,
                  fuentes: [],
                  etiqueta: 'Evidencia insuficiente',
                  origen: null,
                  ultimo_evento_id: null,
                  resumen: null,
                  historial_eventos: [],
                };

                const statusInfo =
                  nodeState.estado in STATUS_CONFIG
                    ? STATUS_CONFIG[nodeState.estado as TechNodeStatus]
                    : STATUS_CONFIG.no_alcanzado;
                const isSelected = selectedNode?.nodeId === nodeState.nodeId;
                const hasNext = index < activeAreaDef.niveles.length - 1;

                return (
                  <div key={levelDef.id} className="relative flex flex-col items-center">
                    {/* The HoI4 Technology Node Card */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedNode(nodeState)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedNode(nodeState);
                        }
                      }}
                      className={`w-full max-w-4xl p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
                        nodeState.bloqueado_por_sancion
                          ? 'border-red-500 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                          : `${statusInfo.cardBorder} ${statusInfo.glow}`
                      } ${isSelected ? 'ring-2 ring-emerald-400 scale-[1.01]' : 'hover:border-zinc-500'}`}
                    >
                      {/* Top Plate with Level and Status Badge */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold border border-zinc-700">
                            NIVEL {nodeState.nivel}
                          </span>
                          <h4 className="text-sm font-black text-white tracking-wide">
                            {nodeState.nombre}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Acquisition Via Pill */}
                          {nodeState.via && nodeState.via in VIA_BADGES && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded border font-bold ${
                                VIA_BADGES[nodeState.via as TechAcquisitionVia].style
                              }`}
                            >
                              VÍA {VIA_BADGES[nodeState.via as TechAcquisitionVia].label}
                            </span>
                          )}

                          {/* Status Badge */}
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded border font-black flex items-center gap-1.5 ${statusInfo.badgeStyle}`}
                          >
                            <span aria-hidden="true">{statusInfo.symbol}</span>
                            <span>{statusInfo.label}</span>
                          </span>
                        </div>
                      </div>

                      {/* Objective Unlock Criterion */}
                      <div className="py-2.5">
                        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">
                          Criterio Objetivo de Desbloqueo:
                        </div>
                        <p className="text-xs text-zinc-200 font-sans leading-relaxed">
                          {nodeState.criterio}
                        </p>
                      </div>

                      {/* Special Alert Banners (Sanctions, Regressions, News) */}
                      {(nodeState.bloqueado_por_sancion ||
                        nodeState.retroceso ||
                        nodeState.actualizado_por_noticias) && (
                        <div className="flex flex-wrap gap-2 pt-1 border-t border-zinc-800/70">
                          {nodeState.bloqueado_por_sancion && (
                            <div className="px-2.5 py-1 rounded bg-red-950/90 text-red-200 border border-red-500 text-[10px] font-bold flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5 text-red-400" />
                              <span>BLOQUEADO POR CONTROL DE EXPORTACIÓN / SANCIÓN</span>
                            </div>
                          )}
                          {nodeState.retroceso && (
                            <div className="px-2.5 py-1 rounded bg-orange-950/90 text-orange-200 border border-orange-500 text-[10px] font-bold flex items-center gap-1.5">
                              <Flame className="w-3.5 h-3.5 text-orange-400" />
                              <span>RETROCESO OPERATIVO DETECTADO TRAS RUPTURA DE CADENA DE SUMINISTRO</span>
                            </div>
                          )}
                          {nodeState.actualizado_por_noticias && (
                            <div className="px-2.5 py-1 rounded bg-sky-950/90 text-sky-200 border border-sky-400 text-[10px] font-bold flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-sky-400" />
                              <span>ACTUALIZADO AUTOMÁTICAMENTE POR NOTICIAS (2 FUENTES CORROBORADAS)</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Footer with Historical Dates and Sources */}
                      {nodeState.fecha_hecho && (
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-400">
                          <div className="flex items-center gap-2">
                            <span>
                              Año del Hito: <strong className="text-emerald-400">{nodeState.fecha_hecho}</strong>
                            </span>
                            <span>·</span>
                            <span>
                              Publicación: <strong className="text-zinc-300">{nodeState.fecha_conocible}</strong>
                            </span>
                            <span>·</span>
                            <span>
                              Evidencia: <strong className="text-zinc-200">{nodeState.etiqueta}</strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-teal-300 hover:text-teal-200">
                            <span>Fuentes verificadas ({nodeState.fuentes.length})</span>
                            <ChevronRight className="w-3 h-3" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SVG Flow Connector Line between levels */}
                    {hasNext && (
                      <div className="h-8 flex flex-col items-center justify-center my-0.5">
                        <div
                          className="w-0.5 h-full transition-colors"
                          style={{
                            backgroundColor:
                              nodeState.estado === 'no_alcanzado'
                                ? '#27272a'
                                : nodeState.bloqueado_por_sancion
                                ? '#ef4444'
                                : statusInfo.lineColor,
                            boxShadow:
                              nodeState.estado !== 'no_alcanzado'
                                ? `0 0 8px ${statusInfo.lineColor}`
                                : 'none',
                          }}
                        />
                        <div
                          className="w-2 h-2 rotate-45 border-r-2 border-b-2 -mt-1"
                          style={{
                            borderColor:
                              nodeState.estado === 'no_alcanzado'
                                ? '#27272a'
                                : nodeState.bloqueado_por_sancion
                                ? '#ef4444'
                                : statusInfo.lineColor,
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Panoramic Matrix with all 10 Areas in Parallel Columns */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {TECH_TREE_AREAS.map((areaDef) => {
              const Icon = AREA_ICONS[areaDef.id] || Cpu;
              const areaState = treeState?.areas[areaDef.id];
              return (
                <div
                  key={areaDef.id}
                  className="bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800 space-y-3 flex flex-col"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-black text-white">{areaDef.nombre}</h4>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-emerald-400 font-bold">
                      N{areaState?.maxNivelAlcanzado || 0}
                    </span>
                  </div>

                  <div className="space-y-2 flex-1">
                    {areaDef.niveles.map((lvl) => {
                      const node = areaState?.nodos.find((n: ReconstructedNodeState) => n.nivel === lvl.nivel);
                      const status = node?.estado || 'no_alcanzado';
                      const stConfig =
                        status in STATUS_CONFIG
                          ? STATUS_CONFIG[status as TechNodeStatus]
                          : STATUS_CONFIG.no_alcanzado;
                      return (
                        <div
                          key={lvl.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            if (node) setSelectedNode(node);
                          }}
                          className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                            node?.bloqueado_por_sancion
                              ? 'border-red-500 bg-red-950/30'
                              : `${stConfig.cardBorder}`
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 text-[10px]">
                            <span className="font-bold text-zinc-200">
                              N{lvl.nivel}. {lvl.nombre}
                            </span>
                            <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${stConfig.badgeStyle}`}>
                              {stConfig.symbol}
                            </span>
                          </div>
                          {node?.bloqueado_por_sancion && (
                            <span className="text-[9px] text-red-400 font-bold block mt-1">
                              ■ SANCIONADO
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── SLIDE-OUT NODE DETAIL INSPECTOR ── */}
        {selectedNode && (
          <aside className="absolute top-4 right-4 w-96 max-w-[90vw] bg-zinc-950/95 border-2 border-emerald-500/80 rounded-xl p-5 shadow-2xl space-y-3 z-30 animate-in slide-in-from-right duration-200 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-black text-emerald-400 tracking-wider uppercase">
                Ficha Técnica de Investigación
              </span>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="text-xs font-bold text-zinc-400 uppercase">
                Nivel {selectedNode.nivel} · {selectedCountry}
              </div>
              <h4 className="text-sm font-black text-white mt-0.5">{selectedNode.nombre}</h4>
            </div>

            <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-sans">
              <div className="text-[10px] font-bold text-zinc-400 uppercase font-mono mb-1">
                Criterio Objetivo:
              </div>
              {selectedNode.criterio}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block uppercase">Estado Actual:</span>
                <span className="font-bold text-emerald-300">{selectedNode.estado}</span>
              </div>
              <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block uppercase">Grado de Certeza:</span>
                <span className="font-bold text-teal-300">{selectedNode.etiqueta}</span>
              </div>
            </div>

            {selectedNode.fuentes.length > 0 && (
              <div className="space-y-1.5 border-t border-zinc-800 pt-2">
                <div className="text-[11px] font-bold text-zinc-300 flex items-center justify-between">
                  <span>Fuentes Corroboradas:</span>
                  <span className="text-emerald-400">({selectedNode.fuentes.length})</span>
                </div>
                <ul className="space-y-1 max-h-40 overflow-y-auto text-[10px]">
                  {selectedNode.fuentes.map((fuente, idx) => (
                    <li
                      key={idx}
                      className="p-1.5 rounded bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-zinc-300 font-sans"
                    >
                      <span className="truncate pr-2">{fuente.nombre}</span>
                      {fuente.url && (
                        <a
                          href={fuente.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 shrink-0"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        )}
      </div>
    </dialog>
  );
};
