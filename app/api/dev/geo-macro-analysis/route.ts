/**
 * POST /api/dev/geo-macro-analysis
 *
 * Receives a country's full macroeconomic payload (from macro_country_cache) and
 * generates a structured Dalio-framework causal analysis in Spanish using the LLM.
 * Uses the "How the Economic Machine Works" model as the analytical lens.
 *
 * Rate: ~1 call per country per session (result cached client-side in macroCache).
 * Tier: MEDIUM (reasoning + structured output, ~400-600 tokens output).
 */

import { NextRequest, NextResponse } from 'next/server';
import { callLlm } from '@/lib/llm-client';
import { withMonitor } from '@/lib/api-monitor';
import { logError } from '@/lib/server-logger';

interface ServerCachedAnalysis {
  analysis: string;
  confidence: string;
  generatedAt: string;
  iso: string;
  expiresAt: number;
}

const serverAnalysisCache = new Map<string, ServerCachedAnalysis>();
const SERVER_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function generateDeterministicDalioAnalysis(params: {
  countryName: string;
  cleanIso: string;
  shortPhase: string;
  gdpGrowth: string;
  inflation: string;
  pmiComposite?: number | null;
  rvsGStatus: string;
  yieldCurveSignal: string;
  m2Growth: string;
  leversSummary: string;
  deleveragingStatus: string;
  riskScore?: number | null;
}): string {
  const {
    countryName,
    cleanIso,
    shortPhase,
    gdpGrowth,
    inflation,
    pmiComposite,
    rvsGStatus,
    yieldCurveSignal,
    m2Growth,
    leversSummary,
    deleveragingStatus,
    riskScore,
  } = params;

  const sentences: string[] = [];

  const pmiDetail = pmiComposite !== null && pmiComposite !== undefined
    ? `un PMI compuesto de ${pmiComposite} (${pmiComposite >= 50 ? 'expansión' : 'contracción'})`
    : 'actividad económica sin datos de PMI';
  sentences.push(
    `La economía de ${countryName} (${cleanIso}) se encuentra en la fase de "${shortPhase}", condicionada por un crecimiento del PIB de ${gdpGrowth}, una inflación del ${inflation} y ${pmiDetail}.`
  );

  sentences.push(
    `Bajo la regla Dalio de tasa de interés frente a crecimiento nominal (r vs g), la dinámica de deuda se diagnostica como: ${rvsGStatus}.`
  );

  const curveText = yieldCurveSignal === 'inversion' || yieldCurveSignal === 'invertida'
    ? 'la curva de rendimientos invertida anticipa tensiones en el ciclo de crédito'
    : yieldCurveSignal === 'normal' || yieldCurveSignal === 'empinada'
      ? 'la curva de rendimientos respalda la intermediación financiera'
      : `la señal de la curva de tipos se mantiene en estado "${yieldCurveSignal}"`;
  sentences.push(
    `El impulso de crédito muestra una variación de masa monetaria M2 de ${m2Growth}, mientras ${curveText}.`
  );

  sentences.push(
    `El régimen de ajuste se clasifica como "${deleveragingStatus}", apoyado en las siguientes palancas dominantes: ${leversSummary}.`
  );

  if (riskScore !== null && riskScore !== undefined) {
    sentences.push(
      `Con una puntuación de riesgo soberano de ${riskScore}/100, la capacidad de amortiguar perturbaciones macrofinancieras depende de la estabilidad de sus flujos externos.`
    );
  }

  return sentences.join(' ');
}

async function POST_HANDLER(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      countryName,
      iso,
      riskScore,
      pmiComposite,
      pmiManufacturing,
      pmiServices,
      macro,
      forceRefresh,
    } = body;

    if (!countryName || !iso) {
      return NextResponse.json({ error: 'countryName and iso are required' }, { status: 400 });
    }

    const cleanIso = String(iso).toUpperCase().trim();

    // ─── 0. Check Server Cache ────────────────────────────────────────────────
    if (!forceRefresh) {
      const cached = serverAnalysisCache.get(cleanIso);
      if (cached && cached.expiresAt > Date.now()) {
        console.log(`[GeoMacroAnalysis] ⚡ Server-side Cache HIT for ${countryName} (${cleanIso})`);
        return NextResponse.json(
          {
            analysis: cached.analysis,
            confidence: cached.confidence,
            generatedAt: cached.generatedAt,
            cached: true,
          },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
              'X-Cache-Status': 'HIT',
            },
          }
        );
      }
    }

    console.log(`[GeoMacroAnalysis] Generating Dalio causal analysis for ${countryName} (${cleanIso})...`);

    // ─── Extract Dalio model fields ─────────────────────────────────────────
    const cycle = macro?.dalioDebtCycle;
    const shortPhase = cycle?.shortTermCyclePhase || 'Desconocido';
    const confidence = macro?.dataConfidence || 'none';

    // r vs g check (Rule 3)
    const rule3 = cycle?.dalioRules?.rule3;
    const dalioFormula = cycle?.dalioFormula;
    const yieldCurveSignal = cycle?.yieldCurveSignal || 'unknown';

    // Levers
    const levers = cycle?.levers || { austerity: 0, debtReduction: 0, wealthRedistribution: 0, moneyPrinting: 0 };

    // Key metrics
    const gdpGrowth = macro?.gdpGrowth || 'N/A';
    const inflation = macro?.inflation || 'N/A';
    const interestRate = macro?.interestRate || 'N/A';
    const m2Growth = macro?.m2Growth || 'N/A';
    const yieldCurveStatus = macro?.yieldCurveStatus || 'N/A';
    const consumerCredit = macro?.consumerCreditGrowth || 'N/A';
    const businessLoans = macro?.businessLoansGrowth || 'N/A';
    const debtToGdp = macro?.debtToGdp || 'N/A';
    const unemployment = macro?.unemployment || 'N/A';

    // ─── Confidence gate ─────────────────────────────────────────────────────
    if (confidence === 'none') {
      const fallbackAnalysis = `Datos macroeconómicos insuficientes para ${countryName}. Sin indicadores verificados disponibles en FRED, BIS ni Trading Economics, no es posible computar el ciclo económico según el modelo de Ray Dalio. Se recomienda buscar datos del Banco Mundial o el FMI para este nodo.`;
      return NextResponse.json({
        analysis: fallbackAnalysis,
        confidence: 'none',
      });
    }

    // ─── System Prompt ────────────────────────────────────────────────────────
    const systemPrompt = `Eres un analista macroeconómico experto en el modelo de Ray Dalio "How the Economic Machine Works".
Tu tarea es generar una deducción causal estructurada de 4-6 frases en español sobre el estado macroeconómico de un país,
usando exclusivamente los datos cuantitativos proporcionados.

REGLAS OBLIGATORIAS:
1. Toda la respuesta debe estar en español.
2. Responde ÚNICAMENTE con texto plano — sin JSON, sin markdown, sin listas.
3. Estructura la respuesta así:
   - Frase 1: Fase del ciclo corto de Dalio y qué la determina (PMI + GDP + inflación).
   - Frase 2: Estado de la regla r vs g (interés efectivo vs crecimiento nominal). Consecuencias sobre la deuda.
   - Frase 3: Señal de la curva de tipos y el impulso de crédito (M2 + crédito al consumo).
   - Frase 4: Palancas de desapalancamiento activas y qué tipo de ajuste está en curso.
   - Frase 5 (opcional): Advertencia o factor de riesgo adicional derivado de los datos.
4. Usa exactamente los valores numéricos que se te proporcionan. NO inventes cifras.
5. Si un dato es "N/A", descríbelo como "sin datos disponibles" y omítelo del análisis cuantitativo.`;

    // ─── User Prompt ──────────────────────────────────────────────────────────
    const rvsGStatus = rule3
      ? `${rule3.status.toUpperCase()} — ${rule3.detail}`
      : dalioFormula
        ? `Spread (g - r) = ${dalioFormula.spread !== null ? dalioFormula.spread.toFixed(2) + '%' : 'N/A'} → ${dalioFormula.isBeautiful ? 'Desapalancamiento hermoso' : 'Presión de deuda creciente'}`
        : 'No disponible';

    const leversSummary = [
      levers.austerity > 20 ? `Austeridad (${levers.austerity})` : null,
      levers.debtReduction > 20 ? `Reducción de deuda (${levers.debtReduction})` : null,
      levers.wealthRedistribution > 20 ? `Redistribución (${levers.wealthRedistribution})` : null,
      levers.moneyPrinting > 20 ? `Impresión monetaria (${levers.moneyPrinting})` : null,
    ]
      .filter(Boolean)
      .join(', ') || 'Sin palancas activas dominantes';

    const userPrompt = `## País: ${countryName} (ISO: ${cleanIso})
## Confianza de datos: ${confidence.toUpperCase()}
## Puntuación de riesgo soberano: ${riskScore ?? 'N/A'}/100

### Indicadores de Actividad (PMI)
- PMI Compuesto: ${pmiComposite ?? 'N/A'} (${(pmiComposite ?? 50) >= 50 ? 'Expansión' : 'Contracción'})
- PMI Manufactura: ${pmiManufacturing ?? 'N/A'}
- PMI Servicios: ${pmiServices ?? 'N/A'}

### Diagnóstico Macro Cuantitativo (Ciclo Corto — Secciones 7-8 del Marco Dalio)
- Crecimiento PIB (YoY): ${gdpGrowth}
- Inflación IPC (YoY): ${inflation}
- Tipo Oficial Banco Central: ${interestRate}
- Masa Monetaria M2 (YoY): ${m2Growth}
- Crédito al Consumo (YoY): ${consumerCredit}
- Préstamos Comerciales (YoY): ${businessLoans}
- Curva de Tipos (10Y-2Y): ${yieldCurveStatus}
- Deuda Pública / PIB: ${debtToGdp}
- Desempleo: ${unemployment}

### Modelo Dalio — Ciclo de Deuda
- Fase Ciclo Corto: ${shortPhase}
- Señal Curva de Tipos: ${yieldCurveSignal}
- Regla 3 (r vs g): ${rvsGStatus}
- Palancas Activas: ${leversSummary}
- Estado Desapalancamiento: ${cycle?.deleveragingStatus ?? 'N/A'}

Genera ahora la deducción causal estructurada en español (4-6 frases, texto plano):`;

    let cleanAnalysis = '';
    let isFallback = false;

    try {
      const rawAnalysis = await callLlm({
        systemPrompt,
        userPrompt,
        temperature: 0.2,
        maxTokens: 700,
        tier: 'MEDIUM',
      });

      cleanAnalysis = rawAnalysis ? rawAnalysis.trim() : '';

      // Strip markdown code fences if present
      cleanAnalysis = cleanAnalysis.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

      // If LLM returned a JSON object string instead of raw text, extract the text payload
      if (cleanAnalysis.startsWith('{') && cleanAnalysis.endsWith('}')) {
        try {
          const parsed = JSON.parse(cleanAnalysis);
          if (parsed && typeof parsed === 'object') {
            const val = parsed.analisis || parsed.analysis || parsed.text || parsed.result || Object.values(parsed)[0];
            if (typeof val === 'string') {
              cleanAnalysis = val.trim();
            }
          }
        } catch {
          const match = cleanAnalysis.match(/"(?:analisis|analysis|text|result)":\s*"([\s\S]*?)"\s*\}/i);
          if (match && match[1]) {
            cleanAnalysis = match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').trim();
          }
        }
      }
    } catch (llmError: any) {
      console.warn(`[GeoMacroAnalysis] LLM call failed for ${countryName} (${cleanIso}), using deterministic Dalio fallback:`, llmError?.message);
    }

    if (!cleanAnalysis) {
      isFallback = true;
      cleanAnalysis = generateDeterministicDalioAnalysis({
        countryName,
        cleanIso,
        shortPhase,
        gdpGrowth,
        inflation,
        pmiComposite,
        rvsGStatus,
        yieldCurveSignal,
        m2Growth,
        leversSummary,
        deleveragingStatus: cycle?.deleveragingStatus || 'Estabilización macroeconómica',
        riskScore,
      });
    }

    console.log(`[GeoMacroAnalysis] ✅ Analysis generated for ${countryName} (${cleanAnalysis.length} chars, fallback: ${isFallback})`);

    const generatedAt = new Date().toISOString();

    // Save into server cache
    serverAnalysisCache.set(cleanIso, {
      analysis: cleanAnalysis,
      confidence,
      generatedAt,
      iso: cleanIso,
      expiresAt: Date.now() + SERVER_CACHE_TTL_MS,
    });

    return NextResponse.json(
      {
        analysis: cleanAnalysis,
        confidence,
        generatedAt,
        cached: false,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
          'X-Cache-Status': 'MISS',
        },
      }
    );

  } catch (error: any) {
    logError('GeoMacroAnalysis', error, { step: 'POST handler' });
    return NextResponse.json(
      {
        error: error?.message || 'Error generando análisis causal macroeconómico.',
        confidence: 'none',
      },
      { status: 500 }
    );
  }
}

async function GET_HANDLER(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const iso = searchParams.get('iso')?.toUpperCase()?.trim();

    if (!iso) {
      return NextResponse.json({
        service: 'geo-macro-analysis',
        status: 'active',
        cachedCountries: Array.from(serverAnalysisCache.keys()),
        cachedCount: serverAnalysisCache.size,
        ttlMs: SERVER_CACHE_TTL_MS,
        instructions: 'Pass ?iso=COUNTRY_CODE to retrieve cached or pre-computed geo-macro analysis.',
      });
    }

    const forceRefresh = searchParams.get('forceRefresh') === 'true' || searchParams.get('refresh') === 'true';

    // Check in-memory server cache
    if (!forceRefresh) {
      const cached = serverAnalysisCache.get(iso);
      if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(
        {
          analysis: cached.analysis,
          confidence: cached.confidence,
          generatedAt: cached.generatedAt,
          iso,
          cached: true,
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
            'X-Cache-Status': 'HIT',
          },
        }
      );
      }
    }

    // Attempt lookup from Supabase macro_country_cache if available
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: dbMacro } = await supabase
        .from('macro_country_cache')
        .select('payload, fetched_at')
        .eq('country_code', iso)
        .eq('stale', false)
        .order('fetched_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dbMacro?.payload) {
        return NextResponse.json({
          iso,
          macro: dbMacro.payload,
          fetchedAt: dbMacro.fetched_at,
          cached: false,
          message: 'Macro payload available. Call POST /api/dev/geo-macro-analysis to generate or refresh LLM analysis.',
        });
      }
    } catch (dbErr) {
      console.warn(`[GeoMacroAnalysis GET] DB check error for ${iso}:`, dbErr);
    }

    return NextResponse.json(
      { error: `No cached analysis found for ISO code: ${iso}`, iso, cached: false },
      { status: 404 }
    );
  } catch (error) {
    logError('GeoMacroAnalysis', error, { step: 'GET handler' });
    return NextResponse.json(
      { error: 'Error retrieving geo-macro analysis' },
      { status: 500 }
    );
  }
}

export const POST = withMonitor(POST_HANDLER as any, 'AI Analysis POST');
export const GET = withMonitor(GET_HANDLER as any, 'AI Analysis GET');
