/**
 * lib/claude-api.js
 *
 * Client-side wrapper. All calls go to /api/chat (Next.js server route).
 * No API keys ever exist in this file — they live in .env.local on the server.
 *
 * RAG is opt-in per call: pass ragQuery to trigger a Tavily search
 * that gets injected into the system prompt server-side.
 */

/**
 * Single (non-streaming) Claude call with optional RAG.
 *
 * @param {object} opts
 * @param {string} opts.prompt       - User prompt
 * @param {string} [opts.systemOverride] - Override system prompt
 * @param {number} [opts.maxTokens]  - Max tokens (default 2048)
 * @param {string} [opts.ragQuery]   - Tavily search query for RAG context
 * @returns {Promise<string>}
 */
export async function callClaude({ prompt, systemOverride, maxTokens = 16000, ragQuery }) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, systemOverride, maxTokens, ragQuery, stream: false }),
  });

  // Guard against HTML error pages (404/500) being returned instead of JSON
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(
      `API route not found or server error (${res.status}). ` +
      `Check that ANTHROPIC_API_KEY is set in .env.local and the dev server is running.`
    );
  }

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || `API error ${res.status}`);
  }
  return data.text;
}

/**
 * Streaming Claude call with optional RAG.
 * Yields text chunks as they arrive.
 *
 * @param {object} opts
 * @param {string} opts.prompt
 * @param {string} [opts.systemOverride]
 * @param {number} [opts.maxTokens]
 * @param {string} [opts.ragQuery]   - Tavily search query for RAG context
 * @yields {string}  text delta chunks
 */
export async function* callClaudeStream({ prompt, systemOverride, maxTokens = 16000, ragQuery }) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, systemOverride, maxTokens, ragQuery, stream: true }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `API error ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep incomplete line in buffer

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6);
      if (payload === '[DONE]') return;
      try {
        const parsed = JSON.parse(payload);
        if (parsed.error) throw new Error(parsed.error);
        if (parsed.text) yield parsed.text;
      } catch {
        // skip malformed SSE lines
      }
    }
  }
}

/**
 * Build a stage analysis prompt.
 * ragQuery is auto-derived from stageName + key form fields for best RAG results.
 */
export function buildStagePrompt(stageName, stageContext, formData, relevantDCData) {
  return `You are analyzing inputs for the "${stageName}" stage of the datacenter lifecycle.

## Stage Context
${stageContext}

## User Inputs
${Object.entries(formData)
  .map(([k, v]) => `- **${k}**: ${Array.isArray(v) ? v.join(', ') : v}`)
  .join('\n')}

${relevantDCData ? `## Relevant Market Data\n${relevantDCData}` : ''}

Please provide a comprehensive analysis for this stage with specific recommendations, quantitative benchmarks, and actionable next steps. Format your response with clear ## section headers.`;
}

/**
 * Derive a Tavily RAG query from stage name + form inputs.
 * Called by each stage page to pass ragQuery into callClaude.
 */
export function buildRagQuery(stageName, formData) {
  const region = formData.region || formData.jurisdictions?.join(', ') || '';
  const workloads = Array.isArray(formData.workloads) ? formData.workloads.join(' ') : '';
  const base = `datacenter ${stageName.toLowerCase()} ${region} ${workloads} 2024 2025`;
  return base.trim().replace(/\s+/g, ' ');
}

export function buildChatPrompt(messages, originalContext) {
  const formatted = messages
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n');
  return `You are continuing a conversation about datacenter lifecycle management. Here is the context:

${originalContext}

## Conversation So Far
${formatted}

Continue the conversation as the KPMG Datacenter Intelligence Engine. Provide specific, data-driven responses.`;
}
