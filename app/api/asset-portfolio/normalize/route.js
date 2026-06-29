import * as XLSX from 'xlsx';
import { createClient } from '@/lib/supabase-server';
import { ASSET_REGISTER_FIELDS, ASSET_EVENTS_FIELDS } from '@/data/assetPortfolioSchema';
import { getCurrentUserId, upsertAssetRegisterRows, upsertAssetEventRows } from '@/lib/assetPortfolio';
import { callClaudeServer } from '@/lib/anthropicServer';

function sheetToRows(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return { headers: [], rows: [] };
  const aoa = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });
  const headers = (aoa[0] || []).map(h => String(h).trim()).filter(Boolean);
  const rows = aoa.slice(1).filter(r => r.some(c => c !== '' && c !== undefined && c !== null));
  return { headers, rows };
}

function rowsAsObjects(headers, rows) {
  return rows.map(r => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ''])));
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

async function mapAndApply(targetFields, headers, rows, label) {
  if (!headers.length || !rows.length) return { mapping: {}, applied: [], unmappedRequired: [] };

  const objects = rowsAsObjects(headers, rows);
  let mapping = {};
  let unmappedRequired = [];

  try {
    const prompt = buildMappingPrompt(targetFields, headers, objects, label);
    const raw = await callClaudeServer({
      prompt,
      system: 'You output only raw JSON matching the requested schema. No prose.',
      maxTokens: 800,
    });
    const parsed = parseJsonLoose(raw);
    mapping = parsed.mapping || {};
    unmappedRequired = parsed.unmapped_required || [];
  } catch {
    // Fallback: case-insensitive exact/substring match against canonical column labels — no LLM.
    for (const f of targetFields) {
      const match = headers.find(h => h.toLowerCase() === f.column.toLowerCase())
        || headers.find(h => h.toLowerCase().includes(f.db.replace(/_/g, ' ')));
      mapping[f.db] = match || null;
    }
    unmappedRequired = targetFields.filter(f => f.required && !mapping[f.db]).map(f => f.db);
  }

  const applied = objects.map(obj => {
    const out = {};
    for (const f of targetFields) {
      const userHeader = mapping[f.db];
      out[f.db] = userHeader ? obj[userHeader] : '';
    }
    return out;
  });

  return { mapping, applied, unmappedRequired };
}

export async function POST(request) {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) return Response.json({ error: 'Not authenticated.' }, { status: 401 });

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: 'Expected multipart/form-data with a file field.' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file) return Response.json({ error: 'No file uploaded.' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  let workbook;
  try {
    workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  } catch (err) {
    return Response.json({ error: `Could not parse file: ${err.message}` }, { status: 400 });
  }

  const sheetNames = workbook.SheetNames;
  const registerSheetName = sheetNames.find(n => /asset|register/i.test(n)) || sheetNames[0];
  const eventsSheetName = sheetNames.find(n => /event|capex/i.test(n) && n !== registerSheetName);

  const { headers: regHeaders, rows: regRows } = sheetToRows(workbook, registerSheetName);
  const register = await mapAndApply(ASSET_REGISTER_FIELDS, regHeaders, regRows, 'Asset Register');

  let events = { mapping: {}, applied: [], unmappedRequired: [] };
  if (eventsSheetName) {
    const { headers: evHeaders, rows: evRows } = sheetToRows(workbook, eventsSheetName);
    events = await mapAndApply(ASSET_EVENTS_FIELDS, evHeaders, evRows, 'Capex & Events Log');
  }

  const validRegisterRows = register.applied.filter(r => r.asset_id && r.asset_name);
  const flaggedRegisterRows = register.applied.length - validRegisterRows.length;

  let registerResult = { inserted: 0 };
  let eventsResult = { inserted: 0 };
  try {
    registerResult = await upsertAssetRegisterRows(supabase, userId, validRegisterRows);
    if (events.applied.length) {
      eventsResult = await upsertAssetEventRows(supabase, userId, events.applied.filter(r => r.asset_id));
    }
  } catch (err) {
    return Response.json({ error: `Database write failed: ${err.message}` }, { status: 500 });
  }

  return Response.json({
    register: {
      sheet: registerSheetName,
      mapping: register.mapping,
      rows_total: register.applied.length,
      rows_imported: registerResult.inserted,
      rows_flagged: flaggedRegisterRows,
      unmapped_required: register.unmappedRequired,
    },
    events: eventsSheetName ? {
      sheet: eventsSheetName,
      mapping: events.mapping,
      rows_total: events.applied.length,
      rows_imported: eventsResult.inserted,
      unmapped_required: events.unmappedRequired,
    } : null,
  });
}
