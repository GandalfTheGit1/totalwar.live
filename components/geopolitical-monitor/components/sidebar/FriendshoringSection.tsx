/**
 * @file FriendshoringSection.tsx
 * @description Tactical Sidebar Section for Critical Raw Materials Friendshoring & Substitution Arcs (T03.4).
 * Allows interactive exploration of 9 critical commodities, evaluates vulnerable global monopolies,
 * displays safe allied substitution partners with bilateral friction < 4.0, feasibility indices,
 * Haversine distances, shared defense/trade alliances, and key industrial mining assets.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { ShieldCheck, ArrowRight, Compass, ShieldAlert, Sparkles, CheckCircle2, Globe2 } from 'lucide-react';
import {
  FriendshoringService,
  CriticalCommodityKey,
  SubstitutionArc,
  CRITICAL_COMMODITIES_REGISTRY,
} from '@/lib/services/geographic/friendshoring-service';

interface FriendshoringSectionProps {
  countryCode?: string; // Current active country ISO (e.g. 'US' or 'CN')
  countryName?: string;
  selectedCommodity?: CriticalCommodityKey;
  onSelectCommodity?: (commodity: CriticalCommodityKey) => void;
  onSelectSubstitute?: (substituteCountryCode: string) => void;
}

export const FriendshoringSection: React.FC<FriendshoringSectionProps> = ({
  countryCode = 'US',
  countryName = 'Estados Unidos',
  selectedCommodity: propSelectedCommodity,
  onSelectCommodity,
  onSelectSubstitute,
}) => {
  // Auto-detect relevant commodity if selected country is a known producer, else default to 'rare-earths'
  const initialCommodity = useMemo<CriticalCommodityKey>(() => {
    const cleanCode = (countryCode || '').toUpperCase();
    for (const comm of CRITICAL_COMMODITIES_REGISTRY) {
      if (comm.vulnerableOrigins.some((o) => o.countryCode === cleanCode)) {
        return comm.id;
      }
    }
    return 'rare-earths';
  }, [countryCode]);

  const [internalSelectedCommodity, setInternalSelectedCommodity] = useState<CriticalCommodityKey>(
    propSelectedCommodity ?? initialCommodity
  );

  const selectedCommodity = propSelectedCommodity ?? internalSelectedCommodity;

  // React to countryCode changes if selected country is an origin producer of a critical raw material
  React.useEffect(() => {
    if (countryCode) {
      const cleanCode = countryCode.toUpperCase();
      const matched = CRITICAL_COMMODITIES_REGISTRY.find((comm) =>
        comm.vulnerableOrigins.some((o) => o.countryCode === cleanCode)
      );
      if (matched) {
        setInternalSelectedCommodity(matched.id);
        onSelectCommodity?.(matched.id);
      }
    }
  }, [countryCode, onSelectCommodity]);

  const commodities = FriendshoringService.getAllCommodities();
  const activeProfile = FriendshoringService.getCommodityById(selectedCommodity);

  // Get substitution arcs for destination (defaults to 'US' or current country if western ally)
  const destination = useMemo(() => {
    const clean = (countryCode || '').toUpperCase();
    return clean === 'CN' || clean === 'RU' || clean === 'IR' || clean === 'CD' ? 'US' : clean || 'US';
  }, [countryCode]);

  const summary = useMemo(() => {
    return FriendshoringService.getFriendshoringSummary(selectedCommodity, destination);
  }, [selectedCommodity, destination]);

  const handleCommodityChange = (id: CriticalCommodityKey) => {
    setInternalSelectedCommodity(id);
    onSelectCommodity?.(id);
  };

  const isOriginSelected = useMemo(() => {
    if (!activeProfile || !countryCode) return false;
    const clean = countryCode.toUpperCase();
    return activeProfile.vulnerableOrigins.some((o) => o.countryCode === clean);
  }, [activeProfile, countryCode]);

  return (
    <div className="bg-zinc-950/80 rounded-xl p-4 border border-zinc-800/90 shadow-xl space-y-4 font-mono text-zinc-100">
      {/* ─── Header Táctico HUD ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white tracking-wide uppercase flex items-center gap-1.5">
              <span>FRIENDSHORING DE MATERIAS PRIMAS</span>
            </h3>
            <p className="text-[10px] text-zinc-400">
              Sustitución hacia aliados seguros (Fricción &lt; 4.0) · T03.4
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
          RADAR ACTIVO
        </span>
      </div>

      {/* ─── Selector Horizontal de Materias Primas Críticas (9 Commodities) ─ */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <span className="font-semibold flex items-center gap-1">
            <Compass className="w-3 h-3 text-teal-400" />
            <span>Seleccionar Materia Prima Crítica:</span>
          </span>
          <span className="text-[10px] text-zinc-500">9 Insumos Estratégicos</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {commodities.map((c) => {
            const isSelected = c.id === selectedCommodity;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleCommodityChange(c.id)}
                className={`px-2 py-1.5 text-[10px] font-bold rounded-lg transition-all text-left truncate cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700'
                }`}
                title={c.name}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Diagnóstico de Concentración / Cuello de Botella Monopólico ─── */}
      {activeProfile && (
        <div
          className={`p-3 rounded-lg border text-xs space-y-1.5 ${
            isOriginSelected
              ? 'bg-rose-950/25 border-rose-500/40'
              : 'bg-zinc-900/90 border-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <ShieldAlert
                className={`w-3.5 h-3.5 ${
                  isOriginSelected ? 'text-rose-400' : 'text-amber-400'
                }`}
              />
              <span>Cuello de Botella Geopolítico</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold">
              {activeProfile.category}
            </span>
          </div>

          <p className="text-[11px] text-zinc-300 leading-relaxed">
            {activeProfile.description}
          </p>

          <div className="pt-1.5 border-t border-zinc-800/80 space-y-1">
            {activeProfile.vulnerableOrigins.map((orig) => (
              <div
                key={orig.countryCode}
                className="flex items-start gap-1.5 text-[10px] text-zinc-300"
              >
                <span className="text-amber-400 font-bold shrink-0">
                  [{orig.countryCode} - {orig.marketSharePercentage}% Cuota]:
                </span>
                <span className="text-zinc-400 leading-tight">{orig.rationale}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Métricas Resumen Táctico de Sustitución ─────────────────────── */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-zinc-900/70 p-2 rounded-lg border border-zinc-800">
          <div className="text-[9px] text-zinc-400 uppercase">Alternativas</div>
          <div className="text-base font-black text-white mt-0.5">
            {summary.totalArcs}
          </div>
          <div className="text-[8px] text-emerald-400">Fricción &lt; 4.0</div>
        </div>
        <div className="bg-zinc-900/70 p-2 rounded-lg border border-zinc-800">
          <div className="text-[9px] text-zinc-400 uppercase">Viabilidad Media</div>
          <div className="text-base font-black text-teal-300 mt-0.5">
            {summary.averageFeasibility}%
          </div>
          <div className="text-[8px] text-teal-400">Nearshore Index</div>
        </div>
        <div className="bg-zinc-900/70 p-2 rounded-lg border border-zinc-800">
          <div className="text-[9px] text-zinc-400 uppercase">Líder Aliado</div>
          <div className="text-base font-black text-emerald-400 mt-0.5 truncate">
            {summary.topAlternative?.substituteCountryFlag}{' '}
            {summary.topAlternative?.substituteCountry}
          </div>
          <div className="text-[8px] text-emerald-400">
            {summary.topAlternative?.feasibilityScore}% Score
          </div>
        </div>
      </div>

      {/* ─── Lista de Alternativas Seguras (Substitution Arcs Cards) ─────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-300">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Naciones Aliadas Seguras (Fricción &lt; 4.0):</span>
          </span>
          <span className="text-[10px] text-zinc-500">Ordenado por Viabilidad</span>
        </div>

        {summary.arcs.length === 0 ? (
          <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 text-center text-xs text-zinc-400">
            No se detectaron alternativas seguras con fricción &lt; 4.0 para este insumo.
          </div>
        ) : (
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
            {summary.arcs.map((arc: SubstitutionArc, index: number) => {
              return (
                <div
                  key={arc.id}
                  onClick={() => onSelectSubstitute?.(arc.substituteCountry)}
                  className="bg-zinc-900/90 hover:bg-zinc-850 p-3 rounded-lg border border-zinc-800 hover:border-emerald-500/40 transition-all cursor-pointer space-y-2 group"
                >
                  {/* Top Bar Card */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 text-[10px] font-bold flex items-center justify-center text-zinc-300">
                        #{index + 1}
                      </span>
                      <span className="text-sm">{arc.substituteCountryFlag}</span>
                      <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {arc.substituteCountryName}
                      </span>
                      <span className="px-1.5 py-0.2 bg-zinc-800 text-zinc-400 text-[9px] rounded font-bold">
                        {arc.substituteCountry}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
                        {arc.feasibilityScore}% VIABILIDAD
                      </span>
                    </div>
                  </div>

                  {/* Flow Route Details */}
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 bg-zinc-950/60 px-2 py-1.5 rounded border border-zinc-850">
                    <div className="flex items-center gap-1">
                      <span className="text-rose-400 font-bold">
                        {arc.originCountryFlag} {arc.originCountry}
                      </span>
                      <ArrowRight className="w-3 h-3 text-teal-400" />
                      <span className="text-emerald-300 font-bold">
                        {arc.substituteCountryFlag} {arc.substituteCountry}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">
                        Fricción: {arc.frictionScore}/10
                      </span>
                      <span className="text-zinc-500">·</span>
                      <span suppressHydrationWarning>{arc.distanceKm.toLocaleString('en-US')} km</span>
                    </div>
                  </div>

                  {/* Progress Bar of Feasibility */}
                  <div className="space-y-1">
                    <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-500"
                        style={{ width: `${arc.feasibilityScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Strategic Asset & Mining Complex */}
                  <div className="text-[10px] text-zinc-300 leading-tight">
                    <span className="text-teal-400 font-semibold">Activo Estratégico: </span>
                    <span className="text-zinc-300">{arc.strategicRationale}</span>
                  </div>

                  {/* Shared Treaties Badges */}
                  {arc.allianceMatch && arc.allianceMatch.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap pt-1 border-t border-zinc-800/60">
                      <span className="text-[9px] text-zinc-500 flex items-center gap-0.5">
                        <Globe2 className="w-2.5 h-2.5" /> Tratados:
                      </span>
                      {arc.allianceMatch.map((b) => (
                        <span
                          key={b}
                          className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-teal-950/60 text-teal-300 border border-teal-800/60"
                        >
                          {b}
                        </span>
                      ))}
                      {arc.frictionReduction > 0 && (
                        <span className="ml-auto text-[9px] font-bold text-teal-400">
                          -{arc.frictionReduction} fricción
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Footer Nota de Metodología de Primeros Principios ─────────── */}
      <div className="text-[9px] text-zinc-500 pt-2 border-t border-zinc-800/80 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-teal-400" />
          <span>Filtro estricto: Fricción &lt; 4.0 · Fórmula de Haversine</span>
        </span>
        <span className="text-zinc-600">UNCTAD &amp; EDGAR C2</span>
      </div>
    </div>
  );
};
