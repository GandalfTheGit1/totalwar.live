import React, { useState, useEffect } from 'react';
import { CountryExtendedDimensions } from '@/lib/types/geopolitical-extended';
import { DimensionCard } from './DimensionCardGrid';
import { Loader2, AlertTriangle, Shield, TrendingDown } from 'lucide-react';

interface DimensionSectionProps {
  iso: string;
  name: string;
}

export const DimensionSection: React.FC<DimensionSectionProps> = ({ iso, name }) => {
  const [data, setData] = useState<CountryExtendedDimensions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!iso || iso === 'N/A' || iso === '-99') return;
    
    setLoading(true);
    setError(null);
    
    fetch(`/api/dev/geo-dimensions?iso=${iso}`)
      .then(res => {
        if (!res.ok) throw new Error('Error loading dimensions');
        return res.json();
      })
      .then(json => {
        if (json.error) throw new Error(json.error);
        setData(json);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [iso]);

  if (!iso || iso === 'N/A' || iso === '-99') return null;

  return (
    <div className="mt-4">
      <h4 className="text-xs text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2 font-bold font-mono">
        <Shield className="w-4 h-4 text-purple-400" /> Evaluación de Espectro Completo
      </h4>
      
      {loading && (
        <div className="flex items-center justify-center p-6 bg-zinc-900/40 rounded-xl border border-zinc-700/40">
          <Loader2 className="w-5 h-5 text-purple-400 animate-spin mr-2" />
          <span className="text-xs font-mono text-zinc-400">Analizando matrices de poder...</span>
        </div>
      )}
      
      {error && !loading && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>No se pudo cargar el análisis multidimensional.</span>
        </div>
      )}

      {data && !loading && (
        <div className="space-y-4">
          {/* HARD POWER */}
          <div>
            <h5 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 border-b border-zinc-800 pb-1">
              Poder Duro &amp; Proyección
            </h5>
            <DimensionCard title="Defensa &amp; Alianzas" data={data.defenseAndAlliances} colorClass="text-emerald-400" />
            <DimensionCard title="Control de Recursos" data={data.resourceControl} colorClass="text-amber-500" />
            <DimensionCard title="Superioridad Tecnológica" data={data.techAndCyber} colorClass="text-zinc-300" />
            <DimensionCard title="Proyección Militar" data={data.militaryProjection} colorClass="text-rose-400" />
          </div>

          {/* SOFT POWER */}
          <div>
            <h5 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 border-b border-zinc-800 pb-1 mt-4">
              Poder Blando &amp; Hegemonía
            </h5>
            <DimensionCard title="Influencia Diplomática" data={data.diplomaticInfluence} colorClass="text-zinc-400" />
            <DimensionCard title="Control de Narrativa" data={data.narrativeControl} colorClass="text-purple-400" />
            <DimensionCard title="Estabilidad Institucional" data={data.institutionalStability} colorClass="text-teal-400" />
            <DimensionCard title="Atractivo (Talento/Capital)" data={data.attractiveness} colorClass="text-pink-400" />
            <DimensionCard title="Influencia Corporativa" data={data.corporateInfluence} colorClass="text-zinc-500" />
            <DimensionCard title="Vulnerabilidad de Poder Blando" data={data.softPowerVulnerability} colorClass="text-orange-400" />
          </div>

          {/* SYSTEMIC VULNERABILITY */}
          <div>
            <h5 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2 border-b border-zinc-800 pb-1 mt-4">
              Riesgos Sistémicos
            </h5>
            <DimensionCard title="Fractura Demográfica/Social" data={data.demographicSocialRisk} colorClass="text-rose-500" />
            <DimensionCard title="Vulnerabilidad Económica Sistémica" data={data.systemicEconomicRisk} colorClass="text-rose-500" />
          </div>
        </div>
      )}
    </div>
  );
};
