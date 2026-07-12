-- Run this in the Supabase SQL editor to create all tables

-- Datacenters
create table public.datacenters (
  id text primary key,
  name text not null,
  location text,
  country text,
  region text,
  status text default 'operational',
  health_score integer,
  tier integer,
  power_mw numeric,
  pue numeric,
  coordinates jsonb, 
  specs jsonb,
  created_at timestamptz default now()
);
alter table public.datacenters enable row level security;
create policy "Authenticated users can read datacenters"
  on public.datacenters for select to authenticated using (true);

-- Tenants
create table public.tenants (
  id text primary key,
  name text not null,
  datacenter_id text references public.datacenters(id),
  contract_start date,
  contract_end date,
  power_kw numeric,
  sla_tier text,
  monthly_revenue numeric,
  status text default 'active',
  created_at timestamptz default now()
);
alter table public.tenants enable row level security;
create policy "Authenticated users can read tenants"
  on public.tenants for select to authenticated using (true);

-- Incidents
create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  datacenter_id text references public.datacenters(id),
  title text not null,
  severity text,  -- 'critical' | 'high' | 'medium' | 'low'
  status text default 'open',  -- 'open' | 'investigating' | 'resolved'
  category text,
  description text,
  created_at timestamptz default now(),
  resolved_at timestamptz
);
alter table public.incidents enable row level security;
create policy "Authenticated users can read incidents"
  on public.incidents for select to authenticated using (true);
create policy "Authenticated users can insert incidents"
  on public.incidents for insert to authenticated with check (true);
create policy "Authenticated users can update incidents"
  on public.incidents for update to authenticated using (true);

-- Assets
create table public.assets (
  id uuid primary key default gen_random_uuid(),
  datacenter_id text references public.datacenters(id),
  name text not null,
  category text,  -- 'power' | 'cooling' | 'network' | 'security'
  health_score integer,
  status text default 'operational',
  last_maintenance date,
  next_maintenance date,
  specs jsonb,
  created_at timestamptz default now()
);
alter table public.assets enable row level security;
create policy "Authenticated users can read assets"
  on public.assets for select to authenticated using (true);

-- Maintenance schedules
create table public.maintenance_schedules (
  id uuid primary key default gen_random_uuid(),
  datacenter_id text references public.datacenters(id),
  asset_id uuid references public.assets(id),
  title text not null,
  scheduled_date date,
  duration_hours numeric,
  status text default 'planned',  -- 'planned' | 'in_progress' | 'completed'
  technician text,
  notes text,
  created_at timestamptz default now()
);
alter table public.maintenance_schedules enable row level security;
create policy "Authenticated users can read maintenance"
  on public.maintenance_schedules for select to authenticated using (true);

-- Stage progress (per user, per lifecycle run)
create table public.stage_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  datacenter_id text,
  stage_number integer not null,
  completed boolean default false,
  inputs jsonb,
  ai_output text,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique (user_id, datacenter_id, stage_number)
);
alter table public.stage_progress enable row level security;
create policy "Users can manage their own stage progress"
  on public.stage_progress for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- User-generated report history
create table public.user_reports (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  report_type   text not null,
  report_name   text not null,
  file_name     text,
  date_from     date,
  date_to       date,
  generated_at  timestamptz default now() not null
);
alter table public.user_reports enable row level security;
create policy "Users can read their own reports"
  on public.user_reports for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert their own reports"
  on public.user_reports for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can delete their own reports"
  on public.user_reports for delete to authenticated using (auth.uid() = user_id);

-- AI outputs cache
create table public.ai_outputs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  context text,  -- 'stage' | 'facility' | 'copilot'
  context_id text,  -- stage number or datacenter id
  prompt_hash text,
  output text,
  created_at timestamptz default now()
);
alter table public.ai_outputs enable row level security;
create policy "Users can read their own AI outputs"
  on public.ai_outputs for select to authenticated
  using (auth.uid() = user_id);
create policy "Users can insert their own AI outputs"
  on public.ai_outputs for insert to authenticated
  with check (auth.uid() = user_id);

-- ============================================================
-- Asset Portfolio module (per-user data center real estate register)
-- ============================================================

-- Asset register — one row per facility, scoped to the uploading user.
create table public.asset_register (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid references auth.users(id) on delete cascade not null,
  asset_id                text not null,
  asset_name              text not null,
  region                  text,
  country                 text,
  city                    text,
  latitude                numeric,
  longitude               numeric,
  ownership_type          text,  -- 'Owned' | 'Leased' | 'Colo'
  facility_status         text,  -- 'Active' | 'Under Construction' | 'Decommissioning'
  tier_rating             text,  -- 'I' | 'II' | 'III' | 'IV'
  total_area_sqft         numeric,
  total_it_capacity_mw    numeric,
  current_it_load_mw      numeric,
  utilization_pct         numeric,
  pue                     numeric,
  acquisition_date        date,
  acquisition_value_m     numeric,
  current_valuation_m     numeric,
  annual_depreciation_m   numeric,
  capex_budget_m          numeric,
  capex_spent_m           numeric,
  capex_remaining_m       numeric,
  lease_start_date        date,
  lease_expiry_date       date,
  break_clause_date       date,
  annual_rent_m           numeric,
  rent_escalation_pct     numeric,
  renewal_option          boolean,
  ppa_provider            text,
  ppa_rate_usd_mwh        numeric,
  ppa_expiry_date         date,
  renewable_energy_pct    numeric,
  risk_flag               text,  -- 'High' | 'Medium' | 'Low'
  notes                   text,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now(),
  unique (user_id, asset_id)
);
alter table public.asset_register enable row level security;
create policy "Users can manage their own asset register"
  on public.asset_register for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Capex & events log — one row per Capex/Lease/PPA/Acquisition/Disposal event.
create table public.asset_events (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  asset_id      text not null,  -- joins to asset_register on (user_id, asset_id); not a hard FK
  event_type    text,  -- 'Capex' | 'Lease Renewal' | 'PPA Renewal' | 'Acquisition' | 'Disposal'
  event_date    date,
  amount_m      numeric,
  status        text,  -- 'Planned' | 'Committed' | 'Completed'
  notes         text,
  created_at    timestamptz default now()
);
alter table public.asset_events enable row level security;
create policy "Users can manage their own asset events"
  on public.asset_events for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Intelligence feed — AI-scored disruption/risk events detected per asset.
create table public.asset_intelligence (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  asset_id      text not null,
  source_url    text,
  headline      text,
  summary       text,
  severity      integer,  -- 0-10
  category      text,     -- 'Natural Disaster' | 'Power Grid Event' | 'Geopolitical' | 'Connectivity' | 'Regulatory' | 'Climate'
  detected_at   timestamptz default now()
);
alter table public.asset_intelligence enable row level security;
create policy "Users can manage their own asset intelligence"
  on public.asset_intelligence for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- EAI Platform module — one table per sheet in data/eaiMasterSchema.js
-- (EAI_MASTER_SCHEMA). Same per-user upsert pattern as asset_register:
-- uuid id, owning user_id, business-key unique constraint, RLS scoped to
-- auth.uid() = user_id. No DB-level FK constraints between these tables —
-- eai_master_schema.js documents them as soft references so a partial or
-- out-of-order upload never hard-fails.
--
-- Two column renames vs. the `db` name in eaiMasterSchema.js, both to avoid
-- colliding with reserved/owner columns (handled by a small override map in
-- lib/eaiMasterData.js, not by editing eaiMasterSchema.js):
--   - Users sheet:      "user_id" (the sheet's own User ID column) -> sheet_user_id,
--                        because every table's owner column is already user_id.
--   - Audit Logs sheet: "user" (the actor column) -> performed_by,
--                        because USER is a reserved word in Postgres.
--
-- Business keys below follow "first required text field" wherever that field
-- is actually unique per row. Where a sheet has no such field (composite
-- rows like daily telemetry, or 5x5 grids, or fields that are only unique
-- enum values), a composite unique constraint is used instead — noted inline.
-- ============================================================

-- Facilities — all 94 campuses (locations real; operational figures modeled).
create table public.eai_facilities (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid references auth.users(id) on delete cascade not null,
  facility_id             text not null,
  facility_name           text not null,
  region                  text,  -- 'APAC' | 'EMEA' | 'Americas' | 'North America' | 'Latin America' | 'Middle East' | 'Asia' | 'South America' | 'Europe'
  country                 text,
  city                    text,
  latitude                numeric,
  longitude               numeric,
  ownership_type          text,  -- 'Owned' | 'Leased' | 'Colo'
  facility_status         text,  -- 'Optimal' | 'Good' | 'Warning' | 'Critical' | 'Maintenance'
  tier_rating             text,  -- 'I' | 'II' | 'III' | 'IV'
  total_capacity_mw       numeric,
  it_capacity_mw          numeric,
  current_it_load_mw      numeric,
  utilization_pct         numeric,
  health_score            numeric,
  pue                     numeric,
  renewable_energy_pct    numeric,
  total_area_sqft         numeric,
  rack_count              numeric,
  occupancy_pct           numeric,
  avg_temperature_c       numeric,
  acquisition_value_m     numeric,
  current_valuation_m     numeric,
  annual_depreciation_m   numeric,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now(),
  unique (user_id, facility_id)
);
alter table public.eai_facilities enable row level security;
create policy "Users can manage their own eai facilities"
  on public.eai_facilities for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Contracts — lease/PPA/service/maintenance contracts per facility.
create table public.eai_contracts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  contract_id   text not null,
  vendor        text,
  facility_id   text not null,
  contract_type text,  -- 'Lease' | 'PPA' | 'Service' | 'Maintenance'
  expiry_date   date,
  value_usd     numeric,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique (user_id, contract_id)
);
alter table public.eai_contracts enable row level security;
create policy "Users can manage their own eai contracts"
  on public.eai_contracts for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Real Estate Hierarchy — Campus > Building > Floor > Room > Rack tree.
create table public.eai_real_estate_hierarchy (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete cascade not null,
  node_id             text not null,
  node_type           text not null,  -- 'Campus' | 'Building' | 'Floor' | 'Room' | 'Rack'
  parent_node_id      text,
  node_name           text not null,
  facility_id         text not null,
  latitude            numeric,
  longitude           numeric,
  total_capacity_mw   numeric,
  it_capacity_mw      numeric,
  utilization_pct     numeric,
  area_sqft           numeric,
  occupancy_pct       numeric,
  avg_temperature_c   numeric,
  pue                 numeric,
  status              text,  -- 'Operational' | 'Maintenance' | 'Critical' | 'Available' | 'Offline'
  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),
  unique (user_id, node_id)
);
alter table public.eai_real_estate_hierarchy enable row level security;
create policy "Users can manage their own eai real estate hierarchy"
  on public.eai_real_estate_hierarchy for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Rack Telemetry — digital-twin sensor readings, one row per rack per day.
-- No single-row unique field (rack_node_id repeats across days), so the
-- unique constraint is composite: rack_node_id + reading_date.
create table public.eai_rack_telemetry (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete cascade not null,
  rack_node_id        text not null,
  reading_date        date not null,
  inlet_temp_c        numeric,
  outlet_temp_c       numeric,
  humidity_pct        numeric,
  power_draw_kw       numeric,
  power_capacity_kw   numeric,
  fan_speed_pct       numeric,
  status              text,  -- 'Operational' | 'Maintenance' | 'Critical'
  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),
  unique (user_id, rack_node_id, reading_date)
);
alter table public.eai_rack_telemetry enable row level security;
create policy "Users can manage their own eai rack telemetry"
  on public.eai_rack_telemetry for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Digital Twin Thermal Tiles — floor-tile heatmap per room (8x4 grid).
-- Composite unique: room_node_id + grid_col + grid_row identify one tile.
create table public.eai_digital_twin_thermal_tiles (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  room_node_id   text not null,
  grid_col       text not null,
  grid_row       numeric not null,
  temp_c         numeric not null,
  zone           text not null,  -- 'Cold Aisle' | 'Hot Aisle' | 'Neutral'
  is_crah        text,  -- 'Yes' | 'No'
  is_hotspot     text,  -- 'Yes' | 'No'
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  unique (user_id, room_node_id, grid_col, grid_row)
);
alter table public.eai_digital_twin_thermal_tiles enable row level security;
create policy "Users can manage their own eai digital twin thermal tiles"
  on public.eai_digital_twin_thermal_tiles for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- IT Assets — individual rack-mounted assets, flagship campuses.
create table public.eai_it_assets (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid references auth.users(id) on delete cascade not null,
  asset_id                text not null,
  asset_name              text not null,
  category                text,  -- 'Server' | 'Storage' | 'Network' | 'Power' | 'Cooling' | 'Security'
  vendor                  text,
  model                   text,
  serial_number           text,
  facility_id             text not null,
  location_path           text,
  rack_node_id            text,
  u_position              text,
  power_kw                numeric,
  status                  text,  -- 'Operational' | 'Maintenance' | 'Repair' | 'EOL' | 'Ready' | 'Retired'
  lifecycle_stage         text,  -- 'Discover/Inventory' | 'Deployment' | 'In Use' | 'Maintenance' | 'Repair' | 'Ready for Deployment' | 'End of Life' | 'Retired'
  install_date            date,
  age_years               numeric,
  warranty_expiry_date    date,
  eol_date                date,
  next_milestone          text,
  next_milestone_date     date,
  risk_score              numeric,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now(),
  unique (user_id, asset_id)
);
alter table public.eai_it_assets enable row level security;
create policy "Users can manage their own eai it assets"
  on public.eai_it_assets for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Purchase Orders.
create table public.eai_purchase_orders (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  po_number      text not null,
  vendor         text,
  category       text,
  order_date     date,
  expected_date  date,
  value_usd      numeric,
  status         text,  -- 'Open' | 'In Transit' | 'At Warehouse' | 'Delivered' | 'Cancelled'
  progress_pct   numeric,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  unique (user_id, po_number)
);
alter table public.eai_purchase_orders enable row level security;
create policy "Users can manage their own eai purchase orders"
  on public.eai_purchase_orders for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- PO Line Items — line-item detail per PO. Composite unique: po_number + line_item.
create table public.eai_po_line_items (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  po_number        text not null,
  line_item        text not null,
  category         text,
  quantity         numeric,
  unit_price_usd   numeric,
  line_total_usd   numeric,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  unique (user_id, po_number, line_item)
);
alter table public.eai_po_line_items enable row level security;
create policy "Users can manage their own eai po line items"
  on public.eai_po_line_items for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Vendors — master + performance scoring.
create table public.eai_vendors (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid references auth.users(id) on delete cascade not null,
  vendor_name             text not null,
  category                text,
  spend_ytd_usd           numeric,
  on_time_delivery_pct    numeric,
  quality_score           numeric,
  contact_email           text,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now(),
  unique (user_id, vendor_name)
);
alter table public.eai_vendors enable row level security;
create policy "Users can manage their own eai vendors"
  on public.eai_vendors for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Shipments — in-transit/delivered shipments to flagship campuses.
create table public.eai_shipments (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete cascade not null,
  shipment_id         text not null,
  po_number           text,
  origin              text,
  destination         text,
  origin_lat          numeric,
  origin_lng          numeric,
  destination_lat     numeric,
  destination_lng     numeric,
  eta                 date,
  status              text,  -- 'In Transit' | 'Delivered' | 'Delayed'
  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),
  unique (user_id, shipment_id)
);
alter table public.eai_shipments enable row level security;
create policy "Users can manage their own eai shipments"
  on public.eai_shipments for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Inventory by Location — warehouse/DC inventory value snapshot.
create table public.eai_inventory_by_location (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete cascade not null,
  location            text not null,
  facility_id         text,
  on_hand_value_usd   numeric,
  on_hand_qty         numeric,
  utilization_pct     numeric,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),
  unique (user_id, location)
);
alter table public.eai_inventory_by_location enable row level security;
create policy "Users can manage their own eai inventory by location"
  on public.eai_inventory_by_location for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- FinOps Cost Line Items — monthly CapEx/OpEx by category, per facility.
create table public.eai_finops_cost_line_items (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  line_item_id   text not null,
  month          date not null,
  category       text not null,  -- 'IT Hardware' | 'Power & Cooling' | 'Facilities' | 'Network' | 'Security' | 'Others'
  facility_id    text not null,
  budget_usd     numeric,
  capex_usd      numeric,
  opex_usd       numeric,
  variance_pct   numeric,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  unique (user_id, line_item_id)
);
alter table public.eai_finops_cost_line_items enable row level security;
create policy "Users can manage their own eai finops cost line items"
  on public.eai_finops_cost_line_items for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ESG Metrics — monthly emissions/energy/water per facility.
create table public.eai_esg_metrics (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid references auth.users(id) on delete cascade not null,
  metric_id                 text not null,
  month                     date not null,
  facility_id               text not null,
  scope                     text,  -- 'Scope 1' | 'Scope 2' | 'Scope 3'
  carbon_emissions_tco2e    numeric,
  energy_consumption_gwh    numeric,
  water_usage_kl            numeric,
  renewable_pct             numeric,
  waste_recycled_pct        numeric,
  created_at                timestamptz default now(),
  updated_at                timestamptz default now(),
  unique (user_id, metric_id)
);
alter table public.eai_esg_metrics enable row level security;
create policy "Users can manage their own eai esg metrics"
  on public.eai_esg_metrics for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Work Orders — maintenance/corrective work tied to IT Assets.
create table public.eai_work_orders (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  wo_id          text not null,
  title          text not null,
  type           text,  -- 'Corrective' | 'Preventive' | 'Standard'
  asset_id       text,
  facility_id    text,
  priority       text,  -- 'Critical' | 'High' | 'Medium' | 'Low'
  status         text,  -- 'In Progress' | 'Planned' | 'On Hold' | 'Completed' | 'Cancelled'
  assigned_to    text,
  due_date       date,
  sla_pct        numeric,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  unique (user_id, wo_id)
);
alter table public.eai_work_orders enable row level security;
create policy "Users can manage their own eai work orders"
  on public.eai_work_orders for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Incidents — operational incidents tied to IT Assets.
create table public.eai_incidents (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  incident_id      text not null,
  title            text not null,
  severity         text,  -- 'Critical' | 'High' | 'Medium' | 'Low' | 'Info'
  facility_id      text,
  asset_id         text,
  status           text,  -- 'Open' | 'Investigating' | 'Resolved'
  detected_date    date,
  resolved_date    date,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  unique (user_id, incident_id)
);
alter table public.eai_incidents enable row level security;
create policy "Users can manage their own eai incidents"
  on public.eai_incidents for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Integrations — connected enterprise systems for Integration Hub.
create table public.eai_integrations (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid references auth.users(id) on delete cascade not null,
  integration_id          text not null,
  name                    text not null,
  category                text,  -- 'IT Systems' | 'Cloud Services' | 'Enterprise Apps' | 'Data Sources' | 'Others'
  status                  text,  -- 'Healthy' | 'Warning' | 'Critical' | 'Inactive'
  success_rate_pct        numeric,
  avg_response_time_ms    numeric,
  last_sync               date,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now(),
  unique (user_id, integration_id)
);
alter table public.eai_integrations enable row level security;
create policy "Users can manage their own eai integrations"
  on public.eai_integrations for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Users — platform users for Administration. NOTE: the sheet's own "User ID"
-- column (db: user_id in eaiMasterSchema.js) is stored here as sheet_user_id
-- to avoid colliding with the owner user_id column every table has; see
-- lib/eaiMasterData.js's column override map.
create table public.eai_users (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  sheet_user_id    text not null,
  name             text not null,
  email            text not null,
  role             text,  -- 'Platform Admin' | 'Asset Manager' | 'Operations Manager' | 'Data Analyst' | 'Viewer'
  organization     text,
  status           text,  -- 'Active' | 'Inactive'
  last_login       date,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  unique (user_id, sheet_user_id)
);
alter table public.eai_users enable row level security;
create policy "Users can manage their own eai users"
  on public.eai_users for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Supply Chain Flow Stages — Ordered -> Confirmed -> In Transit -> At Warehouse -> Delivered pipeline.
create table public.eai_supply_chain_flow_stages (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  stage        text not null,  -- 'Ordered' | 'Confirmed' | 'In Transit' | 'At Warehouse' | 'Delivered'
  count        numeric,
  value_usd    numeric,
  delta_pct    numeric,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique (user_id, stage)
);
alter table public.eai_supply_chain_flow_stages enable row level security;
create policy "Users can manage their own eai supply chain flow stages"
  on public.eai_supply_chain_flow_stages for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Top Cost Drivers — driver-level cost breakdown for FinOps.
create table public.eai_top_cost_drivers (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  driver         text not null,
  category       text,
  facility_id    text,
  impact_usd     numeric,
  trend_pct      numeric,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  unique (user_id, driver)
);
alter table public.eai_top_cost_drivers enable row level security;
create policy "Users can manage their own eai top cost drivers"
  on public.eai_top_cost_drivers for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Unit Economics — monthly cost-per-unit trend for FinOps.
create table public.eai_unit_economics (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete cascade not null,
  month             date not null,
  cost_per_kw       numeric,
  cost_per_rack     numeric,
  cost_per_server   numeric,
  cost_per_tb       numeric,
  pue_avg           numeric,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now(),
  unique (user_id, month)
);
alter table public.eai_unit_economics enable row level security;
create policy "Users can manage their own eai unit economics"
  on public.eai_unit_economics for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ESG Scorecard — Overall/Environmental/Social/Governance scores, portfolio + per facility.
create table public.eai_esg_scorecard (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references auth.users(id) on delete cascade not null,
  scope                 text not null,
  overall_score         numeric,
  environmental_score   numeric,
  social_score          numeric,
  governance_score      numeric,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),
  unique (user_id, scope)
);
alter table public.eai_esg_scorecard enable row level security;
create policy "Users can manage their own eai esg scorecard"
  on public.eai_esg_scorecard for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ESG Initiatives & Compliance — sustainability initiatives and regulatory compliance status.
create table public.eai_esg_initiatives_compliance (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  name         text not null,
  type         text,  -- 'Initiative' | 'Compliance'
  status       text,  -- 'On Track' | 'Completed' | 'In Progress' | 'Submitted' | 'Certified'
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique (user_id, name)
);
alter table public.eai_esg_initiatives_compliance enable row level security;
create policy "Users can manage their own eai esg initiatives compliance"
  on public.eai_esg_initiatives_compliance for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Data Flows — Integration Hub data pipelines between connected systems.
create table public.eai_data_flows (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  flow_name      text not null,
  source         text not null,
  destination    text not null,
  status         text,  -- 'Success' | 'Warning' | 'Failed'
  last_run       text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  unique (user_id, flow_name)
);
alter table public.eai_data_flows enable row level security;
create policy "Users can manage their own eai data flows"
  on public.eai_data_flows for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- API Health — internal API endpoint health for Integration Hub.
create table public.eai_api_health (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid references auth.users(id) on delete cascade not null,
  api_name                text not null,
  status                  text,  -- 'Healthy' | 'Degraded'
  availability_pct        numeric,
  avg_response_time_ms    numeric,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now(),
  unique (user_id, api_name)
);
alter table public.eai_api_health enable row level security;
create policy "Users can manage their own eai api health"
  on public.eai_api_health for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Integration Uptime — per-service uptime % (last 30 days).
create table public.eai_integration_uptime (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  service        text not null,
  uptime_pct     numeric,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  unique (user_id, service)
);
alter table public.eai_integration_uptime enable row level security;
create policy "Users can manage their own eai integration uptime"
  on public.eai_integration_uptime for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Integration Map Nodes — hub-and-spoke node counts for the Integration Map diagram.
create table public.eai_integration_map_nodes (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  node_name        text not null,
  count            numeric,
  health_status    text,  -- 'Healthy' | 'Warning' | 'Critical'
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  unique (user_id, node_name)
);
alter table public.eai_integration_map_nodes enable row level security;
create policy "Users can manage their own eai integration map nodes"
  on public.eai_integration_map_nodes for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Error Analysis — Integration Hub error summary + category breakdown.
-- Composite unique: module + type + label (a module has one Summary row set
-- and multiple Category rows, disambiguated by label).
create table public.eai_error_analysis (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  module         text not null,
  type           text not null,  -- 'Summary' | 'Category'
  label          text not null,
  value          numeric,
  percent        numeric,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  unique (user_id, module, type, label)
);
alter table public.eai_error_analysis enable row level security;
create policy "Users can manage their own eai error analysis"
  on public.eai_error_analysis for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Trend Series — unified long-format time series for every trend chart
-- across all EAI pages. Composite unique: module + metric + date + series.
create table public.eai_trend_series (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  module       text not null,
  metric       text not null,
  date         date not null,
  series       text not null,
  value        numeric,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique (user_id, module, metric, date, series)
);
alter table public.eai_trend_series enable row level security;
create policy "Users can manage their own eai trend series"
  on public.eai_trend_series for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Alerts & Activity Feed — unified feed covering Critical Alerts, Recent
-- News, Active Alerts, Integration Activity, and Admin Recent Activity.
-- Composite unique: module + title + timestamp.
create table public.eai_alerts_activity_feed (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  module         text not null,
  type           text not null,  -- 'Alert' | 'Activity' | 'News'
  severity       text,  -- 'Critical' | 'High' | 'Medium' | 'Low' | 'Info'
  title          text not null,
  subtitle       text,
  timestamp      text not null,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  unique (user_id, module, title, timestamp)
);
alter table public.eai_alerts_activity_feed enable row level security;
create policy "Users can manage their own eai alerts activity feed"
  on public.eai_alerts_activity_feed for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- AI Insights & Recommendations — unified insights feed covering
-- Intelligence Center, FinOps, ESG, and Reports insight panels.
-- Composite unique: module + title.
create table public.eai_ai_insights_recommendations (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references auth.users(id) on delete cascade not null,
  module             text not null,
  category           text,
  severity           text,
  title              text not null,
  description        text,
  impact             text,
  affected_assets    text,
  date               date,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now(),
  unique (user_id, module, title)
);
alter table public.eai_ai_insights_recommendations enable row level security;
create policy "Users can manage their own eai ai insights recommendations"
  on public.eai_ai_insights_recommendations for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Cost Optimization Opportunities — Intelligence Center cost-saving recommendations.
create table public.eai_cost_optimization_opportunities (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid references auth.users(id) on delete cascade not null,
  opportunity              text not null,
  potential_savings_usd    numeric,
  created_at               timestamptz default now(),
  updated_at               timestamptz default now(),
  unique (user_id, opportunity)
);
alter table public.eai_cost_optimization_opportunities enable row level security;
create policy "Users can manage their own eai cost optimization opportunities"
  on public.eai_cost_optimization_opportunities for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Risk Heatmap — 5x5 likelihood x impact matrix. Composite unique: likelihood + impact.
create table public.eai_risk_heatmap (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  likelihood     text not null,  -- 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High'
  impact         text not null,  -- 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High'
  count          numeric,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  unique (user_id, likelihood, impact)
);
alter table public.eai_risk_heatmap enable row level security;
create policy "Users can manage their own eai risk heatmap"
  on public.eai_risk_heatmap for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Predictive Failures — ML-style predicted equipment failures.
-- Composite unique: asset + facility_id (same asset name can recur across facilities).
create table public.eai_predictive_failures (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid references auth.users(id) on delete cascade not null,
  asset                       text not null,
  type                        text,
  facility_id                 text not null,
  failure_probability_pct     numeric,
  est_impact                  text,  -- 'Low' | 'Medium' | 'High'
  created_at                  timestamptz default now(),
  updated_at                  timestamptz default now(),
  unique (user_id, asset, facility_id)
);
alter table public.eai_predictive_failures enable row level security;
create policy "Users can manage their own eai predictive failures"
  on public.eai_predictive_failures for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Anomalies — anomaly detection counts by category, last 7 days.
-- Composite unique: category + facility_id.
create table public.eai_anomalies (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  category       text not null,  -- 'Power Anomalies' | 'Temperature Anomalies' | 'Network Anomalies' | 'Configuration Drifts'
  facility_id    text not null,
  count_7d       numeric,
  delta          numeric,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  unique (user_id, category, facility_id)
);
alter table public.eai_anomalies enable row level security;
create policy "Users can manage their own eai anomalies"
  on public.eai_anomalies for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Recent Reports — generated report metadata. Composite unique: report_name + generated_on.
create table public.eai_recent_reports (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  report_name      text not null,
  category         text,
  generated_on     text not null,
  generated_by     text,
  format           text,  -- 'PDF' | 'Excel'
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  unique (user_id, report_name, generated_on)
);
alter table public.eai_recent_reports enable row level security;
create policy "Users can manage their own eai recent reports"
  on public.eai_recent_reports for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Scheduled Reports — recurring report schedules.
create table public.eai_scheduled_reports (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  name         text not null,
  schedule     text,
  enabled      text,  -- 'Yes' | 'No'
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique (user_id, name)
);
alter table public.eai_scheduled_reports enable row level security;
create policy "Users can manage their own eai scheduled reports"
  on public.eai_scheduled_reports for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- System Health Services — internal platform service health for Administration.
create table public.eai_system_health_services (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  service      text not null,
  status       text,  -- 'Healthy' | 'Warning' | 'Critical'
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique (user_id, service)
);
alter table public.eai_system_health_services enable row level security;
create policy "Users can manage their own eai system health services"
  on public.eai_system_health_services for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- System Resource Usage — platform infrastructure resource utilization.
create table public.eai_system_resource_usage (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  resource       text not null,  -- 'CPU Usage' | 'Memory Usage' | 'Storage Usage' | 'Network I/O'
  usage_pct      numeric,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  unique (user_id, resource)
);
alter table public.eai_system_resource_usage enable row level security;
create policy "Users can manage their own eai system resource usage"
  on public.eai_system_resource_usage for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Security Overview — security posture metrics for Administration.
create table public.eai_security_overview (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  metric       text not null,
  value        numeric,
  delta        numeric,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique (user_id, metric)
);
alter table public.eai_security_overview enable row level security;
create policy "Users can manage their own eai security overview"
  on public.eai_security_overview for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Audit Logs — platform audit trail. NOTE: the sheet's "User" column (db:
-- user in eaiMasterSchema.js) is stored here as performed_by because USER is
-- a reserved word in Postgres; see lib/eaiMasterData.js's column override map.
-- Composite unique: time + performed_by + action (this is an append-style log
-- without a dedicated ID field in the source schema, so this is a best-effort
-- de-dupe key, not a guaranteed-unique one).
create table public.eai_audit_logs (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  time           text not null,
  performed_by   text not null,
  action         text not null,
  resource       text,
  ip_address     text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  unique (user_id, time, performed_by, action)
);
alter table public.eai_audit_logs enable row level security;
create policy "Users can manage their own eai audit logs"
  on public.eai_audit_logs for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Storage Overview — platform storage breakdown by category.
create table public.eai_storage_overview (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  category     text not null,  -- 'Documents' | 'Reports' | 'Logs' | 'Backups' | 'Others'
  used_tb      numeric,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique (user_id, category)
);
alter table public.eai_storage_overview enable row level security;
create policy "Users can manage their own eai storage overview"
  on public.eai_storage_overview for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Support Tickets — open support ticket counts by severity.
create table public.eai_support_tickets (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  severity     text not null,  -- 'Critical' | 'High' | 'Medium' | 'Low'
  count        numeric,
  delta        numeric,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique (user_id, severity)
);
alter table public.eai_support_tickets enable row level security;
create policy "Users can manage their own eai support tickets"
  on public.eai_support_tickets for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Licenses & Usage — software license allocation.
create table public.eai_licenses_usage (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  metric       text not null,
  value        text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique (user_id, metric)
);
alter table public.eai_licenses_usage enable row level security;
create policy "Users can manage their own eai licenses usage"
  on public.eai_licenses_usage for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
 