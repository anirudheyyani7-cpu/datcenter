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
