/**
 * /app/api/intent/route.js
 *
 * Zero-shot intent planning using Claude with extended thinking.
 * No system prompt — the thinking budget does all the reasoning.
 *
 * Given a client name and brief, returns:
 *   - stakeholderType: what kind of entity this client is
 *   - primaryGoal: their actual objective in one sentence
 *   - keyQuestions: questions that must be answered for their decision
 *   - researchTopics: 4 targeted search queries for Tavily + Exa
 *
 * POST body: { clientName, brief }
 * Response:  { intent: { stakeholderType, primaryGoal, keyQuestions, researchTopics } }
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export async function POST(request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'ANTHROPIC_API_KEY not configured.' }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { clientName, brief } = body;

  if (!brief) {
    return Response.json({ error: 'brief is required.' }, { status: 400 });
  }

  const userMessage = `Client name: ${clientName || 'Unknown'}
Client brief: ${brief}

Analyze this client and return a JSON object with exactly these fields:
{
  "stakeholderType": "investor|builder|expander|operator|advisor|unknown",
  "primaryGoal": "one sentence describing what this client actually wants to achieve",
  "keyQuestions": ["question 1", "question 2", "question 3"],
  "researchTopics": ["targeted search query 1", "targeted search query 2", "targeted search query 3", "targeted search query 4"]
}

For researchTopics, generate specific search queries that would surface the most relevant market intelligence, deal data, and comparable cases for THIS specific client type and goal — not generic datacenter news.

If stakeholderType is "investor", researchTopics MUST focus on financial/deal intelligence only:
- Deal flow: recent PE/VC/infra fund investments in India datacenter sector (deal names, fund names, ticket sizes, valuations)
- IRR benchmarks: infrastructure fund returns India, datacenter asset yield targets, EV/EBITDA multiples paid
- Exit precedents: datacenter M&A transactions India, REIT/InvIT conversions, strategic exits, secondary PE sales
- Competitive capital landscape: which funds are active in India DC, their mandates, capital availability, portfolio holdings
Do NOT generate queries about datacenter construction, land acquisition, power procurement, or operations for an investor client.

Return only the JSON object. No explanation, no markdown.`;

  try {
    const res = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 8000,
        thinking: {
          type: 'enabled',
          budget_tokens: 5000,
        },
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return Response.json(
        { error: errData.error?.message || `Claude API error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Extended thinking returns mixed content blocks — find the text block
    const textBlock = data.content.find(b => b.type === 'text');
    if (!textBlock?.text) {
      return Response.json({ error: 'No text output from intent planner.' }, { status: 500 });
    }

    const cleaned = textBlock.text.replace(/```json|```/gi, '').trim();
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    const intent = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1));

    return Response.json({ intent });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
