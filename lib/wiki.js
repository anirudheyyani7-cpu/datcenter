/**
 * lib/wiki.js
 *
 * Client-side helper to trigger wiki writes after knowledge events.
 * Fire-and-forget — never blocks the UI. Errors are silent.
 *
 * Usage:
 *   import { writeToWiki } from '@/lib/wiki';
 *   writeToWiki('stage-completion', outputText, { stage: '01', client: 'Mytrah' });
 */

/**
 * Trigger a wiki write. Always fire-and-forget.
 *
 * @param {string} eventType  - 'stage-completion' | 'doc-upload' | 'cockpit' | 'guidebot'
 * @param {string} content    - The raw Claude output / analysis text
 * @param {object} metadata   - { stage, stageLabel, client, region, capacity, ... }
 */
export async function writeToWiki(eventType, content, metadata = {}) {
  if (!content || content.length < 50) return;

  try {
    // Non-blocking — don't await in the caller
    fetch('/api/wiki/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, content, metadata }),
    }).catch(() => {
      // Silently swallow — wiki write failure never disrupts UX
    });
  } catch {
    // Silent
  }
}

/**
 * Fetch the current graph data from the wiki.
 */
export async function fetchWikiGraph() {
  const res = await fetch('/api/wiki/graph');
  if (!res.ok) throw new Error(`Graph fetch failed: ${res.status}`);
  return res.json();
}