import React from 'react';
import { BarChart2, Loader2, Wifi, WifiOff, AlertTriangle, TrendingDown, TrendingUp, Activity, ShieldAlert, Cpu, Truck } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { 
  parseNumericValue, gdpColor, inflationColor, creditImpulseColor, 
  yieldCurveBadge, PHASE_STYLES, RULE_STATUS_ICON, CONFIDENCE_BADGE 
} from './sidebar-utils';

function MacroSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 w-32 bg-zinc-800 rounded" />
      <div className="grid grid-cols-2 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-zinc-800/60 rounded-lg p-3 h-16" />
        ))}
      </div>
      <div className="h-8 bg-zinc-800/60 rounded-lg" />
      <div className="h-20 bg-zinc-800/40 rounded-xl" />
    </div>
  );
}

function DalioRulesRow({ cycle }: { cycle: any }) {
  const rules = cycle.dalioRules;
  if (!rules) return null;

  const ruleItems = [
    { key: 'rule1', label: 'ΔDeuda ≤ ΔPIB', data: rules.rule1 },
    { key: 'rule2', label: 'Salarios ≥ Productividad', data: rules.rule2 },
    { key: 'rule3', label: 'g > r (Sostenibilidad)', data: rules.rule3 },
  ];

  return (
    <div className="mt-3 pt-3 border-t border-zinc-800/60">
      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold font-mono mb-2">
        3 Reglas Dalio
      </p>
      <div className="flex flex-col gap-1.5">
        {ruleItems.map(({ key, label, data }) => {
          const st = RULE_STATUS_ICON[data?.status] || RULE_STATUS_ICON.unknown;
          return (
            <div key={key} className="flex items-start gap-2 text-[11px]">
              <span className="shrink-0 mt-0.5">{st.icon}</span>
              <div className="flex flex-col">
                <span className={`font-semibold ${st.cls}`}>{label}</span>
                {data?.detail && (
                  <span className="text-zinc-500 text-[10px] leading-snug">{data.detail}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DalioFormulaStrip({ cycle }: { cycle: any }) {
  const f = cycle.dalioFormula;
  if (!f || f.spread === null) return null;

  const isBeautiful = f.isBeautiful;
  return (
    <div className={`mt-2 p-2.5 rounded-lg border text-[10px] font-mono flex items-center justify-between ${
      isBeautiful
        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
        : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
    }`}>
      <span>
        g ({f.nominalGdpGrowth !== null ? `${f.nominalGdpGrowth.toFixed(2)}%` : 'N/A'}) 
        {' '}&minus;{' '}
        r ({f.effectiveInterestRateNum !== null ? `${f.effectiveInterestRateNum.toFixed(2)}%` : 'N/A'})
        {' '}= <span className="font-black">{f.spread > 0 ? '+' : ''}{f.spread.toFixed(2)}%</span>
      </span>
      <span className={`px-2 py-0.5 rounded border font-bold text-[9px] uppercase ${
        isBeautiful
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
      }`}>
        {isBeautiful ? '✨ Hermoso' : '⚡ Presión'}
      </span>
    </div>
  );
}

export function DalioMacroSection({ activeMacro, isMacroLoading, macroError }: { activeMacro: any; isMacroLoading: boolean; macroError: string | null }) {
  const confidenceBadge = activeMacro
    ? CONFIDENCE_BADGE[activeMacro.dataConfidence] || CONFIDENCE_BADGE.none
    : null;

  const cycle = activeMacro?.dalioDebtCycle;
  const phaseKey = cycle?.shortTermCyclePhase || 'Falta de Transparencia';
  const phaseStyle = PHASE_STYLES[phaseKey] || PHASE_STYLES['Falta de Transparencia'];
  const yieldBadge = yieldCurveBadge(activeMacro?.yieldCurveStatus || 'N/A');

  return (
    <div className="bg-zinc-850/60 p-4 rounded-xl border border-zinc-500/20 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs text-zinc-300 uppercase tracking-wider flex items-center gap-2 font-bold font-mono">
          <BarChart2 className="w-4 h-4 text-zinc-400" /> Motor Macro Dalio
        </h4>
        <div className="flex items-center gap-2">
          {isMacroLoading && (
            <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin" />
          )}
          {confidenceBadge && !isMacroLoading && (
            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${confidenceBadge.cls}`}>
              {confidenceBadge.label}
            </span>
          )}
          {activeMacro && (
            <span className="text-[9px] font-mono text-zinc-600 flex items-center gap-0.5">
              {activeMacro.dataConfidence !== 'none' ? (
                <Wifi className="w-3 h-3 text-teal-600" />
              ) : (
                <WifiOff className="w-3 h-3 text-zinc-600" />
              )}
            </span>
          )}
        </div>
      </div>

      {isMacroLoading && <MacroSkeleton />}

      {!isMacroLoading && macroError && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{macroError}</span>
        </div>
      )}

      {!isMacroLoading && !macroError && !activeMacro && (
        <div className="text-center py-6 text-zinc-500 text-xs font-mono">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-zinc-400/50" />
          Cargando indicadores macroeconómicos...
        </div>
      )}

      {!isMacroLoading && activeMacro && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <MetricCard
              label="PIB Anual"
              value={activeMacro.gdpGrowth}
              prev={activeMacro.gdpGrowthPrevious}
              valueClass={gdpColor(activeMacro.gdpGrowth)}
              icon={activeMacro.gdpGrowth.startsWith('-') ? <TrendingDown className="w-3 h-3 text-rose-400" /> : <TrendingUp className="w-3 h-3 text-emerald-400" />}
            />
            <MetricCard
              label="Inflación IPC"
              value={activeMacro.inflation}
              prev={activeMacro.inflationPrevious}
              valueClass={inflationColor(activeMacro.inflation)}
              icon={<Activity className="w-3 h-3 text-amber-400" />}
            />
            <MetricCard
              label="Tipo Oficial BC"
              value={activeMacro.interestRate}
              prev={activeMacro.interestRatePrevious}
              valueClass="text-zinc-200"
              icon={<ShieldAlert className="w-3 h-3 text-teal-400" />}
            />
            <MetricCard
              label="M2 Monetario"
              value={activeMacro.m2Growth}
              valueClass={creditImpulseColor(activeMacro.m2Growth)}
              icon={<Cpu className="w-3 h-3 text-purple-400" />}
            />
            <MetricCard
              label="Crédito Consumo"
              value={activeMacro.consumerCreditGrowth}
              valueClass={creditImpulseColor(activeMacro.consumerCreditGrowth)}
              icon={<Truck className="w-3 h-3 text-zinc-400" />}
            />
            <MetricCard
              label="Deuda Pública/PIB"
              value={activeMacro.debtToGdp}
              valueClass={
                parseNumericValue(activeMacro.debtToGdp) !== null
                  ? (parseNumericValue(activeMacro.debtToGdp)! > 100
                      ? 'text-rose-400'
                      : parseNumericValue(activeMacro.debtToGdp)! > 60
                      ? 'text-yellow-400'
                      : 'text-emerald-400')
                  : 'text-zinc-400'
              }
              icon={<AlertTriangle className="w-3 h-3 text-zinc-400" />}
            />
          </div>

          <div className={`p-2.5 rounded-lg border text-[10px] font-mono flex items-center justify-between mb-3 ${yieldBadge.cls}`}>
            <span className="text-zinc-400">Curva Tipos (10Y-2Y)</span>
            <span className="font-bold">{activeMacro.yieldCurveStatus || 'N/A'}</span>
          </div>

          {cycle && (
            <>
              <div className={`w-full px-3 py-2 rounded-lg border text-[11px] font-mono font-bold flex items-center justify-between ${phaseStyle.bg} ${phaseStyle.text} ${phaseStyle.border}`}>
                <span>{phaseStyle.label}</span>
                {cycle.intensity !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-current opacity-60"
                        style={{ width: `${Math.round(cycle.intensity * 100)}%` }}
                      />
                    </div>
                    <span className="text-[9px] opacity-70">{Math.round(cycle.intensity * 100)}%</span>
                  </div>
                )}
              </div>

              <DalioFormulaStrip cycle={cycle} />
              <DalioRulesRow cycle={cycle} />
            </>
          )}

          {activeMacro.dataConfidence === 'none' && (
            <p className="text-[11px] text-zinc-500 font-mono text-center py-4">
              Sin datos macroeconómicos verificados para este nodo.
            </p>
          )}
        </>
      )}
    </div>
  );
}
