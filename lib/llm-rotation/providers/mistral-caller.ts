/**
 * lib/llm-rotation/providers/mistral-caller.ts
 *
 * Direct HTTP client for Mistral AI chat completions API.
 */

export async function callMistralModel(
  modelId: string,
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  maxTokens: number,
  apiKey: string
): Promise<string> {
  const url = 'https://api.mistral.ai/v1/chat/completions';
  const body = {
    model: modelId,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature,
    max_tokens: maxTokens
  };

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error(`[MistralAPI] Error fetching from ${url}:`, error);
    throw error;
  }

  if (!response.ok) {
    const text = await response.text();
    throw Object.assign(new Error(`[MistralAPI] ${response.status} — ${text}`), {
      status: response.status,
    });
  }

  const json = await response.json();
  return json.choices?.[0]?.message?.content ?? '{}';
}
