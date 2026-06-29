// Per-asset disruption/risk polling: Tavily (always) + NewsAPI (only if
// NEWS_API_KEY is set — gracefully skipped otherwise, same degradation
// pattern as app/api/chat/route.js's Tavily-optional RAG). Results are
// batch-scored by Claude into {severity, category, summary} and returned
// for the caller to insert into asset_intelligence.
//
// To run this on a schedule instead of client-triggered polling, point a
// Vercel Cron entry (vercel.json `crons`) at
// POST /api/asset-portfolio/intelligence with a shared-secret header check
// added to that route — pollAssetIntelligence itself needs no changes.
import { callClaudeServer } from '@/lib/anthropicServer';

const CATEGORIES = ['Natural Disaster', 'Power Grid Event', 'Geopolitical', 'Connectivity', 'Regulatory', 'Climate'];

async function tavilySearch(query) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return [];
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey, query, search_depth: 'basic', max_results: 3 }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map(r => ({ title: r.title, content: r.content, url: r.url }));
  } catch {
    return [];
  }
}

async function newsApiSearch(query) {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) return [];
  try {
    const res = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=3&sortBy=publishedAt&apiKey=${apiKey}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.articles || []).map(a => ({ title: a.title, content: a.description, url: a.url }));
  } catch {
    return [];
  }
}

async function scoreResults(asset, results) {
  if (!results.length) return null;
  const prompt = `A data center asset "${asset.asset_name}" (${asset.city || ''}, ${asset.country || ''}) had these recent search results:
${results.map((r, i) => `${i + 1}. ${r.title} — ${r.content || ''}`).join('\n')}

Assess whether ANY of these indicate a real operational disruption risk to this facility (severe weather, grid instability, geopolitical instability, connectivity outage, new regulation, or climate event). If none are relevant, respond with exactly: NONE

Otherwise respond with ONLY raw JSON (no markdown fences):
{"severity": <0-10 integer>, "category": "<one of: ${CATEGORIES.join(', ')}>", "headline": "<short headline>", "summary": "<one-sentence summary>", "source_url": "<best matching url>"}`;

  try {
    const raw = await callClaudeServer({ prompt, system: 'You output only raw JSON or the word NONE. No prose.', maxTokens: 300 });
    if (/^\s*NONE\s*$/i.test(raw)) return null;
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

export async function pollAssetIntelligence(asset) {
  const locationQuery = `${asset.city || ''} ${asset.country || ''} data center disruption news`.trim();
  const [tavilyResults, newsResults] = await Promise.all([
    tavilySearch(locationQuery),
    newsApiSearch(locationQuery),
  ]);
  const combined = [...tavilyResults, ...newsResults];
  const scored = await scoreResults(asset, combined);
  if (!scored) return null;

  return {
    asset_id: asset.asset_id,
    source_url: scored.source_url || combined[0]?.url || null,
    headline: scored.headline,
    summary: scored.summary,
    severity: Math.max(0, Math.min(10, Number(scored.severity) || 0)),
    category: CATEGORIES.includes(scored.category) ? scored.category : 'Regulatory',
  };
}

export async function pollPortfolio(assets) {
  const results = await Promise.all(assets.map(a => pollAssetIntelligence(a).catch(() => null)));
  return results.filter(Boolean);
}
