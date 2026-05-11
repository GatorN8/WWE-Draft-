create extension if not exists pgcrypto;

create table if not exists leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  mode text default 'solo',
  commissioner_key text,
  join_code text unique not null,
  starting_bank bigint default 90000000,
  draft_status text default 'not_started',
  season text default 'Royal Rumble Season',
  created_at timestamptz default now()
);

create table if not exists league_members (
  id uuid primary key default gen_random_uuid(),
  league_id uuid references leagues(id) on delete cascade,
  player_key text not null,
  display_name text,
  cash bigint default 90000000,
  score bigint default 0,
  tko_shares numeric default 0,
  trades_remaining int default 4,
  waivers_remaining int default 1,
  created_at timestamptz default now(),
  unique(league_id,player_key)
);

create table if not exists talent (
  id text primary key,
  name text not null,
  rating int not null,
  brand text,
  role text default 'Wrestler',
  tier text,
  salary bigint,
  is_champion boolean default false,
  title text,
  active boolean default true,
  updated_at timestamptz default now()
);

create table if not exists rosters (
  id uuid primary key default gen_random_uuid(),
  league_id uuid references leagues(id) on delete cascade,
  player_key text not null,
  talent_id text references talent(id),
  assigned_brand text not null,
  salary bigint not null,
  created_at timestamptz default now(),
  unique(league_id,talent_id)
);

create table if not exists draft_picks (
  id uuid primary key default gen_random_uuid(),
  league_id uuid references leagues(id) on delete cascade,
  player_key text not null,
  talent_id text references talent(id),
  assigned_brand text,
  salary bigint,
  created_at timestamptz default now()
);

create table if not exists weekly_setups (
  id uuid primary key default gen_random_uuid(),
  league_id uuid references leagues(id) on delete cascade,
  player_key text not null,
  brand text not null,
  show_key text not null,
  setup_deadline text,
  production_budget bigint default 0,
  focus text,
  status text default 'setup',
  gross_income bigint default 0,
  net_income bigint default 0,
  tko_bonus numeric default 0,
  created_at timestamptz default now(),
  unique(league_id,player_key,brand,show_key)
);

create table if not exists ledger (
  id uuid primary key default gen_random_uuid(),
  league_id uuid references leagues(id) on delete cascade,
  player_key text not null,
  type text not null,
  amount bigint default 0,
  note text,
  created_at timestamptz default now()
);

create table if not exists result_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  source_type text,
  priority text,
  created_at timestamptz default now()
);

alter table leagues disable row level security;
alter table league_members disable row level security;
alter table talent disable row level security;
alter table rosters disable row level security;
alter table draft_picks disable row level security;
alter table weekly_setups disable row level security;
alter table ledger disable row level security;
alter table result_sources disable row level security;


create table if not exists show_expectations (
  id uuid primary key default gen_random_uuid(),
  league_id uuid references leagues(id) on delete cascade,
  player_key text not null,
  brand text not null,
  show_key text not null,
  roster_id uuid references rosters(id) on delete cascade,
  expected_role text default 'Appearance',
  confidence int default 50,
  created_at timestamptz default now(),
  unique(league_id,player_key,brand,show_key,roster_id)
);

alter table show_expectations disable row level security;
