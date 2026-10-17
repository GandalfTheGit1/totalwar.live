/**
 * @file FacilityTacticalPopover.tsx
 * @description Floating tactical popover/tooltip for SEC Item 2 corporate facilities on 2D Map and 3D Globe.
 * Displays facility name, category glyph, location, area in sq ft/m², tenure (OWNED/LEASED),
 * and geopolitical node risk score.
 */

'use client';

import React from 'react';
import { X, ShieldAlert, Building2, MapPin, Maximize2, KeyRound, FileText } from 'lucide-react';
import { CorporateFacility, FACILITY_TYPE_CONFIG } from '../types';

export interface FacilityTacticalPopoverProps {
  facility: CorporateFacility | null;
  position: { x: number; y: number };
  onClose?: () => void;
  isPinned?: boolean;
}

export const FacilityTacticalPopover: React.FC<FacilityTacticalPopoverProps> = ({
  facility,
  position,
  onClose,
  isPinned = false,
}) => {
  if (!facility) return null;

  const config = FACILITY_TYPE_CONFIG[facility.functionalType];

  // Defensive clamping for screen boundary positioning
  const posX = Math.max(10, Math.min(position.x, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 340));
  const posY = Math.max(10, Math.min(position.y, (typeof window !== 'undefined' ? window.innerHeight : 800) - 320));

  const riskScore = facility.geopoliticalRiskScore ?? 3.5;
  const isHighRisk = riskScore >= 7.0;
  const isMediumRisk = riskScore >= 4.0 && riskScore < 7.0;

  const riskBadgeColor = isHighRisk
    ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
    : isMediumRisk
    ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

  const riskBarGradient = isHighRisk
    ? 'from-orange-500 to-rose-500'
    : isMediumRisk
    ? 'from-amber-500 to-yellow-400'
    : 'from-teal-500 to-emerald-400';

  const riskLabel = isHighRisk ? 'Riesgo Crítico' : isMediumRisk ? 'Riesgo Moderado' : 'Estable / Seguro';

  return (
    <div
      style={{ left: `${posX}px`, top: `${posY}px` }}
      className={`fixed z-50 pointer-events-auto transition-all duration-150 animate-in fade-in zoom-in-95 w-80 sm:w-88`}
      role="dialog"
      aria-label={`Detalles de instalación ${facility.name}`}
    >
      <div className="relative bg-zinc-950/95 backdrop-blur-xl border border-zinc-700/80 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] p-4 text-xs font-mono text-zinc-100 overflow-hidden">
        {/* Glow Header Accent Line */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: config.hexColor }}
        />

        {/* Top Header: Ticker & Category Badge */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 text-[10px] font-bold tracking-wider border border-zinc-700">
              {facility.ticker}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 ${config.badgeClass}`}
            >
              <span aria-hidden="true">{config.iconGlyph}</span>
              <span>{config.shortLabel}</span>
            </span>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Cerrar detalles de la instalación"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Facility Name */}
        <h4 className="text-sm font-bold text-white leading-snug mb-1 font-sans">
          {facility.name}
        </h4>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mb-3">
          <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <span className="truncate">
            {facility.city}
            {facility.stateProvince ? `, ${facility.stateProvince}` : ''} • {facility.country} ({facility.countryCode})
          </span>
        </div>

        {/* Technical Attributes Grid */}
        <div className="grid grid-cols-2 gap-2 p-2.5 bg-zinc-900/60 rounded-lg border border-zinc-800/80 mb-3">
          {/* Surface Area */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-zinc-400">
              <Maximize2 className="w-3 h-3 text-zinc-500" />
              <span>Superficie</span>
            </div>
            <div suppressHydrationWarning className="font-bold text-white text-[11px]">
              {facility.sqFt > 0 ? `${facility.sqFt.toLocaleString('en-US')} sq ft` : 'N/D'}
            </div>
            <div suppressHydrationWarning className="text-[9px] text-zinc-500">
              {facility.sqMeters > 0 ? `(~${facility.sqMeters.toLocaleString('en-US')} m²)` : ''}
            </div>
          </div>

          {/* Tenure (OWNED / LEASED) */}
          <div className="space-y-0.5 border-l border-zinc-800 pl-2.5">
            <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-zinc-400">
              <KeyRound className="w-3 h-3 text-zinc-500" />
              <span>Régimen</span>
            </div>
            <div className="flex items-center gap-1">
              {facility.tenure === 'OWNED' ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  EN PROPIEDAD
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  ARRENDADO
                </span>
              )}
            </div>
            <div className="text-[9px] text-zinc-500">Item 2 Form 10-K</div>
          </div>
        </div>

        {/* Geopolitical Node Risk */}
        <div className="space-y-1 mb-2.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="flex items-center gap-1 text-zinc-400 uppercase tracking-wider text-[9px]">
              <ShieldAlert className="w-3 h-3 text-zinc-500" />
              <span>Riesgo Geopolítico del Nodo</span>
            </span>
            <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold border ${riskBadgeColor}`}>
              {riskScore.toFixed(1)}/10 • {riskLabel}
            </span>
          </div>

          {/* Progress meter */}
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${riskBarGradient} transition-all duration-300`}
              style={{ width: `${Math.min(100, Math.max(5, riskScore * 10))}%` }}
            />
          </div>
        </div>

        {/* Operational Description */}
        {facility.description && (
          <p className="text-[10px] text-zinc-400 leading-relaxed border-t border-zinc-800/80 pt-2 font-sans italic">
            {facility.description}
          </p>
        )}

        {/* Coordinates footer */}
        <div className="flex items-center justify-between text-[9px] text-zinc-600 border-t border-zinc-800/60 pt-1.5 mt-2">
          <span>Lat: {facility.lat.toFixed(4)}° | Lng: {facility.lng.toFixed(4)}°</span>
          <span className="text-zinc-500 font-semibold">SEC Item 2 Verified</span>
        </div>
      </div>
    </div>
  );
};
