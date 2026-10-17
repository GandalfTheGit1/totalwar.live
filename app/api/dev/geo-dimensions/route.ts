import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { callLlm } from '@/lib/llm-client';

export const maxDuration = 60; // 60 seconds since it's an AI route

const TTL_DAYS = 7;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const iso = searchParams.get('iso')?.toUpperCase();

  if (!iso) {
    return NextResponse.json({ error: 'Missing iso param' }, { status: 400 });
  }

  try {
    // 1. Check Cache
    const { data: cached } = await supabase
      .from('geo_dimensions_cache')
      .select('dimensions_data, expires_at')
      .eq('iso_code', iso)
      .single();

    if (cached && new Date(cached.expires_at) > new Date()) {
      return NextResponse.json(cached.dimensions_data);
    }

    // 2. Fetch missing data using AI Sequential processing (Mocked for now as requested for Block 4 structure)
    // Here we would implement the Wikidata + WB + Tavily orchestration as per AGENTS.md

    const resultText = await callLlm({
      systemPrompt: 'Act as a geopolitical analyst.',
      userPrompt: `Generate a highly structured JSON profile for ${iso} containing 10 power dimensions: defenseAndAlliances, techAndCyber, resourceControl, militaryProjection, diplomaticInfluence, institutionalStability, narrativeControl, attractiveness, corporateInfluence, softPowerVulnerability, demographicSocialRisk, systemicEconomicRisk. 
      For each, provide score (1-10), confidence (HIGH/MEDIUM/LOW), keyInsights (array of strings), and vulnerabilities (array of strings). Do not use markdown blocks, output raw JSON.`,
      temperature: 0.1,
      tier: 'MEDIUM',
      maxTokens: 4000,
    });

    let dimensionsData;
    try {
        // Step 1: Strip markdown fences (```json ... ```)
        let cleanJsonStr = resultText
          .replace(/^```(json)?\s*\n?/i, '')
          .replace(/\n?```\s*$/i, '')
          .trim();

        // Step 2: Extract outermost JSON object
        const startIdx = cleanJsonStr.indexOf('{');
        const endIdx = cleanJsonStr.lastIndexOf('}');
        if (startIdx >= 0 && endIdx >= startIdx) {
            cleanJsonStr = cleanJsonStr.substring(startIdx, endIdx + 1);
        }

        // Step 3a: Quote unquoted JSON keys (e.g. notableMetrics: {} → "notableMetrics": {})
        cleanJsonStr = cleanJsonStr.replace(
          /([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g,
          '$1"$2":'
        );

        // Step 3b: Remove trailing commas before } or ]
        cleanJsonStr = cleanJsonStr.replace(/,(\s*[}\]])/g, '$1');

        console.log(`[GeoDimensionsRoute] Attempting JSON.parse for ${iso}, length=${cleanJsonStr.length}`);
        dimensionsData = JSON.parse(cleanJsonStr);
    } catch(e: any) {
        console.error(`[GeoDimensionsRoute] All JSON recovery steps failed for ${iso}.`);
        console.error(`[GeoDimensionsRoute] Parse error: ${e?.message}`);
        console.error(`[GeoDimensionsRoute] Raw LLM output (first 2000 chars):`, resultText?.substring(0, 2000));
        throw new Error(`Failed to parse AI output for ${iso}: ${e?.message}`);
    }
    
    const structuredData = {
        iso,
        name: iso,
        lastUpdated: new Date().toISOString(),
        ...dimensionsData
    };

    // 3. Cache the result
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + TTL_DAYS);

    await supabase
      .from('geo_dimensions_cache')
      .upsert({
        iso_code: iso,
        dimensions_data: structuredData,
        expires_at: expiresAt.toISOString(),
      }, { onConflict: 'iso_code' });

    return NextResponse.json(structuredData);

  } catch (error: any) {
    console.error(`[GeoDimensionsRoute] Error for ${iso}:`, error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
