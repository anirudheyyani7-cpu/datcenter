// Generic spreadsheet sheet/column-mapping helpers, shared by upload routes
// that map an arbitrary user workbook onto a canonical {column, db, type,
// required} schema. Mirrors the mapping approach in
// app/api/asset-portfolio/normalize/route.js (sheetToRows, the mapping
// prompt shape, the loose-JSON parser) but adds a no-LLM fast path: if a
// sheet's headers already match the canonical `column` labels exactly (the
// case when someone re-uploads our own template unmodified), skip the AI
// call entirely. Only sheets with genuinely unrecognized headers pay for an
// LLM round-trip.
import * as XLSX from 'xlsx';
import { callClaudeServer } from '@/lib/anthropicServer';

export function sheetToRows(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return { headers: [], rows: [] };
  const aoa = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });
  const headers = (aoa[0] || []).map(h => String(h).trim()).filter(Boolean);
  const rows = aoa.slice(1).filter(r => r.some(c => c !== '' && c !== undefined && c !== null));
  return { headers, rows };
}

export function rowsAsObjects(headers, rows) {
  return rows.map(r => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ''])));
}

function normalizeName(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

// Finds the best-matching workbook sheet name for a canonical sheet name:
// exact match first (case/whitespace-insensitive), then substring
// containment, then word-overlap scoring. Returns null below a confidence
// floor rather than guessing wrong.
export function matchSheetName(canonicalName, candidateNames) {
  const target = normalizeName(canonicalName);

  const exact = candidateNames.find(c => normalizeName(c) === target);
  if (exact) return exact;

  const contains = candidateNames.find(c => {
    const n = normalizeName(c);
    return n.includes(target) || target.includes(n);
  });
  if (contains) return contains;

  const targetWords = new Set(target.split(' ').filter(Boolean));
  let best = null;
  let bestScore = 0;
  for (const c of candidateNames) {
    const words = new Set(normalizeName(c).split(' ').filter(Boolean));
    const overlap = [...targetWords].filter(w => words.has(w)).length;
    const score = overlap / Math.max(targetWords.size, words.size, 1);
    if (score > bestScore) { bestScore = score; best = c; }
  }
  return bestScore >= 0.5 ? best : null;
}

// Strips the template's trailing " *" required-marker before comparing.
function normalizeHeader(h) {
  return String(h).replace(/\s*\*\s*$/, '').trim().toLowerCase();
}

// No-LLM strict match: every field's canonical `column` label is looked up
// verbatim (modulo the " *" marker and case/whitespace) against the sheet's
// actual headers.
function tryExactMapping(fields, headers) {
  const mapping = {};
  for (const f of fields) {
    const target = normalizeHeader(f.column);
    const match = headers.find(h => normalizeHeader(h) === target);
    mapping[f.db] = match || null;
  }
  const unmappedRequired = fields.filter(f => f.required && !mapping[f.db]).map(f => f.db);
  return { mapping, unmappedRequired, complete: unmappedRequired.length === 0 };
}

function buildMappingPrompt(targetFields, userHeaders, sampleRows, label) {
  const target = targetFields.map(f => `- ${f.db} (Excel column: "${f.column}"${f.required ? ', REQUIRED' : ''})`).join('\n');
  const samples = sampleRows.slice(0, 5).map(r => JSON.stringify(r)).join('\n');
  return `You are mapping a user-uploaded spreadsheet onto a fixed canonical schema for "${label}". You must NOT invent canonical fields — only use the keys listed below.

CANONICAL SCHEMA (key: db field name):
${target}

USER'S ACTUAL COLUMN HEADERS:
${JSON.stringify(userHeaders)}

SAMPLE ROWS (for context only — do not copy data into your answer):
${samples || '(no data rows)'}

Map each user header to the canonical db field it most likely represents (or null if it doesn't match anything). Respond with ONLY raw JSON, no markdown fences:
{
  "mapping": { "<canonical_db_field>": "<user_header_or_null>", ... },
  "unmapped_required": ["<canonical_db_field that has no matching user header>", ...]
}`;
}

function parseJsonLoose(raw) {
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON in mapping response.');
  return JSON.parse(match[0]);
}

function applyMapping(fields, mapping, objects) {
  return objects.map(obj => {
    const out = {};
    for (const f of fields) {
      const userHeader = mapping[f.db];
      out[f.db] = userHeader ? obj[userHeader] : '';
    }
    return out;
  });
}

// Maps one sheet's raw headers/rows onto `fields`. Returns
// { mapping, applied, unmappedRequired, method } where method is
// 'exact' (headers matched our template verbatim, no LLM call),
// 'ai' (headers didn't fully match, Claude mapped them — may still leave
//   unmappedRequired non-empty if Claude couldn't find a confident match), or
// 'skipped' (no headers/rows to map at all).
export async function mapSheetColumns(fields, headers, rows, label) {
  if (!headers.length || !rows.length) {
    return { mapping: {}, applied: [], unmappedRequired: [], method: 'skipped' };
  }

  const objects = rowsAsObjects(headers, rows);
  const exact = tryExactMapping(fields, headers);
  if (exact.complete) {
    return { mapping: exact.mapping, applied: applyMapping(fields, exact.mapping, objects), unmappedRequired: [], method: 'exact' };
  }

  // Exact matching left at least one required field unmapped — ask Claude,
  // falling back to the partial exact mapping if the call itself fails.
  let mapping = exact.mapping;
  let unmappedRequired = exact.unmappedRequired;
  try {
    const prompt = buildMappingPrompt(fields, headers, objects, label);
    const raw = await callClaudeServer({
      prompt,
      system: 'You output only raw JSON matching the requested schema. No prose.',
      maxTokens: 1200,
    });
    const parsed = parseJsonLoose(raw);
    mapping = parsed.mapping || {};
    unmappedRequired = parsed.unmapped_required || [];
  } catch {
    // Keep the partial exact mapping — better than failing the sheet outright.
  }

  return { mapping, applied: applyMapping(fields, mapping, objects), unmappedRequired, method: 'ai' };
}
