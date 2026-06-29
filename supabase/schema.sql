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
