'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useHoi4Mechanics } from '../../hooks/useHoi4Mechanics';

export const WorldTensionWidget: React.FC = () => {
  const { worldTension, isLoadingTension } = useHoi4Mechanics({});

  if (isLoadingTension) {
    return (
      <div className="bg-zinc-900/90 border border-zinc-700 p-3 rounded-lg w-48 shadow-lg">
        <div className="animate-pulse h-4 bg-zinc-800 rounded w-full mb-2"></div>
        <div className="animate-pulse h-2 bg-zinc-800 rounded w-full"></div>
      </div>
    );
  }

  if (!worldTension) return null;

  const { tensionIndex, source } = worldTension;
  
  let label = 'PEACETIME';
  let gradientStr = 'from-emerald-500 to-emerald-600';
  let isPulsing = false;

  if (tensionIndex >= 80) {
    label = 'WAR FOOTING';
    gradientStr = 'from-red-600 to-red-900';
    isPulsing = true;
  } else if (tensionIndex >= 60) {
    label = 'CRISIS';
    gradientStr = 'from-red-500 to-red-600';
  } else if (tensionIndex >= 30) {
    label = 'ELEVATED';
    gradientStr = 'from-amber-400 to-amber-600';
  }

  return (
    <div className="bg-slate-900/90 border border-slate-700/50 p-3 rounded-lg w-64 shadow-2xl relative group overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest font-mono">
          World Tension
        </h3>
        {source === 'gdelt' ? (
          <span className="text-[9px] text-red-400 font-bold px-1.5 py-0.5 bg-red-400/10 rounded animate-pulse">
            🔴 LIVE
          </span>
        ) : (
          <span className="text-[9px] text-amber-400 font-bold px-1.5 py-0.5 bg-amber-400/10 rounded">
            ⚡ FALLBACK
          </span>
        )}
      </div>

      {/* Thermometer */}
      <div className="relative h-4 bg-slate-800 rounded-full border border-slate-950 overflow-hidden mb-1">
        <motion.div
          className={`absolute top-0 left-0 h-full bg-gradient-to-r ${gradientStr}`}
          initial={{ width: 0 }}
          animate={{ width: `${tensionIndex}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        {isPulsing && (
           <motion.div
            className="absolute top-0 left-0 h-full w-full bg-red-500 opacity-20"
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
           />
        )}
        <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
          <span className="text-[8px] font-black text-white/50">0</span>
          <span className="text-[8px] font-black text-white/50">50</span>
          <span className="text-[8px] font-black text-white/50">100</span>
        </div>
      </div>

      {/* Label & Value */}
      <div className="flex justify-between items-end">
        <span className="text-xs font-bold text-slate-200">{label}</span>
        <span className="text-xl font-black text-white font-mono leading-none tracking-tighter">
          {Math.round(tensionIndex)}%
        </span>
      </div>

      {/* Hover Breakdown */}
      <div className="absolute inset-0 bg-slate-900/95 p-3 flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden group-hover:flex">
        <p className="text-[10px] text-slate-300 mb-1">Avg Tone: <span className="text-white font-mono">{worldTension.details.avgTone.toFixed(2)}</span></p>
        <p className="text-[10px] text-slate-300 mb-1">Articles: <span className="text-white font-mono">{worldTension.details.articleCount}</span></p>
        {worldTension.reason && (
          <p className="text-[9px] text-amber-400 leading-tight">Fallback Reason: {worldTension.reason}</p>
        )}
      </div>
    </div>
  );
};
