'use client';

import React from 'react';
import { ReconstructedNodeState, TechNodeStatus } from '@/lib/data/tech-tree/types';

interface TechNodeBadgeProps {
  node: ReconstructedNodeState;
  onSelect?: (node: ReconstructedNodeState) => void;
  isSelected?: boolean;
}

const STATUS_META: Record<
  TechNodeStatus,
  {
    shapeSymbol: string;
    labelEs: string;
    badgeClass: string;
    cardBorder: string;
  }
> = {
  no_alcanzado: {
    shapeSymbol: '○',
    labelEs: 'No alcanzado',
    badgeClass: 'bg-zinc-900 text-zinc-400 border-zinc-700 border-dashed',
    cardBorder: 'border-zinc-800/80 bg-zinc-950/60 opacity-75',
  },
  anunciado: {
    shapeSymbol: '◇',
    labelEs: 'Anunciado',
    badgeClass: 'bg-amber-950/60 text-amber-300 border-amber-600/60',
    cardBorder: 'border-amber-700/50 bg-zinc-900/80',
  },
  prototipo: {
    shapeSymbol: '△',
    labelEs: 'Prototipo',
    badgeClass: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/60',
    cardBorder: 'border-cyan-600/50 bg-zinc-900/90',
  },
  produccion: {
    shapeSymbol: '■',
    labelEs: 'Producción',
    badgeClass: 'bg-teal-950/70 text-teal-300 border-teal-500/70',
    cardBorder: 'border-teal-500/60 bg-zinc-900',
  },
  exportacion: {
    shapeSymbol: '★',
    labelEs: 'Exportación',
    badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-400',
    cardBorder: 'border-emerald-400/70 bg-zinc-900 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
  },
};

const VIA_LABELS: Record<string, string> = {
  propio: 'Desarrollo propio',
  licencia: 'Por licencia',
  compra: 'Por compra',
};

export const TechNodeBadge: React.FC<TechNodeBadgeProps> = ({
  node,
  onSelect,
  isSelected,
}) => {
  const meta = STATUS_META[node.estado] || STATUS_META.no_alcanzado;

  const borderStyle = node.bloqueado_por_sancion
    ? 'border-red-500/80 bg-red-950/25'
    : meta.cardBorder;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(node)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(node);
        }
      }}
      data-testid={`tech-node-${node.nodeId}`}
      aria-label={`Nivel ${node.nivel}: ${node.nombre} - Estado: ${meta.labelEs}`}
      className={`p-2.5 rounded-lg border transition-all cursor-pointer font-mono text-left space-y-1.5 ${borderStyle} ${
        isSelected ? 'ring-1 ring-teal-400' : ''
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-1">
        <span className="text-[11px] font-bold text-zinc-100">
          N{node.nivel}. {node.nombre}
        </span>

        {/* Accessible Status Indicator: Shape + Text + Color */}
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded border font-bold inline-flex items-center gap-1 ${meta.badgeClass}`}
        >
          <span aria-hidden="true">{meta.shapeSymbol}</span>
          <span>{meta.labelEs}</span>
        </span>
      </div>

      <p className="text-[10px] text-zinc-400 leading-snug font-sans">
        {node.criterio}
      </p>

      {/* Special Marks: Sanction Block, Regression, Via, Auto News */}
      <div className="flex flex-wrap items-center gap-1 pt-0.5">
        {node.bloqueado_por_sancion && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950/90 text-red-300 border border-red-500 font-bold">
            ■ BLOQUEADO POR SANCIÓN
          </span>
        )}
        {node.retroceso && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-950/90 text-orange-300 border border-orange-500 font-bold">
            ▼ RETROCESO
          </span>
        )}
        {node.via && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
            Vía: {VIA_LABELS[node.via] || node.via}
          </span>
        )}
        {node.actualizado_por_noticias && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-500/60 font-bold">
            ⚡ actualizado por noticias
          </span>
        )}
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
          Evidencia: {node.etiqueta}
        </span>
      </div>

      {/* Provenance: Date & Sources */}
      {node.fecha_hecho && (
        <div className="text-[9px] text-zinc-400 border-t border-zinc-800/80 pt-1 space-y-0.5">
          <div className="flex flex-wrap justify-between gap-1">
            <span>
              Hecho: <strong className="text-zinc-200">{node.fecha_hecho}</strong> (Conocible: {node.fecha_conocible})
            </span>
            <span>Fuentes ({node.fuentes.length})</span>
          </div>
          {node.fuentes.length > 0 && (
            <div className="flex flex-col gap-0.5">
              {node.fuentes.map((f, idx) => (
                <span
                  key={idx}
                  className="text-teal-300 truncate"
                  title={f.nombre}
                >
                  Fuente {idx + 1}: {f.nombre}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
