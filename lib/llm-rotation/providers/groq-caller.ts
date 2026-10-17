/**
 * lib/llm-rotation/providers/groq-caller.ts
 *
 * Direct HTTP client for Groq LPU chat completions API (Qwen, Groq Compound).
 */

export async function callGroqModel(
  modelId: string,
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  maxTokens: number,
  apiKey: string
): Promise<string> {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  
  // For reasoning/heavy models on Groq, provide sufficient token budget to think
  const effectiveMaxTokens = (modelId.includes('qwen') || modelId.includes('compound'))
    ? Math.max(maxTokens, 8192)
    : maxTokens;

  const body: any = {
    model: modelId,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature,
    max_completion_tokens: effectiveMaxTokens,
  };

  // Add compound_custom tools for compound agentic model
  if (modelId === 'groq/compound') {
    body.compound_custom = {
      tools: {
        enabled_tools: ['web_search', 'code_interpreter', 'visit_website']
      }
    };
  }

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
    console.error(`[GroqAPI] Error fetching from ${url}:`, error);
    throw error;
  }

  if (!response.ok) {
    const text = await response.text();
    throw Object.assign(new Error(`[GroqAPI] ${response.status} — ${text}`), {
      status: response.status,
    });
  }

  const json = await response.json();
  return json.choices?.[0]?.message?.content ?? '{}';
}
