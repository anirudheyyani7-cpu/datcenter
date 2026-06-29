// Canonical Asset Portfolio schema — the single source of truth for:
//   - the downloadable Excel template (app/api/asset-portfolio/template/route.js)
//   - the AI normalization target schema (app/api/asset-portfolio/normalize/route.js)
//   - Supabase row validation/coercion (lib/assetPortfolio.js)
//   - the table view's column config (app/asset-portfolio/assets/page.jsx)
//
// `column` is the human-facing Excel header AND the canonical key the AI
// normalization layer maps onto. `db` is the snake_case Supabase column.

export const ASSET_REGISTER_FIELDS = [
  { column: 'Asset ID',                 db: 'asset_id',               type: 'text',    required: true },
  { column: 'Asset Name',               db: 'asset_name',             type: 'text',    required: true },
  { column: 'Region',                   db: 'region',                 type: 'text' },
  { column: 'Country',                  db: 'country',                type: 'text' },
  { column: 'City',                     db: 'city',                   type: 'text' },
  { column: 'Latitude',                 db: 'latitude',               type: 'number',  required: true },
  { column: 'Longitude',                db: 'longitude',              type: 'number',  required: true },
  { column: 'Ownership Type',           db: 'ownership_type',         type: 'enum',    options: ['Owned', 'Leased', 'Colo'] },
  { column: 'Facility Status',          db: 'facility_status',        type: 'enum',    options: ['Active', 'Under Construction', 'Decommissioning'] },
  { column: 'Tier Rating',              db: 'tier_rating',             type: 'enum',    options: ['I', 'II', 'III', 'IV'] },
  { column: 'Total Area (sqft)',        db: 'total_area_sqft',        type: 'number' },
  { column: 'Total IT Capacity (MW)',   db: 'total_it_capacity_mw',   type: 'number' },
  { column: 'Current IT Load (MW)',     db: 'current_it_load_mw',     type: 'number' },
  { column: 'Utilization %',            db: 'utilization_pct',        type: 'number' },
  { column: 'PUE',                      db: 'pue',                     type: 'number' },
  { column: 'Acquisition Date',         db: 'acquisition_date',       type: 'date' },
  { column: 'Acquisition Value ($M)',   db: 'acquisition_value_m',    type: 'number' },
  { column: 'Current Valuation ($M)',   db: 'current_valuation_m',    type: 'number' },
  { column: 'Annual Depreciation ($M)', db: 'annual_depreciation_m',  type: 'number' },
  { column: 'Capex Budget ($M)',        db: 'capex_budget_m',         type: 'number' },
  { column: 'Capex Spent ($M)',         db: 'capex_spent_m',          type: 'number' },
  { column: 'Capex Remaining ($M)',     db: 'capex_remaining_m',      type: 'number' },
  { column: 'Lease Start Date',         db: 'lease_start_date',       type: 'date' },
  { column: 'Lease Expiry Date',        db: 'lease_expiry_date',      type: 'date' },
  { column: 'Break Clause Date',        db: 'break_clause_date',      type: 'date' },
  { column: 'Annual Rent ($M)',         db: 'annual_rent_m',          type: 'number' },
  { column: 'Rent Escalation %',        db: 'rent_escalation_pct',    type: 'number' },
  { column: 'Renewal Option (Yes/No)',  db: 'renewal_option',         type: 'boolean' },
  { column: 'PPA Provider',             db: 'ppa_provider',           type: 'text' },
  { column: 'PPA Rate ($/MWh)',         db: 'ppa_rate_usd_mwh',       type: 'number' },
  { column: 'PPA Expiry Date',          db: 'ppa_expiry_date',        type: 'date' },
  { column: 'Renewable Energy %',       db: 'renewable_energy_pct',   type: 'number' },
  { column: 'Risk Flag (High/Medium/Low)', db: 'risk_flag',           type: 'enum',    options: ['High', 'Medium', 'Low'] },
  { column: 'Notes',                    db: 'notes',                   type: 'text' },
];

export const ASSET_EVENTS_FIELDS = [
  { column: 'Asset ID',     db: 'asset_id',    type: 'text', required: true },
  { column: 'Event Type',   db: 'event_type',  type: 'enum', options: ['Capex', 'Lease Renewal', 'PPA Renewal', 'Acquisition', 'Disposal'] },
  { column: 'Event Date',   db: 'event_date',  type: 'date' },
  { column: 'Amount ($M)',  db: 'amount_m',    type: 'number' },
  { column: 'Status',       db: 'status',      type: 'enum', options: ['Planned', 'Committed', 'Completed'] },
  { column: 'Notes',        db: 'notes',       type: 'text' },
];

export const REGIONS = ['AMER', 'EMEA', 'APAC', 'LATAM'];
export const OWNERSHIP_TYPES = ['Owned', 'Leased', 'Colo'];
export const RISK_FLAGS = ['High', 'Medium', 'Low'];
export const TIER_RATINGS = ['I', 'II', 'III', 'IV'];

export function dbColumnsFor(fields) {
  return fields.map(f => f.db);
}
