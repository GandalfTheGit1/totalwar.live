'use client';

import React, { useState } from 'react';
import {
  getTechTreeEvents,
  revertTechTreeEvent,
  restoreTechTreeEvent,
  stateAt,
  TechTreeEvent,
} from '@/lib/data/tech-tree';
import { getTechTreeTelemetrySummary } from '@/lib/services/tech-tree/telemetry';
import { RotateCcw, CheckCircle2, BarChart3, ShieldAlert } from 'lucide-react';

export const TechTreeDevConsole: React.FC = () => {
  const [events, setEvents] = useState<TechTreeEvent[]>(() => getTechTreeEvents());
  const [telemetry, setTelemetry] = useState(() => getTechTreeTelemetrySummary());

  const autoEvents = events.filter((e) => e.origen === 'noticia_auto');

  const handleToggleRevert = (ev: TechTreeEvent) => {
    const nextAction = ev.revertido ? 'restore' : 'revert';
    if (ev.revertido) {
      restoreTechTreeEvent(ev.id);
    } else {
      revertTechTreeEvent(ev.id);
    }
    setEvents(getTechTreeEvents());
    setTelemetry(getTechTreeTelemetrySummary());

    if (typeof fetch === 'function') {
      Promise.resolve(
        fetch('/api/dev/tech-tree', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: nextAction, eventId: ev.id }),
        })
      ).catch(() => {
        // Ignore network errors in offline/JSDOM test environments; local store is already updated
      });
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 font-mono text-zinc-100 bg-zinc-950 min-h-screen">
      <div className="border-b border-zinc-800 pb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black text-teal-400 uppercase">
            [DEV] Auditoría del Árbol Tecnológico Histórico & Telemetría
          </h1>
          <p className="text-xs text-zinc-400">
            Revisión de desbloqueos automáticos por noticias (GDELT ≥2 fuentes independientes, tope en prototipo) y métricas de investigación de mercado.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-teal-300">
          Versión Árbol: v{telemetry.versionArbol}
        </span>
      </div>

      {/* ── Section 1: Automatic News Unlocks & Revert Controls ── */}
      <section className="space-y-3" data-testid="dev-auto-unlocks-section">
        <h2 className="text-sm font-bold text-amber-300 flex items-center gap-2 uppercase">
          <ShieldAlert className="w-4 h-4" />
          <span>Registro de Desbloqueos Automáticos ({autoEvents.length})</span>
        </h2>

        <div className="space-y-3">
          {autoEvents.map((ev) => {
            const currentTree = stateAt(ev.pais, 2026, events);
            const currentNode = currentTree.areas[ev.area]?.nodos.find(
              (n) => n.nivel === ev.nivel
            );

            return (
              <div
                key={ev.id}
                data-testid={`dev-auto-event-${ev.id}`}
                className={`p-4 rounded-xl border space-y-2 ${
                  ev.revertido
                    ? 'border-red-500/50 bg-red-950/15 opacity-80'
                    : 'border-zinc-800 bg-zinc-900/70'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs font-bold rounded bg-teal-500/20 text-teal-300 border border-teal-500/40">
                      {ev.pais} · {ev.area} · Nivel {ev.nivel}
                    </span>
                    <span className="text-xs text-cyan-300 font-bold">
                      Estado aplicado: {ev.estado_nuevo}
                    </span>
                    <span className="text-xs text-zinc-400">
                      (Estado actual en stateAt: <strong>{currentNode?.estado}</strong>)
                    </span>
                  </div>

                  <button
                    type="button"
                    data-testid={`revert-btn-${ev.id}`}
                    onClick={() => handleToggleRevert(ev)}
                    className={`px-3 py-1 rounded text-xs font-bold border flex items-center gap-1.5 cursor-pointer ${
                      ev.revertido
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-red-500/20 text-red-300 border-red-500/50 hover:bg-red-500/30'
                    }`}
                  >
                    {ev.revertido ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Restaurar Desbloqueo</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Revertir</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-zinc-200 font-sans">{ev.resumen}</p>

                <div className="text-[11px] text-zinc-400 space-y-1 pt-1 border-t border-zinc-800/80">
                  <div>
                    Fecha hecho: <strong>{ev.fecha_hecho}</strong> | Fecha conocible:{' '}
                    <strong>{ev.fecha_conocible}</strong> | Etiqueta: <strong>{ev.etiqueta}</strong>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ev.fuentes.map((f, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300"
                      >
                        [{f.agencia_origen || 'Fuente'}] {f.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Section 2: Anonymous Market Research Telemetry ── */}
      <section className="space-y-3" data-testid="dev-telemetry-section">
        <h2 className="text-sm font-bold text-sky-300 flex items-center gap-2 uppercase">
          <BarChart3 className="w-4 h-4" />
          <span>Telemetría Anónima (Meta: Investigación de Mercado #0072B2)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase block">
              Consultas País-Área
            </span>
            <span className="text-xl font-black text-sky-400">
              {telemetry.uniqueCountryAreaQueries} / {telemetry.targetUniqueQueries}
            </span>
            <span className="text-[10px] text-zinc-500 block">
              Umbral en {telemetry.evaluationWindowDays} días (Suposición)
            </span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase block">
              Aperturas del Comparador
            </span>
            <span className="text-xl font-black text-teal-400">
              {telemetry.comparatorOpens}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase block">
              Uso del Deslizador de Años
            </span>
            <span className="text-xl font-black text-amber-400">
              {telemetry.sliderUses}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-2">
          <h3 className="text-xs font-bold text-zinc-300 uppercase">
            Top 5 Pares País-Área Más Consultados
          </h3>
          {telemetry.topCountryAreaPairs.length === 0 ? (
            <p className="text-xs text-zinc-500">Sin consultas registradas aún.</p>
          ) : (
            <div className="space-y-1">
              {telemetry.topCountryAreaPairs.map((pair, idx) => (
                <div
                  key={pair.pairKey}
                  className="flex items-center justify-between text-xs p-1.5 rounded bg-zinc-950 border border-zinc-800"
                >
                  <span>
                    #{idx + 1} <strong>{pair.pais}</strong> — {pair.area}
                  </span>
                  <span className="text-sky-300 font-bold">{pair.count} consultas</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
