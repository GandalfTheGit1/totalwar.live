'use client';

import React, { useState } from 'react';
import {
  getChoroplethByArea,
  TECH_TREE_AREAS,
  TechAreaId,
  TechTreeEvent,
} from '@/lib/data/tech-tree';

interface TechChoroplethViewProps {
  year: number;
  selectedArea: TechAreaId;
  onSelectArea: (area: TechAreaId) => void;
  events?: TechTreeEvent[];
}

const COUNTRY_COORDS: Record<string, { name: string; x: number; y: number }> = {
  US: { name: 'EE. UU.', x: 85, y: 72 },
  DE: { name: 'Alemania', x: 205, y: 58 },
  NL: { name: 'Países Bajos', x: 192, y: 52 },
  RU: { name: 'Rusia', x: 275, y: 45 },
  CN: { name: 'China', x: 315, y: 82 },
  TW: { name: 'Taiwán', x: 342, y: 98 },
  JP: { name: 'Japón', x: 365, y: 76 },
};

const STATUS_SHAPE: Record<string, string> = {
  no_alcanzado: '○',
  anunciado: '◇',
  prototipo: '△',
  produccion: '■',
  exportacion: '★',
};

export const TechChoroplethView: React.FC<TechChoroplethViewProps> = ({
  year,
  selectedArea,
  onSelectArea,
  events,
}) => {
  const areaDef = TECH_TREE_AREAS.find((a) => a.id === selectedArea) || TECH_TREE_AREAS[0];
  const [targetNivel, setTargetNivel] = useState<number>(areaDef.niveles.length);

  const effectiveNivel = Math.min(targetNivel, areaDef.niveles.length);
  const cells = getChoroplethByArea(selectedArea, year, effectiveNivel, events);
  const selectedLevelDef =
    areaDef.niveles.find((l) => l.nivel === effectiveNivel) || areaDef.niveles[0];

  return (
    <div
      data-testid="tech-choropleth-map"
      className="bg-zinc-950/90 p-3 rounded-xl border border-zinc-800 space-y-3 font-mono"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h5 className="text-xs font-bold text-teal-300 uppercase">
            Mapa Coroplético por Área ({year})
          </h5>
          <p className="text-[10px] text-zinc-400">
            Quién tenía «{selectedLevelDef.nombre}» en el año {year}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <select
            aria-label="Seleccionar área del mapa"
            value={selectedArea}
            onChange={(e) => {
              const nextArea = e.target.value as TechAreaId;
              const nextDef = TECH_TREE_AREAS.find((a) => a.id === nextArea);
              onSelectArea(nextArea);
              setTargetNivel(nextDef ? nextDef.niveles.length : 1);
            }}
            className="bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 rounded px-2 py-1"
          >
            {TECH_TREE_AREAS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>

          <select
            aria-label="Seleccionar nivel del mapa"
            value={effectiveNivel}
            onChange={(e) => setTargetNivel(Number(e.target.value))}
            className="bg-zinc-900 border border-zinc-700 text-xs text-teal-300 rounded px-2 py-1"
          >
            {areaDef.niveles.map((lvl) => (
              <option key={lvl.id} value={lvl.nivel}>
                N{lvl.nivel}: {lvl.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Shareable SVG Choropleth Canvas */}
      <div className="bg-zinc-900/70 rounded-lg border border-zinc-800 p-2">
        <svg
          viewBox="0 0 420 155"
          className="w-full h-36"
          role="img"
          aria-label={`Mapa tecnológico de ${areaDef.nombre} en ${year}`}
        >
          <rect width="420" height="155" fill="#09090b" rx="8" />
          {cells.map((c) => {
            const coord = COUNTRY_COORDS[c.pais] || { name: c.pais, x: 50, y: 50 };
            const reached = c.estadoNivelSeleccionado !== 'no_alcanzado';
            const shape = STATUS_SHAPE[c.estadoNivelSeleccionado] || '○';
            const fill = c.bloqueadoPorSancion
              ? '#ef4444'
              : reached
              ? '#009E73'
              : '#27272a';
            return (
              <g key={c.pais} transform={`translate(${coord.x}, ${coord.y})`}>
                <circle
                  r={14}
                  fill={fill}
                  fillOpacity={0.28}
                  stroke={fill}
                  strokeWidth={1.8}
                  strokeDasharray={c.bloqueadoPorSancion ? '2 2' : undefined}
                />
                <text
                  textAnchor="middle"
                  dy="-1"
                  fill="#f4f4f5"
                  fontSize="8.5"
                  fontWeight="bold"
                >
                  {shape} {c.pais}
                </text>
                <text
                  textAnchor="middle"
                  dy="8"
                  fill="#a1a1aa"
                  fontSize="7"
                >
                  N{c.maxNivelAlcanzado}{c.bloqueadoPorSancion ? ' !' : ''}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Country Status Table for Selected Level (Shape + Text + Color) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
        {cells.map((c) => {
          const shape = STATUS_SHAPE[c.estadoNivelSeleccionado] || '○';
          return (
            <div
              key={c.pais}
              className={`p-1.5 rounded border ${
                c.bloqueadoPorSancion
                  ? 'border-red-500/70 bg-red-950/20 text-red-200'
                  : c.estadoNivelSeleccionado !== 'no_alcanzado'
                  ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-200'
                  : 'border-zinc-800 bg-zinc-900/50 text-zinc-400'
              }`}
            >
              <div className="flex justify-between font-bold">
                <span>{COUNTRY_COORDS[c.pais]?.name || c.pais}</span>
                <span>Máx N{c.maxNivelAlcanzado}</span>
              </div>
              <div className="text-[9px] mt-0.5">
                {shape} N{effectiveNivel}: {c.estadoNivelSeleccionado}
                {c.via ? ` (${c.via})` : ''}
              </div>
              {c.bloqueadoPorSancion && (
                <div className="text-[8px] font-bold text-red-300 mt-0.5">
                  ■ BLOQUEADO POR SANCIÓN
                </div>
              )}
              {c.retroceso && (
                <div className="text-[8px] font-bold text-orange-300 mt-0.5">
                  ▼ RETROCESO
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
