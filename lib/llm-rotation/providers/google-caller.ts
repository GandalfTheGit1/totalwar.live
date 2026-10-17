/**
 * lib/llm-rotation/providers/google-caller.ts
 *
 * Direct HTTP client for Google AI Studio / Gemini generateContent API.
 */

export async function callGoogleModel(
  modelId: string,
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  maxTokens: number,
  apiKey: string,
  thinkingBudget: number = 0,
  responseFormat?: 'json' | 'text'
): Promise<string> {
  console.log(`[GoogleCaller] Received responseFormat: ${responseFormat}`);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`;
  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
      ...(responseFormat !== 'text' ? { responseMimeType: 'application/json' } : {}),
      ...(thinkingBudget > 0 ? { thinkingConfig: { thinkingBudget } } : {}),
    },
  };

  let response: Response;
  try {
    response = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'X-goog-api-key': apiKey },
      body:    JSON.stringify(body),
    });
  } catch (error) {
    console.error(`[GoogleAPI] Error fetching from ${url}:`, error);
    throw error;
  }

  if (!response.ok) {
    const text = await response.text();
    throw Object.assign(new Error(`[GoogleAPI] ${response.status} — ${text}`), {
      status: response.status,
    });
  }

  const json = await response.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
}
