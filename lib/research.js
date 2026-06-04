/**
 * Client-side wrapper for /api/research.
 * Mirrors the pattern of lib/claude-api.js → /api/chat.
 * All API keys stay server-side inside the route handler.
 */

/**
 * Full research: 2x Tavily + 2x Exa in parallel.
 * Use for cockpit and stage generation where quality matters over speed.
 */
export async function researchClient({ clientName, brief, sector = null, eventType = 'general', researchTopics = null }) {
  try {
    const res = await fetch('/api/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientName, brief, sector, eventType, mode: 'full', customQueries: researchTopics }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.researchContext || null;
  } catch {
    return null;
  }
}

/**
 * Light research: Tavily only (2 queries).
 * Use for GuideBot where response speed matters.
 */
export async function researchClientLight({ clientName, brief }) {
  try {
    const res = await fetch('/api/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientName, brief, mode: 'light' }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.researchContext || null;
  } catch {
    return null;
  }
}
