import React, { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, Newspaper, ExternalLink } from 'lucide-react';

interface NewsPanelProps {
  iso: string;
  name: string;
}

export const NewsPanel: React.FC<NewsPanelProps> = ({ iso, name }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!iso || iso === 'N/A' || iso === '-99') return;
    
    setLoading(true);
    setError(null);
    
    fetch(`/api/dev/geo-news?iso=${iso}`)
      .then(res => {
        if (!res.ok) throw new Error('Error loading news');
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
        <Newspaper className="w-4 h-4 text-rose-400" /> Noticias Geopolíticas Recientes
      </h4>
      
      {loading && (
        <div className="flex items-center justify-center p-6 bg-zinc-900/40 rounded-xl border border-zinc-700/40">
          <Loader2 className="w-5 h-5 text-rose-400 animate-spin mr-2" />
          <span className="text-xs font-mono text-zinc-400">Escaneando GDELT y Tavily...</span>
        </div>
      )}
      
      {error && !loading && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>No se pudieron cargar las noticias.</span>
        </div>
      )}

      {data && data.events && !loading && (
        <div className="space-y-3">
          {data.events.map((event: any, idx: number) => {
            const sentimentClass = event.sentiment === 'POSITIVE' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                                 event.sentiment === 'NEGATIVE' ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' :
                                 'text-amber-400 bg-amber-500/10 border-amber-500/30';
            
            return (
              <div key={idx} className="bg-zinc-900/60 border border-zinc-700/50 rounded-xl p-3">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="text-sm font-bold text-zinc-200 leading-tight pr-4">{event.title}</h5>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono shrink-0 ${sentimentClass}`}>
                    {event.sentiment}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mb-2 leading-relaxed">{event.summary}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-700/50">
                  <span className="text-[10px] text-zinc-500 font-mono">{event.source} • {new Date(event.date || data.lastUpdated).toLocaleDateString()}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400">Impacto: <span className="font-bold text-zinc-300">{event.impactScore}/10</span></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
