/**
 * components/geographic-operations/facilities/FacilitiesDirectoryList.tsx
 *
 * Scrollable list of corporate facilities with tenure, functional badges, and risk metrics.
 */

'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import {
  CorporateFacility,
  FACILITY_TYPE_CONFIG
} from '@/lib/services/geographic/sec-properties-service';
import { FacilitiesDirectoryListProps } from './types';

function getRiskScoreColorClass(score?: number): string {
  const s = score ?? 3.5;
  if (s >= 7.0) return 'text-rose-400';
  if (s >= 4.0) return 'text-amber-400';
  return 'text-emerald-400';
}

function FacilityTenureBadge({ tenure }: { tenure: CorporateFacility['tenure'] }) {
  if (tenure === 'OWNED') {
    return (
      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
        PROPIEDAD
      </span>
    );
  }
  return (
    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sky-500/10 text-sky-300 border border-sky-500/30">
      ARRENDADO
    </span>
  );
}

function FacilityDirectoryCard({
  fac,
  isSelected,
  onSelect,
}: {
  fac: CorporateFacility;
  isSelected: boolean;
  onSelect: (fac: CorporateFacility) => void;
}) {
  const config = FACILITY_TYPE_CONFIG[fac.functionalType];
  const riskScore = fac.geopoliticalRiskScore ?? 3.5;

  return (
    <div
      onClick={() => onSelect(fac)}
      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
        isSelected
          ? 'bg-zinc-800/80 border-sky-500 shadow-md'
          : 'bg-white/[0.01] hover:bg-white/[0.04] border-white/5'
      }`}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        <span className="text-lg leading-none mt-0.5" aria-hidden="true">{config.iconGlyph}</span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h5 className="text-xs font-bold text-white truncate">{fac.name}</h5>
            <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold border ${config.badgeClass}`}>
              {config.shortLabel}
            </span>
            <FacilityTenureBadge tenure={fac.tenure} />
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5 truncate">
            {fac.city}, {fac.country} ({fac.countryCode}) • {(fac.sqFt / 1000).toFixed(0)}k sq ft (~{fac.sqMeters.toLocaleString()} m²)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="text-right">
          <span className="text-[9px] text-zinc-500 block uppercase">Riesgo Nodo</span>
          <span className={`font-mono text-xs font-bold ${getRiskScoreColorClass(fac.geopoliticalRiskScore)}`}>
            {riskScore.toFixed(1)}/10
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-500" />
      </div>
    </div>
  );
}

export function FacilitiesDirectoryList({
  facilities,
  selectedFacility,
  isLoading,
  onSelectFacility,
}: FacilitiesDirectoryListProps) {
  return (
    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar max-h-[220px]">
      {facilities.map((fac) => (
        <FacilityDirectoryCard
          key={fac.id}
          fac={fac}
          isSelected={selectedFacility?.id === fac.id}
          onSelect={onSelectFacility}
        />
      ))}

      {facilities.length === 0 && !isLoading && (
        <div className="text-center py-8 text-xs text-zinc-500 font-mono">
          No se encontraron instalaciones corporativas para el filtro seleccionado.
        </div>
      )}
    </div>
  );
}
