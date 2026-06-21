// Server-only minimal Anthropic call. Used by API routes that need an LLM
// call but can't round-trip through /api/chat (relative fetch doesn't
// resolve from a server route). Mirrors the request shape used there.

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export async function callClaudeServer({ prompt, system, maxTokens = 1024, temperature }) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured on server.');
  }

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: maxTokens,
      system,
      ...(temperature !== undefined ? { temperature } : {}),
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Claude API error: ${res.status}`);
  }

  const data = await res.json();
  return data.content[0].text;
}
