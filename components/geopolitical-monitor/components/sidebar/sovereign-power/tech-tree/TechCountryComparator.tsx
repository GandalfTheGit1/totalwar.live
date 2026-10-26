'use client';

import React, { useState } from 'react';
import {
  compareCountriesTech,
  TECH_TREE_CONFIG,
  TechTreeEvent,
  getTechTreeEvents,
} from '@/lib/data/tech-tree';

interface TechCountryComparatorProps {
  primaryCountry: string;
  year: number;
  events?: TechTreeEvent[];
}

export const TechCountryComparator: React.FC<TechCountryComparatorProps> = ({
  primaryCountry,
  year,
  events,
}) => {
  const defaultSecond = primaryCountry === 'US' ? 'CN' : 'US';
  const [secondCountry, setSecondCountry] = useState<string>(defaultSecond);

  const activeEvents = events ?? getTechTreeEvents();
  const comparison = compareCountriesTech(
    primaryCountry,
    secondCountry,
    year,
    activeEvents
  );

  return (
    <div
      data-testid="tech-country-comparator"
      className="bg-zinc-950/90 p-3 rounded-xl border border-zinc-800 space-y-3 font-mono"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h5 className="text-xs font-bold text-teal-300 uppercase">
            Comparador Lado a Lado & Velocidad ({year})
          </h5>
          <p className="text-[10px] text-zinc-400">
            Mide niveles alcanzados y velocidad de avance (años promedio entre niveles)
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-teal-300 font-bold">
            {comparison.paisA} ({comparison.scoreA} pts)
          </span>
          <span className="text-zinc-500">vs</span>
          <select
            aria-label="Seleccionar segundo país para comparar"
            value={secondCountry}
            onChange={(e) => setSecondCountry(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 text-amber-300 rounded px-2 py-0.5 font-bold"
          >
            {TECH_TREE_CONFIG.pilotCountries.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
          <span className="text-amber-300 font-bold">({comparison.scoreB} pts)</span>
        </div>
      </div>

      {/* Global Speed Summary */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800">
          <span className="text-zinc-400 block">Velocidad media {comparison.paisA}:</span>
          <strong className="text-teal-300 text-xs">
            {comparison.anosPromedioGlobalA !== null
              ? `${comparison.anosPromedioGlobalA} años / nivel`
              : 'Sin saltos multinivel'}
          </strong>
        </div>
        <div className="p-2 rounded bg-zinc-900/80 border border-zinc-800">
          <span className="text-zinc-400 block">Velocidad media {comparison.paisB}:</span>
          <strong className="text-amber-300 text-xs">
            {comparison.anosPromedioGlobalB !== null
              ? `${comparison.anosPromedioGlobalB} años / nivel`
              : 'Sin saltos multinivel'}
          </strong>
        </div>
      </div>

      {/* Area-by-Area Side-by-Side Table */}
      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
        {comparison.areas.map((row) => (
          <div
            key={row.areaId}
            className="p-2 rounded bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-[10px]"
          >
            <span className="font-bold text-zinc-200 w-2/5 truncate">
              {row.nombreArea}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-teal-300">
                {comparison.paisA}: <strong>N{row.maxNivelPaisA}</strong>
                {row.anosPromedioEntreNivelesA !== null && (
                  <span className="text-zinc-400"> ({row.anosPromedioEntreNivelesA}a/niv)</span>
                )}
              </span>
              <span className="text-amber-300">
                {comparison.paisB}: <strong>N{row.maxNivelPaisB}</strong>
                {row.anosPromedioEntreNivelesB !== null && (
                  <span className="text-zinc-400"> ({row.anosPromedioEntreNivelesB}a/niv)</span>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
