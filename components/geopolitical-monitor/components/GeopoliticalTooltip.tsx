/**
 * @file GeopoliticalTooltip.tsx
 * @description Floating hover tooltip for country nodes on both 3D Globe and 2D Mercator views.
 */

'use client';

import React from 'react';
import { Cpu } from 'lucide-react';
import { CountryMacroData, CountryRiskInfo, GeoFeature, ThematicLayerCountryData } from '../types';

interface GeopoliticalTooltipProps {
  isPanelOpen: boolean;
  hoveredCountry: GeoFeature | null;
  countryData: CountryRiskInfo | undefined;
  tooltipPos: { x: number; y: number };
  cursorPos: { x: number; y: number };
  /** Optional: pre-cached macro data if this country was previously clicked */
  macroData?: CountryMacroData;
  /** Optional: thematic layer data for the hovered country */
  thematicData?: ThematicLayerCountryData;
}

export const GeopoliticalTooltip: React.FC<GeopoliticalTooltipProps> = ({
  isPanelOpen,
  hoveredCountry,
  countryData,
  tooltipPos,
  cursorPos,
  macroData,
  thematicData,
}) => {
  if (isPanelOpen || !hoveredCountry || (!countryData && !thematicData)) {
    return null;
  }

  const effectiveData: CountryRiskInfo = countryData || {
    name: hoveredCountry.properties?.ADMIN || hoveredCountry.properties?.NAME || hoveredCountry.polyId || 'Nodo Soberano',
    iso: (hoveredCountry.properties?.ISO_A3 && hoveredCountry.properties.ISO_A3 !== '-99')
      ? hoveredCountry.properties.ISO_A3
      : (hoveredCountry.properties?.ISO_A2 || hoveredCountry.properties?.ADM0_A3 || 'N/A'),
    risk: 50,
    indicator: '#94a3b8',
    friction: '5.0/10' as any,
    baseColor: 'rgba(15, 23, 42, 0.1)',
    baseStroke: 'rgba(51, 65, 85, 0.5)',
    aiExposure: 'Media' as const,
    textClass: 'text-zinc-400',
  };

  // Posicionamiento de tooltip blindado contra NaN
  const safeLeft = Number.isFinite(tooltipPos.x) && tooltipPos.x > 0
    ? tooltipPos.x
    : (Number.isFinite(cursorPos.x) && cursorPos.x > 0 ? cursorPos.x + 15 : 20);

  const safeTop = Number.isFinite(tooltipPos.y) && tooltipPos.y > 0
    ? tooltipPos.y
    : (Number.isFinite(cursorPos.y) && cursorPos.y > 0 ? cursorPos.y + 15 : 20);

  return (
    <div
      className="absolute z-40 bg-zinc-900/90 backdrop-blur-md rounded-lg overflow-hidden border border-zinc-700 shadow-2xl min-w-[220px] pointer-events-none transition-transform duration-75 animate-in fade-in zoom-in-95"
      style={{ left: `${safeLeft}px`, top: `${safeTop}px` }}
    >
      <div className="px-3 py-2 border-b border-zinc-700/50 flex items-center justify-between">
        <div>
          <div className="font-bold text-sm text-white">{effectiveData.name}</div>
          <div className="text-[10px] text-zinc-400 font-mono">ISO: {effectiveData.iso}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border"
            style={{
              color: effectiveData.indicator,
              borderColor: `${effectiveData.indicator}40`,
              backgroundColor: `${effectiveData.indicator}15`,
            }}
          >
            Riesgo {effectiveData.risk}
          </span>
          <span
            className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border"
            style={{
              color: effectiveData.risk <= 30 ? '#34d399' : effectiveData.risk <= 60 ? '#fbbf24' : '#f87171',
              borderColor: effectiveData.risk <= 30 ? 'rgba(52,211,153,0.4)' : effectiveData.risk <= 60 ? 'rgba(251,191,36,0.4)' : 'rgba(248,113,113,0.4)',
              backgroundColor: effectiveData.risk <= 30 ? 'rgba(52,211,153,0.1)' : effectiveData.risk <= 60 ? 'rgba(251,191,36,0.1)' : 'rgba(248,113,113,0.1)',
            }}
          >
            Estabilidad: {Math.max(1, Math.ceil((100 - effectiveData.risk) / 10))}/10
          </span>
        </div>
      </div>
      <div className="p-2 bg-zinc-950/40 text-[11px] text-zinc-400 space-y-1">
        {/* Thematic layer highlight */}
        {thematicData && (
          <div className="pb-1 mb-1 border-b border-zinc-800/60 font-sans">
            <div className="flex items-center justify-between font-semibold text-[10px]">
              <span
                className={
                  thematicData.colorCategory === 'critical'
                    ? 'text-rose-400'
                    : thematicData.colorCategory === 'high'
                    ? 'text-amber-300'
                    : thematicData.colorCategory === 'medium'
                    ? 'text-sky-300'
                    : thematicData.colorCategory === 'low'
                    ? 'text-emerald-300'
                    : 'text-zinc-200'
                }
              >
                {thematicData.label}
              </span>
              {thematicData.intensity !== undefined && (
                <span className="font-mono text-[9px] text-zinc-400">
                  {thematicData.intensity}%
                </span>
              )}
            </div>
            {thematicData.sublabel && (
              <p className="text-[9px] text-zinc-400 leading-tight mt-0.5">
                {thematicData.sublabel}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span>Fricción: {effectiveData.friction}</span>
          {effectiveData.pmiComposite !== undefined && (
            <span className="font-mono font-bold text-[10px] flex items-center gap-1 text-zinc-300">
              <span className="text-teal-400">PMI:</span> {effectiveData.pmiComposite.toFixed(1)}
              <span
                className={`px-1 py-0.2 rounded text-[9px] ${
                  effectiveData.pmiTrend === 'expansion'
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-rose-400 bg-rose-500/10'
                }`}
              >
                {effectiveData.pmiTrend === 'expansion' ? 'Exp.' : 'Contr.'}
              </span>
            </span>
          )}
        </div>

        {/* Macro summary line — shown only if country was previously clicked */}
        {macroData && macroData.dataConfidence !== 'none' && (
          <div className="flex items-center gap-2 pt-0.5 border-t border-zinc-800/60 text-[10px] font-mono">
            <span className="text-zinc-500">PIB:</span>
            <span className={`font-bold ${
              macroData.gdpGrowth.startsWith('-') ? 'text-rose-400' :
              macroData.gdpGrowth.startsWith('+') ? 'text-emerald-400' : 'text-zinc-300'
            }`}>{macroData.gdpGrowth}</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-500">IPC:</span>
            <span className="text-zinc-300 font-bold">{macroData.inflation}</span>
            <span className="text-zinc-600">·</span>
            <span className={`font-bold text-[9px] px-1 py-0.5 rounded ${
              macroData.dalioDebtCycle?.shortTermCyclePhase?.includes('Expansion') ||
              macroData.dalioDebtCycle?.shortTermCyclePhase?.includes('Early')
                ? 'bg-emerald-500/10 text-emerald-400'
                : macroData.dalioDebtCycle?.shortTermCyclePhase?.includes('Contraction')
                ? 'bg-rose-500/10 text-rose-400'
                : 'bg-amber-500/10 text-amber-400'
            }`}>
              {macroData.dalioDebtCycle?.shortTermCyclePhase || 'Ciclo ?'}
            </span>
          </div>
        )}

        <div className="text-teal-400/80 font-medium text-[10px] flex items-center justify-end gap-1 pt-0.5">
          <Cpu className="w-3 h-3" /> Clic para inspeccionar perfil
        </div>
      </div>
      <div className="h-1 w-full" style={{ backgroundColor: effectiveData.indicator }}></div>
    </div>
  );
};
