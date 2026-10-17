import { callLlm } from '@/lib/llm-client';
import { ClassificationResult } from './types';

/**
 * Evaluates the relevance of a YouTube video based on its title and description using LLM.
 */
export async function evaluateVideoRelevance(
  title: string,
  description: string,
  tickers: string[]
): Promise<{ score: number; reason: string }> {
  const tickersStr = tickers.join(', ');
  const systemPrompt = `You are a financial research assistant auditing YouTube video relevance to a watchlist of public companies: [${tickersStr}].
Rate the relevance of the video based on its title and description on a scale of 1 to 5:
- 5: Extremely relevant (e.g. official earnings calls, deep supply chain/manufacturing documentaries of the company, direct corporate updates).
- 4: Highly relevant (e.g. Bloomberg/CNBC analytical segments discussing the company's financials, suppliers, clients, or operations).
- 3: Moderately relevant (e.g. news about a sector directly impacting the company, or general analysis where the company is a primary focus).
- 2: Low relevance (e.g. general stock market recap mentioning the ticker, general macro commentary, retail trading strategy opinion).
- 1: Irrelevant / noise (e.g. clickbait trading tutorials, unrelated products, general stock price gossiping).

Respond ONLY with a JSON object in this format:
{
  "score": number (1 to 5),
  "reason": "Brief explanation in Spanish"
}`;

  const userPrompt = `Video Title: "${title}"
Video Description: "${description}"

Rate relevance score for tickers: [${tickersStr}]`;

  try {
    const response = await callLlm({
      systemPrompt,
      userPrompt,
      temperature: 0.1,
      maxTokens: 200,
      provider: 'gemini',
      tier: 'LIGHT'
    });

    let parsed: any;
    try {
      parsed = JSON.parse(response.trim());
    } catch {
      const match = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      parsed = match ? JSON.parse(match[1]) : { score: 1, reason: 'Error parsing LLM response' };
    }

    return {
      score: typeof parsed.score === 'number' ? parsed.score : 1,
      reason: parsed.reason || ''
    };
  } catch (error: any) {
    console.error(`[YouTubeHelper] Relevance evaluation error for "${title}":`, error.message);
    return { score: 1, reason: error.message };
  }
}

/**
 * Classifies if a video transcript is relevant to watchlisted tickers using LLM.
 */
export async function classifyVideoRelevance(
  title: string,
  transcriptSnippet: string,
  tickers: string[]
): Promise<ClassificationResult> {
  const tickersStr = tickers.join(', ');
  const systemPrompt = `You are an expert financial news classifier. You analyze transcripts of economic and business videos to determine their relevance to publicly traded companies of interest (tickers).
RELEVANCE AND CLICKBAIT RULES:
1. Transcript Weighting: Ignore sensationalist clickbait titles (e.g. "Apple is going to collapse!") if the transcript fragment shows a sober or normal analysis. Weigh the real content over the title.
2. General Market Content: If the video is about broad macroeconomics, the Fed, weekly market summaries or sector gossip without an explicit and substantial focus on one of the companies of interest, mark related = false.
3. MACRO EVENTS WITH SPECIFIC IMPACT RULE: A macro event (FED, ECB, tariffs, regulation) is HIGHLY RELEVANT (related = true) if:
   (a) The title or transcript explicitly names a company or ticker from the list as the main receiver of the impact, OR
   (b) The announced policy/regulation directly affects the industrial sector where 50%+ of the watchlist companies operate.
   Generic macro coverage without mention of specific company = related = false.
4. TRANSCRIPT PRIORITY RULE: If the ticker or company name appears in the transcript snippet (even if it does not appear in the title), treat the video as potentially relevant. Classify it as related = true if the context is substantial (not just a passing mention).
5. Content Type Classification: Identify if the video is an earnings call ("earnings_call"), a deep financial analysis ("analysis"), quick press news ("news"), general opinion/speculation ("opinion"), or a general market summary ("market_overview").

Respond exclusively with a JSON object. No additional explanations.
IMPORTANT: ALL generated text inside the JSON values MUST be in Spanish.`;

  const userPrompt = `Analyze the following information from a news video and determine if it is highly relevant for any of these companies (tickers): [${tickersStr}].

Video Title: "${title}"
Transcript Fragment (Snippet):
---
${transcriptSnippet}
---

If the video speaks directly about one of these companies (for example, collaborations, chip announcements, product launches, financial reports, lawsuits, etc.), classify it as related and indicate the corresponding ticker.

Respond exclusively with this JSON format:
{
  "related": true or false,
  "ticker": "CORRESPONDING_TICKER" or null,
  "sentiment": "positive" or "negative" or "neutral" (only if related is true),
  "contentType": "earnings_call" | "analysis" | "news" | "opinion" | "market_overview",
  "reason": "Brief 1-sentence explanation of why in Spanish"
}`;

  try {
    const responseText = await callLlm({
      systemPrompt,
      userPrompt,
      temperature: 0.1,
      maxTokens: 500,
      provider: 'gemini',
      tier: 'LIGHT' // Quick classification
    });

    let parsed: any;
    try {
      parsed = JSON.parse(responseText.trim());
    } catch {
      const match = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      parsed = match ? JSON.parse(match[1]) : { related: false };
    }

    return {
      related: !!parsed.related,
      ticker: parsed.ticker || undefined,
      sentiment: parsed.sentiment || undefined,
      reason: parsed.reason || undefined,
      contentType: parsed.contentType || undefined
    };
  } catch (error: any) {
    console.error(`[YouTubeHelper] Relevance classification error for "${title}":`, error.message);
    return { related: false };
  }
}
