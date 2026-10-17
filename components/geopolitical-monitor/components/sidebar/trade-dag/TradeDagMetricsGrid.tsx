'use client';

import React from 'react';
import {
  TrendingDown,
  ShieldCheck,
  Network,
  ShieldAlert
} from 'lucide-react';
import type { TradeDagMetrics } from '@/lib/services/trade-dag-service';

interface TradeDagMetricsGridProps {
  metrics: TradeDagMetrics;
}

interface MetricCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  badgeClass: string;
  badgeText: string;
  value: string;
  unit: string;
  description: string;
}

function MetricCard({ title, icon: Icon, iconClass, badgeClass, badgeText, value, unit, description }: MetricCardProps) {
  return (
    <div className="bg-zinc-900/90 p-2.5 rounded-lg border border-zinc-800 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
          <Icon className={`w-3 h-3 ${iconClass}`} /> {title}
        </span>
        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${badgeClass}`}>
          {badgeText}
        </span>
      </div>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="font-mono font-black text-xl text-zinc-100">{value}</span>
        <span className="text-[10px] text-zinc-500 font-mono">{unit}</span>
      </div>
      <span className="text-[9px] text-zinc-500 mt-1 block">{description}</span>
    </div>
  );
}

function resolveMarginBadge(marginDrainPercentage: number) {
  if (marginDrainPercentage > 35) return { cls: 'bg-rose-500/10 text-rose-400 border-rose-500/30', txt: 'CRÍTICO' };
  if (marginDrainPercentage > 15) return { cls: 'bg-amber-500/10 text-amber-400 border-amber-500/30', txt: 'MODERADO' };
  return { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', txt: 'EFICIENTE' };
}

function resolveFcfBadge(fcfCaptureRatio: number) {
  if (fcfCaptureRatio >= 0.70) return { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', txt: 'FOSO FUERTE' };
  if (fcfCaptureRatio >= 0.50) return { cls: 'bg-sky-500/10 text-sky-400 border-sky-500/30', txt: 'EQUILIBRADO' };
  return { cls: 'bg-rose-500/10 text-rose-400 border-rose-500/30', txt: 'EROSIÓN' };
}

function resolveSteeringBadge(tradeSteeringRisk: number) {
  if (tradeSteeringRisk >= 65) return { cls: 'bg-rose-500/10 text-rose-400 border-rose-500/30', txt: 'ALTO BYPASS' };
  if (tradeSteeringRisk >= 35) return { cls: 'bg-amber-500/10 text-amber-400 border-amber-500/30', txt: 'VULNERABLE' };
  return { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', txt: 'BLINDADO' };
}

function resolveChokepointBadge(chokepointExposure: number) {
  if (chokepointExposure >= 60) return { cls: 'bg-purple-500/10 text-purple-400 border-purple-500/30', txt: 'CRÍTICO' };
  if (chokepointExposure >= 30) return { cls: 'bg-sky-500/10 text-sky-400 border-sky-500/30', txt: 'MODERADO' };
  return { cls: 'bg-zinc-700/20 text-zinc-400 border-zinc-700/30', txt: 'BAJO' };
}

export function TradeDagMetricsGrid({ metrics }: TradeDagMetricsGridProps) {
  const mBadge = resolveMarginBadge(metrics.marginDrainPercentage);
  const fBadge = resolveFcfBadge(metrics.fcfCaptureRatio);
  const sBadge = resolveSteeringBadge(metrics.tradeSteeringRisk);
  const cBadge = resolveChokepointBadge(metrics.chokepointExposure);

  const cards = [
    { title: 'Drenaje Margen', icon: TrendingDown, iconClass: 'text-rose-400', badgeClass: mBadge.cls, badgeText: mBadge.txt, value: `${metrics.marginDrainPercentage.toFixed(1)}%`, unit: 'disipado', description: 'Margen perdido en intermediarios comoditizados' },
    { title: 'Captura FCF', icon: ShieldCheck, iconClass: 'text-emerald-400', badgeClass: fBadge.cls, badgeText: fBadge.txt, value: `${(metrics.fcfCaptureRatio * 100).toFixed(1)}%`, unit: 'en End Nodes', description: 'Flujo libre retenido por propiedad intelectual / marca' },
    { title: 'Trade Steering', icon: Network, iconClass: 'text-amber-400', badgeClass: sBadge.cls, badgeText: sBadge.txt, value: `${metrics.tradeSteeringRisk.toFixed(1)}%`, unit: 'índice', description: 'Vulnerabilidad a ser desintermediado / bypassado' },
    { title: 'Chokepoints', icon: ShieldAlert, iconClass: 'text-purple-400', badgeClass: cBadge.cls, badgeText: cBadge.txt, value: `${metrics.chokepointExposure.toFixed(1)}%`, unit: 'cuello botella', description: 'Dependencia en monopolios u oligopolios intermedios' }
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {cards.map((card, i) => (
        <MetricCard key={i} {...card} />
      ))}
    </div>
  );
}
