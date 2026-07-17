// Generic data-access layer for the EAI Platform's 43-sheet master schema
// (data/eaiMasterSchema.js -> supabase/schema.sql eai_* tables). One pair of
// functions (upsertEaiSheet / fetchEaiSheet) replaces what would otherwise be
// 43 near-identical hand-written functions, following the same coerce-then-
// upsert pattern as upsertAssetRegisterRows in lib/assetPortfolio.js.
import { EAI_MASTER_SCHEMA } from '@/data/eaiMasterSchema';
import { coerceRow } from '@/lib/assetPortfolio';

// Two sheets have a `db` field name that collides with a column every eai_*
// table already uses for another purpose — renamed at the SQL layer (see the
// comments beside eai_users / eai_audit_logs in supabase/schema.sql), so the
// coerced row needs the same rename applied before it's written.
//   - Users: "user_id" (the sheet's own User ID column) collides with the
//     owning-user FK every table has -> stored as sheet_user_id.
//   - Audit Logs: "user" (the actor column) is a reserved word in Postgres
//     -> stored as performed_by.
const COLUMN_OVERRIDES = {
  Users: { user_id: 'sheet_user_id' },
  'Audit Logs': { user: 'performed_by' },
};

// Business-key column(s) per sheet — must match the `unique (user_id, ...)`
// constraint defined for that sheet's table in supabase/schema.sql. Used as
// the upsert's onConflict target and to drop rows missing their key.
export const EAI_UNIQUE_KEYS = {
  Facilities: ['facility_id'],
  Contracts: ['contract_id'],
  'Real Estate Hierarchy': ['node_id'],
  'Rack Telemetry': ['rack_node_id', 'reading_date'],
  'Digital Twin Thermal Tiles': ['room_node_id', 'grid_col', 'grid_row'],
  'IT Assets': ['asset_id'],
  'Purchase Orders': ['po_number'],
  'PO Line Items': ['po_number', 'line_item'],
  Vendors: ['vendor_name'],
  Shipments: ['shipment_id'],
  'Inventory by Location': ['location'],
  'FinOps Cost Line Items': ['line_item_id'],
  'ESG Metrics': ['metric_id'],
  'Work Orders': ['wo_id'],
  Incidents: ['incident_id'],
  Integrations: ['integration_id'],
  Users: ['sheet_user_id'],
  'Supply Chain Flow Stages': ['stage'],
  'Top Cost Drivers': ['driver'],
  'Unit Economics': ['month'],
  'ESG Scorecard': ['scope'],
  'ESG Initiatives & Compliance': ['name'],
  'Data Flows': ['flow_name'],
  'API Health': ['api_name'],
  'Integration Uptime': ['service'],
  'Integration Map Nodes': ['node_name'],
  'Error Analysis': ['module', 'type', 'label'],
  'Trend Series': ['module', 'metric', 'date', 'series'],
  'Alerts & Activity Feed': ['module', 'title', 'timestamp'],
  'AI Insights & Recommendations': ['module', 'title'],
  'Cost Optimization Opportunities': ['opportunity'],
  'Risk Heatmap': ['likelihood', 'impact'],
  'Predictive Failures': ['asset', 'facility_id'],
  Anomalies: ['category', 'facility_id'],
  'Recent Reports': ['report_name', 'generated_on'],
  'Scheduled Reports': ['name'],
  'System Health Services': ['service'],
  'System Resource Usage': ['resource'],
  'Security Overview': ['metric'],
  'Audit Logs': ['time', 'performed_by', 'action'],
  'Storage Overview': ['category'],
  'Support Tickets': ['severity'],
  'Licenses & Usage': ['metric'],
};

function applyColumnOverrides(row, sheetName) {
  const overrides = COLUMN_OVERRIDES[sheetName];
  if (!overrides) return row;
  const out = { ...row };
  for (const [from, to] of Object.entries(overrides)) {
    if (from in out) {
      out[to] = out[from];
      delete out[from];
    }
  }
  return out;
}

// Coerces + upserts a batch of raw (already header-mapped to canonical `db`
// keys) rows for one sheet. Rows missing any part of their business key are
// dropped rather than failing the whole batch.
export async function upsertEaiSheet(supabase, userId, sheetName, rawRows) {
  const entry = EAI_MASTER_SCHEMA[sheetName];
  if (!entry) throw new Error(`Unknown EAI sheet: "${sheetName}"`);
  const uniqueCols = EAI_UNIQUE_KEYS[sheetName];
  if (!uniqueCols) throw new Error(`No unique key configured for sheet: "${sheetName}"`);

  const rows = (rawRows ?? [])
    .map(r => applyColumnOverrides(coerceRow(r, entry.fields), sheetName))
    .map(r => ({ ...r, user_id: userId }))
    .filter(r => uniqueCols.every(col => r[col] !== null && r[col] !== undefined && r[col] !== ''));

  if (!rows.length) return { inserted: 0, skipped: rawRows?.length ?? 0 };

  const { error } = await supabase
    .from(entry.table)
    .upsert(rows, { onConflict: ['user_id', ...uniqueCols].join(',') });
  if (error) throw new Error(`${sheetName}: ${error.message}`);
  return { inserted: rows.length, skipped: (rawRows?.length ?? 0) - rows.length };
}

// Generic read helper — one row shape per sheet, straight from its table.
export async function fetchEaiSheet(supabase, userId, sheetName, { limit, orderBy } = {}) {
  const entry = EAI_MASTER_SCHEMA[sheetName];
  if (!entry) throw new Error(`Unknown EAI sheet: "${sheetName}"`);

  let query = supabase.from(entry.table).select('*').eq('user_id', userId);
  if (orderBy) query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw new Error(`${sheetName}: ${error.message}`);
  return data ?? [];
}

function avg(values) {
  const nums = values.map(Number).filter(Number.isFinite);
  if (!nums.length) return null;
  return Math.round((nums.reduce((s, n) => s + n, 0) / nums.length) * 100) / 100;
}

function countDistinct(rows, field) {
  return new Set(rows.map(r => r[field]).filter(Boolean)).size;
}

// Computes the Global Portfolio KPI strip the same shape as `eaiKpis` in
// data/eaiMockData.js, but from live eai_facilities / eai_it_assets /
// eai_alerts_activity_feed rows instead of hardcoded numbers. This is the
// template for the rest of the per-dashboard aggregate readers — the other
// pages' equivalents aren't built yet (see Part 5 of the EAI backend plan).
// `delta`/`up`/`seed` describe month-over-month trend, which needs a
// historical snapshot we don't have yet, so they're left null/neutral here
// rather than invented.
export async function getPortfolioKpis(supabase, userId) {
  const [facilities, assets, feed] = await Promise.all([
    fetchEaiSheet(supabase, userId, 'Facilities'),
    fetchEaiSheet(supabase, userId, 'IT Assets'),
    fetchEaiSheet(supabase, userId, 'Alerts & Activity Feed'),
  ]);

  const activeAlerts = feed.filter(
    r => r.type === 'Alert' && ['Critical', 'High'].includes(r.severity)
  ).length;

  return [
    {
      key: 'facilities', label: 'Total Facilities', value: String(facilities.length),
      sublabel: `Across ${countDistinct(facilities, 'country')} countries`,
      delta: null, up: null, iconKey: 'building', color: '#0077C8', bg: 'rgba(0,119,200,0.14)', seed: 11,
    },
    {
      key: 'assets', label: 'Total Assets', value: assets.length.toLocaleString(),
      sublabel: 'Across all facilities',
      delta: null, up: null, iconKey: 'layers', color: '#00A36C', bg: 'rgba(0,163,108,0.14)', seed: 22,
    },
    {
      key: 'capacity', label: 'Total Capacity',
      value: Math.round(facilities.reduce((s, f) => s + (Number(f.total_capacity_mw) || 0), 0)).toLocaleString(),
      unit: 'MW', sublabel: 'IT Power Capacity',
      delta: null, up: null, iconKey: 'zap', color: '#F59E0B', bg: 'rgba(245,158,11,0.14)', seed: 33,
    },
    {
      key: 'utilization', label: 'Utilization', value: String(avg(facilities.map(f => f.utilization_pct)) ?? 0),
      unit: '%', sublabel: 'Average Utilization',
      delta: null, up: null, iconKey: 'timer', color: '#EAB308', bg: 'rgba(234,179,8,0.14)', seed: 44,
    },
    {
      key: 'health', label: 'Health Score', value: String(avg(facilities.map(f => f.health_score)) ?? 0),
      unit: '/100', sublabel: 'Average Health',
      delta: null, up: null, iconKey: 'activity', color: '#00A36C', bg: 'rgba(0,163,108,0.14)', seed: 55,
    },
    {
      key: 'pue', label: 'PUE (Avg)', value: String(avg(facilities.map(f => f.pue)) ?? 0),
      sublabel: 'Power Usage Effectiveness',
      delta: null, up: null, iconKey: 'droplets', color: '#38BDF8', bg: 'rgba(56,189,248,0.14)', seed: 66,
    },
    {
      key: 'renewable', label: 'Renewable %', value: String(avg(facilities.map(f => f.renewable_energy_pct)) ?? 0),
      unit: '%', sublabel: 'Renewable Energy',
      delta: null, up: null, iconKey: 'leaf', color: '#34D399', bg: 'rgba(52,211,153,0.14)', seed: 77,
    },
    {
      key: 'alerts', label: 'Active Alerts', value: String(activeAlerts),
      sublabel: 'Requires Attention',
      delta: null, up: null, iconKey: 'shieldAlert', color: '#DC2626', bg: 'rgba(220,38,38,0.14)', seed: 88,
    },
  ];
}
