import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  prev?: string;
  valueClass?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export function MetricCard({ label, value, prev, valueClass = 'text-zinc-100', icon, badge }: MetricCardProps) {
  return (
    <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800 flex flex-col gap-1">
      <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
        {icon}{label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className={`font-mono font-black text-xl ${valueClass}`}>{value}</span>
        {prev && prev !== 'N/A' && (
          <span className="text-[10px] text-zinc-500 font-mono">ant: {prev}</span>
        )}
      </div>
      {badge}
    </div>
  );
}
