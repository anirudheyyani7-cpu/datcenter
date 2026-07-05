/**
 * Cross-entity search over data/google/searchIndex.json (Region, Country,
 * Campus, DataCenter, Rack, Asset). Not in the platform's literal services
 * list, but required by the SEARCH section of the spec — kept as its own
 * module since search spans entity types rather than belonging to one.
 *
 * searchIndex.json is ~25k rows (covers every rack and asset) so it's
 * dynamically imported rather than loaded at module scope — pages that
 * don't use cross-entity search never pay for it.
 * @typedef {import('../types/google').SearchIndexEntry} SearchIndexEntry
 */

/** @returns {Promise<SearchIndexEntry[]>} */
export async function search(query, { types } = {}) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const { default: searchIndex } = await import('../data/google/searchIndex.json');
  return searchIndex
    .filter(entry => !types || types.includes(entry.type))
    .filter(entry => entry.label.toLowerCase().includes(q) || entry.path.toLowerCase().includes(q))
    .slice(0, 25);
}

/** @returns {Promise<SearchIndexEntry[]>} */
export async function searchByType(type) {
  const { default: searchIndex } = await import('../data/google/searchIndex.json');
  return searchIndex.filter(entry => entry.type === type);
}
