import * as XLSX from 'xlsx';
import { EAI_MASTER_SCHEMA, EAI_LOAD_ORDER } from '@/data/eaiMasterSchema';

// Generates the 43-sheet EAI master template live from EAI_MASTER_SCHEMA,
// so the schema in data/eaiMasterSchema.js and the downloadable template can
// never drift apart. Required columns get a trailing " *" — the upload
// route's exact-match fast path strips that marker before comparing, so a
// re-upload of this file needs zero AI header-mapping calls.
export async function GET() {
  const wb = XLSX.utils.book_new();

  for (const sheetName of EAI_LOAD_ORDER) {
    const { fields } = EAI_MASTER_SCHEMA[sheetName];
    const header = fields.map(f => f.column + (f.required ? ' *' : ''));
    const sheet = XLSX.utils.aoa_to_sheet([header]);
    // Excel sheet names are capped at 31 characters and can't contain: \ / ? * [ ]
    const safeName = sheetName.replace(/[\\/?*[\]]/g, '-').slice(0, 31);
    XLSX.utils.book_append_sheet(wb, sheet, safeName);
  }

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="eai_platform_master_template.xlsx"',
    },
  });
}
