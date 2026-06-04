/**
 * /app/api/research/route.js
 *
 * Parallel research endpoint: 2x Tavily + 2x Exa (or light mode: Tavily only).
 * No domain whitelist — we need company-specific news and press releases.
 *
 * POST body: { clientName, brief, sector, eventType, mode: 'full' | 'light' }
 * Response:  { researchContext: string | null }
 */

const TAVILY_API_URL = 'https://api.tavily.com/search';
const EXA_API_URL = 'https://api.exa.ai/search';

async function fetchTavily(query) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey || !query) return null;

  try {
    const res = await fetch(TAVILY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: 'advanced',
        include_answer: true,
        max_results: 5,
        // No include_domains — open web search for company-specific results
      }),
    });
    if (!res.ok) return null;

    const data = await res.json();
    const lines = [];
    if (data.answer) lines.push(data.answer);
    if (data.results?.length) {
      data.results.slice(0, 4).forEach(r => {
        if (r.title || r.content) {
          lines.push(`[${r.title || 'Result'}] ${r.content?.slice(0, 400) ?? ''} (${r.url || ''})`);
        }
      });
    }
    return lines.length ? lines.join('\n') : null;
  } catch {
    return null;
  }
}

async function fetchExa(query) {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey || !query) return null;

  try {
    const res = await fetch(EXA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        query,
        numResults: 5,
        useAutoprompt: true,
        contents: { text: { maxCharacters: 1000 } },
      }),
    });
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.results?.length) return null;

    return data.results
      .filter(r => r.title || r.text)
      .map(r => `[${r.title || 'Result'}] ${(r.text || '').slice(0, 400)}`)
      .join('\n');
  } catch {
    return null;
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { clientName, brief, sector, mode = 'full', customQueries = null } = body;

  if (!clientName && !brief) {
    return Response.json({ researchContext: null });
  }

  const year = new Date().getFullYear();
  const name = clientName || 'the company';

  let results;

  if (customQueries && customQueries.length >= 2) {
    // Use dynamically generated queries from the intent planner
    const tavilyQ1 = fetchTavily(customQueries[0]);
    const tavilyQ2 = fetchTavily(customQueries[1]);

    if (mode === 'light') {
      results = await Promise.allSettled([tavilyQ1, tavilyQ2]);
    } else {
      const exaQ3 = fetchExa(customQueries[2] || customQueries[0]);
      const exaQ4 = fetchExa(customQueries[3] || customQueries[1]);
      results = await Promise.allSettled([tavilyQ1, tavilyQ2, exaQ3, exaQ4]);
    }
  } else {
    // Fall back to hardcoded queries
    const tavilyQ1 = fetchTavily(
      `${name} datacenter strategy India ${year} latest news announcement`
    );
    const tavilyQ2 = fetchTavily(
      `${name} company profile sector background India`
    );

    if (mode === 'light') {
      results = await Promise.allSettled([tavilyQ1, tavilyQ2]);
    } else {
      const exaQ3 = fetchExa(
        `companies similar to ${name} entering datacenter market India ${sector || ''}`
      );
      const exaQ4 = fetchExa(
        `India hyperscale datacenter investment market ${year} ${name}`
      );
      results = await Promise.allSettled([tavilyQ1, tavilyQ2, exaQ3, exaQ4]);
    }
  }

  const [r1, r2, r3, r4] = results;

  const sections = [];
  if (r1?.status === 'fulfilled' && r1.value) {
    sections.push(`=== RECENT NEWS & ANNOUNCEMENTS ===\n${r1.value}`);
  }
  if (r2?.status === 'fulfilled' && r2.value) {
    sections.push(`=== COMPANY BACKGROUND ===\n${r2.value}`);
  }
  if (r3?.status === 'fulfilled' && r3.value) {
    sections.push(`=== SIMILAR MARKET PLAYERS & CASES ===\n${r3.value}`);
  }
  if (r4?.status === 'fulfilled' && r4.value) {
    sections.push(`=== MARKET INTELLIGENCE ===\n${r4.value}`);
  }

  return Response.json({
    researchContext: sections.length ? sections.join('\n\n') : null,
  });
}
