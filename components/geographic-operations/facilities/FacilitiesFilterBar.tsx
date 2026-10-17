/**
 * components/geographic-operations/facilities/FacilitiesFilterBar.tsx
 *
 * Filter tabs for facility functional categories and real-time search input.
 */

'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { FacilityStats } from '@/lib/services/geographic/sec-properties-service';
import { FacilitiesFilterBarProps, FacilityCategoryFilter } from './types';

interface TabMeta {
  id: FacilityCategoryFilter;
  icon?: string;
  label: string;
  getCount: (stats: FacilityStats) => number;
  activeClass: string;
  hoverClass: string;
}

const FACILITY_TAB_DEFINITIONS: TabMeta[] = [
  {
    id: 'ALL',
    label: 'Todas',
    getCount: s => s.totalFacilities,
    activeClass: 'bg-white/10 text-white shadow-sm border border-white/10',
    hoverClass: 'text-zinc-400 hover:text-zinc-200'
  },
  {
    id: 'HQ',
    icon: '🏢',
    label: 'HQ',
    getCount: s => s.byFunctionalType.HQ,
    activeClass: 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm',
    hoverClass: 'text-zinc-400 hover:text-sky-300'
  },
  {
    id: 'MANUFACTURING',
    icon: '🏭',
    label: 'Manufactura',
    getCount: s => s.byFunctionalType.MANUFACTURING,
    activeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm',
    hoverClass: 'text-zinc-400 hover:text-emerald-300'
  },
  {
    id: 'RND',
    icon: '🔬',
    label: 'I+D',
    getCount: s => s.byFunctionalType.RND,
    activeClass: 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm',
    hoverClass: 'text-zinc-400 hover:text-purple-300'
  },
  {
    id: 'LOGISTICS_DATACENTER',
    icon: '📦',
    label: 'Datacenter',
    getCount: s => s.byFunctionalType.LOGISTICS_DATACENTER,
    activeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm',
    hoverClass: 'text-zinc-400 hover:text-amber-300'
  }
];

export function FacilitiesFilterBar({
  stats,
  functionalFilter,
  searchQuery,
  onFilterChange,
  onSearchChange,
}: FacilitiesFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
      <div className="flex items-center gap-1 bg-white/[0.02] border border-white/5 p-1 rounded-xl overflow-x-auto text-[10px] font-mono">
        {FACILITY_TAB_DEFINITIONS.map((tab) => {
          const isActive = functionalFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onFilterChange(tab.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                isActive ? tab.activeClass : tab.hoverClass
              }`}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label} ({tab.getCount(stats)})</span>
            </button>
          );
        })}
      </div>

      <div className="relative w-full sm:w-48">
        <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar planta o ciudad..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-8 pr-3 py-1 bg-white/[0.02] border border-white/5 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
        />
      </div>
    </div>
  );
}
