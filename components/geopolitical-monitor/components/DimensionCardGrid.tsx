import React from 'react';
import { DimensionAnalysis } from '@/lib/types/geopolitical-extended';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface DimensionCardProps {
  title: string;
  data: DimensionAnalysis;
  colorClass: string;
}

export const DimensionCard: React.FC<DimensionCardProps> = ({ title, data, colorClass }) => {
  if (!data) return null;

  const scoreClass = data.score >= 7 ? 'text-emerald-400' : data.score >= 4 ? 'text-amber-400' : 'text-rose-400';
  
  return (
    <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-xl p-3 mb-3">
      <div className="flex items-center justify-between mb-2 border-b border-zinc-700/50 pb-2">
        <h5 className={`text-xs font-bold uppercase tracking-wider ${colorClass}`}>{title}</h5>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
            data.confidence === 'HIGH' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 
            data.confidence === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 
            'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}>
            {data.confidence} CONF
          </span>
          <span className={`text-sm font-black ${scoreClass}`}>{data.score}/10</span>
        </div>
      </div>
      
      <div className="space-y-2 mt-2">
        {data.keyInsights && data.keyInsights.length > 0 && (
          <div>
            <span className="text-[10px] text-zinc-400 font-bold mb-1 flex items-center gap-1">
              <Info className="w-3 h-3 text-zinc-400" /> Insights Clave
            </span>
            <ul className="space-y-1">
              {data.keyInsights.slice(0, 2).map((insight, idx) => (
                <li key={idx} className="text-[11px] text-zinc-300 flex items-start gap-1.5 leading-tight">
                  <span className="text-zinc-500 mt-0.5">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {data.vulnerabilities && data.vulnerabilities.length > 0 && (
          <div className="mt-2 pt-2 border-t border-zinc-800/50">
            <span className="text-[10px] text-zinc-400 font-bold mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-400" /> Vulnerabilidades
            </span>
            <ul className="space-y-1">
              {data.vulnerabilities.slice(0, 2).map((vuln, idx) => (
                <li key={idx} className="text-[11px] text-zinc-300 flex items-start gap-1.5 leading-tight">
                  <span className="text-rose-500 mt-0.5">•</span>
                  <span>{vuln}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
