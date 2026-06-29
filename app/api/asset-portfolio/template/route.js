import * as XLSX from 'xlsx';
import { ASSET_REGISTER_FIELDS, ASSET_EVENTS_FIELDS } from '@/data/assetPortfolioSchema';

export async function GET() {
  const wb = XLSX.utils.book_new();

  const registerHeader = ASSET_REGISTER_FIELDS.map(f => f.column);
  const registerSheet = XLSX.utils.aoa_to_sheet([registerHeader]);
  XLSX.utils.book_append_sheet(wb, registerSheet, 'Asset Register');

  const eventsHeader = ASSET_EVENTS_FIELDS.map(f => f.column);
  const eventsSheet = XLSX.utils.aoa_to_sheet([eventsHeader]);
  XLSX.utils.book_append_sheet(wb, eventsSheet, 'Capex & Events Log');

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="asset_register_template.xlsx"',
    },
  });
}
