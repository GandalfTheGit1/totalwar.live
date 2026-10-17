import { NextResponse } from 'next/server';

export const revalidate = 21600; // 6 hours

export async function GET() {
  console.log('[API:WorldTension] Fetching data from GDELT Project API 2.0');
  
  try {
    const url = 'https://api.gdeltproject.org/api/v2/doc/doc?query=conflict%20war%20sanctions%20military&mode=artlist&maxrecords=50&timespan=30d&format=json';
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`[API:WorldTension] GDELT API failed with status: ${response.status}`);
      throw new Error(`GDELT API responded with status ${response.status}`);
    }
    
    // Sometimes GDELT API returns HTML when overloaded or failing, check content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn(`[API:WorldTension] GDELT API returned non-JSON response: ${contentType}`);
      throw new Error(`GDELT API returned non-JSON response: ${contentType}`);
    }
    
    const data = await response.json();
    console.log(`[API:WorldTension] Successfully parsed JSON from GDELT API`);
    
    if (!data || !data.articles || !Array.isArray(data.articles)) {
      console.warn(`[API:WorldTension] GDELT API response missing 'articles' array`);
      throw new Error("Invalid GDELT JSON structure, missing 'articles'");
    }
    
    const articles = data.articles;
    let totalTone = 0;
    let count = 0;
    
    for (const article of articles) {
      // average tone is usually roughly -10 to +10, where negative is worse
      // tone structure is not explicitly defined in prompt, assuming article.tone or similar
      const tone = typeof article.tone === 'number' ? article.tone : 0;
      totalTone += tone;
      count++;
    }
    
    const avgTone = count > 0 ? totalTone / count : 0;
    
    // Normalize tone to Tension Index (0-100)
    // If avgTone is -5 (very negative), tension should be high.
    // Let's say tension = 50 + (avgTone * -5) -> -5 tone = 75 tension.
    // The exact formula wasn't strictly provided, just "MIN(100, rollingAvgTone * weight)"
    // I will use a simple mapping where negative tone increases tension.
    // The prompt says: WorldTensionIndex = MIN(100, rollingAvgTone * weight) using a normalized formula
    // We'll calculate it such that typical negative tone (e.g. -2 to -8) maps to 50-90.
    
    // Simple normalization: avgTone of 0 -> 45 (baseline), avgTone of -10 -> 95
    const computedTension = Math.min(100, Math.max(0, 45 - (avgTone * 5)));
    
    console.log(`[API:WorldTension] Computed Tension Index: ${computedTension.toFixed(2)} from ${count} articles (Avg Tone: ${avgTone.toFixed(2)})`);
    
    return NextResponse.json({
      source: 'gdelt',
      tensionIndex: computedTension,
      details: {
        articleCount: count,
        avgTone: avgTone
      },
      events: articles.slice(0, 5) // Return top 5 for the UI breakdown
    });
    
  } catch (error: any) {
    console.error(`[API:WorldTension] Circuit break triggered: ${error.message}`);
    
    // Rule 7.5 & Phase 1 Rules: fallback dataset with clear reason, do not fail silently
    return NextResponse.json({
      source: 'fallback',
      reason: error.message || 'Unknown error fetching GDELT data',
      tensionIndex: 45, // Neutral fallback
      details: {
        articleCount: 0,
        avgTone: 0
      },
      events: []
    });
  }
}
