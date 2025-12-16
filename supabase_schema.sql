-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Teams
create table teams (
  id bigint primary key, -- usage of API-Football ID
  name text not null,
  logo text,
  founded int,
  venue_name text,
  venue_city text
);

-- Players
create table players (
  id bigint primary key, -- API-Football ID
  team_id bigint references teams(id),
  name text not null,
  firstname text,
  lastname text,
  age int,
  nationality text,
  height text,
  weight text,
  photo text,
  position text, -- 'Attacker', 'Midfielder', etc.
  injured boolean default false
);

-- Fixtures (Matches)
create table fixtures (
  id bigint primary key, -- API-Football ID
  date timestamp with time zone not null,
  status text not null, -- 'NS', 'LIVE', 'FT'
  home_team_id bigint references teams(id),
  away_team_id bigint references teams(id),
  home_goals int,
  away_goals int,
  venue_name text,
  referee text
);

-- Odds
create table odds (
  id uuid default uuid_generate_v4() primary key,
  fixture_id bigint references fixtures(id),
  bookmaker_id int,
  bookmaker_name text,
  market_id int,
  market_name text, -- 'Match Winner', 'Goals Over/Under'
  value text, -- 'Home', 'Away', 'Over 2.5'
  odd numeric,
  updated_at timestamp with time zone default now()
);

-- Player Stats (Per Match)
create table player_stats (
  id uuid default uuid_generate_v4() primary key,
  player_id bigint references players(id),
  fixture_id bigint references fixtures(id),
  team_id bigint references teams(id),
  minutes int,
  rating numeric,
  goals int,
  assists int,
  shots_total int,
  shots_on int,
  passes_total int,
  params_key numeric -- generic score for rapid access
);

-- Injuries / Anomalies (For Edge Detection)
create table injuries (
  id uuid default uuid_generate_v4() primary key,
  player_id bigint references players(id),
  team_id bigint references teams(id),
  fixture_id bigint references fixtures(id), -- If specific to a game
  reason text,
  type text, -- 'Missing', 'Questionable'
  fixture_date timestamp with time zone
);

-- RLS Policies (Open for read, Service Role for write)
alter table teams enable row level security;
alter table players enable row level security;
alter table fixtures enable row level security;
alter table odds enable row level security;
alter table player_stats enable row level security;
alter table injuries enable row level security;

create policy "Public read access" on teams for select using (true);
create policy "Public read access" on players for select using (true);
create policy "Public read access" on fixtures for select using (true);
create policy "Public read access" on odds for select using (true);
create policy "Public read access" on player_stats for select using (true);
create policy "Public read access" on injuries for select using (true);
