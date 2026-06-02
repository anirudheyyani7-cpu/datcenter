/**
 * /app/api/logo/route.js
 *
 * Multi-strategy logo resolution:
 *   A) Domain guessing (instant, no API) → Clearbit
 *   B) Tavily search → Clearbit on found domain
 *   C) Google S2 favicon (always returns an image)
 *
 * GET ?clientName=Adani+Group
 * Response: { logoUrl: string | null }
 */

const TAVILY_API_URL = 'https://api.tavily.com/search';

function deriveCandidateDomains(clientName) {
  const base = clientName
    .toLowerCase()
    .replace(/\s+(group|limited|ltd|inc|corp|pvt|llc|plc|holdings|industries|enterprises|technologies|technology|solutions|services|energy|power|infra|infrastructure)\b/gi, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '');

  const full = clientName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  const candidates = new Set();
  if (base) candidates.add(`${base}.com`);
  if (full && full !== base) candidates.add(`${full}.com`);
  // Common Indian conglomerate patterns
  candidates.add(`${base}group.com`);
  candidates.add(`${base}india.com`);
  return [...candidates].slice(0, 4);
}

async function testClearbit(domain) {
  const url = `https://logo.clearbit.com/${domain}`;
  try {
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(3000) });
    if (res.ok) return url;
  } catch { /* ignore */ }
  return null;
}

async function findViaGoogle(domain) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

async function findViaTavily(clientName) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(TAVILY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query: `${clientName} official website`,
        search_depth: 'basic',
        max_results: 3,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    for (const result of (data.results || [])) {
      try {
        const url = new URL(result.url);
        const hostname = url.hostname.replace(/^www\./, '');
        if (['wikipedia', 'linkedin', 'bloomberg', 'moneycontrol', 'economictimes', 'business-standard'].some(s => hostname.includes(s))) continue;
        return hostname;
      } catch { /* skip */ }
    }
  } catch { /* ignore */ }
  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const clientName = (searchParams.get('clientName') || '').trim();
  if (!clientName) return Response.json({ logoUrl: null });

  // Strategy A — instant domain guessing
  const candidates = deriveCandidateDomains(clientName);
  for (const domain of candidates) {
    const url = await testClearbit(domain);
    if (url) return Response.json({ logoUrl: url });
  }

  // Strategy B — Tavily search → Clearbit
  const tavilyDomain = await findViaTavily(clientName);
  if (tavilyDomain) {
    const url = await testClearbit(tavilyDomain);
    if (url) return Response.json({ logoUrl: url });

    // Strategy C — Google favicon on the Tavily domain (always works)
    return Response.json({ logoUrl: await findViaGoogle(tavilyDomain) });
  }

  // Strategy C fallback — Google favicon on first candidate
  if (candidates.length > 0) {
    return Response.json({ logoUrl: await findViaGoogle(candidates[0]) });
  }

  return Response.json({ logoUrl: null });
}
