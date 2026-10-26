'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { TechDimensionDossier } from '@/lib/types/sovereign-power';
import {
  getTechTreeEvents,
  isPilotCountryCode,
  ReconstructedNodeState,
  stateAt,
  TECH_TREE_AREAS,
  TechAreaId,
  TechTreeEvent,
} from '@/lib/data/tech-tree';
import { recordTechTreeTelemetry } from '@/lib/services/tech-tree/telemetry';
import { TechNodeBadge } from './tech-tree/TechNodeBadge';
import { TechChoroplethView } from './tech-tree/TechChoroplethView';
import { TechCountryComparator } from './tech-tree/TechCountryComparator';
import { TechTreeWarRoomModal } from './tech-tree/TechTreeWarRoomModal';
import { Cpu, Award, Zap, AlertTriangle, Clock, Map, GitCompare, Layers, Maximize2 } from 'lucide-react';

export interface TechInnovationPanelProps {
  dossier: TechDimensionDossier;
  countryCode?: string;
  initialYear?: number;
  isLoading?: boolean;
  error?: string | null;
  customEvents?: TechTreeEvent[];
}

function inferCountryCodeFromDossier(dossier: TechDimensionDossier, explicitCode?: string): string {
  if (explicitCode && explicitCode.trim()) return explicitCode.trim().toUpperCase();
  if (dossier.hasVerifiedTechTree === false) return 'UNVERIFIED';
  if (dossier.wipoPatentRank === 2) return 'US';
  if (dossier.wipoPatentRank === 1) return 'CN';
  if (dossier.wipoPatentRank === 3) return 'JP';
  if (dossier.wipoPatentRank === 4) return 'DE';
  if (dossier.wipoPatentRank === 6) return 'TW';
  if (dossier.wipoPatentRank === 8) return 'RU';
  if (dossier.summary?.includes('Países Bajos')) return 'NL';
  return 'US';
}

export const TechInnovationPanel: React.FC<TechInnovationPanelProps> = ({
  dossier,
  countryCode,
  initialYear = 2026,
  isLoading = false,
  error = null,
  customEvents,
}) => {
  const resolvedCountry = inferCountryCodeFromDossier(dossier, countryCode);
  const isPilot = isPilotCountryCode(resolvedCountry) && dossier.hasVerifiedTechTree !== false;

  const [year, setYear] = useState<number>(initialYear);
  const [viewMode, setViewMode] = useState<'tree' | 'map' | 'compare'>('tree');
  const [selectedArea, setSelectedArea] = useState<TechAreaId>('semiconductors');
  const [showAllColumns, setShowAllColumns] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<ReconstructedNodeState | null>(null);
  const [isWarRoomOpen, setIsWarRoomOpen] = useState<boolean>(false);

  const activeEvents = useMemo(() => customEvents ?? getTechTreeEvents(), [customEvents]);

  const treeState = useMemo(() => {
    if (!isPilot) return null;
    try {
      return stateAt(resolvedCountry, year, activeEvents);
    } catch (err) {
      console.error('[TechInnovationPanel] Error reconstructing tree:', err);
      return stateAt(resolvedCountry, 2026, getTechTreeEvents());
    }
  }, [resolvedCountry, year, activeEvents, isPilot]);

  useEffect(() => {
    if (isPilot) {
      recordTechTreeTelemetry({
        tipo: 'consulta_pais_area',
        pais: resolvedCountry,
        area: selectedArea,
        anioConsultado: year,
      });
    }
  }, [resolvedCountry, selectedArea, year, isPilot]);

  // 1. Loading State (Skeleton)
  if (isLoading) {
    return (
      <div
        data-testid="tech-tree-loading"
        className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 space-y-3 font-mono animate-pulse"
      >
        <div className="h-4 w-2/3 bg-zinc-800 rounded" />
        <span className="text-xs text-zinc-400 block">
          Cargando esqueleto del árbol tecnológico histórico...
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-16 bg-zinc-900 rounded border border-zinc-800" />
          <div className="h-16 bg-zinc-900 rounded border border-zinc-800" />
        </div>
      </div>
    );
  }

  // 2. Empty State for non-pilot countries (never invent nodes or technologies)
  if (!isPilot || !treeState) {
    return (
      <div
        data-testid="tech-tree-empty"
        className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 space-y-2 font-mono"
      >
        <div className="flex items-center gap-2 text-zinc-300 font-bold text-xs uppercase">
          <Cpu className="w-4 h-4 text-zinc-500" />
          <span>Pilar Tecnológico & Capacidades Críticas</span>
        </div>
        <p className="text-xs text-amber-300 font-bold">
          Sin datos verificados para este país
        </p>
        <p className="text-[11px] text-zinc-400 font-sans">
          Este país está fuera del piloto de 7 naciones verificadas. No se muestran nodos ni tecnologías inventadas.
        </p>
      </div>
    );
  }

  const { subsectors } = dossier;

  return (
    <div className="space-y-3 font-mono">
      {/* 3. Error Banner (displays error while preserving last saved state underneath) */}
      {error && (
        <div
          data-testid="tech-tree-error"
          role="alert"
          className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/70 text-red-200 text-xs flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>
            Error al actualizar ({error}). Mostrando el último estado guardado del árbol.
          </span>
        </div>
      )}

      {/* ── Header, Node-Derived Score & Macro R&D Badges ── */}
      <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold uppercase text-zinc-300">
              Pilar Tecnológico & Capacidades Críticas ({resolvedCountry} · {year})
            </span>
          </div>
          <span className="text-xs font-black text-teal-400" data-testid="tech-tree-score">
            {treeState.scoreTecnologico} / 100
          </span>
        </div>

        {/* ── Prominent HoI4 War Room Fullscreen Launcher ── */}
        <button
          type="button"
          data-testid="open-hoi4-war-room-btn"
          onClick={() => {
            setIsWarRoomOpen(true);
            recordTechTreeTelemetry({
              tipo: 'apertura_comparador',
              pais: resolvedCountry,
              anioConsultado: year,
            });
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-950/90 via-zinc-900 to-emerald-950/90 border border-emerald-500/60 hover:border-emerald-400 text-emerald-300 font-mono text-xs font-bold flex items-center justify-between shadow-[0_4px_16px_rgba(16,185,129,0.15)] hover:shadow-[0_4px_22px_rgba(16,185,129,0.25)] transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="tracking-wide">ABRIR ÁRBOL HoI4 EN PANTALLA COMPLETA</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-500/50 text-emerald-200">
            WAR ROOM
          </span>
        </button>

        <p className="text-xs text-zinc-400 leading-relaxed font-sans">{dossier.summary}</p>

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-800/80 text-[10px]">
          {dossier.wipoPatentRank && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 text-teal-300 border border-zinc-800">
              <Award className="w-3 h-3 text-amber-400" />
              Rank Patentes OMPI/WIPO: #{dossier.wipoPatentRank}
            </span>
          )}
          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 text-cyan-300 border border-zinc-800">
            <Zap className="w-3 h-3 text-cyan-400" />
            Gasto I+D: {dossier.rAndDPercentGdp}% PIB
          </span>
          {treeState.nodosBloqueadosPorSancion.length > 0 && (
            <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/60 font-bold">
              Nodos sancionados: {treeState.nodosBloqueadosPorSancion.length}
            </span>
          )}
        </div>

        {/* Dossier Reference Tags (Note: 'Económico / fintech' is removed per arbol-tecnologico-historico spec) */}
        {subsectors && (
          <div className="flex flex-wrap gap-1 pt-1 text-[9px] text-zinc-500">
            <span>{subsectors.industrial.label}</span>
            <span>·</span>
            <span>{subsectors.military.label}</span>
            <span>·</span>
            <span>{subsectors.semiconductors.label}</span>
            <span>·</span>
            <span>{subsectors.artificialIntelligence.label}</span>
          </div>
        )}
      </div>

      {/* ── Historical Year Slider & View Switcher ── */}
      <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="tech-tree-year-slider"
            className="text-xs font-bold text-teal-300 flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Año Histórico: {year}</span>
          </label>

          <div className="flex items-center gap-1">
            {[2000, 2015, 2026].map((presetYear) => (
              <button
                key={presetYear}
                type="button"
                onClick={() => {
                  setYear(presetYear);
                  recordTechTreeTelemetry({
                    tipo: 'uso_deslizador',
                    pais: resolvedCountry,
                    anioConsultado: presetYear,
                  });
                }}
                className={`px-2 py-0.5 text-[10px] rounded border cursor-pointer ${
                  year === presetYear
                    ? 'bg-teal-500/20 text-teal-300 border-teal-400 font-bold'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                }`}
              >
                {presetYear}
              </button>
            ))}
          </div>
        </div>

        <input
          id="tech-tree-year-slider"
          data-testid="tech-tree-year-slider"
          type="range"
          min={1955}
          max={2026}
          value={year}
          onChange={(e) => {
            const nextYear = Number(e.target.value);
            setYear(nextYear);
            recordTechTreeTelemetry({
              tipo: 'uso_deslizador',
              pais: resolvedCountry,
              anioConsultado: nextYear,
            });
          }}
          className="w-full accent-teal-400 cursor-pointer"
        />

        {/* View Mode Selector: Tree / Choropleth Map / Side-by-Side Comparator */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => setViewMode('tree')}
            className={`py-1 px-2 rounded text-[10px] font-bold border flex items-center justify-center gap-1 cursor-pointer ${
              viewMode === 'tree'
                ? 'bg-teal-500/20 text-teal-300 border-teal-400'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Árbol HoI4 (10 Áreas)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`py-1 px-2 rounded text-[10px] font-bold border flex items-center justify-center gap-1 cursor-pointer ${
              viewMode === 'map'
                ? 'bg-teal-500/20 text-teal-300 border-teal-400'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800'
            }`}
          >
            <Map className="w-3 h-3" />
            <span>Mapa Coroplético</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode('compare');
              recordTechTreeTelemetry({
                tipo: 'apertura_comparador',
                pais: resolvedCountry,
                anioConsultado: year,
              });
            }}
            className={`py-1 px-2 rounded text-[10px] font-bold border flex items-center justify-center gap-1 cursor-pointer ${
              viewMode === 'compare'
                ? 'bg-teal-500/20 text-teal-300 border-teal-400'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800'
            }`}
          >
            <GitCompare className="w-3 h-3" />
            <span>Comparador (2 Países)</span>
          </button>
        </div>
      </div>

      {/* ── Active View Rendering ── */}
      {viewMode === 'map' && (
        <TechChoroplethView
          year={year}
          selectedArea={selectedArea}
          onSelectArea={setSelectedArea}
          events={activeEvents}
        />
      )}

      {viewMode === 'compare' && (
        <TechCountryComparator
          primaryCountry={resolvedCountry}
          year={year}
          events={activeEvents}
        />
      )}

      {viewMode === 'tree' && (
        <div className="space-y-3" data-testid="tech-tree-areas-view">
          {/* 10 Areas Selector Pills + Multi-Column HoI4 Toggle */}
          <div className="flex flex-wrap gap-1 bg-zinc-950/90 p-2 rounded-lg border border-zinc-800">
            <button
              type="button"
              data-testid="toggle-all-columns-btn"
              onClick={() => setShowAllColumns((prev) => !prev)}
              className={`px-2 py-1 rounded text-[10px] border transition-all cursor-pointer ${
                showAllColumns
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 font-bold'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:text-white'
              }`}
            >
              {showAllColumns ? 'Vista Enfocada (1 Área)' : 'Ver 10 Columnas HoI4'}
            </button>
            {TECH_TREE_AREAS.map((areaDef) => {
              const areaState = treeState.areas[areaDef.id];
              const isSelected = !showAllColumns && selectedArea === areaDef.id;
              return (
                <button
                  key={areaDef.id}
                  type="button"
                  onClick={() => {
                    setShowAllColumns(false);
                    setSelectedArea(areaDef.id);
                  }}
                  className={`px-2 py-1 rounded text-[10px] border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-500/20 text-teal-300 border-teal-400 font-bold'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {areaDef.nombre} (N{areaState.maxNivelAlcanzado}/{areaDef.niveles.length})
                </button>
              );
            })}
          </div>

          {/* Multi-Column HoI4 Grid (Columns by Area, Nodes by Level) */}
          {showAllColumns ? (
            <div
              data-testid="tech-tree-all-columns-grid"
              className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[540px] overflow-y-auto pr-1"
            >
              {TECH_TREE_AREAS.map((areaDef) => {
                const areaState = treeState.areas[areaDef.id];
                return (
                  <div
                    key={areaDef.id}
                    className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-1">
                      <h5 className="text-xs font-bold text-white">{areaState.nombre}</h5>
                      <span className="text-[10px] font-bold text-teal-400">
                        Máx N{areaState.maxNivelAlcanzado}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {areaState.nodos.map((node) => (
                        <TechNodeBadge
                          key={node.nodeId}
                          node={node}
                          isSelected={selectedNode?.nodeId === node.nodeId}
                          onSelect={setSelectedNode}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Selected Area Levels Column */
            treeState.areas[selectedArea] && (
              <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                  <div>
                    <h5 className="text-xs font-bold text-white">
                      {treeState.areas[selectedArea].nombre}
                    </h5>
                    <p className="text-[10px] text-zinc-400 font-sans">
                      {treeState.areas[selectedArea].descripcion}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-teal-400">
                    Nivel Máx: {treeState.areas[selectedArea].maxNivelAlcanzado}
                  </span>
                </div>

                <div className="space-y-2">
                  {treeState.areas[selectedArea].nodos.map((node, nodeIdx) => (
                    <React.Fragment key={node.nodeId}>
                      <TechNodeBadge
                        node={node}
                        isSelected={selectedNode?.nodeId === node.nodeId}
                        onSelect={setSelectedNode}
                      />
                      {nodeIdx < treeState.areas[selectedArea].nodos.length - 1 && (
                        <div className="flex justify-center -my-1">
                          <div className="w-0.5 h-3 bg-zinc-700/60" />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )
          )}

          {/* Selected Node Detail Inspector */}
          {selectedNode && (
            <div
              data-testid="tech-node-detail-drawer"
              className="bg-zinc-950 p-3 rounded-xl border border-teal-500/50 space-y-1.5 text-[10px]"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-300">
                  Detalle de Nodo: N{selectedNode.nivel} — {selectedNode.nombre}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  className="text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
              {selectedNode.resumen && (
                <p className="text-zinc-200 font-sans">{selectedNode.resumen}</p>
              )}
              <div className="text-zinc-400">
                Evidencia: <strong>{selectedNode.etiqueta}</strong> | Estado:{' '}
                <strong>{selectedNode.estado}</strong>
              </div>
              {selectedNode.fuentes.length > 0 && (
                <ul className="list-disc list-inside text-teal-300 space-y-0.5">
                  {selectedNode.fuentes.map((f, idx) => (
                    <li key={idx}>
                      {f.nombre} {f.referencia ? `(${f.referencia})` : ''}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
      {/* ── HoI4 Fullscreen War Room Modal ── */}
      <TechTreeWarRoomModal
        isOpen={isWarRoomOpen}
        onClose={() => setIsWarRoomOpen(false)}
        countryCode={resolvedCountry}
        initialYear={year}
        customEvents={customEvents}
      />
    </div>
  );
};
