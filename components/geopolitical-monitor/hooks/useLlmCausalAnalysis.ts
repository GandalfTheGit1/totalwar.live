import { useState, useRef, useEffect } from 'react';
import { geoCache, geoCacheKeys, GEO_CACHE_TTLS } from '@/lib/cache/geo-indexeddb-cache';

export function useLlmCausalAnalysis(
  isPanelOpen: boolean,
  activeData: any,
  activeMacro: any
) {
  const [llmAnalysis, setLlmAnalysis] = useState<string | null>(null);
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmError, setLlmError] = useState<string | null>(null);
  const lastAnalysisIsoRef = useRef<string | null>(null);

  useEffect(() => {
    // 0. Guard: Only compute causal analysis if sidebar panel is actually open
    if (!isPanelOpen) {
      return;
    }

    const iso = activeData?.iso;
    if (!iso || !activeData || !activeMacro) return;

    // Fast-path: Already loaded and matches current active ISO
    if (lastAnalysisIsoRef.current === iso && llmAnalysis) {
      return;
    }

    if (activeMacro.dataConfidence === 'none') {
      setLlmAnalysis(`Datos macroeconómicos insuficientes para generar análisis causal de ${activeData.name}.`);
      lastAnalysisIsoRef.current = iso;
      setLlmLoading(false);
      setLlmError(null);
      return;
    }

    const cacheKey = geoCacheKeys.analysis(iso);

    // 1. Fast path: Sync L1 Memory hit (0ms, 60fps)
    const syncCached = geoCache.getSync<string>(cacheKey);
    if (syncCached) {
      console.log(`[GeoSidebar] ⚡ Causal analysis HIT (L1 Memory) for ${iso}`);
      setLlmAnalysis(syncCached);
      lastAnalysisIsoRef.current = iso;
      setLlmLoading(false);
      setLlmError(null);
      return;
    }

    const controller = new AbortController();
    let isCancelled = false;

    // 2. Async path: Check IndexedDB L2 before network call
    (async () => {
      try {
        const idbCached = await geoCache.get<string>(cacheKey);
        if (isCancelled || controller.signal.aborted) return;

        if (idbCached) {
          console.log(`[GeoSidebar] ⚡ Causal analysis HIT (IndexedDB L2) for ${iso}`);
          setLlmAnalysis(idbCached);
          lastAnalysisIsoRef.current = iso;
          setLlmLoading(false);
          setLlmError(null);
          return;
        }

        // 3. Network fetch on cache miss
        console.log(`[GeoSidebar] 🌐 Generating causal analysis from API for ${iso}...`);
        setLlmLoading(true);
        setLlmError(null);

        const res = await fetch('/api/dev/geo-macro-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            countryName: activeData.name,
            iso,
            riskScore: activeData.risk,
            pmiComposite: activeData.pmiComposite,
            pmiManufacturing: activeData.pmiManufacturing,
            pmiServices: activeData.pmiServices,
            macro: activeMacro,
          }),
        });

        if (controller.signal.aborted || isCancelled) return;

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || `HTTP ${res.status}: Error al generar el análisis causal.`);
        }

        const data = await res.json();
        if (controller.signal.aborted || isCancelled) return;

        if (data.error) {
          throw new Error(data.error);
        }

        let text = data.analysis || null;
        if (text && typeof text === 'string') {
          const trimmed = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
          if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            try {
              const parsed = JSON.parse(trimmed);
              if (parsed && typeof parsed === 'object') {
                const val = parsed.analisis || parsed.analysis || parsed.text || parsed.result || Object.values(parsed)[0];
                if (typeof val === 'string') {
                  text = val.trim();
                }
              }
            } catch {
              // keep existing text if JSON parse fails
            }
          }
        }

        if (!text) {
          throw new Error('La respuesta de la API no contiene un análisis causal válido.');
        }

        // Persist to IndexedDB with 24h TTL ONLY on valid analysis
        await geoCache.set(cacheKey, text, GEO_CACHE_TTLS.CAUSAL_ANALYSIS);

        setLlmAnalysis(text);
        lastAnalysisIsoRef.current = iso;
        setLlmLoading(false);
        setLlmError(null);
      } catch (err: any) {
        if (err?.name === 'AbortError' || controller.signal.aborted || isCancelled) return;
        console.error('[GeoSidebar] LLM analysis failed:', err);
        setLlmError(err?.message || 'No fue posible generar el análisis causal en este momento.');
        setLlmLoading(false);
      }
    })();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [isPanelOpen, activeData?.iso, activeData?.name, activeMacro]);

  useEffect(() => {
    if (!isPanelOpen) {
      setLlmError(null);
    }
  }, [isPanelOpen]);

  return { llmAnalysis, llmLoading, llmError };
}
