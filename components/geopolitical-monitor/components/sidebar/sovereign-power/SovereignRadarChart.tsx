'use client';

import React from 'react';
import { SovereignRadarScores, SovereignDimensionKey } from '@/lib/types/sovereign-power';

interface SovereignRadarChartProps {
  countryScores: SovereignRadarScores;
  globalScores?: SovereignRadarScores | null;
  superpowerScores?: SovereignRadarScores | null;
  warpedScores?: SovereignRadarScores | null;
  countryName: string;
  superpowerName?: string;
  showGlobal?: boolean;
  showSuperpower?: boolean;
  selectedDimension?: SovereignDimensionKey | null;
  onSelectDimension?: (dim: SovereignDimensionKey) => void;
  size?: number;
}

interface DimensionAxisConfig {
  key: SovereignDimensionKey;
  label: string;
  shortTag: string;
  angleDeg: number;
}

const AXIS_CONFIGS: DimensionAxisConfig[] = [
  { key: 'techInnovation', label: 'Tecnología e IA', shortTag: 'TEC', angleDeg: -90 }, // Top
  { key: 'politicalCabinet', label: 'Política y Gabinete', shortTag: 'POL', angleDeg: -30 }, // Top-Right
  { key: 'currencyHegemony', label: 'Moneda y Dalio', shortTag: 'DIV', angleDeg: 30 }, // Bottom-Right
  { key: 'tradeCompetitiveness', label: 'Comercio Exterior', shortTag: 'COM', angleDeg: 90 }, // Bottom
  { key: 'militaryCapacity', label: 'Capacidad Militar', shortTag: 'MIL', angleDeg: 150 }, // Bottom-Left
  { key: 'institutionalStability', label: 'Estado de Derecho', shortTag: 'EST', angleDeg: 210 } // Top-Left
];

export const SovereignRadarChart: React.FC<SovereignRadarChartProps> = ({
  countryScores,
  globalScores,
  superpowerScores,
  warpedScores,
  countryName,
  superpowerName = 'Superpotencia',
  showGlobal = true,
  showSuperpower = true,
  selectedDimension,
  onSelectDimension,
  size = 320
}) => {
  const center = size / 2;
  const radius = (size / 2) - 52;

  // Converts polar coordinates (angle in deg, value 0-100) to SVG (x, y)
  const polarToCartesian = (angleDeg: number, value: number) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angleRad);
    const y = center + r * Math.sin(angleRad);
    return { x, y };
  };

  // Builds polygon SVG points string
  const getPolygonPoints = (scores: SovereignRadarScores) => {
    return AXIS_CONFIGS.map(axis => {
      const val = Math.max(5, Math.min(100, scores[axis.key] || 0));
      const pt = polarToCartesian(axis.angleDeg, val);
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    }).join(' ');
  };

  // Concentric polygon grids (20, 40, 60, 80, 100)
  const gridLevels = [20, 40, 60, 80, 100];

  const hasWarped = warpedScores && Object.keys(warpedScores).some(
    k => warpedScores[k as SovereignDimensionKey] !== countryScores[k as SovereignDimensionKey]
  );

  return (
    <div className="relative flex flex-col items-center select-none">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
        role="img"
        aria-label={`Radar de Poder Soberano para ${countryName}`}
      >
        <defs>
          {/* Tactical Emerald/Cyan Gradient for Active Country */}
          <linearGradient id="activeCountryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.1" />
          </linearGradient>

          {/* Warped Pulse Gradient */}
          <linearGradient id="warpedShockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.15" />
          </linearGradient>

          {/* Glow Filters */}
          <filter id="glowEmerald" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glowRed" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ── Background Tactical Grid Reticle ── */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="#090d16"
          stroke="#1e293b"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Concentric Polygons */}
        {gridLevels.map((lvl) => {
          const points = AXIS_CONFIGS.map(axis => {
            const pt = polarToCartesian(axis.angleDeg, lvl);
            return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
          }).join(' ');

          return (
            <g key={`grid-${lvl}`}>
              <polygon
                points={points}
                fill={lvl === 100 ? '#0b1120' : 'none'}
                stroke={lvl === 100 ? '#334155' : lvl === 60 ? '#1e293b' : '#141e33'}
                strokeWidth={lvl === 100 ? '1.5' : '1'}
              />
              {/* Level indicator tick on vertical axis */}
              <text
                x={center + 4}
                y={center - ((lvl / 100) * radius) + 4}
                fill="#64748b"
                fontSize="8"
                fontFamily="monospace"
                className="select-none"
              >
                {lvl}
              </text>
            </g>
          );
        })}

        {/* ── Radial Axes & Tactical Crosshairs ── */}
        {AXIS_CONFIGS.map((axis) => {
          const endpoint = polarToCartesian(axis.angleDeg, 100);
          const isSelected = selectedDimension === axis.key;

          return (
            <g key={`axis-${axis.key}`}>
              <line
                x1={center}
                y1={center}
                x2={endpoint.x}
                y2={endpoint.y}
                stroke={isSelected ? '#38bdf8' : '#334155'}
                strokeWidth={isSelected ? '2' : '1'}
                strokeDasharray={isSelected ? 'none' : '2 2'}
              />
              {/* Endpoint Crosshair tick */}
              <circle
                cx={endpoint.x}
                cy={endpoint.y}
                r="2"
                fill={isSelected ? '#38bdf8' : '#475569'}
              />
            </g>
          );
        })}

        {/* ── Layer 1: Global Average Polygon (Amber / Dashed) ── */}
        {showGlobal && globalScores && (
          <g className="transition-all duration-300">
            <polygon
              points={getPolygonPoints(globalScores)}
              fill="rgba(245, 158, 11, 0.08)"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              strokeOpacity="0.8"
            />
          </g>
        )}

        {/* ── Layer 2: Superpower Benchmark Polygon (Crimson / Dotted) ── */}
        {showSuperpower && superpowerScores && (
          <g className="transition-all duration-300">
            <polygon
              points={getPolygonPoints(superpowerScores)}
              fill="rgba(239, 68, 68, 0.09)"
              stroke="#ef4444"
              strokeWidth="1.8"
              strokeDasharray="2 2"
              strokeOpacity="0.85"
              filter="url(#glowRed)"
            />
          </g>
        )}

        {/* ── Layer 3: Warped Stress-Testing Polygon (Amber-Crimson Warning Outline) ── */}
        {hasWarped && warpedScores && (
          <g className="animate-pulse">
            <polygon
              points={getPolygonPoints(warpedScores)}
              fill="url(#warpedShockGrad)"
              stroke="#f59e0b"
              strokeWidth="2.2"
              strokeDasharray="6 3"
              strokeOpacity="0.9"
            />
          </g>
        )}

        {/* ── Layer 4: Active Country Polygon (Emerald / Solid Neon) ── */}
        <g className="transition-all duration-300">
          <polygon
            points={getPolygonPoints(countryScores)}
            fill="url(#activeCountryGrad)"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeOpacity="0.95"
            filter="url(#glowEmerald)"
          />

          {/* Vertices Nodes */}
          {AXIS_CONFIGS.map((axis) => {
            const score = countryScores[axis.key] || 0;
            const pt = polarToCartesian(axis.angleDeg, score);
            const isSelected = selectedDimension === axis.key;

            return (
              <g
                key={`vertex-${axis.key}`}
                className="cursor-pointer group"
                onClick={() => onSelectDimension && onSelectDimension(axis.key)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 6 : 4.5}
                  fill={isSelected ? '#38bdf8' : '#10b981'}
                  stroke="#022c22"
                  strokeWidth="2"
                  className="transition-transform group-hover:scale-125"
                />
                {/* Score badge at vertex */}
                <text
                  x={pt.x}
                  y={pt.y - 8}
                  textAnchor="middle"
                  fill={isSelected ? '#38bdf8' : '#a7f3d0'}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                  className="pointer-events-none drop-shadow"
                >
                  {Math.round(score)}
                </text>
              </g>
            );
          })}
        </g>

        {/* ── Center Crosshair Target ── */}
        <circle cx={center} cy={center} r="3" fill="#38bdf8" />
        <line x1={center - 6} y1={center} x2={center + 6} y2={center} stroke="#38bdf8" strokeWidth="1" />
        <line x1={center} y1={center - 6} x2={center} y2={center + 6} stroke="#38bdf8" strokeWidth="1" />

        {/* ── Outer Labels & Tactical Badges ── */}
        {AXIS_CONFIGS.map((axis) => {
          const labelDist = radius + 22;
          const angleRad = (axis.angleDeg * Math.PI) / 180;
          const x = center + labelDist * Math.cos(angleRad);
          const y = center + labelDist * Math.sin(angleRad);
          const isSelected = selectedDimension === axis.key;

          return (
            <g
              key={`label-${axis.key}`}
              className="cursor-pointer group"
              onClick={() => onSelectDimension && onSelectDimension(axis.key)}
            >
              <rect
                x={x - 36}
                y={y - 12}
                width="72"
                height="24"
                rx="4"
                fill={isSelected ? '#0f172a' : '#090d16'}
                stroke={isSelected ? '#38bdf8' : '#1e293b'}
                strokeWidth={isSelected ? '1.5' : '1'}
                className="group-hover:stroke-teal-400 transition-colors"
              />
              <text
                x={x}
                y={y - 1}
                textAnchor="middle"
                fill={isSelected ? '#38bdf8' : '#38bdf8'}
                fontSize="8"
                fontFamily="monospace"
                fontWeight="900"
                className="pointer-events-none tracking-wider"
              >
                [{axis.shortTag}]
              </text>
              <text
                x={x}
                y={y + 8}
                textAnchor="middle"
                fill={isSelected ? '#f8fafc' : '#94a3b8'}
                fontSize="8"
                fontFamily="sans-serif"
                fontWeight="600"
                className="pointer-events-none truncate"
              >
                {axis.label.length > 12 ? `${axis.label.substring(0, 11)}…` : axis.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend Footer */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-2 text-[10px] font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-zinc-200 font-bold">{countryName}</span>
        </div>
        {showGlobal && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 border-t-2 border-dashed border-amber-400" />
            <span className="text-amber-400">Promedio Global</span>
          </div>
        )}
        {showSuperpower && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 border-t-2 border-dotted border-red-500" />
            <span className="text-rose-400">{superpowerName}</span>
          </div>
        )}
        {hasWarped && (
          <div className="flex items-center gap-1.5 animate-pulse">
            <span className="w-2.5 h-0.5 border-t-2 border-amber-300" />
            <span className="text-amber-300 font-bold">Simulación Activa</span>
          </div>
        )}
      </div>
    </div>
  );
};
