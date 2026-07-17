import * as XLSX from 'xlsx';
import { createClient } from '@/lib/supabase-server';
import { getCurrentUserId } from '@/lib/assetPortfolio';
import { EAI_MASTER_SCHEMA, EAI_LOAD_ORDER } from '@/data/eaiMasterSchema';
import { upsertEaiSheet } from '@/lib/eaiMasterData';
import { sheetToRows, matchSheetName, mapSheetColumns } from '@/lib/sheetMapping';

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

  // Sheets get consumed as they're matched so two schema sheets can't both
  // claim the same ambiguous workbook tab.
  const remainingSheets = new Set(workbook.SheetNames);
  const results = [];

  for (const sheetName of EAI_LOAD_ORDER) {
    const entry = EAI_MASTER_SCHEMA[sheetName];
    const matchedSheet = matchSheetName(sheetName, [...remainingSheets]);

    if (!matchedSheet) {
      results.push({
        sheetName, matched: false, rowsUpserted: 0, mappingMethod: 'skipped',
        errors: [], reason: 'No matching sheet found in the uploaded workbook.',
      });
      continue;
    }
    remainingSheets.delete(matchedSheet);

    const { headers, rows } = sheetToRows(workbook, matchedSheet);
    if (!headers.length || !rows.length) {
      results.push({
        sheetName, matched: true, workbookSheet: matchedSheet, rowsUpserted: 0, mappingMethod: 'skipped',
        errors: [], reason: `Sheet "${matchedSheet}" has no data rows.`,
      });
      continue;
    }

    let mapResult;
    try {
      mapResult = await mapSheetColumns(entry.fields, headers, rows, sheetName);
    } catch (err) {
      results.push({
        sheetName, matched: true, workbookSheet: matchedSheet, rowsUpserted: 0, mappingMethod: 'ai',
        errors: [`Header mapping failed: ${err.message}`],
      });
      continue;
    }

    const errors = mapResult.unmappedRequired.length
      ? [`Missing required columns: ${mapResult.unmappedRequired.join(', ')}`]
      : [];

    try {
      const { inserted, skipped } = await upsertEaiSheet(supabase, userId, sheetName, mapResult.applied);
      results.push({
        sheetName, matched: true, workbookSheet: matchedSheet,
        rowsTotal: mapResult.applied.length, rowsUpserted: inserted, rowsSkipped: skipped,
        mappingMethod: mapResult.method, errors,
      });
    } catch (err) {
      results.push({
        sheetName, matched: true, workbookSheet: matchedSheet,
        rowsTotal: mapResult.applied.length, rowsUpserted: 0,
        mappingMethod: mapResult.method, errors: [...errors, `Database write failed: ${err.message}`],
      });
    }
  }

  const summary = {
    totalSheets: EAI_LOAD_ORDER.length,
    matchedSheets: results.filter(r => r.matched).length,
    exactMapped: results.filter(r => r.mappingMethod === 'exact').length,
    aiMapped: results.filter(r => r.mappingMethod === 'ai').length,
    skipped: results.filter(r => r.mappingMethod === 'skipped').length,
    totalRowsUpserted: results.reduce((s, r) => s + (r.rowsUpserted || 0), 0),
    unrecognizedSheets: [...remainingSheets],
  };

  return Response.json({ summary, results });
}
